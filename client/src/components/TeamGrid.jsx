import TeamCard from './TeamCard.jsx';

export default function TeamGrid({ teams, active, currentBid, playerGroup = 'B' }) {
  return (
    <div className="card">
      <div className="board-head">
        <h2>Team eligibility — live</h2>
        <div className="legend">
          <span>
            <span className="dot g"></span>Can bid
          </span>
          <span>
            <span className="dot r"></span>Can't afford
          </span>
          <span>
            <span className="dot gy"></span>Squad full
          </span>
        </div>
      </div>
      <div className="team-grid">
        {teams.map((t) => (
          <TeamCard
            key={t.name}
            team={t}
            active={active}
            currentBid={currentBid}
            playerGroup={playerGroup}
          />
        ))}
      </div>
    </div>
  );
}
