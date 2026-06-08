"use client";

import { useState } from "react";
import {
	Box,
	Heading,
	Link,
	Menu,
	MenuContent,
	MenuTrigger,
	LabelMenuButton,
	Radio,
	RadioGroup,
	Switch,
	Text,
} from "@optiaxiom/react";

type Channel = "Email" | "In-app" | "Both";
const CHANNELS: Channel[] = ["Email", "In-app", "Both"];

const BILLING_ITEMS = [
	{ id: "cms", label: "CMS · Production", recipients: 4 },
	{ id: "cmp", label: "CMP · Marketing", recipients: 3 },
	{ id: "opal", label: "Opal AI · Org-wide", recipients: 2 },
	{ id: "connect", label: "Connect Platform · Default", recipients: 2 },
	{ id: "fe", label: "Frontend Hosting · Default", recipients: 1 },
	{ id: "org", label: "Org · Renewals & invoices", recipients: 5 },
];

const SYSTEM_ITEMS = [
	{
		id: "security",
		label: "Security Alerts",
		description: "Failed sign-ins, suspicious activity, password changes.",
	},
	{
		id: "provisioning",
		label: "User Provisioning",
		description: "New invitations, SCIM provisioning events.",
	},
	{
		id: "roles",
		label: "Role Changes",
		description: "Role and permission updates across products.",
	},
	{
		id: "seats",
		label: "Seat Threshold",
		description: "Warnings as seat usage approaches plan limit.",
	},
	{
		id: "certs",
		label: "Certificate Expiry",
		description: "SSO and custom domain certificate renewals.",
	},
	{
		id: "maintenance",
		label: "Maintenance",
		description: "Scheduled maintenance windows and downtime notices.",
	},
];

export default function NotificationSettingsPage() {
	const [billingOn, setBillingOn] = useState<Record<string, boolean>>(
		Object.fromEntries(BILLING_ITEMS.map((b) => [b.id, true])),
	);
	const [systemOn, setSystemOn] = useState<Record<string, boolean>>(
		Object.fromEntries(SYSTEM_ITEMS.map((s) => [s.id, true])),
	);
	const [systemChannel, setSystemChannel] = useState<Record<string, Channel>>(
		Object.fromEntries(SYSTEM_ITEMS.map((s) => [s.id, "Both" as Channel])),
	);
	const [digest, setDigest] = useState("realtime");
	const [quietHours, setQuietHours] = useState(false);
	const [quietRange, setQuietRange] = useState("9 PM – 8 AM");

	const setBilling = (id: string, v: boolean) =>
		setBillingOn((p) => ({ ...p, [id]: v }));
	const setSystem = (id: string, v: boolean) =>
		setSystemOn((p) => ({ ...p, [id]: v }));
	const setChannel = (id: string, c: Channel) =>
		setSystemChannel((p) => ({ ...p, [id]: c }));

	return (
		<Box>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
				<Box display="flex" alignItems="center" gap="12">
					<Heading level="2">Notifications</Heading>
					<Link href="#" fontSize="md">
						Learn more
					</Link>
				</Box>
			</Box>

			<Box mb="32">
				<Heading level="4">Billing notifications</Heading>
				<Text fontSize="sm" color="fg.secondary" mb="16">
					Get notified about invoices, seat usage, and renewals.
				</Text>
				<Box
					bg="bg.default"
					rounded="md"
					border="1"
					borderColor="border.tertiary"
				>
					{BILLING_ITEMS.map((item, i) => (
						<Box
							key={item.id}
							display="flex"
							alignItems="center"
							justifyContent="space-between"
							p="16"
							borderB={i === BILLING_ITEMS.length - 1 ? "0" : "1"}
							borderColor="border.tertiary"
						>
							<Box display="flex" alignItems="center" gap="12">
								<Switch
									checked={billingOn[item.id]}
									onCheckedChange={(v) => setBilling(item.id, Boolean(v))}
								/>
								<Text fontWeight="500" color="fg.default">
									{item.label}
								</Text>
							</Box>
							<Link href="#" fontSize="sm">
								Manage Recipients ({item.recipients})
							</Link>
						</Box>
					))}
				</Box>
			</Box>

			<Box mb="32">
				<Heading level="4">System notifications</Heading>
				<Text fontSize="sm" color="fg.secondary" mb="16">
					Operational alerts about your organization and products.
				</Text>
				<Box
					bg="bg.default"
					rounded="md"
					border="1"
					borderColor="border.tertiary"
				>
					{SYSTEM_ITEMS.map((item, i) => (
						<Box
							key={item.id}
							display="flex"
							alignItems="center"
							justifyContent="space-between"
							p="16"
							gap="16"
							borderB={i === SYSTEM_ITEMS.length - 1 ? "0" : "1"}
							borderColor="border.tertiary"
						>
							<Box display="flex" alignItems="center" gap="12" style={{ flex: 1 }}>
								<Switch
									checked={systemOn[item.id]}
									onCheckedChange={(v) => setSystem(item.id, Boolean(v))}
								/>
								<Box display="flex" flexDirection="column" gap="2">
									<Text fontWeight="500" color="fg.default">
										{item.label}
									</Text>
									<Text fontSize="sm" color="fg.tertiary">
										{item.description}
									</Text>
								</Box>
							</Box>
							<Box display="flex" alignItems="center" gap="16">
								<Menu
									options={CHANNELS.map((c) => ({
										label: c,
										execute: () => setChannel(item.id, c),
									}))}
								>
									<MenuTrigger asChild>
										<LabelMenuButton label="Channel">
											{systemChannel[item.id]}
										</LabelMenuButton>
									</MenuTrigger>
									<MenuContent />
								</Menu>
								<Link href="#" fontSize="sm">
									Manage Recipients
								</Link>
							</Box>
						</Box>
					))}
				</Box>
			</Box>

			<Box mb="32">
				<Heading level="4">Preferences</Heading>
				<Text fontSize="sm" color="fg.secondary" mb="16">
					Choose how often to receive notifications and when to be quiet.
				</Text>
				<Box
					bg="bg.default"
					rounded="md"
					border="1"
					borderColor="border.tertiary"
					p="20"
					display="flex"
					flexDirection="column"
					gap="20"
				>
					<Box display="flex" flexDirection="column" gap="8">
						<Text fontWeight="500" color="fg.default">
							Digest frequency
						</Text>
						<RadioGroup value={digest} onValueChange={setDigest}>
							<Radio value="realtime">Real-time</Radio>
							<Radio value="daily">Daily</Radio>
							<Radio value="weekly">Weekly</Radio>
						</RadioGroup>
					</Box>

					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						pt="16"
						borderT="1"
						borderColor="border.tertiary"
					>
						<Box display="flex" alignItems="center" gap="12">
							<Switch
								checked={quietHours}
								onCheckedChange={(v) => setQuietHours(Boolean(v))}
							/>
							<Box display="flex" flexDirection="column" gap="2">
								<Text fontWeight="500" color="fg.default">
									Quiet hours
								</Text>
								<Text fontSize="sm" color="fg.tertiary">
									Pause non-critical notifications during these hours.
								</Text>
							</Box>
						</Box>
						<Menu
							options={[
								"9 PM – 8 AM",
								"10 PM – 7 AM",
								"11 PM – 6 AM",
								"12 AM – 9 AM",
							].map((opt) => ({
								label: opt,
								execute: () => setQuietRange(opt),
							}))}
						>
							<MenuTrigger asChild>
								<LabelMenuButton label="Quiet hours">{quietRange}</LabelMenuButton>
							</MenuTrigger>
							<MenuContent />
						</Menu>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
