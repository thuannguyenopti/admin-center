"use client";

import {useEffect, useRef} from "react";
import {useLayout} from "@/app/context/LayoutContext";
import {useOpalGeneration} from "@/app/context/OpalGenerationContext";

interface EditTrigger {
	pageId: string;
	instructions: string;
	contentTypeId: string;
}

export function useOpalPageEditing(
	triggerEdit: EditTrigger | null,
	onComplete: () => void
) {
	const {opalPanelControls} = useLayout();
	const {getCurrentPageData, onPageUpdate} = useOpalGeneration();

	const opalPanelControlsRef = useRef(opalPanelControls);
	const getCurrentPageDataRef = useRef(getCurrentPageData);
	const onPageUpdateRef = useRef(onPageUpdate);
	const onCompleteRef = useRef(onComplete);
	const isMountedRef = useRef(true);

	useEffect(() => {
		opalPanelControlsRef.current = opalPanelControls;
		getCurrentPageDataRef.current = getCurrentPageData;
		onPageUpdateRef.current = onPageUpdate;
		onCompleteRef.current = onComplete;
	});

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	useEffect(() => {
		console.log('[useOpalPageEditing] Effect triggered:', {
			triggerEdit,
			hasOpalControls: !!opalPanelControlsRef.current,
		});

		if (!triggerEdit || !opalPanelControlsRef.current) {
			return;
		}

		const {pageId, instructions, contentTypeId} = triggerEdit;
		console.log('[useOpalPageEditing] Starting edit:', {pageId, instructions, contentTypeId});
		const abortController = new AbortController();
		let readerRef: ReadableStreamDefaultReader<Uint8Array> | null = null;

		const startEditing = async () => {
			try {
				console.log('[useOpalPageEditing] Starting editing async function');

				// Open Opal panel
				opalPanelControlsRef.current!.openPanel();
				console.log('[useOpalPageEditing] Opal panel opened');

				// Add user message
				opalPanelControlsRef.current!.addMessage({
					role: "user",
					content: `@content_creation ${instructions}`,
				});
				console.log('[useOpalPageEditing] User message added');

				// Add progress message
				const progressMsg = opalPanelControlsRef.current!.addMessage({
					role: "assistant",
					content: "Updating page...",
					messageType: "page-generation-progress",
					metadata: {
						loadingMessage: "Updating page...",
					},
				});
				console.log('[useOpalPageEditing] Progress message added:', progressMsg.id);

				// Get current page data
				const currentContent = getCurrentPageDataRef.current?.() || {};
				console.log('[useOpalPageEditing] Current content:', currentContent);

				// Connect to SSE stream
				console.log('[useOpalPageEditing] Fetching /api/edit-page/stream...');
				const response = await fetch("/api/edit-page/stream", {
					method: "POST",
					headers: {"Content-Type": "application/json"},
					body: JSON.stringify({
						pageId,
						instructions,
						contentTypeId,
						currentContent,
					}),
					signal: abortController.signal,
				});

				console.log('[useOpalPageEditing] Fetch complete, status:', response.status);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				// Process SSE stream
				console.log('[useOpalPageEditing] Starting SSE stream processing');
				const reader = response.body!.getReader();
				readerRef = reader;
				const decoder = new TextDecoder();
				let buffer = "";

				while (true) {
					const {done, value} = await reader.read();
					if (done) break;

					if (abortController.signal.aborted || !isMountedRef.current) {
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

						console.log('[useOpalPageEditing] SSE event received:', eventType, data);

						if (abortController.signal.aborted || !isMountedRef.current) {
							break;
						}

						if (eventType === "checklist") {
							opalPanelControlsRef.current!.updateMessage(progressMsg.id, {
								metadata: {
									checklist: data.items,
									isCompleted: data.isCompleted,
									loadingMessage: "Updating page...",
								},
							});
						} else if (eventType === "structure") {
							// Apply page updates via OpalGeneration context
							if (onPageUpdateRef.current) {
								const patch: {outlines?: any; properties?: any; variationId?: string} = {
									variationId: "original",
								};

								if (data.outlines && data.outlines.length > 0) {
									patch.outlines = data.outlines;
								}

								if (data.data && Object.keys(data.data).length > 0) {
									patch.properties = data.data;
								}

								onPageUpdateRef.current(patch);
							}
						} else if (eventType === "complete") {
							opalPanelControlsRef.current!.removeMessage(progressMsg.id);
							opalPanelControlsRef.current!.addMessage({
								role: "assistant",
								content: data.summary || "Page updated successfully!",
							});

							if (isMountedRef.current) {
								onCompleteRef.current();
							}
						} else if (eventType === "error") {
							opalPanelControlsRef.current!.removeMessage(progressMsg.id);
							opalPanelControlsRef.current!.addMessage({
								role: "assistant",
								content: `Error: ${data.message || "An error occurred during editing"}`,
							});

							if (isMountedRef.current) {
								onCompleteRef.current();
							}
						}
					}
				}
			} catch (error) {
				if (error instanceof Error && error.name === "AbortError") {
					console.log("[useOpalPageEditing] Aborted");
					return;
				}

				console.error("[useOpalPageEditing] Error:", error);
				console.error("[useOpalPageEditing] Error stack:", error instanceof Error ? error.stack : 'no stack');

				if (opalPanelControlsRef.current && !abortController.signal.aborted && isMountedRef.current) {
					opalPanelControlsRef.current.addMessage({
						role: "assistant",
						content: `Error: ${error instanceof Error ? error.message : "An error occurred"}`,
					});
				}

				// Mark editing as complete even on error to unblock UI
				if (onCompleteRef.current && isMountedRef.current && !abortController.signal.aborted) {
					onCompleteRef.current();
				}
			}
		};

		console.log('[useOpalPageEditing] Calling startEditing()');
		startEditing();

		return () => {
			console.log('[useOpalPageEditing] Cleanup called');
			abortController.abort();
			if (readerRef) {
				readerRef.cancel().catch((err) => {
					// Ignore AbortError - it's expected when the request was aborted
					if (err instanceof Error && err.name !== 'AbortError') {
						console.warn("[useOpalPageEditing] Error cancelling reader:", err);
					}
				});
			}
		};
	}, [triggerEdit]);
}
