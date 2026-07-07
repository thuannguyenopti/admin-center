"use client";

import { useState } from "react";
import {
	Banner,
	Box,
	Button,
	Heading,
	Input,
	SearchInput,
	Text,
	toaster,
} from "@optiaxiom/react";
import { AccessTab } from "./components/AccessTab";
import { SettingsTab } from "./components/SettingsTab";

const TABS = [
	"Access",
	"Settings",
	"Account Activation",
	"User Home Organization",
	"View User Permissions",
	"Usage & Billing",
] as const;
type Tab = (typeof TABS)[number];

export default function SupportPage() {
	const [tab, setTab] = useState<Tab>("Access");

	return (
		<Box>
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

			{tab === "Access" && <AccessTab />}
			{tab === "Settings" && <SettingsTab />}
			{tab === "Account Activation" && <AccountActivationTab />}
			{tab === "User Home Organization" && <UserHomeOrganizationTab />}
			{tab === "View User Permissions" && <ViewUserPermissionsTab />}
			{tab === "Usage & Billing" && <UsageBillingTab />}
		</Box>
	);
}

function AccountActivationTab() {
	const [email, setEmail] = useState("");
	const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{ maxWidth: 820 }}>
			<Heading level="3">Account Activation</Heading>
			<Text color="fg.secondary">
				Use this form to unlock a user or resend their invitation.
			</Text>

			<Box style={{ maxWidth: 520 }}>
				<Input
					value={email}
					placeholder="User email..."
					onChange={(e) => setEmail(e.target.value)}
				/>
			</Box>

			<Box display="flex" gap="12">
				<Button
					appearance="default"
					disabled={!valid}
					onClick={() => toaster.create("User unlocked", { intent: "success" })}
				>
					Unlock User
				</Button>
				<Button
					appearance="default"
					disabled={!valid}
					onClick={() => toaster.create("Invitation resent", { intent: "success" })}
				>
					Resend Invitation
				</Button>
			</Box>
		</Box>
	);
}

function UserHomeOrganizationTab() {
	const [email, setEmail] = useState("");
	const [org, setOrg] = useState("");
	const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{ maxWidth: 820 }}>
			<Heading level="3">User Home Organization</Heading>

			<Banner intent="warning">
				<Text fontSize="sm">
					To move a user from one organization to another, you must be an admin in both
					organizations. Otherwise, this action will result in a 403 permission error.
				</Text>
			</Banner>

			<Text color="fg.secondary">
				Use this form to get a user&rsquo;s home organization information.
			</Text>
			<Box style={{ maxWidth: 520 }}>
				<Input
					value={email}
					placeholder="User email..."
					onChange={(e) => setEmail(e.target.value)}
				/>
			</Box>
			<Box>
				<Button
					appearance="default"
					disabled={!emailValid}
					onClick={() =>
						toaster.create("Fetched user's home organization", { intent: "success" })
					}
				>
					Get User&rsquo;s Information
				</Button>
			</Box>

			<Text color="fg.secondary">
				Use this form to move a user from one home organization to another. Enter their
				email in the field above, then search for the new home organization in the field
				below.
			</Text>
			<Box style={{ maxWidth: 520 }}>
				<SearchInput
					size="lg"
					placeholder="Search for an organization by name..."
					value={org}
					onChange={(e) => setOrg(e.target.value)}
				/>
			</Box>
			<Box>
				<Button
					appearance="default"
					disabled={!emailValid || !org.trim()}
					onClick={() =>
						toaster.create("User's home organization updated", { intent: "success" })
					}
				>
					Update User&rsquo;s Home Organization
				</Button>
			</Box>
		</Box>
	);
}

function ViewUserPermissionsTab() {
	const [email, setEmail] = useState("");
	const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{ maxWidth: 820 }}>
			<Heading level="3">User Permissions</Heading>
			<Text color="fg.secondary">
				Use this form to view all of the permissions assigned to a user.
			</Text>
			<Box style={{ maxWidth: 520 }}>
				<Input
					value={email}
					placeholder="User email..."
					onChange={(e) => setEmail(e.target.value)}
				/>
			</Box>
			<Box>
				<Button
					appearance="default"
					disabled={!valid}
					onClick={() =>
						toaster.create("Fetched user permissions", { intent: "success" })
					}
				>
					Get User Permissions
				</Button>
			</Box>
		</Box>
	);
}

function UsageBillingTab() {
	const [org, setOrg] = useState("");

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{ maxWidth: 820 }}>
			<Heading level="3">Usage &amp; Billing</Heading>
			<Text color="fg.secondary">
				Use this form to look up usage and billing details for an organization.
			</Text>
			<Box style={{ maxWidth: 520 }}>
				<SearchInput
					size="lg"
					placeholder="Search for an organization by name..."
					value={org}
					onChange={(e) => setOrg(e.target.value)}
				/>
			</Box>
			<Box>
				<Button
					appearance="default"
					disabled={!org.trim()}
					onClick={() =>
						toaster.create("Fetched usage & billing details", { intent: "success" })
					}
				>
					Get Usage &amp; Billing
				</Button>
			</Box>
		</Box>
	);
}
