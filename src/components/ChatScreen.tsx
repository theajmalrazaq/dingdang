import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage, RoomPlayer } from "../types";
import { Send, Image, SlidersHorizontal, Clock, X, MessageSquare, Loader2 } from "lucide-react";
import { AppleEmoji } from "./AppleEmoji";
import { compressImage } from "../lib/imageCompressor";

import { useGameStore } from "../store/useGameStore";

interface ChatScreenProps {
  messages: ChatMessage[];
  players?: RoomPlayer[];
  currentUserId: string;
  onSendMessage: (text: string, isImage?: boolean) => void | Promise<void>;
  disappearingEnabled?: boolean;
  disappearingTimer?: number;
  onToggleDisappearingChat?: (enabled: boolean, timer?: number) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  messages,
  players = [],
  currentUserId,
  onSendMessage,
  disappearingEnabled = true,
  disappearingTimer = 30,
  onToggleDisappearingChat,
}) => {
  const {
    showChatSettings: showSettings,
    setShowChatSettings: setShowSettings,
    selectedImagePreview,
    setSelectedImagePreview,
  } = useGameStore();

  const [inputText, setInputText] = useState("");
  const [now, setNow] = useState(Date.now());
  const [bottomOffset, setBottomOffset] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- Disappearing messages timer ---
  useEffect(() => {
    if (!disappearingEnabled) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
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

  // --- Auto-scroll to bottom on new messages ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages.length]);

  // --- Mobile keyboard detection via visualViewport ---
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      const isKb = window.innerHeight - vv.height > 100;
      setIsKeyboardOpen(isKb);
      setViewportHeight(isKb ? vv.height : null);
      if (isKb) {
        requestAnimationFrame(() => {
          chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        });
      }
    };

    vv.addEventListener("resize", handleResize);
    return () => vv.removeEventListener("resize", handleResize);
  }, []);

  // --- File upload / image compression ---
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsSending(true);
      try {
        const compressedBase64 = await compressImage(file, 600, 600, 0.7);
        if (compressedBase64) {
          await onSendMessage(compressedBase64, true);
        }
      } catch (err) {
        console.error("Failed to compress chat image:", err);
      } finally {
        setIsSending(false);
      }
      e.target.value = "";
    },
    [onSendMessage],
  );

  // --- Send message ---
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    const textToSend = inputText.trim();
    setInputText("");
    setIsSending(true);
    try {
      await onSendMessage(textToSend);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          margin: "0 auto",
          height: viewportHeight ? `${viewportHeight}px` : "100dvh",
          background:
            "radial-gradient(circle at 50% 0%, var(--bg-gradient-top) 0%, var(--bg-dark) 35%, var(--bg-bottom) 100%)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 50,
        }}
      >
        {/* ─── Header ─── */}
        <div className="oura-header">
          <div style={{ width: 36 }} /> {/* Spacer for centering */}
          <div className="oura-header-title">Room Chat</div>
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

        {/* ─── Collapsible Settings Panel ─── */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ overflow: "hidden", flexShrink: 0, background: "transparent" }}
            >
              <div style={{ padding: "12px 20px 16px 20px" }}>
                <div
                  style={{
                    background: "rgba(22, 24, 32, 0.7)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderRadius: "20px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow:
                      "0 12px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset",
                    overflow: "hidden",
                  }}
                >
                  {/* Disappearing Messages Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 20px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "0.98rem",
                          fontWeight: 700,
                          color: "#F4F1EC",
                        }}
                      >
                        Disappearing Messages
                      </div>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          color: "#8E95A2",
                          marginTop: "3px",
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
                        padding: "8px 20px",
                        borderRadius: "9999px",
                        border: "none",
                        background: disappearingEnabled ? "#9CAEFF" : "rgba(255, 255, 255, 0.08)",
                        color: disappearingEnabled ? "#0E1014" : "#8E95A2",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {disappearingEnabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>

                  {/* Expiry Timer Selector */}
                  {disappearingEnabled && (
                    <div
                      style={{
                        padding: "16px 20px 20px 20px",
                        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          color: "#F4F1EC",
                          marginBottom: "12px",
                        }}
                      >
                        Message Expiry Timer
                      </div>
                      <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                        {[
                          { label: "15s", value: 15 },
                          { label: "30s", value: 30 },
                          { label: "1m", value: 60 },
                          { label: "5m", value: 300 },
                        ].map((t) => {
                          const isActive = disappearingTimer === t.value;
                          return (
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
                                height: "44px",
                                borderRadius: "14px",
                                border: isActive
                                  ? "1px solid #9CAEFF"
                                  : "1px solid rgba(255, 255, 255, 0.08)",
                                background: isActive
                                  ? "rgba(156, 174, 255, 0.18)"
                                  : "rgba(255, 255, 255, 0.03)",
                                color: isActive ? "#9CAEFF" : "#8E95A2",
                                fontWeight: isActive ? 700 : 600,
                                fontSize: "0.88rem",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {t.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Disappearing Messages Indicator Banner ─── */}
        {disappearingEnabled && (
          <div
            style={{
              textAlign: "center",
              padding: "10px 12px 12px 12px",
              color: "#8E95A2",
              fontSize: "0.82rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              flexShrink: 0,
            }}
          >
            <Clock size={15} color="#8E95A2" />
            <span>
              Disappearing messages active (
              {disappearingTimer >= 60 ? `${disappearingTimer / 60}m` : `${disappearingTimer}s`}{" "}
              timer)
            </span>
          </div>
        )}

        {/* ─── Message Stream ─── */}
        <div
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px 16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            WebkitOverflowScrolling: "touch",
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
              <MessageSquare size={32} color="#9CA3AF" style={{ margin: "0 auto 12px auto" }} />
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
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
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
                  {/* Avatar */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
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

                  {/* Message Bubble */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isMe ? "flex-end" : "flex-start",
                    }}
                  >
                    {/* Sender name header */}
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

                    {/* Bubble */}
                    <div
                      style={{
                        padding: msg.image_url ? "6px" : "10px 14px",
                        borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        background: isMe
                          ? "rgba(156, 163, 175, 0.15)"
                          : "rgba(255, 255, 255, 0.06)",
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

                    {/* Timestamp */}
                    {msg.created_at && (
                      <div
                        style={{
                          fontSize: "0.68rem",
                          color: "#4B5563",
                          marginTop: "4px",
                          paddingLeft: isMe ? 0 : "4px",
                          paddingRight: isMe ? "4px" : 0,
                        }}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* ─── Floating Input Bar ─── */}
        <div
          style={{
            flexShrink: 0,
            padding: isKeyboardOpen
              ? "8px 16px 12px 16px"
              : "8px 16px calc(max(16px, env(safe-area-inset-bottom, 16px)) + 64px) 16px",
            zIndex: 60,
            transition: "padding 0.15s ease-out",
          }}
        >
          <form
            onSubmit={handleSend}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#111216",
              borderRadius: "28px",
              padding: "5px 6px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow:
                "0 12px 32px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.04) inset",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/* Image upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach Image"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "none",
                color: "#9CA3AF",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: "50%",
                flexShrink: 0,
                transition: "all 0.15s ease",
              }}
            >
              <Image size={18} color="#F4F1EC" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            {/* Text input */}
            <input
              type="text"
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSending}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#F4F1EC",
                fontSize: "0.92rem",
                fontFamily: "inherit",
                padding: "6px 4px",
              }}
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              style={{
                background: isSending
                  ? "rgba(255, 255, 255, 0.12)"
                  : inputText.trim()
                    ? "#9CAEFF"
                    : "rgba(255, 255, 255, 0.08)",
                border: "none",
                color: inputText.trim() && !isSending ? "#0E1014" : "#6B7280",
                cursor: inputText.trim() && !isSending ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: "50%",
                flexShrink: 0,
                transition: "all 0.15s ease",
                opacity: isSending ? 0.7 : 1,
              }}
            >
              {isSending ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                  color={inputText.trim() ? "#0E1014" : "#9CA3AF"}
                />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>

          <div
            style={{
              textAlign: "center",
              fontSize: "0.72rem",
              color: "#4B5563",
              marginTop: "8px",
            }}
          >
            Messages are synced live across all players in real-time.
          </div>
        </div>
      </div>

      {/* ─── Full-Screen Image Lightbox ─── */}
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
              background: "rgba(0, 0, 0, 0.92)",
              backdropFilter: "blur(12px)",
              zIndex: 200,
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
                top: "calc(env(safe-area-inset-top, 0px) + 20px)",
                right: "20px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                color: "#fff",
                width: 40,
                height: 40,
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
