
import {
    Box,
    Text,
    Input as Input2,
    Menu,
    MenuContent,
    MenuTrigger,
} from "@optiaxiom/react";

import React, { useState } from "react";
import { IconHeading, IconPilcrow, IconForms, IconRectangle, IconPhoto, IconBrackets, IconTrash, IconDots, IconPalette } from "@tabler/icons-react";
import styles from "../VBPrototype.module.css";

export type EleMap = Record<string, { type: string; properties: any }>;

const indentDistance = 8; // Distance in pixels for each indent level

const Ele: React.FC<{
    element: any;
    removeEle: any;
    setCurrentEle: any;
    type: any;
    setCurrentHoverEle: any;
    label: string;
    onDragStart: any;
    onOpenStyleEditor?: () => void;
}> = ({ element, removeEle, setCurrentEle, type, setCurrentHoverEle, label, onDragStart, onOpenStyleEditor }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <Box
            style={{
                paddingLeft: `${4 + 16 + indentDistance * 3}px`,
            }}
            py="2"
            pr="20"
        >
            <div
                onMouseEnter={() => setCurrentHoverEle(element.id)}
                onMouseLeave={() => setCurrentHoverEle("none")}
                draggable
                onDragStart={onDragStart}
                onClick={() => {
                    if (!menuOpen) setCurrentEle(element.id);
                }}
                className={`group p-2 py-0 text-sm h-[40px] pl-3 cursor-pointer border rounded-[4px] gap-1 items-center w-full flex justify-between ${styles.sectionWithBorder}`}
            >
                <Box
                    className="flex gap-2 items-center w-full group-hover:w-[calc(100%-24px)]"
                    color={label ? "fg.default" : "fg.secondary"}
                >
                    <div className="min-w-4">
                        {(() => {
                            switch (type) {
                                case "ct-heading":
                                    return <IconHeading size={16} />;
                                case "ct-text":
                                case "ct-rich-text":
                                    return <IconPilcrow size={16} />;
                                case "ct-product":
                                    return <IconRectangle size={16} />;
                                case "ct-input":
                                    return <IconForms size={16} />;
                                case "ct-button":
                                    return <IconRectangle size={16} />;
                                case "ct-image":
                                    return <IconPhoto size={16} />;
                                default:
                                    return <IconBrackets size={16} />;
                            }
                        })()}
                    </div>
                    <span className="truncate overflow-hidden text-ellipsis">
                        {label || (
                            <Text
                                asChild
                                color="fg.secondary"
                            >
                                <span className="italic">{`Empty ${(type || "Element").replace("ct-", "")}`}</span>
                            </Text>
                        )}
                    </span>
                </Box>
                <div
                    className="min-w-[24px] invisible group-hover:visible"
                    style={{
                        visibility: menuOpen ? "visible" : undefined,
                    }}
                >
                    <Menu
                        onOpenChange={(e) => setMenuOpen(!menuOpen)}
                        open={menuOpen}
                        options={[
                            ...(onOpenStyleEditor ? [{
                                addon: <IconPalette size={16} />,
                                label: "Style",
                                execute: () => {
                                    onOpenStyleEditor();
                                    setMenuOpen(false);
                                },
                            }] : []),
                            {
                                addon: <IconTrash size={16} />,
                                label: "Remove Element",
                                intent: "danger",
                                execute: () => {
                                    removeEle();
                                    setMenuOpen(false);
                                },
                                group: onOpenStyleEditor ? { label: "actions", hidden: true, separator: true } : undefined,
                            },
                        ]}
                    >
                        <MenuTrigger
                            onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen(true);
                            }}
                            icon={<IconDots />}
                            aria-label="add ele"
                            appearance="subtle"
                            size="sm"
                            iconPosition="start"
                        />
                        <MenuContent />
                    </Menu>
                </div>
            </div>
        </Box>
    );
};

export default Ele;