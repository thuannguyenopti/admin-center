"use client";

import { AskQuestionsActionCard } from "@/app/components/Opal/AskQuestionsActionCard";
import { CampaignBriefOptions } from "./MessageCards";
import { QuickActionRow } from "./QuickActionRow";
import type { ContentTab } from "./CanvasStage";

// Every distinct decision point in the Boston Marathon campaign script, in
// order. Rendered inline in the real Messages thread (app/opal/messages/page.tsx)
// via its existing "hitl" message pattern, switched on the message's own id
// since — unlike the file's other hitl threads (sg/kara, one card per whole
// conversation) — this one conversation has several distinct cards in sequence.
// The flow ends at "opal-angle": once that's answered, the canvas takes over
// fullscreen and the conversation continues there, not in this thread.
export type OpalWorkshopMessageId = "opal-brief" | "opal-audience" | "opal-angle";

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
	onAdvance: (userText: string, assistantText?: string, nextCardId?: OpalWorkshopMessageId) => void;
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
				<>
					<AskQuestionsActionCard
						title="Let's create your Boston Marathon content suite"
						questions={[AUDIENCE_Q]}
						submitLabel="Continue"
						onSubmit={(answers) =>
							onAdvance(labelFor(AUDIENCE_Q, answers.audience), "Got it — runners it is! One more thing before I start generating.", "opal-angle")
						}
					/>
					<QuickActionRow onEditInCanvas={() => onOpenCanvas("blog", false)} />
				</>
			);
		case "opal-angle":
			return (
				<>
					<AskQuestionsActionCard
						title="One more thing before I start generating"
						questions={[ANGLE_Q]}
						submitLabel="Generate"
						onSubmit={(answers) => {
							// Last question in the flow — no further chat reply here.
							// Opal keeps talking, but from inside the fullscreen canvas.
							onAdvance(labelFor(ANGLE_Q, answers.angle));
							onOpenCanvas("blog", false);
						}}
					/>
					<QuickActionRow onEditInCanvas={() => onOpenCanvas("blog", false)} />
				</>
			);
		default:
			return null;
	}
}
