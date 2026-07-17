"use client";

import {Box, Button, Input, Switch, Text, Textarea} from "@optiaxiom/react";
import {IconAdjustmentsHorizontal, IconUpload, IconPlus} from "@/app/lib/axiom-icons";
import {SettingsCard, Label} from "./SettingsCard";
import {OperationControls} from "./OperationControls";
import type {PromptHistoryEntry} from "./PromptBar";
import {
	ratioOptions,
	channelPacks,
	brandPacks,
	intentOptions,
	editToolOptions,
	textLayoutOptions,
	referenceImages,
	operationMeta,
	type CanvasSettings,
	type RatioOption,
	type BrandPack,
	type IntentOption,
	type EditToolOption,
	type TextLayoutOption,
} from "../config";

function ChipRow({children}: {children: React.ReactNode}) {
	return (
		<Box display="flex" style={{flexWrap: "wrap"}} gap="8">
			{children}
		</Box>
	);
}

function Chip({
	active,
	children,
	onClick,
}: {
	active: boolean;
	children: React.ReactNode;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			style={{
				height: 34,
				padding: "0 12px",
				borderRadius: 999,
				border: "1px solid var(--ax-colors-border-secondary)",
				background: active
					? "var(--ax-colors-bg-secondary)"
					: "var(--ax-colors-bg-default)",
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

function StyledSelect({
	value,
	onChange,
	options,
	placeholder,
}: {
	value: string;
	onChange: (value: string) => void;
	options: readonly string[];
	placeholder?: string;
}) {
	return (
		<select
			value={value}
			onChange={(e) => onChange(e.target.value)}
			style={{
				width: "100%",
				height: 40,
				borderRadius: 10,
				border: "1px solid var(--ax-colors-border-secondary)",
				padding: "0 12px",
				fontSize: 14,
				background: "var(--ax-colors-bg-default)",
				color:
					!value && placeholder
						? "var(--ax-colors-fg-tertiary)"
						: "var(--ax-colors-fg-default)",
			}}
		>
			{placeholder && (
				<option value="" disabled>
					{placeholder}
				</option>
			)}
			{options.map((option) => (
				<option key={option}>{option}</option>
			))}
		</select>
	);
}

export function SettingsSidebar({
	canvasMode,
	intent,
	setIntent,
	aspectRatio,
	setAspectRatio,
	channelPack,
	setChannelPack,
	brandPack,
	setBrandPack,
	editTool,
	setEditTool,
	textOverlayEnabled,
	setTextOverlayEnabled,
	textLayoutPreset,
	setTextLayoutPreset,
	headline,
	setHeadline,
	subheadline,
	setSubheadline,
	selectedReferenceIndexes,
	toggleReference,
	selectedReferences,
	canvasSettings,
	setCanvasSettings,
	promptHistory,
	onHistoryClick,
}: {
	intent: IntentOption;
	setIntent: (intent: IntentOption) => void;
	aspectRatio: RatioOption;
	setAspectRatio: (ratio: RatioOption) => void;
	channelPack: string;
	setChannelPack: (pack: string) => void;
	brandPack: BrandPack;
	setBrandPack: (pack: BrandPack) => void;
	editTool: EditToolOption;
	setEditTool: (tool: EditToolOption) => void;
	textOverlayEnabled: boolean;
	setTextOverlayEnabled: (enabled: boolean) => void;
	textLayoutPreset: TextLayoutOption;
	setTextLayoutPreset: (preset: TextLayoutOption) => void;
	headline: string;
	setHeadline: (value: string) => void;
	subheadline: string;
	setSubheadline: (value: string) => void;
	selectedReferenceIndexes: number[];
	toggleReference: (index: number) => void;
	selectedReferences: typeof referenceImages;
	canvasMode: "generate" | "edit";
	canvasSettings: CanvasSettings;
	setCanvasSettings: (settings: CanvasSettings) => void;
	promptHistory: PromptHistoryEntry[];
	onHistoryClick: (index: number) => void;
}) {
	const isEdit = canvasMode === "edit";

	/* Operations that show references — always in generate, plus relevant edit operations */
	const showReferences =
		intent === "Generate" ||
		intent === "Variation" ||
		intent === "Edit" ||
		intent === "Recompose" ||
		!isEdit;

	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="16"
			style={{minHeight: 0, alignSelf: "start"}}
		>
			<OutputSettingsCard
				intent={intent}
				setIntent={setIntent}
				aspectRatio={aspectRatio}
				setAspectRatio={setAspectRatio}
				channelPack={channelPack}
				setChannelPack={setChannelPack}
			/>

			{/* Operation-specific controls */}
			<OperationControls
				intent={intent}
				aspectRatio={aspectRatio}
				setAspectRatio={setAspectRatio}
			/>

			{showReferences && (
				<ReferencesCard
					selectedReferenceIndexes={selectedReferenceIndexes}
					toggleReference={toggleReference}
					selectedReferences={selectedReferences}
					promptHistory={promptHistory}
					onHistoryClick={onHistoryClick}
				/>
			)}

			{isEdit && (
				<BrandCopyCard
					brandPack={brandPack}
					setBrandPack={setBrandPack}
					textOverlayEnabled={textOverlayEnabled}
					setTextOverlayEnabled={setTextOverlayEnabled}
					textLayoutPreset={textLayoutPreset}
					setTextLayoutPreset={setTextLayoutPreset}
					headline={headline}
					setHeadline={setHeadline}
					subheadline={subheadline}
					setSubheadline={setSubheadline}
				/>
			)}

			{isEdit && <AdvancedCard editTool={editTool} setEditTool={setEditTool} />}

			{isEdit && (
				<CanvasSettingsCard settings={canvasSettings} setSettings={setCanvasSettings} />
			)}
		</Box>
	);
}

function OutputSettingsCard({
	intent,
	setIntent,
	aspectRatio,
	setAspectRatio,
	channelPack,
	setChannelPack,
}: {
	intent: IntentOption;
	setIntent: (intent: IntentOption) => void;
	aspectRatio: RatioOption;
	setAspectRatio: (ratio: RatioOption) => void;
	channelPack: string;
	setChannelPack: (pack: string) => void;
}) {
	return (
		<SettingsCard title="Output">
			<Label>Goal</Label>
			<StyledSelect
				value={intent}
				onChange={(v) => setIntent(v as IntentOption)}
				options={intentOptions}
			/>
			<Text fontSize="xs" color="fg.tertiary" style={{lineHeight: 1.5}}>
				{operationMeta[intent].description}
			</Text>
			<Label>Aspect ratio</Label>
			<ChipRow>
				{ratioOptions.map((ratio) => (
					<Chip
						key={ratio}
						active={aspectRatio === ratio}
						onClick={() => setAspectRatio(ratio)}
					>
						{ratio}
					</Chip>
				))}
			</ChipRow>
			<Label>Channel pack</Label>
			<StyledSelect
				value={channelPack}
				onChange={setChannelPack}
				options={channelPacks}
				placeholder="Please select package"
			/>
		</SettingsCard>
	);
}

function BrandCopyCard({
	brandPack,
	setBrandPack,
	textOverlayEnabled,
	setTextOverlayEnabled,
	textLayoutPreset,
	setTextLayoutPreset,
	headline,
	setHeadline,
	subheadline,
	setSubheadline,
}: {
	brandPack: BrandPack;
	setBrandPack: (pack: BrandPack) => void;
	textOverlayEnabled: boolean;
	setTextOverlayEnabled: (enabled: boolean) => void;
	textLayoutPreset: TextLayoutOption;
	setTextLayoutPreset: (preset: TextLayoutOption) => void;
	headline: string;
	setHeadline: (value: string) => void;
	subheadline: string;
	setSubheadline: (value: string) => void;
}) {
	return (
		<SettingsCard title="Brand and copy">
			<Label>Brand pack</Label>
			<StyledSelect
				value={brandPack}
				onChange={(v) => setBrandPack(v as BrandPack)}
				options={brandPacks}
			/>
			<Label>Text overlay</Label>
			<ChipRow>
				<Chip active={textOverlayEnabled} onClick={() => setTextOverlayEnabled(true)}>
					On
				</Chip>
				<Chip active={!textOverlayEnabled} onClick={() => setTextOverlayEnabled(false)}>
					Off
				</Chip>
			</ChipRow>
			<Label>Text layout preset</Label>
			<ChipRow>
				{textLayoutOptions.map((option) => (
					<Chip
						key={option}
						active={textLayoutPreset === option}
						onClick={() => setTextLayoutPreset(option)}
					>
						{option}
					</Chip>
				))}
			</ChipRow>
			<Text fontSize="xs" color="fg.secondary" style={{lineHeight: 1.6}}>
				Use brand-safe presets to control headline scale and placement across output ratios.
			</Text>
			<Label>Headline</Label>
			<Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
			<Label>Subheadline</Label>
			<Textarea
				value={subheadline}
				onChange={(e) => setSubheadline(e.target.value)}
				style={{minHeight: 80}}
			/>
		</SettingsCard>
	);
}

function ReferencesCard({
	selectedReferenceIndexes,
	toggleReference,
	selectedReferences,
	promptHistory,
	onHistoryClick,
}: {
	selectedReferenceIndexes: number[];
	toggleReference: (index: number) => void;
	selectedReferences: typeof referenceImages;
	promptHistory: PromptHistoryEntry[];
	onHistoryClick: (index: number) => void;
}) {
	return (
		<SettingsCard title="References">
			<Label>Generation history</Label>
			{promptHistory.length > 0 ? (
				<Box
					display="grid"
					style={{gridTemplateColumns: "repeat(2, minmax(0, 1fr))"}}
					gap="8"
				>
					{promptHistory.map((entry, i) => (
						<button
							key={i}
							type="button"
							onClick={() => onHistoryClick(i)}
							style={{
								border: "1px solid var(--ax-colors-border-tertiary)",
								borderRadius: 10,
								padding: 0,
								background: "var(--ax-colors-bg-default)",
								overflow: "hidden",
								cursor: "pointer",
							}}
						>
							<img
								src={entry.image}
								alt={entry.prompt}
								style={{
									display: "block",
									width: "100%",
									aspectRatio: "16 / 9",
									objectFit: "cover",
								}}
							/>
						</button>
					))}
				</Box>
			) : (
				<Text fontSize="xs" color="fg.tertiary">
					No generations yet. Use the prompt bar to create images.
				</Text>
			)}

			<Label>Source references</Label>
			<Text fontSize="xs" color="fg.secondary" style={{lineHeight: 1.6}}>
				Upload reference images to guide composition and style.
			</Text>
			<Box display="grid" style={{gridTemplateColumns: "repeat(4, minmax(0, 1fr))"}} gap="8">
				<ReferenceSlot icon={<IconUpload size={22} />} label="Upload" dashed />
				<ReferenceSlot icon={<IconPlus size={22} />} label="Add" />
				<ReferenceSlot icon={<IconPlus size={22} />} label="Add" />
				<ReferenceSlot icon={<IconPlus size={22} />} label="Add" />
			</Box>
		</SettingsCard>
	);
}

function ReferenceSlot({
	icon,
	label,
	dashed,
}: {
	icon: React.ReactNode;
	label: string;
	dashed?: boolean;
}) {
	return (
		<button
			type="button"
			style={{
				aspectRatio: "1 / 1",
				borderRadius: 14,
				border: dashed
					? "1.5px dashed var(--ax-colors-border-secondary)"
					: "1px dashed var(--ax-colors-border-secondary)",
				background: dashed
					? "var(--ax-colors-bg-secondary)"
					: "var(--ax-colors-bg-default)",
				color: "var(--ax-colors-fg-secondary)",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: 8,
				cursor: "pointer",
			}}
			aria-label={label === "Upload" ? "Upload reference image" : "Add another reference"}
		>
			{icon}
			<Text fontSize="xs" fontWeight="700">
				{label}
			</Text>
		</button>
	);
}

function AdvancedCard({
	editTool,
	setEditTool,
}: {
	editTool: EditToolOption;
	setEditTool: (tool: EditToolOption) => void;
}) {
	return (
		<SettingsCard title="Advanced">
			<Box display="flex" alignItems="center" justifyContent="space-between" mb="12">
				<Text fontSize="sm" fontWeight="600">
					Canvas controls
				</Text>
				<IconAdjustmentsHorizontal size={18} color="var(--ax-colors-fg-secondary)" />
			</Box>
			<Label>Edit tool</Label>
			<StyledSelect
				value={editTool}
				onChange={(v) => setEditTool(v as EditToolOption)}
				options={editToolOptions}
			/>
			{editTool === "Upscale" ? (
				<>
					<Label>Upscale target</Label>
					<ChipRow>
						{["2x", "4x", "Print-ready"].map((value) => (
							<Chip key={value} active={value === "2x"} onClick={() => {}}>
								{value}
							</Chip>
						))}
					</ChipRow>
				</>
			) : null}
			{editTool === "Resize" ? (
				<>
					<Label>Resize behavior</Label>
					<ChipRow>
						{["Fit", "Fill", "Smart crop"].map((value) => (
							<Chip key={value} active={value === "Smart crop"} onClick={() => {}}>
								{value}
							</Chip>
						))}
					</ChipRow>
				</>
			) : null}
			<Text fontSize="xs" color="fg.secondary" style={{lineHeight: 1.6}}>
				Use {editTool.toLowerCase()} to adapt the approved draft without leaving the canvas
				workflow.
			</Text>
		</SettingsCard>
	);
}

function CanvasSettingsCard({
	settings,
	setSettings,
}: {
	settings: CanvasSettings;
	setSettings: (s: CanvasSettings) => void;
}) {
	const update = (partial: Partial<CanvasSettings>) => setSettings({...settings, ...partial});

	return (
		<SettingsCard title="Settings">
			<Box display="flex" alignItems="center" justifyContent="space-between">
				<Text fontSize="sm">Show grid overlay</Text>
				<Switch
					checked={settings.showGrid}
					onCheckedChange={(v) => update({showGrid: v})}
				/>
			</Box>
			<Box display="flex" alignItems="center" justifyContent="space-between">
				<Text fontSize="sm">Snap to grid</Text>
				<Switch
					checked={settings.snapToGrid}
					onCheckedChange={(v) => update({snapToGrid: v})}
				/>
			</Box>
			<Box display="flex" alignItems="center" justifyContent="space-between">
				<Text fontSize="sm">Show alignment guides</Text>
				<Switch
					checked={settings.showGuides}
					onCheckedChange={(v) => update({showGuides: v})}
				/>
			</Box>
			<Box display="flex" alignItems="center" justifyContent="space-between">
				<Text fontSize="sm">Auto-save drafts</Text>
				<Switch
					checked={settings.autoSave}
					onCheckedChange={(v) => update({autoSave: v})}
				/>
			</Box>
			<Label>Export quality</Label>
			<ChipRow>
				{(["Standard", "High", "Max"] as const).map((quality) => (
					<Chip
						key={quality}
						active={settings.exportQuality === quality}
						onClick={() => update({exportQuality: quality})}
					>
						{quality}
					</Chip>
				))}
			</ChipRow>
			<Text fontSize="xs" color="fg.secondary" style={{lineHeight: 1.6}}>
				Canvas settings control visual aids and output quality for this editing session.
			</Text>
		</SettingsCard>
	);
}
