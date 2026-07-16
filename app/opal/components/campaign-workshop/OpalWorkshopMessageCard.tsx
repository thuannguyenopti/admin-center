"use client";

import { AskQuestionsActionCard } from "@/app/components/Opal/AskQuestionsActionCard";
import { CampaignBriefOptions, BuildPlanCard, CopyDraftCard, SuiteReadyCard } from "./MessageCards";
import type { ContentTab } from "./CanvasStage";

// Every distinct decision point in the Boston Marathon campaign script, in
// order. Rendered inline in the real Messages thread (app/opal/messages/page.tsx)
// via its existing "hitl" message pattern, switched on the message's own id
// since — unlike the file's other hitl threads (sg/kara, one card per whole
// conversation) — this one conversation has several distinct cards in sequence.
export type OpalWorkshopMessageId = "opal-brief" | "opal-audience" | "opal-angle" | "opal-build" | "opal-copy" | "opal-suite";

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

export function OpalWorkshopMessageCard({
	messageId,
	onAdvance,
	onOpenCanvas,
}: {
	messageId: string;
	onAdvance: (userText: string, assistantText: string, nextCardId?: OpalWorkshopMessageId) => void;
	onOpenCanvas: (tab: ContentTab, showRationale: boolean) => void;
}) {
	switch (messageId) {
		case "opal-brief":
			return (
				<CampaignBriefOptions
					onYes={() =>
						onAdvance(
							"Yes, create a brief",
							"I'm putting together a campaign brief for the Boston Marathon April 2026. Who's the primary audience you're targeting for this campaign?",
							"opal-audience",
						)
					}
					onNo={() => onAdvance("No, something else", "No problem — let me know what you'd like to adjust and we'll go from there.")}
				/>
			);
		case "opal-audience":
			return (
				<AskQuestionsActionCard
					title="Let's create your Boston Marathon content suite"
					questions={[AUDIENCE_Q]}
					submitLabel="Continue"
					onSubmit={(answers) =>
						onAdvance(labelFor(AUDIENCE_Q, answers.audience), "Got it — runners it is! One more thing before I start generating.", "opal-angle")
					}
				/>
			);
		case "opal-angle":
			return (
				<AskQuestionsActionCard
					title="One more thing before I start generating"
					questions={[ANGLE_Q]}
					submitLabel="Generate"
					onSubmit={(answers) =>
						onAdvance(
							labelFor(ANGLE_Q, answers.angle),
							"Perfect. I’ll build this live so you can steer it: first the story arc, then the hero image, then the channel versions.",
							"opal-build",
						)
					}
				/>
			);
		case "opal-build":
			return (
				<BuildPlanCard
					activeStep={2}
					onContinue={() =>
						onAdvance(
							"Use the bridge runner. It feels aspirational.",
							"Good call. I’m locking that hero image and shaping the opening around Boston training, race-week energy, and the finish-line payoff.",
							"opal-copy",
						)
					}
				/>
			);
		case "opal-copy":
			return (
				<CopyDraftCard
					onApprove={() =>
						onAdvance(
							"Approve opening. Keep the tone driven.",
							"Your Boston Marathon 2026 content suite is ready: a long-form Stride blog post, three social formats, and email copy. Opening the canvas now.",
							"opal-suite",
						)
					}
				/>
			);
		case "opal-suite":
			return (
				<SuiteReadyCard
					notificationSent={false}
					onMarkReviewed={() => onAdvance("Notify Pei Chen for final approval.", "Pei Chen notified — awaiting final approval.")}
					onOpenRationale={() => onOpenCanvas("blog", true)}
					onOpenSocial={() => onOpenCanvas("social", false)}
				/>
			);
		default:
			return null;
	}
}
