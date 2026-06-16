"use client";

import {
	IconAlignLeft,
	IconCalendar,
	IconPaperclip,
	IconLetterT,
	IconLink,
	IconLayoutColumns,
	IconHeading,
	IconMinus,
	IconPhoto,
} from "@tabler/icons-react";
import type { FormFieldDef } from "./types";

export const STANDARD_FIELDS: FormFieldDef[] = [
	{
		id: "attachments",
		name: "Attachments",
		nodeType: "formField",
		typeLabel: "File Upload",
		icon: <IconPaperclip size={16} />,
		description: "File attachments for this request.",
		required: false,
		isSystemField: true,
	},
	{
		id: "brief",
		name: "Brief",
		nodeType: "formField",
		typeLabel: "Long Text",
		icon: <IconAlignLeft size={16} />,
		description: "A description or brief for this request.",
		required: false,
		placeholder: "Describe the brief...",
		isSystemField: true,
	},
	{
		id: "creative-assets",
		name: "Creative Assets",
		nodeType: "formField",
		typeLabel: "Image",
		icon: <IconPhoto size={16} />,
		description: "Creative assets or supporting files.",
		required: false,
		isSystemField: true,
	},
	{
		id: "deliverable-due-date",
		name: "Deliverable Due Date",
		nodeType: "formField",
		typeLabel: "Date",
		icon: <IconCalendar size={16} />,
		description: "The due date for the deliverable.",
		required: false,
		isSystemField: true,
	},
	{
		id: "end-date",
		name: "End Date",
		nodeType: "formField",
		typeLabel: "Date",
		icon: <IconCalendar size={16} />,
		description: "The end date for this request.",
		required: false,
		isSystemField: true,
	},
	{
		id: "link-for-media-assets",
		name: "Link for Media Assets",
		nodeType: "formField",
		typeLabel: "URL",
		icon: <IconLink size={16} />,
		description: "A link to media assets or references.",
		required: false,
		placeholder: "https://",
		isSystemField: true,
	},
	{
		id: "short-description",
		name: "Short Description",
		nodeType: "formField",
		typeLabel: "Long Text",
		icon: <IconAlignLeft size={16} />,
		description: "A short description of this request.",
		required: false,
		placeholder: "Brief summary...",
		isSystemField: true,
	},
	{
		id: "start-date",
		name: "Start Date",
		nodeType: "formField",
		typeLabel: "Date",
		icon: <IconCalendar size={16} />,
		description: "The start date for this request.",
		required: false,
		isSystemField: true,
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
