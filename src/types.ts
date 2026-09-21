export type GameStatus = "lobby" | "playing" | "finished";
export type PromptType = "truth" | "dare" | "random";
export type TurnStatus = "pending" | "submitted" | "completed" | "skipped" | "failed";

export interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  created_at?: string;
}

export interface Room {
  id: string;
  code: string;
  status: GameStatus;
  created_by?: string;
  current_player_id?: string;
  current_turn_type?: PromptType;
  timer_seconds: number;
  adult_mode?: boolean;
  disappearing_chat_enabled?: boolean;
  disappearing_chat_timer?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  avatar: string;
  is_ready: boolean;
  is_host: boolean;
  score: number;
  joined_at?: string;
}

export interface GameTurn {
  id: string;
  room_id: string;
  player_id: string;
  player_name?: string;
  type: "truth" | "dare";
  prompt: string;
  response_text?: string;
  response_image?: string;
  status: TurnStatus;
  points_awarded: number;
  created_at?: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  reaction?: string;
  image_url?: string;
  created_at?: string;
}
