"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Handle, Position, NodeResizer, NodeToolbar, type NodeProps } from "@xyflow/react";
import { IconLayoutColumns, IconPlus } from "@tabler/icons-react";
import { NodeAddMenu } from "../NodeAddMenu";
import { FieldPickerInline } from "../FieldPickerModal";

export const SECTION_HEADER_HEIGHT = 44;

const handleStyle = {
	background: "var(--ax-colors-border-accent)",
	width: 10,
	height: 10,
	border: "2px solid var(--ax-colors-bg-default)",
	// Must render above the header div (zIndex: 1) and the background overlay
	zIndex: 10,
};

export function FormSectionNode({ data, selected }: NodeProps) {
	const d = data as any;
	const [isEditing, setIsEditing] = useState(false);
	const [title, setTitle] = useState<string>(d.label ?? "Section");
	const inputRef = useRef<HTMLInputElement>(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [showFields, setShowFields] = useState(false);
	const [plusHovered, setPlusHovered] = useState(false);
	const [addBtnHovered, setAddBtnHovered] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => { if (!selected && !isMenuOpen) { setShowFields(false); } }, [selected, isMenuOpen]);

	useEffect(() => {
		if (!isMenuOpen) return;
		const handler = (e: MouseEvent) => {
			if (!menuRef.current?.contains(e.target as Node)) {
				setIsMenuOpen(false);
				setShowFields(false);
			}
		};
		const id = setTimeout(() => document.addEventListener("mousedown", handler), 0);
		return () => { clearTimeout(id); document.removeEventListener("mousedown", handler); };
	}, [isMenuOpen]);

	const commitTitle = useCallback(() => {
		setIsEditing(false);
		if (title.trim()) d.onLabelChange?.(title.trim());
		else setTitle(d.label ?? "Section");
	}, [title, d]);

	return (
		<>
			<NodeToolbar position={Position.Bottom} isVisible={selected || isMenuOpen} align="center" offset={8}>
				<div ref={menuRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
					<button
						className="nodrag nopan"
						onClick={(e) => { e.stopPropagation(); setIsMenuOpen((v) => { if (v) { setShowFields(false); } return !v; }); }}
						onMouseEnter={() => setPlusHovered(true)}
						onMouseLeave={() => setPlusHovered(false)}
						style={{
							width: 28,
							height: 28,
							borderRadius: 6,
							border: isMenuOpen || plusHovered ? "none" : "1px solid var(--ax-colors-border-default)",
							background: isMenuOpen || plusHovered ? "var(--ax-colors-bg-accent)" : "var(--ax-colors-bg-default)",
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							padding: 0,
						}}
					>
						<IconPlus size={14} color={isMenuOpen || plusHovered ? "#fff" : "var(--ax-colors-fg-secondary)"} />
					</button>
					{isMenuOpen && (showFields ? (
						<FieldPickerInline
							onBack={() => setShowFields(false)}
							onSelect={(field) => { d.onAddSectionChild?.("field", field.id); setIsMenuOpen(false); setShowFields(false); }}
							customFields={d.customFields}
							onOpenCreateField={() => { d.onOpenCreateField?.(); setIsMenuOpen(false); setShowFields(false); }}
						/>
					) : (
						<NodeAddMenu
							disableSection
							onAddText={() => { d.onAddSectionChild?.("text"); setIsMenuOpen(false); }}
							onAddSection={() => {}}
							onOpenFieldPicker={() => setShowFields(true)}
							onClose={() => setIsMenuOpen(false)}
						/>
					))}
				</div>
			</NodeToolbar>

			<NodeResizer
				minWidth={320}
				minHeight={SECTION_HEADER_HEIGHT + 80}
				isVisible={selected}
				lineStyle={{ border: "1.5px solid var(--ax-colors-border-accent)" }}
				handleStyle={{ width: 8, height: 8, borderRadius: "2px", background: "var(--ax-colors-border-accent)" }}
			/>

			{/* Full-area background — no border here so the border overlay shows above header */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					borderRadius: "8px",
					background: "rgba(246,247,249, 0.6)",
					opacity: d.isDimmed ? 0.3 : 1,
					transition: "opacity 0.2s ease",
					boxSizing: "border-box",
				}}
			/>

			{/* Header — pinned to top */}
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					height: `${SECTION_HEADER_HEIGHT}px`,
					display: "flex",
					alignItems: "center",
					gap: "8px",
					padding: "0 12px",
					borderBottom: "1px solid var(--ax-colors-border-tertiary)",
					background: "var(--ax-colors-bg-default)",
					borderRadius: "6px 6px 0 0",
					boxSizing: "border-box",
					zIndex: 1,
					opacity: d.isDimmed ? 0.3 : 1,
					transition: "opacity 0.2s ease",
				}}
			>
				<span style={{ flexShrink: 0, color: "var(--ax-colors-fg-secondary)", display: "flex" }}>
					<IconLayoutColumns size={14} />
				</span>

				{isEditing ? (
					<input
						ref={inputRef}
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						onBlur={commitTitle}
						onKeyDown={(e) => {
							if (e.key === "Enter") commitTitle();
							if (e.key === "Escape") {
								setTitle(d.label ?? "Section");
								setIsEditing(false);
							}
						}}
						onClick={(e) => e.stopPropagation()}
						autoFocus
						style={{
							flex: 1,
							border: "none",
							outline: "none",
							background: "transparent",
							fontSize: "13px",
							fontWeight: 500,
							color: "var(--ax-colors-fg-default)",
						}}
					/>
				) : (
					<span
						onDoubleClick={(e) => {
							e.stopPropagation();
							setIsEditing(true);
						}}
						style={{
							flex: 1,
							fontSize: "13px",
							fontWeight: 500,
							color: "var(--ax-colors-fg-default)",
							cursor: "text",
							userSelect: "none",
						}}
					>
						{d.label ?? title}
					</span>
				)}
			</div>

			{/* Empty-state placeholder — shown when the section has no children */}
			{((d.childCount ?? 0) === 0) && (
				<div
					className="nodrag nopan nowheel"
					style={{
						position: "absolute",
						left: 16,
						right: 16,
						top: SECTION_HEADER_HEIGHT + 16,
						bottom: 16,
						borderRadius: "8px",
						border: "2px dashed var(--ax-colors-border-default)",
						background: "var(--ax-colors-bg-default)",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						gap: 8,
						padding: 12,
						boxSizing: "border-box",
						zIndex: 1,
					}}
					onClick={(e) => e.stopPropagation()}
				>
					<div style={{ fontSize: 13, fontWeight: 500, color: "var(--ax-colors-fg-secondary)" }}>
						Drop fields here
					</div>
					<button
						className="nodrag nopan nowheel"
						onMouseEnter={() => setAddBtnHovered(true)}
						onMouseLeave={() => setAddBtnHovered(false)}
						onClick={(e) => { e.stopPropagation(); setIsMenuOpen((v) => { if (v) setShowFields(false); return !v; }); }}
						style={{
							display: "flex",
							alignItems: "center",
							gap: 4,
							padding: "4px 10px",
							border: "1px solid var(--ax-colors-border-default)",
							borderRadius: 6,
							background: addBtnHovered ? "var(--ax-colors-bg-secondary)" : "none",
							cursor: "pointer",
							fontSize: 12,
							color: addBtnHovered ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)",
							fontFamily: "inherit",
							pointerEvents: "all",
						}}
					>
						<IconPlus size={12} />
						Add
					</button>
				</div>
			)}

			{/* Border overlay — rendered above header so top border is always visible */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					borderRadius: "8px",
					boxSizing: "border-box",
					pointerEvents: "none",
					zIndex: 2,
					border: d.isHighlighted
						? `2px solid ${d.isConflictHighlighted ? "#ca8a04" : "var(--ax-colors-border-accent)"}`
						: selected
						? "1.5px solid var(--ax-colors-border-accent)"
						: "1px dashed var(--ax-colors-border-default)",
					boxShadow: d.isHighlighted
						? `0 0 0 3px ${d.isConflictHighlighted ? "#fefce8" : "var(--ax-colors-bg-accent-subtle)"}`
						: selected
						? "0 0 0 3px var(--ax-colors-bg-accent-subtle)"
						: "none",
					opacity: d.isDimmed ? 0.3 : 1,
					transition: "opacity 0.2s ease, border-color 0.15s ease",
				}}
			/>

			<Handle type="target" position={Position.Top} style={handleStyle} />
			<Handle type="source" position={Position.Bottom} style={handleStyle} />
		</>
	);
}
