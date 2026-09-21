import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameTurn, RoomPlayer } from "../types";
import { X, Info, ThumbsUp, ThumbsDown, Camera, Check, Loader2, Send } from "lucide-react";
import confetti from "canvas-confetti";
import { AppleEmoji } from "./AppleEmoji";
import { compressImage } from "../lib/imageCompressor";

interface GameCardProps {
  currentTurn: GameTurn | null;
  activePlayer: RoomPlayer | undefined;
  isMyTurn: boolean;
  currentUserId?: string;
  timeLeft: number;
  maxTime?: number;
  unreadCount?: number;
  onSubmitResponse?: (text: string, image?: string) => Promise<void> | void;
  onApprove: () => Promise<void> | void;
  onReject: () => Promise<void> | void;
  onSkip: () => Promise<void> | void;
  onOpenInfo: () => void;
  onOpenChat: () => void;
  onOpenScoreboard: () => void;
  onExit: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  currentTurn,
  activePlayer,
  isMyTurn,
  currentUserId,
  timeLeft,
  maxTime = 45,
  unreadCount = 0,
  onSubmitResponse,
  onApprove,
  onReject,
  onSkip,
  onOpenInfo,
  onOpenChat,
  onOpenScoreboard,
  onExit,
}) => {
  const isTurnAuthor =
    currentTurn?.player_id && currentUserId ? currentTurn.player_id === currentUserId : isMyTurn;
  const [responseText, setResponseText] = useState("");
  const [responseImage, setResponseImage] = useState<string | null>(null);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<string | null>(null);

  // Modal and Interactive States
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Server-side Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // If active player is currently choosing prompt on TurnChoiceModal
  if (!currentTurn) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          position: "relative",
          background:
            "radial-gradient(circle at 50% 0%, var(--bg-gradient-top) 0%, var(--bg-dark) 35%, var(--bg-bottom) 100%)",
          overflow: "hidden",
        }}
      >
        {/* Top Header */}
        <div className="oura-header">
          <button className="oura-icon-btn" onClick={onExit} title="Exit Game">
            <X size={18} />
          </button>
          <div className="oura-header-title">Game Session</div>
          <button className="oura-icon-btn" onClick={onOpenInfo} title="Room Details">
            <Info size={18} />
          </button>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 20px 95px 20px" }}>
          {/* Screen Title */}
          <h1 className="oura-screen-title" style={{ fontSize: "1.4rem", marginBottom: "8px" }}>
            {isMyTurn ? "Your turn to pick!" : `${activePlayer?.username || "Player"}'s turn`}
          </h1>

          {/* Secondary Info Tag Pill */}
          <div className="oura-tag-pill">
            <Loader2 size={13} className="animate-spin" color="#38BDF8" />
            <span>Choosing prompt</span>
          </div>

          {/* Active Player Card Group */}
          <div className="section-label" style={{ marginTop: "12px" }}>
            Active player
          </div>
          <div className="oura-card-group">
            <div className="oura-card-item" style={{ padding: "14px" }}>
              <div className="oura-card-left" style={{ gap: "10px" }}>
                <AppleEmoji emoji={activePlayer?.avatar || "😜"} size={28} />
                <div>
                  <div className="oura-card-title">{activePlayer?.username || "Player"}</div>
                  <div className="oura-card-subtitle">
                    {isMyTurn ? "Selecting prompt type..." : "Picking Truth or Dare..."}
                  </div>
                </div>
              </div>
              <span className="oura-card-status-blue">Picking</span>
            </div>
          </div>

          {/* Round Status Info */}
          <div className="section-label">Round status</div>
          <div className="oura-card-group">
            <div className="oura-card-item">
              <span className="oura-card-title">Prompt status</span>
              <span className="oura-card-value" style={{ color: "#9AA0AC", fontSize: "0.9rem" }}>
                Waiting for choice
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isTruth = currentTurn?.type === "truth";
  const headerTitle = isTruth ? "Truth Challenge" : "Dare Challenge";
  const accentColor = isTruth ? "#38BDF8" : "#F97316";

  const isSubmitted = Boolean(
    currentTurn?.status === "submitted" ||
    currentTurn?.response_text ||
    currentTurn?.response_image,
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Photo proof must be under 5MB");
      return;
    }
    setErrorMsg(null);

    try {
      const compressedBase64 = await compressImage(file, 600, 600, 0.7);
      if (compressedBase64) {
        setResponseImage(compressedBase64);
      }
    } catch (err) {
      console.error("Failed to compress image:", err);
    }
    e.target.value = "";
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim() && !responseImage) {
      setErrorMsg("Please write an answer or attach a photo proof before submitting");
      return;
    }
    setErrorMsg(null);

    try {
      setIsSubmitting(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.8 },
      });

      if (onSubmitResponse) {
        await onSubmitResponse(responseText.trim(), responseImage || undefined);
      }
      setShowSubmitModal(false);
      setResponseText("");
      setResponseImage(null);
    } catch (err) {
      console.error("Failed to submit proof:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipClick = async () => {
    try {
      setIsSkipping(true);
      await onSkip();
    } catch (err) {
      console.error("Failed to skip turn:", err);
    } finally {
      setIsSkipping(false);
    }
  };

  const handleApproveClick = async () => {
    try {
      setIsApproving(true);
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.7 },
      });
      await onApprove();
    } catch (err) {
      console.error("Failed to approve turn:", err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectClick = async () => {
    try {
      setIsRejecting(true);
      await onReject();
    } catch (err) {
      console.error("Failed to reject turn:", err);
    } finally {
      setIsRejecting(false);
    }
  };

  // Compact Circular gauge calculation for Mobile scale
  const radius = 50;
  const circumference = Math.PI * radius;
  const progressRatio = Math.max(0, Math.min(1, timeLeft / maxTime));
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        position: "relative",
        zIndex: showSubmitModal ? 200 : 1,
        background:
          "radial-gradient(circle at 50% 0%, var(--bg-gradient-top) 0%, var(--bg-dark) 35%, var(--bg-bottom) 100%)",
        overflow: "hidden",
      }}
    >
      {/* Top Header */}
      <div className="oura-header" style={{ padding: "12px 16px" }}>
        <button
          className="oura-icon-btn"
          onClick={onExit}
          title="Exit Game"
          style={{ width: "36px", height: "36px" }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "#9DA4B0",
              textTransform: "uppercase",
            }}
          >
            {headerTitle}
          </div>
          <div style={{ fontSize: "0.98rem", fontWeight: 600, color: "#F3F0EB" }}>
            {activePlayer?.username || "Player"}'s Turn
          </div>
        </div>

        <button
          className="oura-icon-btn"
          onClick={onOpenInfo}
          title="Room Details"
          style={{ width: "36px", height: "36px" }}
        >
          <Info size={18} />
        </button>
      </div>

      {/* Main Content Area (Centered Vertically for Active Challenge View) */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 18px 90px 18px",
          textAlign: "center",
          position: "relative",
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >
        {/* Top Active Player Stat Label */}
        <div
          style={{
            fontSize: "0.68rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: "#9DA4B0",
            textTransform: "uppercase",
            marginBottom: "0px",
            marginTop: "2px",
          }}
        >
          ACTIVE PLAYER
        </div>
        <div
          style={{
            fontSize: "1.65rem",
            fontWeight: 700,
            color: "#F3F0EB",
            letterSpacing: "-0.02em",
            marginBottom: "10px",
          }}
        >
          {activePlayer?.username || "Anonymous"}
        </div>

        {/* Oura Compact Circular Zone Gauge Meter */}
        <div
          style={{
            position: "relative",
            width: "170px",
            height: "105px",
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <svg width="170" height="105" viewBox="0 0 140 90">
            <path
              d="M 15 75 A 55 55 0 0 1 125 75"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M 15 75 A 55 55 0 0 1 125 75"
              fill="none"
              stroke={accentColor}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>

          <div
            style={{
              position: "absolute",
              bottom: "8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: accentColor,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <span>{isTruth ? "♥ TRUTH" : "🔥 DARE"}</span>
            </div>
            <div
              style={{
                fontSize: "1.8rem",
                fontWeight: 800,
                color: "#F3F0EB",
                fontFamily: "monospace",
                lineHeight: 1.1,
              }}
            >
              {timeLeft}s
            </div>
          </div>
        </div>

        {/* Prompt Display Card */}
        <div
          className="oura-card-group"
          style={{ width: "100%", padding: "14px 16px", margin: "0 0 12px 0" }}
        >
          <div style={{ fontSize: "1.02rem", fontWeight: 600, color: "#F3F0EB", lineHeight: 1.38 }}>
            "{currentTurn?.prompt || "Loading prompt..."}"
          </div>
        </div>

        {/* ACTION / STATUS SECTION */}

        {/* CASE 1: Active Player's Turn - Before Submission */}
        {isTurnAuthor && !isSubmitted && (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              type="button"
              className="oura-btn-primary"
              onClick={() => setShowSubmitModal(true)}
              style={{ height: "46px", fontSize: "0.96rem" }}
            >
              Submit Proof to Room
            </button>
          </div>
        )}

        {/* CASE 2: Active Player's Turn - After Submission */}
        {isTurnAuthor && isSubmitted && (
          <div
            className="oura-card-group"
            style={{
              width: "100%",
              padding: "14px 16px",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Check size={13} color="#F4F1EC" />
              </div>
              <div>
                <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#F3F0EB" }}>
                  Proof Submitted!
                </div>
                <div style={{ fontSize: "0.78rem", color: "#9DA4B0" }}>
                  Waiting for room players to judge...
                </div>
              </div>
            </div>

            {(currentTurn?.response_text || currentTurn?.response_image) && (
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {currentTurn?.response_text && (
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "#F4F1EC",
                      fontWeight: 500,
                      lineHeight: 1.35,
                    }}
                  >
                    {currentTurn.response_text}
                  </div>
                )}

                {currentTurn?.response_image && (
                  <img
                    src={currentTurn.response_image}
                    alt="Submitted Proof"
                    onClick={() => setSelectedLightboxImage(currentTurn.response_image!)}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "120px",
                      borderRadius: "10px",
                      objectFit: "cover",
                      cursor: "pointer",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* CASE 3: Other Players' Turn - Before Submission */}
        {!isTurnAuthor && !isSubmitted && (
          <div style={{ fontSize: "0.88rem", color: "#9DA4B0", fontWeight: 500, padding: "8px 0" }}>
            Waiting for <strong style={{ color: "#F3F0EB" }}>{activePlayer?.username}</strong> to
            submit proof...
          </div>
        )}

        {/* CASE 4: Other Players' Turn - Judge Active Player's Submission */}
        {!isTurnAuthor && isSubmitted && (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Submitted Proof Details Card */}
            <div
              className="oura-card-group"
              style={{
                width: "100%",
                padding: "14px 16px",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#9DA4B0",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {activePlayer?.username}'S PROOF SUBMISSION
              </div>

              {currentTurn?.response_text && (
                <div
                  style={{
                    fontSize: "0.92rem",
                    color: "#F4F1EC",
                    fontWeight: 500,
                    lineHeight: 1.35,
                  }}
                >
                  {currentTurn.response_text}
                </div>
              )}

              {currentTurn?.response_image && (
                <img
                  src={currentTurn.response_image}
                  alt="Proof Attachment"
                  onClick={() => setSelectedLightboxImage(currentTurn.response_image!)}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "120px",
                    borderRadius: "10px",
                    objectFit: "cover",
                    cursor: "pointer",
                    display: "block",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                />
              )}
            </div>

            {/* Voting Action Buttons (Approve / Reject) */}
            <div style={{ display: "flex", gap: "10px", width: "100%" }}>
              <button
                type="button"
                disabled={isApproving || isRejecting}
                onClick={handleApproveClick}
                className="oura-btn-primary"
                style={{
                  flex: 1,
                  height: "46px",
                  fontSize: "0.92rem",
                  opacity: isApproving ? 0.75 : 1,
                  cursor: isApproving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                {isApproving ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Loader2 size={16} className="animate-spin" />
                    <span>Approving...</span>
                  </div>
                ) : (
                  <>
                    <ThumbsUp size={16} />
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isApproving || isRejecting}
                onClick={handleRejectClick}
                className="oura-btn-secondary"
                style={{
                  flex: 1,
                  height: "46px",
                  fontSize: "0.92rem",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  background: "rgba(239, 68, 68, 0.12)",
                  color: "#EF4444",
                  opacity: isRejecting ? 0.75 : 1,
                  cursor: isRejecting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                {isRejecting ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Loader2 size={16} className="animate-spin" />
                    <span>Rejecting...</span>
                  </div>
                ) : (
                  <>
                    <ThumbsDown size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SUBMIT PROOF POPUP MODAL */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !isSubmitting && setShowSubmitModal(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              boxSizing: "border-box",
            }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxHeight: "90%",
                background: "#15171E",
                borderTopLeftRadius: "28px",
                borderTopRightRadius: "28px",
                borderTop: "1px solid rgba(255, 255, 255, 0.12)",
                padding: "20px 20px 32px 20px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                overflowY: "auto",
              }}
            >
              {/* Top Drag Indicator Handle */}
              <div
                style={{
                  width: "36px",
                  height: "4px",
                  borderRadius: "2px",
                  background: "#6B7280",
                  opacity: 0.6,
                  margin: "0 auto 4px auto",
                }}
              />

              {/* Modal Header */}
              <div
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#F4F1EC" }}>
                  Submit Proof
                </div>
                <button
                  type="button"
                  onClick={() => !isSubmitting && setShowSubmitModal(false)}
                  className="oura-icon-btn"
                  title="Close Modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Body */}
              <form
                onSubmit={handleFormSubmit}
                style={{ display: "flex", flexDirection: "column", gap: "16px" }}
              >
                {errorMsg && (
                  <div
                    style={{
                      background: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#EF4444",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    ⚠️ {errorMsg}
                  </div>
                )}

                {/* Answer Text Input */}
                <div>
                  <label
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "#9DA4B0",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    {isTruth ? "Your Answer" : "Challenge Response"}
                  </label>
                  <textarea
                    rows={3}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder={
                      isTruth
                        ? "Type your honest answer..."
                        : "Describe how you completed the dare..."
                    }
                    style={{
                      width: "100%",
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "16px",
                      padding: "12px 14px",
                      color: "#F4F1EC",
                      fontSize: "0.95rem",
                      outline: "none",
                      resize: "none",
                    }}
                  />
                </div>

                {/* Photo Proof Attachment */}
                <div>
                  <label
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "#9DA4B0",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Photo Proof (Optional)
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />

                  {responseImage ? (
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        maxHeight: "180px",
                        borderRadius: "16px",
                        overflow: "hidden",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                      }}
                    >
                      <img
                        src={responseImage}
                        alt="Proof"
                        style={{ width: "100%", height: "180px", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={() => setResponseImage(null)}
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          background: "rgba(0, 0, 0, 0.75)",
                          color: "#FFF",
                          border: "none",
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        width: "100%",
                        height: "76px",
                        borderRadius: "16px",
                        border: "2px dashed rgba(255, 255, 255, 0.15)",
                        background: "rgba(255, 255, 255, 0.03)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        color: "#9DA4B0",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                      }}
                    >
                      <Camera size={20} color="#38BDF8" />
                      <span>Tap to attach photo proof</span>
                    </button>
                  )}
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="oura-btn-primary"
                  style={{
                    marginTop: "8px",
                    opacity: isSubmitting ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Submit Proof</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL SCREEN IMAGE LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedLightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedLightboxImage(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.92)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              boxSizing: "border-box",
            }}
          >
            <button
              onClick={() => setSelectedLightboxImage(null)}
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFF",
                cursor: "pointer",
                zIndex: 10000,
              }}
            >
              <X size={24} />
            </button>

            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedLightboxImage}
              alt="Full Preview"
              style={{
                maxWidth: "92%",
                maxHeight: "82vh",
                borderRadius: "20px",
                objectFit: "contain",
                boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
