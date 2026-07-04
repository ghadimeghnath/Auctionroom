import { Link } from 'react-router-dom';
import { socket } from '../socket.js';
import { useAuctionState } from '../hooks/useAuctionState.js';
import { MIN_PRICE, canBid } from '../constants.js';
import Scoreboard from '../components/Scoreboard.jsx';
import TeamGrid from '../components/TeamGrid.jsx';

export default function AuctioneerConsole() {
  const { state, connected } = useAuctionState();

  if (!state) {
    return (
      <div className="page-loading">
        <p>{connected ? 'Waiting for auction data…' : 'Connecting to auction server…'}</p>
      </div>
    );
  }

  const active = state.playerName.trim().length > 0;
  const selectedTeam = state.teams.find((t) => t.name === state.soldTo);
  const eligibleCheck = selectedTeam ? canBid(selectedTeam, state.currentBid) : { ok: false };
  const anyEligible = state.teams.some((t) => canBid(t, state.currentBid).ok);
  const soldDisabled = !active || !state.soldTo || !eligibleCheck.ok;

  return (
    <div>
      <Scoreboard playerName={state.playerName} currentBid={state.currentBid} active={active} />

      <div className="wrap">
        <div className="card">
          <h2>Auctioneer console</h2>

          <div className="field">
            <label htmlFor="playerName">Player name</label>
            <input
              type="text"
              id="playerName"
              placeholder="e.g. R. Fernandes"
              value={state.playerName}
              onChange={(e) => socket.emit('setPlayerName', e.target.value)}
            />
          </div>

          <div className="row2">
            <div className="field">
              <label htmlFor="basePrice">Base price</label>
              <input
                type="number"
                id="basePrice"
                min={MIN_PRICE}
                step={50}
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
                step={50}
                value={state.currentBid}
                onChange={(e) => socket.emit('setCurrentBid', e.target.value)}
              />
            </div>
          </div>

          <div className="bid-controls">
            {[100, 300, 500, 1000].map((amt) => (
              <button key={amt} className="chip-btn" onClick={() => socket.emit('raiseBid', amt)}>
                +{amt}
              </button>
            ))}
          </div>

          <div className="field">
            <label htmlFor="soldTo">Sell to</label>
            <select
              id="soldTo"
              value={state.soldTo}
              onChange={(e) => socket.emit('setSoldTo', e.target.value)}
            >
              <option value="">Select eligible team…</option>
              {state.teams.map((t) => {
                const c = canBid(t, state.currentBid);
                return (
                  <option key={t.name} value={t.name} disabled={!c.ok}>
                    Team {t.name}
                    {c.ok ? '' : '  (unavailable)'}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="hint">
            {anyEligible
              ? 'Teams shown in green below can legally place this bid.'
              : "No team can currently afford this bid — lower it or reduce increments."}
          </div>

          <button className="btn btn-sold" disabled={soldDisabled} onClick={() => socket.emit('markSold')}>
            Mark sold
          </button>
          <button className="btn btn-skip" onClick={() => socket.emit('skipPlayer')}>
            Unsold / skip lot
          </button>
          <button
            className="btn btn-reset"
            onClick={() => {
              if (window.confirm('Reset all teams and purses? This clears the whole auction.')) {
                socket.emit('resetAuction');
              }
            }}
          >
            Reset entire auction
          </button>
        </div>

        <TeamGrid teams={state.teams} active={active} currentBid={state.currentBid} />
      </div>

      <p className="footer-note">
        Rule enforced live: a team's Max Allowed Bid = Remaining Purse − (Remaining Slots × ₹300),
        so every squad always keeps at least ₹300 for each player slot still open.
      </p>

      <div className="role-switch">
        <Link to="/">← Switch role</Link>
        <span className={`conn-dot ${connected ? 'on' : 'off'}`} title={connected ? 'Connected' : 'Disconnected'} />
      </div>
    </div>
  );
}
