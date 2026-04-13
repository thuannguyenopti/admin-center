"use client";

import { Box, Card, Text as AxiomText, Field, Button } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Input } from "@/app/components/Input";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

export default function CompetitiveResearchPage() {
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
				Competitive research
			</Text>
			<AxiomText fontSize="sm" color="fg.secondary" mb="16">
				Analyze competitor positioning, identify differentiation gaps, and surface untested messaging
				themes.
			</AxiomText>
			<Card p="24">
				<Box display="flex" flexDirection="column" gap="16">
					<Field label="Competitor URLs">
						<Input placeholder="https://competitor.com/page" w="full" />
					</Field>
					<Field label="Key themes to analyze">
						<Input placeholder="e.g. pricing, value proposition" w="full" />
					</Field>
					<Box display="flex" gap="8">
						<Button appearance="primary" size="lg">
							Analyze competitors
						</Button>
						<Link href="/web-experimentation/home">
							<Button appearance="subtle" size="lg">
								Cancel
							</Button>
						</Link>
					</Box>
				</Box>
			</Card>
			<Card p="16" bg="bg.accent.subtle">
				<AxiomText fontSize="xs" color="fg.secondary">
					Results will appear here after analysis. Placeholder for the guided workflow.
				</AxiomText>
			</Card>
		</Box>
	);
}
