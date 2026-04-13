"use client";

import {
	Box,
	Card,
	Text as AxiomText,
	Field,
	Textarea,
	Select,
	SelectTrigger,
	SelectContent,
	Button,
} from "@optiaxiom/react";
import { useState } from "react";
import { Text } from "@/app/components/Text";
import { Input } from "@/app/components/Input";
import Link from "next/link";
import { IconArrowLeft, IconDownload } from "@tabler/icons-react";

export default function TestPlanBuilderPage() {
	const [hypothesis, setHypothesis] = useState("");
	const [variants, setVariants] = useState("");
	const [audience, setAudience] = useState("");
	const [trafficAllocation, setTrafficAllocation] = useState("");
	const [duration, setDuration] = useState("");
	const [sampleSize, setSampleSize] = useState("");
	const [dependencies, setDependencies] = useState("");
	const [risks, setRisks] = useState("");
	const [rolloutPlan, setRolloutPlan] = useState("");
	const [decisionCriteria, setDecisionCriteria] = useState("");

	const handleExport = () => {
		const brief = {
			hypothesis,
			variants: variants.split(",").map((v) => v.trim()),
			audienceTargeting: audience,
			trafficAllocation,
			durationEstimate: duration,
			sampleSize,
			dependencies,
			risks,
			rolloutPlan,
			decisionCriteria,
		};
		const blob = new Blob([JSON.stringify(brief, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "test-plan-brief.json";
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<Box display="flex" flexDirection="column" gap="24" w="full">
			<Link
				href="/web-experimentation/home"
				style={{ display: "inline-flex", alignItems: "center", gap: "8", marginBottom: "8" }}
			>
				<IconArrowLeft size={18} />
				<AxiomText fontSize="sm" color="fg.accent">
					Back to Home
				</AxiomText>
			</Link>
			<Text fontSize="lg" fontWeight="600">
				Test plan builder
			</Text>
			<AxiomText fontSize="sm" color="fg.secondary" mb="8">
				Structured experiment brief: hypothesis, variants, audience, traffic, duration, sample size,
				dependencies, risks, rollout, and decision criteria. Draft with AI or export to brief / Jira.
			</AxiomText>
			<Card p="24">
				<Box display="flex" flexDirection="column" gap="16">
					<Field label="Hypothesis">
						<Textarea
							placeholder="Paste or write hypothesis"
							value={hypothesis}
							onChange={(e) => setHypothesis((e.target as HTMLTextAreaElement).value)}
							w="full"
						/>
					</Field>
					<Field label="Variants">
						<Input
							placeholder="Control, Variant A, Variant B (comma-separated)"
							value={variants}
							onChange={(e) => setVariants(e.target.value)}
							w="full"
						/>
					</Field>
					<Field label="Audience targeting">
						<Textarea
							placeholder="Who will see this experiment?"
							value={audience}
							onChange={(e) => setAudience((e.target as HTMLTextAreaElement).value)}
							w="full"
						/>
					</Field>
					<Field label="Traffic allocation (%)">
						<Input
							placeholder="e.g. 33 / 33 / 34"
							value={trafficAllocation}
							onChange={(e) => setTrafficAllocation(e.target.value)}
							w="full"
						/>
					</Field>
					<Field label="Duration estimate">
						<Input
							placeholder="e.g. 2 weeks"
							value={duration}
							onChange={(e) => setDuration(e.target.value)}
							w="full"
						/>
					</Field>
					<Field label="Sample size">
						<Input
							placeholder="e.g. 10,000 per variant"
							value={sampleSize}
							onChange={(e) => setSampleSize(e.target.value)}
							w="full"
						/>
					</Field>
					<Field label="Dependencies">
						<Textarea
							placeholder="Technical or product dependencies"
							value={dependencies}
							onChange={(e) => setDependencies((e.target as HTMLTextAreaElement).value)}
							w="full"
						/>
					</Field>
					<Field label="Risks">
						<Textarea
							placeholder="Potential risks and mitigations"
							value={risks}
							onChange={(e) => setRisks((e.target as HTMLTextAreaElement).value)}
							w="full"
						/>
					</Field>
					<Field label="Rollout plan">
						<Textarea
							placeholder="How will you roll out the winner?"
							value={rolloutPlan}
							onChange={(e) => setRolloutPlan((e.target as HTMLTextAreaElement).value)}
							w="full"
						/>
					</Field>
					<Field label="Decision criteria">
						<Textarea
							placeholder="When do we call a winner or stop?"
							value={decisionCriteria}
							onChange={(e) => setDecisionCriteria((e.target as HTMLTextAreaElement).value)}
							w="full"
						/>
					</Field>
					<Box display="flex" gap="8" flexWrap="wrap">
						<Button appearance="subtle" size="lg">
							Draft with AI
						</Button>
						<Button appearance="primary" size="lg" icon={<IconDownload size={18} />} onClick={handleExport}>
							Export brief
						</Button>
						<Link href="/web-experimentation/home">
							<Button appearance="subtle" size="lg">
								Cancel
							</Button>
						</Link>
					</Box>
				</Box>
			</Card>
		</Box>
	);
}
