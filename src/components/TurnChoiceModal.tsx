import React, { useState } from "react";
import { PromptType } from "../types";
import { Sparkles, Loader2 } from "lucide-react";
import { AppleEmoji } from "./AppleEmoji";

interface TurnChoiceModalProps {
  playerName: string;
  onSelectType: (type: PromptType) => void;
}

export const TurnChoiceModal: React.FC<TurnChoiceModalProps> = ({ playerName, onSelectType }) => {
  const [selectedType, setSelectedType] = useState<PromptType>("truth");
  const [loading, setLoading] = useState<boolean>(false);

  const handleConfirm = () => {
    setLoading(true);
    onSelectType(selectedType);
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(circle at 50% 0%, var(--bg-gradient-top) 0%, var(--bg-dark) 35%, var(--bg-bottom) 100%)",
        zIndex: 80,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Top Header */}
      <div className="oura-header">
        <div style={{ width: "40px" }} />
        <div className="oura-header-title">Ding Dang</div>
        <div style={{ width: "40px" }} />
      </div>

      {/* Main Content Scroll Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 24px 170px 24px" }}>
        {/* Screen Title */}
        <h1 className="oura-screen-title">{playerName}'s turn</h1>

        {/* Secondary Info Tag Pill */}
        <div className="oura-tag-pill">
          <AppleEmoji emoji="✨" size={15} />
          <span>Pick your fate</span>
        </div>

        {/* Section Label */}
        <div className="section-label">Select prompt type</div>

        {/* Oura Card Group */}
        <div className="oura-card-group">
          {/* TRUTH CARD */}
          <div
            className={`oura-card-item ${selectedType === "truth" ? "selected" : ""}`}
            onClick={() => setSelectedType("truth")}
            style={{ cursor: "pointer", padding: "16px" }}
          >
            <div
              className="oura-card-left"
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "rgba(156, 174, 255, 0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AppleEmoji emoji="🤫" size={24} />
              </div>
              <div>
                <span className="oura-card-title" style={{ display: "block", fontSize: "1rem" }}>
                  Truth
                </span>
                <span style={{ fontSize: "0.78rem", color: "#9AA0AC" }}>
                  Answer an honest question
                </span>
              </div>
            </div>
            <span
              className={selectedType === "truth" ? "oura-card-value" : "oura-card-status-blue"}
            >
              {selectedType === "truth" ? "Selected" : "Available"}
            </span>
          </div>

          {/* DARE CARD */}
          <div
            className={`oura-card-item ${selectedType === "dare" ? "selected" : ""}`}
            onClick={() => setSelectedType("dare")}
            style={{ cursor: "pointer", padding: "16px" }}
          >
            <div
              className="oura-card-left"
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "rgba(249, 115, 22, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AppleEmoji emoji="🔥" size={24} />
              </div>
              <div>
                <span className="oura-card-title" style={{ display: "block", fontSize: "1rem" }}>
                  Dare
                </span>
                <span style={{ fontSize: "0.78rem", color: "#9AA0AC" }}>
                  Perform a fun challenge
                </span>
              </div>
            </div>
            <span className={selectedType === "dare" ? "oura-card-value" : "oura-card-status-blue"}>
              {selectedType === "dare" ? "Selected" : "Available"}
            </span>
          </div>

          {/* RANDOM CHOICE CARD */}
          <div
            className={`oura-card-item ${selectedType === "random" ? "selected" : ""}`}
            onClick={() => setSelectedType("random")}
            style={{ cursor: "pointer", padding: "16px" }}
          >
            <div
              className="oura-card-left"
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AppleEmoji emoji="🎲" size={24} />
              </div>
              <div>
                <span className="oura-card-title" style={{ display: "block", fontSize: "1rem" }}>
                  Random choice
                </span>
                <span style={{ fontSize: "0.78rem", color: "#9AA0AC" }}>
                  Let fate decide prompt
                </span>
              </div>
            </div>
            <span
              className={selectedType === "random" ? "oura-card-value" : "oura-card-status-blue"}
            >
              {selectedType === "random" ? "Selected" : "Available"}
            </span>
          </div>
        </div>
      </div>

      {/* Primary CTA Cream Pill Button Pinned above Chat Dock */}
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          left: 0,
          right: 0,
          padding: "12px 24px 16px 24px",
          background: "linear-gradient(to top, var(--bg-bottom) 85%, transparent 100%)",
          zIndex: 85,
        }}
      >
        <button
          className="oura-btn-primary"
          onClick={handleConfirm}
          disabled={loading}
          style={{
            opacity: loading ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Sending Choice...</span>
            </>
          ) : (
            "Confirm Choice"
          )}
        </button>
      </div>
    </div>
  );
};
