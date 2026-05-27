"use client";

import { useState } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import {
	IconPenToSquare as IconEdit,
	IconCheck,
	IconSparkles,
	IconChevronDown,
	IconChevronRight,
	IconCircleInfo,
	IconShareNodes,
	IconEnvelope,
	IconMoneyBill,
	IconGlobe,
	IconCalendarDays,
	IconDisplay,
	IconMagnifyingGlass,
	IconLinkedinIn,
	IconTwitter,
	IconFacebookF,
	IconInstagram,
	IconRss,
	IconCircleXmark,
	IconArrowUpRightFromSquare,
} from "@optimizely/axiom-icons";
import type { BrandPack, CmpOrgChannel, CmpPlatform } from "../../types";
import { orgCmpChannels } from "../../data";

type BrandBriefTabProps = {
	pack: BrandPack;
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			gap="12"
			p="20"
			rounded="xl"
			shadow="sm"
		>
			<Text fontWeight="600" style={{ fontSize: 14 }}>
				{title}
			</Text>
			{children}
		</Box>
	);
}

/** Icon for a channel category (marketing level) */
function CategoryIcon({ category }: { category: string }) {
	const iconProps = { size: 14, style: { color: "var(--ax-colors-fg-secondary)" } };
	switch (category.toLowerCase()) {
		case "social":    return <IconShareNodes {...iconProps} />;
		case "email":     return <IconEnvelope {...iconProps} />;
		case "paid":      return <IconMoneyBill {...iconProps} />;
		case "web":       return <IconGlobe {...iconProps} />;
		case "events":    return <IconCalendarDays {...iconProps} />;
		case "ooh":
		case "display":   return <IconDisplay {...iconProps} />;
		case "sem":       return <IconMagnifyingGlass {...iconProps} />;
		default:          return <IconGlobe {...iconProps} />;
	}
}

/** Platform-specific icon for a CMP connection */
function PlatformIcon({ platform, size = 14 }: { platform: CmpPlatform; size?: number }) {
	switch (platform) {
		case "linkedin":  return <IconLinkedinIn size={size} style={{ color: "#0A66C2" }} />;
		case "twitter":   return <IconTwitter size={size} style={{ color: "var(--ax-colors-fg-default)" }} />;
		case "facebook":  return <IconFacebookF size={size} style={{ color: "#1877F2" }} />;
		case "instagram": return <IconInstagram size={size} style={{ color: "#E1306C" }} />;
		case "rss":       return <IconRss size={size} style={{ color: "#F26522" }} />;
		case "marketo":   return <IconEnvelope size={size} style={{ color: "#5C4EE5" }} />;
		case "hubspot":   return <IconEnvelope size={size} style={{ color: "#FF7A59" }} />;
		case "cms":
			return (
				<Box
					alignItems="center"
					display="flex"
					justifyContent="center"
					style={{
						background: "#005CFF",
						borderRadius: 3,
						height: size + 2,
						width: size + 2,
					}}
				>
					<Text style={{ color: "#fff", fontSize: size - 4, fontWeight: 700, lineHeight: 1 }}>O</Text>
				</Box>
			);
		case "wordpress":
			return (
				<Box
					alignItems="center"
					display="flex"
					justifyContent="center"
					style={{
						background: "#21759B",
						borderRadius: 3,
						height: size + 2,
						width: size + 2,
					}}
				>
					<Text style={{ color: "#fff", fontSize: size - 4, fontWeight: 700, lineHeight: 1 }}>W</Text>
				</Box>
			);
		default:          return <IconGlobe size={size} style={{ color: "var(--ax-colors-fg-tertiary)" }} />;
	}
}

/** Small row showing one CMP connection inside an expanded channel */
function ConnectionRow({
	conn,
	isApproved,
	isEditing,
	onToggle,
}: {
	conn: CmpOrgChannel;
	isApproved: boolean;
	isEditing: boolean;
	onToggle: () => void;
}) {
	const typeLabel: Record<string, string> = {
		social: "Social account",
		feed: "RSS / Content feed",
		webhook: "Publishing webhook",
		email: "Email platform",
		ads: "Ad platform",
	};

	return (
		<Box
			alignItems="center"
			display="flex"
			gap="10"
			justifyContent="space-between"
			style={{ padding: "8px 12px" }}
		>
			<Box alignItems="center" display="flex" gap="10">
				<Box
					alignItems="center"
					bg="bg.default"
					display="flex"
					justifyContent="center"
					rounded="md"
					style={{ border: "1px solid var(--ax-colors-border-tertiary)", flexShrink: 0, height: 28, width: 28 }}
				>
					<PlatformIcon platform={conn.platform} size={13} />
				</Box>
				<Box display="flex" flexDirection="column" gap="2">
					<Text fontWeight="500" style={{ fontSize: 13 }}>{conn.name}</Text>
					<Text color="fg.tertiary" style={{ fontSize: 11 }}>
						{typeLabel[conn.type] ?? conn.type}
						{!conn.connected && " · Not connected in CMP"}
					</Text>
				</Box>
			</Box>

			{isEditing ? (
				<button
					type="button"
					onClick={conn.connected ? onToggle : undefined}
					style={{
						alignItems: "center",
						background: isApproved ? "var(--ax-colors-bg-accent-subtle)" : "var(--ax-colors-bg-secondary)",
						border: `1.5px solid ${isApproved ? "var(--ax-colors-border-accent)" : "var(--ax-colors-border-default)"}`,
						borderRadius: 6,
						cursor: conn.connected ? "pointer" : "default",
						display: "flex",
						gap: 4,
						padding: "3px 8px",
					}}
				>
					{isApproved ? (
						<>
							<IconCheck size={11} style={{ color: "var(--ax-colors-fg-accent)" }} />
							<span style={{ color: "var(--ax-colors-fg-accent)", fontSize: 11, fontWeight: 600 }}>Approved</span>
						</>
					) : (
						<span style={{ color: "var(--ax-colors-fg-tertiary)", fontSize: 11, fontWeight: 500 }}>
							{conn.connected ? "Approve" : "Not connected"}
						</span>
					)}
				</button>
			) : (
				<>
					{isApproved ? (
						<Box alignItems="center" display="flex" gap="4">
							<IconCheck size={11} style={{ color: "var(--ax-colors-fg-accent)" }} />
							<Text color="fg.accent" style={{ fontSize: 11, fontWeight: 600 }}>Approved</Text>
						</Box>
					) : conn.connected ? (
						<Text color="fg.tertiary" style={{ fontSize: 11 }}>Available</Text>
					) : (
						<Box alignItems="center" display="flex" gap="4">
							<IconCircleXmark size={11} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
							<Text color="fg.tertiary" style={{ fontSize: 11 }}>Not connected</Text>
						</Box>
					)}
				</>
			)}
		</Box>
	);
}

/** The expanded connections list for one channel category */
function ChannelConnections({
	category,
	approvedIds,
	isEditing,
	onToggle,
}: {
	category: string;
	approvedIds: string[];
	isEditing: boolean;
	onToggle: (id: string) => void;
}) {
	const connections = orgCmpChannels.filter((c) => c.channelCategory === category);
	if (connections.length === 0) return null;

	return (
		<Box
			bg="bg.secondary"
			display="flex"
			flexDirection="column"
			rounded="lg"
			style={{ marginBottom: 4, overflow: "hidden" }}
		>
			{connections.map((conn, i) => (
				<Box key={conn.id}>
					{i > 0 && <Box style={{ background: "var(--ax-colors-border-tertiary)", height: 1, margin: "0 12px" }} />}
					<ConnectionRow
						conn={conn}
						isApproved={approvedIds.includes(conn.id)}
						isEditing={isEditing}
						onToggle={() => onToggle(conn.id)}
					/>
				</Box>
			))}
		</Box>
	);
}

export function BrandBriefTab({ pack }: BrandBriefTabProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [briefText, setBriefText] = useState(pack.brandBrief);
	const [saved, setSaved] = useState(false);

	// Channel expand state
	const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set());
	const toggleChannel = (cat: string) => {
		setExpandedChannels((prev) => {
			const next = new Set(prev);
			next.has(cat) ? next.delete(cat) : next.add(cat);
			return next;
		});
	};

	// Channel editing state — local copy of approved connections
	const [isEditingChannels, setIsEditingChannels] = useState(false);
	const [channelEdits, setChannelEdits] = useState<Record<string, string[]>>(
		pack.approvedChannelConnections ?? {}
	);

	const handleSave = () => {
		setSaved(true);
		setIsEditing(false);
		setTimeout(() => setSaved(false), 2000);
	};

	const toggleApproval = (category: string, connId: string) => {
		setChannelEdits((prev) => {
			const current = prev[category] ?? [];
			const next = current.includes(connId)
				? current.filter((id) => id !== connId)
				: [...current, connId];
			return { ...prev, [category]: next };
		});
	};

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{ maxWidth: 760 }}>
			{/* Brand Brief editor */}
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
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Text fontWeight="600" style={{ fontSize: 14 }}>Brand Brief</Text>
					<Box alignItems="center" display="flex" gap="8">
						{!isEditing && (
							<Button
								appearance="subtle"
								size="sm"
								icon={<IconSparkles />}
								style={{ color: "var(--ax-colors-fg-accent)" }}
							>
								Regenerate with Opal
							</Button>
						)}
						{isEditing ? (
							<>
								<Button appearance="subtle" size="sm" onClick={() => setIsEditing(false)}>
									Cancel
								</Button>
								<Button
									appearance="primary"
									size="sm"
									icon={saved ? <IconCheck /> : undefined}
									onClick={handleSave}
								>
									{saved ? "Saved" : "Save"}
								</Button>
							</>
						) : (
							<Button appearance="subtle" size="sm" icon={<IconEdit />} onClick={() => setIsEditing(true)}>
								Edit
							</Button>
						)}
					</Box>
				</Box>

				{isEditing ? (
					<textarea
						value={briefText}
						onChange={(e) => setBriefText(e.target.value)}
						rows={8}
						style={{
							background: "var(--ax-colors-bg-secondary)",
							border: "1.5px solid var(--ax-colors-border-accent)",
							borderRadius: 10,
							color: "var(--ax-colors-fg-default)",
							fontFamily: "inherit",
							fontSize: 14,
							lineHeight: 1.6,
							outline: "none",
							padding: "12px 16px",
							resize: "vertical",
							width: "100%",
						}}
					/>
				) : (
					<Text color="fg.secondary" fontSize="sm" style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
						{briefText}
					</Text>
				)}
			</Box>

			{/* Tone keywords */}
			<SectionCard title="Tone of Voice">
				<Box display="flex" flexDirection="column" gap="12">
					<Box display="flex" gap="8" style={{ flexWrap: "wrap" }}>
						{pack.toneKeywords.map((kw) => (
							<Box key={kw} bg="bg.accent.subtle" rounded="full" style={{ padding: "6px 14px" }}>
								<Text color="fg.accent" fontWeight="500" style={{ fontSize: 13 }}>
									{kw}
								</Text>
							</Box>
						))}
					</Box>
					<Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)" }} />
					<Text color="fg.secondary" fontSize="sm">
						These keywords guide Opal's language when generating content using this brand pack. They influence word choice, sentence structure, and overall communication style.
					</Text>
				</Box>
			</SectionCard>

			{/* Approved Channels — linked to org CMP connections */}
			<Box
				bg="bg.default"
				border="1"
				borderColor="border.tertiary"
				display="flex"
				flexDirection="column"
				gap="0"
				p="20"
				rounded="xl"
				shadow="sm"
			>
				{/* Section header */}
				<Box alignItems="start" display="flex" justifyContent="space-between" style={{ marginBottom: 16 }}>
					<Box display="flex" flexDirection="column" gap="4">
						<Text fontWeight="600" style={{ fontSize: 14 }}>Approved Channels</Text>
						<Text color="fg.tertiary" style={{ fontSize: 12 }}>
							Maps brand-pack channel types to your org's live CMP publishing connections.
						</Text>
					</Box>
					<Box alignItems="center" display="flex" gap="6">
						{isEditingChannels ? (
							<>
								<Button appearance="subtle" size="sm" onClick={() => { setIsEditingChannels(false); setChannelEdits(pack.approvedChannelConnections ?? {}); }}>
									Cancel
								</Button>
								<Button appearance="primary" size="sm" icon={<IconCheck />} onClick={() => setIsEditingChannels(false)}>
									Save
								</Button>
							</>
						) : (
							<Button
								appearance="subtle"
								size="sm"
								icon={<IconEdit />}
								onClick={() => { setIsEditingChannels(true); setExpandedChannels(new Set(pack.channels)); }}
							>
								Edit
							</Button>
						)}
					</Box>
				</Box>

				{/* Channel rows */}
				<Box display="flex" flexDirection="column" gap="0">
					{pack.channels.map((category, idx) => {
						const approvedIds = (isEditingChannels ? channelEdits : pack.approvedChannelConnections)?.[category] ?? [];
						const cmpConnections = orgCmpChannels.filter((c) => c.channelCategory === category);
						const approvedCount = approvedIds.filter((id) => cmpConnections.some((c) => c.id === id)).length;
						const isExpanded = expandedChannels.has(category);
						const hasCmpConnections = cmpConnections.length > 0;

						// Collect small platform icons to preview in collapsed state
						const previewConns = cmpConnections.filter((c) => approvedIds.includes(c.id)).slice(0, 3);

						return (
							<Box key={category}>
								{idx > 0 && <Box style={{ background: "var(--ax-colors-border-tertiary)", height: 1 }} />}

								{/* Category row — clickable header */}
								<button
									type="button"
									onClick={() => hasCmpConnections && toggleChannel(category)}
									style={{
										alignItems: "center",
										background: "transparent",
										border: 0,
										cursor: hasCmpConnections ? "pointer" : "default",
										display: "flex",
										gap: 12,
										justifyContent: "space-between",
										padding: "12px 0",
										textAlign: "left",
										width: "100%",
									}}
								>
									{/* Left: icon + name + status */}
									<Box alignItems="center" display="flex" gap="12">
										<Box
											alignItems="center"
											bg="bg.secondary"
											display="flex"
											justifyContent="center"
											rounded="md"
											style={{ flexShrink: 0, height: 32, width: 32 }}
										>
											<CategoryIcon category={category} />
										</Box>
										<Box display="flex" flexDirection="column" gap="2">
											<Text fontWeight="500" style={{ fontSize: 14 }}>{category}</Text>
											<Text color="fg.tertiary" style={{ fontSize: 12 }}>
												{!hasCmpConnections
													? "Managed outside CMP"
													: approvedCount > 0
													? `${approvedCount} connection${approvedCount !== 1 ? "s" : ""} approved`
													: "No connections approved"}
											</Text>
										</Box>
									</Box>

									{/* Right: connection dots + chevron */}
									<Box alignItems="center" display="flex" gap="8">
										{previewConns.length > 0 && (
											<Box alignItems="center" display="flex" gap="4">
												{previewConns.map((c) => (
													<Box
														key={c.id}
														alignItems="center"
														bg="bg.default"
														display="flex"
														justifyContent="center"
														rounded="full"
														style={{
															border: "1.5px solid var(--ax-colors-border-tertiary)",
															flexShrink: 0,
															height: 22,
															width: 22,
														}}
													>
														<PlatformIcon platform={c.platform} size={11} />
													</Box>
												))}
												{approvedCount > 3 && (
													<Box
														alignItems="center"
														bg="bg.secondary"
														display="flex"
														justifyContent="center"
														rounded="full"
														style={{ border: "1.5px solid var(--ax-colors-border-tertiary)", flexShrink: 0, height: 22, width: 22 }}
													>
														<Text color="fg.tertiary" style={{ fontSize: 10, fontWeight: 600 }}>+{approvedCount - 3}</Text>
													</Box>
												)}
											</Box>
										)}
										{hasCmpConnections && (
											isExpanded
												? <IconChevronDown size={13} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
												: <IconChevronRight size={13} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
										)}
									</Box>
								</button>

								{/* Expanded connections */}
								{isExpanded && hasCmpConnections && (
									<Box style={{ marginBottom: 8 }}>
										<ChannelConnections
											category={category}
											approvedIds={approvedIds}
											isEditing={isEditingChannels}
											onToggle={(id) => toggleApproval(category, id)}
										/>
									</Box>
								)}
							</Box>
						);
					})}
				</Box>

				{/* Footer note */}
				<Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)", marginBottom: 12, marginTop: 4 }} />
				<Box alignItems="center" display="flex" gap="6" justifyContent="space-between">
					<Box alignItems="center" display="flex" gap="6">
						<IconCircleInfo size={12} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
						<Text color="fg.tertiary" style={{ fontSize: 12 }}>
							Approved connections appear as publishing destinations in CMP tasks using this brand pack.
						</Text>
					</Box>
					<Button
						appearance="subtle"
						size="sm"
						icon={<IconArrowUpRightFromSquare size={12} />}
						iconPosition="end"
						style={{ flexShrink: 0 }}
					>
						Manage org channels
					</Button>
				</Box>
			</Box>

			{/* Typography guidance */}
			<SectionCard title="Typography Guidance">
				<Box display="flex" flexDirection="column" gap="16">
					<Box display="flex" flexDirection="column" gap="4">
						<Text color="fg.tertiary" fontSize="xs" fontWeight="600" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
							Heading Font
						</Text>
						<Text fontWeight="700" style={{ fontSize: 28, lineHeight: 1.1 }}>
							{pack.typography.heading}
						</Text>
						<Text color="fg.secondary" style={{ fontSize: 13 }}>
							Use for all titles, section headers, and display copy
						</Text>
					</Box>

					<Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)" }} />

					<Box display="flex" flexDirection="column" gap="4">
						<Text color="fg.tertiary" fontSize="xs" fontWeight="600" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
							Body Font
						</Text>
						<Text fontWeight="400" style={{ fontSize: 15, lineHeight: 1.6 }}>
							The quick brown fox jumps over the lazy dog.
						</Text>
						<Text color="fg.secondary" fontSize="xs">
							{pack.typography.body} · 15–16px recommended for body copy
						</Text>
					</Box>

					{pack.typography.mono && (
						<>
							<Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)" }} />
							<Box display="flex" flexDirection="column" gap="4">
								<Text color="fg.tertiary" fontSize="xs" fontWeight="600" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
									Monospace
								</Text>
								<Text style={{ fontFamily: "monospace", fontSize: 13 }}>
									const brand = "optimizely";
								</Text>
								<Text color="fg.secondary" fontSize="xs">{pack.typography.mono} · For code and technical content</Text>
							</Box>
						</>
					)}
				</Box>
			</SectionCard>
		</Box>
	);
}
