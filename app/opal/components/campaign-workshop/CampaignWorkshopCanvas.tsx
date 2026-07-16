"use client";

import { useState } from "react";
import { CanvasStage, type ContentTab } from "./CanvasStage";
import { BlogPost } from "./BlogPost";
import { SocialPosts } from "./SocialPosts";
import { EmailPreview } from "./EmailPreview";
import { EditorWorkspace } from "./EditorWorkspace";
import { OpalPanel } from "./OpalPanel";
import { WorkflowDrawer, FrankWorkflowPanel } from "./WorkflowDrawer";
import { allSlotsUpdated, SLOT_META, type ImageOverrides, type ImageSlotId } from "./assets";

type Mode = "canvas" | "edit" | "confirm" | "result" | "workflow" | "workflow-done";

const DEFAULT_SLOT: ImageSlotId = "social-linkedin";
const WORKFLOW_CHECK_IDS = ["blog", "email", "social"];

// The canvas view opened from the "suite ready" message card — renders inline
// as `leftCanvas` in the real Opal Chats page (app/opal/page.tsx), not a
// separate route. Owns its own view state (tab/mode/per-image overrides);
// the surrounding conversation lives in real ChatMessages, not scene state.
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
	const [editingSlot, setEditingSlot] = useState<ImageSlotId | null>(null);
	const [imageOverrides, setImageOverrides] = useState<ImageOverrides>({});
	const [workflowChecks, setWorkflowChecks] = useState<Record<string, boolean>>({});
	const [workflowComplete, setWorkflowComplete] = useState(false);
	const activeSlot = editingSlot ?? DEFAULT_SLOT;

	const startEdit = (slot: ImageSlotId) => {
		setEditingSlot(slot);
		setMode("edit");
	};

	// Preserves the workshop's own narrative choice ("update all images?") while
	// still supporting "just this one" — editing one asset no longer changes the others.
	const applyImageReplacement = (target: "current" | "all") => {
		setImageOverrides((current) => {
			if (target === "all") return allSlotsUpdated();
			if (!editingSlot) return current;
			return { ...current, [editingSlot]: SLOT_META[editingSlot].updatedImage };
		});
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

	if (mode === "edit" || mode === "confirm") {
		return (
			<EditorWorkspace
				confirmMode={mode === "confirm"}
				editingSlot={editingSlot}
				imageOverrides={imageOverrides}
				onConfirm={(target) => {
					applyImageReplacement(target);
					setMode("result");
				}}
				onGenerate={() => setMode("confirm")}
				onRevise={() => setMode("edit")}
			/>
		);
	}

	if (mode === "result") {
		return (
			<WorkspaceWithPanel panel={<OpalPanel editingSlot={activeSlot} mode="result" onOpenWorkflow={() => setMode("workflow")} />}>
				<CanvasStage
					activeTab="social"
					onClose={onClose}
					onOpenWorkflow={() => setMode("workflow")}
					onTabChange={setTab}
					onToggleRationale={() => setShowRationale((v) => !v)}
					showRationale={false}
				>
					<SocialPosts imageOverrides={imageOverrides} onEdit={startEdit} />
				</CanvasStage>
			</WorkspaceWithPanel>
		);
	}

	if (mode === "workflow" || mode === "workflow-done") {
		const hasAnyOverride = Object.keys(imageOverrides).length > 0;
		return (
			<WorkspaceWithPanel
				panel={
					mode === "workflow-done" ? (
						<OpalPanel editingSlot={activeSlot} mode={hasAnyOverride ? "result" : "context"} onOpenWorkflow={() => setMode("workflow-done")} />
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
							<SocialPosts imageOverrides={imageOverrides} onEdit={startEdit} />
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
		<WorkspaceWithPanel panel={<OpalPanel editingSlot={activeSlot} mode="canvas" />}>
			<CanvasStage
				activeTab={tab}
				onClose={onClose}
				onOpenWorkflow={() => setMode("workflow")}
				onTabChange={setTab}
				onToggleRationale={() => setShowRationale((v) => !v)}
				showRationale={showRationale}
			>
				{tab === "blog" && <BlogPost buildStep={3} imageOverrides={imageOverrides} onEdit={startEdit} showRationale={showRationale} />}
				{tab === "social" && <SocialPosts imageOverrides={imageOverrides} onEdit={startEdit} />}
				{tab === "email" && <EmailPreview buildStep={3} imageOverrides={imageOverrides} onEdit={startEdit} showRationale={showRationale} />}
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
