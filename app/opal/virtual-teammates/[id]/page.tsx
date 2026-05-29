"use client";

import { Badge, Box, Button, Tooltip } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import {
	IconBook,
	IconArrowRight,
	IconArrowLeft,
	IconPen,
	IconPlus,
	IconFileLines,
	IconFilePdf,
	IconFileWord,
	IconGear,
} from "@optiaxiom/icons";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { DEFAULT_VAU_EXAMPLES, VAUS, type VAU, type VAUExample } from "@/app/opal/data/vaus";
import { TOOL_ICONS } from "../tool-icons";

type MockFile = { name: string; size: string; icon: React.ReactNode };

const MOCK_FILES: MockFile[] = [
	{ name: "brand-guidelines.pdf", size: "2.1 MB", icon: <Box display="inline-flex" style={{ color: "#d44b3e" }}><IconFilePdf size={16} /></Box> },
	{ name: "messaging-framework.docx", size: "184 KB", icon: <Box display="inline-flex" style={{ color: "#1e57c2" }}><IconFileWord size={16} /></Box> },
	{ name: "personas-q3.md", size: "12 KB", icon: <Box display="inline-flex" color="fg.tertiary"><IconFileLines size={16} /></Box> },
];

export default function VAUDetailPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const vau = useMemo(() => VAUS.find((v) => v.id === params?.id), [params?.id]);

	if (!vau) {
		return (
			<Box px="32" py="24" display="flex" flexDirection="column" gap="16">
				<Link href="/opal/virtual-teammates" style={{ textDecoration: "none" }}>
					<Button appearance="subtle" size="md" icon={<IconArrowLeft size={16} />}>Back to Virtual Teammates</Button>
				</Link>
				<Text color="fg.tertiary">No teammate found for &ldquo;{params?.id}&rdquo;.</Text>
			</Box>
		);
	}

	const examples: VAUExample[] = vau.examples ?? DEFAULT_VAU_EXAMPLES;
	const description = vau.longDescription ?? vau.description;

	return (
		<Box px="32" py="24" display="flex" flexDirection="column" gap="24" overflow="auto" h="full">
			{/* Top row: back link (left) + actions (right) */}
			<Box display="flex" alignItems="center" justifyContent="space-between">
				<Button
					appearance="subtle"
					size="md"
					icon={<IconArrowLeft size={16} />}
					onClick={() => router.push("/opal/virtual-teammates")}
				>
					Back
				</Button>
				<Box display="flex" gap="8" alignItems="center">
					<Button appearance="primary" size="lg">Save</Button>
				</Box>
			</Box>

			{/* 2-col body — left main + right rail */}
			<Box display="flex" gap="32" alignItems="start">
				{/* Left main */}
				<Box display="flex" flexDirection="column" gap="24" style={{ flex: 1, minWidth: 0 }}>
					{/* Avatar + role badge + name */}
					<Box display="flex" gap="16" alignItems="center">
						<Box
							rounded="xl"
							style={{ width: "80px", height: "80px", minWidth: "80px", overflow: "hidden", backgroundColor: vau.avatarBg }}
						>
							<Image src={vau.avatar} alt={vau.name} width={80} height={80} unoptimized />
						</Box>
						<Box display="flex" flexDirection="column" gap="8" style={{ flex: 1, minWidth: 0 }}>
							<Text
								color="fg.default"
								fontSize="3xl"
								fontWeight="700"
								style={{
									lineHeight: 1.1,
									letterSpacing: "-0.4px",
									textDecoration: "none",
								}}
							>
								{vau.name}
							</Text>
							<Box>
								<Badge intent="information">{vau.templateName}</Badge>
							</Box>
						</Box>
					</Box>

					{/* Description + advanced settings */}
					<Box display="flex" flexDirection="column" gap="12">
						<Text maxW="full" fontSize="md" color="fg.default" style={{ lineHeight: 1.5 }}>
							{description}
						</Text>
						<Box>
							<Button appearance="subtle" size="sm" icon={<IconGear size={14} />}>
								Advanced Settings
							</Button>
						</Box>
					</Box>

					{/* Examples grid — 2 cols */}
					<Box
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
							gap: "16px",
						}}
					>
						{examples.map((ex) => (
							<ExampleCard key={ex.title} example={ex} />
						))}
					</Box>
				</Box>

				{/* Right rail — right-aligned with Save button */}
				<Box display="flex" flexDirection="column" gap="16" style={{ width: "320px", flexShrink: 0, marginLeft: "auto" }}>
					<ConnectorsBox vau={vau} />
					<SkillsBox vau={vau} />
					<FilesBox />
				</Box>
			</Box>
		</Box>
	);
}

function SideBox({
	titleIcon,
	title,
	count,
	actionIcon,
	actionLabel,
	children,
}: {
	titleIcon: React.ReactNode;
	title: string;
	count: number;
	actionIcon: React.ReactNode;
	actionLabel: string;
	children: React.ReactNode;
}) {
	return (
		<Box bg="bg.default" border="1" borderColor="border.tertiary" rounded="md" style={{ overflow: "hidden" }}>
			<Box display="flex" alignItems="center" justifyContent="space-between" px="16" py="12">
				<Box display="flex" alignItems="center" gap="8">
					<Box display="flex" alignItems="center" color="fg.default">
						{titleIcon}
					</Box>
					<Text fontWeight="600" color="fg.default" fontSize="md">{title}</Text>
					<Badge>{count}</Badge>
				</Box>
				<Tooltip content={actionLabel}>
					<Button appearance="subtle" size="sm" icon={actionIcon} aria-label={actionLabel} />
				</Tooltip>
			</Box>
			<Box display="flex" flexDirection="column">
				{children}
			</Box>
		</Box>
	);
}

function ConnectorsBox({ vau }: { vau: VAU }) {
	return (
		<SideBox
			titleIcon={<img src="/nav_icons/grid-2-plus.svg" alt="" width={16} height={16} />}
			title="Connectors"
			count={vau.tools.length}
			actionIcon={<IconPlus size={14} />}
			actionLabel="Link connector"
		>
			{vau.tools.map((toolKey) => {
				const tool = TOOL_ICONS[toolKey];
				if (!tool) return null;
				return (
					<Box key={toolKey} display="flex" alignItems="center" gap="12" px="16" py="10">
						<Box
							rounded="sm"
							border="1"
							borderColor="border.tertiary"
							display="flex"
							alignItems="center"
							justifyContent="center"
							style={{ width: 28, height: 28, color: tool.color, fontSize: 10, fontWeight: 600, flexShrink: 0 }}
						>
							{tool.textLabel ? tool.textLabel : tool.icon}
						</Box>
						<Text fontSize="sm" color="fg.default" style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
							{tool.name}
						</Text>
					</Box>
				);
			})}
		</SideBox>
	);
}

function SkillsBox({ vau }: { vau: VAU }) {
	return (
		<SideBox
			titleIcon={<IconBook size={16} />}
			title="Skills"
			count={vau.tags.length}
			actionIcon={<IconPen size={14} />}
			actionLabel="Edit skills"
		>
			<Box display="flex" gap="6" px="16" py="12" style={{ flexWrap: "wrap" }}>
				{vau.tags.map((tag) => (
					<Badge key={tag.label}>{tag.label}</Badge>
				))}
			</Box>
		</SideBox>
	);
}

function FilesBox() {
	return (
		<SideBox
			titleIcon={<IconFileLines size={16} />}
			title="Files"
			count={MOCK_FILES.length}
			actionIcon={<IconPlus size={14} />}
			actionLabel="Upload file"
		>
			{MOCK_FILES.map((file) => (
				<Box key={file.name} display="flex" alignItems="center" gap="12" px="16" py="10">
					<Box display="flex" alignItems="center" justifyContent="center" style={{ width: 20, flexShrink: 0 }}>
						{file.icon}
					</Box>
					<Box style={{ flex: 1, minWidth: 0 }}>
						<Text fontSize="sm" color="fg.default" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
							{file.name}
						</Text>
						<Text fontSize="xs" color="fg.tertiary">{file.size}</Text>
					</Box>
				</Box>
			))}
		</SideBox>
	);
}

function ExampleCard({ example }: { example: VAUExample }) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			rounded="md"
			p="16"
			display="flex"
			flexDirection="column"
			gap="8"
		>
			{/* Icon + title + frequency */}
			<Box display="flex" gap="12" alignItems="start">
				<Box
					rounded="md"
					bg="bg.secondary"
					style={{
						width: "42px",
						height: "42px",
						minWidth: "42px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: "22px",
						lineHeight: 1,
					}}
				>
					<span>{example.emoji}</span>
				</Box>
				<Box display="flex" flexDirection="column" gap="2" style={{ flex: 1, minWidth: 0 }}>
					<Text fontWeight="700" color="fg.default" fontSize="lg" style={{ lineHeight: 1.3 }}>
						{example.title}
					</Text>
					<Text fontSize="sm" color="fg.secondary" style={{ fontFamily: "var(--ax-fonts-mono, 'Roboto Mono', monospace)", letterSpacing: "0.4px", textTransform: "uppercase" }}>
						{example.frequency}
					</Text>
				</Box>
			</Box>

			{/* Faux content bars */}
			<Box
				rounded="sm"
				bg="bg.secondary"
				display="flex"
				flexDirection="column"
				gap="4"
				py="10"
				px="12"
			>
				{[100, 60, 70, 40, 100].map((w, i) => (
					<Box
						key={i}
						style={{
							height: "6px",
							width: `${w}%`,
							borderRadius: "8px",
							backgroundColor: "var(--ax-colors-border-tertiary)",
						}}
					/>
				))}
			</Box>

			{/* See example link */}
			<Box>
				<Button appearance="subtle" size="sm" icon={<IconArrowRight size={14} />} iconPosition="end">
					View details
				</Button>
			</Box>
		</Box>
	);
}
