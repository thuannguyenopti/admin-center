"use client";

import { Tooltip } from "@optiaxiom/react";
import { IconArrowsRotate, IconCopy, IconPen, IconThumbsDown, IconThumbsUp } from "@optiaxiom/icons";

// Quick-action row shown under Opal's artifact cards (Figma "Start Flow" node
// 6708:36803 / 6708:93244: Edit in Canvas + refresh/copy/thumbs). Mirrors the
// exact interaction pattern already used for assistant messages in
// app/components/Opal/OpalMessage.tsx (ActionButton + "Edit in Canvas" row) —
// reused here instead of inventing a new visual language.
function IconActionButton({ icon: Icon, onClick, tooltip }: { icon: typeof IconPen; onClick?: () => void; tooltip: string }) {
	return (
		<Tooltip content={tooltip} delayDuration={400}>
			<button
				type="button"
				onClick={onClick}
				aria-label={tooltip}
				style={{
					alignItems: "center",
					background: "transparent",
					border: "none",
					borderRadius: 4,
					color: "var(--ax-colors-fg-tertiary)",
					cursor: "pointer",
					display: "flex",
					justifyContent: "center",
					padding: 4,
					transition: "color 0.2s, background-color 0.2s",
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.color = "var(--ax-colors-fg-default)";
					e.currentTarget.style.backgroundColor = "var(--ax-colors-bg-secondary)";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.color = "var(--ax-colors-fg-tertiary)";
					e.currentTarget.style.backgroundColor = "transparent";
				}}
			>
				<Icon size={16} />
			</button>
		</Tooltip>
	);
}

export function QuickActionRow({ onEditInCanvas }: { onEditInCanvas: () => void }) {
	return (
		<div style={{ alignItems: "center", display: "flex", gap: 4, marginTop: 8 }}>
			<button
				type="button"
				onClick={onEditInCanvas}
				style={{
					alignItems: "center",
					background: "transparent",
					border: "none",
					borderRadius: 4,
					color: "var(--ax-colors-fg-tertiary)",
					cursor: "pointer",
					display: "flex",
					fontSize: 13,
					gap: 4,
					padding: "4px 6px",
					transition: "color 0.2s, background-color 0.2s",
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.color = "var(--ax-colors-fg-default)";
					e.currentTarget.style.backgroundColor = "var(--ax-colors-bg-secondary)";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.color = "var(--ax-colors-fg-tertiary)";
					e.currentTarget.style.backgroundColor = "transparent";
				}}
			>
				<IconPen size={14} />
				Edit in Canvas
			</button>
			<IconActionButton icon={IconArrowsRotate} tooltip="Regenerate" />
			<IconActionButton icon={IconCopy} tooltip="Copy" />
			<IconActionButton icon={IconThumbsUp} tooltip="Helpful" />
			<IconActionButton icon={IconThumbsDown} tooltip="Not helpful" />
		</div>
	);
}
