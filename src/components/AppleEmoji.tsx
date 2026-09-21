import React from "react";

// Mapping table for all game emojis to 3D Apple PNG CDN URLs
const APPLE_EMOJI_MAP: Record<string, string> = {
  // Faces & Characters
  "😜": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f61c.png",
  "🤪": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f92a.png",
  "🤠": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f920.png",
  "😎": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f60e.png",
  "🥳": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f973.png",
  "😂": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f602.png",
  "😱": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f631.png",
  "🤫": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f92b.png",
  "🤡": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f921.png",
  "👽": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f47d.png",
  "🤖": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f916.png",
  "💩": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f4a9.png",

  // Animals & Mythical
  "🐶": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f436.png",
  "🐱": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f431.png",
  "🦊": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f98a.png",
  "🐼": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f43c.png",
  "🦁": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f981.png",
  "🐸": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f438.png",
  "🐵": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f435.png",
  "🦖": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f996.png",
  "🦄": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f984.png",

  // Objects, Food & Fun Activities
  "👑": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f451.png",
  "🚀": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f680.png",
  "🎮": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f3ae.png",
  "🎸": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f3b8.png",
  "🛹": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f6f9.png",
  "🍕": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f355.png",
  "🍩": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f369.png",
  "🍦": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f366.png",
  "🍿": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f37f.png",
  "🍉": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f349.png",
  "🍒": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f352.png",
  "⚽": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/26bd.png",
  "🏀": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f3c0.png",

  // Symbols, Sparkles & Badges
  "🌟": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f31f.png",
  "✨": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/2728.png",
  "🎉": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f389.png",
  "🔥": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f525.png",
  "⚡": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/26a1.png",
  "🌈": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f308.png",
  "💎": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f48e.png",
  "🎲": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f3b2.png",
  "🎯": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f3af.png",
  "❤️": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/2764-fe0f.png",
  "👤": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f464.png",
  "⚙️": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/2699-fe0f.png",
  "⚙": "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/2699-fe0f.png",
};

interface AppleEmojiProps {
  emoji: string;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const AppleEmoji: React.FC<AppleEmojiProps> = ({
  emoji,
  size = 28,
  className = "",
  style = {},
}) => {
  const url = APPLE_EMOJI_MAP[emoji];

  if (url) {
    return (
      <img
        src={url}
        alt={emoji}
        width={size}
        height={size}
        className={className}
        style={{
          display: "inline-block",
          verticalAlign: "middle",
          objectFit: "contain",
          pointerEvents: "none",
          userSelect: "none",
          ...style,
        }}
      />
    );
  }

  return (
    <span
      className={className}
      style={{
        fontSize: typeof size === "number" ? `${size}px` : size,
        lineHeight: 1,
        display: "inline-block",
        verticalAlign: "middle",
        ...style,
      }}
    >
      {emoji}
    </span>
  );
};
