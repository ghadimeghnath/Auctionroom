import { io } from 'socket.io-client';

// Defaults to the same host the page was loaded from, on port 4000 —
// this is what makes it work both on localhost and over LAN IPs
// without any extra config. Override with VITE_SERVER_URL if the
// server runs on a different machine.
const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || `http://${window.location.hostname}:4000`;

export const socket = io(SERVER_URL, {
  autoConnect: false,
});
