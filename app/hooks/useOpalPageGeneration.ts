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
	const isMountedRef = useRef(true);

	// Keep refs up to date
	useEffect(() => {
		opalPanelControlsRef.current = opalPanelControls;
		onSaveRef.current = onSave;
		generationDataRef.current = generationData;
		setActivePageRef.current = setActivePage;
	});

	// Track mounted state
	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	useEffect(() => {
		// Check for pending generation
		const pendingDataStr = localStorage.getItem(`opal_generation_${pageId}`);

		// Wait until we have all required data before starting generation
		if (!pendingDataStr || !opalPanelControlsRef.current || !pageId || !contentTypeId) {
			return;
		}

		// Prevent double-starts in the same session using sessionStorage
		// This survives Fast Refresh but clears on page reload
		const sessionKey = `opal_generating_${pageId}`;
		if (sessionStorage.getItem(sessionKey) === 'true') {
			console.log("[useOpalPageGeneration] Generation already in progress for this page in this session");
			return;
		}

		// Mark as started in session
		sessionStorage.setItem(sessionKey, 'true');

		// Store the data (keep in localStorage until generation completes in case of reload)
		const pendingData = JSON.parse(pendingDataStr);

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
				// Use edit-page/stream with empty outline for generation from scratch
				const response = await fetch("/api/edit-page/stream", {
					method: "POST",
					headers: {"Content-Type": "application/json"},
					body: JSON.stringify({
						pageId,
						instructions: pendingData.instructions,
						contentTypeId,
						currentContent: {
							outlines: [{
								id: "ol-main",
								title: "Main",
								tree: [],
								elements: {}
							}]
						},
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

						// Guard all updates with abort check and mounted check
						if (abortController.signal.aborted || !isMountedRef.current) {
							console.log("[useOpalPageGeneration] Skipping update after abort or unmount");
							break;
						}

						if (eventType === "checklist") {
							// Update progress checklist with contextual data
							opalPanelControlsRef.current!.updateMessage(progressMsg.id, {
								metadata: {
									checklist: data.items || data, // Backward compatibility
									pageType: data.pageType,
									sections: data.sections,
									isCompleted: data.isCompleted,
									loadingMessage: "Generating page...",
								},
							});
						} else if (eventType === "structure") {
							// Apply page structure - supports both outlines and data
							console.log("[useOpalPageGeneration] Applying structure:", data);

							const patch: {outlines?: any; properties?: any; variationId?: string} = {
								variationId: "original",
							};

							// Add outlines if present
							if (data.outlines && data.outlines.length > 0) {
								patch.outlines = data.outlines;
							}

							// Add property data if present
							if (data.data && Object.keys(data.data).length > 0) {
								patch.properties = data.data;
							}

							onSaveRef.current(patch);
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

							// Remove pending generation flags
							localStorage.removeItem(`opal_generation_${pageId}`);
							sessionStorage.removeItem(`opal_generating_${pageId}`);

							if (isMountedRef.current) {
								setIsGenerating(false);
							}
						} else if (eventType === "error") {
							// Show error
							opalPanelControlsRef.current!.removeMessage(progressMsg.id);
							opalPanelControlsRef.current!.addMessage({
								role: "assistant",
								content: `Error: ${data.message || "An error occurred during generation"}`,
							});

							// Remove pending generation flags
							localStorage.removeItem(`opal_generation_${pageId}`);
							sessionStorage.removeItem(`opal_generating_${pageId}`);

							if (isMountedRef.current) {
								setIsGenerating(false);
							}
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

				// Remove pending generation flags on error
				localStorage.removeItem(`opal_generation_${pageId}`);
				sessionStorage.removeItem(`opal_generating_${pageId}`);

				if (isMountedRef.current) {
					setIsGenerating(false);
				}

				if (opalPanelControlsRef.current && !abortController.signal.aborted && isMountedRef.current) {
					opalPanelControlsRef.current.addMessage({
						role: "assistant",
						content: `Error: ${error instanceof Error ? error.message : "An error occurred during generation"}`,
					});
				}
			}
		};

		startGeneration();

		// Cleanup function - abort on unmount to prevent memory leaks
		// Fast Refresh won't trigger this because deps (pageId, contentTypeId) don't change
		// But navigation away or actual unmount will abort and cleanup
		return () => {
			console.log("[useOpalPageGeneration] Component unmounting, aborting generation");
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
