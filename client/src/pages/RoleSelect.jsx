import { Link } from 'react-router-dom';

export default function RoleSelect() {
  return (
    <div className="role-select">
      <div className="role-select-inner">
        <div className="brand brand-center">
          <div className="brand-mark"></div>
          <div className="brand-text">Auction Room</div>
        </div>
        <h1>Choose your view</h1>
        <p className="role-select-sub">
          Everyone connects to the same live auction
        </p>
        <div className="role-cards">
          <Link to="/teams" className="role-card">
            <h2>Team View</h2>
            <p>
              A read-only live board for teams: current lot, current bid, and every team's
              purse, slots, and bidding eligibility, updating in real time.
            </p>
            <span className="role-card-cta">Open team view →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
