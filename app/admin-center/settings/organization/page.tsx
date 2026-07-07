"use client";

import { useState } from "react";
import {
	Badge,
	Box,
	Button,
	Heading,
	Link,
	Menu,
	MenuContent,
	MenuTrigger,
	LabelMenuButton,
	Text,
} from "@optiaxiom/react";
import {
	IconPen,
	IconCopy,
} from "@optiaxiom/icons";

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

const TABS = ["Overview", "Developer Access"] as const;
type Tab = (typeof TABS)[number];

export default function OrganizationSettingsPage() {
	const [primaryContact, setPrimaryContact] = useState(CONTACTS[0]);
	const [tab, setTab] = useState<Tab>("Overview");

	return (
		<Box>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
				<Box display="flex" alignItems="center" gap="12">
					<Heading level="2">Organization</Heading>
				</Box>
			</Box>

			<Box
				display="flex"
				gap="24"
				borderB="1"
				borderColor="border.tertiary"
				mb="24"
				flexWrap="wrap"
			>
				{TABS.map((t) => (
					<Box
						key={t}
						pb="12"
						cursor="pointer"
						borderB={tab === t ? "2" : "0"}
						onClick={() => setTab(t)}
						style={
							tab === t ? { borderBottomColor: "var(--ax-colors-fg-default)" } : {}
						}
					>
						<Text
							fontWeight={tab === t ? "600" : "400"}
							color={tab === t ? "fg.default" : "fg.tertiary"}
						>
							{t}
						</Text>
					</Box>
				))}
			</Box>

			{tab === "Developer Access" && <DeveloperAccessTab />}

			{tab === "Overview" && (
			<>
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

			</>
			)}
		</Box>
	);
}

function DeveloperAccessTab() {
	return (
		<Box style={{ maxWidth: 880 }}>
			<Heading level="4">Developer Access</Heading>
			<Text color="fg.secondary" mt="8" mb="24">
				This setting allows approved external developers to access OCP and build apps
				under your organization&rsquo;s vendor identity.
			</Text>

			<Box
				bg="bg.default"
				rounded="md"
				border="1"
				borderColor="border.tertiary"
				p="24"
				mb="24"
			>
				<Box
					display="flex"
					gap="48"
					alignItems="start"
					flexWrap="wrap"
					mb="16"
				>
					<Box display="flex" flexDirection="column" gap="12">
						<Text fontWeight="600" color="fg.default">
							Developer Access Status
						</Text>
						<Box>
							<Badge intent="success" variant="subtle">
								ACTIVE
							</Badge>
						</Box>
					</Box>
					<Box display="flex" flexDirection="column" gap="4">
						<Text fontSize="sm" color="fg.tertiary">
							Vendor name:
						</Text>
						<Text fontWeight="600" color="fg.default">
							technology_abc
						</Text>
					</Box>
				</Box>

				<Text fontSize="sm" color="fg.secondary">
					If this configuration is incorrect or needs to be updated, please contact your{" "}
					<Link href="mailto:support@optimizely.com" fontSize="sm">
						Optimizely Support
					</Link>{" "}
					representative.
				</Text>
			</Box>

			<Box bg="bg.information.subtle" rounded="md" p="24" style={{ maxWidth: 520 }}>
				<Text fontWeight="600" color="fg.default" mb="16">
					To grant developer access:
				</Text>
				<Box asChild>
					<ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
						{[
							"Go to User Management",
							"Invite the developer user",
							"Assign the OCP Developer role",
							"Send the invitation",
						].map((step) => (
							<li key={step}>
								<Text color="fg.default">{step}</Text>
							</li>
						))}
					</ol>
				</Box>
			</Box>
		</Box>
	);
}
