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
	Radio,
	RadioGroup,
	Box,
	Popover,
	PopoverAnchor,
	PopoverContent,
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
	IconEyeOff,
	IconTrash,
	IconPlus,
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

type DropdownOption = { id: string; value: string; hidden: boolean; color?: string };

const LABEL_COLOR_PALETTE = [
	"#facc15", // yellow
	"#60a5fa", // blue
	"#34d399", // green
	"#f87171", // red
	"#a78bfa", // purple
	"#fb923c", // orange
	"#9ca3af", // gray
	"#ec4899", // pink
];

const FILTER_CONTEXTS = [
	{ id: "analytics", label: "Analytics" },
	{ id: "plan", label: "Plan" },
	{ id: "library", label: "Library" },
	{ id: "work-requests", label: "Work Requests" },
];

const NUMBER_SUBTYPES = [
	{ value: "number", label: "Number" },
	{ value: "currency", label: "Currency" },
	{ value: "percent", label: "Percent" },
];

export function CreateFieldModal({ open, onSave, onCancel }: CreateFieldModalProps) {
	const [fieldType, setFieldType] = useState("");
	const [fieldName, setFieldName] = useState("");
	const [helperText, setHelperText] = useState("");
	const [isActive, setIsActive] = useState(true);
	const [isReadOnly, setIsReadOnly] = useState(false);
	const [isMandatory, setIsMandatory] = useState(false);
	const [isMultiSelect, setIsMultiSelect] = useState(false);
	const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([
		{ id: "opt-1", value: "", hidden: false, color: LABEL_COLOR_PALETTE[0] },
		{ id: "opt-2", value: "", hidden: false, color: LABEL_COLOR_PALETTE[1] },
	]);
	const [textLimit, setTextLimit] = useState("");
	const [showInFilter, setShowInFilter] = useState<string[]>([]);
	const [numberSubtype, setNumberSubtype] = useState<string>("number");
	const [decimalPlaces, setDecimalPlaces] = useState<string>("2");
	const [useThousandSeparator, setUseThousandSeparator] = useState(false);

	const isDropdown = fieldType === "dropdown";
	const isRadioButton = fieldType === "radio-button";
	const isLabel = fieldType === "label";
	const isCheckbox = fieldType === "checkbox";
	const isDate = fieldType === "date";
	const isNumber = fieldType === "number";
	const isOptionBased = isDropdown || isRadioButton || isLabel;
	const isRichText = fieldType === "rich-text";
	const isFilterable = isLabel || isCheckbox || isDropdown || isDate;
	const isValid = fieldType.length > 0 && fieldName.trim().length > 0;

	const OPTION_PLACEHOLDERS: Record<string, string> = {
		"dropdown":     "Dropdown field name",
		"radio-button": "Radio Button field name",
		"label":        "Label field name",
	};

	const reset = () => {
		setFieldType("");
		setFieldName("");
		setHelperText("");
		setIsActive(true);
		setIsReadOnly(false);
		setIsMandatory(false);
		setIsMultiSelect(false);
		setDropdownOptions([
			{ id: "opt-1", value: "", hidden: false, color: LABEL_COLOR_PALETTE[0] },
			{ id: "opt-2", value: "", hidden: false, color: LABEL_COLOR_PALETTE[1] },
		]);
		setTextLimit("");
		setShowInFilter([]);
		setNumberSubtype("number");
		setDecimalPlaces("2");
		setUseThousandSeparator(false);
	};

	const handleSave = () => {
		if (!isValid) return;
		const options = isOptionBased
			? dropdownOptions
				.filter((o) => o.value.trim() !== "")
				.map((o) => ({
					label: o.value.trim(),
					value: o.value.trim().toLowerCase().replace(/\s+/g, "_"),
					...(isLabel && o.color ? { color: o.color } : {}),
				}))
			: undefined;
		const parsedLimit = isRichText && textLimit.trim() !== "" ? parseInt(textLimit, 10) : undefined;
		const parsedDecimals = isNumber && decimalPlaces.trim() !== "" ? parseInt(decimalPlaces, 10) : undefined;
		onSave({
			id: `custom-${Date.now()}`,
			name: fieldName.trim(),
			nodeType: "formField",
			typeLabel: TYPE_LABELS[fieldType] ?? fieldType,
			icon: TYPE_ICONS[fieldType] ?? <IconLetterT size={16} />,
			description: helperText.trim() || "",
			required: isMandatory,
			...(options ? { options } : {}),
			...(isDropdown ? { isMultiSelect } : {}),
			...(parsedLimit !== undefined && !isNaN(parsedLimit) ? { textLimit: parsedLimit } : {}),
			...(isFilterable && showInFilter.length > 0 ? { showInFilter } : {}),
			...(isNumber
				? {
					numberSubtype,
					...(parsedDecimals !== undefined && !isNaN(parsedDecimals) ? { decimalPlaces: parsedDecimals } : {}),
					useThousandSeparator,
				}
				: {}),
		} as any);
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
								onValueChange={(v) => { setFieldType(v); setHelperText(""); }}
							>
								<SelectTrigger placeholder="Select a type" />
								<SelectContent />
							</Select>
						</Field>

						{fieldType && (<>
						{isOptionBased ? (
							<>
								{/* Single/Multi select — dropdown only */}
								{isDropdown && (
									<RadioGroup
										value={isMultiSelect ? "multi" : "single"}
										onValueChange={(v) => setIsMultiSelect(v === "multi")}
									>
										<Box display="flex" alignItems="center" gap="20">
											<Radio value="single">Single-Select</Radio>
											<Radio value="multi">Multi-Select</Radio>
										</Box>
									</RadioGroup>
								)}

								{/* Field name */}
								<Field label="Field name" required>
									<Input
										value={fieldName}
										onValueChange={setFieldName}
										placeholder={OPTION_PLACEHOLDERS[fieldType] ?? "Enter field name"}
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

								{/* Options list */}
								<Box display="flex" flexDirection="column" gap="8">
									<Box display="flex" flexDirection="column" gap="4">
										{dropdownOptions.map((opt) => (
											<Box key={opt.id} display="flex" alignItems="center" gap="8">
												{isLabel && (
													<Popover>
														<PopoverAnchor>
															<button
																type="button"
																aria-label="Pick color"
																style={{
																	width: 30,
																	height: 30,
																	borderRadius: 6,
																	border: "1px solid var(--ax-colors-border-default)",
																	background: opt.color ?? LABEL_COLOR_PALETTE[0],
																	cursor: "pointer",
																	padding: 0,
																	flexShrink: 0,
																}}
															/>
														</PopoverAnchor>
														<PopoverContent>
															<Box
																p="8"
																display="flex"
																style={{
																	gap: 6,
																	flexWrap: "wrap",
																	width: 152,
																}}
															>
																{LABEL_COLOR_PALETTE.map((c) => (
																	<button
																		key={c}
																		type="button"
																		onClick={() =>
																			setDropdownOptions((prev) =>
																				prev.map((o) => (o.id === opt.id ? { ...o, color: c } : o)),
																			)
																		}
																		aria-label={`Color ${c}`}
																		style={{
																			width: 28,
																			height: 28,
																			borderRadius: 6,
																			border: opt.color === c
																				? "2px solid var(--ax-colors-border-accent)"
																				: "1px solid var(--ax-colors-border-default)",
																			background: c,
																			cursor: "pointer",
																			padding: 0,
																		}}
																	/>
																))}
															</Box>
														</PopoverContent>
													</Popover>
												)}
												<Box flex="1">
													<Input
														value={opt.value}
														onValueChange={(v) => setDropdownOptions((prev) => prev.map((o) => o.id === opt.id ? { ...o, value: v } : o))}
														placeholder="Enter an option"
													/>
												</Box>
												<button
													type="button"
													onClick={() => setDropdownOptions((prev) => prev.map((o) => o.id === opt.id ? { ...o, hidden: !o.hidden } : o))}
													style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", color: opt.hidden ? "var(--ax-colors-fg-accent)" : "var(--ax-colors-fg-tertiary)" }}
													aria-label={opt.hidden ? "Show option" : "Hide option"}
												>
													<IconEyeOff size={16} />
												</button>
												<button
													type="button"
													onClick={() => setDropdownOptions((prev) => prev.filter((o) => o.id !== opt.id))}
													style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", color: "var(--ax-colors-fg-tertiary)" }}
													aria-label="Delete option"
												>
													<IconTrash size={16} />
												</button>
											</Box>
										))}
									</Box>
									<button
										type="button"
										onClick={() => setDropdownOptions((prev) => [
											...prev,
											{
												id: `opt-${Date.now()}`,
												value: "",
												hidden: false,
												color: LABEL_COLOR_PALETTE[prev.length % LABEL_COLOR_PALETTE.length],
											},
										])}
										style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "4px", alignSelf: "flex-start" }}
									>
										<IconPlus size={14} color="var(--ax-colors-fg-accent)" />
										<Text fontSize="sm" color="fg.accent">Add option</Text>
									</button>
								</Box>
							</>
						) : isNumber ? (
							<>
								{/* Subtype */}
								<RadioGroup value={numberSubtype} onValueChange={setNumberSubtype}>
									<Box display="flex" alignItems="center" gap="20">
										{NUMBER_SUBTYPES.map((s) => (
											<Radio key={s.value} value={s.value}>{s.label}</Radio>
										))}
									</Box>
								</RadioGroup>

								{/* Field name */}
								<Field label="Field Name" required>
									<Input
										value={fieldName}
										onValueChange={setFieldName}
										placeholder="Number field name"
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

								{/* Decimal Places */}
								<Field label="Decimal Places">
									<Box display="flex" alignItems="center" gap="12">
										<Box style={{ width: 96 }}>
											<Input
												type="number"
												inputMode="numeric"
												min={0}
												value={decimalPlaces}
												onValueChange={(v) => setDecimalPlaces(v.replace(/[^0-9]/g, ""))}
											/>
										</Box>
										<Text fontSize="sm" color="fg.tertiary">
											eg. {(1000).toFixed(Math.max(0, parseInt(decimalPlaces || "0", 10) || 0))}
										</Text>
									</Box>
								</Field>

								{/* 1000 separator */}
								<Box display="flex" alignItems="center" gap="8">
									<Checkbox
										checked={useThousandSeparator}
										onCheckedChange={(v) => setUseThousandSeparator(!!v)}
									>
										Use 1000 separator (,)
									</Checkbox>
								</Box>
							</>
						) : (
							<>
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

								{/* Text limit — Rich Text only */}
								{isRichText && (
									<Field label="Text limit">
										<Box style={{ width: 160 }}>
											<Input
												type="number"
												inputMode="numeric"
												min={0}
												value={textLimit}
												onValueChange={(v) => setTextLimit(v.replace(/[^0-9]/g, ""))}
												placeholder="Max characters"
											/>
										</Box>
									</Field>
								)}
							</>
						)}

						{/* Advanced settings */}
						<Disclosure>
							<DisclosureTrigger>
								<Text fontSize="md" fontWeight="600" color="fg.default">Advanced settings</Text>
							</DisclosureTrigger>
							<DisclosureContent>
								<Box display="flex" flexDirection="column" gap="24" pt="16">
									{/* Status */}
									<Box display="flex" alignItems="center" justifyContent="space-between">
										<Text fontSize="md" color="fg.default">Active</Text>
										<Switch checked={isActive} onCheckedChange={setIsActive} />
									</Box>

									{/* Read only */}
									<Box display="flex" alignItems="center" justifyContent="space-between">
										<Text fontSize="md" color="fg.default">Mark as read only field</Text>
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

									{/* Show in Filter — only for filterable types (Label, Checkbox, Dropdown, Date) */}
									{isFilterable && (
										<Box display="flex" flexDirection="column" gap="8">
											<Text fontSize="md" color="fg.default">
												Show in Filter
											</Text>
											<Box display="flex" flexDirection="column" gap="8">
												{FILTER_CONTEXTS.map((ctx) => (
													<Checkbox
														key={ctx.id}
														checked={showInFilter.includes(ctx.id)}
														onCheckedChange={(v) => setShowInFilter((prev) =>
															v ? Array.from(new Set([...prev, ctx.id])) : prev.filter((x) => x !== ctx.id),
														)}
													>
														{ctx.label}
													</Checkbox>
												))}
											</Box>
										</Box>
									)}
								</Box>
							</DisclosureContent>
						</Disclosure>
						</>)}
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
