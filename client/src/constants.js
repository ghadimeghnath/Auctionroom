export const MIN_PRICE = 300;
export const TOTAL_SLOTS = 11;
export const START_PURSE = 10000;

export const TEAM_COLORS = {
  A: '#e8483d',
  B: '#f2b705',
  C: '#2f9e44',
  D: '#2a7de1',
  E: '#a259e8',
  F: '#e85fa0',
  G: '#3ec6c6',
  H: '#f2823d',
};

export function remainingSlots(team) {
  return TOTAL_SLOTS - team.players.length;
}

export function maxAllowedBid(team) {
  return team.purse - remainingSlots(team) * MIN_PRICE;
}

// Client-side mirror of the server's eligibility check, used purely for
// instant UI feedback (colors/disabled states). The server re-validates
// every action, so this is never the source of truth.
export function canBid(team, amount) {
  const slots = remainingSlots(team);
  if (slots <= 0) return { ok: false, reason: 'full' };
  if (amount < MIN_PRICE) return { ok: false, reason: 'below-min' };
  if (amount > maxAllowedBid(team)) return { ok: false, reason: 'over-max' };
  return { ok: true };
}
