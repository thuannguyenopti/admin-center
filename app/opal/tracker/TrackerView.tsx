"use client";

import { useEffect, useState } from "react";
import { Box, Heading, Button, SearchInput, SegmentedControl, SegmentedControlItem, Menu, MenuTrigger, MenuContent, LabelMenuButton, type MenuOption } from "@optiaxiom/react";
import { IconList, IconGrid, IconTableLayout, IconCalendar, IconPlus, IconAngleDown, IconCircleCheck, IconFilePlus } from "@optiaxiom/icons";
import { useLayout } from "@/app/context/LayoutContext";
import type { FilterTab, Task, ViewMode } from "./types";
import { QuickAddInline } from "./components/QuickAddInline";
import { ListView } from "./components/ListView";
import { BoardView } from "./components/BoardView";
import { KanbanView } from "./components/KanbanView";
import { CalendarView } from "./components/CalendarView";
import { DetailPanel } from "./components/DetailPanel";
import { NoteEditor } from "./components/NoteEditor";
import { DetailAside } from "./components/DetailAside";
import { useSessionTasks } from "./useSessionTasks";

const FILTERS: [FilterTab, string, number][] = [
  ["mine", "Mine", 8],
  ["vau", "VAU", 3],
  ["approvals", "Approvals", 2],
];

// The full Plan page (/opal/plan). Follows the standard page template like
// Agents — H1 title + control row, then a full-width view. The item detail
// opens in the global aside (below the global nav), matching the stickies
// sidebar; there's no inline master-detail panel.
export function TrackerView() {
  const { setAsideContent } = useLayout();
  const [filter, setFilter] = useState<FilterTab>("mine");
  const [view, setView] = useState<ViewMode>("list");
  const [query, setQuery] = useState("");
  const [extraTasks, addTask] = useSessionTasks();
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [composerType, setComposerType] = useState<"task" | "note">("task");

  // Clear the aside when leaving the page.
  useEffect(() => () => setAsideContent(null), [setAsideContent]);

  const openDetail = (task: Task, focusBody = false) => {
    const onClose = () => setAsideContent(null);
    const onDelete = (t: Task) => {
      setDeletedIds((prev) => new Set([...prev, t.id]));
      setAsideContent(null);
    };
    setAsideContent(
      <DetailAside>
        {task.itemType === "note" ? (
          <NoteEditor key={task.id} task={task} autoFocusBody={focusBody} onClose={onClose} onDelete={onDelete} />
        ) : (
          <DetailPanel key={task.id} task={task} autoFocusBody={focusBody} onClose={onClose} onDelete={onDelete} />
        )}
      </DetailAside>,
    );
  };

  const openComposer = (type: "task" | "note") => {
    setComposerType(type);
    setAdding(true);
  };
  const handleAdd = (task: Task, open?: boolean) => {
    addTask(task);
    if (open) {
      setAdding(false);
      openDetail(task, true);
    }
  };

  const filterLabel = FILTERS.find(([id]) => id === filter)?.[1] ?? "Filter";
  const filterOptions: MenuOption[] = FILTERS.map(([id, label, count]) => ({
    label,
    detail: String(count),
    execute: () => setFilter(id),
  }));

  return (
    <Box display="flex" flexDirection="column" bg="bg.default" overflow="hidden" style={{ height: "100%" }}>
      {/* Header — follows the standard page template (title + control row) */}
      <Box px="32" pt="24" pb="16" display="flex" flexDirection="column" gap="16" style={{ flexShrink: 0 }}>
        <Heading level="1">Plan</Heading>

        <Box display="flex" alignItems="center" justifyContent="space-between" gap="12">
          <Box display="flex" alignItems="center" gap="12">
            <Box style={{ width: 320 }}>
              <SearchInput size="lg" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
            </Box>
            <Menu options={filterOptions}>
              <MenuTrigger asChild>
                <LabelMenuButton label="Filter" h="40">{filterLabel}</LabelMenuButton>
              </MenuTrigger>
              <MenuContent />
            </Menu>
          </Box>

          <Box display="flex" alignItems="center" gap="12">
            <SegmentedControl value={view} onValueChange={(v: string) => v && setView(v as ViewMode)}>
              <SegmentedControlItem value="list" size="lg" icon={<IconList size={18} />} aria-label="List view" />
              <SegmentedControlItem value="board" size="lg" icon={<IconGrid size={18} />} aria-label="Board view" />
              <SegmentedControlItem value="kanban" size="lg" icon={<IconTableLayout size={18} />} aria-label="Kanban view" />
              <SegmentedControlItem value="calendar" size="lg" icon={<IconCalendar size={18} />} aria-label="Calendar view" />
            </SegmentedControl>
            <Menu
              options={[
                { label: "Task", addon: <IconCircleCheck size="16" />, execute: () => openComposer("task") },
                { label: "Note", addon: <IconFilePlus size="16" />, execute: () => openComposer("note") },
              ]}
            >
              <MenuTrigger asChild>
                <Button appearance="primary" size="lg" icon={<IconPlus />} addonAfter={<IconAngleDown />}>
                  Add
                </Button>
              </MenuTrigger>
              <MenuContent />
            </Menu>
          </Box>
        </Box>
      </Box>

      {/* Content — full width; detail opens in the global aside */}
      <Box display="flex" flexDirection="column" flex="1" style={{ minHeight: 0, minWidth: 0 }}>
        {adding && <QuickAddInline itemType={composerType} onAdd={handleAdd} onClose={() => setAdding(false)} />}
        {view === "list" && <ListView extraTasks={extraTasks} deletedIds={deletedIds} onSelectTask={openDetail} />}
        {view === "board" && <BoardView extraTasks={extraTasks} deletedIds={deletedIds} onSelectTask={openDetail} />}
        {view === "kanban" && <KanbanView onSelectTask={openDetail} />}
        {view === "calendar" && <CalendarView onSelectTask={openDetail} />}
      </Box>
    </Box>
  );
}
