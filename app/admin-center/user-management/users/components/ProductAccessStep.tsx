"use client";

import { useEffect, useState } from "react";
import {
	Box,
	Button,
	Checkbox,
	Field,
	Heading,
	LabelMenuButton,
	Menu,
	MenuContent,
	MenuTrigger,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Text,
} from "@optiaxiom/react";
import {
	IconAngleDown,
	IconPen,
	IconTrashCan,
} from "@optiaxiom/icons";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { PRODUCTS, INSTANCES, ROLES, GROUPS } from "../data";

export type AccessKind = "product" | "group";
export type AccessInstance = { name: string; roles: string[] };
export type AccessEntry = {
	id: string;
	kind: AccessKind;
	name: string;
	instances: AccessInstance[];
};

/**
 * Reusable "Product access" step — the access editor used by the Invite User
 * wizard (step 2), the Create Group wizard (step 3), and bulk Add access.
 *
 * Parent owns `accessList`; this component manages the inline add/edit editor
 * and reports editor open state via `onEditorChange` so the parent can gate
 * its "Continue" button.
 */
export function ProductAccessStep({
	accessList,
	setAccessList,
	onEditorChange,
	presetProduct,
	autoOpenWhenEmpty = true,
	showGroupAccess = true,
}: {
	accessList: AccessEntry[];
	setAccessList: (a: AccessEntry[]) => void;
	onEditorChange?: (open: boolean) => void;
	/** Pre-fill the product field when opening the first editor. */
	presetProduct?: string;
	/** Open the product editor automatically when the list starts empty. */
	autoOpenWhenEmpty?: boolean;
	/** Show the "Add group access" button. Hidden when configuring a group itself. */
	showGroupAccess?: boolean;
}) {
	const [editor, setEditor] = useState<
		| { mode: "new" | "edit"; kind: AccessKind; id?: string; initial: AccessEntry | null }
		| null
	>(
		autoOpenWhenEmpty && accessList.length === 0
			? {
					mode: "new",
					kind: "product",
					initial: presetProduct
						? {
								id: "preset",
								kind: "product",
								name: presetProduct,
								instances: [],
							}
						: null,
				}
			: null,
	);

	useEffect(() => {
		onEditorChange?.(!!editor);
	}, [editor, onEditorChange]);

	const startNew = (kind: AccessKind) => setEditor({ mode: "new", kind, initial: null });
	const startEdit = (entry: AccessEntry) =>
		setEditor({ mode: "edit", kind: entry.kind, id: entry.id, initial: entry });

	const handleSave = (data: Omit<AccessEntry, "id">) => {
		if (editor?.mode === "edit" && editor.id) {
			setAccessList(
				accessList.map((a) =>
					a.id === editor.id ? { ...data, id: editor.id! } : a,
				),
			);
		} else {
			setAccessList([
				...accessList,
				{ ...data, id: `${Date.now()}-${Math.random()}` },
			]);
		}
		setEditor(null);
	};

	return (
		<Box display="flex" flexDirection="column" gap="16">
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				gap="12"
			>
				<Heading level="4">Access</Heading>
				<Box display="flex" gap="8">
					<Button
						appearance="default"
						size="sm"
						disabled={!!editor}
						onClick={() => startNew("product")}
					>
						Add product access
					</Button>
					{showGroupAccess && (
						<Button
							appearance="default"
							size="sm"
							disabled={!!editor}
							onClick={() => startNew("group")}
						>
							Add group access
						</Button>
					)}
				</Box>
			</Box>

			{accessList.map((entry) =>
				editor && editor.mode === "edit" && editor.id === entry.id ? (
					<Box
						key={entry.id}
						p="16"
						rounded="md"
						border="1"
						borderColor="border.default"
					>
						<AccessEditor
							kind={editor.kind}
							initial={editor.initial}
							onSave={handleSave}
							onCancel={() => setEditor(null)}
						/>
					</Box>
				) : (
					<AccessCard
						key={entry.id}
						entry={entry}
						onEdit={() => startEdit(entry)}
						onDelete={() =>
							setAccessList(accessList.filter((a) => a.id !== entry.id))
						}
					/>
				),
			)}

			{editor && editor.mode === "new" && (
				<Box p="16" rounded="md" border="1" borderColor="border.default">
					<AccessEditor
						kind={editor.kind}
						initial={null}
						onSave={handleSave}
						onCancel={() => setEditor(null)}
					/>
				</Box>
			)}

			{accessList.length === 0 && !editor && (
				<Box py="40" textAlign="center">
					<Text color="fg.tertiary">No access added yet.</Text>
					<Text color="fg.tertiary">
						Choose one of the options to define what this group can do.
					</Text>
				</Box>
			)}
		</Box>
	);
}

export function AccessEditor({
	kind,
	initial,
	onSave,
	onCancel,
}: {
	kind: AccessKind;
	initial: AccessEntry | null;
	onSave: (entry: Omit<AccessEntry, "id">) => void;
	onCancel: () => void;
}) {
	const productLabel = kind === "group" ? "Group" : "Product";
	const sourceList = kind === "group" ? GROUPS : PRODUCTS;
	const [name, setName] = useState(initial?.name ?? "");
	const [instances, setInstances] = useState<AccessInstance[]>(
		initial?.instances.map((i) => ({ ...i, roles: [...i.roles] })) ?? [],
	);

	const setSelectedInstances = (names: string[]) => {
		setInstances(
			names.map(
				(n) => instances.find((i) => i.name === n) ?? { name: n, roles: [] },
			),
		);
	};

	const setRoles = (idx: number, roles: string[]) => {
		setInstances(instances.map((i, j) => (j === idx ? { ...i, roles } : i)));
	};

	const canSave =
		!!name &&
		instances.length > 0 &&
		instances.every((i) => i.roles.length > 0);

	return (
		<Box display="flex" flexDirection="column" gap="12">
			<Field
				label={
					<Box display="inline-flex" alignItems="center" gap="4">
						<span>{productLabel}</span>
						<Text asChild color="fg.error">
							<span>*</span>
						</Text>
					</Box>
				}
			>
				<SingleSelectMenu
					label={productLabel}
					value={name}
					options={sourceList as readonly string[]}
					onChange={setName}
				/>
			</Field>

			<Field
				label={
					<Box display="inline-flex" alignItems="center" gap="4">
						<span>Instance</span>
						{name && (
							<Text asChild color="fg.error">
								<span>*</span>
							</Text>
						)}
					</Box>
				}
			>
				<MultiSelectMenu
					label="Instance"
					values={instances.map((i) => i.name)}
					options={INSTANCES as readonly string[]}
					onChange={setSelectedInstances}
					disabled={!name}
				/>
			</Field>

			{instances.length > 0 && (
				<Table>
					<thead>
						<Tr>
							<Th>Instance</Th>
							<Th style={{ width: 220 }}>Role</Th>
						</Tr>
					</thead>
					<tbody>
						{instances.map((inst, idx) => (
							<Tr key={inst.name}>
								<Td>{inst.name}</Td>
								<Td>
									<SingleSelectMenu
										label="Role"
										value={inst.roles[0] ?? ""}
										options={ROLES as readonly string[]}
										onChange={(role) => setRoles(idx, role ? [role] : [])}
									/>
								</Td>
							</Tr>
						))}
					</tbody>
				</Table>
			)}

			<Box display="flex" justifyContent="end" gap="8" mt="4">
				<Button appearance="subtle" size="sm" onClick={onCancel}>
					Cancel
				</Button>
				<Button
					appearance="primary"
					size="sm"
					disabled={!canSave}
					onClick={() => onSave({ kind, name, instances })}
				>
					Save {productLabel.toLowerCase()} access
				</Button>
			</Box>
		</Box>
	);
}

export function AccessCard({
	entry,
	onEdit,
	onDelete,
	defaultOpen = false,
	readOnly = false,
}: {
	entry: AccessEntry;
	onEdit?: () => void;
	onDelete?: () => void;
	defaultOpen?: boolean;
	readOnly?: boolean;
}) {
	const [open, setOpen] = useState(defaultOpen);
	const label = entry.kind === "group" ? "group" : "product";

	return (
		<Box rounded="md" border="1" borderColor="border.default" bg="bg.default">
			<Box
				display="flex"
				alignItems="center"
				gap="12"
				px="16"
				py="12"
				cursor="pointer"
				onClick={() => setOpen((o) => !o)}
			>
				<Text fontWeight="600">{entry.name}</Text>
				<Box flex="1" />
				<Text fontSize="sm" color="fg.tertiary">
					{entry.instances.length}{" "}
					{entry.instances.length === 1 ? "instance" : "instances"}
				</Text>
				<Box
					style={{
						display: "inline-flex",
						transform: open ? "rotate(180deg)" : "rotate(0deg)",
						transition: "transform 150ms ease",
					}}
				>
					<IconAngleDown size={16} color="var(--ax-colors-fg-secondary)" />
				</Box>
			</Box>
			{open && (
				<Box px="16" pb="16">
					<Table>
						<thead>
							<Tr>
								<Th>Instance</Th>
								<Th>Role</Th>
							</Tr>
						</thead>
						<tbody>
							{entry.instances.map((inst) => (
								<Tr key={inst.name}>
									<Td>{inst.name}</Td>
									<Td>{inst.roles.join(", ") || "—"}</Td>
								</Tr>
							))}
						</tbody>
					</Table>
					{!readOnly && (onEdit || onDelete) && (
						<Box display="flex" justifyContent="end" gap="8" mt="12">
							{onEdit && (
								<Button
									appearance="default"
									size="sm"
									icon={<IconPen size={14} />}
									iconPosition="start"
									onClick={onEdit}
								>
									Edit {label} access
								</Button>
							)}
							{onDelete && (
								<Button
									appearance="default"
									size="sm"
									icon={<IconTrashCan size={14} />}
									iconPosition="start"
									onClick={onDelete}
								>
									Delete
								</Button>
							)}
						</Box>
					)}
				</Box>
			)}
		</Box>
	);
}

export function SingleSelectMenu({
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: string;
	options: readonly string[];
	onChange: (v: string) => void;
}) {
	return (
		<Menu
			options={options.map((opt) => ({
				label: opt,
				execute: () => onChange(opt),
			}))}
		>
			<MenuTrigger asChild>
				<LabelMenuButton label={label}>
					{value || `Select ${label.toLowerCase()}`}
				</LabelMenuButton>
			</MenuTrigger>
			<MenuContent
				style={{
					width: "var(--radix-popper-anchor-width)",
					minWidth: "var(--radix-popper-anchor-width)",
				}}
			/>
		</Menu>
	);
}

export function MultiSelectMenu({
	label,
	values,
	options,
	onChange,
	disabled,
}: {
	label: string;
	values: string[];
	options: readonly string[];
	onChange: (v: string[]) => void;
	disabled?: boolean;
}) {
	const toggle = (opt: string) => {
		if (values.includes(opt)) onChange(values.filter((v) => v !== opt));
		else onChange([...values, opt]);
	};
	const summary =
		values.length === 0
			? `Select ${label.toLowerCase()}`
			: values.length === 1
				? values[0]
				: `${values.length} selected`;

	// Popover (not Menu) so the dropdown stays open while toggling multiple
	// checkboxes — Menu closes on every select and double-fires the addon.
	return (
		<Popover>
			<PopoverTrigger asChild>
				<LabelMenuButton label={label} disabled={disabled}>
					{summary}
				</LabelMenuButton>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				style={{
					width: "var(--radix-popper-anchor-width)",
					minWidth: 220,
					maxHeight: 320,
					overflowY: "auto",
					padding: 4,
				}}
			>
				<Box display="flex" flexDirection="column">
					{options.map((opt) => (
						<Box
							key={opt}
							display="flex"
							alignItems="center"
							gap="8"
							p="8"
							rounded="sm"
							cursor="pointer"
							className="hover:bg-[var(--ax-colors-bg-default-hovered)]"
							onClick={() => toggle(opt)}
						>
							<Box display="inline-flex" onClick={(e) => e.stopPropagation()}>
								<Checkbox
									checked={values.includes(opt)}
									aria-label={opt}
									onCheckedChange={() => toggle(opt)}
								/>
							</Box>
							<Text fontSize="md">{opt}</Text>
						</Box>
					))}
				</Box>
			</PopoverContent>
		</Popover>
	);
}
