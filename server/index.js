require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const MIN_PRICE = 300;
const TOTAL_SLOTS = 11;
const START_PURSE = 10000;
const TEAM_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

function freshTeams() {
  return TEAM_NAMES.map((name) => ({ name, purse: START_PURSE, players: [] }));
}

function freshLot() {
  return { playerName: '', basePrice: MIN_PRICE, currentBid: MIN_PRICE, soldTo: '' };
}

let state = {
  teams: freshTeams(),
  ...freshLot(),
};

function remainingSlots(team) {
  return TOTAL_SLOTS - team.players.length;
}

function maxAllowedBid(team) {
  return team.purse - remainingSlots(team) * MIN_PRICE;
}

function canBid(team, amount) {
  const slots = remainingSlots(team);
  if (slots <= 0) return { ok: false, reason: 'full' };
  if (amount < MIN_PRICE) return { ok: false, reason: 'below-min' };
  if (amount > maxAllowedBid(team)) return { ok: false, reason: 'over-max' };
  return { ok: true };
}

// In production, set ALLOWED_ORIGIN to your Netlify URL, e.g.
//   ALLOWED_ORIGIN=https://your-auction-room.netlify.app
// Comma-separate multiple origins if needed. Falls back to "*" for local dev.
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(',').map((s) => s.trim())
  : '*';

const app = express();
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.get('/health', (_req, res) => res.json({ ok: true, teams: state.teams.length }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: ALLOWED_ORIGIN } });

// Set this in your environment (locally in server/.env, or as an env var
// on Render). Anyone who knows this password can act as the auctioneer;
// the Team View never needs it. If it's unset, no one can authenticate —
// the console stays locked, which is the safe default.
const AUCTIONEER_PASSWORD = process.env.AUCTIONEER_PASSWORD || '';

function broadcast() {
  io.emit('state', state);
}

// Wraps a handler so it's a no-op unless this socket has successfully
// authenticated as the auctioneer. Not bulletproof security — it's a
// single shared password over a socket, not real user auth — but it
// stops randoms who load the console URL from touching the auction.
function auctioneerOnly(socket, handler) {
  return (...args) => {
    if (!socket.data.isAuctioneer) return;
    handler(...args);
  };
}

io.on('connection', (socket) => {
  socket.data.isAuctioneer = false;

  // Send current state immediately to any newly connected screen
  socket.emit('state', state);

  socket.on('authenticate', (password, callback) => {
    const ok = Boolean(AUCTIONEER_PASSWORD) && password === AUCTIONEER_PASSWORD;
    socket.data.isAuctioneer = ok;
    if (typeof callback === 'function') callback({ ok });
  });

  socket.on(
    'setPlayerName',
    auctioneerOnly(socket, (name) => {
      state.playerName = String(name ?? '').slice(0, 60);
      broadcast();
    })
  );

  socket.on(
    'setBasePrice',
    auctioneerOnly(socket, (value) => {
      const base = parseInt(value, 10);
      state.basePrice = Number.isFinite(base) ? base : MIN_PRICE;
      state.currentBid = state.basePrice;
      broadcast();
    })
  );

  socket.on(
    'setCurrentBid',
    auctioneerOnly(socket, (value) => {
      const bid = parseInt(value, 10);
      state.currentBid = Number.isFinite(bid) ? bid : 0;
      broadcast();
    })
  );

  socket.on(
    'raiseBid',
    auctioneerOnly(socket, (amount) => {
      const inc = parseInt(amount, 10) || 0;
      state.currentBid = (state.currentBid || 0) + inc;
      broadcast();
    })
  );

  socket.on(
    'setSoldTo',
    auctioneerOnly(socket, (teamName) => {
      state.soldTo = TEAM_NAMES.includes(teamName) ? teamName : '';
      broadcast();
    })
  );

  socket.on(
    'markSold',
    auctioneerOnly(socket, () => {
      const name = (state.playerName || '').trim();
      const bid = state.currentBid || 0;
      const team = state.teams.find((t) => t.name === state.soldTo);
      if (!name || !team) return;
      const check = canBid(team, bid);
      if (!check.ok) return;

      team.players.push({ name, price: bid });
      team.purse -= bid;
      Object.assign(state, freshLot());
      broadcast();
    })
  );

  socket.on(
    'skipPlayer',
    auctioneerOnly(socket, () => {
      Object.assign(state, freshLot());
      broadcast();
    })
  );

  socket.on(
    'resetAuction',
    auctioneerOnly(socket, () => {
      state.teams = freshTeams();
      Object.assign(state, freshLot());
      broadcast();
    })
  );
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Auction Room server listening on http://localhost:${PORT}`);
});
