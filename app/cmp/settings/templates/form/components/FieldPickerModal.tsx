"use client";

import { useState } from "react";
import { Box } from "@optiaxiom/react";
import { IconSearch, IconArrowLeft, IconPlus } from "@tabler/icons-react";
import { STANDARD_FIELDS } from "../data";
import type { FormFieldDef } from "../types";

interface FieldPickerInlineProps {
	onBack: () => void;
	onSelect: (field: FormFieldDef) => void;
	customFields?: FormFieldDef[];
	onOpenCreateField?: () => void;
}

function SectionHeader({ label }: { label: string }) {
	return (
		<div style={{
			padding: "8px 4px 4px",
			fontSize: 11,
			fontWeight: 600,
			color: "var(--ax-colors-fg-tertiary)",
			textTransform: "uppercase",
			letterSpacing: "0.04em",
			fontFamily: "inherit",
		}}>
			{label}
		</div>
	);
}

function FieldRow({ field, onSelect }: { field: FormFieldDef; onSelect: (f: FormFieldDef) => void }) {
	const [hovered, setHovered] = useState(false);
	return (
		<button
			key={field.id}
			onClick={() => onSelect(field)}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{
				display: "flex",
				alignItems: "center",
				gap: 8,
				padding: "6px 8px",
				background: hovered ? "var(--ax-colors-bg-default-hovered)" : "transparent",
				border: "none",
				borderRadius: 6,
				cursor: "pointer",
				textAlign: "left",
				width: "100%",
				fontFamily: "inherit",
			}}
		>
			<Box
				p="6"
				rounded="sm"
				bg="bg.accent.subtle"
				color="fg.default"
				display="flex"
				alignItems="center"
				justifyContent="center"
				style={{ flexShrink: 0 }}
			>
				{field.icon}
			</Box>
			<span style={{ fontSize: 14, color: "var(--ax-colors-fg-default)" }}>
				{field.name}
			</span>
		</button>
	);
}

export function FieldPickerInline({ onBack, onSelect, customFields = [], onOpenCreateField }: FieldPickerInlineProps) {
	const [query, setQuery] = useState("");

	const q = query.toLowerCase();
	const filteredStandard = query
		? STANDARD_FIELDS.filter((f) => f.name.toLowerCase().includes(q) || f.typeLabel.toLowerCase().includes(q))
		: STANDARD_FIELDS;
	const filteredCustom = query
		? customFields.filter((f) => f.name.toLowerCase().includes(q) || f.typeLabel.toLowerCase().includes(q))
		: customFields;

	return (
		<div
			className="nodrag nopan nowheel"
			onClick={(e) => e.stopPropagation()}
			style={{
				background: "var(--ax-colors-bg-default)",
				border: "1px solid var(--ax-colors-border-tertiary)",
				borderRadius: 10,
				boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
				padding: 12,
				display: "flex",
				flexDirection: "column",
				gap: 8,
				width: 300,
			}}
		>
			{/* Header */}
			<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
				<button
					onClick={onBack}
					style={{
						background: "transparent",
						border: "none",
						cursor: "pointer",
						padding: 4,
						borderRadius: 4,
						display: "flex",
						alignItems: "center",
						color: "var(--ax-colors-fg-secondary)",
						flexShrink: 0,
					}}
				>
					<IconArrowLeft size={14} />
				</button>
				<span style={{ fontSize: 13, fontWeight: 500, color: "var(--ax-colors-fg-default)", fontFamily: "inherit", flex: 1 }}>
					Select a field
				</span>
				{onOpenCreateField && (
					<button
						onClick={(e) => { e.stopPropagation(); onOpenCreateField(); }}
						title="Create new field"
						style={{
							background: "transparent",
							border: "none",
							cursor: "pointer",
							padding: 4,
							borderRadius: 4,
							display: "flex",
							alignItems: "center",
							color: "var(--ax-colors-fg-secondary)",
							flexShrink: 0,
						}}
					>
						<IconPlus size={14} />
					</button>
				)}
			</div>

			{/* Search */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 8,
					border: "1px solid var(--ax-colors-border-default)",
					borderRadius: 8,
					padding: "7px 10px",
				}}
			>
				<IconSearch size={13} color="var(--ax-colors-fg-tertiary)" style={{ flexShrink: 0 }} />
				<input
					autoFocus
					placeholder="Search fields..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					style={{
						flex: 1,
						border: "none",
						outline: "none",
						fontSize: 13,
						background: "transparent",
						color: "var(--ax-colors-fg-default)",
						fontFamily: "inherit",
					}}
				/>
			</div>

			{/* Field list */}
			<div style={{ maxHeight: 280, overflowY: "auto" }}>
				{filteredStandard.map((field) => (
					<FieldRow key={field.id} field={field} onSelect={onSelect} />
				))}

				{filteredCustom.length > 0 && (
					<>
						<SectionHeader label="Custom fields" />
						{filteredCustom.map((field) => (
							<FieldRow key={field.id} field={field} onSelect={onSelect} />
						))}
					</>
				)}

				{filteredStandard.length === 0 && filteredCustom.length === 0 && (
					<div style={{ padding: "12px 4px", textAlign: "center", fontSize: 12, color: "var(--ax-colors-fg-tertiary)", fontFamily: "inherit" }}>
						No fields found
					</div>
				)}
			</div>
		</div>
	);
}
