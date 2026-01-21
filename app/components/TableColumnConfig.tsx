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
import { IconGripVertical } from "@optimizely/axiom-icons";
import { useState, Fragment } from "react";

export interface ColumnConfig {
    id: string;
    label: string;
    visible: boolean;
    movable?: boolean;
}

interface TableColumnConfigProps {
    columns: ColumnConfig[];
    onColumnsChange: (columns: ColumnConfig[]) => void;
    icon?: React.ReactNode;
    extraContent?: React.ReactNode;
    renderColumnExtra?: (columnId: string) => React.ReactNode;
}

export function TableColumnConfig({ columns, onColumnsChange, icon, extraContent, renderColumnExtra }: TableColumnConfigProps) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const sortedColumns = [...columns]
        .map((col, originalIndex) => ({ ...col, originalIndex }))
        .sort((a, b) => (a.visible === b.visible ? 0 : a.visible ? -1 : 1));

    const toggleColumn = (id: string) => {
        const newColumns = columns.map(col =>
            col.id === id ? { ...col, visible: !col.visible } : col
        );
        onColumnsChange(newColumns);
    };

    const handleDragStart = (displayIndex: number) => {
        const column = sortedColumns[displayIndex];
        if (column.movable === false) return;
        setDraggedIndex(displayIndex);
    };

    const handleDragOver = (e: React.DragEvent, displayIndex: number) => {
        e.preventDefault();
        const column = sortedColumns[displayIndex];
        if (column.movable === false) return;
        setDragOverIndex(displayIndex);
    };

    const handleDrop = (e: React.DragEvent, dropDisplayIndex: number) => {
        e.preventDefault();

        if (draggedIndex === null) return;

        const draggedCol = sortedColumns[draggedIndex];
        const dropCol = sortedColumns[dropDisplayIndex];

        // Prevent dropping on or moving non-movable columns
        if (draggedCol.movable === false || dropCol.movable === false) return;

        const newColumns = [...columns];
        const [movedColumn] = newColumns.splice(draggedCol.originalIndex, 1);
        
        // Calculate new position in the original array
        // This is simplified but works if we just want to move it relative to the dropped item
        const insertAt = dropCol.originalIndex;
        newColumns.splice(insertAt, 0, movedColumn);

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
            <PopoverTrigger asChild suppressHydrationWarning>
                <Button
                    appearance="default"
                    icon={icon || <IconSettings />}
                    aria-label="Configure columns"
                />
            </PopoverTrigger>
            <PopoverContent align="end" style={{ width: "280px" }} suppressHydrationWarning>
                <Box display="flex" flexDirection="column">
                    <Box p="12" pb="0">
                        <Text fontWeight="500" fontSize="md" mb="4">
                            Configure Columns
                        </Text>
                        <Text fontSize="sm" color="fg.secondary" mb="8">
                            Drag to reorder, toggle to show/hide
                        </Text>
                    </Box>

                    <Box display="flex" flexDirection="column" gap="0">
                        {sortedColumns.map((column, index) => {
                            if (!column.label) return null;
                            const isMovable = column.movable !== false;
                            return (
                                <Fragment key={column.id}>
                                    <Box
                                        draggable={isMovable}
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onDragEnd={handleDragEnd}
                                        p="12"
                                        display="flex"
                                        alignItems="center"
                                        gap="8"
                                        bg={dragOverIndex === index ? "bg.accent.subtle" : "bg.default"}
                                        className={isMovable ? "hover:bg-[var(--ax-colors-bg-default-hovered)] transition-colors cursor-grab" : "hover:bg-[var(--ax-colors-bg-default-hovered)] transition-colors"}
                                        style={{
                                            opacity: draggedIndex === index ? 0.5 : 1,
                                        }}
                                    >
                                        {isMovable && (
                                            <Box
                                                color="fg.tertiary"
                                                className="cursor-grab"
                                            >
                                                <IconGripVertical size={16} />
                                            </Box>
                                        )}

                                        <Checkbox
                                            checked={column.visible}
                                            onCheckedChange={() => toggleColumn(column.id)}
                                        />

                                        <Text fontSize="md" flex="1">
                                            {column.label || "(No label)"}
                                        </Text>
                                    </Box>
                                    {renderColumnExtra?.(column.id)}
                                </Fragment>
                            );
                        })}
                    </Box>
                    {extraContent}
                </Box>
            </PopoverContent>
        </Popover>
    );
}
