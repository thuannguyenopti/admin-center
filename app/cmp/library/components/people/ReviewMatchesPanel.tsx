"use client";

import { useState } from "react";
import { Badge, Box, Button, Heading, Text } from "@optiaxiom/react";
import {
	IconArrowsLeftRight,
	IconCheck,
	IconSparkles,
	IconUserPlus,
	IconUserXmark,
	IconXmark,
} from "@optimizely/axiom-icons";
import { AiBanner, AiBannerOrb } from "../AiBanner";

type ReviewMatch = {
	id: string;
	image: string;
	title: string;
	date: string;
	confidencePct: number;
};

type Props = {
	personName: string;
	matches: ReviewMatch[];
	onClose: () => void;
	onApply: (message: string) => void;
};

export function ReviewMatchesPanel({ personName, matches, onClose, onApply }: Props) {
	const [resolved, setResolved] = useState<Set<string>>(() => new Set());
	const pending = matches.filter((match) => !resolved.has(match.id));

	const resolveOne = (id: string, message: string) => {
		setResolved((current) => new Set([...current, id]));
		onApply(message);
	};

	const acceptAll = () => {
		setResolved(new Set(matches.map((match) => match.id)));
		onApply(`${matches.length} suggested matches accepted for ${personName}.`);
	};

	return (
		<Box
			className="axiom-v3-recognition"
			display="flex"
			flexDirection="column"
			h="full"
			style={{ width: 420 }}
		>
			<Box
				alignItems="start"
				borderB="1"
				borderColor="border.tertiary"
				display="flex"
				gap="12"
				justifyContent="space-between"
				p="20"
			>
					<Box display="flex" flexDirection="column" gap="4">
						<Box alignItems="center" display="flex" gap="8">
							<IconSparkles size={16} style={{ color: "var(--ax-colors-fg-secondary)" }} />
							<Text fontSize="xs" color="fg.secondary" fontWeight="600">
								OPAL MATCH REVIEW
							</Text>
					</Box>
					<Heading level="3" fontSize="lg" style={{ margin: 0 }}>
						Review possible {personName} matches
					</Heading>
						<Text fontSize="sm" color="fg.secondary">
							Accept, move, or reject each suggested face before metadata is applied.
						</Text>
				</Box>
				<Button
					appearance="subtle"
					size="sm"
					icon={<IconXmark size={16} />}
					aria-label="Close review matches"
					onClick={onClose}
				/>
			</Box>

			<Box display="flex" flex="1" flexDirection="column" gap="12" overflow="auto" p="20">
				<AiBanner>
					<AiBannerOrb />
						<Text fontSize="sm" style={{ flex: 1 }}>
							{pending.length} of {matches.length} suggestions still need review.
						</Text>
						<Button
							appearance="default-opal"
							size="sm"
							icon={<IconCheck size={12} />}
							iconPosition="start"
							onClick={acceptAll}
						>
						Accept all
					</Button>
				</AiBanner>

				{matches.map((match) => {
					const isResolved = resolved.has(match.id);
					return (
						<Box
								key={match.id}
								bg={isResolved ? "bg.secondary" : "bg.default"}
								border="1"
								borderColor={isResolved ? "border.tertiary" : "border.secondary"}
							display="flex"
							flexDirection="column"
							gap="10"
							p="10"
							rounded="md"
							style={{ opacity: isResolved ? 0.68 : 1 }}
						>
							<Box display="flex" gap="10">
								<Box
									bg="bg.secondary"
									rounded="md"
									style={{
										width: 80,
										height: 64,
										flexShrink: 0,
										overflow: "hidden",
									}}
								>
									<img
										alt=""
										src={match.image}
										style={{
											display: "block",
											height: "100%",
											objectFit: "cover",
											width: "100%",
										}}
									/>
								</Box>
								<Box display="flex" flex="1" flexDirection="column" gap="4">
									<Text fontSize="sm" fontWeight="600">
										{match.title}
									</Text>
									<Text fontSize="xs" color="fg.secondary">
										{match.date}
									</Text>
									<Box display="flex" gap="6">
										<Badge intent="success">{match.confidencePct}% match</Badge>
										{isResolved && <Badge intent="neutral">reviewed</Badge>}
									</Box>
								</Box>
							</Box>

							<Box display="flex" gap="6" flexWrap="wrap">
								<Button
									appearance="default"
									size="sm"
									icon={<IconCheck size={12} />}
									iconPosition="start"
									onClick={() =>
										resolveOne(match.id, `${match.title} confirmed as ${personName}.`)
									}
								>
									Accept
								</Button>
								<Button
									appearance="default"
									size="sm"
									icon={<IconArrowsLeftRight size={12} />}
									iconPosition="start"
									onClick={() =>
										resolveOne(match.id, `${match.title} ready to move to another person.`)
									}
								>
									Move
								</Button>
								<Button
									appearance="default"
									size="sm"
									icon={<IconUserPlus size={12} />}
									iconPosition="start"
									onClick={() =>
										resolveOne(match.id, `${match.title} will start a new person profile.`)
									}
								>
									New person
								</Button>
								<Button
									appearance="default"
									size="sm"
									icon={<IconUserXmark size={12} />}
									iconPosition="start"
									onClick={() =>
										resolveOne(match.id, `${match.title} rejected as ${personName}.`)
									}
								>
									Not this person
								</Button>
							</Box>
						</Box>
					);
				})}
			</Box>
		</Box>
	);
}
