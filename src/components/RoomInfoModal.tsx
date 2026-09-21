import React from "react";
import { Room, RoomPlayer } from "../types";
import { X, Copy, Check, Crown, Trophy, ShieldAlert } from "lucide-react";

interface RoomInfoModalProps {
  room: Room;
  players: RoomPlayer[];
  onClose: () => void;
}

export const RoomInfoModal: React.FC<RoomInfoModalProps> = ({ room, players, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="oura-drawer-overlay" style={{ zIndex: 100 }} onClick={onClose}>
      <div
        className="oura-drawer-sheet"
        style={{ height: "75%" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="oura-drawer-header">
          <button className="oura-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
          <div className="oura-header-title">Room & Scoreboard</div>
          <div style={{ width: "40px" }} />
        </div>

        {/* Content */}
        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          {/* Room Code Card */}
          <div className="section-label">ROOM CODE</div>
          <div className="oura-card-group">
            <div
              className="oura-card-item selected"
              onClick={handleCopyCode}
              style={{ cursor: "pointer" }}
            >
              <div className="oura-card-left">
                <div
                  className="oura-card-title"
                  style={{ fontFamily: "monospace", letterSpacing: "0.12em", fontSize: "1.25rem" }}
                >
                  {room.code}
                </div>
              </div>
              {copied ? <Check size={18} color="#9CAEFF" /> : <Copy size={18} color="#9DA4B0" />}
            </div>
          </div>

          {/* Scoreboard List (Image 1 style list) */}
          <div className="section-label">SCOREBOARD ({players.length})</div>
          <div className="oura-card-group">
            {sortedPlayers.map((player, idx) => (
              <div key={player.id} className="oura-card-item">
                <div className="oura-card-left">
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: idx === 0 ? "#F97316" : "#9DA4B0",
                      width: "20px",
                    }}
                  >
                    #{idx + 1}
                  </div>
                  <div className="oura-avatar-icon" style={{ fontSize: "1.3rem" }}>
                    {player.avatar || "😜"}
                  </div>
                  <div>
                    <div className="oura-card-title">{player.username}</div>
                    <div className="oura-card-subtitle muted">
                      {player.user_id === room.created_by ? "Host" : "Player"}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: "#F3F0EB",
                  }}
                >
                  <Trophy size={16} color="#9CAEFF" />
                  <span>{player.score || 0} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
