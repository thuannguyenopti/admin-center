"use client";

import { useState } from "react";
import {
	Badge,
	Box,
	Button,
	Heading,
	Link,
	EllipsisMenuButton,
	Menu,
	MenuContent,
	MenuTrigger,
	LabelMenuButton,
	Text,
} from "@optiaxiom/react";
import {
	IconPen,
	IconCopy,
	IconPlus,
} from "@optiaxiom/icons";

import { Table, Tr, Th, Td } from "@/app/components/Table";

type StatusRow = {
	label: string;
	value: string;
	intent: "success" | "warning" | "neutral" | "danger" | "information";
};

const STATUS_ROWS: StatusRow[] = [
	{ label: "Account Status", value: "Active", intent: "success" },
	{ label: "Subscription Status", value: "Active", intent: "success" },
	{ label: "SSO Status", value: "Configured", intent: "success" },
	{ label: "SCIM Status", value: "Disabled", intent: "neutral" },
	{ label: "MFA Status", value: "Required", intent: "warning" },
];

const PRODUCT_ROWS = [
	{ name: "CMS", instances: 3, status: "Active", contractEnd: "Dec 31, 2026" },
	{ name: "CMP", instances: 2, status: "Active", contractEnd: "Dec 31, 2026" },
	{ name: "Opal", instances: 1, status: "Active", contractEnd: "Mar 14, 2027" },
	{ name: "Connect Platform", instances: 1, status: "Active", contractEnd: "Oct 02, 2026" },
	{ name: "Frontend Hosting", instances: 1, status: "Trial", contractEnd: "Aug 18, 2026" },
];

type DomainRow = {
	domain: string;
	status: "Verified" | "Pending" | "Failed";
	added: string;
};

const DOMAIN_ROWS: DomainRow[] = [
	{ domain: "optimizely.com", status: "Verified", added: "Jan 04, 2024" },
	{ domain: "episerver.com", status: "Verified", added: "Jan 04, 2024" },
	{ domain: "welcome.optimizely.com", status: "Pending", added: "May 22, 2026" },
	{ domain: "partner.optimizely.com", status: "Failed", added: "Mar 11, 2026" },
];

type Contact = { name: string; phone: string; email: string };

const CONTACTS: Contact[] = [
	{ name: "Alex Morgan", phone: "+1 (415) 555-0119", email: "alex.morgan@optimizely.com" },
	{ name: "Jamie Singh", phone: "+1 (415) 555-0142", email: "jamie.singh@optimizely.com" },
	{ name: "Priya Patel", phone: "+44 20 7946 0218", email: "priya.patel@optimizely.com" },
	{ name: "Daniel Lee", phone: "+1 (415) 555-0204", email: "daniel.lee@optimizely.com" },
];

function FieldValue({
	label,
	value,
	action,
}: {
	label: string;
	value: React.ReactNode;
	action?: React.ReactNode;
}) {
	return (
		<Box display="flex" flexDirection="column" gap="4">
			<Text fontSize="sm" color="fg.tertiary">
				{label}
			</Text>
			<Box display="flex" alignItems="center" gap="8">
				<Text fontWeight="500">{value}</Text>
				{action}
			</Box>
		</Box>
	);
}

function domainIntent(s: DomainRow["status"]): "success" | "warning" | "danger" {
	if (s === "Verified") return "success";
	if (s === "Pending") return "warning";
	return "danger";
}

export default function OrganizationSettingsPage() {
	const [primaryContact, setPrimaryContact] = useState(CONTACTS[0]);

	return (
		<Box>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
				<Box display="flex" alignItems="center" gap="12">
					<Heading level="2">Organization</Heading>
					<Link href="#" fontSize="md">
						Learn more
					</Link>
				</Box>
			</Box>

			<Box mb="32">
				<Heading level="4">Profile</Heading>
				<Text fontSize="sm" color="fg.secondary" mb="16">
					Core information for your Optimizely organization.
				</Text>
				<Box
					bg="bg.default"
					rounded="md"
					border="1"
					borderColor="border.tertiary"
					p="20"
				>
					<Box display="grid" gap="20" style={{ gridTemplateColumns: "1fr 1fr" }}>
						<FieldValue
							label="Org Name"
							value="Optimizely, Inc."
							action={
								<Button appearance="subtle" size="sm" icon={<IconPen size={14} />}>
									Edit
								</Button>
							}
						/>
						<FieldValue
							label="Org ID"
							value="org_8c2b9f74-3a2d-4f12"
							action={
								<Button appearance="subtle" size="sm" icon={<IconCopy size={14} />}>
									Copy
								</Button>
							}
						/>
						<FieldValue label="Created" value="Jan 04, 2024" />
						<Box display="flex" flexDirection="column" gap="4">
							<Text fontSize="sm" color="fg.tertiary">
								Primary Contact
							</Text>
							<Box>
								<Menu
									options={CONTACTS.map((c) => ({
										label: c.name,
										description: `${c.phone} · ${c.email}`,
										execute: () => setPrimaryContact(c),
									}))}
								>
									<MenuTrigger asChild>
										<LabelMenuButton label="Primary Contact">
											{primaryContact.name}
										</LabelMenuButton>
									</MenuTrigger>
									<MenuContent />
								</Menu>
							</Box>
							<Box mt="4" display="flex" flexDirection="column" gap="2">
								<Text fontSize="sm" color="fg.secondary">
									{primaryContact.phone}
								</Text>
								<Text fontSize="sm" color="fg.secondary">
									{primaryContact.email}
								</Text>
							</Box>
						</Box>
						<Box display="flex" flexDirection="column" gap="4">
							<Text fontSize="sm" color="fg.tertiary">
								Support Tier
							</Text>
							<Box>
								<Badge intent="primary" variant="subtle">
									Premium
								</Badge>
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>

			<Box mb="32">
				<Heading level="4">Status indicators</Heading>
				<Text fontSize="sm" color="fg.secondary" mb="16">
					Quick view of account-wide configuration health.
				</Text>
				<Box
					bg="bg.default"
					rounded="md"
					border="1"
					borderColor="border.tertiary"
				>
					{STATUS_ROWS.map((row, i) => (
						<Box
							key={row.label}
							display="flex"
							alignItems="center"
							justifyContent="space-between"
							p="16"
							borderB={i === STATUS_ROWS.length - 1 ? "0" : "1"}
							borderColor="border.tertiary"
						>
							<Text fontWeight="500" color="fg.default">
								{row.label}
							</Text>
							<Box display="flex" alignItems="center" gap="16">
								<Badge intent={row.intent} variant="subtle">
									{row.value}
								</Badge>
								<Link href="#" fontSize="md">
									Manage
								</Link>
							</Box>
						</Box>
					))}
				</Box>
			</Box>

			<Box mb="32">
				<Heading level="4">Products</Heading>
				<Text fontSize="sm" color="fg.secondary" mb="16">
					Subscribed products and their contract terms.
				</Text>
				<Table>
					<thead>
						<Tr>
							<Th>Product</Th>
							<Th>Instances</Th>
							<Th>Status</Th>
							<Th>Contract End</Th>
						</Tr>
					</thead>
					<tbody>
						{PRODUCT_ROWS.map((p) => (
							<Tr key={p.name}>
								<Td>{p.name}</Td>
								<Td>{p.instances}</Td>
								<Td>
									<Badge
										intent={p.status === "Active" ? "success" : "warning"}
										variant="subtle"
									>
										{p.status}
									</Badge>
								</Td>
								<Td>{p.contractEnd}</Td>
							</Tr>
						))}
					</tbody>
				</Table>
			</Box>

			<Box mb="32">
				<Box display="flex" alignItems="center" justifyContent="space-between" mb="8">
					<Heading level="4">Domains</Heading>
					<Button
						appearance="primary"
						size="sm"
						addonBefore={<IconPlus size={14} />}
					>
						Add Domain
					</Button>
				</Box>
				<Text fontSize="sm" color="fg.secondary" mb="16">
					Verified domains are eligible for SSO and email branding.
				</Text>
				<Table>
					<thead>
						<Tr>
							<Th>Domain</Th>
							<Th>Verification status</Th>
							<Th>Date added</Th>
							<Th style={{ width: 60 }} />
						</Tr>
					</thead>
					<tbody>
						{DOMAIN_ROWS.map((d) => (
							<Tr key={d.domain}>
								<Td>{d.domain}</Td>
								<Td>
									<Badge intent={domainIntent(d.status)} variant="subtle">
										{d.status}
									</Badge>
								</Td>
								<Td>{d.added}</Td>
								<Td type="raw" style={{ width: 60 }}>
									<Box display="flex" justifyContent="end">
										<Menu
											options={[
												{ label: "View", execute: () => {} },
												{ label: "Verify", execute: () => {} },
												{
													intent: "danger",
													label: "Remove",
													execute: () => {},
												},
											]}
										>
											<MenuTrigger asChild>
												<EllipsisMenuButton
													appearance="subtle"
													size="sm"
													aria-label={`Actions for ${d.domain}`}
												/>
											</MenuTrigger>
											<MenuContent />
										</Menu>
									</Box>
								</Td>
							</Tr>
						))}
					</tbody>
				</Table>
			</Box>
		</Box>
	);
}
