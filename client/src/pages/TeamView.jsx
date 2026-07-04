import { Link } from 'react-router-dom';
import { useAuctionState } from '../hooks/useAuctionState.js';
import Scoreboard from '../components/Scoreboard.jsx';
import TeamGrid from '../components/TeamGrid.jsx';

export default function TeamView() {
  const { state, connected } = useAuctionState();

  if (!state) {
    return (
      <div className="page-loading">
        <p>{connected ? 'Waiting for auction data…' : 'Connecting to auction server…'}</p>
      </div>
    );
  }

  const active = state.playerName.trim().length > 0;

  return (
    <div>
      <Scoreboard playerName={state.playerName} currentBid={state.currentBid} active={active} />

      <div className="wrap wrap-single">
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
