"use client";

import { useState, useRef } from "react";
import { Box, Text, Avatar, Badge, Heading, Button } from "@optiaxiom/react";
import { IconSearch, IconPenToSquare, IconSparkles, IconXmark, IconGlassesRound } from "@optiaxiom/icons";
import { DMS, GROUPS, THREADS, getMockTime, getUnreadQueue, type DMItem, type GroupItem } from "../data";
import { mobileType } from "../typography";

type Filter = "catchup" | "unread" | "mentions" | "needs";

const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <line x1="3" y1="5"  x2="17" y2="5"  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="3" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

type Props = {
  onSelect: (id: string) => void;
  onCatchup: () => void;
  onAvatarClick?: () => void;
  onHamburger?: () => void;
  onCompose?: () => void;
  onOpalClick?: () => void;
  showPreview?: boolean;
  foldOpal?: boolean;
};

function getLastMessage(id: string): string {
  const thread = THREADS[id] ?? [];
  const last = thread[thread.length - 1];
  if (!last) return "";
  if (last.type === "attachment") return "📎 Shared a file";
  return last.text.replace(/\n/g, " ").slice(0, 52) + (last.text.length > 52 ? "…" : "");
}

function getLastTime(id: string): string {
  const thread = THREADS[id] ?? [];
  if (!thread.length) return "";
  return getMockTime(thread.length - 1);
}


export function ConversationList({ onSelect, onCatchup, onAvatarClick, onHamburger, onCompose, onOpalClick, showPreview = true, foldOpal = false }: Props) {
  const [filter, setFilter] = useState<Filter | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const openSearch = () => {
    setSearchOpen(true);
    setSearchQuery("");
    setTimeout(() => searchRef.current?.focus(), 60);
  };
  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const recentPeople = DMS.filter((d) => !d.isVAU).slice(0, 5);

  // All conversations = DMs + groups, each with a title + preview line
  type ConvoItem = { id: string; title: string; preview: string };
  const allConvos: ConvoItem[] = [
    ...DMS.map((d) => ({ id: d.id, title: d.name, preview: getLastMessage(d.id) })),
    ...GROUPS.map((g) => ({ id: g.id, title: g.name, preview: getLastMessage(g.id) })),
  ];
  const filteredConvos = searchQuery
    ? allConvos.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.preview.toLowerCase().includes(searchQuery.toLowerCase()))
    : allConvos;

  const isUnreadMode = filter === "unread";
  const isNeedsMode  = filter === "needs";

  const filteredDMs = isUnreadMode ? DMS.filter(d => (d.unread ?? 0) > 0)
    : isNeedsMode ? DMS.filter(d => !!d.needsAction)
    : DMS;
  const filteredGroups = isUnreadMode ? GROUPS.filter(g => (g.unread ?? 0) > 0)
    : isNeedsMode ? []   // groups don't have needsAction
    : GROUPS;

  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{ height: "100%", background: "var(--ax-colors-bg-page)" }}
    >
      {/* ── Search overlay ── */}
      {searchOpen && (
        <Box display="flex" flexDirection="column" style={{ position: "absolute", inset: 0, background: "var(--ax-colors-bg-default)", zIndex: 50 }}>
          {/* Search bar — pill, full-width */}
          <Box display="flex" alignItems="center" gap="12" style={{ padding: "14px 20px 10px", flexShrink: 0 }}>
            <Box display="flex" alignItems="center" gap="8" style={{
              flex: 1, borderRadius: 9999, padding: "10px 16px",
              background: "var(--ax-colors-bg-secondary)",
            }}>
              <IconSearch style={{ width: 16, height: 16, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
              <input ref={searchRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats…"
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", ...mobileType.primary, color: "var(--ax-colors-fg-default)" }}
              />
            </Box>
            <Box onClick={closeSearch} style={{ cursor: "pointer", color: "var(--ax-colors-fg-secondary)", flexShrink: 0, fontSize: 15, fontWeight: 500 }}>
              <IconXmark style={{ width: 18, height: 18 }} />
            </Box>
          </Box>

          <Box style={{ flex: 1, overflowY: "auto" }}>
            {/* Recent people row — only when not typing */}
            {!searchQuery && (
              <Box style={{ padding: "4px 20px 16px", flexShrink: 0 }}>
                <Text style={{
                  display: "block", ...mobileType.caps, fontWeight: 400,
                  color: "var(--ax-colors-fg-tertiary)", marginBottom: 12,
                  fontFamily: "var(--ax-fontFamily-mono, 'Roboto Mono', monospace)",
                }}>
                  Recent
                </Text>
                <Box display="flex" gap="16">
                  {recentPeople.map((p) => (
                    <Box key={p.id} display="flex" flexDirection="column" alignItems="center" gap="4"
                      onClick={() => { closeSearch(); onSelect(p.id); }}
                      style={{ cursor: "pointer" }}>
                      <Avatar name={p.name} src={p.avatar || undefined} size="lg" style={{ flexShrink: 0 }} />
                      <Text style={{ ...mobileType.meta, color: "var(--ax-colors-fg-secondary)", whiteSpace: "nowrap" }}>
                        {p.name.split(" ")[0]}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Conversations list */}
            {filteredConvos.length === 0 && searchQuery ? (
              <Box display="flex" alignItems="center" justifyContent="center" style={{ paddingTop: 48 }}>
                <Text style={{ ...mobileType.body, color: "var(--ax-colors-fg-tertiary)" }}>No results</Text>
              </Box>
            ) : (
              filteredConvos.map((c) => (
                <Box key={c.id}
                  onClick={() => { closeSearch(); onSelect(c.id); }}
                  style={{ padding: "13px 20px", borderBottom: "1px solid var(--ax-colors-border-secondary)", cursor: "pointer" }}>
                  <Text style={{ ...mobileType.primary, fontWeight: 500, color: "var(--ax-colors-fg-default)", display: "block", marginBottom: 2 }}>
                    {c.title}
                  </Text>
                  {c.preview && (
                    <Text style={{ ...mobileType.body, color: "var(--ax-colors-fg-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                      {c.preview}
                    </Text>
                  )}
                </Box>
              ))
            )}
          </Box>
        </Box>
      )}

      {/* ── Header: persistent avatar + H2 title + pill button container ── */}
      <Box
        display="flex"
        alignItems="center"
        gap="12"
        style={{ padding: "14px 20px 10px", flexShrink: 0 }}
      >
        {onHamburger ? (
          <Box onClick={onHamburger} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ax-colors-fg-secondary)", flexShrink: 0 }}>
            <IconMenu />
          </Box>
        ) : (
          <Avatar name="Jamie Cohen" src="/avatars/jc.png" size="lg" onClick={onAvatarClick} style={{ flexShrink: 0, cursor: onAvatarClick ? "pointer" : "default" }} />
        )}
        <Heading level="2" style={{ flex: 1 }}>Messages</Heading>
        <Box style={{
          display: "flex", alignItems: "center",
          border: "1px solid var(--ax-colors-border-secondary)",
          borderRadius: 20,
          padding: "0 8px",
          flexShrink: 0,
        }}>
          <Button appearance="subtle" size="lg" aria-label="Search"
            icon={<IconSearch style={{ width: 22, height: 22 }} />}
            style={{ width: 40, height: 40, padding: 0 }}
            onClick={openSearch}
          />
          <Button appearance="subtle" size="lg" aria-label="New message"
            icon={<IconPenToSquare style={{ width: 20, height: 20 }} />}
            style={{ width: 40, height: 40, padding: 0 }}
            onClick={onCompose}
          />
        </Box>
      </Box>

      {/* ── Filter chips — iridescent gradient, icon above + label below ── */}
      <Box style={{ flexShrink: 0, display: "flex", gap: 8, padding: "0 12px 12px", overflowX: "auto", scrollbarWidth: "none" }}>
        {([
          {
            key: "catchup" as const,
            label: "Catch up",
            icon: <IconSparkles style={{ width: 20, height: 20 }} />,
          },
          {
            key: "unread" as const,
            label: "Unread",
            icon: <IconGlassesRound style={{ width: 20, height: 20 }} />,
          },
          {
            key: "mentions" as const,
            label: "Mentions",
            icon: (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M18 10A8 8 0 1 1 10 2c2.6 0 4.9 1.2 6.4 3.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M16.4 5.1V11a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            ),
          },
          {
            key: "needs" as const,
            label: "Needs you",
            icon: (
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                <path d="M9 1.5C6.51 1.5 4.5 3.51 4.5 6v4L3 12h12l-1.5-2V6c0-2.49-2.01-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M7 15a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            ),
          },
        ] as const).map(({ key, label, icon }) => {
          const isActive = filter === key;
          const isCatchup = key === "catchup";
          return (
            <Box
              key={key}
              onClick={() => {
                if (isCatchup) { onCatchup(); return; }
                setFilter(isActive ? null : key as Filter);
              }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 6, padding: 8, minWidth: 62, borderRadius: 12, cursor: "pointer",
                background: isActive
                  ? "linear-gradient(135deg, rgba(186,158,245,0.25) 0%, rgba(119,236,133,0.2) 100%)"
                  : "linear-gradient(135deg, rgba(186,158,245,0.12) 0%, rgba(119,236,133,0.1) 100%)",
                border: isActive ? "1px solid rgba(186,158,245,0.4)" : "1px solid transparent",
                color: isActive ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
                transition: "all 0.15s",
                flexShrink: 0,
              }}
            >
              {icon}
              <Text style={{
                fontFamily: "var(--ax-fontFamily-mono, 'Roboto Mono', monospace)",
                ...mobileType.caps, fontWeight: 400,
                color: isActive ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
                whiteSpace: "nowrap",
              }}>
                {label}
              </Text>
            </Box>
          );
        })}
      </Box>

      {/* ── List ────────────────────────────────────────────────────── */}
      <Box style={{ flex: 1, overflowY: "auto" }}>
        {/* Pinned Opal contact — first row when folded */}
        {foldOpal && (
          <Box display="flex" alignItems="center" gap="12" onClick={onOpalClick}
            style={{ padding: "10px 16px", cursor: "pointer", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
            <Box style={{ width: 50, height: 50, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/opal_avatar.png" alt="Opal" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
            </Box>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ ...mobileType.primary, fontWeight: 600, color: "var(--ax-colors-fg-default)" }}>Opal</Text>
              <Text style={{ ...mobileType.body, color: "var(--ax-colors-fg-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Optimizely AI</Text>
            </Box>
          </Box>
        )}
        {(isUnreadMode || isNeedsMode) && filteredDMs.length === 0 && filteredGroups.length === 0 && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" style={{ paddingTop: 64, gap: 8 }}>
            <Text color="fg.tertiary" style={{ fontSize: 32 }}>✓</Text>
            <Text fontWeight="600" color="fg.default" style={{ ...mobileType.sectionHeader }}>All caught up!</Text>
            <Text color="fg.tertiary" style={{ ...mobileType.body }}>No unread conversations</Text>
          </Box>
        )}

        {/* In unread/needs mode: flat list, no section labels */}
        {(isUnreadMode || isNeedsMode) ? (
          <>
            {filteredDMs.map((dm, i) => (
              <DMRow key={dm.id} dm={dm} onSelect={onSelect} delay={i * 22} showPreview={showPreview} />
            ))}
            {filteredGroups.map((g, i) => (
              <GroupRow key={g.id} group={g} onSelect={onSelect} delay={(filteredDMs.length + i) * 22} showPreview={showPreview} />
            ))}
          </>
        ) : (
          <>
            {filteredDMs.length > 0 && (
              <Section label="Direct Messages">
                {filteredDMs.map((dm, i) => (
                  <DMRow key={dm.id} dm={dm} onSelect={onSelect} delay={i * 22} showPreview={showPreview} />
                ))}
              </Section>
            )}
            {filteredGroups.length > 0 && (
              <Section label="Group Chats">
                {filteredGroups.map((g, i) => (
                  <GroupRow key={g.id} group={g} onSelect={onSelect} delay={i * 22} showPreview={showPreview} />
                ))}
              </Section>
            )}
            {filteredDMs.length === 0 && filteredGroups.length === 0 && (
              <Box display="flex" alignItems="center" justifyContent="center" pt="48">
                <Text color="fg.tertiary" fontSize="md">No conversations</Text>
              </Box>
            )}
          </>
        )}

        <Box style={{ height: 16 }} />
      </Box>
    </Box>
  );
}

// Section label — Roboto Mono, 12px, uppercase, tertiary (Figma: font-family-caption)
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Box style={{ padding: "20px 16px 4px" }}>
        <Text style={{
          fontFamily: "var(--ax-fontFamily-mono, 'Roboto Mono', monospace)",
          ...mobileType.meta, fontWeight: 400,
          color: "var(--ax-colors-fg-tertiary)",
          textTransform: "uppercase", letterSpacing: "0.03em",
        }}>
          {label}
        </Text>
      </Box>
      {children}
    </Box>
  );
}

// DM row — 50×50 wrapper, 48×48 avatar at (1,1), 12×12 presence dot at (37,37)
// Matches Figma dm_block pattern exactly (node I276:48055)
function DMRow({ dm, onSelect, delay, showPreview = true }: { dm: DMItem; onSelect: (id: string) => void; delay: number; showPreview?: boolean }) {
  const lastMsg = getLastMessage(dm.id);
  const lastTime = getLastTime(dm.id);
  const [pressed, setPressed] = useState(false);

  const presenceColor = dm.status === "active"
    ? "var(--ax-colors-fg-success)"
    : dm.status === "away"
    ? "var(--ax-colors-fg-warning)"
    : "var(--ax-colors-fg-error)";

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="12"
      className="mobile-bubble-stagger"
      onClick={() => onSelect(dm.id)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        padding: "10px 16px",
        cursor: "pointer",
        background: pressed ? "var(--ax-colors-bg-secondary)" : "transparent",
        transition: "background 0.1s",
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Avatar wrap: 50×50 — avatar 48×48 at (1,1), presence dot at (37,37) */}
      <Box style={{ position: "relative", width: 50, height: 50, flexShrink: 0 }}>
        <Avatar
          name={dm.name}
          src={dm.avatar || undefined}
          size="lg"
          colorScheme={dm.isVAU ? "purple" : "neutral"}
          style={{ position: "absolute", left: 1, top: 1, width: 48, height: 48 }}
        />
        {dm.status && (
          <Box style={{
            position: "absolute", left: 37, top: 37,
            width: 12, height: 12, borderRadius: "50%",
            background: presenceColor,
            border: "2px solid var(--ax-colors-bg-default)",
          }} />
        )}
      </Box>

      <Box style={{ flex: 1, minWidth: 0 }}>
        {/* Name row */}
        <Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
          <Box display="flex" alignItems="center" gap="6" style={{ flex: 1, minWidth: 0 }}>
            <Text style={{
              ...mobileType.primary, fontWeight: 500,
              color: "var(--ax-colors-fg-default)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {dm.name}
            </Text>
            {dm.isVAU && (
              <Badge intent="information" style={{ flexShrink: 0 }}>AI</Badge>
            )}
          </Box>
          <Text style={{ ...mobileType.meta, color: "var(--ax-colors-fg-tertiary)", whiteSpace: "nowrap", flexShrink: 0 }}>
            {lastTime}
          </Text>
        </Box>
        {/* Preview row */}
        <Box display="flex" alignItems="center" gap="8" style={{ marginTop: 2 }}>
          {showPreview && (
            <Text style={{
              ...mobileType.body,
              color: "var(--ax-colors-fg-secondary)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              flex: 1, minWidth: 0,
            }}>
              {lastMsg || "No messages yet"}
            </Text>
          )}
          {dm.needsAction === "approval" && <Badge intent="warning" style={{ flexShrink: 0 }}>Needs approval</Badge>}
          {dm.needsAction === "question" && <Badge intent="information" style={{ flexShrink: 0 }}>Needs input</Badge>}
          {dm.needsAction === "review"   && <Badge intent="success"     style={{ flexShrink: 0 }}>Ready to review</Badge>}
          {!dm.needsAction && dm.unread ? (
            <Box style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ax-colors-fg-information-strong)", flexShrink: 0 }} />
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}

// Group row — same 50×50 wrapper pattern, emoji circle inside
function GroupRow({ group, onSelect, delay, showPreview = true }: { group: GroupItem; onSelect: (id: string) => void; delay: number; showPreview?: boolean }) {
  const lastMsg = getLastMessage(group.id);
  const lastTime = getLastTime(group.id);
  const [pressed, setPressed] = useState(false);

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="12"
      className="mobile-bubble-stagger"
      onClick={() => onSelect(group.id)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        padding: "10px 16px",
        cursor: "pointer",
        background: pressed ? "var(--ax-colors-bg-secondary)" : "transparent",
        transition: "background 0.1s",
        animationDelay: `${delay}ms`,
      }}
    >
      {/* 50×50 wrapper — emoji circle 36×36 centered */}
      <Box style={{ position: "relative", width: 50, height: 50, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box style={{
          width: 36, height: 36, borderRadius: 18,
          background: "var(--ax-colors-bg-secondary)",
          border: "1px solid var(--ax-colors-border-secondary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>
          {group.emoji}
        </Box>
      </Box>

      <Box style={{ flex: 1, minWidth: 0 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
          <Text style={{
            ...mobileType.primary, fontWeight: 500,
            color: "var(--ax-colors-fg-default)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
          }}>
            {group.name}
          </Text>
          <Text style={{ ...mobileType.meta, color: "var(--ax-colors-fg-tertiary)", whiteSpace: "nowrap", flexShrink: 0 }}>
            {lastTime}
          </Text>
        </Box>
        <Box display="flex" alignItems="center" gap="8" style={{ marginTop: 2 }}>
          {showPreview && (
            <Text style={{
              ...mobileType.body,
              color: "var(--ax-colors-fg-secondary)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              flex: 1, minWidth: 0,
            }}>
              {lastMsg || "No messages yet"}
            </Text>
          )}
          {group.unread ? (
            <Box style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ax-colors-fg-information-strong)", flexShrink: 0 }} />
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
