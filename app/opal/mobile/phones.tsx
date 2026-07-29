"use client";

import "./mobile.css";
import { useState } from "react";
import { Box, Text } from "@optiaxiom/react";
import { IconComments, IconBooks, IconSquareUser, IconSquareCheck, IconHouse, IconEllipsisStroke, IconChevronRight } from "@optiaxiom/icons";
import { ConversationList } from "./screens/ConversationList";
import { ChatView } from "./screens/ChatView";
import { NotificationsView } from "./screens/NotificationsView";
import { ArtifactsView } from "./screens/ArtifactsView";
import { HITL_NOTIFICATIONS, ARTIFACTS } from "./data";
import { CatchUpView } from "./screens/CatchUpView";
import { TrackerView } from "./screens/TrackerView";
import { LaunchPadView } from "./screens/LaunchPadView";
import { NavDrawer, type NavTab } from "./screens/NavDrawer";
import { SideDrawer } from "./screens/SideDrawer";
import { ProfilePanel } from "./screens/ProfilePanel";
import { OpalHomeView } from "./screens/OpalHomeView";

// ── Types ─────────────────────────────────────────────────────────────────────
export type Tab = "home" | "opal" | "messages" | "tasks" | "activity" | "artifacts" | "me";
type Screen = "list" | "chat" | "catchup";

// ── Shared chrome ─────────────────────────────────────────────────────────────
export function StatusBar() {
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
      <Box style={{ position: "absolute", left: "50%", top: 10, transform: "translateX(-50%)", width: 120, height: 34, borderRadius: 20, background: "#000", zIndex: 10 }} />
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

export function HomeIndicator() {
  return (
    <Box style={{ height: 32, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Box style={{ width: 134, height: 5, borderRadius: 3, background: "var(--ax-colors-fg-default)", opacity: 0.18 }} />
    </Box>
  );
}

// ── Tab bar colours ───────────────────────────────────────────────────────────
const HITL_UNREAD = HITL_NOTIFICATIONS.filter((n) => !n.read).length;
const _ARTIFACTS_REVIEW = ARTIFACTS.filter((a) => a.status === "review").length;

export const C = {
  active:   "var(--ax-colors-fg-information)",   // teal #197a94 — per Figma tab bar spec
  inactive: "var(--ax-colors-fg-tertiary)",
};

type TabItem = { id: Tab; label: string; icon: (a: boolean) => React.ReactNode; badge?: number };

// ── Option A tab bar ──────────────────────────────────────────────────────────
export function TabBar({ active, onChange, onMore, meOnly = false, island = false, showArtifacts = false, foldOpal = false }: { active: Tab; onChange: (t: Tab) => void; onMore: () => void; meOnly?: boolean; island?: boolean; showArtifacts?: boolean; foldOpal?: boolean }) {
  const tabs: TabItem[] = [
    { id: "home", label: "Home", icon: (a) => <IconHouse style={{ width: 24, height: 24, color: a ? C.active : C.inactive }} /> },
    ...(!foldOpal ? [{
      id: "opal" as Tab, label: "Opal",
      icon: (a: boolean) => (
        <Box style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <img src="/opal_avatar.png" alt="Opal" style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover", opacity: a ? 1 : 0.55, border: a ? `1.5px solid ${C.active}` : "none" }} />
        </Box>
      ),
    }] : []),
    { id: "messages", label: "Messages", icon: (a) => <IconComments style={{ width: 24, height: 24, color: a ? C.active : C.inactive }} /> },
    { id: "tasks",    label: "Tracker",  icon: (a) => <IconSquareCheck style={{ width: 24, height: 24, color: a ? C.active : C.inactive }} /> },
    ...(showArtifacts ? [{ id: "artifacts" as Tab, label: "Artifacts", icon: (a: boolean) => <IconBooks style={{ width: 24, height: 24, color: a ? C.active : C.inactive }} /> }] : []),
  ];

  const isMoreActive = active === "activity" || active === "me";

  return (
    <Box display="flex" style={island ? {
      height: 64, borderRadius: 999,
      background: "var(--ax-colors-bg-default)",
      boxShadow: "0 4px 24px rgba(0,0,0,0.14)",
      padding: "0 16px",
      gap: 4,
    } : {
      height: 56, paddingBottom: "env(safe-area-inset-bottom)",
      borderTop: "1px solid var(--ax-colors-border-secondary)",
      background: "var(--ax-colors-bg-default)",
      flexShrink: 0,
    }}>
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <Box key={tab.id} onClick={() => onChange(tab.id)}
            style={{ ...(island ? { width: 64 } : { flex: 1 }), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, cursor: "pointer", position: "relative" }}>
            {isActive && <Box className="mobile-tab-active-dot" style={{ position: "absolute", top: 6, width: 4, height: 4, borderRadius: "50%", background: C.active }} />}
            {tab.badge && !isActive ? (
              <Box style={{ position: "relative" }}>
                {tab.icon(isActive)}
                <Box style={{ position: "absolute", top: -4, right: -6, minWidth: 16, height: 16, borderRadius: 8, background: "var(--ax-colors-fg-information-strong)", color: "white", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                  {tab.badge}
                </Box>
              </Box>
            ) : tab.icon(isActive)}
            <Text style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, color: isActive ? C.active : C.inactive }}>{tab.label}</Text>
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

// ── Phone Base — Option A tabs + Option B home content ───────────────────────
export function PhoneBase({ standalone = false, showArtifacts = true, showPreview = false, islandNav = true, foldOpal = false }: { standalone?: boolean; showArtifacts?: boolean; showPreview?: boolean; islandNav?: boolean; foldOpal?: boolean }) {
  const [tab, setTab] = useState<Tab>("home");
  const [screen, setScreen] = useState<Screen>("list");
  const [selectedId, setSelectedId] = useState<string>("bubs");
  const [chatAnimating, setChatAnimating] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [chatAutoFocus, setChatAutoFocus] = useState(false);

  const handleSelectConversation = (id: string, focusInput = false) => {
    setSelectedId(id); setChatAnimating(true); setScreen("chat");
    setChatAutoFocus(focusInput);
    setTimeout(() => setChatAnimating(false), 400);
  };

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    if (newTab !== "messages") setScreen("list");
  };

  return (
    <>
      {!standalone && <StatusBar />}
      <Box style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: 0 }}>
        {tab === "messages" && (
          <>
            <Box style={{ position: "absolute", inset: 0, transform: screen !== "list" ? "translateX(-8%)" : "translateX(0)", transition: "transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)", opacity: screen !== "list" ? 0.5 : 1, pointerEvents: screen !== "list" ? "none" : "auto" }}>
              <ConversationList onSelect={handleSelectConversation} onCatchup={() => setScreen("catchup")} onAvatarClick={() => setProfileOpen(true)} onCompose={() => setComposeOpen(true)} onOpalClick={() => handleTabChange("opal")} showPreview={showPreview} foldOpal={foldOpal} />
            </Box>
            {(screen === "chat" || chatAnimating) && (
              <Box className={screen === "chat" ? "mobile-screen-push" : "mobile-screen-pop"} style={{ position: "absolute", inset: 0, background: "var(--ax-colors-bg-default)" }}>
                <ChatView conversationId={selectedId} onBack={() => { setScreen("list"); setChatAutoFocus(false); }} autoFocus={chatAutoFocus} />
              </Box>
            )}
            {screen === "catchup" && (
              <Box className="mobile-screen-push" style={{ position: "absolute", inset: 0, background: "var(--ax-colors-bg-default)" }}>
                <CatchUpView title="Catch up" onBack={() => setScreen("list")} showPreview={showPreview} onSelect={(id) => { setSelectedId(id); setChatAnimating(true); setScreen("chat"); setTimeout(() => setChatAnimating(false), 400); }} />
              </Box>
            )}
          </>
        )}
        {tab === "home"      && <Box style={{ position: "absolute", inset: 0 }}><CatchUpView title="Home" onAvatarClick={() => setProfileOpen(true)} onBellClick={() => handleTabChange("activity")} showPreview={showPreview} launchpadPrompt onSelect={(id) => { handleSelectConversation(id); handleTabChange("messages"); }} /></Box>}
        {tab === "opal"      && <Box style={{ position: "absolute", inset: 0 }}><OpalHomeView onAvatarClick={() => setProfileOpen(true)} onBack={foldOpal ? () => handleTabChange("messages") : undefined} onOpenChat={(id) => { setSelectedId(id === "new" ? "bubs" : id); setScreen("chat"); handleTabChange("messages"); }} /></Box>}
        {tab === "tasks"     && <TrackerView onAvatarClick={() => setProfileOpen(true)} />}
        {tab === "artifacts" && <ArtifactsView />}
        {tab === "activity"  && <NotificationsView onAvatarClick={() => setProfileOpen(true)} />}
        <SideDrawer
          open={composeOpen}
          onClose={() => setComposeOpen(false)}
          onSelectConversation={(id) => { handleSelectConversation(id, true); handleTabChange("messages"); setComposeOpen(false); }}
          onNewChat={() => {}}
          activeId={selectedId}
          initialMode="newMsg"
        />
        <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
        {islandNav && screen !== "chat" && (
          <Box style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 50 }}>
            <TabBar active={tab} onChange={handleTabChange} onMore={() => {}} showArtifacts={showArtifacts} foldOpal={foldOpal} island />
          </Box>
        )}
      </Box>
      {!islandNav && <TabBar active={tab} onChange={handleTabChange} onMore={() => {}} showArtifacts={showArtifacts} foldOpal={foldOpal} />}
      {!standalone && !islandNav && <HomeIndicator />}
    </>
  );
}

// ── Phone A — Utility tabs ────────────────────────────────────────────────────
export function PhoneA({ standalone = false, showArtifacts = false, showPreview = true, islandNav = false, foldOpal = false }: { standalone?: boolean; showArtifacts?: boolean; showPreview?: boolean; islandNav?: boolean; foldOpal?: boolean }) {
  const [tab, setTab] = useState<Tab>("home");
  const [screen, setScreen] = useState<Screen>("list");
  const [selectedId, setSelectedId] = useState<string>("bubs");
  const [chatAnimating, setChatAnimating] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

  const handleSelectConversation = (id: string) => {
    setSelectedId(id); setChatAnimating(true); setScreen("chat");
    setTimeout(() => setChatAnimating(false), 400);
  };

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    if (newTab !== "messages") setScreen("list");
  };


  return (
    <>
      {!standalone && <StatusBar />}
      <Box style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: 0 }}>
        {tab === "messages" && (
          <>
            <Box style={{ position: "absolute", inset: 0, transform: screen !== "list" ? "translateX(-8%)" : "translateX(0)", transition: "transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)", opacity: screen !== "list" ? 0.5 : 1, pointerEvents: screen !== "list" ? "none" : "auto" }}>
              <ConversationList onSelect={handleSelectConversation} onCatchup={() => setScreen("catchup")} onAvatarClick={() => setProfileOpen(true)} onCompose={() => setComposeOpen(true)} onOpalClick={() => handleTabChange("opal")} showPreview={showPreview} foldOpal={foldOpal} />
            </Box>
            {(screen === "chat" || chatAnimating) && (
              <Box className={screen === "chat" ? "mobile-screen-push" : "mobile-screen-pop"} style={{ position: "absolute", inset: 0, background: "var(--ax-colors-bg-default)" }}>
                <ChatView conversationId={selectedId} onBack={() => setScreen("list")} />
              </Box>
            )}
            {screen === "catchup" && (
              <Box className="mobile-screen-push" style={{ position: "absolute", inset: 0, background: "var(--ax-colors-bg-default)" }}>
                <CatchUpView title="Catch up" onBack={() => setScreen("list")} showPreview={showPreview} onSelect={(id) => { setSelectedId(id); setChatAnimating(true); setScreen("chat"); setTimeout(() => setChatAnimating(false), 400); }} />
              </Box>
            )}
          </>
        )}
        {tab === "home"      && <Box style={{ position: "absolute", inset: 0 }}><LaunchPadView onBellClick={() => handleTabChange("activity")} onAvatarClick={() => setProfileOpen(true)} showPreview={showPreview} /></Box>}
        {tab === "opal"      && <Box style={{ position: "absolute", inset: 0 }}><OpalHomeView onAvatarClick={() => setProfileOpen(true)} onBack={foldOpal ? () => handleTabChange("messages") : undefined} onOpenChat={(id) => { setSelectedId(id === "new" ? "bubs" : id); setScreen("chat"); handleTabChange("messages"); }} /></Box>}
        {tab === "tasks"     && <TrackerView onAvatarClick={() => setProfileOpen(true)} />}
        {tab === "artifacts" && <ArtifactsView />}
        {tab === "activity"  && <NotificationsView onAvatarClick={() => setProfileOpen(true)} />}
        {tab === "me"        && <MeView />}

        <SideDrawer
          open={composeOpen}
          onClose={() => setComposeOpen(false)}
          onSelectConversation={(id) => { handleSelectConversation(id); handleTabChange("messages"); setComposeOpen(false); }}
          onNewChat={() => {}}
          activeId={selectedId}
          initialMode="newMsg"
        />
        <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
        {islandNav && screen !== "chat" && (
          <Box style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 50 }}>
            <TabBar active={tab} onChange={handleTabChange} onMore={() => {}} showArtifacts={showArtifacts} foldOpal={foldOpal} island />
          </Box>
        )}
      </Box>
      {!islandNav && <TabBar active={tab} onChange={handleTabChange} onMore={() => {}} showArtifacts={showArtifacts} foldOpal={foldOpal} />}
      {!standalone && !islandNav && <HomeIndicator />}
    </>
  );
}

// ── Phone B — Messages-first with hamburger/drawer nav ────────────────────────
export function PhoneB({ standalone = false, showArtifacts = false, showPreview = true, islandNav = false, foldOpal = false }: { standalone?: boolean; showArtifacts?: boolean; showPreview?: boolean; islandNav?: boolean; foldOpal?: boolean }) {
  const [tab, setTab] = useState<NavTab>("home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("bubs");
  const [screen, setScreen] = useState<"list" | "chat" | "catchup">("list");
  const [profileOpen, setProfileOpen] = useState(false);

  const handleNav = (t: NavTab) => {
    if (t === "me") { setProfileOpen(true); return; }
    setTab(t);
    setScreen("list");
  };

  return (
    <>
      {!standalone && <StatusBar />}
      <Box style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: 0 }}>
        {tab === "home"     && <CatchUpView title="Home" onHamburger={() => setDrawerOpen(true)} showPreview={showPreview} onSelect={(id) => { setSelectedId(id); setTab("messages"); setScreen("chat"); }} />}
        {tab === "opal"     && <OpalHomeView onHamburger={foldOpal ? undefined : () => setDrawerOpen(true)} onBack={foldOpal ? () => { setTab("messages"); } : undefined} onOpenChat={(id) => { setSelectedId(id === "new" ? "bubs" : id); setTab("messages"); setScreen("chat"); }} />}
        {tab === "messages" && (
          <>
            <Box style={{ position: "absolute", inset: 0, transform: screen !== "list" ? "translateX(-8%)" : "translateX(0)", transition: "transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94)", opacity: screen !== "list" ? 0.5 : 1, pointerEvents: screen !== "list" ? "none" : "auto" }}>
              <ConversationList onSelect={(id) => { setSelectedId(id); setScreen("chat"); }} onCatchup={() => setScreen("catchup")} onHamburger={() => setDrawerOpen(true)} onCompose={() => setComposeOpen(true)} onOpalClick={() => setTab("opal")} showPreview={showPreview} foldOpal={foldOpal} />
            </Box>
            {screen === "catchup" && (
              <Box className="mobile-screen-push" style={{ position: "absolute", inset: 0, background: "var(--ax-colors-bg-default)" }}>
                <CatchUpView title="Catch up" onBack={() => setScreen("list")} showPreview={showPreview} onSelect={(id) => { setSelectedId(id); setScreen("chat"); }} />
              </Box>
            )}
            {screen === "chat" && (
              <Box className="mobile-screen-push" style={{ position: "absolute", inset: 0, background: "var(--ax-colors-bg-default)" }}>
                <ChatView conversationId={selectedId} onBack={() => setScreen("list")} />
              </Box>
            )}
          </>
        )}
        {tab === "tracker"   && <TrackerView onHamburger={() => setDrawerOpen(true)} />}
        {tab === "activity"  && <NotificationsView onHamburger={() => setDrawerOpen(true)} />}
        {tab === "artifacts" && <ArtifactsView />}
        {tab === "me"        && <MeView />}

        <SideDrawer
          open={composeOpen}
          onClose={() => setComposeOpen(false)}
          onSelectConversation={(id) => { setSelectedId(id); setTab("messages"); setScreen("chat"); setComposeOpen(false); }}
          onNewChat={() => {}}
          activeId={selectedId}
          initialMode="newMsg"
        />
        <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
        <NavDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onNavigate={handleNav}
          onSelectConversation={(id) => { setSelectedId(id); setTab("messages"); setScreen("chat"); }}
          activeTab={tab}
          showArtifacts={showArtifacts}
          showPreview={showPreview}
        />
      </Box>
      {!standalone && <HomeIndicator />}
    </>
  );
}
