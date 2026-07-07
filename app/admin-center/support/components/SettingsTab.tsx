"use client";

import { useMemo, useState } from "react";
import {
	Banner,
	Box,
	Button,
	Heading,
	Input,
	SearchInput,
	Switch,
	Text,
	Tooltip,
	toaster,
} from "@optiaxiom/react";
import { IconCircleInfo } from "@optiaxiom/icons";
import { BulkModalShell } from "../../user-management/users/components/bulk/BulkModalShell";

type OrgRow = {
	id: string;
	name: string;
	active: boolean;
	vendor: string;
	/** Org has published apps / developer data — disabling needs confirmation. */
	hasData: boolean;
};

const INITIAL_ORGS: OrgRow[] = [
	{ id: "optimizely", name: "Optimizely Organization", active: false, vendor: "", hasData: false },
	{ id: "abc", name: "ABC Organization", active: true, vendor: "TECHNOLOGY_ABC", hasData: true },
	{ id: "acme", name: "Acme Corporation", active: false, vendor: "", hasData: false },
	{ id: "globex", name: "Globex Industries", active: false, vendor: "", hasData: false },
	{ id: "initech", name: "Initech Solutions", active: false, vendor: "", hasData: false },
];

const MAX_LEN = 32;
const VENDOR_RE = /^[a-z0-9._]*$/;

export function SettingsTab() {
	const [query, setQuery] = useState("");
	const [orgs, setOrgs] = useState<OrgRow[]>(INITIAL_ORGS);
	/** Org currently being edited in the vendor-name modal (null = closed). */
	const [editingId, setEditingId] = useState<string | null>(null);
	/** Whether the open modal is editing an existing vendor (vs. first enable). */
	const [isEditing, setIsEditing] = useState(false);
	/** Org pending the disable-access confirmation (null = closed). */
	const [disablingId, setDisablingId] = useState<string | null>(null);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return q ? orgs.filter((o) => o.name.toLowerCase().includes(q)) : orgs;
	}, [orgs, query]);

	const editingOrg = orgs.find((o) => o.id === editingId) ?? null;
	const disablingOrg = orgs.find((o) => o.id === disablingId) ?? null;

	const disableOrg = (id: string) => {
		setOrgs((prev) =>
			prev.map((o) => (o.id === id ? { ...o, active: false, vendor: "" } : o)),
		);
	};

	const handleToggle = (org: OrgRow, next: boolean) => {
		if (next) {
			// Turning on → require a vendor name first.
			setIsEditing(false);
			setEditingId(org.id);
		} else if (org.hasData) {
			// Turning off an org with data → confirm first.
			setDisablingId(org.id);
		} else {
			// Turning off → clear vendor name.
			disableOrg(org.id);
		}
	};

	const handleSaveVendor = (vendor: string) => {
		if (!editingId) return;
		setOrgs((prev) =>
			prev.map((o) =>
				o.id === editingId ? { ...o, active: true, vendor } : o,
			),
		);
		setEditingId(null);
		toaster.create(
			isEditing ? "Vendor name updated" : "OCP developer access enabled",
			{ intent: "success" },
		);
	};

	return (
		<Box display="flex" flexDirection="column" gap="24" style={{ maxWidth: 820 }}>
			<Box style={{ maxWidth: 400 }}>
				<SearchInput
					placeholder="Search organizations by name..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
				/>
			</Box>

			<Box display="flex" alignItems="center" gap="8">
				<Heading level="3">Enable OCP Developer Access</Heading>
				<Tooltip content="Grant an organization access to the OCP developer tools and app ownership.">
					<span style={{ display: "inline-flex" }}>
						<IconCircleInfo size={16} color="var(--ax-colors-fg-tertiary)" />
					</span>
				</Tooltip>
			</Box>

			<Box display="flex" flexDirection="column" gap="20">
				{filtered.map((org) => (
					<Box key={org.id} display="flex" alignItems="center" gap="16">
						<Text style={{ width: 220, flexShrink: 0 }}>{org.name}</Text>
						<Switch
							checked={org.active}
							onCheckedChange={(v) => handleToggle(org, Boolean(v))}
						/>
						<Text color="fg.secondary" style={{ width: 64, flexShrink: 0 }}>
							{org.active ? "Active" : "Inactive"}
						</Text>
						{org.active && (
							<Box display="flex" alignItems="center" gap="8">
								<Text color="fg.secondary">Vendor:</Text>
								<Text fontWeight="500">{org.vendor}</Text>
								<Button
									appearance="default"
									size="sm"
									onClick={() => {
										setIsEditing(true);
										setEditingId(org.id);
									}}
								>
									Edit
								</Button>
							</Box>
						)}
					</Box>
				))}
				{filtered.length === 0 && (
					<Text color="fg.tertiary">No organizations match your search.</Text>
				)}
			</Box>

			{editingOrg && (
				<VendorNameModal
					initialValue={editingOrg.vendor}
					isEditing={isEditing}
					onClose={() => setEditingId(null)}
					onSave={handleSaveVendor}
				/>
			)}

			{disablingOrg && (
				<DisableAccessModal
					onClose={() => setDisablingId(null)}
					onConfirm={() => {
						disableOrg(disablingOrg.id);
						setDisablingId(null);
						toaster.create("OCP developer access disabled", {
							intent: "success",
						});
					}}
				/>
			)}
		</Box>
	);
}

function VendorNameModal({
	initialValue,
	isEditing,
	onClose,
	onSave,
}: {
	initialValue: string;
	isEditing: boolean;
	onClose: () => void;
	onSave: (vendor: string) => void;
}) {
	const [value, setValue] = useState(initialValue);
	const trimmed = value.trim();
	const valid =
		trimmed.length > 0 && trimmed.length <= MAX_LEN && VENDOR_RE.test(trimmed);

	return (
		<BulkModalShell
			title="Vendor name"
			onClose={onClose}
			height="auto"
			footer={
				<>
					<Button appearance="default" onClick={onClose}>
						Cancel
					</Button>
					<Button
						appearance="primary"
						disabled={!valid}
						onClick={() => onSave(trimmed)}
					>
						Save
					</Button>
				</>
			}
		>
			<Box display="flex" flexDirection="column" gap="16" pt="8">
				<Text color="fg.secondary">
					This vendor name will be used to identify the organization in OCP developer
					access and app ownership.
				</Text>

				{isEditing && (
					<Banner intent="warning">
						<Text fontSize="sm">
							Changing the Vendor Name may impact published apps, existing app
							ownership, and developer access mapping in OCP.
						</Text>
					</Banner>
				)}

				<Input
					value={value}
					placeholder="Enter Vendor name"
					maxLength={MAX_LEN}
					onChange={(e) =>
						setValue(e.target.value.slice(0, MAX_LEN))
					}
					addonAfter={
						<Text fontSize="sm" color="fg.tertiary">
							{value.length}/{MAX_LEN}
						</Text>
					}
				/>

				<Box>
					<Text fontSize="sm" color="fg.secondary">
						Max {MAX_LEN} characters, allowed:
					</Text>
					<Box asChild>
						<ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>
							{[
								"Lowercase letters",
								"Numbers",
								"Periods (.)",
								"Underscores (_)",
							].map((rule) => (
								<li key={rule}>
									<Text fontSize="sm" color="fg.secondary">
										{rule}
									</Text>
								</li>
							))}
						</ul>
					</Box>
				</Box>
			</Box>
		</BulkModalShell>
	);
}

function DisableAccessModal({
	onClose,
	onConfirm,
}: {
	onClose: () => void;
	onConfirm: () => void;
}) {
	return (
		<BulkModalShell
			title="Disable Developer Access?"
			onClose={onClose}
			height="auto"
			footer={
				<>
					<Button appearance="default" onClick={onClose}>
						Cancel
					</Button>
					<Button appearance="danger" onClick={onConfirm}>
						Disable access
					</Button>
				</>
			}
		>
			<Box display="flex" flexDirection="column" gap="16" pt="8">
				<Text color="fg.secondary">
					Disabling Developer Access will revoke OCP developer access for this
					organization.
				</Text>

				<Box>
					<Text color="fg.secondary">
						Users assigned to developer roles{" "}
						<Text asChild fontWeight="600" color="fg.default">
							<span>will no longer be able to:</span>
						</Text>
					</Text>
					<Box asChild>
						<ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>
							{[
								"log in to OCP dev portal",
								"build apps",
								"manage existing developer applications",
							].map((item) => (
								<li key={item}>
									<Text color="fg.secondary">{item}</Text>
								</li>
							))}
						</ul>
					</Box>
				</Box>
			</Box>
		</BulkModalShell>
	);
}
