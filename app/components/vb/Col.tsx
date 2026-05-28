import React from "react";
import { ReactNode } from "react";
import { Box, Menu, MenuTrigger, MenuContent } from "@optiaxiom/react";
import {
    IconTrash,
    IconDots,
    IconPlus,
    IconHeading,
    IconPilcrow,
    IconForms,
    IconRectangle,
    IconPhoto,
    IconBrackets,
} from "@tabler/icons-react";

const indentDistance = 8;

const Col: React.FC<{
    setOpen: any;
    col: any;
    children: ReactNode;
    addElement: any;
    removeCol: any;
    onDragStart: any;
    elementOptions: { type: string; label: string }[];
}> = ({ setOpen, col, children, addElement, removeCol, onDragStart, elementOptions }) => {

    const iconForType = (type: string) => {
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
            case "ct-image-block":
                return <IconPhoto size={16} />;
            default:
                return <IconBrackets size={16} />;
        }
    };

    const fallbackOptions = [
        { type: "ct-heading", label: "Heading" },
        { type: "ct-text", label: "Text" },
        { type: "ct-input", label: "Input" },
        { type: "ct-button", label: "Button" },
        { type: "ct-image-block", label: "Image" },
    ];

    const optionsSource = (elementOptions && elementOptions.length > 0) ? elementOptions : fallbackOptions;
    return (
        <Box
            style={{
                transition: "background-color 0.2s",
            }}
        >
            <div
                className="newsection group p-1 cursor-pointer rounded-[4px] hover:bg-[#091E4208] flex gap-1 items-center w-full justify-between pr-5 active:bg-[#0037FF10]"
                draggable
                style={{ paddingLeft: `${4 + indentDistance * 2}px` }}
                onClick={() => setOpen(col.id, !col.open)}
                onDragStart={onDragStart}
            >
                <div className="flex gap-1 items-center">
                    <svg
                        className="chevron"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            transform: col.open ? "rotate(0deg)" : "rotate(-90deg)",
                        }}
                    >
                        <path
                            d="M6.39844 8.64844C6.16406 8.88281 5.8125 8.88281 5.60156 8.64844L1.85156 4.89844C1.61719 4.6875 1.61719 4.33594 1.85156 4.125C2.0625 3.89062 2.41406 3.89062 2.625 4.125L5.97656 7.47656L9.35156 4.10156C9.5625 3.89062 9.91406 3.89062 10.125 4.10156C10.3594 4.33594 10.3594 4.6875 10.125 4.89844L6.39844 8.64844Z"
                            fill="#66708C"
                        />
                    </svg>
                    <div>Column</div>
                </div>
                <div className="group-hover:visible invisible gap-0.5 flex">
                    <Menu
                        options={[
                            {
                                addon: <IconTrash size={16} />,
                                label: "Remove Column",
                                intent: "danger",
                                execute: () => {
                                    removeCol();
                                },
                            },
                        ]}
                    >
                        <MenuTrigger
                            icon={<IconDots />}
                            aria-label="add ele"
                            appearance="subtle"
                            size="sm"
                            onClick={(e: any) => {
                                e.stopPropagation();
                            }}
                            iconPosition="start"
                        />
                        <MenuContent />
                    </Menu>
                    <Menu
                        options={optionsSource.map((opt, idx) => ({
                            group: idx === 0 ? { label: "Add Element" } : undefined,
                            addon: iconForType(opt.type),
                            label: opt.label,
                            execute: () => addElement(opt.type),
                        }))}
                    >
                        <MenuTrigger
                            icon={<IconPlus />}
                            aria-label="add ele"
                            appearance="subtle"
                            size="sm"
                            onClick={(e: any) => {
                                e.stopPropagation();
                            }}
                            iconPosition="start"
                        />
                        <MenuContent
                            onClick={(e: any) => {
                                e.stopPropagation();
                            }}
                        />
                    </Menu>
                </div>
            </div>
            <div style={{ display: col.open ? "block" : "none" }}>{children}</div>
        </Box>
    );
};

export default Col;
