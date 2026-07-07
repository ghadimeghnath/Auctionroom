export default function Scoreboard({ playerName, currentBid, active, isStriking}) {
  return (
    <div className={`ticker`}>
      <div className="ticker-top">
        <div className="brand">
          <div className="brand-mark"></div>
          <div className="brand-text">Damodar College Auction Room</div>
        </div>
        <div className="live-badge">
          <span className="live-dot"></span>Live
        </div>
      </div>
      <div className="scoreboard">
        <div className="sb-player">
          <div className="sb-label">On the block</div>
          <div
  key={playerName}
  className={`sb-name${active ? '' : ' empty'} player-enter`}
>
            {active ? playerName : '— waiting for next player —'}
          </div>
        </div>
        <div className="sb-bid-block">
          <div className="sb-label">Current bid</div>
          <div
key={currentBid}
className="sb-bid bid-pop"
>{Number(currentBid || 0).toLocaleString('en-IN')}</div>
        </div>
        <div className="sb-status">
          <span className={`status-pill ${active ? 'status-open' : 'status-idle'}`}>
            {active ? 'Lot open' : 'No active lot'}
          </span>
        </div>
      </div>
    </div>
  );
}
