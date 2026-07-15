"use client";

import React, { useState } from "react";
import {
	Box,
	Badge,
	Spinner,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
	IconSearch,
	IconSparkles,
	IconChevronDown,
	IconChevronRight,
	IconUser,
} from "@/app/lib/axiom-icons";
import type { ChangeLogEntry, VTChange } from "@/app/cms/data/vt-activity";
import { INITIAL_CHANGE_LOG } from "./mockData";

function formatTime(timestamp: string): string {
	const date = new Date(timestamp);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffHours = diffMs / (1000 * 60 * 60);

	if (diffHours < 1) {
		const mins = Math.floor(diffMs / (1000 * 60));
		return `${mins}m ago`;
	}
	if (diffHours < 24) {
		return `${Math.floor(diffHours)}h ago`;
	}
	const diffDays = Math.floor(diffHours / 24);
	if (diffDays === 1) return "Yesterday";
	if (diffDays < 7) return `${diffDays}d ago`;
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

function StatusBadge({ status }: { status: ChangeLogEntry["status"] }) {
	switch (status) {
		case "completed":
			return (
				<Badge intent="success" variant="subtle">
					Completed
				</Badge>
			);
		case "in-progress":
			return (
				<Badge intent="information" variant="subtle">
					<Box display="flex" alignItems="center" gap="4">
						<Spinner size="sm" />
						In Progress
					</Box>
				</Badge>
			);
		case "failed":
			return (
				<Badge intent="danger" variant="subtle">
					Failed
				</Badge>
			);
	}
}

function ChangesDiff({ changes }: { changes: VTChange[] }) {
	return (
		<Box display="flex" flexDirection="column" gap="8" py="8">
			{changes.map((change, i) => (
				<Box
					key={i}
					display="flex"
					flexDirection="column"
					gap="4"
					p="12"
					rounded="md"
					bg="bg.secondary"
				>
					<Text fontSize="sm" fontWeight="500" color="fg.default">
						{change.field}
					</Text>
					<Box display="flex" flexDirection="column" gap="2">
						<Box display="flex" alignItems="start" gap="8">
							<Text
								fontSize="sm"
								color="fg.tertiary"
								style={{ minWidth: 16, flexShrink: 0 }}
							>
								-
							</Text>
							<Text
								fontSize="sm"
								color="fg.tertiary"
								style={{ textDecoration: "line-through" }}
							>
								{change.oldValue}
							</Text>
						</Box>
						<Box display="flex" alignItems="start" gap="8">
							<Text
								fontSize="sm"
								color="fg.default"
								style={{ minWidth: 16, flexShrink: 0 }}
							>
								+
							</Text>
							<Text fontSize="sm" color="fg.default">
								{change.newValue}
							</Text>
						</Box>
					</Box>
				</Box>
			))}
		</Box>
	);
}

type UserTypeFilter = "all" | "human" | "vt";
type StatusFilter = "all" | "completed" | "in-progress" | "failed";

export default function ChangeLogPage() {
	const [entries] = useState<ChangeLogEntry[]>(INITIAL_CHANGE_LOG);
	const [searchFilter, setSearchFilter] = useState("");
	const [userTypeFilter, setUserTypeFilter] = useState<UserTypeFilter>("all");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const filtered = entries.filter((entry) => {
		if (searchFilter) {
			const q = searchFilter.toLowerCase();
			if (
				!entry.user.toLowerCase().includes(q) &&
				!entry.target.toLowerCase().includes(q) &&
				!entry.action.toLowerCase().includes(q)
			) {
				return false;
			}
		}
		if (userTypeFilter === "human" && entry.isVT) return false;
		if (userTypeFilter === "vt" && !entry.isVT) return false;
		if (statusFilter !== "all" && entry.status !== statusFilter) return false;
		return true;
	});

	const userTypeOptions = [
		{ label: "All Users", execute: () => setUserTypeFilter("all") },
		{ label: "Human", execute: () => setUserTypeFilter("human") },
		{
			label: "Virtual Teammate",
			execute: () => setUserTypeFilter("vt"),
		},
	];

	const statusOptions = [
		{ label: "All", execute: () => setStatusFilter("all") },
		{ label: "Completed", execute: () => setStatusFilter("completed") },
		{ label: "In Progress", execute: () => setStatusFilter("in-progress") },
		{ label: "Failed", execute: () => setStatusFilter("failed") },
	];

	const userTypeLabel =
		userTypeFilter === "all"
			? "All Users"
			: userTypeFilter === "human"
				? "Human"
				: "Virtual Teammate";

	const statusLabel =
		statusFilter === "all"
			? "All"
			: statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);

	return (
		<Box display="flex" flexDirection="column" gap="24">
			{/* Filters */}
			<Box display="flex" gap="12" alignItems="center">
				<Box flex="1" style={{ position: "relative", maxWidth: "266px" }}>
					<Input
						placeholder="Search by user, content, or action"
						value={searchFilter}
						onChange={(e) => setSearchFilter(e.target.value)}
						style={{ paddingLeft: "40px" }}
					/>
					<Box
						style={{
							position: "absolute",
							left: "12px",
							top: "50%",
							transform: "translateY(-50%)",
						}}
					>
						<IconSearch size={16} color="var(--ax-colors-fg-tertiary)" />
					</Box>
				</Box>

				<Menu options={userTypeOptions}>
					<MenuTrigger asChild>
						<LabelMenuButton label="User Type">
							{userTypeLabel}
						</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				<Menu options={statusOptions}>
					<MenuTrigger asChild>
						<LabelMenuButton label="Status">{statusLabel}</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>
			</Box>

			{/* Table */}
			<Table>
				<thead>
					<Tr>
						<Th style={{ width: "120px" }}>Time</Th>
						<Th style={{ width: "220px" }}>User</Th>
						<Th style={{ width: "160px" }}>Action</Th>
						<Th>Content</Th>
						<Th style={{ width: "120px" }}>Status</Th>
					</Tr>
				</thead>
				<tbody>
					{filtered.map((entry) => {
						const isExpanded = expandedId === entry.id;
						const hasChanges = entry.changes && entry.changes.length > 0;

						return (
							<React.Fragment key={entry.id}>
								<Tr
									onClick={
										hasChanges
											? () =>
												setExpandedId(
													isExpanded ? null : entry.id
												)
											: undefined
									}
									style={
										hasChanges ? { cursor: "pointer" } : undefined
									}
								>
									<Td>
										<Text fontSize="sm" color="fg.tertiary">
											{formatTime(entry.timestamp)}
										</Text>
									</Td>
									<Td>
										<Box
											display="flex"
											alignItems="center"
											gap="8"
										>
											{entry.isVT ? (
												<Box
													style={{
														width: 24,
														height: 24,
														borderRadius: "50%",
														overflow: "hidden",
														flexShrink: 0,
													}}
												>
													<img
														src={entry.userAvatar}
														alt={entry.user}
														width={24}
														height={24}
														style={{
															display: "block",
														}}
													/>
												</Box>
											) : (
												<IconUser
													size={16}
													color="var(--ax-colors-fg-tertiary)"
												/>
											)}
											<Box
												display="flex"
												flexDirection="column"
											>
												<Box
													display="flex"
													alignItems="center"
													gap="6"
												>
													<Text
														fontSize="sm"
														color="fg.default"
													>
														{entry.user}
													</Text>
													{entry.isVT && (
														<Badge
															intent="information"
															variant="subtle"
														>
															VT
														</Badge>
													)}
												</Box>
												{entry.vtTemplateName && (
													<Text
														fontSize="xs"
														color="fg.tertiary"
													>
														{entry.vtTemplateName}
													</Text>
												)}
											</Box>
										</Box>
									</Td>
									<Td>
										<Box
											display="flex"
											alignItems="center"
											gap="4"
										>
											{entry.isVT && (
												<IconSparkles
													size={14}
													color="var(--ax-colors-fg-tertiary)"
												/>
											)}
											<Text fontSize="sm" color="fg.default">
												{entry.action}
											</Text>
										</Box>
									</Td>
									<Td>
										<Box
											display="flex"
											alignItems="center"
											gap="6"
										>
											{hasChanges && (
												isExpanded ? (
													<IconChevronDown
														size={14}
														color="var(--ax-colors-fg-tertiary)"
													/>
												) : (
													<IconChevronRight
														size={14}
														color="var(--ax-colors-fg-tertiary)"
													/>
												)
											)}
											<Box
												display="flex"
												flexDirection="column"
											>
												<Text
													fontSize="sm"
													color="fg.default"
												>
													{entry.target}
												</Text>
												<Text
													fontSize="xs"
													color="fg.tertiary"
												>
													{entry.targetPath}
												</Text>
											</Box>
										</Box>
									</Td>
									<Td>
										<StatusBadge status={entry.status} />
									</Td>
								</Tr>
								{isExpanded && hasChanges && (
									<Tr>
										<Td
											colSpan={5}
											style={{
												padding: "0 16px 16px",
												background:
													"var(--ax-colors-bg-default)",
											}}
										>
											{entry.details && (
												<Text
													fontSize="sm"
													color="fg.tertiary"
													style={{
														paddingTop: 8,
														paddingBottom: 4,
													}}
												>
													{entry.details}
												</Text>
											)}
											<ChangesDiff
												changes={entry.changes!}
											/>
										</Td>
									</Tr>
								)}
							</React.Fragment>
						);
					})}
				</tbody>
			</Table>

			{filtered.length === 0 && (
				<Box py="32" display="flex" justifyContent="center">
					<Text fontSize="md" color="fg.tertiary">
						No entries match your filters.
					</Text>
				</Box>
			)}
		</Box>
	);
}
