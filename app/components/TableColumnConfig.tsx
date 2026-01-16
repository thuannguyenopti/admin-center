"use client";

import {
    Box,
    Button,
    Checkbox,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Text,
} from "@optiaxiom/react";
import { IconSettings } from "@tabler/icons-react";
import { useState } from "react";

export interface ColumnConfig {
    id: string;
    label: string;
    visible: boolean;
    movable?: boolean;
}

interface TableColumnConfigProps {
    columns: ColumnConfig[];
    onColumnsChange: (columns: ColumnConfig[]) => void;
}

export function TableColumnConfig({ columns, onColumnsChange }: TableColumnConfigProps) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const toggleColumn = (id: string) => {
        const newColumns = columns.map(col =>
            col.id === id ? { ...col, visible: !col.visible } : col
        );
        onColumnsChange(newColumns);
    };

    const handleDragStart = (index: number) => {
        const column = columns[index];
        if (column.movable === false) return;
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        const column = columns[index];
        if (column.movable === false) return;
        setDragOverIndex(index);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();

        if (draggedIndex === null) return;

        const draggedColumn = columns[draggedIndex];
        const dropColumn = columns[dropIndex];

        // Prevent dropping on or moving non-movable columns
        if (draggedColumn.movable === false || dropColumn.movable === false) return;

        const newColumns = [...columns];
        const [movedColumn] = newColumns.splice(draggedIndex, 1);
        newColumns.splice(dropIndex, 0, movedColumn);

        onColumnsChange(newColumns);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    appearance="default"
                    icon={<IconSettings />}
                    aria-label="Configure columns"
                />
            </PopoverTrigger>
            <PopoverContent align="end" style={{ width: "280px" }}>
                <Box p="12" display="flex" flexDirection="column" gap="8">
                    <Text fontWeight="500" fontSize="md" mb="4">
                        Configure Columns
                    </Text>
                    <Text fontSize="sm" color="fg.secondary" mb="8">
                        Drag to reorder, toggle to show/hide
                    </Text>

                    <Box display="flex" flexDirection="column" gap="4">
                        {columns.map((column, index) => {
                            const isMovable = column.movable !== false;
                            return (
                                <Box
                                    key={column.id}
                                    draggable={isMovable}
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onDragEnd={handleDragEnd}
                                    p="8"
                                    display="flex"
                                    alignItems="center"
                                    gap="8"
                                    rounded="sm"
                                    bg={dragOverIndex === index ? "bg.accent.subtle" : "bg.default"}
                                    className={isMovable ? "hover:bg-[var(--ax-colors-bg-default-hovered)] transition-colors cursor-grab" : "hover:bg-[var(--ax-colors-bg-default-hovered)] transition-colors"}
                                    style={{
                                        opacity: draggedIndex === index ? 0.5 : 1,
                                        borderWidth: "1px",
                                        borderStyle: "solid",
                                        borderColor: dragOverIndex === index
                                            ? "var(--ax-colors-border-accent)"
                                            : "var(--ax-colors-border-tertiary)"
                                    }}
                                >
                                    {isMovable && (
                                        <Box
                                            display="flex"
                                            flexDirection="column"
                                            gap="2"
                                            color="fg.tertiary"
                                            className="cursor-grab"
                                        >
                                            <div style={{ width: "12px", height: "1px", backgroundColor: "var(--ax-colors-fg-tertiary)" }} />
                                            <div style={{ width: "12px", height: "1px", backgroundColor: "var(--ax-colors-fg-tertiary)" }} />
                                            <div style={{ width: "12px", height: "1px", backgroundColor: "var(--ax-colors-fg-tertiary)" }} />
                                        </Box>
                                    )}

                                    <Checkbox
                                        checked={column.visible}
                                        onCheckedChange={() => toggleColumn(column.id)}
                                    />

                                    <Text fontSize="sm" flex="1">
                                        {column.label || "(No label)"}
                                    </Text>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </PopoverContent>
        </Popover>
    );
}
