"use client";

import { useState } from "react";
import { Box } from "@optiaxiom/react";
import { IconSearch, IconArrowLeft } from "@tabler/icons-react";
import { WORK_REQUEST_FIELDS } from "../data";
import type { FormFieldDef } from "../types";

interface FieldPickerInlineProps {
	onBack: () => void;
	onSelect: (field: FormFieldDef) => void;
}

export function FieldPickerInline({ onBack, onSelect }: FieldPickerInlineProps) {
	const [query, setQuery] = useState("");

	const filtered = WORK_REQUEST_FIELDS.filter((f) => {
		const q = query.toLowerCase();
		return f.name.toLowerCase().includes(q) || f.typeLabel.toLowerCase().includes(q);
	});

	return (
		<div
			className="nodrag nopan"
			onClick={(e) => e.stopPropagation()}
			onWheel={(e) => e.stopPropagation()}
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
				<span style={{ fontSize: 13, fontWeight: 500, color: "var(--ax-colors-fg-default)", fontFamily: "inherit" }}>
					Select a field
				</span>
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
				{filtered.length === 0 ? (
					<div style={{ padding: "12px 4px", textAlign: "center", fontSize: 12, color: "var(--ax-colors-fg-tertiary)", fontFamily: "inherit" }}>
						No fields found
					</div>
				) : (
					filtered.map((field) => (
						<button
							key={field.id}
							onClick={() => onSelect(field)}
							style={{
								display: "flex",
								alignItems: "center",
								gap: 10,
								padding: "8px 4px",
								background: "transparent",
								border: "none",
								borderBottom: "1px solid var(--ax-colors-border-tertiary)",
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
							<div>
								<div style={{ fontSize: 13, fontWeight: 500, color: "var(--ax-colors-fg-default)" }}>
									{field.name}
								</div>
								<div style={{ fontSize: 11, color: "var(--ax-colors-fg-tertiary)", marginTop: 1 }}>
									{field.typeLabel}
								</div>
							</div>
						</button>
					))
				)}
			</div>
		</div>
	);
}
