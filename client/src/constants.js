// ── Football League Cup 2026-27 constants ────────────────────────────────────
export const START_PURSE   = 12000;   // Points per team
export const TOTAL_SLOTS   = 16;      // Players per squad
export const MAX_GROUP_A   = 2;       // Max College (Group A) players per team
export const GROUP_A_BASE  = 500;     // Group A base price
export const GROUP_B_BASE  = 300;     // Group B base price
export const BID_INCREMENT = 300;     // Standard bid increment

/** Backwards-compat alias – used as floor for slot-reservation math */
export const MIN_PRICE = GROUP_B_BASE;

export const TEAM_COLORS = {
  'Shaky Boys': '#e8483d',
  'Shield United': '#070501ff',
  'Prime 11': '#2f9e44',
  'Pheonix FC': '#2a7de1',
  'Crown United': '#a259e8',
  'Black Stone FC': '#e85fa0',
  'Bambolino FC': '#3ec6c6',
  'Arsenal': '#f2823d',
};

export function remainingSlots(team) {
  return TOTAL_SLOTS - team.players.length;
}

export function groupACount(team) {
  return (team.players || []).filter((p) => p.group === 'A').length;
}

export function maxAllowedBid(team) {
  return team.purse - remainingSlots(team) * GROUP_B_BASE;
}

// Client-side mirror of the server's eligibility check, used purely for
// instant UI feedback (colors/disabled states). The server re-validates
// every action, so this is never the source of truth.
export function canBid(team, amount, playerGroup = 'B') {
  const slots = remainingSlots(team);
  if (slots <= 0) return { ok: false, reason: 'full' };

  // Group A cap: max 2 College players per team
  if (playerGroup === 'A' && groupACount(team) >= MAX_GROUP_A) {
    return { ok: false, reason: 'group-a-full' };
  }

  const minBase = playerGroup === 'A' ? GROUP_A_BASE : GROUP_B_BASE;
  if (amount < minBase) return { ok: false, reason: 'below-min' };
  if (amount > maxAllowedBid(team)) return { ok: false, reason: 'over-max' };

  return { ok: true };
}
