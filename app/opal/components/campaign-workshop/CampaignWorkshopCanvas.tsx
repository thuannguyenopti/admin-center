"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLayout } from "@/app/context/LayoutContext";
import { CanvasStage, type ContentTab } from "./CanvasStage";
import { BlogPost } from "./BlogPost";
import { SocialPosts } from "./SocialPosts";
import { EmailPreview } from "./EmailPreview";
import { WorkflowDrawer } from "./WorkflowDrawer";
import { CanvasReadyCard } from "./CanvasReadyCard";
import { QueuedEditsCard } from "./QueuedEditsCard";
import { IMAGE_LIBRARY, SLOT_META, resolveSlotImage, type ImageOverrides, type ImageSlotId } from "./assets";

type Mode = "canvas" | "workflow";

// A freeform edit request dropped anywhere on the canvas (not just on an
// image) — see CanvasStage's click-to-place comment tool. `x`/`y` are
// world-space coordinates (pre-scale/translate), so pins pan and zoom with
// the content that's rendered alongside them.
export type EditPin = { id: string; number: number; label: string; description: string; x: number; y: number };

// Pin labels that correspond to an actual image slot (set via `data-edit-label`
// on each EditableImage) — only these can be meaningfully "run" by swapping
// the underlying photo. Everything else (headline/kicker/subject/body clicks)
// has no regenerated-content library to draw from.
const LABEL_TO_SLOT: Record<string, ImageSlotId> = {
	"Blog Hero": "blog-hero",
	"Email Hero": "email-hero",
	"LinkedIn Photo": "social-linkedin",
	"Reel Photo": "social-reel",
	"Facebook Photo": "social-facebook",
};

const WORKFLOW_CHECK_IDS = ["blog", "email", "social"];

// Carries over the full lookup → brief → audience → angle conversation that
// already happened in the Opal Messages thread (see OpalWorkshopMessageCard.tsx
// and messages/page.tsx's seeded "opal" thread) into the real panel, so
// arriving at the canvas continues that chat instead of resetting to Opal's
// default empty-chat greeting. Mirror any copy changes there here too.
const CARRIED_OVER_TRANSCRIPT: Array<{ role: "user" | "assistant"; content: string }> = [
	{ role: "user", content: "What do we have set up for the Boston Marathon?" },
	{ role: "assistant", content: "Found it — you're running Boston Marathon 2027 (CPN-42), with one task already in motion: Boston Marathon blog post (TSK-2720). Want me to open the brief and get started on the content?" },
	{ role: "user", content: "Yes, open the brief" },
	{ role: "assistant", content: "Stride's participating in Boston Marathon 2027, so this is all about promoting that. Who's the primary audience for this push?" },
	{ role: "user", content: "Registered runners" },
	{ role: "assistant", content: "Got it — registered runners it is! One more thing before I start generating." },
	{ role: "user", content: "Motivational send-off" },
	{ role: "assistant", content: "I've finished generating your Boston Marathon campaign — blog post, social posts, and email are ready for your review." },
];

// The canvas view opened from the "suite ready" message card — renders inline
// as `leftCanvas` in the real Opal Chats page (app/opal/page.tsx), not a
// separate route. Owns its own view state (tab/mode/per-image/per-text
// overrides plus the edit-pin queue); the surrounding conversation lives in
// real ChatMessages, not scene state.
//
// Editing anything is commenting directly on it: a comment-tool toggle
// (CanvasStage) lets the user click anywhere on the canvas to drop a
// numbered pin, which sits in `pins` until the toolbar's "Run Now" resolves
// it. There is no canvas-owned chat panel: the one real, shared Opal panel
// (useLayout().opalPanelControls) opens automatically on arrival, pinned
// with the pin queue (or a "suite ready" card when empty), instead of
// rendering a second, out-of-sync lookalike.
export function CampaignWorkshopCanvas({
	initialShowRationale = false,
	initialTab = "blog",
	onClose,
}: {
	initialShowRationale?: boolean;
	initialTab?: ContentTab;
	onClose: () => void;
}) {
	const { opalPanelControls, opalPanelWidth, setOpalActionCard } = useLayout();
	const [tab, setTab] = useState<ContentTab>(initialTab);
	const [showRationale, setShowRationale] = useState(initialShowRationale);
	const [mode, setMode] = useState<Mode>("canvas");
	const [imageOverrides, setImageOverrides] = useState<ImageOverrides>({});
	const [textOverrides, setTextOverrides] = useState<Partial<Record<string, string>>>({});
	const [pins, setPins] = useState<EditPin[]>([]);
	const [commentMode, setCommentMode] = useState(false);
	const [workflowChecks, setWorkflowChecks] = useState<Record<string, boolean>>({});
	const [workflowComplete, setWorkflowComplete] = useState(false);
	const hasSeededOpal = useRef(false);

	const addPin = (label: string, x: number, y: number, description: string) => {
		setPins((current) => [...current, { id: crypto.randomUUID(), number: current.length + 1, label, x, y, description }]);
	};

	const updatePin = (id: string, description: string) => {
		setPins((current) => current.map((pin) => (pin.id === id ? { ...pin, description } : pin)));
	};

	const removePin = (id: string) => {
		setPins((current) => current.filter((pin) => pin.id !== id).map((pin, index) => ({ ...pin, number: index + 1 })));
	};

	// Resolves every queued pin at once. Pins whose label matches a known
	// image slot move that slot to a library photo not already showing
	// elsewhere in the workshop, simulating "here's the regenerated version"
	// the same honest way the rest of this prototype does. Pins with no
	// matching slot (headline/kicker/subject/body clicks) have no
	// regenerated-content library to draw from, so they're simply cleared
	// rather than faking a text rewrite.
	const runQueuedEdits = () => {
		setImageOverrides((current) => {
			const next = { ...current };
			for (const pin of pins) {
				const slot = LABEL_TO_SLOT[pin.label];
				if (!slot) continue;
				const usedImages = new Set((Object.keys(SLOT_META) as ImageSlotId[]).map((s) => resolveSlotImage(s, next)));
				const alternative = IMAGE_LIBRARY.find((image) => !usedImages.has(image.src));
				next[slot] = alternative ? alternative.src : IMAGE_LIBRARY[0].src;
			}
			return next;
		});
		setPins([]);
	};

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
		return () => setOpalActionCard(null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [opalPanelControls]);

	// Keeps the pinned action card in sync with the pin queue — the
	// completion announcement until a pin is placed, then the running queue
	// list, mirroring the Figma "Queued Image Edits" panel.
	useEffect(() => {
		setOpalActionCard(pins.length === 0 ? <CanvasReadyCard /> : <QueuedEditsCard onRemove={removePin} onRunNow={runQueuedEdits} pins={pins} />);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pins]);

	const askOpal = () => {
		opalPanelControls?.openPanel();
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
			<div
				className="cmp-workflow-layout"
				style={{
					background: "var(--ax-colors-bg-page)",
					display: "flex",
					height: "100%",
					minHeight: 0,
					overflow: "hidden",
					width: "100%",
					"--opal-panel-width": `${opalPanelWidth}px`,
				} as CSSProperties}
			>
				{/* Below 1181px, WorkflowDrawer stacks under the canvas (see CanvasStage's
				    own media query) and no longer shares the row with the fixed Opal
				    overlay, so this reservation only applies at the wider, side-by-side
				    width — matching CanvasStage's own paddingRight, which is skipped in
				    this same mode to avoid reserving the Opal-panel width twice. */}
				<style>{`
					@media (min-width: 1181px) {
						.cmp-workflow-inline-panel { margin-right: var(--opal-panel-width, 0px); }
					}
				`}</style>
				<div className="cmp-workflow-canvas-column" style={{ flex: "1 1 656px", minHeight: 0, minWidth: 0 }}>
					<CanvasStage
						activeTab={tab}
						commentMode={commentMode}
						onAddPin={addPin}
						onAskOpal={askOpal}
						onClose={onClose}
						onOpenWorkflow={() => setMode("workflow")}
						onRemovePin={removePin}
						onRunQueuedEdits={runQueuedEdits}
						onTabChange={setTab}
						onToggleCommentMode={() => setCommentMode((v) => !v)}
						onToggleRationale={() => setShowRationale((v) => !v)}
						onUpdatePin={updatePin}
						pins={pins}
						showRationale={false}
						showWorkflow
					>
						<SocialPosts imageOverrides={imageOverrides} onEditText={editText} textOverrides={textOverrides} />
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
			commentMode={commentMode}
			onAddPin={addPin}
			onAskOpal={askOpal}
			onClose={onClose}
			onOpenWorkflow={() => setMode("workflow")}
			onRemovePin={removePin}
			onRunQueuedEdits={runQueuedEdits}
			onTabChange={setTab}
			onToggleCommentMode={() => setCommentMode((v) => !v)}
			onToggleRationale={() => setShowRationale((v) => !v)}
			onUpdatePin={updatePin}
			pins={pins}
			showRationale={showRationale}
		>
			{tab === "blog" && (
				<BlogPost
					buildStep={3}
					imageOverrides={imageOverrides}
					onEditText={editText}
					showRationale={showRationale}
					textOverrides={textOverrides}
				/>
			)}
			{tab === "social" && (
				<SocialPosts imageOverrides={imageOverrides} onEditText={editText} textOverrides={textOverrides} />
			)}
			{tab === "email" && (
				<EmailPreview
					buildStep={3}
					imageOverrides={imageOverrides}
					onEditText={editText}
					showRationale={showRationale}
					textOverrides={textOverrides}
				/>
			)}
		</CanvasStage>
	);
}
