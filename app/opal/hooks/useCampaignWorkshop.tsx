"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { ChatMessage } from "@/app/hooks/useOpalState";
import { AskQuestionsActionCard } from "@/app/components/Opal/AskQuestionsActionCard";
import { CampaignBriefOptions, BuildPlanCard, CopyDraftCard, SuiteReadyCard } from "../components/campaign-workshop/MessageCards";

// The one, real, discoverable home for the Boston Marathon campaign workshop —
// a mock chat id seeded into useOpalHistory's history list (see useOpalHistory.ts)
// so it shows up in the actual Opal Chats sidebar instead of living behind a
// separate route or a fake conversation entry.
export const BOSTON_MARATHON_CHAT_ID = "boston-marathon-2026";

const AUDIENCE_Q = {
	id: "audience",
	label: "Who is the audience?",
	options: [
		{ value: "runners", label: "Runners" },
		{ value: "sponsors", label: "Sponsors" },
		{ value: "fans", label: "General fans" },
		{ value: "corporate", label: "Corporate partners" },
		{ value: "other", label: "Something else" },
	],
};

const ANGLE_Q = {
	id: "angle",
	label: "What's the angle or key message?",
	options: [
		{ value: "recap", label: "Recap" },
		{ value: "motivational", label: "Motivational Piece" },
		{ value: "fundraising", label: "Fundraising push" },
		{ value: "announcement", label: "Event Announcement" },
		{ value: "other", label: "Something else" },
	],
};

function labelFor(question: typeof AUDIENCE_Q, value: string | undefined) {
	return question.options.find((o) => o.value === value)?.label ?? question.options[0].label;
}

type AddMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => ChatMessage;

export function useCampaignWorkshop({
	activeChatId,
	addMessage,
	messages,
}: {
	activeChatId: string | null;
	addMessage: AddMessage;
	messages: ChatMessage[];
}) {
	const isActive = activeChatId === BOSTON_MARATHON_CHAT_ID;
	const [buildStep, setBuildStep] = useState(0);
	const [notificationSent, setNotificationSent] = useState(false);
	const [canvasOpen, setCanvasOpen] = useState(false);
	const [canvasTab, setCanvasTab] = useState<"blog" | "social" | "email">("blog");
	const [canvasShowRationale, setCanvasShowRationale] = useState(false);
	const hasSeeded = useRef(false);

	// Closing/switching away from this conversation always closes the canvas —
	// it must never bleed into an unrelated chat.
	useEffect(() => {
		if (!isActive) setCanvasOpen(false);
	}, [isActive]);

	// Seed the opening beat the first time this conversation is selected —
	// mirrors the GEO Q&A deep-link seeding pattern in app/opal/page.tsx,
	// keyed on chat id instead of a query param.
	useEffect(() => {
		if (!isActive || messages.length > 0 || hasSeeded.current) return;
		hasSeeded.current = true;
		addMessage({ role: "user", content: "Create a campaign for the Boston Marathon in April 2026" });
		addMessage({
			role: "assistant",
			content: "To get started, I can create a campaign brief for this. Want me to go ahead?",
			authorName: "Opal",
			authorAvatar: "/opal.png",
			cardAfterKey: "wf-brief-options",
		});
	}, [isActive, messages.length, addMessage]);

	const say = useCallback(
		(userText: string, assistantText: string, extra?: Partial<ChatMessage>) => {
			addMessage({ role: "user", content: userText });
			addMessage({ role: "assistant", content: assistantText, authorName: "Opal", authorAvatar: "/opal.png", ...extra });
		},
		[addMessage],
	);

	const messageCards: Record<string, ReactNode> = isActive
		? {
				"wf-brief-options": (
					<CampaignBriefOptions
						onYes={() =>
							say("Yes, create a brief", "I'm putting together a campaign brief for the Boston Marathon April 2026. Who's the primary audience you're targeting for this campaign?", {
								cardAfterKey: "wf-audience",
							})
						}
						onNo={() => say("No, something else", "No problem — let me know what you'd like to adjust and we'll go from there.")}
					/>
				),
				"wf-audience": (
					<AskQuestionsActionCard
						title="Let's create your Boston Marathon content suite"
						questions={[AUDIENCE_Q]}
						submitLabel="Continue"
						onSubmit={(answers) =>
							say(labelFor(AUDIENCE_Q, answers.audience), "Got it — runners it is! One more thing before I start generating.", {
								cardAfterKey: "wf-angle",
							})
						}
					/>
				),
				"wf-angle": (
					<AskQuestionsActionCard
						title="One more thing before I start generating"
						questions={[ANGLE_Q]}
						submitLabel="Generate"
						onSubmit={(answers) => {
							setBuildStep(1);
							say(
								labelFor(ANGLE_Q, answers.angle),
								"Perfect. I’ll build this live so you can steer it: first the story arc, then the hero image, then the channel versions.",
								{ cardAfterKey: "wf-build-plan" },
							);
						}}
					/>
				),
				"wf-build-plan": (
					<BuildPlanCard
						activeStep={buildStep}
						onContinue={() => {
							setBuildStep(2);
							say(
								"Use the bridge runner. It feels aspirational.",
								"Good call. I’m locking that hero image and shaping the opening around Boston training, race-week energy, and the finish-line payoff.",
								{ cardAfterKey: "wf-copy-draft" },
							);
						}}
					/>
				),
				"wf-copy-draft": (
					<CopyDraftCard
						onApprove={() => {
							setBuildStep(3);
							say(
								"Approve opening. Keep the tone driven.",
								"Your Boston Marathon 2026 content suite is ready: a long-form Stride blog post, three social formats, and email copy. Opening the canvas now.",
								{ cardAfterKey: "wf-suite-ready" },
							);
						}}
					/>
				),
				"wf-suite-ready": (
					<SuiteReadyCard
						notificationSent={notificationSent}
						onMarkReviewed={() => {
							setNotificationSent(true);
							addMessage({ role: "assistant", content: "Pei Chen notified — awaiting final approval.", authorName: "Opal", authorAvatar: "/opal.png" });
						}}
						onOpenRationale={() => {
							setCanvasTab("blog");
							setCanvasShowRationale(true);
							setCanvasOpen(true);
						}}
						onOpenSocial={() => {
							setCanvasTab("social");
							setCanvasShowRationale(false);
							setCanvasOpen(true);
						}}
					/>
				),
			}
		: {};

	return {
		canvasOpen,
		canvasShowRationale,
		canvasTab,
		closeCanvas: () => setCanvasOpen(false),
		messageCards,
	};
}
