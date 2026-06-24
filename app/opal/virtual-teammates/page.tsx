"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Heading, LabelMenuButton, Menu, MenuContent, MenuTrigger, Text } from "@optiaxiom/react";
import { IconSearch, IconUserPlus } from "@optiaxiom/icons";
import { Input } from "@/app/components/Input";
import { VAUS } from "@/app/opal/data/vaus";
import { VAUCard } from "./VAUCard";

const SKILL_OPTIONS = ["All", "Prioritization", "Meeting Prep", "Inbox Triage", "Reporting", "Content", "SEO", "Social Media"];
const STATUS_OPTIONS = ["All", "Active", "Out of Office"];

function FilterDropdown({
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: string;
	options: string[];
	onChange: (v: string) => void;
}) {
	return (
		<Menu options={options.map((opt) => ({ label: opt, onClick: () => onChange(opt) }))}>
			<MenuTrigger asChild>
				<LabelMenuButton label={label}>{value}</LabelMenuButton>
			</MenuTrigger>
			<MenuContent />
		</Menu>
	);
}

export default function VirtualTeammatesPage() {
	const [query, setQuery] = useState("");
	const [skill, setSkill] = useState("All");
	const [statusFilter, setStatusFilter] = useState("All");
	const router = useRouter();

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return VAUS.filter((v) => {
			if (v.isCandidate) return false;
			if (
				q &&
				!v.name.toLowerCase().includes(q) &&
				!v.characterName?.toLowerCase().includes(q) &&
				!v.description.toLowerCase().includes(q)
			)
				return false;
			return true;
		});
	}, [query]);

	return (
		<Box
			display="flex"
			flexDirection="column"
			style={{ position: "absolute", inset: 0, overflowY: "auto", background: "var(--ax-colors-bg-default)" }}
		>
			{/* Hero banner */}
			<Box
				style={{
					width: "100%",
					height: 160,
					flexShrink: 0,
					backgroundImage: "url('/background-opal-new.png')",
					backgroundSize: "cover",
					backgroundPosition: "center center",
				}}
			/>

			{/* Content */}
			<Box style={{ padding: "32px 40px" }}>
				<Heading level="2" mb="4">
					Virtual Teammates
				</Heading>
				<Text color="fg.secondary" fontSize="md" mb="24">
					Your virtual teammates are hard at work. See what they're doing and step in when they need you.
				</Text>

				{/* Filters row */}
				<Box display="flex" alignItems="center" gap="8" mb="32">
					<Box style={{ width: 264 }}>
						<Input
							placeholder="Enter name or description"
							addonBefore={<IconSearch />}
							value={query}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
						/>
					</Box>
					<FilterDropdown label="Skill" value={skill} options={SKILL_OPTIONS} onChange={setSkill} />
					<FilterDropdown
						label="Active Status"
						value={statusFilter}
						options={STATUS_OPTIONS}
						onChange={setStatusFilter}
					/>
					<Box style={{ flex: 1 }} />
					<Button appearance="primary" size="md" addonBefore={<IconUserPlus />}>
						Grow your team
					</Button>
				</Box>

				{/* Card grid */}
				<Box
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
						gap: 16,
					}}
				>
					{filtered.map((vau) => (
						<VAUCard
							key={vau.id}
							vau={vau}
							onSelect={(v) => router.push(`/opal/virtual-teammates/${v.id}`)}
						/>
					))}
				</Box>
			</Box>
		</Box>
	);
}
