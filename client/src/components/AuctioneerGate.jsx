import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AuctioneerGate({ connected, status, error, onSubmit }) {
  const [password, setPassword] = useState('');

  return (
    <div className="page-loading">
      <form
        className="gate-card"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(password);
        }}
      >
        <h2>Auctioneer access</h2>
        <p>Enter the auctioneer password to open the console.</p>
        <input
          type="password"
          autoFocus
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-sold" type="submit" disabled={!connected || status === 'checking'}>
          {status === 'checking' ? 'Checking…' : 'Enter'}
        </button>
        {status === 'error' && <div className="gate-error">{error}</div>}
        {!connected && <div className="gate-error">Connecting to auction server…</div>}
        <Link to="/" className="gate-back">
          ← Back
        </Link>
      </form>
    </div>
  );
}
