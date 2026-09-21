import React from "react";
import { Room, RoomPlayer } from "../types";
import { AppleEmoji } from "./AppleEmoji";
import { Copy, Users, Trophy, LogOut, Crown, Shield } from "lucide-react";

interface SettingsScreenProps {
  room: Room;
  players: RoomPlayer[];
  currentUserId: string;
  onLeaveRoom: () => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  lobby: { label: "In Lobby", color: "#9CAEFF" },
  playing: { label: "Playing", color: "#9CAEFF" },
  finished: { label: "Finished", color: "#F97316" },
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  room,
  players,
  currentUserId,
  onLeaveRoom,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const statusInfo = STATUS_LABELS[room.status] || STATUS_LABELS.lobby;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "440px",
        margin: "0 auto",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(circle at 50% 0%, var(--bg-gradient-top) 0%, var(--bg-dark) 35%, var(--bg-bottom) 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div className="oura-header" style={{ flexShrink: 0 }}>
        <div style={{ width: "36px" }} />
        <div className="oura-header-title">Room Settings</div>
        <div style={{ width: "36px" }} />
      </div>

      {/* Scrollable Content */}
      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "0 24px 130px 24px",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        <h1 className="oura-screen-title">Room & Scores</h1>
        <div className="oura-tag-pill">
          <AppleEmoji emoji="⚙️" size={15} />
          <span>Code: {room.code}</span>
        </div>

        {/* ── Room Connection ── */}
        <div className="section-label">Room connection</div>
        <div className="oura-card-group">
          {/* Room Code */}
          <div className="oura-card-item" onClick={handleCopyCode} style={{ cursor: "pointer" }}>
            <div className="oura-card-left">
              <div className="oura-avatar-icon" style={{ background: "rgba(255, 255, 255, 0.08)" }}>
                <Copy size={18} color="#F4F1EC" />
              </div>
              <div>
                <div className="oura-card-title">Room code</div>
                <div className="oura-card-subtitle">Tap to copy</div>
              </div>
            </div>
            <div
              style={{
                fontFamily: "monospace",
                letterSpacing: "0.12em",
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                transition: "color 0.2s ease",
              }}
            >
              {copied ? "Copied!" : room.code}
            </div>
          </div>

          {/* Game Status */}
          <div className="oura-card-item">
            <div className="oura-card-left">
              <div className="oura-avatar-icon" style={{ background: "rgba(255, 255, 255, 0.08)" }}>
                <Shield size={18} color="#F4F1EC" />
              </div>
              <div className="oura-card-title">Game status</div>
            </div>
            <span
              style={{
                fontSize: "0.92rem",
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              {statusInfo.label}
            </span>
          </div>

          {/* Player Count */}
          <div className="oura-card-item">
            <div className="oura-card-left">
              <div className="oura-avatar-icon" style={{ background: "rgba(255, 255, 255, 0.08)" }}>
                <Users size={18} color="#F4F1EC" />
              </div>
              <div className="oura-card-title">Connected players</div>
            </div>
            <span className="oura-card-value">{players.length}</span>
          </div>
        </div>

        {/* ── Connected Players / Leaderboard ── */}
        <div className="section-label">Connected players ({players.length})</div>
        <div className="oura-card-group">
          {sortedPlayers.map((player, idx) => {
            const isHost = player.is_host || player.user_id === room.created_by;
            const isCurrentUser = player.user_id === currentUserId;

            return (
              <div key={player.id} className={`oura-card-item${isCurrentUser ? " selected" : ""}`}>
                <div className="oura-card-left">
                  {/* Avatar */}
                  <div className="oura-avatar-icon">
                    <AppleEmoji emoji={player.avatar || "😜"} size={22} />
                  </div>

                  {/* Name & Role */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span className="oura-card-title">
                        {player.username}
                        {isCurrentUser && (
                          <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                            {" "}
                            (You)
                          </span>
                        )}
                      </span>
                      {isHost && <Crown size={14} color="#F4F1EC" />}
                    </div>
                    <div className="oura-card-subtitle">
                      {isHost ? "Host" : "Player"}
                      {" · "}
                      <span
                        style={{
                          color: "var(--text-secondary)",
                        }}
                      >
                        {player.is_ready ? "Ready" : "Waiting"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: "var(--text-primary)",
                    flexShrink: 0,
                  }}
                >
                  <Trophy size={15} color="#F4F1EC" />
                  <span>{player.score || 0}</span>
                </div>
              </div>
            );
          })}

          {sortedPlayers.length === 0 && (
            <div
              className="oura-card-item"
              style={{ justifyContent: "center", color: "var(--text-muted)" }}
            >
              No players yet
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="section-label">Actions</div>
        <div className="oura-card-group">
          <button
            className="oura-card-item"
            onClick={onLeaveRoom}
            style={{
              cursor: "pointer",
              background: "transparent",
              border: "none",
              width: "100%",
              textAlign: "left",
            }}
          >
            <div className="oura-card-left">
              <div className="oura-avatar-icon" style={{ background: "rgba(255, 255, 255, 0.08)" }}>
                <LogOut size={18} color="#F4F1EC" />
              </div>
              <div className="oura-card-title" style={{ color: "#F4F1EC" }}>
                Leave room
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
