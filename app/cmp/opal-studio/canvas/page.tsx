"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLayout } from "@/app/context/LayoutContext";
import {
	referenceImages,
	socialPackArtboards,
	operationMeta,
	defaultCanvasSettings,
	demoGenerationSteps,
	type Artboard,
	type CanvasSettings,
	type RatioOption,
	type BrandPack,
	type IntentOption,
	type EditToolOption,
	type TextLayoutOption,
} from "./config";
import type { PromptHistoryEntry } from "./components/PromptBar";
import { useTextLayoutStyle } from "./useTextLayoutStyle";
import { CanvasToolbar } from "./components/CanvasToolbar";
import { CanvasStage } from "./components/CanvasStage";
import { SettingsSidebar } from "./components/SettingsSidebar";
import { PromptBar } from "./components/PromptBar";

/* ── Layout helper: positions artboards in a row with gap ── */
function layoutArtboards(
	templates: Omit<Artboard, "x" | "y" | "image">[],
	image: string,
	gap: number,
): Artboard[] {
	let x = 0;
	return templates.map((t) => {
		const ab: Artboard = { ...t, x, y: 0, image };
		x += t.width + gap;
		return ab;
	});
}

export default function OpalStudioCanvasPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { setHidePageHeader, opalPanelControls } = useLayout();

	const draft = searchParams.get("draft") || "/hero-cycling.jpg";
	const returnTo = searchParams.get("returnTo") || "/cmp/library";
	const initialPrompt = searchParams.get("prompt") || "";

	const [canvasMode, setCanvasMode] = useState<"generate" | "edit">("generate");
	const [intent, setIntent] = useState<IntentOption>("Generate");
	const [aspectRatio, setAspectRatio] = useState<RatioOption>("Auto");
	const [channelPack, setChannelPack] = useState("");
	const [brandPack, setBrandPack] = useState<BrandPack>("General");
	const [editTool, setEditTool] = useState<EditToolOption>("Text overlay");
	const [textOverlayEnabled, setTextOverlayEnabled] = useState(true);
	const [textLayoutPreset, setTextLayoutPreset] = useState<TextLayoutOption>("Hero left");
	const [headline, setHeadline] = useState("");
	const [subheadline, setSubheadline] = useState("");
	const [selectedReferenceIndexes, setSelectedReferenceIndexes] = useState<number[]>([0, 1]);
	const [saveState, setSaveState] = useState<"Saved" | "Autosaved">("Saved");
	const [prompt, setPrompt] = useState(
		initialPrompt || demoGenerationSteps[1]?.prompt || "",
	);
	const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>(defaultCanvasSettings);
	const [isGenerating, setIsGenerating] = useState(false);
	const [promptHistory, setPromptHistory] = useState<PromptHistoryEntry[]>([
		{ prompt: initialPrompt || demoGenerationSteps[0].prompt, image: draft },
	]);
	const [generationStep, setGenerationStep] = useState(0);

	/* ── Artboard state ── */
	const defaultArtboard: Artboard = useMemo(() => ({
		id: "primary",
		label: "Draft",
		ratio: aspectRatio === "Auto" ? "16:9" : aspectRatio,
		width: 640,
		height: aspectRatio === "Auto" ? 360 : (() => {
			const [w, h] = aspectRatio.split(":").map(Number);
			return 640 * (h / w);
		})(),
		x: 0,
		y: 0,
		image: draft,
	}), [draft, aspectRatio]);

	const [artboards, setArtboards] = useState<Artboard[]>([defaultArtboard]);
	const [animatingIds, setAnimatingIds] = useState<string[]>([]);

	// Keep single artboard in sync with aspect ratio changes
	useEffect(() => {
		if (artboards.length === 1) {
			setArtboards([defaultArtboard]);
		}
	}, [defaultArtboard]); // eslint-disable-line react-hooks/exhaustive-deps

	const textLayoutStyle = useTextLayoutStyle(aspectRatio, brandPack, textLayoutPreset);

	const selectedReferences = useMemo(
		() => referenceImages.filter((_, index) => selectedReferenceIndexes.includes(index)),
		[selectedReferenceIndexes],
	);

	const packSelected = channelPack.length > 0;

	/* Auto-switch canvas mode when operation changes */
	useEffect(() => {
		setCanvasMode(operationMeta[intent].canvasMode);
	}, [intent]);

	/* ── Effects ── */
	useEffect(() => {
		setHidePageHeader(true);
		if (opalPanelControls) opalPanelControls.closePanel();
		return () => setHidePageHeader(false);
	}, [setHidePageHeader, opalPanelControls]);

	useEffect(() => {
		const timer = window.setTimeout(() => setSaveState("Autosaved"), 150);
		return () => window.clearTimeout(timer);
	}, [
		aspectRatio, canvasMode, channelPack, editTool, headline,
		intent, selectedReferenceIndexes, subheadline, textOverlayEnabled,
		textLayoutPreset, brandPack,
	]);

	/* ── Actions ── */
	const handleArtboardMove = useCallback((id: string, x: number, y: number) => {
		setArtboards((prev) => prev.map((ab) => (ab.id === id ? { ...ab, x, y } : ab)));
	}, []);

	function toggleReference(index: number) {
		setSelectedReferenceIndexes((current) =>
			current.includes(index) ? current.filter((i) => i !== index) : [...current, index],
		);
	}

	const handleGenerate = useCallback(() => {
		if (isGenerating || !prompt.trim()) return;

		// Find the next demo step — step 0 is the initial image (already shown),
		// so first Generate produces step 1, second produces step 2
		const nextStep = Math.min(generationStep + 1, demoGenerationSteps.length - 1);
		const stepData = demoGenerationSteps[nextStep];

		setIsGenerating(true);

		// Simulate generation delay (2 seconds)
		setTimeout(() => {
			// Add to history with the generated image
			setPromptHistory((prev) => [...prev, { prompt, image: stepData.image }]);

			// Update the artboard image
			setArtboards((prev) =>
				prev.map((ab) => ({ ...ab, image: stepData.image })),
			);

			// Advance step
			setGenerationStep(nextStep);

			// Auto-fill with the next step's prompt if available, otherwise clear
			const followingStep = nextStep + 1;
			if (followingStep < demoGenerationSteps.length) {
				setPrompt(demoGenerationSteps[followingStep].prompt);
			} else {
				setPrompt("");
			}

			setIsGenerating(false);
			setSaveState("Saved");
		}, 2000);
	}, [isGenerating, prompt, generationStep]);

	const handleHistoryClick = useCallback((index: number) => {
		const entry = promptHistory[index];
		setArtboards((prev) =>
			prev.map((ab) => ({ ...ab, image: entry.image })),
		);
	}, [promptHistory]);

	const handleGeneratePack = useCallback(() => {
		if (!packSelected) return;

		// Use current artboard image (latest generation), fall back to draft
		const currentImage = artboards[0]?.image || draft;
		const packed = layoutArtboards(socialPackArtboards, currentImage, 40);

		// Mark all new IDs as animating (hidden initially)
		const newIds = packed.map((a) => a.id);
		setAnimatingIds(newIds);

		// Set artboards (they appear hidden due to animatingIds)
		setArtboards(packed);

		// Stagger reveal: remove each ID from animatingIds 150ms apart
		newIds.forEach((id, i) => {
			setTimeout(() => {
				setAnimatingIds((prev) => prev.filter((aid) => aid !== id));
			}, 300 + i * 150);
		});
	}, [packSelected, draft, artboards]);

	return (
		<div
			style={{
				position: "fixed",
				top: 57,
				left: 0,
				bottom: 0,
				right: 0,
				display: "flex",
				flexDirection: "column",
				background: "var(--ax-colors-bg-page)",
				overflow: "hidden",
				zIndex: 1,
			}}
		>
			<CanvasToolbar
				canvasMode={canvasMode}
				setCanvasMode={setCanvasMode}
				saveState={saveState}
				packSelected={packSelected}
				onClose={() => router.push(returnTo)}
				onGeneratePack={handleGeneratePack}
			/>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "minmax(0, 1fr) 360px",
					flex: 1,
					minHeight: 0,
					overflow: "hidden",
				}}
			>
				{/* Canvas area with prompt bar */}
				<div
					style={{
						position: "relative",
						display: "flex",
						flexDirection: "column",
						minHeight: 0,
					}}
				>
					<div
						style={{
							flex: 1,
							minHeight: 0,
							overflow: "hidden",
						}}
					>
						<CanvasStage
							artboards={artboards}
							draft={draft}
							textOverlayEnabled={canvasMode === "edit" && textOverlayEnabled && (headline.trim().length > 0 || subheadline.trim().length > 0)}
							textLayoutStyle={textLayoutStyle}
							headline={headline}
							subheadline={subheadline}
							brandPack={brandPack}
							animatingIds={animatingIds}
							onArtboardMove={handleArtboardMove}
							canvasSettings={canvasSettings}
							isGenerating={isGenerating}
						/>
					</div>

					<PromptBar
						prompt={prompt}
						setPrompt={setPrompt}
						onGenerate={handleGenerate}
						isGenerating={isGenerating}
					/>
				</div>

				{/* Settings sidebar */}
				<div
					style={{
						borderLeft: "1px solid var(--ax-colors-border-tertiary)",
						background: "var(--ax-colors-bg-page)",
						overflowY: "auto",
						padding: 20,
					}}
				>
					<SettingsSidebar
						canvasMode={canvasMode}
						intent={intent}
						setIntent={setIntent}
						aspectRatio={aspectRatio}
						setAspectRatio={setAspectRatio}
						channelPack={channelPack}
						setChannelPack={setChannelPack}
						brandPack={brandPack}
						setBrandPack={setBrandPack}
						editTool={editTool}
						setEditTool={setEditTool}
						textOverlayEnabled={textOverlayEnabled}
						setTextOverlayEnabled={setTextOverlayEnabled}
						textLayoutPreset={textLayoutPreset}
						setTextLayoutPreset={setTextLayoutPreset}
						headline={headline}
						setHeadline={setHeadline}
						subheadline={subheadline}
						setSubheadline={setSubheadline}
						selectedReferenceIndexes={selectedReferenceIndexes}
						toggleReference={toggleReference}
						selectedReferences={selectedReferences}
						canvasSettings={canvasSettings}
						setCanvasSettings={setCanvasSettings}
						promptHistory={promptHistory}
						onHistoryClick={handleHistoryClick}
					/>
				</div>
			</div>
		</div>
	);
}
