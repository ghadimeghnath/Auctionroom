import { useState } from "react";
import { Link } from "react-router-dom";

export default function AuctioneerGate({
  connected,
  status,
  error,
  onSubmit,
}) {
  const [password, setPassword] = useState("");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#111827",
        padding: "20px",
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(password);
        }}
        style={{
          width: "100%",
          maxWidth: "380px",
          background: "#1f2937",
          padding: "2rem",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#fff",
            fontSize: "1.6rem",
          }}
        >
          Auctioneer Access
        </h2>

        <p
          style={{
            margin: 0,
            color: "#9ca3af",
            lineHeight: 1.5,
            fontSize: "0.95rem",
          }}
        >
          Enter the auctioneer password to open the console.
        </p>

        <input
          type="password"
          autoFocus
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "0.85rem 1rem",
            borderRadius: "8px",
            border: "1px solid #374151",
            background: "#111827",
            color: "#fff",
            fontSize: "1rem",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <button
          type="submit"
          disabled={!connected || status === "checking"}
          style={{
            padding: "0.85rem",
            border: "none",
            borderRadius: "8px",
            background: !connected || status === "checking" ? "#9ca3af" : "#f97316",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: 600,
            cursor:
              !connected || status === "checking"
                ? "not-allowed"
                : "pointer",
            transition: "0.2s",
          }}
        >
          {status === "checking" ? "Checking…" : "Enter"}
        </button>

        {status === "error" && (
          <div
            style={{
              color: "#ef4444",
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {!connected && (
          <div
            style={{
              color: "#ef4444",
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            Connecting to auction server…
          </div>
        )}

        <Link
          to="/"
          style={{
            textAlign: "center",
            color: "#60a5fa",
            textDecoration: "none",
            fontSize: "0.95rem",
            marginTop: "0.5rem",
          }}
        >
          ← Back
        </Link>
      </form>
    </div>
  );
}