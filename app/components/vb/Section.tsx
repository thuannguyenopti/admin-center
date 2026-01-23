import React from "react";
import { ReactNode } from "react";
import { Box, Menu, MenuTrigger, MenuContent, Text } from "@optiaxiom/react";
import {
  IconPlus,
  IconDots,
  IconTrash,
  IconPencil,
  IconSettings,
  IconRowInsertTop,
  IconRowInsertBottom,
  IconSquare,
} from "@tabler/icons-react";

const Section: React.FC<{
  addSection: any;
  setOpen: any;
  section: any;
  children: ReactNode;
  addRow: any;
  removeSection: any;
  onDragStart: any;
  onEditProperties?: () => void;
}> = ({ addSection, setOpen, section, children, addRow, removeSection, onDragStart, onEditProperties }) => {
  if (section.label) {
    return (
      <div className="p-0.5 pl-6 -mr-0.5">
        <div>
          <div
            className="group hover:border-[#838DA4] h-10 border-[#CACFDC] border bg-white cursor-pointer rounded-[4px] hover:bg-[#091E4208] flex gap-1 items-center w-full justify-between pr-2 pl-3 active:bg-[#0037FF10]"
            onDragStart={onDragStart}
            draggable
          >
            <div className="flex gap-2 items-center w-full group-hover:w-[calc(100%-24px)]">
              <Box color="fg.default" className="">
                <IconSquare size={16} />
              </Box>
              <Box color="fg.default" className="truncate overflow-hidden text-ellipsis text-[14px]">
                {section.label}
              </Box>
            </div>
            <div className="group-hover:visible invisible flex gap-0.5">
              <Menu
                options={[
                  {
                    addon: <IconPencil size={16} />,
                    label: "Edit",
                    execute: () => {
                      // removeSection();
                    },
                  },
                  {
                    addon: <IconSettings size={16} />,
                    label: "Properties",
                    execute: () => {
                      onEditProperties?.();
                    },
                  },
                  {
                    addon: <IconTrash size={16} />,
                    label: "Remove Block",
                    intent: "danger",
                    execute: () => {
                      removeSection();
                    },
                  },
                ]}
              >
                <MenuTrigger icon={<IconDots />} aria-label="add ele" appearance="subtle" size="sm" iconPosition="start" />
                <MenuContent />
              </Menu>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const group = {
    label: "Add",
    separator: true,
  };

  return (
    <div className="p-1 py-0 -mr-[24px]">
      <div
        className="group p-1 cursor-pointer rounded-[4px] hover:bg-[#091E4208] flex gap-1 items-center w-full justify-between pr-5 active:bg-[#0037FF10]"
        onDragStart={onDragStart}
        onClick={() => setOpen(section.id, !section.open)}
        draggable
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
              transform: section.open ? "rotate(0deg)" : "rotate(-90deg)",
            }}
          >
            <path
              d="M6.39844 8.64844C6.16406 8.88281 5.8125 8.88281 5.60156 8.64844L1.85156 4.89844C1.61719 4.6875 1.61719 4.33594 1.85156 4.125C2.0625 3.89062 2.41406 3.89062 2.625 4.125L5.97656 7.47656L9.35156 4.10156C9.5625 3.89062 9.91406 3.89062 10.125 4.10156C10.3594 4.33594 10.3594 4.6875 10.125 4.89844L6.39844 8.64844Z"
              fill="#66708C"
            />
          </svg>
          <Text>Section</Text>
        </div>
        <div className="group-hover:visible invisible gap-0.5 flex" onClick={(e) => e.stopPropagation()}>
          <Menu
            options={[
              {
                addon: <IconPlus size={16} />,
                group: group,
                label: "Add Row Inside",
                execute: () => {
                  addRow();
                },
                selected: false,
              },
              {
                addon: <IconSettings size={16} />,
                label: "Properties",
                execute: () => {
                  onEditProperties?.();
                },
              },
              {
                addon: <IconRowInsertTop size={16} />,
                group: group,
                label: "Add Section Before",
                description: "lorem ipsum dolor sit amet. lorem ipsum dolor sit amet. lorem ipsum dolor sit amet. ",
                execute: () => {
                  addSection();
                },
              },
              {
                addon: <IconRowInsertBottom size={16} />,
                group: group,
                label: "Add Section After",
                execute: () => {
                  addSection();
                },
              },
              {
                addon: <IconTrash size={16} />,
                label: "Remove Section",
                intent: "danger",
                execute: () => {
                  removeSection();
                },
              },
            ]}
          >
            <MenuTrigger icon={<IconDots />} aria-label="add ele" appearance="subtle" size="sm" iconPosition="start" onClick={(e) => { e.stopPropagation(); }} />
            <MenuContent />
          </Menu>
        </div>
      </div>
      <div style={{ display: section.open ? "block" : "none" }}>{children}</div>
    </div>
  );
};

export default Section;
