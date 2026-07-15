"use client";

import { useEffect, useState } from "react";
import type { Scene } from "../data";
import { CanvasStage, type ContentTab } from "./canvas/CanvasStage";
import { BlogPost } from "./canvas/BlogPost";
import { SocialPosts } from "./canvas/SocialPosts";
import { EmailPreview } from "./canvas/EmailPreview";
import { EditorWorkspace } from "./canvas/EditorWorkspace";
import { OpalPanel } from "./canvas/OpalPanel";
import { WorkflowDrawer, FrankWorkflowPanel } from "./canvas/WorkflowDrawer";
import type { ImageOverrides, ImageSlotId } from "./canvas/assets";

interface Props {
	buildStep?: number;
	editingSlot: ImageSlotId | null;
	imageOverrides: ImageOverrides;
	scene: Scene;
	workflowChecks: Record<string, boolean>;
	workflowComplete: boolean;
	onApplyImageReplacement: (target: "current" | "all") => void;
	onCompleteWorkflow: () => void;
	onSceneChange: (scene: Scene) => void;
	onStartEdit: (slot: ImageSlotId) => void;
	onToggleWorkflowCheck: (id: string) => void;
}

const DEFAULT_SLOT: ImageSlotId = "social-linkedin";

export default function CanvasContent({
	buildStep = 3,
	editingSlot,
	imageOverrides,
	scene,
	workflowChecks,
	workflowComplete,
	onApplyImageReplacement,
	onCompleteWorkflow,
	onSceneChange,
	onStartEdit,
	onToggleWorkflowCheck,
}: Props) {
	const [tab, setTab] = useState<ContentTab>("blog");
	const showRationale = scene === "canvas-rationale";
	const activeSlot = editingSlot ?? DEFAULT_SLOT;

	useEffect(() => {
		const hasAnyOverride = Object.keys(imageOverrides).length > 0;
		if (scene === "canvas-social" || scene === "canvas-fullscreen" || scene === "opal-chat" || hasAnyOverride) {
			setTab("social");
		} else if (scene === "canvas-blog" || scene === "canvas-rationale") {
			setTab("blog");
		}
	}, [scene, imageOverrides]);

	if (scene === "image-edit" || scene === "image-confirm") {
		return (
			<EditorWorkspace
				confirmMode={scene === "image-confirm"}
				editingSlot={editingSlot}
				imageOverrides={imageOverrides}
				onConfirm={(target) => {
					onApplyImageReplacement(target);
					onSceneChange("image-result");
				}}
				onGenerate={() => onSceneChange("image-confirm")}
				onRevise={() => onSceneChange("image-edit")}
			/>
		);
	}

	if (scene === "image-result") {
		return (
			<WorkspaceWithPanel panel={<OpalPanel editingSlot={activeSlot} mode="result" onOpenWorkflow={() => onSceneChange("canvas-workflow")} />}>
				<CanvasStage activeTab="social" onSceneChange={onSceneChange} onTabChange={setTab} showRationale={false}>
					<SocialPosts imageOverrides={imageOverrides} onEdit={onStartEdit} />
				</CanvasStage>
			</WorkspaceWithPanel>
		);
	}

	if (scene === "workflow-done" || scene === "canvas-workflow") {
		const hasAnyOverride = Object.keys(imageOverrides).length > 0;
		return (
			<WorkspaceWithPanel
				panel={
					scene === "workflow-done" ? (
						<OpalPanel editingSlot={activeSlot} mode={hasAnyOverride ? "result" : "context"} onOpenWorkflow={() => onSceneChange("workflow-done")} />
					) : (
						<FrankWorkflowPanel />
					)
				}
			>
				<div className="cmp-workflow-layout" style={{ background: "var(--ax-colors-bg-page)", display: "flex", height: "100%", minHeight: 0, overflow: "hidden", width: "100%" }}>
					<div className="cmp-workflow-canvas-column" style={{ flex: "1 1 656px", minHeight: 0, minWidth: 0 }}>
						<CanvasStage activeTab={tab} onSceneChange={onSceneChange} onTabChange={setTab} showRationale={false} showWorkflow>
							<SocialPosts imageOverrides={imageOverrides} onEdit={onStartEdit} />
						</CanvasStage>
					</div>
					<WorkflowDrawer
						checks={workflowChecks}
						done={workflowComplete}
						onClose={() => onSceneChange("canvas-social")}
						onDone={onCompleteWorkflow}
						onToggleCheck={onToggleWorkflowCheck}
					/>
				</div>
			</WorkspaceWithPanel>
		);
	}

	return (
		<CanvasStage activeTab={tab} onSceneChange={onSceneChange} onTabChange={setTab} showRationale={showRationale}>
			{tab === "blog" && (
				<BlogPost buildStep={buildStep} imageOverrides={imageOverrides} onEdit={onStartEdit} showRationale={showRationale} />
			)}
			{tab === "social" && <SocialPosts imageOverrides={imageOverrides} onEdit={onStartEdit} />}
			{tab === "email" && (
				<EmailPreview buildStep={buildStep} imageOverrides={imageOverrides} onEdit={onStartEdit} showRationale={showRationale} />
			)}
		</CanvasStage>
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
