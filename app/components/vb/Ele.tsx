
import {
    Box,
    Text,
    Input as Input2,
    Menu,
    MenuContent,
    MenuTrigger,
} from "@optiaxiom/react";

import React, { useState } from "react";
import {
    IconHeading,
    IconPilcrow,
    IconForms,
    IconRectangle,
    IconPhoto,
    IconBrackets,
    IconTrash,
    IconDots,
    IconPlus,
    IconTypeface,
    IconChevronDown,
    IconSelect,
    IconAdjustmentsHorizontal,
    IconCheck,
    IconCircleDot,
} from "@tabler/icons-react";
import styles from "../VBPrototype.module.css";

export type EleMap = Record<string, { type: string; props: any[] }>;

const indentDistance = 8; // Distance in pixels for each indent level

const Ele: React.FC<{
    element: any;
    removeEle: any;
    setCurrentEle: any;
    type: any;
    setCurrentHoverEle: any;
    label: string;
    onDragStart: any;
    children?: React.ReactNode;
    isOpen?: boolean;
    setOpen?: (open: boolean) => void;
    hasChildren?: boolean;
    addElement?: (type: string) => void;
}> = ({
    element,
    removeEle,
    setCurrentEle,
    type,
    setCurrentHoverEle,
    label,
    onDragStart,
    children,
    isOpen,
    setOpen,
    hasChildren,
    addElement,
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [addMenuOpen, setAddMenuOpen] = useState(false);

    return (
        <Box
            style={{
                paddingLeft: `${4 + 16 + indentDistance * 3}px`,
            }}
            py="1"
            pr="20"
        >
            <div
                onMouseEnter={() => setCurrentHoverEle(element.id)}
                onMouseLeave={() => setCurrentHoverEle("none")}
                draggable
                onDragStart={onDragStart}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!menuOpen && !addMenuOpen) setCurrentEle(element.id);
                }}
                className={`group p-2 py-0 text-sm h-[40px] pl-3 cursor-pointer border rounded-[4px] gap-1 items-center w-full flex justify-between ${styles.sectionWithBorder}`}
            >
                <Box
                    className="flex gap-2 items-center w-full group-hover:w-[calc(100%-48px)]"
                    color={label ? "fg.default" : "fg.secondary"}
                >
                    {hasChildren && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpen?.(!isOpen);
                            }}
                            className="cursor-pointer"
                        >
                            <IconChevronDown
                                size={14}
                                style={{
                                    transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                                    transition: "transform 0.2s",
                                }}
                            />
                        </div>
                    )}
                    <div className="min-w-4">
                        {(() => {
                            switch (type) {
                                case "Heading":
                                    return <IconHeading size={16} />;
                                case "Text":
                                    return <IconPilcrow size={16} />;
                                case "Input":
                                    return <IconForms size={16} />;
                                case "Button":
                                    return <IconRectangle size={16} />;
                                case "Image":
                                    return <IconPhoto size={16} />;
                                case "Form":
                                    return <IconTypeface size={16} />;
                                case "Textarea":
                                    return <IconPilcrow size={16} />;
                                case "Dropdown":
                                    return <IconSelect size={16} />;
                                case "Radio":
                                    return <IconCircleDot size={16} />;
                                case "Checkbox":
                                    return <IconCheck size={16} />;
                                case "Slider":
                                    return <IconAdjustmentsHorizontal size={16} />;
                                default:
                                    return <IconBrackets size={16} />;
                            }
                        })()}
                    </div>
                    <span className="truncate overflow-hidden text-ellipsis">
                        {label || (
                            <Text asChild color="fg.secondary">
                                <span className="italic">{`Empty ${type}`}</span>
                            </Text>
                        )}
                    </span>
                </Box>
                <div
                    className="flex items-center gap-1 invisible group-hover:visible"
                    style={{
                        visibility: menuOpen || addMenuOpen ? "visible" : undefined,
                    }}
                >
                    {hasChildren && addElement && (
                        <Menu
                            onOpenChange={(e) => setAddMenuOpen(!addMenuOpen)}
                            open={addMenuOpen}
                            options={[
                                {
                                    group: { label: "Add Form Element" },
                                    addon: <IconForms size={16} />,
                                    label: "Input",
                                    execute: () => addElement("Input"),
                                },
                                {
                                    addon: <IconPilcrow size={16} />,
                                    label: "Textarea",
                                    execute: () => addElement("Textarea"),
                                },
                                {
                                    addon: <IconSelect size={16} />,
                                    label: "Dropdown",
                                    execute: () => addElement("Dropdown"),
                                },
                                {
                                    addon: <IconCircleDot size={16} />,
                                    label: "Radio Group",
                                    execute: () => addElement("Radio"),
                                },
                                {
                                    addon: <IconCheck size={16} />,
                                    label: "Checkbox",
                                    execute: () => addElement("Checkbox"),
                                },
                                {
                                    addon: <IconAdjustmentsHorizontal size={16} />,
                                    label: "Slider",
                                    execute: () => addElement("Slider"),
                                },
                                {
                                    addon: <IconRectangle size={16} />,
                                    label: "Submit Button",
                                    execute: () => addElement("Button"),
                                },
                            ]}
                        >
                            <MenuTrigger
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setAddMenuOpen(true);
                                }}
                                icon={<IconPlus size={14} />}
                                aria-label="add form ele"
                                appearance="subtle"
                                size="sm"
                                iconPosition="start"
                            />
                            <MenuContent />
                        </Menu>
                    )}
                    <Menu
                        onOpenChange={(e) => setMenuOpen(!menuOpen)}
                        open={menuOpen}
                        options={[
                            {
                                addon: <IconTrash size={16} />,
                                label: "Remove Element",
                                intent: "danger",
                                execute: () => {
                                    removeEle();
                                    setMenuOpen(false);
                                },
                            },
                        ]}
                    >
                        <MenuTrigger
                            onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen(true);
                            }}
                            icon={<IconDots size={14} />}
                            aria-label="ele options"
                            appearance="subtle"
                            size="sm"
                            iconPosition="start"
                        />
                        <MenuContent />
                    </Menu>
                </div>
            </div>
            {isOpen && children}
        </Box>
    );
};

export default Ele;