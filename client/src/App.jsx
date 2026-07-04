import { Routes, Route } from 'react-router-dom';
import RoleSelect from './pages/RoleSelect.jsx';
import AuctioneerConsole from './pages/AuctioneerConsole.jsx';
import TeamView from './pages/TeamView.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelect />} />
      <Route path="/auctioneer" element={<AuctioneerConsole />} />
      <Route path="/teams" element={<TeamView />} />
    </Routes>
  );
}
