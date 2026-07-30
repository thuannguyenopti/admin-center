"use client";

import {
	Box,
	Card,
	Text as AxiomText,
<<<<<<< HEAD
=======
	Link as AxiomLink,
>>>>>>> origin/main
	Field,
	Select,
	SelectTrigger,
	SelectContent,
	Button,
} from "@optiaxiom/react";
<<<<<<< HEAD
import { useState } from "react";
import { Text } from "@/app/components/Text";
import { Input } from "@/app/components/Input";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
=======
import {useState} from "react";
import {Text} from "@/app/components/Text";
import {Input} from "@/app/components/Input";
import Link from "next/link";
import {IconArrowLeft} from "@/app/lib/axiom-icons";
>>>>>>> origin/main

export default function SuccessMetricsPage() {
	const [primaryMetric, setPrimaryMetric] = useState("");
	const [guardrails, setGuardrails] = useState("");
	const [sampleSize, setSampleSize] = useState("");
	const [segmentCuts, setSegmentCuts] = useState("");

	return (
		<Box display="flex" flexDirection="column" gap="24" w="full">
<<<<<<< HEAD
			<Link
				href="/web-experimentation/home"
				style={{ display: "inline-flex", alignItems: "center", gap: "8", marginBottom: "8" }}
			>
				<IconArrowLeft size={18} />
				<AxiomText fontSize="sm" color="fg.accent">
					Back to Home
				</AxiomText>
			</Link>
=======
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
>>>>>>> origin/main
			<Text fontSize="lg" fontWeight="600">
				Success metrics assistant
			</Text>
			<AxiomText fontSize="sm" color="fg.secondary" mb="8">
<<<<<<< HEAD
				Select primary metric, define guardrails, add supporting metrics, estimate sample size, and
				choose segment cuts. Explanations show why recommended metrics align with your hypothesis.
=======
				Select primary metric, define guardrails, add supporting metrics, estimate sample
				size, and choose segment cuts. Explanations show why recommended metrics align with
				your hypothesis.
>>>>>>> origin/main
			</AxiomText>
			<Card p="24">
				<Box display="flex" flexDirection="column" gap="16">
					<Field label="Primary metric">
						<Select
							value={primaryMetric}
							onValueChange={setPrimaryMetric}
							options={[
<<<<<<< HEAD
								{ label: "Conversion rate", value: "conversion_rate" },
								{ label: "Revenue per visit", value: "rpv" },
								{ label: "Signup rate", value: "signup_rate" },
=======
								{label: "Conversion rate", value: "conversion_rate"},
								{label: "Revenue per visit", value: "rpv"},
								{label: "Signup rate", value: "signup_rate"},
>>>>>>> origin/main
							]}
						>
							<SelectTrigger placeholder="Select primary metric" size="lg" w="full">
								{primaryMetric || "Select primary metric"}
							</SelectTrigger>
							<SelectContent />
						</Select>
						<AxiomText fontSize="xs" color="fg.tertiary" mt="4" display="block">
<<<<<<< HEAD
							Why: Primary metric should directly reflect the expected behavioral shift.
=======
							Why: Primary metric should directly reflect the expected behavioral
							shift.
>>>>>>> origin/main
						</AxiomText>
					</Field>
					<Field label="Guardrail metrics">
						<Input
							placeholder="e.g. revenue per visit, bounce rate"
							value={guardrails}
							onChange={(e) => setGuardrails(e.target.value)}
							w="full"
						/>
						<AxiomText fontSize="xs" color="fg.tertiary" mt="4" display="block">
							Metrics to watch for unintended negative impact.
						</AxiomText>
					</Field>
					<Field label="Supporting metrics">
						<AxiomText fontSize="xs" color="fg.tertiary">
							Optional secondary metrics. Add below or in test plan.
						</AxiomText>
					</Field>
					<Field label="Sample size estimate">
						<Input
							placeholder="e.g. 10,000 per variant"
							value={sampleSize}
							onChange={(e) => setSampleSize(e.target.value)}
							w="full"
						/>
					</Field>
					<Field label="Segment cuts">
						<Input
							placeholder="e.g. device, new vs returning"
							value={segmentCuts}
							onChange={(e) => setSegmentCuts(e.target.value)}
							w="full"
						/>
						<AxiomText fontSize="xs" color="fg.tertiary" mt="4" display="block">
							How you will slice the data for analysis.
						</AxiomText>
					</Field>
					<Box display="flex" gap="8">
						<Button appearance="primary" size="lg">
							Save metrics
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
