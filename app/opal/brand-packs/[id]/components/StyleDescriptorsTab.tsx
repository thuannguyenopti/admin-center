"use client";

import {useState} from "react";
import {Box, Button, Input, Text} from "@optiaxiom/react";
import {IconCheck, IconChevronDown, IconChevronUp, IconPlus, IconXmark} from "@optiaxiom/icons";

type DescriptorGroup = {
	id: string;
	label: string;
	items: string[];
};

const INITIAL_GROUPS: DescriptorGroup[] = [
	{
		id: "photography",
		label: "Photography Style",
		items: [
			"Clean, editorial photography — subjects sharp against considered backgrounds",
			"Natural or studio-controlled lighting; avoid harsh flash or warm tones",
			"People shown in active, confident, forward-moving contexts",
		],
	},
	{
		id: "colour-mood",
		label: "Color Mood",
		items: [
			"Electric green as the dominant accent — used boldly, not sparingly",
			"High contrast between black/white base and accent colors",
			"Avoid warm yellows, browns, or muted pastels outside brand palette",
		],
	},
	{
		id: "composition",
		label: "Composition",
		items: [
			"Strong geometric structure — grid-aligned, intentional negative space",
			"Typography-forward layouts: headlines treated as visual elements",
			"Generous white space; never cluttered or busy",
		],
	},
	{
		id: "avoid",
		label: "What to Avoid",
		items: [
			"Generic stock photography: handshakes, people pointing at screens",
			"Soft or desaturated color grading",
			"Decorative gradients or lens flares",
		],
	},
];

const INITIAL_CONSTRAINTS: string[] = [
	"Must never alter, mimic, or recreate illustration components — use as-is or exclude.",
];

function SentenceRow({
	canMoveDown,
	canMoveUp,
	value,
	onChange,
	onMoveDown,
	onMoveUp,
	onRemove,
}: {
	canMoveDown: boolean;
	canMoveUp: boolean;
	value: string;
	onChange: (val: string) => void;
	onMoveDown: () => void;
	onMoveUp: () => void;
	onRemove: () => void;
}) {
	return (
		<Box alignItems="center" display="flex" gap="4">
			<Input value={value} onChange={(e) => onChange(e.target.value)} style={{flex: 1}} />
			<Box display="flex" flexDirection="column">
				<Button
					appearance="subtle"
					aria-label="Move up"
					disabled={!canMoveUp}
					icon={<IconChevronUp size={12} />}
					onClick={onMoveUp}
					size="sm"
					style={{height: 18, minHeight: 0, padding: "0 4px"}}
				/>
				<Button
					appearance="subtle"
					aria-label="Move down"
					disabled={!canMoveDown}
					icon={<IconChevronDown size={12} />}
					onClick={onMoveDown}
					size="sm"
					style={{height: 18, minHeight: 0, padding: "0 4px"}}
				/>
			</Box>
			<Button
				appearance="subtle"
				aria-label="Remove"
				icon={<IconXmark size={14} />}
				onClick={onRemove}
				size="sm"
			/>
		</Box>
	);
}

function DescriptorSection({
	group,
	onChange,
}: {
	group: DescriptorGroup;
	onChange: (g: DescriptorGroup) => void;
}) {
	const update = (items: string[]) => onChange({...group, items});

	const updateItem = (index: number, val: string) => {
		const next = [...group.items];
		next[index] = val;
		update(next);
	};

	const removeItem = (index: number) => update(group.items.filter((_, i) => i !== index));

	const moveItem = (index: number, dir: -1 | 1) => {
		const next = [...group.items];
		const target = index + dir;
		if (target < 0 || target >= next.length) return;
		[next[index], next[target]] = [next[target], next[index]];
		update(next);
	};

	const addItem = () => update([...group.items, ""]);

	return (
		<Box display="flex" flexDirection="column" gap="12">
			<Text
				color="fg.tertiary"
				fontWeight="600"
				style={{fontSize: 12, letterSpacing: 0, textTransform: "uppercase"}}
			>
				{group.label}
			</Text>

			<Box display="flex" flexDirection="column" gap="6">
				{group.items.map((item, index) => (
					<SentenceRow
						key={index}
						canMoveDown={index < group.items.length - 1}
						canMoveUp={index > 0}
						value={item}
						onChange={(val) => updateItem(index, val)}
						onMoveDown={() => moveItem(index, 1)}
						onMoveUp={() => moveItem(index, -1)}
						onRemove={() => removeItem(index)}
					/>
				))}
			</Box>

			<Box>
				<Button
					appearance="subtle"
					icon={<IconPlus size={14} />}
					onClick={addItem}
					size="sm"
				>
					Add
				</Button>
			</Box>
		</Box>
	);
}

function HardConstraintsSection({
	items,
	onChange,
}: {
	items: string[];
	onChange: (items: string[]) => void;
}) {
	const updateItem = (index: number, val: string) => {
		const next = [...items];
		next[index] = val;
		onChange(next);
	};

	const removeItem = (index: number) => onChange(items.filter((_, i) => i !== index));

	const moveItem = (index: number, dir: -1 | 1) => {
		const next = [...items];
		const target = index + dir;
		if (target < 0 || target >= next.length) return;
		[next[index], next[target]] = [next[target], next[index]];
		onChange(next);
	};

	return (
		<Box
			bg="bg.secondary"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			gap="16"
			p="20"
			rounded="xl"
		>
			<Box display="flex" flexDirection="column" gap="4">
				<Text fontWeight="700" style={{fontSize: 15}}>
					Hard Constraints
				</Text>
				<Text color="fg.secondary" fontSize="xs" style={{lineHeight: 1.5, maxWidth: 480}}>
					Non-negotiable rules Opal must always follow regardless of the prompt. These
					override everything else — use them for legal requirements, protected assets,
					and absolute brand rules.
				</Text>
			</Box>

			<Box display="flex" flexDirection="column" gap="6">
				{items.map((item, index) => (
					<SentenceRow
						key={index}
						canMoveDown={index < items.length - 1}
						canMoveUp={index > 0}
						value={item}
						onChange={(val) => updateItem(index, val)}
						onMoveDown={() => moveItem(index, 1)}
						onMoveUp={() => moveItem(index, -1)}
						onRemove={() => removeItem(index)}
					/>
				))}
			</Box>

			<Box>
				<Button
					appearance="subtle"
					icon={<IconPlus size={14} />}
					onClick={() => onChange([...items, ""])}
					size="sm"
				>
					Add constraint
				</Button>
			</Box>
		</Box>
	);
}

export function StyleDescriptorsTab() {
	const [groups, setGroups] = useState<DescriptorGroup[]>(INITIAL_GROUPS);
	const [constraints, setConstraints] = useState<string[]>(INITIAL_CONSTRAINTS);
	const [saved, setSaved] = useState(false);

	const updateGroup = (updated: DescriptorGroup) =>
		setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));

	const save = () => {
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	};

	return (
		<Box display="flex" flexDirection="column" gap="24" style={{maxWidth: 680}}>
			<Text color="fg.secondary" fontSize="sm" style={{lineHeight: 1.5}}>
				Style descriptors guide Opal's visual decisions — photography selection, mood, and
				composition choices when generating or sourcing content.
			</Text>

			<Box
				bg="bg.default"
				border="1"
				borderColor="border.tertiary"
				display="flex"
				flexDirection="column"
				gap="24"
				p="24"
				rounded="xl"
				shadow="sm"
			>
				{groups.map((group) => (
					<DescriptorSection key={group.id} group={group} onChange={updateGroup} />
				))}
			</Box>

			<HardConstraintsSection items={constraints} onChange={setConstraints} />

			<Box display="flex" justifyContent="end">
				<Button
					appearance="primary"
					icon={saved ? <IconCheck /> : undefined}
					onClick={save}
					size="md"
				>
					{saved ? "Saved" : "Save descriptors"}
				</Button>
			</Box>
		</Box>
	);
}
