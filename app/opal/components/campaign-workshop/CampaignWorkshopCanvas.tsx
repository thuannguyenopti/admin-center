"use client";

import { useState } from "react";
import { CanvasStage, type ContentTab } from "./CanvasStage";
import { BlogPost } from "./BlogPost";
import { SocialPosts } from "./SocialPosts";
import { EmailPreview } from "./EmailPreview";
import { OpalPanel } from "./OpalPanel";
import { WorkflowDrawer, FrankWorkflowPanel } from "./WorkflowDrawer";
import { IMAGE_LIBRARY, SLOT_META, resolveSlotImage, type ImageOverrides, type ImageSlotId } from "./assets";

type Mode = "canvas" | "workflow" | "workflow-done";
type QueuedEdits = Partial<Record<ImageSlotId, { description: string }>>;

const DEFAULT_SLOT: ImageSlotId = "social-linkedin";
const WORKFLOW_CHECK_IDS = ["blog", "email", "social"];

// The canvas view opened from the "suite ready" message card — renders inline
// as `leftCanvas` in the real Opal Chats page (app/opal/page.tsx), not a
// separate route. Owns its own view state (tab/mode/per-image/per-text
// overrides plus queued image edits); the surrounding conversation lives in
// real ChatMessages, not scene state.
//
// Editing an image is commenting directly on it (EditableImage/EditPopover)
// rather than navigating to a separate screen — there is no more "edit" mode
// here; a queued edit just sits in `queuedEdits` until Run Now resolves it.
export function CampaignWorkshopCanvas({
	initialShowRationale = false,
	initialTab = "blog",
	onClose,
}: {
	initialShowRationale?: boolean;
	initialTab?: ContentTab;
	onClose: () => void;
}) {
	const [tab, setTab] = useState<ContentTab>(initialTab);
	const [showRationale, setShowRationale] = useState(initialShowRationale);
	const [mode, setMode] = useState<Mode>("canvas");
	const [imageOverrides, setImageOverrides] = useState<ImageOverrides>({});
	const [textOverrides, setTextOverrides] = useState<Partial<Record<string, string>>>({});
	const [queuedEdits, setQueuedEdits] = useState<QueuedEdits>({});
	const [workflowChecks, setWorkflowChecks] = useState<Record<string, boolean>>({});
	const [workflowComplete, setWorkflowComplete] = useState(false);

	const queueEdit = (slot: ImageSlotId, description: string) => {
		setQueuedEdits((current) => ({ ...current, [slot]: { description } }));
	};

	const removeQueuedEdit = (slot: ImageSlotId) => {
		setQueuedEdits((current) => {
			const next = { ...current };
			delete next[slot];
			return next;
		});
	};

	// Resolves every queued edit at once: each affected slot moves to a
	// library photo not already showing anywhere else in the workshop,
	// simulating "here's the regenerated version" the same honest way the
	// rest of this prototype does, then the queue clears.
	const runQueuedEdits = () => {
		setImageOverrides((current) => {
			const next = { ...current };
			for (const slot of Object.keys(queuedEdits) as ImageSlotId[]) {
				const usedImages = new Set((Object.keys(SLOT_META) as ImageSlotId[]).map((s) => resolveSlotImage(s, next)));
				const alternative = IMAGE_LIBRARY.find((image) => !usedImages.has(image.src));
				next[slot] = alternative ? alternative.src : IMAGE_LIBRARY[0].src;
			}
			return next;
		});
		setQueuedEdits({});
	};

	const editText = (fieldId: string, value: string) => {
		setTextOverrides((current) => ({ ...current, [fieldId]: value }));
	};

	const toggleWorkflowCheck = (id: string) => {
		setWorkflowChecks((current) => {
			const next = { ...current, [id]: !current[id] };
			setWorkflowComplete(WORKFLOW_CHECK_IDS.every((checkId) => Boolean(next[checkId])));
			return next;
		});
	};

	const completeWorkflow = () => {
		setWorkflowChecks(Object.fromEntries(WORKFLOW_CHECK_IDS.map((id) => [id, true])));
		setWorkflowComplete(true);
		setMode("workflow-done");
	};

	if (mode === "workflow" || mode === "workflow-done") {
		const hasAnyOverride = Object.keys(imageOverrides).length > 0;
		return (
			<WorkspaceWithPanel
				panel={
					mode === "workflow-done" ? (
						<OpalPanel editingSlot={DEFAULT_SLOT} imageOverrides={imageOverrides} mode={hasAnyOverride ? "result" : "context"} onOpenWorkflow={() => setMode("workflow-done")} />
					) : (
						<FrankWorkflowPanel />
					)
				}
			>
				<div className="cmp-workflow-layout" style={{ background: "var(--ax-colors-bg-page)", display: "flex", height: "100%", minHeight: 0, overflow: "hidden", width: "100%" }}>
					<div className="cmp-workflow-canvas-column" style={{ flex: "1 1 656px", minHeight: 0, minWidth: 0 }}>
						<CanvasStage
							activeTab={tab}
							onClose={onClose}
							onOpenWorkflow={() => setMode("workflow")}
							onTabChange={setTab}
							onToggleRationale={() => setShowRationale((v) => !v)}
							showRationale={false}
							showWorkflow
						>
							<SocialPosts imageOverrides={imageOverrides} onQueueEdit={queueEdit} onRemoveQueuedEdit={removeQueuedEdit} queuedEdits={queuedEdits} />
						</CanvasStage>
					</div>
					<WorkflowDrawer
						checks={workflowChecks}
						done={workflowComplete}
						onClose={() => setMode("canvas")}
						onDone={completeWorkflow}
						onToggleCheck={toggleWorkflowCheck}
					/>
				</div>
			</WorkspaceWithPanel>
		);
	}

	return (
		<WorkspaceWithPanel
			panel={
				<OpalPanel
					editingSlot={DEFAULT_SLOT}
					imageOverrides={imageOverrides}
					mode="canvas"
					onRemoveQueuedEdit={removeQueuedEdit}
					onRunQueuedEdits={runQueuedEdits}
					queuedEdits={queuedEdits}
				/>
			}
		>
			<CanvasStage
				activeTab={tab}
				onClose={onClose}
				onOpenWorkflow={() => setMode("workflow")}
				onTabChange={setTab}
				onToggleRationale={() => setShowRationale((v) => !v)}
				showRationale={showRationale}
			>
				{tab === "blog" && (
					<BlogPost
						buildStep={3}
						imageOverrides={imageOverrides}
						onEditText={editText}
						onQueueEdit={queueEdit}
						onRemoveQueuedEdit={removeQueuedEdit}
						queuedEdits={queuedEdits}
						showRationale={showRationale}
						textOverrides={textOverrides}
					/>
				)}
				{tab === "social" && <SocialPosts imageOverrides={imageOverrides} onQueueEdit={queueEdit} onRemoveQueuedEdit={removeQueuedEdit} queuedEdits={queuedEdits} />}
				{tab === "email" && (
					<EmailPreview
						buildStep={3}
						imageOverrides={imageOverrides}
						onEditText={editText}
						onQueueEdit={queueEdit}
						onRemoveQueuedEdit={removeQueuedEdit}
						queuedEdits={queuedEdits}
						showRationale={showRationale}
						textOverrides={textOverrides}
					/>
				)}
			</CanvasStage>
		</WorkspaceWithPanel>
	);
}

function WorkspaceWithPanel({ children, panel }: { children: React.ReactNode; panel: React.ReactNode }) {
	return (
		<div style={{ background: "var(--ax-colors-bg-page)", display: "flex", height: "100%", minHeight: 0, overflow: "hidden" }}>
			<div style={{ flex: 1, minWidth: 0 }}>{children}</div>
			{panel}
		</div>
	);
}
