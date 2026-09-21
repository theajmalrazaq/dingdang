import React from "react";
import { Room, RoomPlayer } from "../types";
import { X, Info, Copy, Check } from "lucide-react";

interface LobbyProps {
  room: Room;
  players: RoomPlayer[];
  currentUserId: string;
  unreadCount?: number;
  onStartGame: () => void;
  onExitRoom: () => void;
  onToggleReady?: () => void;
  onOpenInfo?: () => void;
  onOpenChat: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  room,
  players,
  currentUserId,
  unreadCount = 0,
  onStartGame,
  onExitRoom,
  onToggleReady,
  onOpenInfo,
  onOpenChat,
}) => {
  const isHost =
    room.created_by === currentUserId ||
    (players.length > 0 && players[0].user_id === currentUserId);
  const me = players.find((p) => p.user_id === currentUserId);
  const isMeReady = me?.is_ready ?? true;
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Top Header */}
      <div className="oura-header">
        <button className="oura-icon-btn" onClick={onExitRoom} title="Exit Room">
          <X size={18} />
        </button>
        <div className="oura-header-title">Room Lobby</div>
        <button className="oura-icon-btn" onClick={onOpenInfo} title="Room Details">
          <Info size={18} />
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 24px 170px 24px" }}>
        {/* Large Rounded Display Title */}
        <h1 className="oura-screen-title">Game lobby</h1>

        {/* Secondary Info Pill */}
        <div className="oura-tag-pill">
          <Info size={15} />
          <span>Code: {room.code}</span>
        </div>

        {/* Section 1: Room Connection */}
        <div className="section-label">Room connection</div>
        <div className="oura-card-group">
          <div className="oura-card-item" onClick={handleCopyCode} style={{ cursor: "pointer" }}>
            <span className="oura-card-title">Room code</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="oura-card-value" style={{ letterSpacing: "0.1em" }}>
                {room.code}
              </span>
              {copied ? <Check size={16} color="#9CAEFF" /> : <Copy size={15} color="#9AA0AC" />}
            </div>
          </div>
        </div>

        {/* Section 2: Players List */}
        <div className="section-label">Connected players ({players.length})</div>
        <div className="oura-card-group">
          {players.map((player) => {
            const isPlayerHost = player.user_id === room.created_by;
            const isMe = player.user_id === currentUserId;

            return (
              <div key={player.id} className="oura-card-item">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.2rem" }}>{player.avatar || "😜"}</span>
                  <span className="oura-card-title">
                    {player.username}{" "}
                    {isMe && <span style={{ fontSize: "0.8rem", color: "#9AA0AC" }}>(You)</span>}
                  </span>
                </div>

                <span className={player.is_ready ? "oura-card-status-blue" : "oura-card-subtitle"}>
                  {isPlayerHost ? "Host • Connected" : player.is_ready ? "Ready" : "Waiting"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Action Button Pinned Just Above Bottom Dock */}
      <div
        style={{
          position: "absolute",
          bottom: "88px",
          left: 0,
          right: 0,
          padding: "10px 20px 10px 20px",
          zIndex: 25,
        }}
      >
        {isHost ? (
          <button
            className="oura-btn-primary"
            onClick={onStartGame}
            disabled={players.length < 2}
            style={{
              opacity: players.length < 2 ? 0.5 : 1,
              cursor: players.length < 2 ? "not-allowed" : "pointer",
              background: players.length < 2 ? "rgba(255, 255, 255, 0.12)" : "#F4F1EC",
              color: players.length < 2 ? "#9DA4B0" : "#0E1014",
            }}
          >
            {players.length < 2 ? "Need 2+ Players to Start" : "Start Game"}
          </button>
        ) : (
          <button
            className="oura-btn-primary"
            onClick={onToggleReady}
            style={{
              background: isMeReady ? "rgba(255, 255, 255, 0.12)" : "#F4F1EC",
              color: isMeReady ? "#F4F1EC" : "#0E1014",
            }}
          >
            {isMeReady ? "You are Ready" : "Ready Up"}
          </button>
        )}
      </div>
    </div>
  );
};
