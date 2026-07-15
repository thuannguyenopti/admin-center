"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AskQuestionsActionCard } from "@/app/components/Opal/AskQuestionsActionCard";
import CanvasContent from "./components/CanvasContent";
import { BuildPlanCard, CampaignBriefOptions, CopyDraftCard, SuiteReadyCard } from "./components/MessageCards";
import { allSlotsUpdated, SLOT_META, type ImageOverrides, type ImageSlotId } from "./components/canvas/assets";
import {
	ANGLE_Q,
	AUDIENCE_Q,
	getInitialSceneIndex,
	getSceneMessages,
	readStoredBoolean,
	readStoredImageOverrides,
	readStoredWorkflowChecks,
	SCENES,
	STORAGE_KEYS,
	WORKFLOW_CHECK_IDS,
	WORKSHOP_HISTORY,
	type Scene,
} from "./data";

export type { Scene };

const OpalChatView = dynamic(
	() => import("@/app/components/Opal/OpalChatView").then((m) => m.OpalChatView),
	{ ssr: false },
);

export default function CmpWorkshopPage() {
	const [idx, setIdx] = useState(getInitialSceneIndex);
	const [buildStep, setBuildStep] = useState(() => (getInitialSceneIndex() >= 3 ? 3 : 0));
	const [notificationSent, setNotificationSent] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [isHistoryVisible, setIsHistoryVisible] = useState(true);
	const [imageOverrides, setImageOverrides] = useState<ImageOverrides>(() => {
		const initialScene = SCENES[getInitialSceneIndex()]?.id;
		const startUpdated = readStoredBoolean("cmp-workshop.assets-updated", initialScene === "image-result" || initialScene === "workflow-done");
		const stored = readStoredImageOverrides();
		if (Object.keys(stored).length > 0) return stored;
		return startUpdated ? allSlotsUpdated() : {};
	});
	const [editingSlot, setEditingSlot] = useState<ImageSlotId | null>(null);
	const [workflowChecks, setWorkflowChecks] = useState<Record<string, boolean>>(readStoredWorkflowChecks);
	const [workflowComplete, setWorkflowComplete] = useState(() => {
		const initialScene = SCENES[getInitialSceneIndex()]?.id;
		return readStoredBoolean(STORAGE_KEYS.workflowComplete, initialScene === "workflow-done");
	});

	const scene = SCENES[idx].id;
	const isCanvasScene = idx >= 3;
	const isBriefScene = scene === "im-brief";
	const isOpalThread = idx >= SCENES.findIndex((s) => s.id === "opal-chat");
	const hasImageOverrides = Object.keys(imageOverrides).length > 0;
	const messages = getSceneMessages(scene, buildStep, { hasImageOverrides, workflowComplete });

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEYS.imageOverrides, JSON.stringify(imageOverrides));
	}, [imageOverrides]);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEYS.workflowComplete, String(workflowComplete));
	}, [workflowComplete]);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEYS.workflowChecks, JSON.stringify(workflowChecks));
	}, [workflowChecks]);

	const setSceneIndex = (nextIdx: number) => {
		const safeIdx = Math.max(0, Math.min(SCENES.length - 1, nextIdx));
		setIdx(safeIdx);
		window.history.replaceState(null, "", `?scene=${SCENES[safeIdx].id}`);
	};
	const setScene = (nextScene: Scene) => {
		const nextIdx = SCENES.findIndex((s) => s.id === nextScene);
		if (nextIdx >= 0) setSceneIndex(nextIdx);
	};
	const advance = () => setSceneIndex(idx + 1);
	const startEdit = (slot: ImageSlotId) => {
		setEditingSlot(slot);
		setScene("image-edit");
	};
	// Preserves the workshop's own narrative choice ("update all images?") while
	// completing the "No" path — previously a single global `assetsUpdated`
	// boolean meant every image changed together no matter which one was edited.
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
		setScene("workflow-done");
	};
	const hasCustomRightPanel =
		scene === "canvas-fullscreen" ||
		scene === "canvas-workflow" ||
		scene === "image-edit" ||
		scene === "image-confirm" ||
		scene === "image-result" ||
		scene === "workflow-done";

	const messageCards =
		scene === "im-brief"
			? {
					"campaign-brief-options": (
						<CampaignBriefOptions onNo={() => setInputValue("I want to adjust the campaign setup first")} onYes={() => setScene("im-q1")} />
					),
				}
			: scene === "im-q1"
				? {
						"q1-card": (
							<AskQuestionsActionCard title="Let's create your Boston Marathon content suite" questions={[AUDIENCE_Q]} submitLabel="Continue" onSubmit={() => advance()} />
						),
					}
				: scene === "im-q2"
					? {
							"q2-card": (
								<AskQuestionsActionCard
									title="One more thing before I start generating"
									questions={[ANGLE_Q]}
									submitLabel="Generate"
									onSubmit={() => {
										setBuildStep(1);
										setScene("canvas-blog");
									}}
								/>
							),
						}
					: isCanvasScene
						? {
								"build-plan-card": <BuildPlanCard activeStep={notificationSent ? 4 : scene === "canvas-blog" ? buildStep : 3} onContinue={() => setBuildStep(Math.max(buildStep, 2))} />,
								"copy-draft-card": <CopyDraftCard onApprove={() => setBuildStep(Math.max(buildStep, 3))} />,
								"suite-ready-card": (
									<SuiteReadyCard
										notificationSent={notificationSent}
										onMarkReviewed={() => {
											setNotificationSent(true);
											setBuildStep(4);
										}}
										onOpenRationale={() => setScene("canvas-rationale")}
										onOpenSocial={() => setScene("canvas-social")}
									/>
								),
							}
						: undefined;

	return (
		<div style={{ height: "100%", minHeight: 0, overflow: "hidden" }}>
			<OpalChatView
				variant="home"
				canvasMode
				leftCanvas={
					isCanvasScene ? (
						<CanvasContent
							buildStep={scene === "canvas-blog" ? buildStep : undefined}
							editingSlot={editingSlot}
							imageOverrides={imageOverrides}
							scene={scene}
							workflowChecks={workflowChecks}
							workflowComplete={workflowComplete}
							onApplyImageReplacement={applyImageReplacement}
							onCompleteWorkflow={completeWorkflow}
							onSceneChange={setScene}
							onStartEdit={startEdit}
							onToggleWorkflowCheck={toggleWorkflowCheck}
						/>
					) : undefined
				}
				chatPanelVisible={!hasCustomRightPanel}
				streamingMode="expanded"
				messages={messages}
				inputValue={inputValue}
				setInputValue={setInputValue}
				isLoading={false}
				onSend={() => {}}
				onSuggestionClick={() => {}}
				isHistoryVisible={isHistoryVisible}
				onToggleHistory={() => setIsHistoryVisible((v) => !v)}
				groupedHistory={WORKSHOP_HISTORY}
				activeChat={isBriefScene || isOpalThread ? "opal" : "cmp-frank"}
				onSelectChat={() => {}}
				headerTitle="Threads"
				newChatLabel="New Thread"
				imThreadName={isBriefScene || isOpalThread ? "Opal" : "Frank"}
				imIsVAU={!isBriefScene && !isOpalThread}
				imThreadAvatar={isBriefScene || isOpalThread ? "/opal.png" : "/avatars/vau-frank.png"}
				imTemplateName={isBriefScene || isOpalThread ? undefined : "Content Marketing VAU"}
				imSimplified={isCanvasScene}
				messageCards={messageCards}
				onOpenArtifact={isCanvasScene ? undefined : () => advance()}
				onCloseChat={isCanvasScene ? () => setScene("im-q2") : undefined}
			/>
		</div>
	);
}
