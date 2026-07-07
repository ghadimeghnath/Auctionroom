import { Link } from 'react-router-dom';
import { useAuctionState } from '../hooks/useAuctionState.js';
import Scoreboard from '../components/Scoreboard.jsx';
import TeamGrid from '../components/TeamGrid.jsx';
import { useCelebration } from "../hooks/useCelebration";

export default function TeamView() {
  const { state, connected } = useAuctionState();
  useCelebration();
  if (!state) {
    return (
      <div className="page-loading">
        <p>{connected ? 'Waiting for auction data…' : 'Connecting to auction server…'}</p>
      </div>
    );
  }

  const active      = state.playerName.trim().length > 0;
  const playerGroup = state.playerGroup || 'B';

  return (
    <div>
      <Scoreboard
        playerName={state.playerName}
        playerGroup={playerGroup}
        currentBid={state.currentBid}
        active={active}
      />

      <div className="wrap wrap-single">
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

    </div>
  );
}
