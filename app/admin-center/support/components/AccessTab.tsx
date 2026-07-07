"use client";

import { useMemo, useState } from "react";
import { Box, Button, SearchInput, Text, toaster } from "@optiaxiom/react";
import { IconArrowUpRightFromSquare, IconTrashCan } from "@optiaxiom/icons";
import { Table, Tr, Th, Td } from "@/app/components/Table";

type OrgAccess = {
	id: string;
	org: string;
	levels: string[];
	revokeDate: string;
};

const ORG_ACCESS: OrgAccess[] = [
	{
		id: "org-1",
		org: "Optimizely Organization",
		revokeDate: "6/20/2026, 10:02:38 PM",
		levels: [
			"Admin Center | Prep | Super Admin",
			"Data Platform | Sample Instance used in Wiki Documentation | Integrator",
			"Data Platform | Sample Instance used in Wiki Documentation | Analyst",
			"Developer Portal (CMS) (Dev) | DXP Project - opor01mstr - 1d30",
			"Episerver DXC API | Episerver DXC API - opor01mstr - f87e",
			"Experimentation | Experimentation Project Testing | Administrator",
			"Graph | Content Graph - Cass Crawford - 5dae | Administrator",
			"Lee Test | Lee test - 09 | Cass Lee Test Role",
			"Optimizely AI Service | OptiID prep AI",
			"Reporting | Optimizely Reporting",
		],
	},
	{
		id: "org-2",
		org: "Admin Center Cypress Testing",
		revokeDate: "5/1/2026, 12:56:39 PM",
		levels: ["Admin Center | Admin Center | Products Reader"],
	},
];

export function AccessTab() {
	const [search, setSearch] = useState("");
	const [orgs, setOrgs] = useState<OrgAccess[]>(ORG_ACCESS);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return q ? orgs.filter((o) => o.org.toLowerCase().includes(q)) : orgs;
	}, [orgs, search]);

	const removeOrg = (id: string) => {
		setOrgs((list) => list.filter((o) => o.id !== id));
		toaster.create("Organization access removed", { intent: "success" });
	};

	return (
		<Box display="flex" flexDirection="column" gap="16">
			<Box display="flex" alignItems="center" justifyContent="space-between" gap="16">
				<Box style={{ width: 360 }}>
					<SearchInput
						size="lg"
						placeholder="Search organizations by name..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</Box>
				<Button
					appearance="primary"
					onClick={() =>
						toaster.create("Add organization access — coming soon", {
							intent: "neutral",
						})
					}
				>
					Add organization access...
				</Button>
			</Box>

			<Table>
				<thead>
					<Tr>
						<Th style={{ width: 280 }}>Organization</Th>
						<Th>Access Level</Th>
						<Th style={{ width: 220 }}>Revoke Date</Th>
						<Th style={{ width: 56 }} />
					</Tr>
				</thead>
				<tbody>
					{filtered.length === 0 ? (
						<tr>
							<td colSpan={4}>
								<Box p="32" textAlign="center">
									<Text color="fg.tertiary">No organizations match your search.</Text>
								</Box>
							</td>
						</tr>
					) : (
						filtered.map((o) => (
							<Tr key={o.id}>
								<Td style={{ verticalAlign: "top" }}>
									<Text fontWeight="500" color="fg.default">
										{o.org}
									</Text>
								</Td>
								<Td>
									<Box display="flex" flexDirection="column">
										{o.levels.map((lvl, i) => (
											<Box
												key={lvl}
												display="flex"
												alignItems="center"
												gap="8"
												py="12"
												borderB={i < o.levels.length - 1 ? "1" : "0"}
												borderColor="border.tertiary"
											>
												<IconArrowUpRightFromSquare
													size={14}
													color="var(--ax-colors-fg-secondary)"
												/>
												<Text color="fg.default">{lvl}</Text>
											</Box>
										))}
									</Box>
								</Td>
								<Td style={{ verticalAlign: "top" }}>
									<Text color="fg.default">{o.revokeDate}</Text>
								</Td>
								<Td type="raw" style={{ width: 56, verticalAlign: "top" }}>
									<Box display="flex" justifyContent="end">
										<Button
											appearance="subtle"
											size="sm"
											icon={<IconTrashCan size={16} />}
											aria-label={`Remove access for ${o.org}`}
											onClick={() => removeOrg(o.id)}
										/>
									</Box>
								</Td>
							</Tr>
						))
					)}
				</tbody>
			</Table>
		</Box>
	);
}
