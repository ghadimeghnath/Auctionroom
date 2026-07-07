require('dotenv').config(); // ◄ Load environment variables at the very top
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

// ── Tournament constants ────────────────────────────────────────────────────
const TEAM_NAMES     = ['United Boys', 'Shield United', 'Prime 11', 'Phoenix FC', 'Crown United', 'Black Stone FC', 'Bambolino FC', 'Arsenal'];
const START_PURSE    = 12000;   
const TOTAL_SLOTS    = 16;      
const MAX_GROUP_A    = 2;       
const GROUP_A_BASE   = 500;     
const GROUP_B_BASE   = 300;     
const BID_INCREMENT  = 300;     

function loadInitialPlayers() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, 'players.json'), 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Warning: Could not load players.json", err);
    return [];
  }
}

function freshTeams() {
  return TEAM_NAMES.map((name) => ({
    name,
    purse: START_PURSE,
    players: [],
  }));
}

function freshLot() {
  return {
    currentPlayerId: '',
    playerName:   '',
    playerGroup:  'B',
    basePrice:    GROUP_B_BASE,
    currentBid:   GROUP_B_BASE,
    soldTo:       '',
  };
}

let state = {
  teams: freshTeams(),
  players: loadInitialPlayers(),
  lastAction: null, 
  ...freshLot(),
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function remainingSlots(team) { return TOTAL_SLOTS - team.players.length; }
function groupACount(team) { return team.players.filter((p) => p.group === 'A').length; }
function maxAllowedBid(team) { return team.purse - remainingSlots(team) * GROUP_B_BASE; }

function canBid(team, amount, playerGroup) {
  const slots = remainingSlots(team);
  if (slots <= 0) return { ok: false, reason: 'full' };
  if (playerGroup === 'A' && groupACount(team) >= MAX_GROUP_A) {
    return { ok: false, reason: 'group-a-full' };
  }
  const minBase = playerGroup === 'A' ? GROUP_A_BASE : GROUP_B_BASE;
  if (amount < minBase) return { ok: false, reason: 'below-min' };
  if (amount > maxAllowedBid(team)) return { ok: false, reason: 'over-max' };
  return { ok: true };
}

// ── Express / Socket.IO ──────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.get('/health', (_req, res) => res.json({ ok: true, teams: state.teams.length }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

function broadcast() { io.emit('state', state); }

io.on('connection', (socket) => {
  socket.emit('state', state);

  // NEW: Authentication handler for the Gate console
  socket.on('authenticate', (password, callback) => {
    const correctPassword = process.env.AUCTIONEER_PASSWORD;
    if (!correctPassword) {
      return callback({ ok: false, error: 'Server password not configured.' });
    }
    if (password === correctPassword) {
      callback({ ok: true });
    } else {
      callback({ ok: false });
    }
  });

  socket.on('selectPlayerFromList', (playerId) => {
    const player = state.players.find(p => p.id === playerId);
    if (player && (player.status === 'available' || player.status === 'unsold')) {
      state.currentPlayerId = player.id;
      state.playerName = player.name;
      state.playerGroup = player.group;
      const base = player.group === 'A' ? GROUP_A_BASE : GROUP_B_BASE;
      state.basePrice = base;
      state.currentBid = base;
    } else {
      
      Object.assign(state, freshLot());
    }
    broadcast();
  });

  socket.on('setBasePrice', (value) => {
    const base = parseInt(value, 10);
    const minBase = state.playerGroup === 'A' ? GROUP_A_BASE : GROUP_B_BASE;
    state.basePrice  = Number.isFinite(base) ? Math.max(base, minBase) : minBase;
    state.currentBid = state.basePrice;
    broadcast();
  });

  socket.on('setCurrentBid', (value) => {
    const bid = parseInt(value, 10);
    state.currentBid = Number.isFinite(bid) ? bid : 0;
    broadcast();
  });

  socket.on('raiseBid', (amount) => {
    const inc = parseInt(amount, 10) || 0;
    state.currentBid = (state.currentBid || 0) + inc;
    broadcast();
  });

  socket.on('setSoldTo', (teamName) => {
    state.soldTo = TEAM_NAMES.includes(teamName) ? teamName : '';
    broadcast();
  });

socket.on("markSold", () => {
  const name = (state.playerName || "").trim();
  const bid = state.currentBid || 0;
  const group = state.playerGroup || "B";
  const team = state.teams.find((t) => t.name === state.soldTo);

  if (!name || !team || !state.currentPlayerId) return;

  const check = canBid(team, bid, group);
  if (!check.ok) return;

  state.lastAction = {
    type: "SOLD",
    playerId: state.currentPlayerId,
    teamName: team.name,
    price: bid,
  };

  team.players.push({
    id: state.currentPlayerId,
    name,
    price: bid,
    group,
  });

  team.purse -= bid;

  const player = state.players.find(
    (p) => p.id === state.currentPlayerId
  );

  if (player) player.status = "sold";

  const soldPlayer = {
    id: player.id,
    name: player.name,
    group: player.group,
    team: team.name,
    price: bid,
  };

  Object.assign(state, freshLot());

  broadcast();

  io.emit("playerSold", soldPlayer);
});

  socket.on('skipPlayer', () => {
    if (!state.currentPlayerId) return;
    
    state.lastAction = { type: 'UNSOLD', playerId: state.currentPlayerId };

    const player = state.players.find(p => p.id === state.currentPlayerId);
    if (player) player.status = 'unsold';

    Object.assign(state, freshLot());
    broadcast();
  });

  socket.on('undoLastAction', () => {
    if (!state.lastAction) return;

    const { type, playerId, teamName, price } = state.lastAction;
    const player = state.players.find(p => p.id === playerId);

    if (type === 'SOLD') {
      const team = state.teams.find(t => t.name === teamName);
      if (team) {
        team.purse += price;
        team.players = team.players.filter(p => p.id !== playerId);
      }
    }

    if (player) {
      player.status = 'available'; 
      
      state.currentPlayerId = player.id;
      state.playerName = player.name;
      state.playerGroup = player.group;
      const base = player.group === 'A' ? GROUP_A_BASE : GROUP_B_BASE;
      state.basePrice = base;
      state.currentBid = base;
      state.soldTo = '';
    }

    state.lastAction = null; 
    broadcast();
  });

  socket.on('resetAuction', () => {
    state.teams = freshTeams();
    state.players = loadInitialPlayers();
    state.lastAction = null;
    Object.assign(state, freshLot());
    broadcast();
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Auction server listening on http://localhost:${PORT}`);
});