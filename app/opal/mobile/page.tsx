"use client";

import "./mobile.css";
import { useState } from "react";
import { Box, Text } from "@optiaxiom/react";
import { IconComments, IconBooks, IconBell, IconSquareUser } from "@optiaxiom/icons";
import { ConversationList } from "./screens/ConversationList";
import { ChatView } from "./screens/ChatView";
import { NotificationsView } from "./screens/NotificationsView";
import { ArtifactsView } from "./screens/ArtifactsView";
import { SideDrawer } from "./screens/SideDrawer";
import { GlobalSearchPane } from "./screens/GlobalSearchPane";
import { HITL_NOTIFICATIONS, ARTIFACTS } from "./data";
import { CatchUpView } from "./screens/CatchUpView";

type Tab = "messages" | "artifacts" | "activity" | "me";
type Screen = "list" | "chat" | "catchup";

// ── Shared chrome ─────────────────────────────────────────────────────────────
function StatusBar() {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      style={{ height: 44, padding: "0 28px", paddingTop: 12, flexShrink: 0 }}
    >
      <Text style={{ fontSize: 15, fontWeight: 600, color: "var(--ax-colors-fg-default)", letterSpacing: "-0.3px" }}>
        9:41
      </Text>
      <Box
        style={{
          position: "absolute",
          left: "50%",
          top: 10,
          transform: "translateX(-50%)",
          width: 120,
          height: 34,
          borderRadius: 20,
          background: "#000",
          zIndex: 10,
        }}
      />
      <Box display="flex" alignItems="center" gap="6">
        <svg width="17" height="12" viewBox="0 0 17 12" fill="var(--ax-colors-fg-default)">
          <rect x="0"    y="7"   width="3" height="5"  rx="1" />
          <rect x="4.5"  y="4.5" width="3" height="7.5" rx="1" />
          <rect x="9"    y="2"   width="3" height="10" rx="1" />
          <rect x="13.5" y="0"   width="3" height="12" rx="1" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" fill="var(--ax-colors-fg-default)" />
          <path d="M4.5 7.2A4.97 4.97 0 0 1 8 6c1.38 0 2.63.56 3.54 1.46" stroke="var(--ax-colors-fg-default)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M1.5 4.2A8.96 8.96 0 0 1 8 2c2.48 0 4.73 1 6.36 2.62" stroke="var(--ax-colors-fg-default)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <Box style={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box style={{ width: 25, height: 12, borderRadius: 3.5, border: "1.5px solid var(--ax-colors-fg-default)", padding: "2px", display: "flex", alignItems: "center" }}>
            <Box style={{ width: "80%", height: "100%", borderRadius: 1.5, background: "var(--ax-colors-fg-default)" }} />
          </Box>
          <Box style={{ width: 2, height: 5, borderRadius: "0 1px 1px 0", background: "var(--ax-colors-fg-default)", opacity: 0.4 }} />
        </Box>
      </Box>
    </Box>
  );
}

function HomeIndicator() {
  return (
    <Box style={{ height: 32, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Box style={{ width: 134, height: 5, borderRadius: 3, background: "var(--ax-colors-fg-default)", opacity: 0.18 }} />
    </Box>
  );
}

// ── Tab bar (Option A only) ───────────────────────────────────────────────────
const HITL_UNREAD = HITL_NOTIFICATIONS.filter((n) => !n.read).length;
const ARTIFACTS_REVIEW = ARTIFACTS.filter((a) => a.status === "review").length;

const C = {
  active:   "var(--ax-colors-fg-accent-strong)",
  inactive: "var(--ax-colors-fg-tertiary)",
};

type TabItem = { id: Tab; label: string; icon: (a: boolean) => React.ReactNode; badge?: number };

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: TabItem[] = [
    {
      id: "messages", label: "Messages",
      icon: (a) => <IconComments style={{ width: 24, height: 24, color: a ? C.active : C.inactive }} />,
    },
    {
      id: "artifacts", label: "Artifacts", badge: ARTIFACTS_REVIEW,
      icon: (a) => <IconBooks style={{ width: 24, height: 24, color: a ? C.active : C.inactive }} />,
    },
    {
      id: "activity", label: "Activity", badge: HITL_UNREAD,
      icon: (a) => <IconBell style={{ width: 24, height: 24, color: a ? C.active : C.inactive }} />,
    },
    {
      id: "me", label: "Me",
      icon: (a) => <IconSquareUser style={{ width: 24, height: 24, color: a ? C.active : C.inactive }} />,
    },
  ];

  return (
    <Box display="flex" style={{ height: 56, borderTop: "1px solid var(--ax-colors-border-secondary)", background: "var(--ax-colors-bg-default)", flexShrink: 0 }}>
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <Box key={tab.id} onClick={() => onChange(tab.id)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, cursor: "pointer", position: "relative" }}>
            {isActive && (
              <Box className="mobile-tab-active-dot"
                style={{ position: "absolute", top: 6, width: 4, height: 4, borderRadius: "50%", background: C.active }} />
            )}
            {tab.badge && !isActive ? (
              <Box style={{ position: "relative" }}>
                {tab.icon(isActive)}
                <Box style={{ position: "absolute", top: -4, right: -6, minWidth: 16, height: 16, borderRadius: 8, background: "#f59e0b", color: "white", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                  {tab.badge}
                </Box>
              </Box>
            ) : tab.icon(isActive)}
            <Text style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, color: isActive ? C.active : C.inactive }}>
              {tab.label}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}

function MeView() {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap="12" style={{ height: "100%", color: "var(--ax-colors-fg-tertiary)" }}>
      <Box style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
        👤
      </Box>
      <Text color="fg.tertiary" fontSize="md">Profile & Settings</Text>
    </Box>
  );
}

// ── Phone frame wrapper ───────────────────────────────────────────────────────
function PhoneFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <Box style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      {/* Option label */}
      <Box style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Box style={{ width: 40, height: 1, background: "rgba(255,255,255,0.15)" }} />
        <Text style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {label}
        </Text>
        <Box style={{ width: 40, height: 1, background: "rgba(255,255,255,0.15)" }} />
      </Box>

      {/* Phone bezel */}
      <Box style={{
        width: 390,
        height: 844,
        background: "var(--ax-colors-bg-default)",
        borderRadius: 50,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 0 0 12px #1c1c1e, 0 0 0 14px rgba(255,255,255,0.05), 0 32px 80px rgba(0,0,0,0.6), 0 0 120px rgba(99,148,255,0.08)",
      }}>
        {children}
      </Box>
    </Box>
  );
}

// ── Option A phone (tab-bar nav) ──────────────────────────────────────────────
function PhoneA() {
  const [tab, setTab] = useState<Tab>("messages");
  const [screen, setScreen] = useState<Screen>("list");
  const [selectedId, setSelectedId] = useState<string>("bubs");
  const [chatAnimating, setChatAnimating] = useState(false);

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    setChatAnimating(true);
    setScreen("chat");
    setTimeout(() => setChatAnimating(false), 400);
  };

  const handleCatchup = () => {
    setScreen("catchup");
  };

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    if (newTab !== "messages") setScreen("list");
  };

  return (
    <>
      <StatusBar />
      <Box style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: 0 }}>
        {tab === "messages" && (
          <>
            <Box style={{
              position: "absolute", inset: 0,
              transform: screen !== "list" ? "translateX(-8%)" : "translateX(0)",
              transition: "transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              opacity: screen !== "list" ? 0.5 : 1,
              pointerEvents: screen !== "list" ? "none" : "auto",
            }}>
              <ConversationList
                onSelect={handleSelectConversation}
                onCatchup={handleCatchup}
              />
            </Box>
            {(screen === "chat" || chatAnimating) && (
              <Box
                className={screen === "chat" ? "mobile-screen-push" : "mobile-screen-pop"}
                style={{ position: "absolute", inset: 0, background: "var(--ax-colors-bg-default)" }}
              >
                <ChatView
                  conversationId={selectedId}
                  onBack={() => setScreen("list")}
                />
              </Box>
            )}
            {screen === "catchup" && (
              <Box
                className="mobile-screen-push"
                style={{ position: "absolute", inset: 0, background: "var(--ax-colors-bg-default)" }}
              >
                <CatchUpView
                  onBack={() => setScreen("list")}
                  onSelect={(id) => { setSelectedId(id); setChatAnimating(true); setScreen("chat"); setTimeout(() => setChatAnimating(false), 400); }}
                />
              </Box>
            )}
          </>
        )}
        {tab === "artifacts" && <ArtifactsView />}
        {tab === "activity" && <NotificationsView />}
        {tab === "me" && <MeView />}
      </Box>
      <TabBar active={tab} onChange={handleTabChange} />
      <HomeIndicator />
    </>
  );
}

// ── Option B phone (chat-first + hamburger drawer) ────────────────────────────
function PhoneB() {
  const [selectedId, setSelectedId] = useState<string>("bubs");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"nav" | "newMsg">("nav");
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  const [catchupOpen, setCatchupOpen] = useState(true);

  const openNav = () => { setDrawerMode("nav"); setDrawerOpen(true); };
  const openNewMsg = () => { setDrawerMode("newMsg"); setDrawerOpen(true); };

  return (
    <>
      <StatusBar />
      <Box style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: 0 }}>
        <ChatView
          conversationId={selectedId}
          onHamburger={openNav}
          onNewChat={openNewMsg}
          onGlobalSearch={() => setGlobalSearchOpen(true)}
        />

        {catchupOpen && (
          <Box
            className="mobile-screen-push"
            style={{ position: "absolute", inset: 0, background: "var(--ax-colors-bg-default)", zIndex: 20 }}
          >
            <CatchUpView
              onHamburger={openNav}
              onSelect={(id) => { setSelectedId(id); setCatchupOpen(false); }}
            />
          </Box>
        )}

        <SideDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onSelectConversation={(id) => { setSelectedId(id); setDrawerOpen(false); setCatchupOpen(false); }}
          onNewChat={openNewMsg}
          activeId={selectedId}
          initialMode={drawerMode}
          onCatchup={() => { setCatchupOpen(true); setDrawerOpen(false); }}
        />

        {globalSearchOpen && (
          <GlobalSearchPane
            onClose={() => setGlobalSearchOpen(false)}
            onSelect={(id) => { setSelectedId(id); setGlobalSearchOpen(false); }}
          />
        )}
      </Box>
      <HomeIndicator />
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MobilePage() {
  return (
    <Box
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: "48px 48px",
        boxSizing: "border-box",
      }}
    >
      <Box
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 64,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <PhoneFrame label="Option A — Tab bar">
          <PhoneA />
        </PhoneFrame>

        {/* Divider */}
        <Box style={{
          alignSelf: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          opacity: 0.25,
        }}>
          <Box style={{ width: 1, height: 120, background: "rgba(255,255,255,0.4)" }} />
          <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>vs</Text>
          <Box style={{ width: 1, height: 120, background: "rgba(255,255,255,0.4)" }} />
        </Box>

        <PhoneFrame label="Option B — Chat first">
          <PhoneB />
        </PhoneFrame>
      </Box>
    </Box>
  );
}
