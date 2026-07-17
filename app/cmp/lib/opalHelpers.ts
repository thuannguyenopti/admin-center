/**
 * Shared utilities for working with the Opal panel in CMP
 */

import type { OpalPanelControls } from "@/app/context/LayoutContext";

export type ProgressStatus = "pending" | "running" | "completed" | "error";

export interface ChecklistItem {
	label: string;
	status: ProgressStatus;
	substep?: string;
}

export interface ProgressMessageMetadata {
	blockType: string;
	checklist?: ChecklistItem[];
	status?: string;
	[key: string]: any;
}

/**
 * Opens Opal panel and adds a user message
 */
export function startOpalGeneration(
	opalPanelControls: OpalPanelControls,
	userMessage: string
) {
	opalPanelControls.openPanel();
	opalPanelControls.addMessage({
		role: "user",
		content: userMessage,
	});
}

/**
 * Adds a progress tracking message to Opal panel
 */
export function addProgressMessage(
	opalPanelControls: OpalPanelControls,
	content: string,
	messageType: string,
	metadata: ProgressMessageMetadata
) {
	return opalPanelControls.addMessage({
		role: "assistant",
		content,
		messageType,
		metadata,
	});
}

/**
 * Updates a progress message with new status/checklist
 */
export function updateProgressMessage(
	opalPanelControls: OpalPanelControls,
	messageId: string,
	updates: {
		content?: string;
		metadata?: ProgressMessageMetadata;
	}
) {
	opalPanelControls.updateMessage(messageId, updates);
}

/**
 * Adds a completion message to Opal panel
 */
export function addCompletionMessage(
	opalPanelControls: OpalPanelControls,
	content: string
) {
	opalPanelControls.addMessage({
		role: "assistant",
		content,
	});
}

/**
 * Adds an error message to Opal panel
 */
export function addErrorMessage(
	opalPanelControls: OpalPanelControls,
	content: string = "❌ Generation failed. Please try again."
) {
	opalPanelControls.addMessage({
		role: "assistant",
		content,
	});
}

/**
 * Creates a checklist for channel generation progress
 */
export function createChannelChecklist(
	channels: string[],
	channelDefinitions: Array<{ id: string; name: string }>,
	status: ProgressStatus = "pending"
): ChecklistItem[] {
	return channels.map((channelId) => ({
		label: channelDefinitions.find((c) => c.id === channelId)?.name || channelId,
		status,
	}));
}

/**
 * Updates a checklist item at a specific index
 */
export function updateChecklistItem(
	checklist: ChecklistItem[],
	index: number,
	status: ProgressStatus,
	substep?: string
): ChecklistItem[] {
	return checklist.map((item, idx) =>
		idx === index ? { ...item, status, substep } : item
	);
}

/**
 * Simulates progress through generation steps with substep updates
 * Useful for showing detailed progress to the user
 */
export async function simulateGenerationProgress(
	opalPanelControls: OpalPanelControls,
	progressMessageId: string,
	checklist: ChecklistItem[],
	steps: Array<{ substep: string; duration: number }>,
	metadataBase: ProgressMessageMetadata
) {
	for (const { substep, duration } of steps) {
		updateProgressMessage(opalPanelControls, progressMessageId, {
			metadata: {
				...metadataBase,
				checklist: updateChecklistItem(checklist, 0, "running", substep),
			},
		});
		await new Promise((resolve) => setTimeout(resolve, duration));
	}
}
