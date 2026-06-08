"use client";

import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogBody,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	Box,
	Heading,
	Link,
	Menu,
	MenuContent,
	MenuTrigger,
	LabelMenuButton,
	Switch,
	Text,
} from "@optiaxiom/react";

type FeatureKey =
	| "opalChat"
	| "virtualTeammates"
	| "contentGeneration"
	| "experimentSuggestions"
	| "smartRecommendations";

type Feature = {
	key: FeatureKey;
	label: string;
	description: string;
};

const FEATURES: Feature[] = [
	{
		key: "opalChat",
		label: "Opal Chat",
		description: "In-product AI assistant available across all areas of the platform.",
	},
	{
		key: "virtualTeammates",
		label: "Virtual Teammates",
		description: "Always-on agents that take actions and respond on your team's behalf.",
	},
	{
		key: "contentGeneration",
		label: "Content Generation",
		description: "Generate drafts, summaries, and rewrites inside the content editor.",
	},
	{
		key: "experimentSuggestions",
		label: "Experiment Suggestions",
		description: "AI-suggested experiment hypotheses based on your traffic data.",
	},
	{
		key: "smartRecommendations",
		label: "Smart Recommendations",
		description: "Personalized recommendations for end-users powered by Opal.",
	},
];

const RETENTION_OPTIONS = ["30 days", "90 days", "1 year", "Don't retain"];

export default function OpalAiSettingsPage() {
	const [enabled, setEnabled] = useState(true);
	const [features, setFeatures] = useState<Record<FeatureKey, boolean>>({
		opalChat: true,
		virtualTeammates: true,
		contentGeneration: true,
		experimentSuggestions: false,
		smartRecommendations: true,
	});
	const [trainingOptOut, setTrainingOptOut] = useState(true);
	const [retention, setRetention] = useState("90 days");
	const [guardrails, setGuardrails] = useState(true);
	const [confirmDisable, setConfirmDisable] = useState(false);

	const handleMasterToggle = (next: boolean) => {
		if (!next) {
			setConfirmDisable(true);
		} else {
			setEnabled(true);
		}
	};

	const confirmDisableOpal = () => {
		setEnabled(false);
		setConfirmDisable(false);
	};

	const setFeature = (key: FeatureKey, value: boolean) => {
		setFeatures((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<Box>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
				<Box display="flex" alignItems="center" gap="12">
					<Heading level="2">Opal AI</Heading>
					<Link href="#" fontSize="md">
						Learn more
					</Link>
				</Box>
			</Box>

			<Box mb="32">
				<Heading level="4">Enable Opal</Heading>
				<Box
					mt="12"
					p="20"
					rounded="md"
					border="1"
					borderColor="border.tertiary"
					bg="bg.default"
					display="flex"
					alignItems="start"
					gap="16"
				>
					<Switch checked={enabled} onCheckedChange={handleMasterToggle} />
					<Box>
						<Text fontWeight="500">Enable Opal AI</Text>
						<Text fontSize="sm" color="fg.tertiary">
							{enabled
								? "Opal AI is active across the platform."
								: "Opal AI is disabled. Enable to use AI features."}
						</Text>
					</Box>
				</Box>
			</Box>

			<Box mb="32">
				<Heading level="4">Feature controls</Heading>
				<Box
					mt="12"
					rounded="md"
					border="1"
					borderColor="border.tertiary"
					bg="bg.default"
				>
					{FEATURES.map((f, i) => (
						<Box
							key={f.key}
							p="16"
							display="flex"
							alignItems="start"
							gap="16"
							borderB={i === FEATURES.length - 1 ? "0" : "1"}
							borderColor="border.tertiary"
						>
							<Switch
								checked={features[f.key]}
								onCheckedChange={(v) => setFeature(f.key, v)}
								disabled={!enabled}
							/>
							<Box>
								<Text fontWeight="500" color={enabled ? "fg.default" : "fg.tertiary"}>
									{f.label}
								</Text>
								<Text fontSize="sm" color="fg.tertiary">
									{f.description}
								</Text>
							</Box>
						</Box>
					))}
				</Box>
			</Box>

			<Box mb="32">
				<Heading level="4">Data & Privacy</Heading>
				<Box
					mt="12"
					rounded="md"
					border="1"
					borderColor="border.tertiary"
					bg="bg.default"
				>
					<Box
						p="16"
						display="flex"
						alignItems="start"
						gap="16"
						borderB="1"
						borderColor="border.tertiary"
					>
						<Switch checked={trainingOptOut} onCheckedChange={setTrainingOptOut} />
						<Box>
							<Text fontWeight="500">AI Training Opt-out</Text>
							<Text fontSize="sm" color="fg.tertiary">
								Prevent your data from being used to train shared foundation models.
							</Text>
						</Box>
					</Box>

					<Box
						p="16"
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						gap="16"
						borderB="1"
						borderColor="border.tertiary"
					>
						<Box>
							<Text fontWeight="500">Data Retention</Text>
							<Text fontSize="sm" color="fg.tertiary">
								How long Opal stores conversation history and generated content.
							</Text>
						</Box>
						<Menu
							options={RETENTION_OPTIONS.map((opt) => ({
								label: opt,
								execute: () => setRetention(opt),
							}))}
						>
							<MenuTrigger asChild>
								<LabelMenuButton label="Data Retention">{retention}</LabelMenuButton>
							</MenuTrigger>
							<MenuContent />
						</Menu>
					</Box>

					<Box p="16" display="flex" alignItems="start" gap="16">
						<Switch checked={guardrails} onCheckedChange={setGuardrails} />
						<Box>
							<Text fontWeight="500">Content Guardrails</Text>
							<Text fontSize="sm" color="fg.tertiary">
								Block AI responses that include unsafe, sensitive, or off-policy content.
							</Text>
						</Box>
					</Box>
				</Box>
			</Box>

			<AlertDialog open={confirmDisable} onOpenChange={setConfirmDisable}>
				<AlertDialogContent>
					<AlertDialogHeader>Disable Opal AI?</AlertDialogHeader>
					<AlertDialogBody>
						All users in your organization will immediately lose access to Opal AI
						features, including Opal Chat, Virtual Teammates, content generation, and
						AI-powered recommendations. You can re-enable Opal at any time.
					</AlertDialogBody>
					<AlertDialogFooter>
						<AlertDialogCancel />
						<AlertDialogAction appearance="danger" onClick={confirmDisableOpal}>
							Disable
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Box>
	);
}
