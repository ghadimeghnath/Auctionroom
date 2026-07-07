import { useState } from 'react';
import { Link } from 'react-router-dom';
import { socket } from '../socket.js';
import { celebrate } from "../utils/celebrate";
import { useAuctionState } from '../hooks/useAuctionState.js';
import { useAuctioneerAuth } from '../hooks/useAuctioneerAuth.js'; // ◄ Import Auth Hook
import AuctioneerGate from '../components/AuctioneerGate.jsx';       // ◄ Import Gate Component
import {
  GROUP_A_BASE,
  GROUP_B_BASE,
  BID_INCREMENT,
  MAX_GROUP_A,
  canBid,
  groupACount,
} from '../constants.js';
import Scoreboard from '../components/Scoreboard.jsx';
import TeamGrid from '../components/TeamGrid.jsx';

export default function AuctioneerConsole() {
  const { state, connected } = useAuctionState();
  const { status, error, tryAuth } = useAuctioneerAuth(connected); // ◄ Instantiate auth hook
  const [searchTerm, setSearchTerm] = useState('');

  // Security Interception: If not authenticated, render the login gate instead
  if (status !== 'authed') {
    return (
      <AuctioneerGate
        connected={connected}
        status={status}
        error={error}
        onSubmit={tryAuth}
      />
    );
  }

  // If we are authenticated but socket data hasn't arrived yet
  if (!state) {
    return (
      <div className="page-loading">
        <p>{connected ? 'Waiting for auction data…' : 'Connecting to auction server…'}</p>
      </div>
    );
  }

  const playerGroup = state.playerGroup || 'B';
  const active = state.playerName.trim().length > 0;
  const selectedTeam = state.teams.find((t) => t.name === state.soldTo);
  const eligibleCheck = selectedTeam ? canBid(selectedTeam, state.currentBid, playerGroup) : { ok: false };
  const anyEligible = state.teams.some((t) => canBid(t, state.currentBid, playerGroup).ok);
  const soldDisabled = !active || !state.soldTo || !eligibleCheck.ok;

  const masterList = state.players || [];
  const searchLower = searchTerm.toLowerCase();
  const filteredList = masterList.filter(p => p.name.toLowerCase().includes(searchLower));

  const availableA = filteredList.filter(p => p.group === 'A' && (p.status === 'available' || p.status === 'unsold'));
  const availableB = filteredList.filter(p => p.group === 'B' && (p.status === 'available' || p.status === 'unsold'));
  const finalizedSold = masterList.filter(p => p.status === 'sold' && p.name.toLowerCase().includes(searchLower));

  function teamOptionLabel(t) {
    const c = canBid(t, state.currentBid, playerGroup);
    if (c.ok) return `Team ${t.name}`;
    if (c.reason === 'full') return `Team ${t.name}  (squad full)`;
    if (c.reason === 'group-a-full') return `Team ${t.name}  (Group A limit reached)`;
    return `Team ${t.name}  (cannot afford)`;
  }

  const dropdownStyle = { padding: '10px', fontSize: '15px', borderRadius: '4px', backgroundColor: '#1a2333', color: '#fff', width: '100%', marginBottom: '15px' };

  return (
    <div>
      <Scoreboard
        playerName={state.playerName}
        playerGroup={playerGroup}
        currentBid={state.currentBid}
        active={active}
      />

      <div className="wrap">
        <div className="card">
          <h2>Auctioneer Console</h2>

          {/* Player Search Bar */}
          <div className="field">
            <label htmlFor="searchPlayer">Search Players</label>
            <input
              id="searchPlayer"
              type="text"
              placeholder="Type a name to filter lists below..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Group A Dropdown */}
          <div className="field">
            <label htmlFor="playerSelectA">Select Group A (College) Player</label>
            <select
              id="playerSelectA"
              value={playerGroup === 'A' ? (state.currentPlayerId || "") : ""}
              onChange={(e) => socket.emit('selectPlayerFromList', e.target.value)}
              style={dropdownStyle}
            >
              <option value="">-- Choose from Group A --</option>
              {availableA.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.status === 'unsold' ? ' [UNSOLD]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Group B Dropdown */}
          <div className="field">
            <label htmlFor="playerSelectB">Select Group B (Open) Player</label>
            <select
              id="playerSelectB"
              value={playerGroup === 'B' ? (state.currentPlayerId || "") : ""}
              onChange={(e) => socket.emit('selectPlayerFromList', e.target.value)}
              style={dropdownStyle}
            >
              <option value="">-- Choose from Group B --</option>
              {availableB.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.status === 'unsold' ? ' [UNSOLD]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Read-only Sold Players Reference */}
          {finalizedSold.length > 0 && (
            <div className="field">
              <label>Finalized / Sold Players (Reference)</label>
              <select disabled style={{ ...dropdownStyle, opacity: 0.6 }}>
                <option>View Sold Players...</option>
                {finalizedSold.map(p => (
                  <option key={p.id}>✓ {p.name} (Sold - Group {p.group})</option>
                ))}
              </select>
            </div>
          )}

          {/* Base price + Current bid fields */}
          <div className="row2">
            <div className="field">
              <label htmlFor="basePrice">Base price</label>
              <input
                type="number"
                id="basePrice"
                min={playerGroup === 'A' ? GROUP_A_BASE : GROUP_B_BASE}
                step={BID_INCREMENT}
                value={state.basePrice}
                onChange={(e) => socket.emit('setBasePrice', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="currentBid">Current bid</label>
              <input
                type="number"
                id="currentBid"
                min={0}
                step={BID_INCREMENT}
                value={state.currentBid}
                onChange={(e) => socket.emit('setCurrentBid', e.target.value)}
              />
            </div>
          </div>

          {/* Bid increment chips */}
          <div className="bid-controls">
            {[300, 600, 900, 1200].map((amt) => (
              <button
                key={amt}
                id={`raise-${amt}`}
                className="chip-btn"
                onClick={() => socket.emit('raiseBid', amt)}
              >
                +{amt}
              </button>
            ))}
          </div>

          {/* Sell to Team selection dropdown */}
          <div className="field">
            <label htmlFor="soldTo">Sell to</label>
            <select
              id="soldTo"
              value={state.soldTo}
              onChange={(e) => socket.emit('setSoldTo', e.target.value)}
            >
              <option value="">Select eligible team…</option>
              {state.teams.map((t) => {
                const c = canBid(t, state.currentBid, playerGroup);
                const aUsed = groupACount(t);
                return (
                  <option key={t.name} value={t.name} disabled={!c.ok}>
                    {teamOptionLabel(t)}
                    {playerGroup === 'A' ? `  [${aUsed}/${MAX_GROUP_A} Group A]` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="hint">
            {anyEligible
              ? 'Teams shown in green below can legally place this bid.'
              : 'No team can currently afford this bid — lower it or check Group A limits.'}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button
              className="btn btn-sold"
              id="mark-sold-btn"
              disabled={soldDisabled}
              onClick={() => {
                celebrate();
                socket.emit("markSold");
              }}
              style={{ flex: 1 }}
            >
              Mark sold
            </button>

            <button
              className="btn btn-skip"
              id="skip-btn"
              disabled={!active}
              onClick={() => socket.emit('skipPlayer')}
              style={{ flex: 1 }}
            >
              Unsold / skip
            </button>
          </div>

          {/* UNDO BUTTON */}
          <button
            className="btn"
            id="undo-btn"
            disabled={!state.lastAction}
            onClick={() => {
              if (window.confirm('Are you sure you want to undo the last Sold/Unsold action?')) {
                socket.emit('undoLastAction');
              }
            }}
            style={{
              width: '100%',
              marginTop: '10px',
              backgroundColor: state.lastAction ? '#e8483d' : '#333',
              color: state.lastAction ? 'white' : '#666',
              cursor: state.lastAction ? 'pointer' : 'not-allowed'
            }}
          >
            {state.lastAction ? `Undo Last Action (${state.lastAction.type})` : 'Undo Last Action (Nothing to undo)'}
          </button>

          <button
            className="btn btn-reset"
            id="reset-btn"
            onClick={() => {
              if (window.confirm('Reset all teams, purses, and restore all players back to available pool?')) {
                socket.emit('resetAuction');
              }
            }}
            style={{ marginTop: '10px' }}
          >
            Reset entire auction
          </button>
        </div>

        <TeamGrid
          teams={state.teams}
          active={active}
          currentBid={state.currentBid}
          playerGroup={playerGroup}
        />
      </div>

      <p className="footer-note">
        Rules · Budget: 12,000 pts/team · 16 players/squad · Group A (College): base 500 pts, max 2 per team ·
        Group B (Open): base 300 pts · Bid increment: 300 pts
      </p>

      <div className="role-switch">
        <Link to="/">← Switch role</Link>
        <span className={`conn-dot ${connected ? 'on' : 'off'}`} title={connected ? 'Connected' : 'Disconnected'} />
      </div>
    </div>
  );
}