"use client";

import { useState } from "react";
import { IconLetterT, IconLayoutColumns, IconList } from "@tabler/icons-react";


interface NodeAddMenuProps {
	disableSection?: boolean;
	onAddText: () => void;
	onAddSection: () => void;
	onOpenFieldPicker: () => void;
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
	justifyContent: "center",
	gap: 6,
	padding: "8px 6px",
	border: "1px solid var(--ax-colors-border-default)",
	borderRadius: 8,
	background: disabled ? "var(--ax-colors-bg-secondary)" : "var(--ax-colors-bg-default)",
	cursor: disabled ? "not-allowed" : "pointer",
	fontSize: 13,
	color: disabled ? "var(--ax-colors-fg-disabled, #9ca3af)" : "var(--ax-colors-fg-default)",
	fontFamily: "inherit",
	whiteSpace: "nowrap",
});


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
	disableSection,
	onAddText,
	onAddSection,
	onOpenFieldPicker,
}: NodeAddMenuProps) {
	return (
		<div className="nodrag nopan nowheel" style={menuCard} onClick={(e) => e.stopPropagation()}>
			{/* Type buttons */}
			<div style={{ display: "flex", gap: 6 }}>
				<TypeButton icon={<IconLetterT size={14} />} label="Paragraph" onClick={onAddText} />
				<TypeButton icon={<IconLayoutColumns size={14} />} label="Section" disabled={disableSection} onClick={onAddSection} />
				<TypeButton icon={<IconList size={14} />} label="Field" onClick={onOpenFieldPicker} />
			</div>

		</div>
	);
}
