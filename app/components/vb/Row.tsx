import React from "react";
import { ReactNode } from "react";
import { Text, Menu, MenuTrigger, MenuContent } from "@optiaxiom/react";
import { IconPlus, IconRowInsertTop, IconTrash, IconDots } from "@tabler/icons-react";

const indentDistance = 8;

const Row: React.FC<{
    setOpen: any;
    row: any;
    children: ReactNode;
    addCol: any;
    addRow: any;
    addRowBelow: any;
    removeRow: any;
    onDragStart: any;
    isSelected?: boolean;
    onHoverChange?: (rowId: string | null) => void;
    onScrollToPreview?: (rowId: string) => void;
}> = ({ addRowBelow, addRow, setOpen, row, children, addCol, removeRow, onDragStart, isSelected, onHoverChange, onScrollToPreview }) => {
    const group = { label: "Add", separator: true };
    return (
        <div className="py-0">
            <div
                className="newsection group p-1 cursor-pointer rounded-[4px] hover:bg-[#091E4208] flex gap-1 items-center w-full justify-between pr-5 active:bg-[#0037FF10]"
                style={{
                    paddingLeft: `${4 + indentDistance}px`,
                    backgroundColor: isSelected ? 'var(--ax-colors-bg-accent-subtle)' : undefined
                }}
                onDragStart={onDragStart}
                onClick={() => onScrollToPreview?.(row.id)}
                onMouseEnter={() => onHoverChange?.(row.id)}
                onMouseLeave={() => onHoverChange?.(null)}
                draggable
            >
                <div className="flex gap-1 items-center">
                    <svg
                        className="chevron cursor-pointer"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            transform: row.open ? "rotate(0deg)" : "rotate(-90deg)",
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpen(row.id, !row.open);
                        }}
                    >
                        <path
                            d="M6.39844 8.64844C6.16406 8.88281 5.8125 8.88281 5.60156 8.64844L1.85156 4.89844C1.61719 4.6875 1.61719 4.33594 1.85156 4.125C2.0625 3.89062 2.41406 3.89062 2.625 4.125L5.97656 7.47656L9.35156 4.10156C9.5625 3.89062 9.91406 3.89062 10.125 4.10156C10.3594 4.33594 10.3594 4.6875 10.125 4.89844L6.39844 8.64844Z"
                            fill="#66708C"
                        />
                    </svg>
                    <Text>Row</Text>
                </div>
                <div className="group-hover:visible invisible gap-0.5 flex">
                    <Menu
                        options={[
                            {
                                group: group,
                                addon: <IconPlus size={16} />,
                                label: "Add column inside",
                                execute: (e: any) => {
                                    addCol();
                                },
                            },
                            {
                                group: group,
                                addon: <IconRowInsertTop size={16} />,
                                label: "Add row above",
                                execute: (e: any) => {
                                    addRow();
                                },
                            },
                            {
                                group: group,
                                addon: <IconRowInsertTop size={16} />,
                                label: "Add row below",
                                execute: (e: any) => {
                                    addRowBelow();
                                },
                            },
                            {
                                addon: <IconTrash size={16} />,
                                label: "Remove Row",
                                intent: "danger",
                                execute: (e: any) => {
                                    removeRow(row.id);
                                },
                            },
                        ]}
                    >
                        <MenuTrigger
                            icon={<IconDots />}
                            aria-label="add ele"
                            appearance="subtle"
                            size="sm"
                            iconPosition="start"
                            onClick={(e: any) => {
                                e.stopPropagation();
                            }}
                        />
                        <MenuContent
                            onClick={(e: any) => {
                                e.stopPropagation();
                            }}
                        />
                    </Menu>
                </div>
            </div>
            <div style={{ display: row.open ? "block" : "none", backgroundColor: isSelected ? 'var(--ax-colors-bg-accent-subtle)' : undefined }}>{children}</div>
        </div>
    );
};

export default Row;
