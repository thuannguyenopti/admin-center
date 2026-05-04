"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogBody,
	DialogFooter,
	DialogForm,
	Field,
	Input,
	Textarea,
	Select,
	SelectTrigger,
	SelectContent,
	Disclosure,
	DisclosureTrigger,
	DisclosureContent,
	Switch,
	Checkbox,
	Box,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import {
	IconSquareCheck,
	IconCalendar,
	IconChevronDown,
	IconPhoto,
	IconTag,
	IconHash,
	IconCircleDot,
	IconAlignJustified,
	IconLetterT,
	IconAlignLeft,
	IconVideo,
} from "@tabler/icons-react";
import type { FormFieldDef } from "../types";

const FIELD_TYPES = [
	{ label: "Checkbox",     value: "checkbox",     addon: <IconSquareCheck size={14} /> },
	{ label: "Date",         value: "date",         addon: <IconCalendar size={14} /> },
	{ label: "Dropdown",     value: "dropdown",     addon: <IconChevronDown size={14} /> },
	{ label: "Image",        value: "image",        addon: <IconPhoto size={14} /> },
	{ label: "Label",        value: "label",        addon: <IconTag size={14} /> },
	{ label: "Number",       value: "number",       addon: <IconHash size={14} /> },
	{ label: "Radio Button", value: "radio-button", addon: <IconCircleDot size={14} /> },
	{ label: "Rich Text",    value: "rich-text",    addon: <IconAlignJustified size={14} /> },
	{ label: "Text",         value: "text",         addon: <IconLetterT size={14} /> },
	{ label: "Text Area",    value: "text-area",    addon: <IconAlignLeft size={14} /> },
	{ label: "Video",        value: "video",        addon: <IconVideo size={14} /> },
];

const TYPE_LABELS: Record<string, string> = {
	"checkbox":     "Checkbox",
	"date":         "Date",
	"dropdown":     "Dropdown",
	"image":        "Image",
	"label":        "Label",
	"number":       "Number",
	"radio-button": "Radio Button",
	"rich-text":    "Rich Text",
	"text":         "Text",
	"text-area":    "Text Area",
	"video":        "Video",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
	"checkbox":     <IconSquareCheck size={16} />,
	"date":         <IconCalendar size={16} />,
	"dropdown":     <IconChevronDown size={16} />,
	"image":        <IconPhoto size={16} />,
	"label":        <IconTag size={16} />,
	"number":       <IconHash size={16} />,
	"radio-button": <IconCircleDot size={16} />,
	"rich-text":    <IconAlignJustified size={16} />,
	"text":         <IconLetterT size={16} />,
	"text-area":    <IconAlignLeft size={16} />,
	"video":        <IconVideo size={16} />,
};

interface CreateFieldModalProps {
	open: boolean;
	onSave: (field: FormFieldDef) => void;
	onCancel: () => void;
}

export function CreateFieldModal({ open, onSave, onCancel }: CreateFieldModalProps) {
	const [fieldType, setFieldType] = useState("");
	const [fieldName, setFieldName] = useState("");
	const [helperText, setHelperText] = useState("");
	const [isActive, setIsActive] = useState(true);
	const [isReadOnly, setIsReadOnly] = useState(false);
	const [isMandatory, setIsMandatory] = useState(false);

	const isValid = fieldType.length > 0 && fieldName.trim().length > 0;

	const reset = () => {
		setFieldType("");
		setFieldName("");
		setHelperText("");
		setIsActive(true);
		setIsReadOnly(false);
		setIsMandatory(false);
	};

	const handleSave = () => {
		if (!isValid) return;
		onSave({
			id: `custom-${Date.now()}`,
			name: fieldName.trim(),
			nodeType: "formField",
			typeLabel: TYPE_LABELS[fieldType] ?? fieldType,
			icon: TYPE_ICONS[fieldType] ?? <IconLetterT size={16} />,
			description: helperText.trim() || "",
			required: isMandatory,
		});
		reset();
	};

	const handleCancel = () => {
		reset();
		onCancel();
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && handleCancel()}>
			<DialogContent size="sm">
				<DialogForm onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
					<DialogHeader>Create a new field</DialogHeader>

					<DialogBody display="flex" flexDirection="column" gap="20">
						{/* Field type */}
						<Field label="Field type" required>
							<Select
								options={FIELD_TYPES}
								value={fieldType}
								onValueChange={setFieldType}
							>
								<SelectTrigger placeholder="Select a type" />
								<SelectContent />
							</Select>
						</Field>

						{/* Field name */}
						<Field label="Field name" required>
							<Input
								value={fieldName}
								onValueChange={setFieldName}
								placeholder="Enter field name"
							/>
						</Field>

						{/* Helper text */}
						<Box display="flex" flexDirection="column" gap="4">
							<Field label="Helper text">
								<Textarea
									value={helperText}
									onValueChange={(v) => setHelperText(v.slice(0, 1000))}
									placeholder="Optional helper text shown below the field"
									rows={3}
									resize="none"
								/>
							</Field>
							<Text fontSize="xs" color="fg.tertiary">{helperText.length}/1000</Text>
						</Box>

						{/* Advanced settings */}
						<Disclosure>
							<DisclosureTrigger>
								<Text fontSize="sm" fontWeight="500" color="fg.default">Advanced settings</Text>
							</DisclosureTrigger>
							<DisclosureContent>
								<Box display="flex" flexDirection="column" gap="16" pt="12">
									{/* Status */}
									<Box display="flex" alignItems="center" justifyContent="space-between">
										<Text fontSize="sm" color="fg.default">Active</Text>
										<Switch checked={isActive} onCheckedChange={setIsActive} />
									</Box>

									{/* Read only */}
									<Box display="flex" alignItems="center" justifyContent="space-between">
										<Text fontSize="sm" color="fg.default">Mark as read only field</Text>
										<Switch checked={isReadOnly} onCheckedChange={setIsReadOnly} />
									</Box>

									{/* Mandatory */}
									<Box display="flex" alignItems="center" gap="8">
										<Checkbox
											checked={isMandatory}
											onCheckedChange={(v) => setIsMandatory(!!v)}
										>
											Library asset upload
										</Checkbox>
									</Box>
								</Box>
							</DisclosureContent>
						</Disclosure>
					</DialogBody>

					<DialogFooter>
						<Button appearance="default" type="button" onClick={handleCancel}>Cancel</Button>
						<Button appearance="primary" type="submit" disabled={!isValid}>Create field</Button>
					</DialogFooter>
				</DialogForm>
			</DialogContent>
		</Dialog>
	);
}
