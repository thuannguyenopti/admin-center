"use client";

import { AskQuestionsActionCard } from "@/app/components/Opal/AskQuestionsActionCard";
import { CampaignBriefOptions } from "./MessageCards";
import { QuickActionRow } from "./QuickActionRow";
import { CanvasReadyCard } from "./CanvasReadyCard";
import type { ContentTab } from "./CanvasStage";

// Every distinct decision point in the Boston Marathon campaign script, in
// order. Rendered inline in the real Messages thread (app/opal/messages/page.tsx)
// via its existing "hitl" message pattern, switched on the message's own id
// since — unlike the file's other hitl threads (sg/kara, one card per whole
// conversation) — this one conversation has several distinct cards in sequence.
// "opal-angle" hands off to the canvas fullscreen, but "opal-suite-ready"
// (added alongside the closing reply — see messages/page.tsx's onOpenCanvas)
// stays behind in this real thread so there's a permanent card with a working
// Edit button to get back into canvas after closing it.
export type OpalWorkshopMessageId = "opal-brief" | "opal-audience" | "opal-angle" | "opal-suite-ready";

// Stride is participating in the marathon — this is a promotional task to
// market that participation, not a generic "pick a persona" exercise, so the
// options are grounded in who Stride would actually be talking to and why.
const AUDIENCE_Q = {
	id: "audience",
	label: "Who is this promotional push speaking to?",
	options: [
		{ value: "runners", label: "Registered runners" },
		{ value: "prospective", label: "Prospective runners" },
		{ value: "community", label: "Stride customers & community" },
		{ value: "spectators", label: "Local spectators & fans" },
		{ value: "other", label: "Something else" },
	],
};

const ANGLE_Q = {
	id: "angle",
	label: "What's the angle for this promotion?",
	options: [
		{ value: "motivational", label: "Motivational send-off" },
		{ value: "sponsorship", label: "Sponsorship spotlight" },
		{ value: "prep", label: "Race-week prep guide" },
		{ value: "community", label: "Community celebration" },
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
	onOpenCanvas: (tab: ContentTab, showRationale: boolean, closingReply?: string) => void;
}) {
	switch (messageId) {
		case "opal-brief":
			return (
				<CampaignBriefOptions
					onYes={() =>
						onAdvance(
							"Yes, open the brief",
							"Stride's participating in Boston Marathon 2027, so this is all about promoting that. Who's the primary audience for this push?",
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
						title="Let's shape Stride's Boston Marathon promotion"
						questions={[AUDIENCE_Q]}
						submitLabel="Continue"
						onSubmit={(answers) => {
							const audience = labelFor(AUDIENCE_Q, answers.audience);
							onAdvance(audience, `Got it — ${audience.toLowerCase()} it is! One more thing before I start generating.`, "opal-angle");
						}}
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
							// Last question in the flow. The closing reply is handed to
							// onOpenCanvas rather than onAdvance so it lands in this
							// thread AND seeds the canvas's Opal panel from the exact
							// same array — the two surfaces can't drift apart.
							onAdvance(labelFor(ANGLE_Q, answers.angle));
							onOpenCanvas(
								"blog",
								false,
								"I've finished generating your Boston Marathon campaign — blog post, social posts, and email are ready for your review.",
							);
						}}
					/>
					<QuickActionRow onEditInCanvas={() => onOpenCanvas("blog", false)} />
				</>
			);
		case "opal-suite-ready":
			return <CanvasReadyCard onEdit={() => onOpenCanvas("blog", false)} />;
		default:
			return null;
	}
}
