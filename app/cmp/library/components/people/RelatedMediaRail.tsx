"use client";

import { Badge, Box, Button, Heading, Text } from "@optiaxiom/react";
import type { ReactNode } from "react";
import {
	IconImage,
	IconPlay,
	IconTag,
	IconVideo,
} from "@optimizely/axiom-icons";

const RELATED_IMAGES = [
	{ image: "/people/action-peloton-1.jpg", title: "Race day peloton", label: "Series" },
	{ image: "/people/action-tri-road-m.jpg", title: "Road interval set", label: "Similar" },
	{ image: "/people/action-swim-m.jpg", title: "Open water training", label: "Cross-sport" },
	{ image: "/people/action-yoga-f.jpg", title: "Strength prep", label: "Training" },
	{ image: "/people/object-bike-fixie.jpg", title: "Bike detail", label: "Object match" },
];

const RELATED_VIDEOS = [
	{ image: "/people/action-swim-m.jpg", title: "Swim split review", duration: "00:21", quality: "HD" },
	{ image: "/people/action-peloton-1.jpg", title: "Stage pack movement", duration: "00:18", quality: "4K" },
	{ image: "/people/action-tri-road-m.jpg", title: "Bike mount sequence", duration: "00:14", quality: "HD" },
	{ image: "/people/action-fitness-f.jpg", title: "Run form clip", duration: "00:26", quality: "HD" },
];

const RELATED_KEYWORDS = ["cyclist", "triathlete", "race day", "open water", "road bike", "training"];

export function RelatedMediaRail({ personName }: { personName: string }) {
	return (
		<Box display="flex" flexDirection="column" gap="20">
			<RelatedSectionHeader
				icon={<IconImage size={15} />}
				title="Related images"
				description={`Visually similar assets and campaign variants connected to ${personName}.`}
			/>
			<Box display="flex" gap="12" overflow="auto" pb="4">
				{RELATED_IMAGES.map((item) => (
					<RelatedImageCard key={item.title} {...item} />
				))}
				<SeeMoreCard label="See all images" />
			</Box>

			<RelatedSectionHeader
				icon={<IconVideo size={15} />}
				title="Similar videos"
				description="Motion assets with matching people, sport context, or detected equipment."
			/>
			<Box display="flex" gap="12" overflow="auto" pb="4">
				{RELATED_VIDEOS.map((item) => (
					<RelatedVideoCard key={item.title} {...item} />
				))}
				<SeeMoreCard label="See all videos" />
			</Box>

			<Box alignItems="center" display="flex" flexWrap="wrap" gap="8">
				<Box alignItems="center" display="flex" gap="6">
					<IconTag size={14} style={{ color: "var(--ax-colors-fg-secondary)" }} />
					<Text fontSize="sm" fontWeight="600">
						Similar keywords
					</Text>
				</Box>
				{RELATED_KEYWORDS.map((keyword) => (
					<Badge key={keyword} intent="neutral">
						{keyword}
					</Badge>
				))}
			</Box>
		</Box>
	);
}

function RelatedSectionHeader({
	icon,
	title,
	description,
}: {
	icon: ReactNode;
	title: string;
	description: string;
}) {
	return (
		<Box alignItems="end" display="flex" gap="8" justifyContent="space-between">
			<Box display="flex" flexDirection="column" gap="2">
				<Box alignItems="center" display="flex" gap="8">
					<Box style={{ color: "var(--ax-colors-fg-secondary)" }}>{icon}</Box>
					<Heading level="3" fontSize="md" style={{ margin: 0 }}>
						{title}
					</Heading>
				</Box>
				<Text color="fg.secondary" fontSize="sm">
					{description}
				</Text>
			</Box>
			<Button appearance="subtle" size="sm">
				See all
			</Button>
		</Box>
	);
}

function RelatedImageCard({ image, title, label }: { image: string; title: string; label: string }) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			overflow="hidden"
			rounded="md"
			style={{ flex: "0 0 176px" }}
		>
			<Box style={{ aspectRatio: "1.45 / 1", overflow: "hidden", position: "relative" }}>
				<img
					alt={title}
					src={image}
					style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }}
				/>
				<Box style={{ bottom: 8, left: 8, position: "absolute" }}>
					<Badge intent="success">{label}</Badge>
				</Box>
			</Box>
			<Box p="10">
				<Text fontSize="sm" fontWeight="500" lineClamp="1">
					{title}
				</Text>
			</Box>
		</Box>
	);
}

function RelatedVideoCard({
	image,
	title,
	duration,
	quality,
}: {
	image: string;
	title: string;
	duration: string;
	quality: string;
}) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			overflow="hidden"
			rounded="md"
			style={{ flex: "0 0 196px" }}
		>
			<Box style={{ aspectRatio: "16 / 9", overflow: "hidden", position: "relative" }}>
				<img
					alt={title}
					src={image}
					style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }}
				/>
				<Box
					alignItems="center"
					bg="bg.default"
					display="flex"
					gap="6"
					px="8"
					py="4"
					rounded="sm"
					style={{ bottom: 8, left: 8, position: "absolute" }}
				>
					<IconPlay size={11} style={{ color: "var(--ax-colors-fg-default)" }} />
					<Text fontSize="sm" fontWeight="600">
						{duration}
					</Text>
					<Text fontSize="sm" color="fg.secondary">
						{quality}
					</Text>
				</Box>
			</Box>
			<Box p="10">
				<Text fontSize="sm" fontWeight="500" lineClamp="1">
					{title}
				</Text>
			</Box>
		</Box>
	);
}

function SeeMoreCard({ label }: { label: string }) {
	return (
		<Box
			alignItems="center"
			bg="bg.secondary"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			gap="8"
			justifyContent="center"
			rounded="md"
			style={{ flex: "0 0 128px", minHeight: 118 }}
		>
			<IconImage size={22} style={{ color: "var(--ax-colors-fg-secondary)" }} />
			<Text fontSize="sm" fontWeight="600">
				{label}
			</Text>
		</Box>
	);
}
