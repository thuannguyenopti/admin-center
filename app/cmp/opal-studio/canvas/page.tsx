"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCropSimple,
	faEraser,
	faFont,
	faImages,
	faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import {
	IconAdjustmentsHorizontal,
	IconArrowBackUp,
	IconCopy,
	IconDownload,
	IconPlus,
	IconUpload,
	IconX,
} from "@tabler/icons-react";
import { useLayout } from "@/app/context/LayoutContext";

const ratioOptions = ["Auto", "1:1", "4:5", "16:9", "9:16"] as const;
const channelPacks = ["Social pack", "Ads pack", "Email + web pack", "Event campaign pack"];
const brandPacks = ["General", "Olympics", "Tour de France"] as const;
const intentOptions = ["Create", "Variation", "Resize", "Upscale", "Product placement", "Text overlay"] as const;
const editToolOptions = ["Reframe", "Resize", "Upscale", "Text overlay", "Remove background"] as const;
const textLayoutOptions = ["Hero left", "Tall stack", "Bottom left", "Centered"] as const;

const referenceImages = [
	{ src: "/hero-cycling.jpg", label: "Ride hero", source: "Library" },
	{ src: "/track-sprint-portrait.jpg", label: "Track sprint", source: "Task" },
	{ src: "/open-water-training.jpg", label: "Open-water", source: "Upload" },
	{ src: "/marathon-prep.jpg", label: "Marathon prep", source: "Library" },
];

export default function OpalStudioCanvasPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { setHidePageHeader, opalPanelControls, opalPanelWidth } = useLayout();

	const prompt = searchParams.get("prompt") || "Create a new dynamic image for a triathlon poster";
	const draft = searchParams.get("draft") || "/hero-cycling.jpg";
	const returnTo = searchParams.get("returnTo") || "/cmp/library";
	const panelWidth = opalPanelWidth > 0 ? opalPanelWidth : 420;

	const [canvasMode, setCanvasMode] = useState<"generate" | "edit">("edit");
	const [intent, setIntent] = useState<(typeof intentOptions)[number]>("Create");
	const [aspectRatio, setAspectRatio] = useState<(typeof ratioOptions)[number]>("4:5");
	const [channelPack, setChannelPack] = useState(channelPacks[0]);
	const [brandPack, setBrandPack] = useState<(typeof brandPacks)[number]>("General");
	const [editTool, setEditTool] = useState<(typeof editToolOptions)[number]>("Text overlay");
	const [textOverlayEnabled, setTextOverlayEnabled] = useState(true);
	const [textLayoutPreset, setTextLayoutPreset] = useState<(typeof textLayoutOptions)[number]>("Hero left");
	const [headline, setHeadline] = useState("Triathlon poster draft");
	const [subheadline, setSubheadline] = useState("Spring race season launch");
	const [selectedReferenceIndexes, setSelectedReferenceIndexes] = useState<number[]>([0, 1]);
	const [saveState, setSaveState] = useState<"Saved" | "Autosaved">("Saved");
	const [viewportHeight, setViewportHeight] = useState(900);
	const [toolPaletteExpanded, setToolPaletteExpanded] = useState(false);
	const [activeTool, setActiveTool] = useState<"Prompt" | "Text overlay" | "Reframe" | "References" | "Remove background">("Prompt");

	useEffect(() => {
		setHidePageHeader(true);
		return () => setHidePageHeader(false);
	}, [setHidePageHeader]);

	useEffect(() => {
		const syncViewport = () => setViewportHeight(window.innerHeight);
		syncViewport();
		window.addEventListener("resize", syncViewport);
		return () => window.removeEventListener("resize", syncViewport);
	}, []);

	useEffect(() => {
		const timer = window.setTimeout(() => setSaveState("Autosaved"), 150);
		return () => window.clearTimeout(timer);
	}, [
		aspectRatio,
		canvasMode,
		channelPack,
		editTool,
		headline,
		intent,
		selectedReferenceIndexes,
		subheadline,
		textOverlayEnabled,
		textLayoutPreset,
		brandPack,
	]);

	useEffect(() => {
		if (!opalPanelControls) {
			return;
		}
		
		opalPanelControls.openPanel();
	}, [opalPanelControls]);

	const stageAspect = useMemo(() => {
		if (aspectRatio === "Auto") return "16 / 9";
		const [width, height] = aspectRatio.split(":");
		return `${width} / ${height}`;
	}, [aspectRatio]);

	const stageRatioValue = useMemo(() => {
		if (aspectRatio === "Auto") return 16 / 9;
		const [width, height] = aspectRatio.split(":").map(Number);
		return width / height;
	}, [aspectRatio]);

	const stageMaxHeight = useMemo(() => Math.max(360, Math.min(720, viewportHeight - 340)), [viewportHeight]);
	const stageMaxWidth = useMemo(() => Math.min(980, stageMaxHeight * stageRatioValue), [stageMaxHeight, stageRatioValue]);

	const textOverlayColor = brandPack === "Tour de France" ? "#111827" : "#ffffff";
	const textShadow = brandPack === "Tour de France"
		? "0 2px 10px rgba(255,255,255,0.32)"
		: "0 4px 24px rgba(15,23,42,0.42)";
	const textLayoutStyle = useMemo(() => {
		const base = {
			position: "absolute" as const,
			maxWidth: aspectRatio === "16:9" ? "40%" : aspectRatio === "9:16" ? "66%" : "50%",
			color: textOverlayColor,
			textShadow,
		};

		switch (textLayoutPreset) {
			case "Tall stack":
				return {
					...base,
					left: 40,
					top: 40,
					maxWidth: aspectRatio === "9:16" ? "70%" : "38%",
					headlineSize: aspectRatio === "16:9" ? 54 : 60,
					subheadlineSize: 20,
					headlineLineHeight: 0.94,
					subheadlineMarginTop: 16,
					alignItems: "flex-start" as const,
					textAlign: "left" as const,
				};
			case "Bottom left":
				return {
					...base,
					left: 40,
					bottom: 40,
					maxWidth: aspectRatio === "16:9" ? "42%" : "52%",
					headlineSize: aspectRatio === "16:9" ? 42 : 48,
					subheadlineSize: 18,
					headlineLineHeight: 0.98,
					subheadlineMarginTop: 12,
					alignItems: "flex-start" as const,
					textAlign: "left" as const,
				};
			case "Centered":
				return {
					...base,
					left: "50%",
					top: "50%",
					transform: "translate(-50%, -50%)",
					maxWidth: aspectRatio === "9:16" ? "72%" : "56%",
					headlineSize: aspectRatio === "16:9" ? 44 : 52,
					subheadlineSize: 19,
					headlineLineHeight: 0.98,
					subheadlineMarginTop: 14,
					alignItems: "center" as const,
					textAlign: "center" as const,
				};
			case "Hero left":
			default:
				return {
					...base,
					left: 40,
					top: 40,
					maxWidth: aspectRatio === "16:9" ? "42%" : "48%",
					headlineSize: aspectRatio === "16:9" ? 48 : 56,
					subheadlineSize: 20,
					headlineLineHeight: 0.96,
					subheadlineMarginTop: 14,
					alignItems: "flex-start" as const,
					textAlign: "left" as const,
				};
		}
	}, [aspectRatio, brandPack, textLayoutPreset, textOverlayColor, textShadow]);

	const selectedReferences = useMemo(
		() => referenceImages.filter((_, index) => selectedReferenceIndexes.includes(index)),
		[selectedReferenceIndexes],
	);

	const primaryActionLabel = canvasMode === "generate" ? "Generate pack" : "Apply changes";
	const secondaryActionLabel = canvasMode === "generate" ? "Regenerate" : "Create variation";

	const toolMenuItems: Array<{
		key: "Prompt" | "Text overlay" | "Reframe" | "References" | "Remove background";
		label: string;
		icon: IconDefinition;
		onClick: () => void;
	}> = [
		{
			key: "Prompt",
			label: "Prompt",
			icon: faWandMagicSparkles,
			onClick: () => {
				setActiveTool("Prompt");
				setCanvasMode("generate");
			},
		},
		{
			key: "Text overlay",
			label: "Text overlay",
			icon: faFont,
			onClick: () => {
				setActiveTool("Text overlay");
				setCanvasMode("edit");
				setTextOverlayEnabled(true);
				setEditTool("Text overlay");
			},
		},
		{
			key: "Reframe",
			label: "Reframe",
			icon: faCropSimple,
			onClick: () => {
				setActiveTool("Reframe");
				setCanvasMode("edit");
				setEditTool("Reframe");
			},
		},
		{
			key: "References",
			label: "References",
			icon: faImages,
			onClick: () => {
				setActiveTool("References");
				setCanvasMode("edit");
			},
		},
		{
			key: "Remove background",
			label: "Remove background",
			icon: faEraser,
			onClick: () => {
				setActiveTool("Remove background");
				setCanvasMode("edit");
				setEditTool("Remove background");
			},
		},
	];

	function toggleReference(index: number) {
		setSelectedReferenceIndexes((current) => {
			if (current.includes(index)) {
				return current.filter((item) => item !== index);
			}
			return [...current, index];
		});
	}

	return (
		<div
			style={{
				position: "fixed",
				top: 57,
				left: 0,
				bottom: 0,
				right: panelWidth,
				display: "flex",
				flexDirection: "column",
				background: "var(--ax-colors-bg-page, #f6f8fc)",
				overflow: "hidden",
				zIndex: 1,
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					flexWrap: "wrap",
					rowGap: 12,
					padding: "14px 24px",
					borderBottom: "1px solid var(--ax-colors-border-tertiary, #e5e7eb)",
					background: "var(--ax-colors-bg-default, #ffffff)",
					flexShrink: 0,
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<div
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: 4,
							padding: 4,
							background: "var(--ax-colors-bg-secondary, #eef2f7)",
							borderRadius: 999,
						}}
					>
						<button
							type="button"
							onClick={() => setCanvasMode("generate")}
							style={{
								border: 0,
								borderRadius: 999,
								height: 36,
								padding: "0 16px",
								background: canvasMode === "generate" ? "var(--ax-colors-bg-default, #fff)" : "transparent",
								fontSize: 14,
								fontWeight: 600,
								cursor: "pointer",
							}}
						>
							Generate
						</button>
						<button
							type="button"
							onClick={() => setCanvasMode("edit")}
							style={{
								border: 0,
								borderRadius: 999,
								height: 36,
								padding: "0 16px",
								background: canvasMode === "edit" ? "var(--ax-colors-bg-default, #fff)" : "transparent",
								fontSize: 14,
								fontWeight: 600,
								cursor: "pointer",
							}}
						>
							Edit
						</button>
					</div>
					<span style={{ color: "var(--ax-colors-fg-secondary, #667085)", fontSize: 14 }}>{saveState}.</span>
				</div>

				<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
					<button
						type="button"
						style={{
							...toolbarButtonStyle(true),
							background: "#fff",
							color: "var(--ax-colors-fg-primary, #111827)",
							fontWeight: 600,
						}}
					>
						{secondaryActionLabel}
					</button>
					<button
						type="button"
						style={{
							...toolbarButtonStyle(true),
							background: "var(--ax-colors-bg-accent, #2457ff)",
							borderColor: "var(--ax-colors-bg-accent, #2457ff)",
							color: "#fff",
							fontWeight: 600,
						}}
					>
						{primaryActionLabel}
					</button>
					<button type="button" style={toolbarButtonStyle(true)}>
						Add to task
					</button>
					<button type="button" style={toolbarButtonStyle(true)}>
						Add to library
					</button>
					<button
						type="button"
						style={toolbarButtonStyle(true)}
					>
						<IconDownload size={16} />
						Download
					</button>
					<button
						type="button"
						style={toolbarButtonStyle(false)}
						aria-label="Undo"
					>
						<IconArrowBackUp size={18} />
					</button>
					<button
						type="button"
						style={toolbarButtonStyle(false)}
						aria-label="Copy"
					>
						<IconCopy size={18} />
					</button>
					<button
						type="button"
						onClick={() => router.push(returnTo)}
						style={toolbarButtonStyle(false)}
						aria-label="Close canvas"
					>
						<IconX size={18} />
					</button>
				</div>
			</div>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "76px minmax(0, 1fr) 360px",
					gap: 24,
					flex: 1,
					minHeight: 0,
					padding: 24,
					overflow: "auto",
					alignItems: "start",
				}}
				>
					<div
						style={{
							position: "relative",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							paddingTop: 8,
						}}
					>
						<div
							style={{
								width: 60,
								borderRadius: 28,
								border: "1px solid var(--ax-colors-border-tertiary, #e9edf5)",
								background: "#fff",
								boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
								padding: "10px 10px 12px",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 12,
							}}
						>
							<button
								type="button"
								onClick={() => setToolPaletteExpanded((current) => !current)}
								aria-label={toolPaletteExpanded ? "Close tools menu" : "Open tools menu"}
								style={{
									height: 40,
									width: 40,
									borderRadius: 12,
									border: 0,
									background: "#4b4b4b",
									color: "#fff",
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									cursor: "pointer",
								}}
							>
								<IconPlus size={20} />
							</button>

							<div
								style={{
									width: 32,
									height: 1,
									background: "var(--ax-colors-border-tertiary, #d9e1ee)",
								}}
							/>

							{toolMenuItems.slice(0, 4).map((item, index) => (
								<div key={item.key} style={{ display: "contents" }}>
									<ToolRailButton
										active={activeTool === item.key}
										onClick={item.onClick}
										label={item.label}
										icon={item.icon}
										expanded={false}
									/>
									{index === 2 ? (
										<div
											style={{
												width: 32,
												height: 1,
												background: "var(--ax-colors-border-tertiary, #d9e1ee)",
											}}
										/>
									) : null}
								</div>
							))}
						</div>

						{toolPaletteExpanded ? (
							<div
								style={{
									position: "absolute",
									top: 8,
									left: 72,
									width: 236,
									borderRadius: 18,
									border: "1px solid var(--ax-colors-border-tertiary, #e9edf5)",
									background: "#fff",
									boxShadow: "0 16px 36px rgba(15, 23, 42, 0.12)",
									padding: 12,
									zIndex: 20,
								}}
							>
								<div
									style={{
										height: 40,
										borderRadius: 10,
										background: "#4b4b4b",
										color: "#fff",
										display: "flex",
										alignItems: "center",
										gap: 10,
										padding: "0 14px",
										fontSize: 15,
										fontWeight: 600,
									}}
								>
									<IconPlus size={18} />
									New
								</div>
								<div
									style={{
										height: 1,
										background: "var(--ax-colors-border-tertiary, #dfe5ef)",
										margin: "12px 0 8px",
									}}
								/>
								<div style={{ display: "grid", gap: 4 }}>
									{toolMenuItems.map((item, index) => (
										<div key={item.key}>
											<button
												type="button"
												onClick={() => {
													item.onClick();
													setToolPaletteExpanded(false);
												}}
												style={{
													width: "100%",
													height: 40,
													border: 0,
													borderRadius: 10,
													background: activeTool === item.key ? "rgba(36, 87, 255, 0.08)" : "transparent",
													color: activeTool === item.key ? "#2457ff" : "#667085",
													display: "flex",
													alignItems: "center",
													gap: 12,
													padding: "0 12px",
													cursor: "pointer",
													fontSize: 15,
													fontWeight: 500,
												}}
											>
												<FontAwesomeIcon icon={item.icon} style={{ fontSize: 16, width: 18 }} />
												<span>{item.label}</span>
											</button>
											{index === 3 ? (
												<div
													style={{
														height: 1,
														background: "var(--ax-colors-border-tertiary, #dfe5ef)",
														margin: "8px 0 4px",
													}}
												/>
											) : null}
										</div>
									))}
								</div>
							</div>
						) : null}
					</div>

				<div
					style={{
						background: "#fff",
						border: "1px solid var(--ax-colors-border-tertiary, #e5e7eb)",
						borderRadius: 20,
						boxShadow: "0 8px 28px rgba(15, 23, 42, 0.06)",
						display: "flex",
						flexDirection: "column",
						minHeight: 0,
						overflow: "hidden",
						alignSelf: "start",
					}}
				>

					<div
						style={{
							flex: 1,
							minHeight: 0,
							padding: 24,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							background: "linear-gradient(180deg, #f8fbff 0%, #eef4fa 100%)",
							overflow: "auto",
						}}
					>
						<div
							style={{
								width: "100%",
								minHeight: 520,
								borderRadius: 18,
								border: "1px dashed var(--ax-colors-border-secondary, #cfd5e3)",
								background: "#fff",
								boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								padding: 24,
							}}
						>
							<div
								style={{
									position: "relative",
									width: "100%",
									maxWidth: stageMaxWidth,
									aspectRatio: stageAspect,
									maxHeight: stageMaxHeight,
									borderRadius: 28,
									overflow: "hidden",
									boxShadow: "0 26px 60px rgba(15, 23, 42, 0.18)",
									background: "#dbe7f4",
								}}
							>
								<img
									src={draft}
									alt="Generated triathlon poster draft"
									style={{
										display: "block",
										width: "100%",
										height: "100%",
										objectFit: "cover",
									}}
								/>
								<div
									style={{
										position: "absolute",
										inset: 0,
										background:
											canvasMode === "edit"
												? "linear-gradient(180deg, rgba(15,23,42,0.08) 0%, rgba(15,23,42,0) 28%, rgba(15,23,42,0.24) 100%)"
												: "linear-gradient(180deg, rgba(15,23,42,0.12) 0%, rgba(15,23,42,0) 32%, rgba(15,23,42,0.18) 100%)",
									}}
								/>

								{textOverlayEnabled ? (
									<div
										style={{
											...textLayoutStyle,
										}}
									>
										<div
											style={{
												fontSize: textLayoutStyle.headlineSize,
												lineHeight: textLayoutStyle.headlineLineHeight,
												fontWeight: 800,
												letterSpacing: -1.2,
											}}
										>
											{headline}
										</div>
										<div
											style={{
												fontSize: textLayoutStyle.subheadlineSize,
												lineHeight: 1.35,
												opacity: 0.96,
												marginTop: textLayoutStyle.subheadlineMarginTop,
												maxWidth: "92%",
											}}
										>
											{subheadline}
										</div>
									</div>
								) : null}

							</div>
						</div>
					</div>

				</div>

				<div style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 0, alignSelf: "start" }}>
					<SettingsCard title="Output">
						<Label>Mode</Label>
						<div style={chipRowStyle}>
							<button type="button" onClick={() => setCanvasMode("generate")} style={ratioChipStyle(canvasMode === "generate")}>
								Generate
							</button>
							<button type="button" onClick={() => setCanvasMode("edit")} style={ratioChipStyle(canvasMode === "edit")}>
								Edit
							</button>
						</div>
						<Label>Intent</Label>
						<select value={intent} onChange={(event) => setIntent(event.target.value as (typeof intentOptions)[number])} style={selectStyle}>
							{intentOptions.map((option) => (
								<option key={option}>{option}</option>
							))}
						</select>
						<Label>Aspect ratio</Label>
						<div style={chipRowStyle}>
							{ratioOptions.map((ratio) => (
								<button
									key={ratio}
									type="button"
									onClick={() => setAspectRatio(ratio)}
									style={ratioChipStyle(aspectRatio === ratio)}
								>
									{ratio}
								</button>
							))}
						</div>
						<Label>Channel pack</Label>
						<select value={channelPack} onChange={(event) => setChannelPack(event.target.value)} style={selectStyle}>
							{channelPacks.map((option) => (
								<option key={option}>{option}</option>
							))}
						</select>
					</SettingsCard>

					<SettingsCard title="Brand and copy">
						<Label>Brand pack</Label>
						<select value={brandPack} onChange={(event) => setBrandPack(event.target.value as (typeof brandPacks)[number])} style={selectStyle}>
							{brandPacks.map((option) => (
								<option key={option}>{option}</option>
							))}
						</select>
						<Label>Text overlay</Label>
						<div style={chipRowStyle}>
							<button type="button" onClick={() => setTextOverlayEnabled(true)} style={ratioChipStyle(textOverlayEnabled)}>
								On
							</button>
							<button type="button" onClick={() => setTextOverlayEnabled(false)} style={ratioChipStyle(!textOverlayEnabled)}>
								Off
							</button>
						</div>
						<Label>Text layout preset</Label>
						<div style={chipRowStyle}>
							{textLayoutOptions.map((option) => (
								<button
									key={option}
									type="button"
									onClick={() => setTextLayoutPreset(option)}
									style={ratioChipStyle(textLayoutPreset === option)}
								>
									{option}
								</button>
							))}
						</div>
						<div style={{ fontSize: 13, color: "#667085", lineHeight: 1.6 }}>
							Use brand-safe presets to control headline scale and placement across output ratios.
						</div>
						<Label>Headline</Label>
						<input value={headline} onChange={(event) => setHeadline(event.target.value)} style={textInputStyle} />
						<Label>Subheadline</Label>
						<textarea value={subheadline} onChange={(event) => setSubheadline(event.target.value)} style={textareaStyle} />
					</SettingsCard>

					<SettingsCard title="References">
						<Label>Selected references</Label>
						<div style={{ fontSize: 13, color: "#667085", lineHeight: 1.6 }}>
							Use references to anchor pacing, composition, and campaign style before generating pack outputs.
						</div>
						<div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
							{referenceImages.slice(0, 1).map((reference, index) => {
								const active = selectedReferenceIndexes.includes(index);
								return (
									<button
										key={reference.label}
										type="button"
										onClick={() => toggleReference(index)}
										style={{
											border: active ? "2px solid #2457ff" : "1px solid var(--ax-colors-border-tertiary, #e5e7eb)",
											borderRadius: 14,
											padding: 0,
											background: "#fff",
											overflow: "hidden",
											cursor: "pointer",
											textAlign: "left",
											aspectRatio: "1 / 1",
											display: "flex",
											flexDirection: "column",
										}}
									>
										<img src={reference.src} alt={reference.label} style={{ display: "block", width: "100%", height: "56%", objectFit: "cover", flexShrink: 0 }} />
										<div style={{ padding: 10, display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
											<div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{reference.label}</div>
											<div style={{ fontSize: 12, color: "#667085", marginTop: 4 }}>{reference.source}</div>
										</div>
									</button>
								);
							})}
							<button
								type="button"
								style={referenceSlotStyle(true)}
								aria-label="Upload reference image"
							>
								<IconUpload size={22} />
								<div style={{ fontSize: 12, fontWeight: 700 }}>Upload</div>
							</button>
							<button
								type="button"
								style={referenceSlotStyle(false)}
								aria-label="Add another reference"
							>
								<IconPlus size={22} />
								<div style={{ fontSize: 12, fontWeight: 700 }}>Add</div>
							</button>
							<button
								type="button"
								style={referenceSlotStyle(false)}
								aria-label="Add another reference"
							>
								<IconPlus size={22} />
								<div style={{ fontSize: 12, fontWeight: 700 }}>Add</div>
							</button>
						</div>
						<div style={{ fontSize: 12, color: "#667085" }}>
							{selectedReferences.length} active reference{selectedReferences.length === 1 ? "" : "s"} linked to this draft.
						</div>
					</SettingsCard>

					<SettingsCard title="Advanced">
						<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
							<div style={{ fontSize: 14, fontWeight: 600 }}>Canvas controls</div>
							<IconAdjustmentsHorizontal size={18} color="#667085" />
						</div>
						<Label>Edit tool</Label>
						<select value={editTool} onChange={(event) => setEditTool(event.target.value as (typeof editToolOptions)[number])} style={selectStyle}>
							{editToolOptions.map((option) => (
								<option key={option}>{option}</option>
							))}
						</select>
						{editTool === "Upscale" ? (
							<>
								<Label>Upscale target</Label>
								<div style={chipRowStyle}>
									{["2x", "4x", "Print-ready"].map((value) => (
										<button key={value} type="button" style={ratioChipStyle(value === "2x")}>
											{value}
										</button>
									))}
								</div>
							</>
						) : null}
						{editTool === "Resize" ? (
							<>
								<Label>Resize behavior</Label>
								<div style={chipRowStyle}>
									{["Fit", "Fill", "Smart crop"].map((value) => (
										<button key={value} type="button" style={ratioChipStyle(value === "Smart crop")}>
											{value}
										</button>
									))}
								</div>
							</>
						) : null}
						<div style={{ fontSize: 13, color: "#667085", lineHeight: 1.6 }}>
							Use {editTool.toLowerCase()} to adapt the approved draft without leaving the canvas workflow.
						</div>
					</SettingsCard>
				</div>
			</div>
		</div>
	);
}

function ToolRailButton({
	active,
	label,
	icon,
	expanded,
	onClick,
}: {
	active: boolean;
	label: string;
	icon: IconDefinition;
	expanded: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			title={label}
			style={{
				width: "100%",
				height: expanded ? 40 : 40,
				display: "inline-flex",
				alignItems: "center",
				justifyContent: expanded ? "flex-start" : "center",
				gap: expanded ? 12 : 0,
				padding: expanded ? "0 14px" : 0,
				borderRadius: 14,
				border: active ? "1.5px solid #2457ff" : "1px solid var(--ax-colors-border-tertiary, #d9e1ee)",
				background: "#ffffff",
				boxShadow: active ? "0 4px 12px rgba(36, 87, 255, 0.08)" : "none",
				color: active ? "#2457ff" : "#475467",
				cursor: "pointer",
				transition: "all 160ms ease",
			}}
		>
			<FontAwesomeIcon icon={icon} style={{ fontSize: 18 }} />
			{expanded ? <span style={{ fontSize: 15, fontWeight: 600 }}>{label}</span> : null}
		</button>
	);
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div
			style={{
				background: "#fff",
				border: "1px solid var(--ax-colors-border-tertiary, #e5e7eb)",
				borderRadius: 16,
				padding: 20,
				boxShadow: "0 6px 18px rgba(15, 23, 42, 0.04)",
			}}
		>
			<div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "var(--ax-colors-fg-default, #111827)" }}>{title}</div>
			<div style={{ display: "grid", gap: 12 }}>{children}</div>
		</div>
	);
}

function Label({ children }: { children: React.ReactNode }) {
	return (
		<div style={{ fontSize: 12, fontWeight: 700, color: "var(--ax-colors-fg-secondary, #667085)", textTransform: "uppercase", letterSpacing: 0.2 }}>
			{children}
		</div>
	);
}

function canvasActionStyle(primary: boolean) {
	return {
		height: 44,
		padding: "0 16px",
		borderRadius: 12,
		border: primary ? "1px solid #2457ff" : "1px solid rgba(255,255,255,0.6)",
		background: primary ? "#2457ff" : "rgba(255,255,255,0.86)",
		color: primary ? "#fff" : "#111827",
		display: "inline-flex",
		alignItems: "center",
		fontSize: 14,
		fontWeight: 700,
		cursor: "pointer",
		backdropFilter: "blur(8px)",
	} as const;
}

function toolbarButtonStyle(withLabel: boolean) {
	return {
		height: 40,
		padding: withLabel ? "0 14px" : "0 12px",
		borderRadius: 10,
		border: "1px solid var(--ax-colors-border-secondary, #cfd5e3)",
		background: "#fff",
		color: "var(--ax-colors-fg-default, #111827)",
		display: "inline-flex",
		alignItems: "center",
		gap: 8,
		fontSize: 14,
		cursor: "pointer",
	} as const;
}

function pillStyle() {
	return {
		display: "inline-flex",
		alignItems: "center",
		height: 28,
		padding: "0 10px",
		background: "var(--ax-colors-bg-secondary, #eef2f7)",
		borderRadius: 999,
	} as const;
}

const chipRowStyle = {
	display: "flex",
	flexWrap: "wrap" as const,
	gap: 8,
};

function ratioChipStyle(active: boolean) {
	return {
		height: 34,
		padding: "0 12px",
		borderRadius: 999,
		border: "1px solid var(--ax-colors-border-secondary, #cfd5e3)",
		background: active ? "var(--ax-colors-bg-secondary, #eef2ff)" : "#fff",
		color: "var(--ax-colors-fg-default, #111827)",
		fontSize: 13,
		fontWeight: active ? 700 : 500,
		cursor: "pointer",
	} as const;
}

const selectStyle = {
	width: "100%",
	height: 40,
	borderRadius: 10,
	border: "1px solid var(--ax-colors-border-secondary, #cfd5e3)",
	padding: "0 12px",
	fontSize: 14,
	background: "#fff",
	color: "var(--ax-colors-fg-default, #111827)",
} as const;

const textInputStyle = {
	width: "100%",
	height: 40,
	borderRadius: 10,
	border: "1px solid var(--ax-colors-border-secondary, #cfd5e3)",
	padding: "0 12px",
	fontSize: 14,
	background: "#fff",
	color: "var(--ax-colors-fg-default, #111827)",
} as const;

const textareaStyle = {
	width: "100%",
	minHeight: 80,
	borderRadius: 10,
	border: "1px solid var(--ax-colors-border-secondary, #cfd5e3)",
	padding: 12,
	fontSize: 14,
	background: "#fff",
	color: "var(--ax-colors-fg-default, #111827)",
	resize: "vertical" as const,
	fontFamily: "inherit",
} as const;

function referenceSlotStyle(upload: boolean) {
	return {
		aspectRatio: "1 / 1",
		borderRadius: 14,
		border: upload ? "1.5px dashed var(--ax-colors-border-secondary, #cfd5e3)" : "1px dashed var(--ax-colors-border-secondary, #cfd5e3)",
		background: upload ? "rgba(36, 87, 255, 0.03)" : "#fff",
		color: "var(--ax-colors-fg-secondary, #667085)",
		display: "flex",
		flexDirection: "column" as const,
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		cursor: "pointer",
	} as const;
}
