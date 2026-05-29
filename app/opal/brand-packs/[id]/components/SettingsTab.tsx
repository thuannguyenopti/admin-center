"use client";

import { useState } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import { IconCheck, IconTrashCan as IconTrash, IconBoxArchive as IconArchive } from "@optimizely/axiom-icons";
import type { BrandPack } from "../../types";

type SettingsTabProps = {
	pack: BrandPack;
};

function SettingsSection({ title, description, children }: {
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			gap="16"
			p="20"
			rounded="xl"
			shadow="sm"
		>
			<Box display="flex" flexDirection="column" gap="4">
				<Text fontWeight="600" style={{ fontSize: 14 }}>
					{title}
				</Text>
				{description && (
					<Text color="fg.secondary" fontSize="sm">
						{description}
					</Text>
				)}
			</Box>
			<Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)" }} />
			{children}
		</Box>
	);
}

function FieldRow({ label, hint, children }: {
	label: string;
	hint?: string;
	children: React.ReactNode;
}) {
	return (
		<Box alignItems="start" display="flex" gap="16" justifyContent="space-between" style={{ flexWrap: "wrap" }}>
			<Box display="flex" flexDirection="column" gap="2" style={{ maxWidth: 240 }}>
				<Text fontWeight="500" style={{ fontSize: 14 }}>{label}</Text>
				{hint && <Text color="fg.tertiary" fontSize="xs">{hint}</Text>}
			</Box>
			<Box style={{ flex: 1, minWidth: 200 }}>
				{children}
			</Box>
		</Box>
	);
}

export function SettingsTab({ pack }: SettingsTabProps) {
	const [name, setName] = useState(pack.name);
	const [description, setDescription] = useState(pack.description);
	const [sourceUrl, setSourceUrl] = useState(pack.sourceUrl ?? "");
	const [saved, setSaved] = useState(false);
	const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const handleSave = () => {
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	};

	const inputStyle = {
		background: "var(--ax-colors-bg-secondary)",
		border: "1.5px solid var(--ax-colors-border-default)",
		borderRadius: 8,
		color: "var(--ax-colors-fg-default)",
		fontFamily: "inherit",
		fontSize: 14,
		outline: "none",
		padding: "8px 12px",
		transition: "border-color 0.15s ease",
		width: "100%",
	};

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{ maxWidth: 680 }}>
			{/* General */}
			<SettingsSection
				title="General"
				description="Basic information about this brand pack."
			>
				<Box display="flex" flexDirection="column" gap="16">
					<FieldRow label="Pack name" hint="Shown in the brand pack list and picker">
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
							style={inputStyle}
							onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-accent)"; }}
							onBlur={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-default)"; }}
						/>
					</FieldRow>

					<FieldRow label="Description" hint="Optional summary of this pack's purpose">
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							style={{ ...inputStyle, resize: "vertical" }}
							onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-accent)"; }}
							onBlur={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-default)"; }}
						/>
					</FieldRow>

					<FieldRow label="Source URL" hint="Website used to generate this pack (optional)">
						<input
							value={sourceUrl}
							onChange={(e) => setSourceUrl(e.target.value)}
							placeholder="https://example.com"
							style={inputStyle}
							onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-accent)"; }}
							onBlur={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-default)"; }}
						/>
					</FieldRow>

					<Box display="flex" justifyContent="end">
						<Button
							appearance="primary"
							size="sm"
							icon={saved ? <IconCheck /> : undefined}
							onClick={handleSave}
						>
							{saved ? "Saved" : "Save changes"}
						</Button>
					</Box>
				</Box>
			</SettingsSection>

			{/* Status */}
			<SettingsSection
				title="Status"
				description="Control visibility and active state of this pack."
			>
				<Box display="flex" flexDirection="column" gap="12">
					{(["active", "published", "draft", "archived"] as const).map((status) => (
						<Box
							key={status}
							alignItems="center"
							display="flex"
							gap="12"
							justifyContent="space-between"
						>
							<Box display="flex" flexDirection="column" gap="2">
								<Text fontWeight="500" style={{ fontSize: 14, textTransform: "capitalize" }}>
									{status}
								</Text>
								<Text color="fg.tertiary" fontSize="xs">
									{status === "active" && "This pack is used by Opal for all content generation"}
									{status === "published" && "Available in the brand pack library but not active"}
									{status === "draft" && "Hidden from content generation until published"}
									{status === "archived" && "Retired pack — retained for reference only"}
								</Text>
							</Box>
							<Box
								alignItems="center"
								display="flex"
								justifyContent="center"
								rounded="full"
								style={{
									background: pack.status === status ? "var(--ax-colors-bg-accent)" : "var(--ax-colors-bg-secondary)",
									border: `2px solid ${pack.status === status ? "var(--ax-colors-border-accent)" : "var(--ax-colors-border-default)"}`,
									flexShrink: 0,
									height: 20,
									width: 20,
								}}
							>
								{pack.status === status && (
									<IconCheck size={10} style={{ color: "var(--ax-colors-fg-default-inverse)" }} />
								)}
							</Box>
						</Box>
					))}
				</Box>
			</SettingsSection>

			{/* Integrations */}
			{(pack.sourceFigma || pack.sourceUrl) && (
				<SettingsSection
					title="Integrations"
					description="Connected sources for this brand pack."
				>
					<Box display="flex" flexDirection="column" gap="12">
						{pack.sourceFigma && (
							<Box alignItems="center" display="flex" gap="12">
								<Box
									alignItems="center"
									bg="bg.secondary"
									display="flex"
									justifyContent="center"
									rounded="md"
									style={{ flexShrink: 0, height: 36, width: 36 }}
								>
									<Text fontWeight="700" style={{ color: "#0ACF83", fontSize: 13 }}>F</Text>
								</Box>
								<Box display="flex" flexDirection="column" gap="2" style={{ flex: 1, minWidth: 0 }}>
									<Text fontWeight="500" style={{ fontSize: 14 }}>Figma Library</Text>
									<Text color="fg.tertiary" fontSize="xs" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
										{pack.sourceFigma}
									</Text>
								</Box>
								<Button appearance="subtle" size="sm">Sync</Button>
							</Box>
						)}
						{pack.sourceUrl && (
							<Box alignItems="center" display="flex" gap="12">
								<Box
									alignItems="center"
									bg="bg.secondary"
									display="flex"
									justifyContent="center"
									rounded="md"
									style={{ flexShrink: 0, height: 36, width: 36 }}
								>
									<Text fontWeight="700" style={{ color: "var(--ax-colors-fg-accent)", fontSize: 13 }}>W</Text>
								</Box>
								<Box display="flex" flexDirection="column" gap="2" style={{ flex: 1, minWidth: 0 }}>
									<Text fontWeight="500" style={{ fontSize: 14 }}>Website</Text>
									<Text color="fg.tertiary" fontSize="xs" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
										{pack.sourceUrl}
									</Text>
								</Box>
								<Button appearance="subtle" size="sm">Re-sync</Button>
							</Box>
						)}
					</Box>
				</SettingsSection>
			)}

			{/* Danger zone */}
			<Box
				border="1"
				borderColor="border.tertiary"
				display="flex"
				flexDirection="column"
				gap="16"
				p="20"
				rounded="xl"
				style={{ borderColor: "rgba(220, 38, 38, 0.3)" }}
			>
				<Text fontWeight="600" style={{ color: "#DC2626", fontSize: 14 }}>
					Danger Zone
				</Text>
				<Box style={{ height: 1, background: "rgba(220, 38, 38, 0.15)" }} />

				{/* Archive */}
				<Box alignItems="start" display="flex" gap="16" justifyContent="space-between" style={{ flexWrap: "wrap" }}>
					<Box display="flex" flexDirection="column" gap="2">
						<Text fontWeight="500" style={{ fontSize: 14 }}>Archive this pack</Text>
						<Text color="fg.tertiary" fontSize="xs">
							Hide this pack from Opal and the library. Content generated with it remains unchanged.
						</Text>
					</Box>
					{showArchiveConfirm ? (
						<Box alignItems="center" display="flex" gap="8">
							<Text color="fg.secondary" fontSize="xs">Are you sure?</Text>
							<Button appearance="subtle" size="sm" onClick={() => setShowArchiveConfirm(false)}>Cancel</Button>
							<Button
								appearance="default"
								size="sm"
								icon={<IconArchive />}
								style={{ color: "#DC2626", borderColor: "rgba(220, 38, 38, 0.4)" }}
							>
								Archive
							</Button>
						</Box>
					) : (
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconArchive />}
							onClick={() => setShowArchiveConfirm(true)}
						>
							Archive
						</Button>
					)}
				</Box>

				<Box style={{ height: 1, background: "rgba(220, 38, 38, 0.1)" }} />

				{/* Delete */}
				<Box alignItems="start" display="flex" gap="16" justifyContent="space-between" style={{ flexWrap: "wrap" }}>
					<Box display="flex" flexDirection="column" gap="2">
						<Text fontWeight="500" style={{ fontSize: 14 }}>Delete this pack</Text>
						<Text color="fg.tertiary" fontSize="xs">
							Permanently remove this brand pack and all its templates, assets, and settings. This cannot be undone.
						</Text>
					</Box>
					{showDeleteConfirm ? (
						<Box alignItems="center" display="flex" gap="8">
							<Text color="fg.secondary" fontSize="xs">Are you sure?</Text>
							<Button appearance="subtle" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
							<Button
								appearance="default"
								size="sm"
								icon={<IconTrash />}
								style={{ color: "#DC2626", borderColor: "rgba(220, 38, 38, 0.4)" }}
							>
								Delete
							</Button>
						</Box>
					) : (
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconTrash />}
							onClick={() => setShowDeleteConfirm(true)}
							style={{ color: "#DC2626" }}
						>
							Delete
						</Button>
					)}
				</Box>
			</Box>
		</Box>
	);
}
