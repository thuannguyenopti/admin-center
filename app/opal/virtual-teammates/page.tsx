"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge, Box, Button, Heading, LabelMenuButton, Menu, MenuContent, MenuTrigger, Text } from "@optiaxiom/react";
import {
	IconMessageLines,
	IconCirclePause,
	IconEllipsisStroke,
	IconList,
	IconGrid,
	IconSearch,
	IconTrashCan,
	IconUserPlus,
} from "@optiaxiom/icons";
import { Input } from "@/app/components/Input";
import { VAUS } from "@/app/opal/data/vaus";
import { VAUCard } from "./VAUCard";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import Image from "next/image";

const RESPONSIBILITY_OPTIONS = ["All", "Prioritization", "Meeting Prep", "Inbox Triage", "Reporting", "Content", "SEO", "Social Media"];
const STATUS_OPTIONS = ["All", "Active", "Out of Office", "Deactivated"];
const NEEDS_REVIEW_IDS = new Set(["frank"]);

type ViewMode = "grid" | "list";

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
	const [responsibility, setResponsibility] = useState("All");
	const [statusFilter, setStatusFilter] = useState("All");
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
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
			style={{ position: "absolute", inset: 0, overflowY: "auto", background: "#F9FCF8" }}
		>
			<Box style={{ padding: "32px 40px" }}>
				<Heading level="1" mb="4">
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
					<FilterDropdown label="Responsibility" value={responsibility} options={RESPONSIBILITY_OPTIONS} onChange={setResponsibility} />
					<FilterDropdown label="Status" value={statusFilter} options={STATUS_OPTIONS} onChange={setStatusFilter} />
					<Button
						appearance="subtle"
						size="md"
						icon={viewMode === "grid" ? <IconList /> : <IconGrid />}
						aria-label={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
						onClick={() => setViewMode((v) => (v === "grid" ? "list" : "grid"))}
					/>
					<Box style={{ flex: 1 }} />
					<Button appearance="primary" size="md" addonBefore={<IconUserPlus />}>
						Grow your team
					</Button>
				</Box>

				{viewMode === "grid" ? (
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
				) : (
					<Table>
						<thead>
							<tr>
								<Th style={{ paddingLeft: 16 }}>Teammate</Th>
								<Th>Principle User</Th>
								<Th>Type</Th>
								<Th>Status</Th>
								<Th>Attention Required</Th>
								<Th />
							</tr>
						</thead>
						<tbody>
							{filtered.map((vau) => {
								const needsReview = NEEDS_REVIEW_IDS.has(vau.id);
								return (
									<Tr key={vau.id} onClick={() => router.push(`/opal/virtual-teammates/${vau.id}`)}>
										<Td style={{ paddingLeft: 16 }}>
											<Box display="flex" alignItems="center" gap="12">
												<Box style={{ width: 36, height: 36, borderRadius: 8, background: vau.avatarBg, overflow: "hidden", flexShrink: 0 }}>
													<Image src={vau.avatar} alt={vau.name} width={36} height={36} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
												</Box>
												<Box>
													<Text fontSize="md" fontWeight="500" color="fg.default">{vau.characterName ?? vau.name}</Text>
													<Text fontSize="sm" color="fg.secondary">{vau.name}</Text>
												</Box>
											</Box>
										</Td>
										<Td>
											<Text fontSize="md" color="fg.default">Mona Chen</Text>
										</Td>
										<Td>
											<Text fontSize="md" color="fg.default">Private</Text>
											<Text fontSize="sm" color="fg.secondary">This teammate can only be used by you</Text>
										</Td>
										<Td>
											{vau.status === "active" ? (
												<Badge style={{ background: "#D4F5D4", color: "#166534", border: "none", fontFamily: "var(--ax-font-family-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
													Active
												</Badge>
											) : (
												<Badge style={{ background: "#FCE7F3", color: "#9D174D", border: "none", fontFamily: "var(--ax-font-family-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
													Paused
												</Badge>
											)}
										</Td>
										<Td>
											{needsReview && (
												<Badge style={{ background: "#FEF3C7", color: "#92400E", border: "none", fontFamily: "var(--ax-font-family-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
													Needs Review
												</Badge>
											)}
										</Td>
										<Td type="button">
											<Box onClick={(e: React.MouseEvent) => e.stopPropagation()}>
												<Menu
													options={[
														{
															label: "Chat",
															addon: <IconMessageLines />,
															execute: () => router.push("/opal/im"),
														},
														{
															label: "Pause",
															addon: <IconCirclePause />,
															execute: () => {},
														},
														{
															label: "Delete",
															addon: <IconTrashCan />,
															intent: "danger" as const,
															execute: () => {},
														},
													]}
												>
													<MenuTrigger asChild>
														<Button appearance="subtle" size="sm" icon={<IconEllipsisStroke />} aria-label="Actions" />
													</MenuTrigger>
													<MenuContent />
												</Menu>
											</Box>
										</Td>
									</Tr>
								);
							})}
						</tbody>
					</Table>
				)}
			</Box>
		</Box>
	);
}
