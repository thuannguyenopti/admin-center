"use client";

import { useState } from "react";
import Image from "next/image";
import { IconLetterT, IconLayoutColumns, IconList } from "@tabler/icons-react";
import type { FormFieldDef } from "../types";

interface NodeAddMenuProps {
	suggestedFields: FormFieldDef[];
	disableSection?: boolean;
	onAddText: () => void;
	onAddSection: () => void;
	onOpenFieldPicker: () => void;
	onAddSuggestedField: (fieldId: string) => void;
	onClose: () => void;
}

const menuCard: React.CSSProperties = {
	background: "var(--ax-colors-bg-default)",
	border: "1px solid var(--ax-colors-border-tertiary)",
	borderRadius: 10,
	boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
	padding: 12,
	display: "flex",
	flexDirection: "column",
	gap: 10,
	width: 300,
};

const typeBtn = (disabled?: boolean): React.CSSProperties => ({
	flex: 1,
	display: "flex",
	alignItems: "center",
	gap: 6,
	padding: "8px 12px",
	border: "1px solid var(--ax-colors-border-default)",
	borderRadius: 8,
	background: disabled ? "var(--ax-colors-bg-secondary)" : "var(--ax-colors-bg-default)",
	cursor: disabled ? "not-allowed" : "pointer",
	fontSize: 13,
	color: disabled ? "var(--ax-colors-fg-disabled, #9ca3af)" : "var(--ax-colors-fg-default)",
	fontFamily: "inherit",
	whiteSpace: "nowrap",
});

const chip: React.CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	gap: 6,
	padding: "6px 10px",
	background: "var(--opal-bg-suggest, #f1f3f9)",
	border: "1px solid var(--opal-border-secondary, #e2e6f0)",
	borderRadius: 6,
	fontSize: 13,
	color: "var(--ax-colors-fg-default)",
	cursor: "pointer",
	fontFamily: "inherit",
};

function TypeButton({
	icon,
	label,
	disabled,
	onClick,
}: {
	icon: React.ReactNode;
	label: string;
	disabled?: boolean;
	onClick: () => void;
}) {
	const [hovered, setHovered] = useState(false);
	return (
		<button
			className="nodrag nopan"
			disabled={disabled}
			onClick={(e) => { e.stopPropagation(); if (!disabled) onClick(); }}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{
				...typeBtn(disabled),
				background: !disabled && hovered ? "var(--ax-colors-bg-secondary)" : typeBtn(disabled).background,
			}}
		>
			{icon}
			{label}
		</button>
	);
}

export function NodeAddMenu({
	suggestedFields,
	disableSection,
	onAddText,
	onAddSection,
	onOpenFieldPicker,
	onAddSuggestedField,
}: NodeAddMenuProps) {
	return (
		<div className="nodrag nopan" style={menuCard} onClick={(e) => e.stopPropagation()} onWheel={(e) => e.stopPropagation()}>
			{/* Type buttons */}
			<div style={{ display: "flex", gap: 6 }}>
				<TypeButton icon={<IconLetterT size={14} />} label="Text" onClick={onAddText} />
				<TypeButton icon={<IconLayoutColumns size={14} />} label="Section" disabled={disableSection} onClick={onAddSection} />
				<TypeButton icon={<IconList size={14} />} label="Field" onClick={onOpenFieldPicker} />
			</div>

			{/* Opal suggested */}
			{suggestedFields.length > 0 && (
				<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
					<div style={{ display: "flex", alignItems: "center", gap: 5 }}>
						<Image src="/opal-orb.png" alt="" width={14} height={14} />
						<span style={{ fontSize: 12, color: "var(--ax-colors-fg-tertiary)", fontFamily: "inherit" }}>
							Opal suggested
						</span>
					</div>
					<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
						{suggestedFields.map((f) => (
							<button
								key={f.id}
								className="nodrag nopan"
								onClick={(e) => { e.stopPropagation(); onAddSuggestedField(f.id); }}
								style={chip}
							>
								<span style={{ display: "flex", color: "var(--ax-colors-fg-secondary)", flexShrink: 0 }}>
									{f.icon}
								</span>
								{f.name}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
