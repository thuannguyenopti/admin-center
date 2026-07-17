"use client";

import { useEffect, useRef, useState } from "react";
import { useLayout } from "@/app/context/LayoutContext";
import { CanvasStage, type ContentTab } from "./CanvasStage";
import { BlogPost } from "./BlogPost";
import { SocialPosts } from "./SocialPosts";
import { EmailPreview } from "./EmailPreview";
import { WorkflowDrawer } from "./WorkflowDrawer";
import { CanvasReadyCard } from "./CanvasReadyCard";
import { IMAGE_LIBRARY, SLOT_META, resolveSlotImage, type ImageOverrides, type ImageSlotId } from "./assets";

type Mode = "canvas" | "workflow";
type QueuedEdits = Partial<Record<ImageSlotId, { description: string }>>;

const WORKFLOW_CHECK_IDS = ["blog", "email", "social"];

// Carries over the brief/audience/angle conversation that already happened in
// the Opal Messages thread (see OpalWorkshopMessageCard.tsx) into the real
// panel, so arriving at the canvas continues that chat instead of resetting
// to Opal's default empty-chat greeting.
const CARRIED_OVER_TRANSCRIPT: Array<{ role: "user" | "assistant"; content: string }> = [
	{ role: "user", content: "Yes, create a brief" },
	{ role: "assistant", content: "I'm putting together a campaign brief for the Boston Marathon April 2026. Who's the primary audience you're targeting for this campaign?" },
	{ role: "user", content: "Runners" },
	{ role: "assistant", content: "Got it — runners it is! One more thing before I start generating." },
	{ role: "user", content: "Motivational Piece" },
	{ role: "assistant", content: "I've finished generating your Boston Marathon 2026 campaign — blog post, social posts, and email are ready for your review." },
];

// The canvas view opened from the "suite ready" message card — renders inline
// as `leftCanvas` in the real Opal Chats page (app/opal/page.tsx), not a
// separate route. Owns its own view state (tab/mode/per-image/per-text
// overrides plus queued image edits); the surrounding conversation lives in
// real ChatMessages, not scene state.
//
// Editing an image is commenting directly on it (EditableImage/EditPopover)
// rather than navigating to a separate screen — a queued edit just sits in
// `queuedEdits` until the toolbar's "Run Now" resolves it. There is no
// canvas-owned chat panel: the one real, shared Opal panel
// (useLayout().opalPanelControls) opens automatically on arrival, pinned
// with a "suite ready" card, instead of rendering a second, out-of-sync
// lookalike.
export function CampaignWorkshopCanvas({
	initialShowRationale = false,
	initialTab = "blog",
	onClose,
}: {
	initialShowRationale?: boolean;
	initialTab?: ContentTab;
	onClose: () => void;
}) {
	const { opalPanelControls, setOpalActionCard } = useLayout();
	const [tab, setTab] = useState<ContentTab>(initialTab);
	const [showRationale, setShowRationale] = useState(initialShowRationale);
	const [mode, setMode] = useState<Mode>("canvas");
	const [imageOverrides, setImageOverrides] = useState<ImageOverrides>({});
	const [textOverrides, setTextOverrides] = useState<Partial<Record<string, string>>>({});
	const [queuedEdits, setQueuedEdits] = useState<QueuedEdits>({});
	const [workflowChecks, setWorkflowChecks] = useState<Record<string, boolean>>({});
	const [workflowComplete, setWorkflowComplete] = useState(false);
	const queuedEditsCount = Object.keys(queuedEdits).length;
	const hasSeededOpal = useRef(false);

	// Arriving at the canvas always surfaces the real Opal panel, continuing
	// the brief/audience/angle conversation that already happened in Messages
	// (not re-seeded on every render/tab change — ref guard also survives
	// React 18 dev double-invoke). opalPanelControls.seedChat() defers adding
	// the transcript until the new chat's message-reset effect has actually
	// landed (see template.tsx's pendingOpalSeed effect) — calling addMessage
	// directly here would lose the messages to that same reset.
	useEffect(() => {
		if (hasSeededOpal.current || !opalPanelControls) return;
		hasSeededOpal.current = true;
		opalPanelControls.seedChat(CARRIED_OVER_TRANSCRIPT);
		setOpalActionCard(<CanvasReadyCard />);
		return () => setOpalActionCard(null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [opalPanelControls]);

	const askOpal = () => {
		opalPanelControls?.openPanel();
	};

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
	};

	if (mode === "workflow") {
		return (
			<div className="cmp-workflow-layout" style={{ background: "var(--ax-colors-bg-page)", display: "flex", height: "100%", minHeight: 0, overflow: "hidden", width: "100%" }}>
				<div className="cmp-workflow-canvas-column" style={{ flex: "1 1 656px", minHeight: 0, minWidth: 0 }}>
					<CanvasStage
						activeTab={tab}
						onAskOpal={askOpal}
						onClose={onClose}
						onOpenWorkflow={() => setMode("workflow")}
						onRunQueuedEdits={runQueuedEdits}
						onTabChange={setTab}
						onToggleRationale={() => setShowRationale((v) => !v)}
						queuedEditsCount={queuedEditsCount}
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
		);
	}

	return (
		<CanvasStage
			activeTab={tab}
			onAskOpal={askOpal}
			onClose={onClose}
			onOpenWorkflow={() => setMode("workflow")}
			onRunQueuedEdits={runQueuedEdits}
			onTabChange={setTab}
			onToggleRationale={() => setShowRationale((v) => !v)}
			queuedEditsCount={queuedEditsCount}
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
	);
}
