"use client";

import {useEffect, useState, useRef} from "react";
import {useLayout} from "@/app/context/LayoutContext";
import {useOpalGeneration} from "@/app/context/OpalGenerationContext";

// Helper function to convert File[] to base64 data URLs
// Only processes image files to match backend validation
async function filesToDataUrls(files: File[]): Promise<Array<{url: string; type: string}>> {
	// Filter to only image types before encoding
	const imageFiles = files.filter((file) => file.type.startsWith("image/"));

	if (imageFiles.length < files.length) {
		console.warn(
			`[filesToDataUrls] Filtered out ${files.length - imageFiles.length} non-image files. Only images are supported.`
		);
	}

	return Promise.all(
		imageFiles.map(
			(file) =>
				new Promise<{url: string; type: string}>((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = () =>
						resolve({
							url: reader.result as string,
							type: file.type,
						});
					reader.onerror = reject;
					reader.readAsDataURL(file);
				})
		)
	);
}

export function useOpalPageGeneration(
	pageId: string,
	contentTypeId: string,
	onSave: (patch: {outlines?: any; properties?: any; variationId?: string}) => void
) {
	const {opalPanelControls} = useLayout();
	const {generationData, setActivePage} = useOpalGeneration();
	const [isGenerating, setIsGenerating] = useState(false);

	// Use refs for unstable dependencies to prevent effect re-runs
	const opalPanelControlsRef = useRef(opalPanelControls);
	const onSaveRef = useRef(onSave);
	const generationDataRef = useRef(generationData);
	const setActivePageRef = useRef(setActivePage);

	// Keep refs up to date
	useEffect(() => {
		opalPanelControlsRef.current = opalPanelControls;
		onSaveRef.current = onSave;
		generationDataRef.current = generationData;
		setActivePageRef.current = setActivePage;
	});

	useEffect(() => {
		// Check for pending generation
		const pendingDataStr = localStorage.getItem(`opal_generation_${pageId}`);

		// Wait until we have all required data before starting generation
		if (!pendingDataStr || !opalPanelControlsRef.current || !pageId || !contentTypeId) {
			return;
		}

		// Remove from localStorage immediately to prevent double-starts (e.g., strict mode double-mount)
		// Store the data first so we can use it
		const pendingData = JSON.parse(pendingDataStr);
		localStorage.removeItem(`opal_generation_${pageId}`);

		const abortController = new AbortController();
		let readerRef: ReadableStreamDefaultReader<Uint8Array> | null = null;

		const startGeneration = async () => {
			try {
				console.log("[useOpalPageGeneration] Starting generation for page:", pageId);

				// Set generating flag
				setIsGenerating(true);

				// Open Opal panel
				opalPanelControlsRef.current!.openPanel();

				// Add user message
				opalPanelControlsRef.current!.addMessage({
					role: "user",
					content: `@generate page\n\n${pendingData.instructions}`,
				});

				// Add progress message
				const progressMsg = opalPanelControlsRef.current!.addMessage({
					role: "assistant",
					content: "Generating page...",
					messageType: "page-generation-progress",
					metadata: {
						loadingMessage: "Generating page...",
					},
				});

				// Get files from context (not localStorage - too large)
				const files = generationDataRef.current?.files || [];
				const fileData = files.length > 0 ? await filesToDataUrls(files) : [];

				console.log("[useOpalPageGeneration] Uploading files:", {
					count: fileData.length,
					types: fileData.map((f) => f.type),
				});

				// Connect to SSE stream with abort signal
				const response = await fetch("/api/generate-page/stream", {
					method: "POST",
					headers: {"Content-Type": "application/json"},
					body: JSON.stringify({
						pageId,
						instructions: pendingData.instructions,
						contentTypeId,
						files: fileData,
					}),
					signal: abortController.signal,
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				// Process SSE stream
				const reader = response.body!.getReader();
				readerRef = reader;
				const decoder = new TextDecoder();
				let buffer = "";

				while (true) {
					const {done, value} = await reader.read();
					if (done) break;

					// Check if aborted
					if (abortController.signal.aborted) {
						console.log("[useOpalPageGeneration] Generation aborted");
						break;
					}

					buffer += decoder.decode(value, {stream: true});
					const lines = buffer.split("\n\n");
					buffer = lines.pop() || "";

					for (const line of lines) {
						if (!line.trim()) continue;

						const eventMatch = line.match(/^event: (.+)$/m);
						const dataMatch = line.match(/^data: (.+)$/m);

						if (!eventMatch || !dataMatch) continue;

						const eventType = eventMatch[1];
						const data = JSON.parse(dataMatch[1]);

						console.log("[useOpalPageGeneration] Event:", eventType, data);

						// Guard all updates with abort check
						if (abortController.signal.aborted) {
							console.log("[useOpalPageGeneration] Skipping update after abort");
							break;
						}

						if (eventType === "checklist") {
							// Update progress checklist
							opalPanelControlsRef.current!.updateMessage(progressMsg.id, {
								metadata: {checklist: data, loadingMessage: "Generating page..."},
							});
						} else if (eventType === "structure") {
							// Apply page structure
							console.log("[useOpalPageGeneration] Applying structure:", data);
							onSaveRef.current({
								outlines: data.outlines,
								variationId: "original",
							});
						} else if (eventType === "content") {
							// Apply individual content updates
							console.log("[useOpalPageGeneration] Applying content:", data);
							// This would require more complex logic to update specific elements
							// For now, we'll handle this in the API by sending complete structure updates
						} else if (eventType === "complete") {
							// Remove progress, add completion message
							opalPanelControlsRef.current!.removeMessage(progressMsg.id);
							opalPanelControlsRef.current!.addMessage({
								role: "assistant",
								content:
									data.summary ||
									"Page generated successfully! You can now ask me to make changes.",
							});

							// Set as active page for iteration
							setActivePageRef.current(pageId);

							setIsGenerating(false);
						} else if (eventType === "error") {
							// Show error
							opalPanelControlsRef.current!.removeMessage(progressMsg.id);
							opalPanelControlsRef.current!.addMessage({
								role: "assistant",
								content: `Error: ${data.message || "An error occurred during generation"}`,
							});
							setIsGenerating(false);
						}
					}
				}
			} catch (error) {
				// Don't show errors if we aborted intentionally
				if (error instanceof Error && error.name === "AbortError") {
					console.log("[useOpalPageGeneration] Generation cancelled");
					return;
				}

				console.error("[useOpalPageGeneration] Error:", error);
				setIsGenerating(false);

				if (opalPanelControlsRef.current && !abortController.signal.aborted) {
					opalPanelControlsRef.current.addMessage({
						role: "assistant",
						content: `Error: ${error instanceof Error ? error.message : "An error occurred during generation"}`,
					});
				}
			}
		};

		startGeneration();

		// Cleanup function to cancel stream when unmounting
		return () => {
			console.log("[useOpalPageGeneration] Cleaning up - aborting generation");
			abortController.abort();
			if (readerRef) {
				readerRef.cancel().catch((err) => {
					console.warn("[useOpalPageGeneration] Error cancelling reader:", err);
				});
			}
		};
	}, [pageId, contentTypeId]);

	return {isGenerating};
}
