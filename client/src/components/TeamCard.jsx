import { useState } from 'react';
import {
  TEAM_COLORS,
  TOTAL_SLOTS,
  MIN_PRICE,
  remainingSlots,
  maxAllowedBid,
  canBid,
} from '../constants.js';

export default function TeamCard({ team, active, currentBid }) {
  const [squadOpen, setSquadOpen] = useState(false);

  const slots = remainingSlots(team);
  const max = maxAllowedBid(team);
  const full = slots <= 0;
  const check = active ? canBid(team, currentBid) : { ok: null };

  let chip;
  if (full) {
    chip = <span className="status-chip wait">Squad full</span>;
  } else if (!active) {
    chip = <span className="status-chip wait">Standing by</span>;
  } else {
    chip = check.ok ? (
      <span className="status-chip can">Can bid</span>
    ) : (
      <span className="status-chip cannot">Cannot afford</span>
    );
  }

  const cardClass =
    'team-card' +
    (active ? (check.ok ? ' eligible' : ' ineligible') : '') +
    (full ? ' full' : '');

  return (
    <div className={cardClass}>
      <div className="team-top">
        <div className="team-id">
          <div className="badge" style={{ background: TEAM_COLORS[team.name] }}>
            {team.name}
          </div>
          <div>
            <div className="team-name">Team {team.name}</div>
            <div className="team-tag">
              {team.players.length} / {TOTAL_SLOTS} signed
            </div>
          </div>
        </div>
        {chip}
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="stat-label">Remaining purse</div>
          <div className={`stat-val ${team.purse < slots * MIN_PRICE ? 'danger' : ''}`}>
            ₹{team.purse.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Max allowed bid</div>
          <div className={`stat-val ${max < MIN_PRICE && slots > 0 ? 'warn' : ''}`}>
            ₹{Math.max(max, 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="slots">
        {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
          <div key={i} className={`slot ${i < team.players.length ? 'filled' : ''}`} />
        ))}
      </div>

      <span className="squad-toggle" onClick={() => setSquadOpen((o) => !o)}>
        {squadOpen ? 'Hide squad' : 'View squad'}
      </span>
      <div className={`squad-list ${squadOpen ? 'open' : ''}`}>
        {team.players.length ? (
          team.players.map((p, i) => (
            <div key={i}>
              <span>{p.name}</span>
              <span>₹{p.price.toLocaleString('en-IN')}</span>
            </div>
          ))
        ) : (
          <div style={{ opacity: 0.6 }}>No players yet</div>
        )}
      </div>
    </div>
  );
}
