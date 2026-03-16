"use client";

import {useEffect, useState} from "react";
import {useLayout} from "@/app/context/LayoutContext";

export function useOpalPageGeneration(
	pageId: string,
	contentTypeId: string,
	onSave: (patch: {outlines?: any; properties?: any; variationId?: string}) => void
) {
	const {opalPanelControls} = useLayout();
	const [isGenerating, setIsGenerating] = useState(false);

	useEffect(() => {
		// Don't start if already generating
		if (isGenerating) {
			return;
		}

		// Check for pending generation
		const pendingDataStr = localStorage.getItem(`opal_generation_${pageId}`);

		// Wait until we have all required data before starting generation
		if (!pendingDataStr || !opalPanelControls || !pageId || !contentTypeId) {
			return;
		}

		const startGeneration = async () => {
			try {
				const pendingData = JSON.parse(pendingDataStr);

				console.log("[useOpalPageGeneration] Starting generation for page:", pageId);

				// Set generating flag first (don't clear localStorage yet - let VBPrototype see it for overlay)
				setIsGenerating(true);

				// Open Opal panel
				opalPanelControls.openPanel();

				// Add user message
				opalPanelControls.addMessage({
					role: "user",
					content: `@generate page\n\n${pendingData.instructions}`,
				});

				// Add progress message with checklist
				const progressMsg = opalPanelControls.addMessage({
					role: "assistant",
					content: "Generating your page...",
					messageType: "page-generation-progress",
					metadata: {
						checklist: [
							{label: "Analyzing instructions", status: "pending"},
							{label: "Designing page structure", status: "pending"},
							{label: "Generating content", status: "pending"},
							{label: "Creating sections", status: "pending"},
							{label: "Populating elements", status: "pending"},
							{label: "Finalizing page", status: "pending"},
						],
					},
				});

				// Connect to SSE stream
				const response = await fetch("/api/generate-page/stream", {
					method: "POST",
					headers: {"Content-Type": "application/json"},
					body: JSON.stringify({
						pageId,
						instructions: pendingData.instructions,
						contentTypeId,
					}),
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				// Process SSE stream
				const reader = response.body!.getReader();
				const decoder = new TextDecoder();
				let buffer = "";

				while (true) {
					const {done, value} = await reader.read();
					if (done) break;

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

						if (eventType === "checklist") {
							// Update progress checklist
							opalPanelControls.updateMessage(progressMsg.id, {
								metadata: {checklist: data},
							});
						} else if (eventType === "structure") {
							// Apply page structure
							console.log("[useOpalPageGeneration] Applying structure:", data);
							onSave({
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
							opalPanelControls.removeMessage(progressMsg.id);
							opalPanelControls.addMessage({
								role: "assistant",
								content: data.summary || "Page generated successfully!",
							});
							setIsGenerating(false);
							localStorage.removeItem(`opal_generation_${pageId}`);
						} else if (eventType === "error") {
							// Show error
							opalPanelControls.removeMessage(progressMsg.id);
							opalPanelControls.addMessage({
								role: "assistant",
								content: `Error: ${data.message || "An error occurred during generation"}`,
							});
							setIsGenerating(false);
							localStorage.removeItem(`opal_generation_${pageId}`);
						}
					}
				}
			} catch (error) {
				console.error("[useOpalPageGeneration] Error:", error);
				setIsGenerating(false);
				localStorage.removeItem(`opal_generation_${pageId}`);

				if (opalPanelControls) {
					opalPanelControls.addMessage({
						role: "assistant",
						content: `Error: ${error instanceof Error ? error.message : "An error occurred during generation"}`,
					});
				}
			}
		};

		startGeneration();
	}, [pageId, contentTypeId, opalPanelControls, onSave, isGenerating]);

	return {isGenerating};
}
