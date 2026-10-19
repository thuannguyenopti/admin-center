"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Box, Button, Heading, Text } from "@optiaxiom/react";
import { IconAngleDown, IconUsers } from "@optiaxiom/icons";
import { AccessCard } from "../ProductAccessStep";
import { CollapsibleUserList } from "./CollapsibleUserList";
import { InviteOptions } from "./StepReview";
import type { AccessCluster, InvitedUser } from "./types";

const USER_PREVIEW_LIMIT = 5;

export function BulkReviewStep({
	users,
	clusters,
	requireAccept,
	setRequireAccept,
	sendEmail,
	setSendEmail,
}: {
	users: InvitedUser[];
	clusters: AccessCluster[];
	requireAccept: boolean;
	setRequireAccept: (v: boolean) => void;
	sendEmail: boolean;
	setSendEmail: (v: boolean) => void;
}) {
	const usersByEmail = useMemo(() => {
		const map = new Map(users.map((u) => [u.email, u]));
		return map;
	}, [users]);

	const assigned = useMemo(() => {
		const set = new Set<string>();
		for (const c of clusters) {
			for (const e of c.userEmails) set.add(e);
		}
		return set;
	}, [clusters]);

	const unassigned = useMemo(
		() => users.filter((u) => !assigned.has(u.email)),
		[users, assigned],
	);

	// All groups expanded by default so access is visible for review.
	const [openIds, setOpenIds] = useState<Set<string>>(
		() => new Set(clusters.map((c) => c.id)),
	);

	useEffect(() => {
		setOpenIds(new Set(clusters.map((c) => c.id)));
	}, [clusters]);

	const toggle = (id: string) => {
		setOpenIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const expandAll = () => setOpenIds(new Set(clusters.map((c) => c.id)));
	const collapseAll = () => setOpenIds(new Set());

	return (
		<Box display="flex" flexDirection="column" gap="20">
			<Box
				display="flex"
				alignItems="start"
				justifyContent="space-between"
				gap="12"
			>
				<Box display="flex" flexDirection="column" gap="4">
					<Heading level="4">Preview by batch</Heading>
					<Text fontSize="md" color="fg.secondary">
						{`${users.length} user${users.length === 1 ? "" : "s"} across ${clusters.length} batch${
							clusters.length === 1 ? "" : "es"
						}${
							unassigned.length > 0
								? ` · ${unassigned.length} without access`
								: ""
						}.`}
					</Text>
				</Box>
				{clusters.length > 1 && (
					<Box display="flex" gap="8">
						<Button appearance="subtle" size="sm" onClick={expandAll}>
							Expand all
						</Button>
						<Button appearance="subtle" size="sm" onClick={collapseAll}>
							Collapse all
						</Button>
					</Box>
				)}
			</Box>

			<Box display="flex" flexDirection="column" gap="12">
				{clusters.map((cluster) => {
					const open = openIds.has(cluster.id);
					const clusterUsers = cluster.userEmails
						.map((e) => usersByEmail.get(e))
						.filter(Boolean) as InvitedUser[];
					const accessRows = cluster.access.flatMap((entry) =>
						entry.instances.map((inst) => ({
							key: `${entry.id}-${inst.name}`,
							kind: entry.kind === "group" ? "Group" : "Product",
							name: entry.name,
							instance: inst.name,
							roles: inst.roles.join(", ") || "—",
						})),
					);

					return (
						<Box
							key={cluster.id}
							rounded="md"
							border="1"
							borderColor="border.default"
							bg="bg.default"
						>
							<Box
								display="flex"
								alignItems="center"
								gap="12"
								px="16"
								py="12"
								cursor="pointer"
								onClick={() => toggle(cluster.id)}
							>
								<IconUsers
									size={16}
									color="var(--ax-colors-fg-tertiary)"
								/>
								<Box flex="1" minW="0">
									<Box display="flex" alignItems="center" gap="8">
										<Text fontWeight="600">{cluster.label}</Text>
										<Badge variant="subtle">
											{cluster.userEmails.length} users
										</Badge>
										<Badge variant="subtle">
											{cluster.access.length} access
										</Badge>
									</Box>
									<Text fontSize="sm" color="fg.secondary">
										{accessRows.length > 0
											? accessRows
													.slice(0, 2)
													.map(
														(r) =>
															`${r.name} · ${r.instance} · ${r.roles}`,
													)
													.join(" · ")
											: "No access"}
										{accessRows.length > 2
											? ` · +${accessRows.length - 2} more`
											: ""}
									</Text>
								</Box>
								<Box
									style={{
										display: "inline-flex",
										transform: open ? "rotate(180deg)" : "rotate(0deg)",
										transition: "transform 150ms ease",
									}}
								>
									<IconAngleDown
										size={16}
										color="var(--ax-colors-fg-secondary)"
									/>
								</Box>
							</Box>
							{open && (
								<Box
									px="16"
									pb="16"
									pt="4"
									display="flex"
									flexDirection="column"
									gap="16"
									borderT="1"
									borderColor="border.tertiary"
								>
									<Box display="flex" flexDirection="column" gap="8">
										<Text fontSize="sm" fontWeight="600" color="fg.secondary">
											Access ({cluster.access.length})
										</Text>
										{cluster.access.length === 0 ? (
											<Text fontSize="sm" color="fg.tertiary">
												No access assigned to this batch.
											</Text>
										) : (
											cluster.access.map((entry) => (
												<AccessCard
													key={entry.id}
													entry={entry}
													defaultOpen
													readOnly
												/>
											))
										)}
									</Box>

									<Box display="flex" flexDirection="column" gap="8">
										<Text fontSize="sm" fontWeight="600" color="fg.secondary">
											Users ({clusterUsers.length})
										</Text>
										<CollapsibleUserList
											users={clusterUsers}
											limit={USER_PREVIEW_LIMIT}
										/>
									</Box>
								</Box>
							)}
						</Box>
					);
				})}

				{unassigned.length > 0 && (
					<Box
						rounded="md"
						border="1"
						borderColor="border.tertiary"
						bg="bg.page"
						p="16"
						display="flex"
						flexDirection="column"
						gap="12"
					>
						<Box display="flex" alignItems="center" gap="8">
							<Text fontWeight="600">No access assigned</Text>
							<Badge variant="subtle">{unassigned.length}</Badge>
						</Box>
						<Text fontSize="sm" color="fg.secondary">
							These users will be invited without product or group access. Go
							back to assign them to a batch if needed.
						</Text>
						<CollapsibleUserList users={unassigned} limit={4} />
					</Box>
				)}
			</Box>

			<InviteOptions
				requireAccept={requireAccept}
				setRequireAccept={setRequireAccept}
				sendEmail={sendEmail}
				setSendEmail={setSendEmail}
			/>
		</Box>
	);
}
