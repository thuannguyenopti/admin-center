"use client";

import { useState } from "react";
import {
	Alert,
	Badge,
	Box,
	Button,
	Heading,
	Menu,
	MenuContent,
	MenuTrigger,
	LabelMenuButton,
	SegmentedControl,
	SegmentedControlItem,
	Switch,
	Text,
} from "@optiaxiom/react";
import {
	IconAngleDown,
	IconAngleRight,
	IconCopy,
	IconEye,
	IconPlus,
	IconArrowRotateLeft as IconRefresh,
} from "@optiaxiom/icons";

import { Table, Tr, Th, Td } from "@/app/components/Table";

type IdpType = "SAML 2.0" | "OIDC";

type Connection = {
	id: string;
	name: string;
	type: IdpType;
	entityId: string;
	loginUrl: string;
	certStatus: string;
	active: boolean;
};

type Domain = {
	id: string;
	domain: string;
	status: "Verified" | "Pending";
	addedOn: string;
};

const INITIAL_CONNECTIONS: Connection[] = [
	{
		id: "c1",
		name: "Okta Production",
		type: "SAML 2.0",
		entityId: "https://www.okta.com/exk1abcd",
		loginUrl: "https://acme.okta.com/app/optimizely/sso/saml",
		certStatus: "Valid · expires 2027-04-12",
		active: true,
	},
	{
		id: "c2",
		name: "Azure AD",
		type: "OIDC",
		entityId: "azure-prod-tenant",
		loginUrl: "https://login.microsoftonline.com/tenant/oauth2/v2.0/authorize",
		certStatus: "Valid · expires 2026-11-03",
		active: true,
	},
];

const INITIAL_DOMAINS: Domain[] = [
	{ id: "d1", domain: "optimizely.com", status: "Verified", addedOn: "Jan 12, 2025" },
	{ id: "d2", domain: "episerver.com", status: "Verified", addedOn: "Jan 14, 2025" },
	{ id: "d3", domain: "acme-eu.com", status: "Pending", addedOn: "May 28, 2026" },
	{ id: "d4", domain: "labs.optimizely.io", status: "Verified", addedOn: "Mar 03, 2026" },
];

export default function AuthenticationPage() {
	const [activeTab, setActiveTab] = useState<"sso" | "domains" | "scim">("sso");

	// SSO state
	const [connections, setConnections] = useState<Connection[]>(INITIAL_CONNECTIONS);
	const [expandedConn, setExpandedConn] = useState<string | null>("c1");
	const [selectiveLocal, setSelectiveLocal] = useState(true);
	const [mfaEnabled, setMfaEnabled] = useState(true);
	const [mfaMode, setMfaMode] = useState<"required" | "optional">("required");
	const [mfaGrace, setMfaGrace] = useState("7 days");

	// Domains state
	const [domains] = useState<Domain[]>(INITIAL_DOMAINS);
	const [dynProv, setDynProv] = useState(true);
	const [defaultRole, setDefaultRole] = useState("Member");
	const [defaultGroup, setDefaultGroup] = useState("All Users");

	// SCIM state
	const [scimOn, setScimOn] = useState(false);
	const [tokenVisible, setTokenVisible] = useState(false);

	const addConnection = (type: IdpType) => {
		const id = `c-${Date.now()}`;
		setConnections((c) => [
			...c,
			{
				id,
				name: `New ${type} Connection`,
				type,
				entityId: "—",
				loginUrl: "—",
				certStatus: "Not configured",
				active: false,
			},
		]);
		setExpandedConn(id);
	};

	const removeConnection = (id: string) => {
		setConnections((c) => c.filter((x) => x.id !== id));
		if (expandedConn === id) setExpandedConn(null);
	};

	return (
		<Box>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
				<Box display="flex" alignItems="center" gap="12">
					<Heading level="2">Authentication</Heading>
				</Box>
			</Box>

			<Box display="flex" gap="24" borderB="1" borderColor="border.tertiary" mb="24">
				{(["sso", "domains", "scim"] as const).map((tab) => (
					<Box
						key={tab}
						pb="12"
						cursor="pointer"
						borderB={activeTab === tab ? "2" : "0"}
						onClick={() => setActiveTab(tab)}
						style={activeTab === tab ? { borderBottomColor: "var(--ax-colors-fg-default)" } : {}}
					>
						<Text
							fontWeight={activeTab === tab ? "500" : "400"}
							color={activeTab === tab ? "fg.default" : "fg.tertiary"}
						>
							{tab === "sso" ? "SSO" : tab === "domains" ? "Domains" : "SCIM"}
						</Text>
					</Box>
				))}
			</Box>

			{activeTab === "sso" && (
				<Box display="flex" flexDirection="column" gap="24">
					<Alert intent="information" rounded="md">
						<Text fontSize="sm" color="fg.secondary">
							When SSO is enabled, all users must authenticate via the SSO provider. Configure MFA in your IDP for additional security.
						</Text>
					</Alert>

					<Box display="flex" alignItems="center" justifyContent="space-between">
						<Heading level="4">SSO Connections</Heading>
						<Menu
							options={[
								{ label: "SAML 2.0", execute: () => addConnection("SAML 2.0") },
								{ label: "OIDC", execute: () => addConnection("OIDC") },
							]}
						>
							<MenuTrigger asChild>
								<LabelMenuButton label="Add SSO Connection">Select type</LabelMenuButton>
							</MenuTrigger>
							<MenuContent />
						</Menu>
					</Box>

					<Box display="flex" flexDirection="column" gap="12">
						{connections.map((c) => {
							const isOpen = expandedConn === c.id;
							return (
								<Box
									key={c.id}
									rounded="md"
									border="1"
									borderColor="border.tertiary"
									bg="bg.default"
								>
									<Box
										p="16"
										display="flex"
										alignItems="center"
										gap="12"
										cursor="pointer"
										onClick={() => setExpandedConn(isOpen ? null : c.id)}
									>
										<Button
											appearance="subtle"
											size="sm"
											icon={isOpen ? <IconAngleDown /> : <IconAngleRight />}
											aria-label={isOpen ? "Collapse" : "Expand"}
											onClick={(e) => {
												e.stopPropagation();
												setExpandedConn(isOpen ? null : c.id);
											}}
										/>
										<Badge variant="subtle">{c.type}</Badge>
										<Text fontWeight="500" color="fg.default">
											{c.name}
										</Text>
										<Text fontSize="sm" color="fg.tertiary">
											{c.entityId}
										</Text>
										<Box style={{ marginLeft: "auto" }}>
											<Badge intent={c.active ? "success" : "neutral"} variant="subtle">
												{c.active ? "Active" : "Inactive"}
											</Badge>
										</Box>
									</Box>
									{isOpen && (
										<Box
											p="16"
											borderT="1"
											borderColor="border.tertiary"
											display="flex"
											flexDirection="column"
											gap="12"
										>
											<Box display="grid" gap="12" style={{ gridTemplateColumns: "1fr 1fr" }}>
												<Box>
													<Text fontSize="sm" color="fg.tertiary">
														Entity ID
													</Text>
													<Text fontWeight="500">{c.entityId}</Text>
												</Box>
												<Box>
													<Text fontSize="sm" color="fg.tertiary">
														Login URL
													</Text>
													<Text fontWeight="500">{c.loginUrl}</Text>
												</Box>
												<Box>
													<Text fontSize="sm" color="fg.tertiary">
														Certificate
													</Text>
													<Text fontWeight="500">{c.certStatus}</Text>
												</Box>
											</Box>
											<Box display="flex" gap="8">
												<Button appearance="default" size="sm">
													Edit
												</Button>
												<Button
													appearance="default"
													size="sm"
													onClick={() => removeConnection(c.id)}
												>
													Delete
												</Button>
												<Button appearance="subtle" size="sm">
													Test Connection
												</Button>
											</Box>
										</Box>
									)}
								</Box>
							);
						})}
					</Box>

					<Box
						p="20"
						rounded="md"
						border="1"
						borderColor="border.tertiary"
						bg="bg.default"
						display="flex"
						alignItems="start"
						gap="16"
					>
						<Switch checked={selectiveLocal} onCheckedChange={setSelectiveLocal} />
						<Box>
							<Text fontWeight="500">Selective Local Login</Text>
							<Text fontSize="sm" color="fg.tertiary">
								Allow specific users to bypass SSO and authenticate with a local password.
							</Text>
						</Box>
					</Box>

					<Box
						p="20"
						rounded="md"
						border="1"
						borderColor="border.tertiary"
						bg="bg.default"
						display="flex"
						flexDirection="column"
						gap="16"
					>
						<Box display="flex" alignItems="start" gap="16">
							<Switch checked={mfaEnabled} onCheckedChange={setMfaEnabled} />
							<Box>
								<Text fontWeight="500">Multi-factor Authentication</Text>
								<Text fontSize="sm" color="fg.tertiary">
									Require a second authentication factor for sensitive actions.
								</Text>
							</Box>
						</Box>
						{mfaEnabled && (
							<Box display="flex" alignItems="center" gap="16" pl="40">
								<SegmentedControl
									type="single"
									value={mfaMode}
									onValueChange={(v: string) => v && setMfaMode(v as "required" | "optional")}
								>
									<SegmentedControlItem value="required">Required</SegmentedControlItem>
									<SegmentedControlItem value="optional">Optional</SegmentedControlItem>
								</SegmentedControl>
								<Menu
									options={["1 day", "7 days", "14 days", "30 days"].map((d) => ({
										label: d,
										execute: () => setMfaGrace(d),
									}))}
								>
									<MenuTrigger asChild>
										<LabelMenuButton label="Grace period">{mfaGrace}</LabelMenuButton>
									</MenuTrigger>
									<MenuContent />
								</Menu>
							</Box>
						)}
					</Box>
				</Box>
			)}

			{activeTab === "domains" && (
				<Box display="flex" flexDirection="column" gap="24">
					<Box display="flex" alignItems="center" justifyContent="space-between">
						<Heading level="4">Verified Domains</Heading>
						<Button appearance="primary" size="sm" icon={<IconPlus />}>
							Add Domain
						</Button>
					</Box>

					<Table>
						<thead>
							<Tr>
								<Th>Domain</Th>
								<Th>Status</Th>
								<Th>Date added</Th>
								<Th style={{ width: 60 }} />
							</Tr>
						</thead>
						<tbody>
							{domains.map((d) => (
								<Tr key={d.id}>
									<Td>{d.domain}</Td>
									<Td>
										<Badge
											intent={d.status === "Verified" ? "success" : "warning"}
											variant="subtle"
										>
											{d.status}
										</Badge>
									</Td>
									<Td>{d.addedOn}</Td>
									<Td type="raw" style={{ width: 60 }}>
										<Box display="flex" justifyContent="end">
											<Menu
												options={[
													{ label: "View", execute: () => {} },
													{ label: "Verify", execute: () => {} },
													{ intent: "danger", label: "Remove", execute: () => {} },
												]}
											>
												<MenuTrigger asChild>
													<Button appearance="subtle" size="sm">
														⋯
													</Button>
												</MenuTrigger>
												<MenuContent />
											</Menu>
										</Box>
									</Td>
								</Tr>
							))}
						</tbody>
					</Table>

					<Box
						p="20"
						rounded="md"
						border="1"
						borderColor="border.tertiary"
						bg="bg.default"
						display="flex"
						flexDirection="column"
						gap="16"
					>
						<Box display="flex" alignItems="start" gap="16">
							<Switch checked={dynProv} onCheckedChange={setDynProv} />
							<Box>
								<Text fontWeight="500">Dynamic provisioning</Text>
								<Text fontSize="sm" color="fg.tertiary">
									Automatically create user accounts on first SSO login from a verified domain.
								</Text>
							</Box>
						</Box>
						{dynProv && (
							<Box display="flex" alignItems="center" gap="12" pl="40">
								<Menu
									options={["Member", "Admin", "Viewer"].map((r) => ({
										label: r,
										execute: () => setDefaultRole(r),
									}))}
								>
									<MenuTrigger asChild>
										<LabelMenuButton label="Default role">{defaultRole}</LabelMenuButton>
									</MenuTrigger>
									<MenuContent />
								</Menu>
								<Menu
									options={["All Users", "Marketing", "Engineering", "Sales"].map((g) => ({
										label: g,
										execute: () => setDefaultGroup(g),
									}))}
								>
									<MenuTrigger asChild>
										<LabelMenuButton label="Default group">{defaultGroup}</LabelMenuButton>
									</MenuTrigger>
									<MenuContent />
								</Menu>
							</Box>
						)}
					</Box>
				</Box>
			)}

			{activeTab === "scim" && (
				<Box display="flex" flexDirection="column" gap="24">
					<Box
						p="20"
						rounded="md"
						border="1"
						borderColor="border.tertiary"
						bg="bg.default"
						display="flex"
						alignItems="start"
						gap="16"
					>
						<Switch checked={scimOn} onCheckedChange={setScimOn} />
						<Box>
							<Text fontWeight="500">Enable SCIM</Text>
							<Text fontSize="sm" color="fg.tertiary">
								Allow your identity provider to sync users and groups via SCIM 2.0.
							</Text>
						</Box>
					</Box>

					{scimOn && (
						<Box
							p="20"
							rounded="md"
							border="1"
							borderColor="border.tertiary"
							bg="bg.default"
							display="flex"
							flexDirection="column"
							gap="16"
						>
							<Box>
								<Text fontSize="sm" color="fg.tertiary" mb="4">
									SCIM Base URL
								</Text>
								<Box display="flex" alignItems="center" gap="8">
									<Box
										flex="1"
										p="8"
										rounded="sm"
										bg="bg.tertiary"
										style={{ fontFamily: "monospace", fontSize: 13 }}
									>
										https://api.optimizely.com/scim/v2/tenants/acme
									</Box>
									<Button appearance="subtle" size="sm" icon={<IconCopy />}>
										Copy
									</Button>
								</Box>
							</Box>

							<Box>
								<Text fontSize="sm" color="fg.tertiary" mb="4">
									Bearer Token
								</Text>
								<Box display="flex" alignItems="center" gap="8">
									<Box
										flex="1"
										p="8"
										rounded="sm"
										bg="bg.tertiary"
										style={{ fontFamily: "monospace", fontSize: 13 }}
									>
										{tokenVisible
											? "scim_tok_9f8e7d6c5b4a3210fedcba9876543210"
											: "••••••••••••••••••••••••••••••"}
									</Box>
									<Button
										appearance="subtle"
										size="sm"
										icon={<IconEye />}
										onClick={() => setTokenVisible((v) => !v)}
									>
										{tokenVisible ? "Hide" : "Show"}
									</Button>
									<Button appearance="subtle" size="sm" icon={<IconRefresh />}>
										Regenerate
									</Button>
								</Box>
							</Box>

							<Box
								display="flex"
								alignItems="center"
								gap="16"
								pt="12"
								borderT="1"
								borderColor="border.tertiary"
							>
								<Box>
									<Text fontSize="sm" color="fg.tertiary">
										Last sync
									</Text>
									<Text fontWeight="500">2 min ago</Text>
								</Box>
								<Box>
									<Text fontSize="sm" color="fg.tertiary">
										Sync status
									</Text>
									<Badge intent="success" variant="subtle">
										Healthy
									</Badge>
								</Box>
							</Box>
						</Box>
					)}
				</Box>
			)}
		</Box>
	);
}
