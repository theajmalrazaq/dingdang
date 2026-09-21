import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Room, GameTurn, ChatMessage } from "./types";
import {
  HomeJoinView,
  Lobby,
  GameCard,
  TurnChoiceModal,
  RoomInfoModal,
  BottomNavBar,
  ChatScreen,
  SettingsScreen,
} from "./components";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import { useGameStore } from "./store/useGameStore";

export function App() {
  const {
    screen,
    activeTab,
    unreadCount,
    user,
    room,
    players,
    currentTurn,
    messages,
    timeLeft,
    isAdvancing,
    showRoomInfo,
    showChat,
    toastMessage,

    initUser,
    updateUser,
    setScreen,
    setActiveTab,
    setRoom,
    setPlayers,
    setCurrentTurn,
    setTurnHistory,
    setMessages,
    decrementTimer,
    resetTimer,
    setIsSelectingPrompt,
    setIsAdvancing,
    setShowRoomInfo,
    setShowChat,
    showNotification,
    restoreSession,
    fetchSupabaseRoomData,
    fetchRoomPlayers,
    createRoom,
    joinRoom,
    toggleReady,
    selectTurnType,
    submitTurnResponse,
    advanceToNextTurn,
    leaveRoom,
  } = useGameStore();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize user & session on mount
  useEffect(() => {
    initUser();
    restoreSession();
  }, []);

  // Sync state with Supabase Realtime Channel
  useEffect(() => {
    if (!room || !isSupabaseConfigured) return;

    fetchSupabaseRoomData(room.id);

    const channel = supabase
      .channel(`room_sync_${room.id}`, {
        config: {
          presence: { key: user.id },
        },
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${room.id}` },
        (payload) => {
          if (payload.eventType === "DELETE" || payload.new?.status === "finished") {
            showNotification("📢 The room host has left. The room has been closed.");
            setRoom(null);
            setPlayers([]);
            setCurrentTurn(null);
            setScreen("home");
            localStorage.removeItem("dingdang_active_room_code");
            return;
          }

          if (payload.new) {
            const updatedRoom = payload.new as Room;
            setRoom((prev) => (prev ? { ...prev, ...updatedRoom } : updatedRoom));
            if (updatedRoom.status === "playing" && screen === "lobby") {
              setScreen("game");
            }
          }
        },
      )
      .on("broadcast", { event: "CHAT_SETTINGS_UPDATED" }, (payload) => {
        if (payload.payload) {
          setRoom((prev) =>
            prev
              ? {
                  ...prev,
                  disappearing_chat_enabled: payload.payload.disappearing_chat_enabled,
                  disappearing_chat_timer: payload.payload.disappearing_chat_timer,
                }
              : null,
          );
        }
      })
      .on("broadcast", { event: "TURN_SUBMITTED" }, (payload) => {
        if (payload.payload) {
          setCurrentTurn((prev) =>
            prev
              ? {
                  ...prev,
                  response_text: payload.payload.response_text,
                  response_image: payload.payload.response_image,
                  status: "pending",
                }
              : null,
          );
        }
      })
      .on("broadcast", { event: "TURN_ADVANCED" }, (payload) => {
        setIsAdvancing(false);
        setCurrentTurn(null);
        setIsSelectingPrompt(false);
        if (payload.payload?.nextPlayerId) {
          setRoom((prev) =>
            prev ? { ...prev, current_player_id: payload.payload.nextPlayerId } : null,
          );
        }
        if (payload.payload?.activePlayerId && payload.payload?.pointsEarned !== undefined) {
          setPlayers((prev) =>
            prev.map((p) =>
              p.user_id === payload.payload.activePlayerId
                ? { ...p, score: Math.max(0, (p.score || 0) + payload.payload.pointsEarned) }
                : p,
            ),
          );
        }
        if (room?.id) {
          fetchRoomPlayers(room.id);
        }
      })
      .on("broadcast", { event: "PLAYER_LEFT" }, (payload) => {
        if (payload.payload?.userId) {
          showNotification(`${payload.payload.username || "A player"} left the room`);
          setPlayers((prev) => prev.filter((p) => p.user_id !== payload.payload.userId));
        }
      })
      .on("broadcast", { event: "ROOM_DESTROYED" }, () => {
        showNotification("The room host left. Room has closed.");
        setRoom(null);
        setPlayers([]);
        setCurrentTurn(null);
        setScreen("home");
        localStorage.removeItem("dingdang_active_room_code");
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "room_players" }, () => {
        fetchRoomPlayers(room.id);
      })
      .on("presence", { event: "join" }, () => {
        if (room?.id) {
          fetchRoomPlayers(room.id);
        }
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_turns", filter: `room_id=eq.${room.id}` },
        (payload) => {
          if (payload.new) {
            const updatedTurn = payload.new as GameTurn;
            if (updatedTurn.status === "pending" || updatedTurn.status === "submitted") {
              setCurrentTurn((prev) => {
                if (!prev && updatedTurn.status !== "pending") return null;
                return prev ? { ...prev, ...updatedTurn } : updatedTurn;
              });
            }
            if (payload.eventType === "INSERT") {
              setTurnHistory((prev) => [updatedTurn, ...prev]);
              resetTimer();
            }
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${room.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        },
      )
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            username: user.username,
            avatar: user.avatar,
            online_at: new Date().toISOString(),
          });
          if (room?.id) {
            fetchRoomPlayers(room.id);
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id, screen]);

  // Turn timer countdown effect
  useEffect(() => {
    if (screen !== "game" || !currentTurn || currentTurn.status !== "pending") return;

    timerRef.current = setInterval(() => {
      decrementTimer();
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen, currentTurn?.id, currentTurn?.status]);

  // Turn timeout effect
  useEffect(() => {
    if (screen !== "game" || !currentTurn || currentTurn.status !== "pending" || timeLeft !== 0)
      return undefined;
    if (isAdvancing) return undefined;

    const activeTurnPlayerId = currentTurn.player_id || room?.current_player_id;
    const isMyTurnNow = Boolean(activeTurnPlayerId && activeTurnPlayerId === user.id);
    const isHost =
      room?.created_by === user.id || (players.length > 0 && players[0]?.user_id === user.id);

    const delay = isMyTurnNow ? 0 : isHost ? 2000 : -1;
    if (delay < 0) return undefined;

    const timer = setTimeout(() => {
      if (!useGameStore.getState().isAdvancing) {
        advanceToNextTurn(0);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [timeLeft, screen, currentTurn?.id, currentTurn?.status]);

  // Return to lobby if players drop below 2
  useEffect(() => {
    if (screen === "game" && room && players.length < 2) {
      showNotification("A player left. Returning to lobby (need 2+ players).");
      setScreen("lobby");
      if (isSupabaseConfigured) {
        supabase.from("rooms").update({ status: "lobby" }).eq("id", room.id);
      }
      setRoom((prev) => (prev ? { ...prev, status: "lobby" } : null));
    }
  }, [players.length, screen, room?.id]);

  const handleStartGame = async () => {
    if (!room || players.length < 2) {
      showNotification("Need at least 2 players to start game.");
      return;
    }
    const unreadyPlayers = players.filter((p) => !p.is_ready);
    if (unreadyPlayers.length > 0) {
      showNotification(
        `Waiting for ${unreadyPlayers.map((p) => p.username).join(", ")} to be ready.`,
      );
      return;
    }

    if (isSupabaseConfigured) {
      await supabase
        .from("rooms")
        .update({ status: "playing", current_player_id: players[0].user_id })
        .eq("id", room.id);
    }

    setRoom((prev) =>
      prev ? { ...prev, status: "playing", current_player_id: players[0].user_id } : null,
    );
    setScreen("game");
  };

  const handleSendMessage = async (text: string, isImage: boolean = false) => {
    if (!room || !isSupabaseConfigured) return;
    await supabase.from("messages").insert({
      room_id: room.id,
      sender_id: user.id,
      sender_name: user.username,
      content: isImage ? "" : text,
      image_url: isImage ? text : undefined,
    });
  };

  const handleToggleDisappearingChat = async (enabled: boolean, timer?: number) => {
    if (!room || !isSupabaseConfigured) return;
    const newTimer = timer ?? room.disappearing_chat_timer ?? 30;

    try {
      await supabase
        .from("rooms")
        .update({
          disappearing_chat_enabled: enabled,
          disappearing_chat_timer: newTimer,
        })
        .eq("id", room.id);

      const channel = supabase.channel(`room_sync_${room.id}`);
      await channel.send({
        type: "broadcast",
        event: "CHAT_SETTINGS_UPDATED",
        payload: { disappearing_chat_enabled: enabled, disappearing_chat_timer: newTimer },
      });
    } catch (e) {
      console.error("Supabase update room disappearing chat failed", e);
    }

    setRoom((prev) =>
      prev
        ? {
            ...prev,
            disappearing_chat_enabled: enabled,
            disappearing_chat_timer: newTimer,
          }
        : null,
    );
  };

  // Turn status & player derivation
  const isTurnActive = Boolean(
    currentTurn && (currentTurn.status === "pending" || currentTurn.status === "submitted"),
  );
  const activeTurnPlayerId = isTurnActive ? currentTurn?.player_id : room?.current_player_id;
  const activePlayer = players.find((p) => p.user_id === activeTurnPlayerId) || players[0];
  const isMyTurn = Boolean(activeTurnPlayerId && activeTurnPlayerId === user.id);

  return (
    <div className="app-wrapper">
      <AnimatePresence mode="wait">
        {screen === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ width: "100%", height: "100%" }}
          >
            <HomeJoinView
              user={user}
              onUpdateUser={updateUser}
              onCreateRoom={createRoom}
              onJoinRoom={joinRoom}
            />
          </motion.div>
        )}

        {(screen === "lobby" || screen === "game") &&
          room &&
          activeTab === "home" &&
          screen === "lobby" && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ width: "100%", height: "100%" }}
            >
              <Lobby
                room={room}
                players={players}
                currentUserId={user.id}
                unreadCount={messages.length}
                onStartGame={handleStartGame}
                onExitRoom={leaveRoom}
                onToggleReady={toggleReady}
                onOpenInfo={() => setActiveTab("settings")}
                onOpenChat={() => setActiveTab("chat")}
              />
            </motion.div>
          )}

        {(screen === "lobby" || screen === "game") &&
          room &&
          activeTab === "home" &&
          screen === "game" && (
            <motion.div
              key="game"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ width: "100%", height: "100%" }}
            >
              <GameCard
                currentTurn={isTurnActive ? currentTurn : null}
                activePlayer={activePlayer}
                isMyTurn={isMyTurn}
                currentUserId={user.id}
                timeLeft={timeLeft}
                maxTime={room.timer_seconds}
                unreadCount={messages.length}
                onSubmitResponse={submitTurnResponse}
                onApprove={() => advanceToNextTurn(10)}
                onReject={() => advanceToNextTurn(-5)}
                onSkip={() => advanceToNextTurn(0)}
                onOpenInfo={() => setActiveTab("settings")}
                onOpenChat={() => setActiveTab("chat")}
                onOpenScoreboard={() => setShowRoomInfo(true)}
                onExit={leaveRoom}
              />
            </motion.div>
          )}

        {/* Full Screen Chat Page */}
        {(screen === "lobby" || screen === "game") && room && activeTab === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ width: "100%", height: "100%" }}
          >
            <ChatScreen
              messages={messages}
              players={players}
              currentUserId={user.id}
              onSendMessage={handleSendMessage}
              disappearingEnabled={room.disappearing_chat_enabled !== false}
              disappearingTimer={room.disappearing_chat_timer || 30}
              onToggleDisappearingChat={handleToggleDisappearingChat}
            />
          </motion.div>
        )}

        {/* Full Screen Settings Page */}
        {(screen === "lobby" || screen === "game") && room && activeTab === "settings" && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ width: "100%", height: "100%" }}
          >
            <SettingsScreen
              room={room}
              players={players}
              currentUserId={user.id}
              onLeaveRoom={leaveRoom}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Navigation Bar */}
      {(screen === "lobby" || screen === "game") && room && (
        <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} unreadCount={unreadCount} />
      )}

      {/* Choice Modal (Rendered whenever it's your turn and no active challenge is pending/submitted) */}
      {screen === "game" && room && !isTurnActive && isMyTurn && (
        <TurnChoiceModal playerName={user.username} onSelectType={selectTurnType} />
      )}

      {/* Room Details & Leaderboard Modal */}
      {showRoomInfo && room && (
        <RoomInfoModal room={room} players={players} onClose={() => setShowRoomInfo(false)} />
      )}

      {/* Dynamic Player Departure / Disconnect Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            style={{
              position: "absolute",
              top: "20px",
              left: 0,
              right: 0,
              margin: "0 auto",
              width: "fit-content",
              zIndex: 9999,
              background: "rgba(24, 27, 36, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              color: "#F4F1EC",
              padding: "12px 20px",
              borderRadius: "24px",
              fontSize: "0.88rem",
              fontWeight: 600,
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.45)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
