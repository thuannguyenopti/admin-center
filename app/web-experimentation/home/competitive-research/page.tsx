"use client";

<<<<<<< HEAD
import { Box, Card, Text as AxiomText, Field, Button } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Input } from "@/app/components/Input";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
=======
import {Box, Card, Text as AxiomText, Field, Button, Link as AxiomLink} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Input} from "@/app/components/Input";
import Link from "next/link";
import {IconArrowLeft} from "@/app/lib/axiom-icons";
>>>>>>> origin/main

export default function CompetitiveResearchPage() {
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
				Competitive research
			</Text>
			<AxiomText fontSize="sm" color="fg.secondary" mb="16">
<<<<<<< HEAD
				Analyze competitor positioning, identify differentiation gaps, and surface untested messaging
				themes.
=======
				Analyze competitor positioning, identify differentiation gaps, and surface untested
				messaging themes.
>>>>>>> origin/main
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
<<<<<<< HEAD
			<Card p="16" bg="bg.accent.subtle">
=======
			<Card p="16" bg="bg.information.subtle">
>>>>>>> origin/main
				<AxiomText fontSize="xs" color="fg.secondary">
					Results will appear here after analysis. Placeholder for the guided workflow.
				</AxiomText>
			</Card>
		</Box>
	);
}
