import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";
import { Info, Loader2 } from "lucide-react";
import { AppleEmoji } from "./AppleEmoji";

import "swiper/css";
import "swiper/css/effect-coverflow";

interface HomeJoinViewProps {
  user: { id: string; username: string; avatar: string };
  onUpdateUser: (username: string, avatar: string) => void;
  onCreateRoom: (
    overrideUser?: { username: string; avatar: string },
  ) => Promise<void> | void;
  onJoinRoom: (
    code: string,
    overrideUser?: { username: string; avatar: string },
  ) => Promise<void> | void;
}

const AVATAR_OPTIONS = [
  "😜",
  "😎",
  "🥳",
  "🤠",
  "🤪",
  "🐶",
  "🐱",
  "🦊",
  "🐼",
  "🦁",
  "🐸",
  "🐵",
  "🤖",
  "🦖",
  "🦄",
  "👑",
  "🚀",
  "🎮",
  "🎸",
  "🛹",
  "🍕",
  "🍩",
  "🌟",
  "🎉",
  "🔥",
];

export const HomeJoinView: React.FC<HomeJoinViewProps> = ({
  user,
  onUpdateUser,
  onCreateRoom,
  onJoinRoom,
}) => {
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");
  const [usernameInput, setUsernameInput] = useState(user.username || "");
  const [avatarInput, setAvatarInput] = useState(user.avatar || "😜");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const initialIndex = Math.max(0, AVATAR_OPTIONS.indexOf(avatarInput));

  const handleContinue = async () => {
    const finalName = usernameInput.trim() || "Player";
    const updatedUser = { username: finalName, avatar: avatarInput };
    onUpdateUser(finalName, avatarInput);

    try {
      setIsLoading(true);
      if (mode === "create") {
        await onCreateRoom(updatedUser);
      } else if (mode === "join") {
        if (roomCodeInput.trim().length > 0) {
          await onJoinRoom(roomCodeInput.trim().toUpperCase(), updatedUser);
        }
      }
    } catch (err) {
      console.error("Failed to create/join room:", err);
    } finally {
      setIsLoading(false);
    }
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
        <div style={{ width: "40px" }} />
        <div className="oura-header-title">Ding Dang</div>
        <div style={{ width: "40px" }} />
      </div>

      {/* Main Content Scroll Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 24px 100px 24px" }}>
        {/* Large Display Title */}
        <h1 className="oura-screen-title">Set up your game session</h1>

        {/* Secondary Info Pill Button */}
        <div className="oura-tag-pill">
          <Info size={15} />
          <span>Real-time multiplayer</span>
        </div>

        {/* SWIPER APPLE 3D EMOJI SLIDER */}
        <div style={{ margin: "8px 0 20px 0", width: "100%", height: "105px" }}>
          <Swiper
            effect={"coverflow"}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={5}
            initialSlide={initialIndex}
            loop={true}
            loopAdditionalSlides={5}
            coverflowEffect={{
              rotate: 0,
              stretch: -20,
              depth: 40,
              modifier: 1,
              slideShadows: false,
            }}
            onSlideChange={(swiper) => {
              const selectedAvatar = AVATAR_OPTIONS[swiper.realIndex];
              if (selectedAvatar) setAvatarInput(selectedAvatar);
            }}
            modules={[EffectCoverflow]}
            style={{ width: "100%", height: "100%" }}
          >
            {AVATAR_OPTIONS.map((emoji, index) => {
              const isSelected = emoji === avatarInput;

              return (
                <SwiperSlide
                  key={`${emoji}-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "transparent",
                  }}
                >
                  <button
                    onClick={() => setAvatarInput(emoji)}
                    style={{
                      width: isSelected ? "84px" : "44px",
                      height: isSelected ? "84px" : "44px",
                      borderRadius: "50%",
                      border: "none",
                      background: "transparent",
                      opacity: isSelected ? 1 : 0.35,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                      outline: "none",
                      transform: isSelected ? "translateY(-4px)" : "translateY(0)",
                    }}
                  >
                    <AppleEmoji emoji={emoji} size={isSelected ? 68 : 34} />
                  </button>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* Section 1: Player Info */}
        <div className="section-label" style={{ marginTop: "0" }}>
          Player info
        </div>
        <div className="oura-card-group">
          <div
            className="oura-card-item"
            style={{ flexDirection: "column", alignItems: "stretch", gap: "4px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span className="oura-card-title">Display name</span>
              <input
                type="text"
                placeholder="Enter name (2-16 chars)"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                maxLength={16}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#F4F1EC",
                  fontSize: "1rem",
                  fontWeight: 600,
                  textAlign: "right",
                  fontFamily: "var(--font-body)",
                }}
              />
            </div>
            {usernameInput.length > 0 &&
              (usernameInput.trim().length < 2 || usernameInput.trim().length > 16) && (
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#F87171",
                    textAlign: "right",
                    fontWeight: 500,
                  }}
                >
                  Username must be between 2 and 16 characters
                </div>
              )}
          </div>
        </div>

        {/* Section 2: Session Mode */}
        <div className="section-label">Session mode</div>
        <div className="oura-card-group">
          <div
            className={`oura-card-item ${mode === "create" ? "selected" : ""}`}
            onClick={() => setMode("create")}
            style={{ cursor: "pointer" }}
          >
            <span className="oura-card-title">Create new room</span>
            <span className={mode === "create" ? "oura-card-value" : "oura-card-status-blue"}>
              {mode === "create" ? "Host" : "Available"}
            </span>
          </div>

          <div
            className={`oura-card-item ${mode === "join" ? "selected" : ""}`}
            onClick={() => setMode("join")}
            style={{ cursor: "pointer" }}
          >
            <span className="oura-card-title">Join existing room</span>
            <span className={mode === "join" ? "oura-card-value" : "oura-card-status-blue"}>
              {mode === "join" ? "Selected" : "Available"}
            </span>
          </div>
        </div>

        {mode === "join" && (
          <div className="oura-card-group">
            <div className="oura-card-item">
              <span className="oura-card-title">Room code</span>
              <input
                type="text"
                placeholder="E.G. A1B2"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                maxLength={6}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#F4F1EC",
                  fontSize: "1rem",
                  fontWeight: 600,
                  textAlign: "right",
                  letterSpacing: "0.12em",
                  fontFamily: "var(--font-body)",
                }}
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Primary CTA Cream Pill Button Pinned at Bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 24px 28px 24px",
          background: "linear-gradient(to top, var(--bg-bottom) 70%, transparent 100%)",
          zIndex: 25,
        }}
      >
        <button
          className="oura-btn-primary"
          onClick={handleContinue}
          disabled={
            isLoading ||
            mode === "menu" ||
            usernameInput.trim().length < 2 ||
            usernameInput.trim().length > 16 ||
            (mode === "join" && !roomCodeInput.trim())
          }
          style={{
            opacity:
              isLoading ||
              mode === "menu" ||
              usernameInput.trim().length < 2 ||
              usernameInput.trim().length > 16 ||
              (mode === "join" && !roomCodeInput.trim())
                ? 0.4
                : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "opacity 0.2s ease",
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>{mode === "create" ? "Creating room..." : "Joining room..."}</span>
            </>
          ) : (
            <span>Continue</span>
          )}
        </button>
      </div>
    </div>
  );
};
