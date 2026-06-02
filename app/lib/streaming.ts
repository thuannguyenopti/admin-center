/**
 * Shared SSE (Server-Sent Events) streaming utilities for AI features
 */

export interface ChecklistItem {
	label: string;
	status: "pending" | "running" | "completed" | "failed";
}

export interface SSEController {
	sendEvent: (event: string, data: any) => void;
	close: () => void;
}

/**
 * Creates an SSE stream with helper methods for sending events
 */
export function createSSEStream(
	handler: (controller: SSEController) => Promise<void>
): ReadableStream {
	const encoder = new TextEncoder();

	return new ReadableStream({
		async start(rawController) {
			const sendEvent = (event: string, data: any) => {
				const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
				rawController.enqueue(encoder.encode(message));
			};

			const controller: SSEController = {
				sendEvent,
				close: () => rawController.close(),
			};

			try {
				await handler(controller);
			} catch (error) {
				console.error("[SSE Stream] Error:", error);
				sendEvent("error", {
					message: error instanceof Error ? error.message : "An error occurred",
				});
			} finally {
				rawController.close();
			}
		},
	});
}

/**
 * Helper to create SSE response headers
 */
export function sseHeaders() {
	return {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		"Connection": "keep-alive",
	};
}

/**
 * Helper to create delay promise
 */
export function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
