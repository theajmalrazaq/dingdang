import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChatMessage, RoomPlayer } from "../types";
import { X, Send, Image, SlidersHorizontal, MessageSquare, Clock } from "lucide-react";
import { AppleEmoji } from "./AppleEmoji";
import { compressImage } from "../lib/imageCompressor";

interface ChatDockDrawerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  messages: ChatMessage[];
  players?: RoomPlayer[];
  currentUserId: string;
  onSendMessage: (text: string, isImage?: boolean) => void;
  timeLeft?: number;
  leftText?: string;
  disappearingEnabled?: boolean;
  disappearingTimer?: number;
  onToggleDisappearingChat?: (enabled: boolean, timer?: number) => void;
}

export const ChatDockDrawer: React.FC<ChatDockDrawerProps> = ({
  isOpen,
  onOpen,
  onClose,
  messages,
  players = [],
  currentUserId,
  onSendMessage,
  timeLeft,
  leftText,
  disappearingEnabled = true,
  disappearingTimer = 30,
  onToggleDisappearingChat,
}) => {
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedBase64 = await compressImage(file, 600, 600, 0.7);
      if (compressedBase64) {
        onSendMessage(compressedBase64, true);
      }
    } catch (err) {
      console.error("Failed to compress chat image:", err);
    }
    e.target.value = "";
  };

  useEffect(() => {
    if (!disappearingEnabled) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [disappearingEnabled]);

  const visibleMessages = disappearingEnabled
    ? messages.filter((msg) => {
        if (!msg.created_at) return true;
        const msgTime = new Date(msg.created_at).getTime();
        if (isNaN(msgTime)) return true;
        return now - msgTime < disappearingTimer * 1000;
      })
    : messages;

  const unreadCount = visibleMessages.length;

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (!isOpen) {
      if (info.offset.y < -25 || info.velocity.y < -80) {
        if ((window as any).__triggerRipple) {
          (window as any).__triggerRipple(window.innerWidth / 2, window.innerHeight - 80);
        }
        onOpen();
      }
    } else {
      if (info.offset.y > 40 || info.velocity.y > 100) {
        onClose();
      }
    }
  };

  return (
    <>
      {/* Background Dimmed Overlay when expanded */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="oura-drawer-overlay"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ zIndex: 96 }}
          />
        )}
      </AnimatePresence>

      {/* Main Unified Container Sheet (Bounded within mobile frame) */}
      <motion.div
        className="oura-chat-sheet-unified"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          maxWidth: "440px",
          margin: "0 auto",
          height: "85%",
          borderTopLeftRadius: "28px",
          borderTopRightRadius: "28px",
          background: "#15171E",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.5)",
          zIndex: isOpen ? 98 : 90,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          willChange: "transform",
          touchAction: "none",
        }}
        initial={{ y: "88%" }}
        animate={{ y: isOpen ? "0%" : "88%" }}
        transition={{ type: "spring", stiffness: 400, damping: 36, mass: 0.5 }}
        drag="y"
        dragConstraints={isOpen ? { top: 0, bottom: 0 } : { top: 0, bottom: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
      >
        {/* Top Drag Indicator Handle */}
        <div
          className="oura-dock-drag-handle"
          style={{
            margin: "8px auto 8px auto",
            cursor: "grab",
            width: "36px",
            height: "4px",
            borderRadius: "2px",
            background: "#6B7280",
            opacity: 0.6,
            flexShrink: 0,
          }}
        />

        {/* Collapsed Dock Controls Bar (Visible at top of the sheet) */}
        <div
          className="oura-dock-controls"
          onClick={(e) => {
            if (!isOpen) {
              e.stopPropagation();
              onOpen();
            }
          }}
          style={{
            padding: "0 16px 10px 16px",
            flexShrink: 0,
            cursor: isOpen ? "default" : "pointer",
          }}
        >
          {/* Left Info / Timer Pill */}
          <div className="oura-dock-pill">
            <span
              style={{
                fontSize: timeLeft !== undefined ? "1.15rem" : "0.95rem",
                fontFamily: timeLeft !== undefined ? "monospace" : "inherit",
                fontWeight: 700,
              }}
            >
              {timeLeft !== undefined ? formatTime(timeLeft) : leftText || "Lobby"}
            </span>
          </div>

          {/* Right Chat Pill */}
          <div className="oura-dock-pill outline">
            <MessageSquare size={18} color="#9CA3AF" />
            <span>Chat</span>
            {unreadCount > 0 && (
              <span
                style={{
                  background: "#9CA3AF",
                  color: "#0E1014",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "99px",
                  marginLeft: "4px",
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Full Chat Screen Body (Directly below dock controls, emerges as you drag up!) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            width: "100%",
            overflow: "hidden",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            marginTop: "4px",
          }}
        >
          {/* Header */}
          <div className="oura-drawer-header" style={{ padding: "14px 20px", flexShrink: 0 }}>
            <button className="oura-icon-btn" onClick={onClose} title="Close Chat">
              <X size={18} />
            </button>

            <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text-primary)" }}>
              Room Chat
            </div>

            <button
              className="oura-icon-btn"
              onClick={() => setShowSettings(!showSettings)}
              title="Chat Settings"
              style={{
                background: showSettings ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.08)",
                color: showSettings ? "#F4F1EC" : "#9CA3AF",
                transition: "all 0.2s ease",
              }}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {/* Interactive Chat Settings Panel (Styled using Oura Design System Cards) */}
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ padding: "0 20px 8px 20px", flexShrink: 0 }}
            >
              <div className="oura-card-group" style={{ marginTop: "18px" }}>
                {/* Disappearing Messages Row */}
                <div className="oura-card-item">
                  <div>
                    <div className="oura-card-title">Disappearing Messages</div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        marginTop: "2px",
                      }}
                    >
                      Auto-delete messages after timer
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onToggleDisappearingChat) {
                        onToggleDisappearingChat(!disappearingEnabled, disappearingTimer);
                      }
                    }}
                    style={{
                      padding: "6px 16px",
                      borderRadius: "999px",
                      border: "none",
                      background: disappearingEnabled ? "#9CA3AF" : "rgba(255, 255, 255, 0.1)",
                      color: disappearingEnabled ? "#0E1014" : "var(--text-primary)",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {disappearingEnabled ? "Enabled" : "Disabled"}
                  </button>
                </div>

                {/* Expiry Timer Selector Row */}
                {disappearingEnabled && (
                  <div
                    className="oura-card-item"
                    style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px" }}
                  >
                    <div className="oura-card-title">Message Expiry Timer</div>
                    <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                      {[
                        { label: "15s", value: 15 },
                        { label: "30s", value: 30 },
                        { label: "1m", value: 60 },
                        { label: "5m", value: 300 },
                      ].map((t) => (
                        <button
                          type="button"
                          key={t.value}
                          onClick={() => {
                            if (onToggleDisappearingChat) {
                              onToggleDisappearingChat(true, t.value);
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: "8px 0",
                            borderRadius: "12px",
                            border:
                              disappearingTimer === t.value
                                ? "1px solid #9CA3AF"
                                : "1px solid rgba(255, 255, 255, 0.1)",
                            background:
                              disappearingTimer === t.value
                                ? "rgba(156, 163, 175, 0.15)"
                                : "rgba(255, 255, 255, 0.04)",
                            color:
                              disappearingTimer === t.value ? "#9CA3AF" : "var(--text-secondary)",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Active Disappearing Message Banner */}
          {disappearingEnabled && (
            <div
              style={{
                textAlign: "center",
                padding: "6px 12px",
                marginTop: "6px",
                marginBottom: "14px",
                color: "#9CA3AF",
                fontSize: "0.8rem",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                flexShrink: 0,
              }}
            >
              <Clock size={14} color="#9CA3AF" />
              <span>Disappearing messages active ({disappearingTimer}s timer)</span>
            </div>
          )}

          {/* Message Stream */}
          <div
            className="oura-chat-body"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {visibleMessages.length === 0 ? (
              <div
                style={{
                  margin: "auto",
                  textAlign: "center",
                  color: "#6B7280",
                  padding: "40px 20px",
                }}
              >
                <Image size={32} color="#9CA3AF" style={{ margin: "0 auto 12px auto" }} />
                <div
                  style={{
                    fontSize: "1rem",
                    color: "#F4F1EC",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                >
                  No messages yet
                </div>
                <div style={{ fontSize: "0.85rem" }}>
                  {disappearingEnabled
                    ? "Messages automatically vanish after timer!"
                    : "Start chatting with your friends in the room!"}
                </div>
              </div>
            ) : (
              visibleMessages.map((msg, index) => {
                const isMe = msg.sender_id === currentUserId;
                const prevMsg = index > 0 ? visibleMessages[index - 1] : null;
                const showSenderHeader = !isMe && (!prevMsg || prevMsg.sender_id !== msg.sender_id);
                const senderPlayer = players.find((p) => p.user_id === msg.sender_id);
                const senderAvatar = senderPlayer?.avatar || "😜";

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      flexDirection: isMe ? "row-reverse" : "row",
                      alignItems: "flex-end",
                      gap: "8px",
                      marginTop: showSenderHeader ? "10px" : "3px",
                      marginBottom: "3px",
                      maxWidth: "88%",
                      alignSelf: isMe ? "flex-end" : "flex-start",
                    }}
                  >
                    {/* Circular Apple Color Emoji Avatar */}
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      }}
                    >
                      <AppleEmoji emoji={senderAvatar} size={20} />
                    </div>

                    {/* Message Bubble + Sender Name Header */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isMe ? "flex-end" : "flex-start",
                      }}
                    >
                      {/* Sender Name above incoming message */}
                      {!isMe && showSenderHeader && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "#9CA3AF",
                            marginBottom: "7px",
                            paddingLeft: "4px",
                          }}
                        >
                          {msg.sender_name}
                        </div>
                      )}

                      {/* Bubble Box */}
                      <div
                        style={{
                          padding: msg.image_url ? "6px" : "10px 14px",
                          borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          background: isMe ? "#2A303F" : "#1E212B",
                          border: isMe
                            ? "1px solid rgba(156, 163, 175, 0.2)"
                            : "1px solid rgba(255, 255, 255, 0.07)",
                          color: "#F4F1EC",
                          fontSize: "0.92rem",
                          lineHeight: "1.4",
                          wordBreak: "break-word",
                        }}
                      >
                        {msg.image_url && (
                          <img
                            src={msg.image_url}
                            alt="Attachment"
                            onClick={() => setSelectedImagePreview(msg.image_url!)}
                            style={{
                              width: "100%",
                              maxWidth: "220px",
                              maxHeight: "220px",
                              borderRadius: "12px",
                              objectFit: "cover",
                              display: "block",
                              cursor: "pointer",
                              transition: "transform 0.15s ease",
                            }}
                          />
                        )}

                        {msg.content && msg.content !== "[Image Attachment]" && (
                          <div style={{ marginTop: msg.image_url ? "6px" : 0 }}>{msg.content}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer Pill Input */}
          <div className="oura-chat-footer" style={{ flexShrink: 0 }}>
            <form onSubmit={handleSend} className="oura-input-bar">
              {/* Image Upload Icon Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach Image"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9CA3AF",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px",
                }}
              >
                <Image size={20} color="#9CA3AF" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              <input
                type="text"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                autoFocus={isOpen}
              />
              <button
                type="submit"
                style={{
                  background: "transparent",
                  border: "none",
                  color: inputText.trim() ? "#9CA3AF" : "#6B7280",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Send size={18} color={inputText.trim() ? "#9CA3AF" : "#6B7280"} />
              </button>
            </form>
            <div className="oura-caption">
              Messages are synced live across all players in real-time.
            </div>
          </div>
        </div>
      </motion.div>

      {/* Full-Screen Image Lightbox Preview Modal */}
      <AnimatePresence>
        {selectedImagePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImagePreview(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.9)",
              backdropFilter: "blur(12px)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <button
              onClick={() => setSelectedImagePreview(null)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                color: "#fff",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImagePreview}
              alt="Preview"
              style={{
                maxWidth: "92vw",
                maxHeight: "82vh",
                borderRadius: "16px",
                objectFit: "contain",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
