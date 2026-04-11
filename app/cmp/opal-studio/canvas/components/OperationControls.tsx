"use client";

import { useState } from "react";
import { Box, Badge, Button, Input, Text } from "@optiaxiom/react";
import { IconArrowsMaximize, IconArrowUp, IconArrowDown, IconArrowLeft, IconArrowRight, IconUpload } from "@tabler/icons-react";
import { SettingsCard, Label } from "./SettingsCard";
import type { IntentOption, RatioOption } from "../config";
import { ratioOptions, operationMeta } from "../config";

function ChipRow({ children }: { children: React.ReactNode }) {
	return <Box display="flex" style={{ flexWrap: "wrap" }} gap="8">{children}</Box>;
}

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			style={{
				height: 34,
				padding: "0 12px",
				borderRadius: 999,
				border: "1px solid var(--ax-colors-border-secondary)",
				background: active ? "var(--ax-colors-bg-secondary)" : "var(--ax-colors-bg-default)",
				color: "var(--ax-colors-fg-default)",
				fontSize: 13,
				fontWeight: active ? 700 : 500,
				cursor: "pointer",
			}}
		>
			{children}
		</button>
	);
}

export function OperationControls({
	intent,
	aspectRatio,
	setAspectRatio,
}: {
	intent: IntentOption;
	aspectRatio: RatioOption;
	setAspectRatio: (ratio: RatioOption) => void;
}) {
	const meta = operationMeta[intent];

	switch (intent) {
		case "Generate":
			return null; // Generate uses the prompt bar + output card, no extra controls

		case "Edit":
			return (
				<SettingsCard title="Edit controls">
					<Text fontSize="xs" color="fg.secondary" style={{ lineHeight: 1.6 }}>
						{meta.description}
					</Text>
					<Text fontSize="xs" color="fg.tertiary" style={{ lineHeight: 1.6 }}>
						Describe changes in the prompt bar below. Edits preserve composition and structure.
					</Text>
				</SettingsCard>
			);

		case "Upscale":
			return <UpscaleControls />;

		case "Resize":
			return <ResizeControls aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} />;

		case "Recompose":
			return <RecomposeControls aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} />;

		case "Extend":
			return <ExtendControls />;

		case "Inpaint":
			return (
				<SettingsCard title="Inpaint">
					<Text fontSize="xs" color="fg.secondary" style={{ lineHeight: 1.6 }}>
						{meta.description}
					</Text>
					<Badge intent="primary">Coming soon</Badge>
					<Text fontSize="xs" color="fg.tertiary" style={{ lineHeight: 1.6 }}>
						Brush selection tool will allow you to mask regions. For now, describe the area and changes in the prompt.
					</Text>
				</SettingsCard>
			);

		case "Product placement":
			return <ProductPlacementControls />;

		case "Variation":
			return <VariationControls />;

		case "Extract":
			return (
				<SettingsCard title="Extract">
					<Text fontSize="xs" color="fg.secondary" style={{ lineHeight: 1.6 }}>
						{meta.description}
					</Text>
					<Label>Output</Label>
					<ChipRow>
						<Chip active onClick={() => {}}>Transparent PNG</Chip>
						<Chip active={false} onClick={() => {}}>White background</Chip>
					</ChipRow>
					<Text fontSize="xs" color="fg.tertiary" style={{ lineHeight: 1.6 }}>
						The subject will be isolated with clean edges, ready for reuse in other compositions.
					</Text>
				</SettingsCard>
			);

		default:
			return null;
	}
}

function UpscaleControls() {
	const [target, setTarget] = useState<"2x" | "4x" | "Print-ready">("2x");
	const resolutions = { "2x": "2048 × 2048", "4x": "4096 × 4096", "Print-ready": "300 DPI" };

	return (
		<SettingsCard title="Upscale">
			<Label>Target resolution</Label>
			<ChipRow>
				{(["2x", "4x", "Print-ready"] as const).map((value) => (
					<Chip key={value} active={target === value} onClick={() => setTarget(value)}>{value}</Chip>
				))}
			</ChipRow>
			<Text fontSize="xs" color="fg.tertiary">
				Estimated output: {resolutions[target]}
			</Text>
			<Text fontSize="xs" color="fg.secondary" style={{ lineHeight: 1.6 }}>
				Increases sharpness and detail without altering content, layout, or colours.
			</Text>
		</SettingsCard>
	);
}

function ResizeControls({
	aspectRatio,
	setAspectRatio,
}: {
	aspectRatio: RatioOption;
	setAspectRatio: (ratio: RatioOption) => void;
}) {
	const [width, setWidth] = useState("1080");
	const [height, setHeight] = useState("1350");

	return (
		<SettingsCard title="Resize">
			<Label>Target dimensions</Label>
			<Box display="flex" gap="8" alignItems="center">
				<Input
					value={width}
					onChange={(e) => setWidth(e.target.value)}
					style={{ textAlign: "center" }}
				/>
				<Text fontSize="sm" color="fg.tertiary">×</Text>
				<Input
					value={height}
					onChange={(e) => setHeight(e.target.value)}
					style={{ textAlign: "center" }}
				/>
				<Text fontSize="xs" color="fg.tertiary">px</Text>
			</Box>
			<Label>Quick presets</Label>
			<ChipRow>
				{ratioOptions.filter((r) => r !== "Auto").map((ratio) => (
					<Chip key={ratio} active={aspectRatio === ratio} onClick={() => setAspectRatio(ratio)}>{ratio}</Chip>
				))}
			</ChipRow>
			<Text fontSize="xs" color="fg.secondary" style={{ lineHeight: 1.6 }}>
				Adjusts dimensions without changing composition. No content is added or removed.
			</Text>
		</SettingsCard>
	);
}

function RecomposeControls({
	aspectRatio,
	setAspectRatio,
}: {
	aspectRatio: RatioOption;
	setAspectRatio: (ratio: RatioOption) => void;
}) {
	return (
		<SettingsCard title="Recompose">
			<Label>Target format</Label>
			<ChipRow>
				{ratioOptions.map((ratio) => (
					<Chip key={ratio} active={aspectRatio === ratio} onClick={() => setAspectRatio(ratio)}>{ratio}</Chip>
				))}
			</ChipRow>
			<Text fontSize="xs" color="fg.secondary" style={{ lineHeight: 1.6 }}>
				Adapts layout and framing for the new format. The core subject is preserved while composition adjusts to fit.
			</Text>
			<Text fontSize="xs" color="fg.tertiary" style={{ lineHeight: 1.6 }}>
				Use the prompt to guide recomposition — e.g. &quot;create space for a headline on the left&quot;.
			</Text>
		</SettingsCard>
	);
}

function ExtendControls() {
	const [directions, setDirections] = useState<Set<string>>(new Set());

	function toggleDirection(dir: string) {
		setDirections((prev) => {
			const next = new Set(prev);
			if (next.has(dir)) next.delete(dir);
			else next.add(dir);
			return next;
		});
	}

	const dirs = [
		{ key: "top", icon: IconArrowUp, label: "Top" },
		{ key: "bottom", icon: IconArrowDown, label: "Bottom" },
		{ key: "left", icon: IconArrowLeft, label: "Left" },
		{ key: "right", icon: IconArrowRight, label: "Right" },
	];

	return (
		<SettingsCard title="Extend">
			<Label>Extend direction</Label>
			<Box display="flex" gap="8" style={{ flexWrap: "wrap" }}>
				{dirs.map(({ key, icon: Icon, label }) => (
					<button
						key={key}
						type="button"
						onClick={() => toggleDirection(key)}
						style={{
							display: "flex",
							alignItems: "center",
							gap: 6,
							height: 36,
							padding: "0 14px",
							borderRadius: 999,
							border: directions.has(key)
								? "2px solid var(--ax-colors-border-accent)"
								: "1px solid var(--ax-colors-border-secondary)",
							background: directions.has(key)
								? "var(--ax-colors-bg-accent-light)"
								: "var(--ax-colors-bg-default)",
							color: directions.has(key)
								? "var(--ax-colors-fg-accent)"
								: "var(--ax-colors-fg-default)",
							fontSize: 13,
							fontWeight: directions.has(key) ? 700 : 500,
							cursor: "pointer",
						}}
					>
						<Icon size={14} />
						{label}
					</button>
				))}
			</Box>
			<Label>Extend amount</Label>
			<ChipRow>
				{["25%", "50%", "100%"].map((amount) => (
					<Chip key={amount} active={amount === "50%"} onClick={() => {}}>{amount}</Chip>
				))}
			</ChipRow>
			<Text fontSize="xs" color="fg.secondary" style={{ lineHeight: 1.6 }}>
				Expands the canvas by generating new content that matches the existing scene seamlessly.
			</Text>
		</SettingsCard>
	);
}

function ProductPlacementControls() {
	return (
		<SettingsCard title="Product placement">
			<Label>Product image</Label>
			<button
				type="button"
				style={{
					width: "100%",
					height: 100,
					borderRadius: 14,
					border: "1.5px dashed var(--ax-colors-border-secondary)",
					background: "var(--ax-colors-bg-accent-light)",
					color: "var(--ax-colors-fg-secondary)",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 8,
					cursor: "pointer",
				}}
			>
				<IconUpload size={24} />
				<Text fontSize="xs" fontWeight="600">Upload product image</Text>
			</button>
			<Label>Placement style</Label>
			<ChipRow>
				{["Natural", "Flat lay", "Lifestyle", "Studio"].map((style) => (
					<Chip key={style} active={style === "Natural"} onClick={() => {}}>{style}</Chip>
				))}
			</ChipRow>
			<Text fontSize="xs" color="fg.secondary" style={{ lineHeight: 1.6 }}>
				The product will be inserted with realistic scale, perspective, lighting, and shadows. Use the prompt to describe the scene.
			</Text>
		</SettingsCard>
	);
}

function VariationControls() {
	const [count, setCount] = useState<number>(4);

	return (
		<SettingsCard title="Variation">
			<Label>Number of variations</Label>
			<ChipRow>
				{[2, 3, 4, 6].map((n) => (
					<Chip key={n} active={count === n} onClick={() => setCount(n)}>{n}</Chip>
				))}
			</ChipRow>
			<Label>What to vary</Label>
			<ChipRow>
				{["Style", "Composition", "Colour", "Headline", "Background"].map((v) => (
					<Chip key={v} active={v === "Style" || v === "Headline"} onClick={() => {}}>{v}</Chip>
				))}
			</ChipRow>
			<Text fontSize="xs" color="fg.secondary" style={{ lineHeight: 1.6 }}>
				Generates {count} alternative versions that maintain consistency with the original while introducing controlled differences.
			</Text>
		</SettingsCard>
	);
}
