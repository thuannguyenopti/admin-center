"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { Box, Text, Button, SearchInput, Menu, MenuTrigger, MenuContent, Tooltip, Indicator } from "@optiaxiom/react";
import { DetailsPanel, DetailsPanelHeader, DetailsPanelBody } from "@optiaxiom/react/unstable";
import { IconXmark, IconSquareCheck, IconPenToSquare, IconListCheck, IconFileLines, IconMagnifyingGlass, IconSliders, IconThumbtack, IconThumbtackSolid } from "@optiaxiom/icons";
import type { Task } from "./types";
import { RICH_GROUPS } from "./data";
import { QuickAddInline } from "./components/QuickAddInline";
import { BoardView } from "./components/BoardView";
import { PlannerRichList } from "./components/PlannerRichList";
import { PlannerReadyList } from "./components/PlannerReadyList";
import { FunEditorialBoard } from "./components/FunEditorialBoard";
import { TrackerFilterPopover } from "./components/TrackerFilterPopover";
import { DetailPanel } from "./components/DetailPanel";
import { NoteEditor } from "./components/NoteEditor";
import { useSessionTasks, readPinnedIds, PIN_EVENT } from "./useSessionTasks";
import { usePlannerLabel } from "./usePlannerLabel";
import { useTrayDesign } from "./useTrayDesign";
import { DEFAULT_FILTERS, filtersActive, collectAddedBy, type TrackerFilters } from "./filters";

// Compact tracker in the global aside (the "Top" placement) — mirrors the
// notification tray: fixed, resizable width shared by the list and the
// drill-in detail page (with a back breadcrumb).
export function TrackerPanel({ onClose }: { onClose: () => void }) {
  const plannerLabel = usePlannerLabel();
  const trayDesign = useTrayDesign();
  const [selected, setSelected] = useState<Task | null>(null);
  const [extras, addTask] = useSessionTasks();
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [composerType, setComposerType] = useState<"task" | "note">("task");
  const [focusBody, setFocusBody] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const toggleSearch = () => {
    setSearchOpen((open) => {
      if (open) setQuery("");
      return !open;
    });
  };

  // Header filter (Type + Created by) — applied to every design's list.
  const [filters, setFilters] = useState<TrackerFilters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  // Count of pinned cards — drives the header "Pinned" quick-toggle, kept live
  // as cards are pinned / unpinned.
  const [pinnedCount, setPinnedCount] = useState(0);
  useEffect(() => {
    const sync = () => setPinnedCount(readPinnedIds().size);
    sync();
    window.addEventListener(PIN_EVENT, sync);
    return () => window.removeEventListener(PIN_EVENT, sync);
  }, []);
  // "Added by" options — me + the virtual teammates who added a card to the
  // planner sections (+ items added this session), not a global roster.
  const creators = useMemo(
    () => collectAddedBy([...RICH_GROUPS.flatMap((g) => g.tasks), ...extras]),
    [extras],
  );
  // Close the filter popover on outside click (but not when interacting with the
  // Created-by menu, which portals outside this popover).
  useEffect(() => {
    if (!filterOpen) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Ignore clicks inside the Added-by dropdown, which portals outside this
      // popover (a searchable combobox — guard the Radix popper wrapper, not
      // just role="menu", or selecting an option would close the popover first).
      const inPortal = target.closest('[data-radix-popper-content-wrapper]') || target.closest('[role="menu"]') || target.closest('[role="listbox"]');
      if (filterRef.current && !filterRef.current.contains(target) && !inPortal) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [filterOpen]);

  // Resizable width (shared by list + detail so they never jump size).
  const [panelWidth, setPanelWidth] = useState(480);
  const resizingRef = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const { startX, startWidth } = resizingRef.current;
      setPanelWidth(Math.max(400, Math.min(760, startWidth - (e.clientX - startX))));
    };
    const onUp = () => {
      resizingRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const startResize = (e: ReactMouseEvent<HTMLDivElement>) => {
    resizingRef.current = { startX: e.clientX, startWidth: panelWidth };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const openComposer = (type: "task" | "note") => {
    setSelected(null);
    setComposerType(type);
    setAdding(true);
  };
  const handleAdd = (task: Task, open?: boolean) => {
    addTask(task);
    if (open) {
      setAdding(false);
      setFocusBody(true);
      setSelected(task);
    }
  };

  const selectTask = (t: Task) => {
    setFocusBody(false);
    setSelected(t);
  };

  const back = () => setSelected(null);
  const handleDelete = (t: Task) => {
    setDeletedIds((prev) => new Set([...prev, t.id]));
    setSelected(null);
  };

  return (
    <Box h="full" style={{ width: panelWidth, position: "relative" }}>
      {/* Resize handle */}
      <Box
        aria-label="Resize tracker"
        onMouseDown={startResize}
        h="full"
        style={{ position: "absolute", left: 0, top: 0, width: 8, transform: "translateX(-50%)", cursor: "col-resize", zIndex: 20 }}
      >
        <Box h="full" bg="bg.tertiary" style={{ position: "absolute", left: "50%", top: 0, width: 1, transform: "translateX(-50%)", opacity: 0.7 }} />
      </Box>

      {selected ? (
        selected.itemType === "note" ? (
          <NoteEditor key={selected.id} task={selected} autoFocusBody={focusBody} onBack={back} onClose={onClose} onDelete={handleDelete} />
        ) : (
          <DetailPanel key={selected.id} task={selected} autoFocusBody={focusBody} onBack={back} onClose={onClose} onDelete={handleDelete} />
        )
      ) : (
        <DetailsPanel h="full" w="full" bg="bg.default" overflow="hidden">
          <DetailsPanelHeader
            className="planner-detail-header"
            px="16"
            py="12"
            addonAfter={
              <Box display="flex" gap="4" alignItems="center">
                <Button
                  appearance="subtle"
                  size="md"
                  aria-label="Search"
                  icon={<IconMagnifyingGlass />}
                  onClick={toggleSearch}
                  style={searchOpen ? { color: "var(--ax-colors-fg-accent-strong)" } : undefined}
                />
                <Menu
                  options={[
                    {
                      label: "To-do",
                      addon: (
                        <Box display="flex" alignItems="center" gap="8">
                          <Box style={{ width: 3, height: 18, borderRadius: 999, background: "var(--ax-colors-fg-information)", flexShrink: 0 }} />
                          <IconListCheck size="16" style={{ color: "var(--ax-colors-fg-information)" }} />
                        </Box>
                      ),
                      execute: () => openComposer("task"),
                    },
                    {
                      label: "Note",
                      addon: (
                        <Box display="flex" alignItems="center" gap="8">
                          <Box style={{ width: 3, height: 18, borderRadius: 999, background: "var(--ax-colors-border-control)", flexShrink: 0 }} />
                          <IconFileLines size="16" style={{ color: "var(--ax-colors-fg-default)" }} />
                        </Box>
                      ),
                      execute: () => openComposer("note"),
                    },
                  ]}
                >
                  <MenuTrigger asChild>
                    <Button appearance="subtle" size="md" aria-label="Add" icon={<IconPenToSquare />} />
                  </MenuTrigger>
                  <MenuContent />
                </Menu>
                <Button appearance="subtle" size="md" aria-label="Close" icon={<IconXmark />} onClick={onClose} />
              </Box>
            }
          >
            <Box display="flex" alignItems="center" gap="8">
              <Box display="inline-flex" color="fg.tertiary" style={{ flexShrink: 0 }}>
                <IconSquareCheck size="20" />
              </Box>
              <Text fontWeight="500" fontSize="lg">{plannerLabel}</Text>
              {/* Pinned quick-toggle — only when something is pinned; toggles the
                  pinned-only filter (accent when active). */}
              {pinnedCount > 0 && (
                <Tooltip content={filters.pinnedOnly ? "Show all" : "Show pinned only"} delayDuration={200}>
                  <Button
                    appearance="subtle"
                    size="sm"
                    aria-label={filters.pinnedOnly ? "Show all" : "Show pinned only"}
                    icon={filters.pinnedOnly ? <IconThumbtackSolid /> : <IconThumbtack />}
                    onClick={() => setFilters((f) => ({ ...f, pinnedOnly: !f.pinnedOnly }))}
                    style={filters.pinnedOnly ? { color: "var(--ax-colors-fg-accent-strong)" } : undefined}
                  >
                    {pinnedCount}
                  </Button>
                </Tooltip>
              )}
            </Box>
          </DetailsPanelHeader>

          <DetailsPanelBody p="0" flex="1" display="flex" flexDirection="column" overflow="hidden" style={{ minHeight: 0, ...(trayDesign === "fun" || trayDesign === "ready" ? { background: "var(--ax-colors-bg-secondary)" } : {}) }}>
            {searchOpen && (
              <Box px="8" pt="12" pb="4" display="flex" alignItems="center" gap="8" style={{ flexShrink: 0 }}>
                <Box flex="1" style={{ minWidth: 0 }}>
                  <SearchInput autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tracker" />
                </Box>
                <Box ref={filterRef} style={{ position: "relative", flexShrink: 0 }}>
                  {/* Axiom Indicator floats an active-filter dot on the button
                      (no content = a plain dot; sized by the component). */}
                  <Indicator disabled={!filtersActive(filters)} intent="information" variant="strong">
                    <Tooltip content="Filter" delayDuration={200}>
                      <Button
                        appearance="default"
                        size="md"
                        aria-label="Filter"
                        icon={<IconSliders />}
                        onClick={() => setFilterOpen((o) => !o)}
                        style={filterOpen || filtersActive(filters) ? { color: "var(--ax-colors-fg-accent-strong)" } : undefined}
                      />
                    </Tooltip>
                  </Indicator>
                  {filterOpen && <TrackerFilterPopover filters={filters} creators={creators} onChange={setFilters} />}
                </Box>
              </Box>
            )}
            {adding && <QuickAddInline itemType={composerType} onAdd={handleAdd} onClose={() => setAdding(false)} />}
            {trayDesign === "rich" ? (
              <PlannerRichList extraTasks={extras} deletedIds={deletedIds} onSelectTask={selectTask} px="0" query={searchOpen ? query : ""} filter={filters} />
            ) : trayDesign === "ready" ? (
              <PlannerReadyList extraTasks={extras} deletedIds={deletedIds} onSelectTask={selectTask} px="0" query={searchOpen ? query : ""} filter={filters} />
            ) : trayDesign === "fun" ? (
              <FunEditorialBoard extraTasks={extras} deletedIds={deletedIds} onSelectTask={selectTask} query={searchOpen ? query : ""} filter={filters} />
            ) : (
              <BoardView extraTasks={extras} deletedIds={deletedIds} onSelectTask={selectTask} px="8" query={searchOpen ? query : ""} filter={filters} />
            )}
          </DetailsPanelBody>
        </DetailsPanel>
      )}
    </Box>
  );
}
