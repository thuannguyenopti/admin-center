// Lightweight native HTML5 drag-to-reorder — no external dnd library.
import { useRef, useState } from "react";

export function reorder<T extends { id: string }>(list: T[], fromId: string, toId: string): T[] {
  const from = list.findIndex((i) => i.id === fromId);
  const to = list.findIndex((i) => i.id === toId);
  if (from === -1 || to === -1 || from === to) return list;
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/**
 * Drag-reorder state for a single sortable list. `onReorder(fromId, toId)`
 * fires on drop; the caller owns the item array and applies `reorder(...)`.
 */
export function useDragReorder(onReorder: (fromId: string, toId: string) => void) {
  const dragId = useRef<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const reset = () => {
    dragId.current = null;
    setActiveId(null);
    setOverId(null);
  };

  const getRowProps = (id: string) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      dragId.current = id;
      setActiveId(id);
      e.dataTransfer.effectAllowed = "move";
      try {
        e.dataTransfer.setData("text/plain", id);
      } catch {
        /* Firefox requires setData; ignore if blocked */
      }
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      if (dragId.current && dragId.current !== id) setOverId(id);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      if (dragId.current && dragId.current !== id) onReorder(dragId.current, id);
      reset();
    },
    onDragEnd: reset,
  });

  return { activeId, overId, getRowProps };
}
