import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, MessageCircle, SlidersHorizontal } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

type Tab = "home" | "chat" | "settings";

interface BottomNavBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  unreadCount?: number;
}

const tabs: { id: Tab; label: string; icon: (active: boolean) => ReactNode }[] = [
  {
    id: "home",
    label: "Home",
    icon: (active) => (
      <LayoutGrid
        size={20}
        strokeWidth={active ? 2.4 : 1.8}
        color={active ? "#FFFFFF" : "rgba(255, 255, 255, 0.45)"}
      />
    ),
  },
  {
    id: "chat",
    label: "Chat",
    icon: (active) => (
      <MessageCircle
        size={20}
        strokeWidth={active ? 2.4 : 1.8}
        color={active ? "#FFFFFF" : "rgba(255, 255, 255, 0.45)"}
        fill={active ? "rgba(255, 255, 255, 0.2)" : "none"}
      />
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (active) => (
      <SlidersHorizontal
        size={20}
        strokeWidth={active ? 2.4 : 1.8}
        color={active ? "#FFFFFF" : "rgba(255, 255, 255, 0.45)"}
      />
    ),
  },
];

const containerStyle: CSSProperties = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "center",
  paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))",
  pointerEvents: "none",
  zIndex: 90,
};

const pillStyle: CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "196px",
  height: "48px",
  padding: "4px",
  borderRadius: "24px",
  background: "#111216",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.04) inset",
  pointerEvents: "auto",
};

const tabButtonBase: CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  height: "40px",
  borderRadius: "20px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  outline: "none",
  zIndex: 2,
};

const badgeStyle: CSSProperties = {
  position: "absolute",
  top: 4,
  right: 8,
  minWidth: 16,
  height: 16,
  borderRadius: 999,
  background: "#FF453A",
  color: "#FFFFFF",
  fontSize: 10,
  fontWeight: 700,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 4px",
  lineHeight: 1,
  boxShadow: "0 0 8px rgba(255, 69, 58, 0.6)",
  zIndex: 4,
};

export function BottomNavBar({ activeTab, onTabChange, unreadCount }: BottomNavBarProps) {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      const isKb = window.innerHeight - vv.height > 100;
      setIsKeyboardOpen(isKb);
    };

    vv.addEventListener("resize", handleResize);
    return () => vv.removeEventListener("resize", handleResize);
  }, []);

  if (isKeyboardOpen) return null;

  return (
    <div style={containerStyle}>
      <div style={pillStyle}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              type="button"
              aria-label={tab.label}
              style={tabButtonBase}
              whileTap={{ scale: 0.92 }}
              onClick={() => onTabChange(tab.id)}
            >
              {/* Active Tab Sliding Pill Highlight */}
              {isActive && (
                <motion.div
                  layoutId="activeTabCapsule"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "20px",
                    background: "rgba(255, 255, 255, 0.16)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                    zIndex: 1,
                  }}
                />
              )}

              <span
                style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "center" }}
              >
                {tab.icon(isActive)}
              </span>

              {/* Unread badge on chat tab */}
              {tab.id === "chat" && unreadCount !== undefined && unreadCount > 0 && (
                <span style={badgeStyle}>{unreadCount > 99 ? "99+" : unreadCount}</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
