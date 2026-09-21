# 🎲 Dingdang — Real-time Truth or Dare

A modern, mobile-first multiplayer **Truth or Dare** party game built with **React 18**, **TypeScript**, **Vite**, and **Supabase Realtime**.

Dingdang delivers a smooth, clean, and engaging party experience — strictly focused on fun **Truth or Dare** prompts with zero adult content, family-friendly questions, and playful 3D Apple emoji avatars.

---

## ✨ Features

- **Pure Truth or Dare Focus**: Free of adult or 18+ content. Every prompt is safe, hilarious, and engaging for friends, parties, teens, and families.
- **Fun 3D Apple Emoji Avatars**: Smooth coverflow avatar selector featuring vibrant, non-adult 3D Apple emojis (`🐶`, `🐱`, `🦊`, `🐼`, `🦁`, `🤖`, `🦖`, `🎮`, `🍕`, `🌟`, `🚀`, and more).
- **Real-Time Multiplayer Sync**: Instant room updates powered by Supabase Realtime Channels, broadcast events, and presence tracking.
- **Automated PG Prompt Generation**:
  - Integrated with the free public **TruthOrDareBot API** (enforced `rating=pg`).
- **Turn Flow & Verification**:
  - Timed player turns with customizable countdowns.
  - Text response and photo proof uploads for dare completion.
  - Peer group voting: Approve (+10 pts), Reject (-5 pts), or Skip.
- **Ephemeral In-Game Chat**:
  - Real-time room chat drawer with live unread indicators.
  - Customizable **Disappearing Messages** with configurable timers (10s, 30s, 60s, 5m presets) and glassmorphic styling.
- **Live Leaderboard & Room Details**: Instant score tracking and host controls.
- **Progressive Web App (PWA)**: Installable on iOS and Android with offline caching and mobile keyboard handling (`interactive-widget=resizes-content`).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling & Motion**: Custom CSS (Oura-inspired dark design system), Framer Motion, Swiper (3D coverflow)
- **State Management**: Zustand
- **Backend / Realtime**: Supabase (PostgreSQL, Realtime Broadcast, Presence)
- **Icons & Effects**: Lucide React, Canvas Confetti
- **PWA**: `vite-plugin-pwa`

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or [Node.js](https://nodejs.org/) (v18+)

### 1. Clone the repository

```bash
git clone https://github.com/theajmalrazaq/dingdang.git
cd dingdang
```

### 2. Install dependencies

Using Bun:
```bash
bun install
```

Or using npm:
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### 4. Run the Development Server

```bash
bun run dev
# or: npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📦 Building for Production

```bash
bun run build
# or: npm run build
```

Preview the production build locally:

```bash
bun run preview
# or: npm run preview
```

---

## 🗄️ Database Schema (Supabase)

If deploying with your own Supabase instance, the app uses the following tables:

- **`rooms`**: `id`, `code`, `status`, `created_by`, `current_player_id`, `timer_seconds`, `disappearing_chat_enabled`, `disappearing_chat_timer`
- **`room_players`**: `id`, `room_id`, `user_id`, `username`, `avatar`, `is_ready`, `is_host`, `score`, `joined_at`
- **`game_turns`**: `id`, `room_id`, `player_id`, `type`, `prompt`, `response_text`, `response_image`, `status`, `points_awarded`, `created_at`
- **`messages`**: `id`, `room_id`, `sender_id`, `sender_name`, `content`, `image_url`, `created_at`
- **`profiles`**: `id`, `username`, `avatar_url`, `created_at`

---

## 📄 License

MIT License. Free for personal and commercial multiplayer party gaming!
