# Auction Room

A live, multi-device auction tracker with two roles:

- **Auctioneer Console** — set the player on the block, raise the bid, pick the winning team, mark sold / skip / reset.
- **Team View** — read-only live board (scoreboard + team eligibility grid) that updates in real time as the auctioneer works.

Both roles talk to a small Node/Socket.IO server, so anyone on the same network (laptop, phone, tablet) can open the Team View and watch the auction live while the auctioneer runs the console from another device.

## Project structure

```
auction-room-app/
  server/     # Node + Express + Socket.IO — holds the live auction state
  client/     # Vite + React (JavaScript) — Auctioneer Console & Team View
```

## 1. Start the server

```bash
cd server
npm install
npm run dev
```

The server listens on **http://localhost:4000** (WebSocket + a tiny health route). It keeps the entire auction state in memory (teams, purses, current lot, current bid) and broadcasts any change to every connected client instantly.

## 2. Start the client

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Vite will print a local and a network URL, e.g.:

```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.23:5173/
```

- On the auctioneer's laptop, open the **Local** URL and choose **Auctioneer Console**.
- On any other device on the same Wi-Fi (team laptops, a projector browser, phones), open the **Network** URL and choose **Team View**.

The client automatically talks to the Socket.IO server on the same host, port `4000` (e.g. `http://192.168.1.23:4000`), so no extra configuration is needed as long as both the server and client run on the same machine and that machine's firewall allows LAN connections on ports 4000 and 5173.

If you ever run the server on a different machine than the client, set an environment variable before starting the client:

```bash
VITE_SERVER_URL=http://<server-ip>:4000 npm run dev
```

## Rules baked into the app

- Every team starts with a ₹10,000 purse and 11 squad slots.
- Minimum bid / player price is ₹300.
- **Max Allowed Bid** = Remaining Purse − (Remaining Slots × ₹300), so a team can never bid itself into a position where it can't fill every remaining slot at minimum price.
- The "Sell to" list and the Team View eligibility grid only ever allow legal bids — this is enforced on the server, not just the UI, so it's consistent for every connected screen.

## Tech stack

- **Server:** Node.js, Express, Socket.IO
- **Client:** Vite, React 18 (JavaScript, not TypeScript), React Router, socket.io-client
