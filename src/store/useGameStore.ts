import { create } from "zustand";
import { Room, RoomPlayer, GameTurn, ChatMessage, PromptType } from "../types";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { fetchTruthOrDarePrompt } from "../lib/truthOrDareApi";

interface User {
  id: string;
  username: string;
  avatar: string;
}

interface GameStoreState {
  screen: "home" | "lobby" | "game";
  activeTab: "home" | "chat" | "settings";
  unreadCount: number;
  user: User;
  room: Room | null;
  players: RoomPlayer[];
  currentTurn: GameTurn | null;
  turnHistory: GameTurn[];
  messages: ChatMessage[];
  timeLeft: number;
  isSelectingPrompt: boolean;
  isAdvancing: boolean;
  showRoomInfo: boolean;
  showChat: boolean;
  showChatSettings: boolean;
  selectedImagePreview: string | null;
  toastMessage: string | null;

  // Actions
  initUser: () => void;
  updateUser: (username: string, avatar: string) => void;
  setScreen: (screen: "home" | "lobby" | "game") => void;
  setActiveTab: (tab: "home" | "chat" | "settings") => void;
  clearUnreadCount: () => void;
  setShowChatSettings: (bool: boolean) => void;
  setSelectedImagePreview: (url: string | null) => void;
  setRoom: (room: Room | null | ((prev: Room | null) => Room | null)) => void;
  setPlayers: (players: RoomPlayer[] | ((prev: RoomPlayer[]) => RoomPlayer[])) => void;
  setCurrentTurn: (turn: GameTurn | null | ((prev: GameTurn | null) => GameTurn | null)) => void;
  setTurnHistory: (history: GameTurn[] | ((prev: GameTurn[]) => GameTurn[])) => void;
  setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  setTimeLeft: (time: number | ((prev: number) => number)) => void;
  decrementTimer: () => void;
  resetTimer: () => void;
  setIsSelectingPrompt: (bool: boolean) => void;
  setIsAdvancing: (bool: boolean) => void;
  setShowRoomInfo: (bool: boolean) => void;
  setShowChat: (bool: boolean) => void;
  showNotification: (msg: string) => void;
  restoreSession: () => Promise<void>;
  fetchSupabaseRoomData: (roomId: string) => Promise<void>;
  fetchRoomPlayers: (roomId: string) => Promise<void>;
  fetchTurns: (roomId: string) => Promise<void>;
  fetchMessages: (roomId: string) => Promise<void>;
  createRoom: (
    overrideUser?: { username: string; avatar: string },
  ) => Promise<void>;
  joinRoom: (code: string, overrideUser?: { username: string; avatar: string }) => Promise<void>;
  toggleReady: () => Promise<void>;
  selectTurnType: (selectedType: PromptType) => Promise<void>;
  submitTurnResponse: (text: string, image?: string) => Promise<void>;
  advanceToNextTurn: (pointsEarned: number) => Promise<void>;
  leaveRoom: () => Promise<void>;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  screen: "home",
  activeTab: "home",
  unreadCount: 0,
  user: { id: "", username: "", avatar: "😜" },
  room: null,
  players: [],
  currentTurn: null,
  turnHistory: [],
  messages: [],
  timeLeft: 45,
  isSelectingPrompt: false,
  isAdvancing: false,
  showRoomInfo: false,
  showChat: false,
  showChatSettings: false,
  selectedImagePreview: null,
  toastMessage: null,

  initUser: () => {
    let storedId = localStorage.getItem("dingdang_user_id");
    const storedName = localStorage.getItem("dingdang_username") || "";
    let storedAvatar = localStorage.getItem("dingdang_avatar") || "😜";
    const ADULT_EMOJIS = new Set(["🔞", "🍆", "🍑", "🥵", "💋", "💄", "🥂", "🌶️", "🌶", "😈"]);
    if (ADULT_EMOJIS.has(storedAvatar)) {
      storedAvatar = "😜";
      localStorage.setItem("dingdang_avatar", "😜");
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!storedId || !uuidRegex.test(storedId)) {
      storedId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
              const r = (Math.random() * 16) | 0;
              const v = c === "x" ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            });
      localStorage.setItem("dingdang_user_id", storedId);
    }
    set({ user: { id: storedId!, username: storedName, avatar: storedAvatar } });
  },

  updateUser: (username, avatar) => {
    const finalName = username.trim() || "Player";
    localStorage.setItem("dingdang_username", finalName);
    localStorage.setItem("dingdang_avatar", avatar);
    set((state) => ({ user: { ...state.user, username: finalName, avatar } }));
  },

  setScreen: (screen) => set({ screen, activeTab: "home", unreadCount: 0 }),

  setActiveTab: (tab) =>
    set({
      activeTab: tab,
      unreadCount: tab === "chat" ? 0 : get().unreadCount,
    }),

  clearUnreadCount: () => set({ unreadCount: 0 }),

  setShowChatSettings: (showChatSettings) => set({ showChatSettings }),

  setSelectedImagePreview: (selectedImagePreview) => set({ selectedImagePreview }),

  setRoom: (roomOrFn) =>
    set((state) => ({
      room: typeof roomOrFn === "function" ? roomOrFn(state.room) : roomOrFn,
    })),

  setPlayers: (playersOrFn) =>
    set((state) => ({
      players: typeof playersOrFn === "function" ? playersOrFn(state.players) : playersOrFn,
    })),

  setCurrentTurn: (turnOrFn) =>
    set((state) => ({
      currentTurn: typeof turnOrFn === "function" ? turnOrFn(state.currentTurn) : turnOrFn,
    })),

  setTurnHistory: (historyOrFn) =>
    set((state) => ({
      turnHistory: typeof historyOrFn === "function" ? historyOrFn(state.turnHistory) : historyOrFn,
    })),

  setMessages: (messagesOrFn) =>
    set((state) => {
      const newMessages =
        typeof messagesOrFn === "function" ? messagesOrFn(state.messages) : messagesOrFn;
      const isChatActive = state.activeTab === "chat";
      if (isChatActive) {
        return { messages: newMessages, unreadCount: 0 };
      }
      const now = Date.now();
      const disappearingEnabled = state.room?.disappearing_chat_enabled !== false;
      const disappearingTimer = state.room?.disappearing_chat_timer || 30;
      const visibleMsgs = disappearingEnabled
        ? newMessages.filter((m) => {
            if (!m.created_at) return true;
            const t = new Date(m.created_at).getTime();
            return isNaN(t) || now - t < disappearingTimer * 1000;
          })
        : newMessages;
      return {
        messages: newMessages,
        unreadCount: visibleMsgs.length,
      };
    }),

  setTimeLeft: (timeOrFn) =>
    set((state) => ({
      timeLeft: typeof timeOrFn === "function" ? timeOrFn(state.timeLeft) : timeOrFn,
    })),

  decrementTimer: () => set((state) => ({ timeLeft: Math.max(0, state.timeLeft - 1) })),

  resetTimer: () => set((state) => ({ timeLeft: state.room?.timer_seconds || 45 })),

  setIsSelectingPrompt: (isSelectingPrompt) => set({ isSelectingPrompt }),

  setIsAdvancing: (isAdvancing) => set({ isAdvancing }),

  setShowRoomInfo: (showRoomInfo) => set({ showRoomInfo }),

  setShowChat: (showChat) => set({ showChat }),

  showNotification: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      set({ toastMessage: null });
    }, 4000);
  },

  restoreSession: async () => {
    const activeRoomCode = localStorage.getItem("dingdang_active_room_code");
    if (activeRoomCode && isSupabaseConfigured) {
      try {
        const { data: existingRoom } = await supabase
          .from("rooms")
          .select("*")
          .eq("code", activeRoomCode.toUpperCase())
          .single();

        if (existingRoom && existingRoom.status !== "finished") {
          set({ room: existingRoom as Room });
          await get().fetchSupabaseRoomData(existingRoom.id);
          set({ screen: existingRoom.status === "playing" ? "game" : "lobby" });
        } else {
          localStorage.removeItem("dingdang_active_room_code");
        }
      } catch (e) {
        console.error("Error restoring session:", e);
      }
    }
  },

  fetchSupabaseRoomData: async (roomId) => {
    await Promise.all([
      get().fetchRoomPlayers(roomId),
      get().fetchTurns(roomId),
      get().fetchMessages(roomId),
    ]);
  },

  fetchRoomPlayers: async (roomId) => {
    if (!isSupabaseConfigured) return;
    const { user, room } = get();
    const { data } = await supabase
      .from("room_players")
      .select("*")
      .eq("room_id", roomId)
      .order("joined_at", { ascending: true });

    if (!data || data.length === 0) {
      await supabase.from("rooms").delete().eq("id", roomId);
      return;
    }

    const formattedPlayers = data.map((p: any) => {
      const isMe = p.user_id === user.id;
      const resolvedName = p.username || (isMe ? user.username : null) || "Player";
      const resolvedAvatar = p.avatar || (isMe ? user.avatar : null) || "😜";
      return {
        id: p.id,
        room_id: p.room_id,
        user_id: p.user_id,
        username: resolvedName,
        avatar: resolvedAvatar,
        is_ready: p.is_ready,
        is_host: p.is_host,
        score: p.score || 0,
      };
    });

    set({ players: formattedPlayers as RoomPlayer[] });

    if (formattedPlayers.length > 0) {
      const hostExists = formattedPlayers.some((p: any) => p.user_id === room?.created_by);
      if (!hostExists && room?.id) {
        const newHostId = formattedPlayers[0].user_id;
        await supabase.from("rooms").update({ created_by: newHostId }).eq("id", room.id);
        set((state) => ({ room: state.room ? { ...state.room, created_by: newHostId } : null }));
      }
    }
  },

  fetchTurns: async (roomId) => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase
      .from("game_turns")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      set({ turnHistory: data as GameTurn[] });
      const activeTurn = data.find((t: any) => t.status === "pending" || t.status === "submitted");
      if (activeTurn) {
        set({ currentTurn: activeTurn as GameTurn });
      }
    }
  },

  fetchMessages: async (roomId) => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (data) set({ messages: data as ChatMessage[] });
  },

  createRoom: async (overrideUser) => {
    const { user } = get();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const activeUsername = overrideUser?.username?.trim() || user.username || "Player";
    const activeAvatar = overrideUser?.avatar || user.avatar || "😜";

    try {
      if (isSupabaseConfigured) {
        await supabase
          .from("profiles")
          .upsert({ id: user.id, username: activeUsername, avatar_url: activeAvatar });

        const { data: roomData, error: roomErr } = await supabase
          .from("rooms")
          .insert({
            code,
            created_by: user.id,
            current_player_id: user.id,
            adult_mode: false,
            disappearing_chat_enabled: true,
            disappearing_chat_timer: 30,
          })
          .select()
          .single();

        if (roomErr || !roomData) throw roomErr;

        const { data: hostPlayer } = await supabase
          .from("room_players")
          .insert({
            room_id: roomData.id,
            user_id: user.id,
            username: activeUsername,
            avatar: activeAvatar,
            is_host: true,
            is_ready: true,
          })
          .select()
          .single();

        set({ room: roomData as Room, players: [hostPlayer as RoomPlayer] });
      }
      localStorage.setItem("dingdang_active_room_code", code);
      set({ screen: "lobby" });
    } catch (e: any) {
      console.error("Room creation failed:", e);
      get().showNotification("Unable to create room. Please try again.");
    }
  },

  joinRoom: async (code, overrideUser) => {
    const { user } = get();
    const activeUsername = overrideUser?.username?.trim() || user.username || "Player";
    const activeAvatar = overrideUser?.avatar || user.avatar || "😜";

    try {
      if (isSupabaseConfigured) {
        const { data: existingRoom, error: roomErr } = await supabase
          .from("rooms")
          .select("*")
          .eq("code", code.toUpperCase())
          .single();

        if (roomErr || !existingRoom) {
          get().showNotification("Invalid room code. Please check and try again.");
          return;
        }

        await supabase
          .from("profiles")
          .upsert({ id: user.id, username: activeUsername, avatar_url: activeAvatar });

        await supabase
          .from("room_players")
          .insert({
            room_id: existingRoom.id,
            user_id: user.id,
            username: activeUsername,
            avatar: activeAvatar,
            is_host: false,
            is_ready: true,
          })
          .select()
          .single();

        set({ room: existingRoom as Room });
        await get().fetchRoomPlayers(existingRoom.id);
        set({ screen: existingRoom.status === "playing" ? "game" : "lobby" });
      }
      localStorage.setItem("dingdang_active_room_code", code.toUpperCase());
    } catch (e: any) {
      console.error("Room join failed:", e);
      get().showNotification("Could not join room. Please check the code.");
    }
  },

  toggleReady: async () => {
    const { room, user, players } = get();
    if (!room || !isSupabaseConfigured) return;
    const me = players.find((p) => p.user_id === user.id);
    if (!me) return;

    const newReadyState = !me.is_ready;
    set((state) => ({
      players: state.players.map((p) =>
        p.user_id === user.id ? { ...p, is_ready: newReadyState } : p,
      ),
    }));

    await supabase.from("room_players").update({ is_ready: newReadyState }).eq("id", me.id);
  },

  selectTurnType: async (selectedType) => {
    const { room, user, isSelectingPrompt } = get();
    if (isSelectingPrompt || !room || !isSupabaseConfigured) return;

    set({ isSelectingPrompt: true });

    try {
      const actualType: "truth" | "dare" =
        selectedType === "random" ? (Math.random() > 0.5 ? "truth" : "dare") : selectedType;
      const promptObj = await fetchTruthOrDarePrompt(actualType);
      const promptText = promptObj.prompt;

      const { data: insertedTurn } = await supabase
        .from("game_turns")
        .insert({
          room_id: room.id,
          player_id: user.id,
          type: actualType,
          prompt: promptText,
          status: "pending",
        })
        .select()
        .single();

      if (insertedTurn) {
        set((state) => ({
          currentTurn: insertedTurn as GameTurn,
          turnHistory: [insertedTurn as GameTurn, ...state.turnHistory],
        }));
        get().resetTimer();
      }
    } catch (err) {
      console.error("Error creating turn:", err);
    } finally {
      set({ isSelectingPrompt: false });
    }
  },

  submitTurnResponse: async (text, image) => {
    const { room, currentTurn, user } = get();
    if (!room || !currentTurn) return;

    const updatedTurnPayload = {
      response_text: text,
      response_image: image,
      status: "pending" as const,
    };

    set((state) => ({
      currentTurn: state.currentTurn ? { ...state.currentTurn, ...updatedTurnPayload } : null,
    }));

    if (isSupabaseConfigured) {
      await supabase
        .from("game_turns")
        .update({ response_text: text, response_image: image })
        .eq("id", currentTurn.id);

      const channel = supabase.channel(`room_sync_${room.id}`);
      await channel.send({
        type: "broadcast",
        event: "TURN_SUBMITTED",
        payload: {
          turnId: currentTurn.id,
          response_text: text,
          response_image: image,
          playerId: user.id,
        },
      });
    }
  },

  advanceToNextTurn: async (pointsEarned) => {
    const { room, players, currentTurn, isAdvancing } = get();
    if (!room || players.length === 0 || isAdvancing) return;

    set({ isAdvancing: true, isSelectingPrompt: false });

    try {
      const activePlayerId = currentTurn?.player_id || room.current_player_id;
      const activePlayerObj = players.find((p) => p.user_id === activePlayerId) || players[0];
      const newScore = Math.max(0, (activePlayerObj.score || 0) + pointsEarned);

      const currentIndex = players.findIndex((p) => p.user_id === activePlayerId);
      const safeIndex = currentIndex >= 0 ? currentIndex : 0;
      const nextIndex = (safeIndex + 1) % players.length;
      const nextPlayerId = players[nextIndex].user_id;

      const turnIdToClose = currentTurn?.id;

      set((state) => ({
        currentTurn: null,
        players: state.players.map((p) =>
          p.user_id === activePlayerObj.user_id ? { ...p, score: newScore } : p,
        ),
        room: state.room ? { ...state.room, current_player_id: nextPlayerId } : null,
      }));

      if (isSupabaseConfigured) {
        await supabase
          .from("room_players")
          .update({ score: newScore })
          .eq("id", activePlayerObj.id);
        if (turnIdToClose) {
          await supabase
            .from("game_turns")
            .update({
              status: pointsEarned >= 0 ? "completed" : "failed",
              points_awarded: pointsEarned,
            })
            .eq("id", turnIdToClose);
        }
        await supabase.from("rooms").update({ current_player_id: nextPlayerId }).eq("id", room.id);

        const channel = supabase.channel(`room_sync_${room.id}`);
        await channel.send({
          type: "broadcast",
          event: "TURN_ADVANCED",
          payload: { nextPlayerId, activePlayerId: activePlayerObj.user_id, pointsEarned },
        });
      }
    } catch (err) {
      console.error("Error advancing turn:", err);
    } finally {
      set({ isAdvancing: false });
    }
  },

  leaveRoom: async () => {
    const { room, user, players } = get();
    if (room) {
      const isHostPlayer = room.created_by === user.id;
      if (isHostPlayer) {
        if (isSupabaseConfigured) {
          const channel = supabase.channel(`room_sync_${room.id}`);
          await channel.send({
            type: "broadcast",
            event: "ROOM_DESTROYED",
            payload: { roomId: room.id, roomCode: room.code },
          });
          await supabase.from("rooms").delete().eq("id", room.id);
        }
      } else {
        if (isSupabaseConfigured) {
          const channel = supabase.channel(`room_sync_${room.id}`);
          await channel.send({
            type: "broadcast",
            event: "PLAYER_LEFT",
            payload: { userId: user.id, username: user.username, roomId: room.id },
          });
          await supabase
            .from("room_players")
            .delete()
            .eq("room_id", room.id)
            .eq("user_id", user.id);

          const { data: remaining } = await supabase
            .from("room_players")
            .select("id")
            .eq("room_id", room.id);
          if (!remaining || remaining.length === 0) {
            await supabase.from("rooms").delete().eq("id", room.id);
          }
        }
      }
    }

    localStorage.removeItem("dingdang_active_room_code");
    set({
      room: null,
      players: [],
      currentTurn: null,
      screen: "home",
    });
  },
}));
