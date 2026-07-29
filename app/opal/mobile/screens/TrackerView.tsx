"use client";

import { useState } from "react";
import { Avatar, Box, Button, Heading, Text } from "@optiaxiom/react";
import { IconPlus, IconSearch, IconXmark, IconTrashCan } from "@optiaxiom/icons";
import type { Task } from "../../tracker/types";
import { PlannerReadyList } from "../../tracker/components/PlannerReadyList";
import { DetailPanel } from "../../tracker/components/DetailPanel";
import { NoteEditor } from "../../tracker/components/NoteEditor";
import { QuickAddInline } from "../../tracker/components/QuickAddInline";
import { useSessionTasks } from "../../tracker/useSessionTasks";
import { DEFAULT_FILTERS } from "../../tracker/filters";
import { mobileType } from "../typography";

const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <line x1="3" y1="5"  x2="17" y2="5"  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="3" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

export function TrackerView({
  onHamburger,
  onAvatarClick,
}: {
  onHamburger?: () => void;
  onAvatarClick?: () => void;
}) {
  const [extras, addTask] = useSessionTasks();
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [adding, setAdding] = useState(false);
  const [composerType, setComposerType] = useState<"task" | "note">("task");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const handleDelete = (task: Task) => {
    setDeletedIds((prev) => new Set([...prev, task.id]));
    setSelectedTask(null);
  };

  const handleClose = () => setSelectedTask(null);

  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{ height: "100%", background: "var(--ax-colors-bg-page)", position: "relative", overflow: "hidden" }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Box display="flex" alignItems="center" style={{ padding: "14px 20px 10px", flexShrink: 0 }}>
        {onHamburger ? (
          <Box onClick={onHamburger} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ax-colors-fg-secondary)", flexShrink: 0, marginRight: 8 }}>
            <IconMenu />
          </Box>
        ) : (
          <Box onClick={onAvatarClick} style={{ cursor: onAvatarClick ? "pointer" : "default", marginRight: 12, flexShrink: 0 }}>
            <Avatar name="Jamie Cohen" src="/avatars/jc.png" size="lg" />
          </Box>
        )}
        <Heading level="2" style={{ flex: 1 }}>Tracker</Heading>
        <Box style={{ display: "flex", alignItems: "center", border: "1px solid var(--ax-colors-border-secondary)", borderRadius: 20, padding: "0 8px", flexShrink: 0 }}>
          <Button
            appearance="subtle" size="lg" aria-label="Search"
            icon={<IconSearch style={{ width: 22, height: 22 }} />}
            style={{ width: 40, height: 40, padding: 0 }}
            onClick={() => setSearchOpen((o) => !o)}
          />
          <Button
            appearance="subtle" size="lg" aria-label="Add task"
            icon={<IconPlus style={{ width: 20, height: 20 }} />}
            style={{ width: 40, height: 40, padding: 0 }}
            onClick={() => setAdding(true)}
          />
        </Box>
      </Box>

      {/* ── Search bar ─────────────────────────────────────────────── */}
      {searchOpen && (
        <Box display="flex" alignItems="center" gap="8" style={{ padding: "0 16px 8px", flexShrink: 0 }}>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks…"
            style={{
              flex: 1, border: "1px solid var(--ax-colors-border-default)", borderRadius: 8,
              padding: "8px 12px", ...mobileType.body, fontFamily: "inherit",
              color: "var(--ax-colors-fg-default)", background: "var(--ax-colors-bg-default)",
              outline: "none",
            }}
          />
          <Box onClick={() => { setSearchOpen(false); setQuery(""); }} style={{ cursor: "pointer", color: "var(--ax-colors-fg-tertiary)" }}>
            <IconXmark style={{ width: 18, height: 18 }} />
          </Box>
        </Box>
      )}

      {/* ── Quick-add inline ───────────────────────────────────────── */}
      {adding && (
        <Box style={{ padding: "0 16px 8px", flexShrink: 0 }}>
          <QuickAddInline
            itemType={composerType}
            onAdd={(task) => { addTask(task); setAdding(false); }}
            onClose={() => setAdding(false)}
          />
        </Box>
      )}

      {/* ── Planner ready list ─────────────────────────────────────── */}
      <Box style={{ flex: 1, overflowY: "auto" }}>
        <PlannerReadyList
          extraTasks={extras}
          deletedIds={deletedIds}
          onSelectTask={setSelectedTask}
          px="8"
          query={searchOpen ? query : ""}
          filter={DEFAULT_FILTERS}
        />
      </Box>

      {/* ── Task detail bottom sheet ───────────────────────────────── */}
      {selectedTask && (
        <>
          <Box
            onClick={handleClose}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200 }}
          />
          <Box
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              height: "88%",
              background: "var(--ax-colors-bg-default)",
              borderRadius: "20px 20px 0 0",
              zIndex: 201,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Drag handle */}
            <Box style={{ width: 36, height: 4, borderRadius: 2, background: "var(--ax-colors-border-secondary)", margin: "12px auto 0", flexShrink: 0 }} />
            {/* Detail content */}
            <Box style={{ flex: 1, overflow: "hidden" }}>
              {selectedTask.itemType === "note" ? (
                <NoteEditor
                  task={selectedTask}
                  onClose={handleClose}
                  onDelete={handleDelete}
                />
              ) : (
                <DetailPanel
                  task={selectedTask}
                  onClose={handleClose}
                  onDelete={handleDelete}
                />
              )}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
