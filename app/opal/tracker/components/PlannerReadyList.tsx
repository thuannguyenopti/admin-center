"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Text, Input, Badge, Button, Tooltip, Indicator } from "@optiaxiom/react";
import { IconPlus, IconTrashCan, IconArrowUp, IconSparkles } from "@optiaxiom/icons";
import type { Task } from "../types";
import { RICH_GROUPS } from "../data";

// Opal + virtual-teammate suggestions surfaced at the top of the tray.
const RECOMMENDED_ID = "ready-recommended";
const RECOMMENDED_TASKS: Task[] = [
  {
    id: "rec1", title: "Review the Opticon keynote outline", type: "normal", createdIn: "Chat", createdBy: "Opal",
    badgeLabel: "Suggested", badgeIntent: "neutral",
    description: "Based on your calendar, Opal drafted talking points for next week's keynote.",
  },
  {
    id: "rec2", title: "Approve the Q3 social calendar", type: "normal", createdIn: "IM", createdBy: "Social Strategist",
    avatarName: "Social Strategist", avatarSrc: "/avatars/vau-poppy.png", badgeLabel: "From your workflow", badgeIntent: "neutral", commentCount: 2,
    description: "Poppy finished the draft cadence across LinkedIn, X, and the blog — ready for your sign-off.",
  },
  {
    id: "rec3", title: "Draft the newsletter A/B test", type: "normal", createdIn: "IM", createdBy: "Content Strategist",
    avatarName: "Content Strategist", avatarSrc: "/avatars/vau-mayling.png", badgeLabel: "From your workflow", badgeIntent: "neutral",
    description: "Mayling proposed two subject-line variants to test on this week's send.",
  },
];
import { readDoneIds, markDone, markUndone, pushTrash, readTrash, removeTrash, readPinnedIds, PIN_EVENT } from "../useSessionTasks";
import { passesFilter, filtersActive, type TrackerFilters } from "../filters";
import { RichPlannerCard, ChecklistPlannerCard, NotePlannerCard } from "./plannerCards";

type Section = { id: string; name: string; tasks: Task[] };

// "Good to go" (👍) tray — the Rich cards, but with the Fun toss interaction:
// no avatar→checkbox flip; a hover-revealed Toss crumples the card into a
// larger footer trash can. New/clipped cards are auto-sorted into a section
// (with a transient footer note); there's no sort button and no unsorted drawer.
function CardFor({ task, onSelect, onToss }: { task: Task; onSelect: () => void; onToss: (t: Task) => void }) {
  const common = { interaction: "toss" as const, onToss };
  if (task.itemType === "note") return <NotePlannerCard task={task} onSelect={onSelect} {...common} />;
  if (task.itemType === "checklist") return <ChecklistPlannerCard task={task} onSelect={onSelect} {...common} />;
  return <RichPlannerCard task={task} onSelect={onSelect} {...common} />;
}

export function PlannerReadyList({
  extraTasks,
  deletedIds,
  onSelectTask,
  px = "8",
  query = "",
  filter,
}: {
  extraTasks: Task[];
  deletedIds: Set<string>;
  onSelectTask: (t: Task) => void;
  px?: "0" | "8" | "16" | "24" | "32";
  query?: string;
  filter?: TrackerFilters;
}) {
  const [sections, setSections] = useState<Section[]>([
    { id: RECOMMENDED_ID, name: "Recommended", tasks: RECOMMENDED_TASKS },
    ...RICH_GROUPS.map((g, i) => ({ id: `ready-${i}-${g.name}`, name: g.name, tasks: g.tasks })),
  ]);
  const [hiddenDone, setHiddenDone] = useState(() => readDoneIds());
  const [pinnedIds, setPinnedIds] = useState(() => readPinnedIds());
  const [gone, setGone] = useState<Set<string>>(new Set());

  // Keep the pinned-id set live so the "Pinned" filter updates as cards are
  // pinned / unpinned.
  useEffect(() => {
    const handler = () => setPinnedIds(readPinnedIds());
    window.addEventListener(PIN_EVENT, handler);
    return () => window.removeEventListener(PIN_EVENT, handler);
  }, []);
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  // Toss / trash-can state (shared with the footer bin).
  const [binWiggle, setBinWiggle] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [trashItems, setTrashItems] = useState<Task[]>([]);
  const [trashCount, setTrashCount] = useState(() => readTrash().length);
  // Transient footer status shown while new cards are auto-filed.
  const [sortingMsg, setSortingMsg] = useState<string | null>(null);
  const wiggleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sortTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const binRef = useRef<HTMLDivElement>(null);

  // Auto-sort: newly captured/clipped cards drop into the first section, and the
  // footer announces it briefly (there's no unsorted shelf to park them in).
  useEffect(() => {
    setSections((prev) => {
      const existing = new Set(prev.flatMap((s) => s.tasks.map((t) => t.id)));
      const newOnes = extraTasks.filter((t) => !existing.has(t.id));
      if (!newOnes.length) return prev;
      setSortingMsg(`Sorting ${newOnes.length} new card${newOnes.length === 1 ? "" : "s"}…`);
      if (sortTimer.current) clearTimeout(sortTimer.current);
      sortTimer.current = setTimeout(() => setSortingMsg(null), 2200);
      // Drop new cards into the first real section — never the Recommended group.
      const targetIdx = Math.max(0, prev.findIndex((s) => s.id !== RECOMMENDED_ID));
      return prev.map((s, i) => (i === targetIdx ? { ...s, tasks: [...newOnes, ...s.tasks] } : s));
    });
  }, [extraTasks]);

  useEffect(
    () => () => {
      if (wiggleTimer.current) clearTimeout(wiggleTimer.current);
      if (sortTimer.current) clearTimeout(sortTimer.current);
    },
    [],
  );

  // Close the recently-tossed popover on outside click.
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

  const toggleTrash = () => {
    const items = readTrash();
    setTrashItems(items);
    setTrashCount(items.length);
    setTrashOpen((o) => !o);
  };

  const restore = (id: string) => {
    markUndone(id);
    removeTrash(id);
    setTrashCount(readTrash().length);
    setGone((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setHiddenDone((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setTrashItems((prev) => prev.filter((t) => t.id !== id));
  };

  // Drag-reorder within/between sections (same model as the Rich list).
  const dragId = useRef<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
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

  const confirmAddSection = () => {
    const name = newSectionName.trim();
    if (name) setSections((prev) => [...prev, { id: `sec-${prev.length}-${name}`, name, tasks: [] }]);
    setNewSectionName("");
    setAddingSection(false);
  };

  const anyFilter = query.trim().length > 0 || (filter ? filtersActive(filter) : false);

  return (
    <Box flex="1" display="flex" flexDirection="column" style={{ minHeight: 0 }}>
      <Box flex="1" overflow="auto" px={px} pt="4" pb="24" style={{ minHeight: 0 }}>
        {sections.map((section) => {
          const visible = section.tasks.filter(
            (t) => !deletedIds.has(t.id) && !hiddenDone.has(t.id) && !gone.has(t.id) && passesFilter(t, filter, query, pinnedIds),
          );
          if (anyFilter && visible.length === 0) return null;
          return (
            <Box key={section.id} mb="8">
              <Box display="flex" alignItems="center" justifyContent="space-between" px="8" pt="16" pb="4">
                <Box display="flex" alignItems="center" gap="6">
                  {section.id === RECOMMENDED_ID && (
                    <Box display="inline-flex" style={{ color: "var(--ax-colors-fg-accent-strong)" }}><IconSparkles size="14" /></Box>
                  )}
                  <Text fontFamily="mono" fontSize="sm" fontWeight="400" color="fg.tertiary" textTransform="uppercase">
                    {section.name}
                  </Text>
                </Box>
                <Badge intent="information" variant="strong">{visible.length}</Badge>
              </Box>

              <Box display="flex" flexDirection="column" gap="4">
                {visible.map((task) => (
                  <Box
                    key={task.id}
                    {...rowProps(task.id)}
                    rounded="md"
                    style={{
                      opacity: activeId === task.id ? 0.4 : 1,
                      outline: overId === task.id ? "2px dashed var(--ax-colors-border-accent)" : "2px dashed transparent",
                      outlineOffset: 2,
                      transition: "outline-color 120ms ease",
                    }}
                  >
                    <CardFor task={task} onSelect={() => onSelectTask(task)} onToss={toss} />
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}

        {addingSection ? (
          <Box mx="8" style={{ maxWidth: 320 }}>
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
          <Box display="flex" alignItems="center" gap="8" py="10" px="8" color="fg.tertiary" onClick={() => setAddingSection(true)} style={{ cursor: "pointer" }}>
            <IconPlus size="16" />
            <Text fontSize="sm" color="fg.tertiary">Add section</Text>
          </Box>
        )}
      </Box>

      {/* Footer bar — auto-sort status (left) + the larger trash can (right).
          No sort button, no unsorted drawer. */}
      <Box ref={binRef} style={{ position: "relative", flexShrink: 0, background: "var(--ax-colors-bg-secondary)" }}>
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

        <Box display="flex" alignItems="center" gap="8" pl="16" pr="12" style={{ height: 40 }}>
          {sortingMsg && (
            <Text fontSize="sm" color="fg.tertiary">{sortingMsg}</Text>
          )}
          <Box flex="1" />
          <Tooltip content="Recently tossed" delayDuration={200}>
            <Indicator className="trash-bin-indicator" disabled={trashCount === 0} content={trashCount} intent="information" variant="strong">
              <Button className={binWiggle ? "fun-bin tossing" : "fun-bin"} appearance="subtle" size="lg" aria-label="Recently tossed" icon={<IconTrashCan size={20} />} onClick={toggleTrash} />
            </Indicator>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
