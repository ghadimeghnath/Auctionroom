import { io } from 'socket.io-client';

// Local dev: talk to the server on the same host, port 4000 (works over
// LAN IPs too, with no config). Production (Netlify): the client is static
// and the server lives on a different host entirely, so VITE_SERVER_URL
// MUST be set at build time (Netlify → Site settings → Environment variables).
const SERVER_URL = import.meta.env.VITE_SERVER_URL || `http://${window.location.hostname}:4000`;

if (import.meta.env.PROD && !import.meta.env.VITE_SERVER_URL) {
  // eslint-disable-next-line no-console
  console.error(
    'VITE_SERVER_URL is not set. Set it to your deployed Socket.IO server URL ' +
      '(e.g. https://auction-room-server.onrender.com) in Netlify env vars and redeploy.'
  );
}

export const socket = io(SERVER_URL, {
  autoConnect: false,
});
