import { useState } from 'react';
import {
  TOTAL_SLOTS,
  MIN_PRICE,
  MAX_GROUP_A,
  remainingSlots,
  maxAllowedBid,
  groupACount,
  canBid,
  TEAM_LOGOS,
} from '../constants.js';

export default function TeamCard({ team, active, currentBid, playerGroup = 'B' }) {
  const [squadOpen, setSquadOpen] = useState(false);

  const slots = remainingSlots(team);
  const max = maxAllowedBid(team);
  const full = slots <= 0;
  const aCount = groupACount(team);
  const check = active ? canBid(team, currentBid, playerGroup) : { ok: null };

  let chip;
  if (full) {
    chip = <span className="status-chip wait">Squad full</span>;
  } else if (!active) {
    chip = <span className="status-chip wait">Standing by</span>;
  } else if (check.reason === 'group-a-full') {
    chip = <span className="status-chip cannot">Group A limit</span>;
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
      <div className="team-card-bg">
      <img
        src={TEAM_LOGOS[team.name]}
        alt=""
        aria-hidden="true"
      />
    </div>
      <div className="team-top">
        <div className="team-id">
          <div className="badge">
            <img
              src={TEAM_LOGOS[team.name]}
              alt={team.name}
              className="badge-logo"
            />
          </div>
          <div>
            <div className="team-name">{team.name}</div>
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
            {team.purse.toLocaleString('en-IN')} pts
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Max allowed bid</div>
          <div className={`stat-val ${max < MIN_PRICE && slots > 0 ? 'warn' : ''}`}>
            {Math.max(max, 0).toLocaleString('en-IN')} pts
          </div>
        </div>
      </div>

      {/* Group A usage bar */}
      <div className="group-a-bar">
        <span className="group-a-label">
          <span className="group-badge-a-sm"></span>
          Group A Players: {aCount} / {MAX_GROUP_A}
        </span>
        <div className="group-a-pips">
          {Array.from({ length: MAX_GROUP_A }).map((_, i) => (
            <div key={i} className={`group-a-pip ${i < aCount ? 'used' : ''}`} />
          ))}
        </div>
      </div>

      {/* Slot bar — 16 slots */}
      <div className="slots">
        {Array.from({ length: TOTAL_SLOTS }).map((_, i) => {
          const player = team.players[i];
          const isGroupA = player && player.group === 'A';
          return (
            <div
              key={i}
              className={`slot ${i < team.players.length ? 'filled' : ''} ${isGroupA ? 'slot-a' : ''}`}
              title={player ? `${player.name} (${player.group === 'A' ? 'College' : 'Open'})` : ''}
            />
          );
        })}
      </div>

      <span className="squad-toggle" onClick={() => setSquadOpen((o) => !o)}>
        {squadOpen ? 'Hide squad' : 'View squad'}
      </span>
      <div className={`squad-list ${squadOpen ? 'open' : ''}`}>
        {team.players.length ? (
          team.players.map((p, i) => (
            <div key={i}>
              <span>
                {p.name}
                <span className={`squad-group-badge ${p.group === 'A' ? 'squad-badge-a' : 'squad-badge-b'}`}>
                  {` (${p.group})`}
                </span>
              </span>
              <span>{p.price.toLocaleString('en-IN')} pts</span>
            </div>
          ))
        ) : (
          <div style={{ opacity: 0.6 }}>No players yet</div>
        )}
      </div>
    </div>
  );
}
