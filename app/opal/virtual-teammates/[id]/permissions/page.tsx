"use client";

import { useParams } from "next/navigation";
import { Box, Button, Heading, Text } from "@optiaxiom/react";
import { IconPlus, IconXmark } from "@optiaxiom/icons";
import Image from "next/image";
import { VAUS } from "@/app/opal/data/vaus";

const CAPTION: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 10,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.36px",
	textTransform: "uppercase" as const,
};

const SECTION_HEADING: React.CSSProperties = {
	fontFamily: "var(--ax-font-family-headings, 'VC Nudge', sans-serif)",
	fontSize: 16,
	fontWeight: 600,
	lineHeight: "1.2",
	color: "var(--ax-colors-fg-default)",
};

const CARD: React.CSSProperties = {
	background: "var(--ax-colors-bg-default)",
	border: "1px solid var(--ax-colors-border-default)",
	borderRadius: 8,
	padding: "20px 24px",
	marginBottom: 12,
};

function InitialsAvatar({ name, size = 28 }: { name: string; size?: number }) {
	const initials = name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
	return (
		<Box
			style={{
				width: size,
				height: size,
				borderRadius: "50%",
				background: "#D8E4CB",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexShrink: 0,
			}}
		>
			<span
				style={{
					...CAPTION,
					fontSize: 9,
					color: "var(--ax-colors-fg-default)",
					lineHeight: 1,
				}}
			>
				{initials}
			</span>
		</Box>
	);
}

function UserChip({
	name,
	avatar,
	onRemove,
}: {
	name: string;
	avatar?: string;
	onRemove?: () => void;
}) {
	return (
		<Box
			display="flex"
			alignItems="center"
			gap="6"
			style={{
				background: "#D8E4CB",
				borderRadius: 32,
				padding: "4px 8px 4px 4px",
				flexShrink: 0,
			}}
		>
			{avatar ? (
				<Box style={{ width: 20, height: 20, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
					<Image src={avatar} alt={name} width={20} height={20} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
				</Box>
			) : (
				<InitialsAvatar name={name} size={20} />
			)}
			<span style={{ ...CAPTION, fontSize: 9, color: "var(--ax-colors-fg-default)" }}>{name}</span>
			{onRemove && (
				<IconXmark
					style={{ width: 10, height: 10, color: "var(--ax-colors-fg-secondary)", cursor: "pointer", flexShrink: 0 }}
					onClick={onRemove}
				/>
			)}
		</Box>
	);
}

const WORKFLOW_TAG_STYLE: React.CSSProperties = {
	...CAPTION,
	fontSize: 10,
	background: "#D6EAF8",
	color: "#1A5276",
	padding: "3px 10px",
	borderRadius: 4,
	whiteSpace: "nowrap" as const,
};

const REPORTS_TO = [{ name: "Mona Chen" }];
const WORKS_WITH = [
	{ name: "Ana Shuleva", avatar: "/avatar-user.png" },
	{ name: "Sarah Chen" },
	{ name: "Jordan Lee" },
	{ name: "Priya Patel" },
	{ name: "Alex Wu" },
];
const WORKFLOWS = ["Meeting_Prep", "Email_Triage", "CMP/Review_Request", "Notifications"];

export default function VATPermissionsPage() {
	const params = useParams();
	const id = params?.id as string;
	const vau = VAUS.find((v) => v.id === id);
	const name = vau?.characterName ?? vau?.name ?? "Randy";

	return (
		<Box style={{ padding: "32px 40px" }}>
			<Heading level="2" mb="4">Permissions</Heading>
			<Text color="fg.secondary" fontSize="md" mb="24">
				Who {name} works with and what {name}&apos;s allowed to do.
			</Text>

			{/* Randy reports to */}
			<Box style={CARD}>
				<Box display="flex" alignItems="start" justifyContent="space-between" mb="4">
					<Box>
						<Text style={SECTION_HEADING} mb="4">{name} reports to</Text>
						<Text fontSize="sm" color="fg.secondary" mb="16">
							Full access to direct, review, and approve {name}&apos;s work.
						</Text>
					</Box>
					<Button appearance="default" size="sm" addonBefore={<IconPlus />}>
						Add user
					</Button>
				</Box>
				<Box display="flex" alignItems="center" gap="8" style={{ flexWrap: "wrap" }}>
					{REPORTS_TO.map((u) => (
						<UserChip key={u.name} name={u.name} onRemove={() => {}} />
					))}
				</Box>
			</Box>

			{/* Randy works with */}
			<Box style={CARD}>
				<Text style={SECTION_HEADING} mb="4">{name} works with</Text>
				<Text fontSize="sm" color="fg.secondary" mb="16">
					Teammates {name} can message, share updates with, and receive requests from.
				</Text>
				<Box display="flex" alignItems="center" gap="8" style={{ flexWrap: "wrap" }}>
					{WORKS_WITH.map((u) => (
						<UserChip key={u.name} name={u.name} avatar={u.avatar} onRemove={() => {}} />
					))}
				</Box>
			</Box>

			{/* Manage actions */}
			<Box style={CARD}>
				<Box display="flex" alignItems="start" justifyContent="space-between">
					<Box>
						<Text style={SECTION_HEADING} mb="4">Manage actions</Text>
						<Text fontSize="sm" color="fg.secondary" style={{ maxWidth: 600 }}>
							Control what {name} handles alone and what comes to you first. To make changes, you&apos;ll need to switch into {name}&apos;s account.
						</Text>
					</Box>
					<Button appearance="default" size="sm" style={{ flexShrink: 0, marginLeft: 16 }}>
						Manage as {name}
					</Button>
				</Box>
			</Box>

			{/* Randy's workflows */}
			<Box style={CARD}>
				<Box display="flex" alignItems="start" justifyContent="space-between" mb="16">
					<Box>
						<Text style={SECTION_HEADING} mb="4">{name}&apos;s workflows</Text>
						<Text fontSize="sm" color="fg.secondary">Tasks that your virtual teammate can run</Text>
					</Box>
					<Button appearance="default" size="sm" addonBefore={<IconPlus />} style={{ flexShrink: 0, marginLeft: 16 }}>
						Install workflow
					</Button>
				</Box>
				<Box display="flex" alignItems="center" gap="8" style={{ flexWrap: "wrap" }}>
					{WORKFLOWS.map((w) => (
						<span key={w} style={WORKFLOW_TAG_STYLE}>{w}</span>
					))}
				</Box>
			</Box>

			{/* Guardrails */}
			<Box style={CARD}>
				<Box display="flex" alignItems="start" justifyContent="space-between">
					<Box>
						<Text style={SECTION_HEADING} mb="4">Guardrails</Text>
						<Text fontSize="sm" color="fg.secondary" style={{ maxWidth: 600 }}>
							{name}&apos;s hard lines — set by the company handbook. Can&apos;t be overridden, but you can add your own on top.
						</Text>
					</Box>
					<Button appearance="default" size="sm" style={{ flexShrink: 0, marginLeft: 16 }}>
						Configure
					</Button>
				</Box>
			</Box>
		</Box>
	);
}
