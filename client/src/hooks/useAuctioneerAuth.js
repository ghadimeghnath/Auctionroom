import { useCallback, useEffect, useState } from 'react';
import { socket } from '../socket.js';

const STORAGE_KEY = 'auctionRoom.auctioneerPassword';

// Remembers a working password for this browser tab session only
// (sessionStorage), so a refresh doesn't ask again, but it's gone once
// the tab is closed.
export function useAuctioneerAuth(connected) {
  const [status, setStatus] = useState('idle'); // idle | checking | authed | error
  const [error, setError] = useState('');

  const tryAuth = useCallback((password) => {
    setStatus('checking');
    setError('');
    socket.emit('authenticate', password, (res) => {
      if (res && res.ok) {
        sessionStorage.setItem(STORAGE_KEY, password);
        setStatus('authed');
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
        setStatus('error');
        setError('Incorrect password.');
      }
    });
  }, []);

  // Once connected, silently retry a remembered password before showing
  // the login form at all.
  useEffect(() => {
    if (!connected || status !== 'idle') return;
    const remembered = sessionStorage.getItem(STORAGE_KEY);
    if (remembered) {
      tryAuth(remembered);
    } else {
      setStatus('unauthed');
    }
  }, [connected, status, tryAuth]);

  return { status, error, tryAuth };
}
