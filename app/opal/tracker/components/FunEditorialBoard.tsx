"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Text, Button, Tooltip, Badge, Avatar, Input } from "@optiaxiom/react";
import { IconTrashCan, IconArrowUp, IconChevronUp, IconChevronDown, IconPlus, IconSparkles, IconBell } from "@optiaxiom/icons";
import type { Task } from "../types";
import { RICH_GROUPS, RICH_UNSORTED } from "../data";
import { readDoneIds, markDone, markUndone, pushTrash, readTrash, removeTrash } from "../useSessionTasks";
import { passesFilter, filtersActive, type TrackerFilters } from "../filters";

// "Fun" tray design. The playful illustrated-icon visual from Figma 68:453 is
// reserved for CATEGORIES (section headers); individual task cards are simpler
// paper cards with a small author avatar. Cards tilt subtly and toss to a bin.
const COPY_BG = "#f6faf3"; // colors/neutral/50 — the tinted body box
// One illustrated icon per category.
// One illustrated icon per category (the 68:453 "capability" visual).
const CAT_ICONS: Record<string, string> = {
  "Follow-up": "/planner-fun/track.png",
  "Campaign Q3": "/planner-fun/nudge.png",
  "IM Research": "/planner-fun/research.svg",
  Unsorted: "/planner-fun/recap.png",
};
const catIcon = (name: string) => CAT_ICONS[name] ?? "/planner-fun/brief.png";

// Owner avatar — used on every card and in the drawer — message clips use the sender's avatar,
// you-created items use your avatar, Chat items use Opal.
function ownerAvatar(task: Task): string | undefined {
  // "Me" always resolves to the current profile avatar (ignores a stale stored one).
  if (task.createdBy === "You" || task.avatarName === "You") return "/avatars/avatar-3.png";
  if (task.avatarSrc) return task.avatarSrc;
  const fromChat = (task.createdIn ?? "Chat") === "Chat";
  return fromChat ? "/opal-icon-nav.png" : undefined;
}

const clamp = (lines: number) => ({
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical" as const,
  overflow: "hidden",
});

function snippet(task: Task): string {
  if (task.preview) return `${task.preview.emoji ? task.preview.emoji + " " : ""}${task.preview.title}`;
  if (task.description) return task.description;
  const items = task.checklistGroups?.flatMap((g) => g.items) ?? [];
  return items.map((i) => (i.bold ?? "") + i.text).join("  ");
}

function kickerFor(task: Task): string {
  return task.badgeLabel ?? task.checklistSource ?? (task.reminder ? "Reminder" : "Note");
}

function PaperCard({ task, tilt, onSelect, onToss }: { task: Task; tilt: number; onSelect: () => void; onToss: (t: Task) => void }) {
  const [tossing, setTossing] = useState(false);
  const text = snippet(task);
  const src = ownerAvatar(task);
  const toss = (e: React.MouseEvent) => { e.stopPropagation(); setTossing(true); };

  return (
    <Box
      className={tossing ? "fun-doc fun-crumpling" : "fun-doc"}
      onClick={tossing ? undefined : onSelect}
      onAnimationEnd={() => tossing && onToss(task)}
      bg="bg.default"
      rounded="lg"
      shadow="sm"
      p="16"
      border="1"
      borderColor="border.secondary"
      style={{ cursor: "pointer", position: "relative", transform: `rotate(${tilt}deg)`, transformOrigin: "center" }}
    >
      {/* Toss — danger-outline confirm; hovering it previews the strike-through. */}
      <Box className="fun-doc-actions" style={{ position: "absolute", top: 12, right: 12, zIndex: 1 }}>
        <Button className="fun-done-btn" appearance="danger-outline" size="sm" icon={<IconTrashCan />} onClick={toss}>Toss</Button>
      </Box>

      {task.previewImage && (
        <Box mb="12" rounded="md" overflow="hidden" border="1" borderColor="border.secondary">
          <img src={task.previewImage} alt="" style={{ display: "block", width: "100%", height: "auto" }} />
        </Box>
      )}

      <Box display="flex" gap="12" alignItems="center" style={{ paddingRight: 72 }}>
        {task.reminder ? (
          <Box display="inline-flex" alignItems="center" justifyContent="center" rounded="full" bg="bg.secondary" color="fg.tertiary" style={{ width: 32, height: 32, flexShrink: 0 }}>
            <IconBell size={16} />
          </Box>
        ) : src ? (
          <img src={src} alt="" width={32} height={32} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <Avatar size="md" colorScheme="purple" name={task.avatarName ?? task.title} />
        )}
        <Box flex="1" display="flex" flexDirection="column" gap="4" style={{ minWidth: 0 }}>
          <Text fontSize="md" fontWeight="600" color="fg.default" style={clamp(2)}>
            <span className="fun-doc-title">{task.title}</span>
          </Text>
          <Text fontFamily="mono" fontSize="xs" fontWeight="400" color="fg.secondary" textTransform="uppercase">{kickerFor(task)}</Text>
        </Box>
      </Box>

      {text && (
        <Box mt="12" rounded="md" px="16" py="12" style={{ background: COPY_BG }}>
          <Text fontSize="sm" color="fg.secondary" style={clamp(3)}>{text}</Text>
        </Box>
      )}

      {task.due && (
        <Text fontSize="sm" color={task.overdue ? "fg.warning.strong" : "fg.tertiary"} mt="8">{task.due}</Text>
      )}
    </Box>
  );
}

export function FunEditorialBoard({
  extraTasks,
  deletedIds,
  onSelectTask,
  query = "",
  filter,
}: {
  extraTasks: Task[];
  deletedIds: Set<string>;
  onSelectTask: (t: Task) => void;
  query?: string;
  filter?: TrackerFilters;
}) {
  const [hiddenDone, setHiddenDone] = useState(() => readDoneIds());
  const [gone, setGone] = useState<Set<string>>(new Set());
  const [binWiggle, setBinWiggle] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [trashItems, setTrashItems] = useState<Task[]>([]);
  const [trashCount, setTrashCount] = useState(() => readTrash().length);
  const [unsortedOpen, setUnsortedOpen] = useState(false);
  const [shownCounts, setShownCounts] = useState<Record<string, number>>({});
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const wiggleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const binRef = useRef<HTMLDivElement>(null);
  // Trailing "Unsorted" shelf — clipped/added items park here (Dia-style) until
  // dragged up into a section or sorted by Opal.
  const [sections, setSections] = useState(() => [
    ...RICH_GROUPS.map((g) => ({ name: g.name, tasks: g.tasks })),
    { name: "Unsorted", tasks: [...RICH_UNSORTED] },
  ]);
  const dragId = useRef<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  useEffect(() => {
    setSections((prev) => {
      const existing = new Set(prev.flatMap((s) => s.tasks.map((t) => t.id)));
      const newOnes = extraTasks.filter((t) => !existing.has(t.id));
      if (!newOnes.length) return prev;
      return prev.map((s) => (s.name === "Unsorted" ? { ...s, tasks: [...newOnes, ...s.tasks] } : s));
    });
  }, [extraTasks]);

  useEffect(() => () => { if (wiggleTimer.current) clearTimeout(wiggleTimer.current); }, []);

  // Close the trash list on outside click.
  useEffect(() => {
    if (!trashOpen) return;
    const onDown = (e: MouseEvent) => {
      if (binRef.current && !binRef.current.contains(e.target as Node)) setTrashOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [trashOpen]);

  const toss = (task: Task) => {
    pushTrash(task);
    setTrashCount(readTrash().length);
    markDone(task.id);
    setGone((prev) => new Set([...prev, task.id]));
    setBinWiggle(true);
    if (wiggleTimer.current) clearTimeout(wiggleTimer.current);
    wiggleTimer.current = setTimeout(() => setBinWiggle(false), 450);
  };

  const reset = () => { dragId.current = null; setActiveId(null); setOverId(null); };
  const moveBefore = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setSections((prev) => {
      const next = prev.map((s) => ({ ...s, tasks: [...s.tasks] }));
      let from = -1;
      let fromIdx = -1;
      next.forEach((s, si) => {
        const fi = s.tasks.findIndex((t) => t.id === fromId);
        if (fi >= 0) { from = si; fromIdx = fi; }
      });
      if (from < 0) return prev;
      const [moved] = next[from].tasks.splice(fromIdx, 1);
      const toSection = next.find((s) => s.tasks.some((t) => t.id === toId));
      if (!toSection) return prev;
      const insertAt = toSection.tasks.findIndex((t) => t.id === toId);
      toSection.tasks.splice(insertAt, 0, moved);
      return next;
    });
  };
  const rowProps = (id: string) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      dragId.current = id;
      setActiveId(id);
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData("text/plain", id); } catch { /* ignore */ }
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      if (dragId.current && dragId.current !== id) setOverId(id);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      if (dragId.current) moveBefore(dragId.current, id);
      reset();
    },
    onDragEnd: reset,
  });

  // Add a new section (kept before the Unsorted shelf).
  const confirmAddSection = () => {
    const name = newSectionName.trim();
    if (name) {
      setSections((prev) => {
        const idx = prev.findIndex((s) => s.name === "Unsorted");
        const at = idx >= 0 ? idx : prev.length;
        const next = [...prev];
        next.splice(at, 0, { name, tasks: [] });
        return next;
      });
    }
    setNewSectionName("");
    setAddingSection(false);
  };

  const toggleTrash = () => {
    const items = readTrash();
    setTrashItems(items);
    setTrashCount(items.length);
    setTrashOpen((o) => !o);
  };

  // Restore a tossed card — it reappears in its section.
  const restore = (id: string) => {
    markUndone(id);
    removeTrash(id);
    setTrashCount(readTrash().length);
    setGone((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setHiddenDone((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setTrashItems((prev) => prev.filter((t) => t.id !== id));
  };

  // Mock "Opal sort" — files everything on the Unsorted shelf into a section.
  const sortWithOpal = () => {
    setSections((prev) => {
      const unsorted = prev.find((s) => s.name === "Unsorted");
      if (!unsorted || unsorted.tasks.length === 0) return prev;
      const items = unsorted.tasks;
      return prev.map((s, i) => {
        if (s.name === "Unsorted") return { ...s, tasks: [] };
        if (i === 0) return { ...s, tasks: [...s.tasks, ...items] };
        return s;
      });
    });
  };
  // File a single unsorted item into the first section.
  const fileOne = (id: string) => {
    setSections((prev) => {
      const uns = prev.find((s) => s.name === "Unsorted");
      const task = uns?.tasks.find((t) => t.id === id);
      if (!task) return prev;
      return prev.map((s, i) => {
        if (s.name === "Unsorted") return { ...s, tasks: s.tasks.filter((t) => t.id !== id) };
        if (i === 0) return { ...s, tasks: [...s.tasks, task] };
        return s;
      });
    });
  };

  const anyFilter = query.trim().length > 0 || (filter ? filtersActive(filter) : false);
  const unsortedTasks = (sections.find((s) => s.name === "Unsorted")?.tasks ?? []).filter(
    (t) => !deletedIds.has(t.id) && !hiddenDone.has(t.id) && !gone.has(t.id) && passesFilter(t, filter, query),
  );

  return (
    <Box flex="1" display="flex" flexDirection="column" style={{ minHeight: 0, background: "var(--ax-colors-bg-secondary)" }}>
      {/* Sections scroll above the drawer (Unsorted lives in the drawer). */}
      <Box flex="1" overflow="auto" px="16" pt="8" pb="12" style={{ minHeight: 0 }}>
        {sections.map((section) => {
          if (section.name === "Unsorted") return null;
          const visible = section.tasks.filter(
            (t) => !deletedIds.has(t.id) && !hiddenDone.has(t.id) && !gone.has(t.id) && passesFilter(t, filter, query),
          );
          if (anyFilter && visible.length === 0) return null;
          const shown = shownCounts[section.name] ?? 6;
          return (
            <Box key={section.name} mb="16">
              {/* Category header — illustrated 68:453 visual (icon + title + caption). */}
              <Box px="2" pt="12" pb="8" display="flex" alignItems="center" gap="12">
                <img src={catIcon(section.name)} alt="" width={44} height={44} style={{ width: 44, height: 44, flexShrink: 0, objectFit: "contain" }} />
                <Box flex="1" display="flex" flexDirection="column" style={{ minWidth: 0 }}>
                  <Text fontSize="lg" fontWeight="600" color="fg.default" truncate>{section.name}</Text>
                  <Text fontFamily="mono" fontSize="xs" fontWeight="400" color="fg.secondary" textTransform="uppercase">{visible.length} item{visible.length === 1 ? "" : "s"}</Text>
                </Box>
              </Box>
              <Box display="flex" flexDirection="column" gap="8">
                {visible.slice(0, shown).map((task, i) => (
                  <Box
                    key={task.id}
                    {...rowProps(task.id)}
                    rounded="lg"
                    style={{
                      opacity: activeId === task.id ? 0.4 : 1,
                      outline: overId === task.id ? "2px dashed var(--ax-colors-border-accent)" : "2px dashed transparent",
                      outlineOffset: 2,
                      transition: "outline-color 120ms ease",
                    }}
                  >
                    <PaperCard task={task} tilt={i % 2 ? 1.2 : -1.2} onSelect={() => onSelectTask(task)} onToss={toss} />
                  </Box>
                ))}
              </Box>
              {visible.length > shown && (
                <Box pt="8" px="2">
                  <Button appearance="subtle" size="sm" onClick={() => setShownCounts((p) => ({ ...p, [section.name]: shown + 6 }))}>
                    Show {Math.min(6, visible.length - shown)} more
                  </Button>
                </Box>
              )}
            </Box>
          );
        })}

        {addingSection ? (
          <Box mx="2" mt="8" style={{ maxWidth: 320 }}>
            <Input
              autoFocus
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmAddSection();
                if (e.key === "Escape") { setAddingSection(false); setNewSectionName(""); }
              }}
              onBlur={confirmAddSection}
              placeholder="Section name…"
            />
          </Box>
        ) : (
          <Box display="flex" alignItems="center" gap="8" py="10" px="2" color="fg.tertiary" onClick={() => setAddingSection(true)} style={{ cursor: "pointer" }}>
            <IconPlus size="16" />
            <Text fontSize="sm" color="fg.tertiary">Add section</Text>
          </Box>
        )}
      </Box>

      {/* Unsorted drawer — pinned at the bottom (Dia-style); green board runs through. */}
      <Box ref={binRef} style={{ position: "relative", flexShrink: 0, background: "var(--ax-colors-bg-secondary)", borderTop: "1px solid var(--ax-colors-border-secondary)" }}>
        {/* Recently-tossed popover */}
        {trashOpen && (
          <Box rounded="lg" shadow="lg" bg="bg.default" style={{ position: "absolute", right: 12, bottom: 56, width: 280, maxHeight: 320, display: "flex", flexDirection: "column", border: "1px solid var(--ax-colors-border-secondary)", overflow: "hidden", zIndex: 20 }}>
            <Box px="12" py="8" borderB="1" borderColor="border.secondary" display="flex" alignItems="center" justifyContent="space-between" style={{ flexShrink: 0 }}>
              <Text fontSize="sm" fontWeight="500" color="fg.default">Recently tossed</Text>
              <Badge intent="neutral">{trashItems.length}</Badge>
            </Box>
            <Box overflow="auto" p="4" style={{ minHeight: 0 }}>
              {trashItems.length === 0 ? (
                <Box p="16"><Text fontSize="sm" color="fg.tertiary">Nothing tossed yet.</Text></Box>
              ) : (
                trashItems.map((t) => (
                  <Tooltip key={t.id} content="Send back" delayDuration={200}>
                    <Box onClick={() => restore(t.id)} px="8" py="8" rounded="md" display="flex" alignItems="center" gap="8" className="tracker-row trash-item" style={{ cursor: "pointer" }}>
                      <Box color="fg.tertiary" style={{ flexShrink: 0, position: "relative", width: 14, height: 14 }}>
                        <Box className="trash-ico-default" display="inline-flex" style={{ position: "absolute", inset: 0 }}><IconTrashCan size={14} /></Box>
                        <Box className="trash-ico-hover" display="inline-flex" style={{ position: "absolute", inset: 0 }}><IconArrowUp size={14} /></Box>
                      </Box>
                      <Text className="trash-title" flex="1" fontSize="sm" color="fg.secondary" truncate>{t.title}</Text>
                      {t.due && <Text fontSize="xs" color="fg.tertiary" style={{ flexShrink: 0 }}>{t.due}</Text>}
                    </Box>
                  </Tooltip>
                ))
              )}
            </Box>
          </Box>
        )}

        {/* Expanded: fanned paper thumbnails */}
        {unsortedOpen && unsortedTasks.length > 0 && (
          <Box display="flex" gap="10" overflow="auto" px="12" pt="12" pb="8" style={{ maxHeight: 220 }}>
            {unsortedTasks.map((t, i) => {
              const src = ownerAvatar(t);
              const text = snippet(t);
              return (
                <Box key={t.id} className="fun-doc" onClick={() => onSelectTask(t)} bg="bg.default" rounded="lg" shadow="sm" p="12" border="1" borderColor="border.secondary" style={{ width: 168, flexShrink: 0, position: "relative", cursor: "pointer", transform: `rotate(${i % 2 ? 1.5 : -1.5}deg)` }}>
                  <Tooltip content="File it" delayDuration={200}>
                    <Button className="fun-doc-actions" appearance="subtle" size="sm" aria-label="File it" icon={<IconArrowUp />} onClick={(e) => { e.stopPropagation(); fileOne(t.id); }} style={{ position: "absolute", top: 6, right: 6 }} />
                  </Tooltip>
                  <Box display="flex" gap="8" alignItems="center" style={{ paddingRight: 28 }}>
                    {src && <img src={src} alt="" width={20} height={20} style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />}
                    <Text fontSize="sm" fontWeight="600" color="fg.default" style={clamp(2)}>{t.title}</Text>
                  </Box>
                  {text && <Text fontSize="xs" color="fg.tertiary" mt="6" style={clamp(2)}>{text}</Text>}
                </Box>
              );
            })}
          </Box>
        )}

        {/* Collapsed: peek chips poking above the bar */}
        {!unsortedOpen && unsortedTasks.length > 0 && (
          <Box style={{ position: "relative", height: 24, overflow: "hidden" }}>
            {unsortedTasks.slice(0, 3).map((t, i) => {
              const src = ownerAvatar(t);
              return (
                <Box key={t.id} bg="bg.default" rounded="md" shadow="sm" border="1" borderColor="border.secondary" style={{ position: "absolute", left: 12 + i * 96, bottom: -18, width: 150, height: 40, display: "flex", alignItems: "center", gap: 8, padding: "0 10px", transform: `rotate(${i % 2 ? 2 : -2}deg)`, overflow: "hidden" }}>
                  {src && <img src={src} alt="" width={18} height={18} style={{ width: 18, height: 18, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />}
                  <Text fontSize="xs" color="fg.secondary" truncate>{t.title}</Text>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Drawer handle / header */}
        <Box role="button" tabIndex={0} onClick={() => setUnsortedOpen((o) => !o)} display="flex" alignItems="center" gap="8" px="12" py="10" style={{ cursor: "pointer" }}>
          <Box display="inline-flex" color="fg.tertiary" style={{ flexShrink: 0 }}>{unsortedOpen ? <IconChevronDown /> : <IconChevronUp />}</Box>
          <Text fontSize="sm" fontWeight="500" color="fg.default">Unsorted</Text>
          <Badge intent="neutral">{unsortedTasks.length}</Badge>
          <Box flex="1" />
          {unsortedTasks.length > 0 && (
            <Tooltip content="Ask Opal to sort" delayDuration={200}>
              <Button appearance="subtle" size="sm" icon={<IconSparkles />} onClick={(e) => { e.stopPropagation(); sortWithOpal(); }}>Sort</Button>
            </Tooltip>
          )}
          <Tooltip content="Recently tossed" delayDuration={200}>
            <Box style={{ position: "relative", display: "inline-flex" }} onClick={(e) => e.stopPropagation()}>
              {trashCount > 0 && (
                <Box style={{ position: "absolute", top: -6, right: -6, pointerEvents: "none", zIndex: 0 }}>
                  <Badge intent="information">{trashCount}</Badge>
                </Box>
              )}
              <Button className={binWiggle ? "fun-bin tossing" : "fun-bin"} appearance="subtle" size="md" aria-label="Recently tossed" icon={<IconTrashCan size={20} />} onClick={toggleTrash} style={{ position: "relative", zIndex: 1 }} />
            </Box>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
