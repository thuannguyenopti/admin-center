"use client";

import {
	Box,
	Card,
	Text as AxiomText,
	Link as AxiomLink,
	Field,
	Textarea,
	Select,
	SelectTrigger,
	SelectContent,
	Button,
} from "@optiaxiom/react";
import {useState} from "react";
import {Text} from "@/app/components/Text";
import Link from "next/link";
import {IconArrowLeft} from "@/app/lib/axiom-icons";

export default function HypothesisBuilderPage() {
	const [problem, setProblem] = useState("");
	const [audience, setAudience] = useState("");
	const [change, setChange] = useState("");
	const [behavioralShift, setBehavioralShift] = useState("");
	const [primaryMetric, setPrimaryMetric] = useState("");
	const [predictedImpact, setPredictedImpact] = useState("");
	const [confidence, setConfidence] = useState("");

	return (
		<Box display="flex" flexDirection="column" gap="24" w="full">
			<AxiomLink asChild fontSize="sm">
				<Link
					href="/web-experimentation/home"
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: "8",
						marginBottom: "8",
					}}
				>
					<IconArrowLeft size={18} />
					Back to Home
				</Link>
			</AxiomLink>
			<Text fontSize="lg" fontWeight="600">
				Hypothesis builder
			</Text>
			<AxiomText fontSize="sm" color="fg.secondary" mb="8">
				Structured hypothesis: problem, audience, proposed change, expected shift, metrics,
				and impact. AI can improve clarity and suggest measurable framing.
			</AxiomText>
			<Card p="24">
				<Box display="flex" flexDirection="column" gap="16">
					<Field label="Problem statement">
						<Textarea
							placeholder="What user or business problem are you addressing?"
							value={problem}
							onChange={(e) => setProblem((e.target as HTMLTextAreaElement).value)}
							w="full"
						/>
					</Field>
					<Field label="Target audience">
						<Textarea
							placeholder="Who is this for? (e.g. returning users on pricing page)"
							value={audience}
							onChange={(e) => setAudience((e.target as HTMLTextAreaElement).value)}
							w="full"
						/>
					</Field>
					<Field label="Proposed change">
						<Textarea
							placeholder="What are you changing?"
							value={change}
							onChange={(e) => setChange((e.target as HTMLTextAreaElement).value)}
							w="full"
						/>
					</Field>
					<Field label="Expected behavioral shift">
						<Textarea
							placeholder="How should users behave differently?"
							value={behavioralShift}
							onChange={(e) =>
								setBehavioralShift((e.target as HTMLTextAreaElement).value)
							}
							w="full"
						/>
					</Field>
					<Field label="Primary success metric">
						<Select
							value={primaryMetric}
							onValueChange={setPrimaryMetric}
							options={[
								{label: "Conversion rate", value: "conversion_rate"},
								{label: "Revenue per visit", value: "rpv"},
								{label: "Signup rate", value: "signup_rate"},
							]}
						>
							<SelectTrigger placeholder="Select metric" size="lg" w="full">
								{primaryMetric || "Select metric"}
							</SelectTrigger>
							<SelectContent />
						</Select>
					</Field>
					<Field label="Guardrail metrics">
						<AxiomText fontSize="xs" color="fg.tertiary">
							Define in Success metrics assistant. Link to add guardrails.
						</AxiomText>
					</Field>
					<Field label="Predicted impact">
						<Textarea
							placeholder="e.g. +10% conversion on signup"
							value={predictedImpact}
							onChange={(e) =>
								setPredictedImpact((e.target as HTMLTextAreaElement).value)
							}
							w="full"
						/>
					</Field>
					<Field label="Confidence level">
						<Select
							value={confidence}
							onValueChange={setConfidence}
							options={[
								{label: "High", value: "high"},
								{label: "Medium", value: "medium"},
								{label: "Low", value: "low"},
							]}
						>
							<SelectTrigger placeholder="Select" size="lg" w="full">
								{confidence || "Select"}
							</SelectTrigger>
							<SelectContent />
						</Select>
					</Field>
					<Box display="flex" gap="8">
						<Button appearance="primary" size="lg">
							Save hypothesis
						</Button>
						<Link href="/web-experimentation/home/test-plan">
							<Button appearance="default" size="lg">
								Continue to test plan
							</Button>
						</Link>
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
