"use client";

import {
	IconAlignLeft,
	IconCalendar,
	IconPaperclip,
	IconLetterT,
	IconLetterCase,
	IconLayoutColumns,
	IconHeading,
	IconMinus,
	IconSelector,
	IconListCheck,
	IconSquareCheck,
	IconHash,
	IconAlignJustified,
	IconPhoto,
	IconVideo,
	IconTag,
} from "@tabler/icons-react";
import type { FormFieldDef } from "./types";

export const STANDARD_FIELDS: FormFieldDef[] = [
	{
		id: "long-text",
		name: "Long Text",
		nodeType: "formField",
		typeLabel: "Long Text",
		icon: <IconAlignLeft size={16} />,
		description: "",
		required: false,
		placeholder: "Type your answer...",
	},
	{
		id: "short-text",
		name: "Short Text",
		nodeType: "formField",
		typeLabel: "Text",
		icon: <IconLetterCase size={16} />,
		description: "",
		required: false,
		placeholder: "Type your answer...",
	},
	{
		id: "multiple-choice",
		name: "Multiple Choice",
		nodeType: "formField",
		typeLabel: "Radio Button",
		icon: <IconListCheck size={16} />,
		description: "",
		required: false,
		options: [
			{ label: "Option 1", value: "option-1" },
			{ label: "Option 2", value: "option-2" },
		],
	},
	{
		id: "dropdown",
		name: "Dropdown",
		nodeType: "formField",
		typeLabel: "Dropdown",
		icon: <IconSelector size={16} />,
		description: "",
		required: false,
	},
	{
		id: "date",
		name: "Date",
		nodeType: "formField",
		typeLabel: "Date",
		icon: <IconCalendar size={16} />,
		description: "",
		required: false,
	},
	{
		id: "file-upload",
		name: "File Upload",
		nodeType: "formField",
		typeLabel: "File Upload",
		icon: <IconPaperclip size={16} />,
		description: "",
		required: false,
	},
	{
		id: "checkbox",
		name: "Checkbox",
		nodeType: "formField",
		typeLabel: "Checkbox",
		icon: <IconSquareCheck size={16} />,
		description: "",
		required: false,
	},
	{
		id: "number",
		name: "Number",
		nodeType: "formField",
		typeLabel: "Number",
		icon: <IconHash size={16} />,
		description: "",
		required: false,
	},
	{
		id: "rich-text",
		name: "Rich Text",
		nodeType: "formField",
		typeLabel: "Rich Text",
		icon: <IconAlignJustified size={16} />,
		description: "",
		required: false,
	},
	{
		id: "image",
		name: "Image",
		nodeType: "formField",
		typeLabel: "Image",
		icon: <IconPhoto size={16} />,
		description: "",
		required: false,
	},
	{
		id: "video",
		name: "Video",
		nodeType: "formField",
		typeLabel: "Video",
		icon: <IconVideo size={16} />,
		description: "",
		required: false,
	},
	{
		id: "label",
		name: "Label",
		nodeType: "formField",
		typeLabel: "Label",
		icon: <IconTag size={16} />,
		description: "",
		required: false,
	},
];

export const CUSTOM_FIELDS: FormFieldDef[] = [];

// Kept for backward compatibility with FieldPicker and other consumers
export const WORK_REQUEST_FIELDS: FormFieldDef[] = STANDARD_FIELDS;

export const LAYOUT_COMPONENTS = [
	{ id: "section", name: "Section", nodeType: "formSection", typeLabel: "", icon: <IconLayoutColumns size={16} /> },
];

export const CONTENT_COMPONENTS = [
	{ id: "heading",   name: "Heading",   nodeType: "formContent", typeLabel: "", icon: <IconHeading size={16} /> },
	{ id: "paragraph", name: "Paragraph", nodeType: "formContent", typeLabel: "", icon: <IconLetterT size={16} /> },
	{ id: "divider",   name: "Divider",   nodeType: "formContent", typeLabel: "", icon: <IconMinus size={16} /> },
];

export const ALL_COMPONENTS = [...WORK_REQUEST_FIELDS, ...LAYOUT_COMPONENTS, ...CONTENT_COMPONENTS];
