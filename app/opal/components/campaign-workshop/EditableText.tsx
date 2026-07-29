"use client";

import { useRef, useState, type CSSProperties } from "react";
import { Input, Textarea } from "@optiaxiom/react";
import { IconPen } from "@optiaxiom/icons";

// Click-to-edit-in-place text, used for headlines, kickers, subject lines,
// and Alt Text across the campaign canvas. Renders as plain text matching
// the caller's own typography (via `style`) until clicked, then swaps to a
// focused Input/Textarea; commits on blur/Enter, Escape reverts. Persistence
// is the caller's job (CampaignWorkshopCanvas's `textOverrides` state) —
// this component only owns the edit/display toggle and draft value.
export function EditableText({
	ariaLabel,
	multiline = false,
	onChange,
	style,
	value,
}: {
	ariaLabel: string;
	multiline?: boolean;
	onChange: (next: string) => void;
	style?: CSSProperties;
	value: string;
}) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(value);
	const committingRef = useRef(false);

	const startEdit = () => {
		setDraft(value);
		setEditing(true);
	};

	const commit = () => {
		if (committingRef.current) return;
		committingRef.current = true;
		const next = draft.trim();
		onChange(next || value);
		setEditing(false);
		setTimeout(() => {
			committingRef.current = false;
		}, 0);
	};

	const cancel = () => {
		setDraft(value);
		setEditing(false);
	};

	if (editing) {
		const fieldStyle = { ...style, background: "var(--ax-colors-bg-default)", width: "100%" };
		return multiline ? (
			<Textarea
				aria-label={ariaLabel}
				autoFocus
				value={draft}
				onChange={(event) => setDraft(event.target.value)}
				onBlur={commit}
				onKeyDown={(event) => {
					if (event.key === "Escape") cancel();
					else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) commit();
				}}
				style={fieldStyle}
			/>
		) : (
			<Input
				aria-label={ariaLabel}
				autoFocus
				value={draft}
				onChange={(event) => setDraft(event.target.value)}
				onBlur={commit}
				onKeyDown={(event) => {
					if (event.key === "Escape") cancel();
					else if (event.key === "Enter") commit();
				}}
				style={fieldStyle}
			/>
		);
	}

	return (
		<button
			type="button"
			onClick={startEdit}
			aria-label={`Edit ${ariaLabel}`}
			style={{
				alignItems: multiline ? "flex-start" : "baseline",
				background: "transparent",
				border: "none",
				cursor: "text",
				display: "inline-flex",
				fontFamily: "inherit",
				gap: 6,
				justifyContent: "inherit",
				padding: 0,
				textAlign: "inherit",
				width: multiline ? "100%" : undefined,
			}}
		>
			<span style={style}>{value}</span>
			<IconPen size={13} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0, opacity: 0.55, marginTop: multiline ? 4 : 0 }} />
		</button>
	);
}
