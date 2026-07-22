"use client";

import {useState} from "react";
import {Badge, Box, Button, Text, Textarea} from "@optiaxiom/react";
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
import type {BrandPack, CmpOrgChannel, CmpPlatform} from "../../types";
import {orgCmpChannels} from "../../data";
import {getBrandInstructionText, getBrandTypographySummary, getToneOfVoice} from "../../adapters";
import {
	EditorDivider,
	EditorField,
	EditorFieldStack,
	EditorGrid,
	EditorHeader,
	EditorPage,
	EditorPanel,
	EditorPills,
	EditorPreview,
	EditorTextValue,
} from "./EditorPrimitives";

type BrandBriefTabProps = {
	pack: BrandPack;
};

function SectionCard({title, children}: {title: string; children: React.ReactNode}) {
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
			<Text fontWeight="600" style={{fontSize: 14}}>
				{title}
			</Text>
			{children}
		</Box>
	);
}

function BriefPreview({text}: {text: string}) {
	return (
		<Box display="flex" flexDirection="column" gap="10">
			{text
				.split("\n")
				.filter((line) => line.trim().length > 0)
				.map((line, index) => {
					const trimmed = line.trim();
					const clean = trimmed.replace(/^[-# ]+/, "").replace(/\*\*/g, "");

					if (trimmed.startsWith("# ")) {
						return (
							<Text
								key={`${line}-${index}`}
								fontWeight="700"
								style={{fontSize: 17, lineHeight: 1.25}}
							>
								{clean}
							</Text>
						);
					}

					if (trimmed.startsWith("## ")) {
						return (
							<Text
								key={`${line}-${index}`}
								color="fg.default"
								fontWeight="700"
								style={{
									fontSize: 14,
									lineHeight: 1.25,
									marginTop: index === 0 ? 0 : 8,
								}}
							>
								{clean}
							</Text>
						);
					}

					if (trimmed.startsWith("-")) {
						return (
							<Box
								key={`${line}-${index}`}
								alignItems="start"
								display="grid"
								gap="8"
								style={{gridTemplateColumns: "6px minmax(0, 1fr)"}}
							>
								<Box
									bg="bg.success"
									rounded="full"
									style={{height: 5, marginTop: 8, width: 5}}
								/>
								<Text color="fg.secondary" fontSize="sm" style={{lineHeight: 1.55}}>
									{clean}
								</Text>
							</Box>
						);
					}

					return (
						<Text
							key={`${line}-${index}`}
							color="fg.secondary"
							fontSize="sm"
							style={{lineHeight: 1.6}}
						>
							{clean}
						</Text>
					);
				})}
		</Box>
	);
}

/** Icon for a channel category (marketing level) */
function CategoryIcon({category}: {category: string}) {
	const iconProps = {size: 14, style: {color: "var(--ax-colors-fg-secondary)"}};
	switch (category.toLowerCase()) {
		case "social":
			return <IconShareNodes {...iconProps} />;
		case "email":
			return <IconEnvelope {...iconProps} />;
		case "paid":
			return <IconMoneyBill {...iconProps} />;
		case "web":
			return <IconGlobe {...iconProps} />;
		case "events":
			return <IconCalendarDays {...iconProps} />;
		case "ooh":
		case "display":
			return <IconDisplay {...iconProps} />;
		case "sem":
			return <IconMagnifyingGlass {...iconProps} />;
		default:
			return <IconGlobe {...iconProps} />;
	}
}

/** Platform-specific icon for a CMP connection */
function PlatformIcon({platform, size = 14}: {platform: CmpPlatform; size?: number}) {
	switch (platform) {
		case "linkedin":
			return <IconLinkedinIn size={size} style={{color: "#0A66C2"}} />;
		case "twitter":
			return <IconTwitter size={size} style={{color: "var(--ax-colors-fg-default)"}} />;
		case "facebook":
			return <IconFacebookF size={size} style={{color: "#1877F2"}} />;
		case "instagram":
			return <IconInstagram size={size} style={{color: "#E1306C"}} />;
		case "rss":
			return <IconRss size={size} style={{color: "#F26522"}} />;
		case "marketo":
			return <IconEnvelope size={size} style={{color: "#5C4EE5"}} />;
		case "hubspot":
			return <IconEnvelope size={size} style={{color: "#FF7A59"}} />;
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
					<Text
						style={{color: "#fff", fontSize: size - 4, fontWeight: 700, lineHeight: 1}}
					>
						O
					</Text>
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
					<Text
						style={{color: "#fff", fontSize: size - 4, fontWeight: 700, lineHeight: 1}}
					>
						W
					</Text>
				</Box>
			);
		default:
			return <IconGlobe size={size} style={{color: "var(--ax-colors-fg-tertiary)"}} />;
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
			style={{padding: "8px 12px"}}
		>
			<Box alignItems="center" display="flex" gap="10">
				<Box
					alignItems="center"
					bg="bg.default"
					display="flex"
					justifyContent="center"
					rounded="md"
					style={{
						border: "1px solid var(--ax-colors-border-tertiary)",
						flexShrink: 0,
						height: 28,
						width: 28,
					}}
				>
					<PlatformIcon platform={conn.platform} size={13} />
				</Box>
				<Box display="flex" flexDirection="column" gap="2">
					<Text fontWeight="500" style={{fontSize: 14}}>
						{conn.name}
					</Text>
					<Text color="fg.tertiary" style={{fontSize: 12}}>
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
						background: isApproved
							? "var(--ax-colors-bg-accent-subtle)"
							: "var(--ax-colors-bg-secondary)",
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
							<IconCheck size={11} style={{color: "var(--ax-colors-fg-accent)"}} />
							<span
								style={{
									color: "var(--ax-colors-fg-accent)",
									fontSize: 12,
									fontWeight: 600,
								}}
							>
								Approved
							</span>
						</>
					) : (
						<span
							style={{
								color: "var(--ax-colors-fg-tertiary)",
								fontSize: 12,
								fontWeight: 500,
							}}
						>
							{conn.connected ? "Approve" : "Not connected"}
						</span>
					)}
				</button>
			) : (
				<>
					{isApproved ? (
						<Box alignItems="center" display="flex" gap="4">
							<IconCheck size={11} style={{color: "var(--ax-colors-fg-accent)"}} />
							<Text color="fg.accent" style={{fontSize: 12, fontWeight: 600}}>
								Approved
							</Text>
						</Box>
					) : conn.connected ? (
						<Text color="fg.tertiary" style={{fontSize: 12}}>
							Available
						</Text>
					) : (
						<Box alignItems="center" display="flex" gap="4">
							<IconCircleXmark
								size={11}
								style={{color: "var(--ax-colors-fg-tertiary)"}}
							/>
							<Text color="fg.tertiary" style={{fontSize: 12}}>
								Not connected
							</Text>
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
			style={{marginBottom: 4, overflow: "hidden"}}
		>
			{connections.map((conn, i) => (
				<Box key={conn.id}>
					{i > 0 && (
						<Box
							style={{
								background: "var(--ax-colors-border-tertiary)",
								height: 1,
								margin: "0 12px",
							}}
						/>
					)}
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

export function BrandBriefTab({pack}: BrandBriefTabProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [briefText, setBriefText] = useState(getBrandInstructionText(pack));
	const [isRegenerating, setIsRegenerating] = useState(false);
	const [saved, setSaved] = useState(false);
	const typography = getBrandTypographySummary(pack);
	const tone = getToneOfVoice(pack);

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

	const handleRegenerate = () => {
		setIsRegenerating(true);
		setIsEditing(false);
		window.setTimeout(() => {
			setBriefText(getBrandInstructionText(pack));
			setIsRegenerating(false);
			setSaved(true);
			window.setTimeout(() => setSaved(false), 2000);
		}, 450);
	};

	const handleManageOrgChannels = () => {
		setIsEditingChannels(true);
		setExpandedChannels(new Set(pack.channels));
	};

	const toggleApproval = (category: string, connId: string) => {
		setChannelEdits((prev) => {
			const current = prev[category] ?? [];
			const next = current.includes(connId)
				? current.filter((id) => id !== connId)
				: [...current, connId];
			return {...prev, [category]: next};
		});
	};

	return (
		<EditorPage>
			<EditorHeader
				eyebrow="Brand Instruction"
				title="AI-executable brand brief"
				description="Editable structured guidance plus the generated instruction preview Opal uses before creating brand assets."
				actions={
					<>
						{!isEditing && (
							<Button
								appearance="subtle"
								size="sm"
								icon={<IconSparkles />}
								onClick={handleRegenerate}
								style={{color: "var(--ax-colors-fg-accent)"}}
							>
								{isRegenerating ? "Regenerating..." : "Regenerate with Opal"}
							</Button>
						)}
						{isEditing ? (
							<>
								<Button
									appearance="subtle"
									size="sm"
									onClick={() => setIsEditing(false)}
								>
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
							<Button
								appearance="subtle"
								size="sm"
								icon={<IconEdit />}
								onClick={() => setIsEditing(true)}
							>
								Edit
							</Button>
						)}
					</>
				}
			/>

			<EditorGrid
				aside={
					<Box display="flex" flexDirection="column" gap="16">
						<EditorPanel
							title="Instruction signals"
							description="The main facts that feed the generated brief."
						>
							<EditorFieldStack>
								<EditorField label="Tone">
									<EditorPills items={tone.key_traits} />
								</EditorField>
								<EditorField label="Heading type">
									<EditorTextValue>{typography.heading}</EditorTextValue>
								</EditorField>
								<EditorField label="Body type">
									<EditorTextValue>{typography.body}</EditorTextValue>
								</EditorField>
								<EditorField label="Channels">
									<EditorPills items={pack.channels} />
								</EditorField>
							</EditorFieldStack>
						</EditorPanel>
						<EditorPreview>
							<Text color="fg.success" fontSize="xs" fontWeight="700">
								Generation posture
							</Text>
							<Text
								fontWeight="700"
								style={{fontSize: 18, lineHeight: 1.25, marginTop: 8}}
							>
								Bold, energetic, direct.
							</Text>
							<Text
								color="fg.secondary"
								fontSize="sm"
								style={{lineHeight: 1.5, marginTop: 8}}
							>
								Lead with the athlete outcome. Use sharp contrast, clean structure,
								and approved brand marks only.
							</Text>
						</EditorPreview>
					</Box>
				}
			>
				<Box display="flex" flexDirection="column" gap="16">
					<EditorPanel
						title="Brand brief"
						description="Edit the source instruction or review the formatted preview."
					>
						{isEditing ? (
							<Textarea
								value={briefText}
								onChange={(e) => setBriefText(e.target.value)}
								rows={14}
								style={{lineHeight: 1.6}}
							/>
						) : (
							<BriefPreview text={briefText} />
						)}
					</EditorPanel>

					<EditorPanel
						title="Approved channels"
						description="Maps brand channel types to your org's live CMP publishing connections."
						actions={
							isEditingChannels ? (
								<>
									<Button
										appearance="subtle"
										size="sm"
										onClick={() => {
											setIsEditingChannels(false);
											setChannelEdits(pack.approvedChannelConnections ?? {});
										}}
									>
										Cancel
									</Button>
									<Button
										appearance="primary"
										size="sm"
										icon={<IconCheck />}
										onClick={() => setIsEditingChannels(false)}
									>
										Save
									</Button>
								</>
							) : (
								<Button
									appearance="subtle"
									size="sm"
									icon={<IconEdit />}
									onClick={() => {
										setIsEditingChannels(true);
										setExpandedChannels(new Set(pack.channels));
									}}
								>
									Edit
								</Button>
							)
						}
					>
						<Box display="flex" flexDirection="column" gap="0">
							{pack.channels.map((category, idx) => {
								const approvedIds =
									(isEditingChannels
										? channelEdits
										: pack.approvedChannelConnections)?.[category] ?? [];
								const cmpConnections = orgCmpChannels.filter(
									(c) => c.channelCategory === category
								);
								const approvedCount = approvedIds.filter((id) =>
									cmpConnections.some((c) => c.id === id)
								).length;
								const isExpanded = expandedChannels.has(category);
								const hasCmpConnections = cmpConnections.length > 0;
								const previewConns = cmpConnections
									.filter((c) => approvedIds.includes(c.id))
									.slice(0, 3);

								return (
									<Box key={category}>
										{idx > 0 && <EditorDivider />}
										<button
											type="button"
											onClick={() =>
												hasCmpConnections && toggleChannel(category)
											}
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
											<Box alignItems="center" display="flex" gap="12">
												<Box
													alignItems="center"
													bg="bg.secondary"
													display="flex"
													justifyContent="center"
													rounded="md"
													style={{flexShrink: 0, height: 32, width: 32}}
												>
													<CategoryIcon category={category} />
												</Box>
												<Box display="flex" flexDirection="column" gap="2">
													<Text fontWeight="600" style={{fontSize: 14}}>
														{category}
													</Text>
													<Text
														color="fg.tertiary"
														style={{fontSize: 12}}
													>
														{!hasCmpConnections
															? "Managed outside CMP"
															: approvedCount > 0
																? `${approvedCount} connection${approvedCount !== 1 ? "s" : ""} approved`
																: "No connections approved"}
													</Text>
												</Box>
											</Box>

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
																<PlatformIcon
																	platform={c.platform}
																	size={11}
																/>
															</Box>
														))}
														{approvedCount > 3 && (
															<Box
																alignItems="center"
																bg="bg.secondary"
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
																<Text
																	color="fg.tertiary"
																	style={{
																		fontSize: 12,
																		fontWeight: 600,
																	}}
																>
																	+{approvedCount - 3}
																</Text>
															</Box>
														)}
													</Box>
												)}
												{hasCmpConnections &&
													(isExpanded ? (
														<IconChevronDown
															size={13}
															style={{
																color: "var(--ax-colors-fg-tertiary)",
																flexShrink: 0,
															}}
														/>
													) : (
														<IconChevronRight
															size={13}
															style={{
																color: "var(--ax-colors-fg-tertiary)",
																flexShrink: 0,
															}}
														/>
													))}
											</Box>
										</button>

										{isExpanded && hasCmpConnections && (
											<Box style={{marginBottom: 8}}>
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

						<EditorDivider />
						<Box
							alignItems="center"
							display="flex"
							gap="6"
							justifyContent="space-between"
						>
							<Box alignItems="center" display="flex" gap="6">
								<IconCircleInfo
									size={12}
									style={{color: "var(--ax-colors-fg-tertiary)", flexShrink: 0}}
								/>
								<Text color="fg.tertiary" style={{fontSize: 12}}>
									Approved connections appear as publishing destinations in CMP
									tasks using this brand.
								</Text>
							</Box>
							<Button
								appearance="subtle"
								size="sm"
								icon={<IconArrowUpRightFromSquare size={12} />}
								iconPosition="end"
								onClick={handleManageOrgChannels}
								style={{flexShrink: 0}}
							>
								Manage org channels
							</Button>
						</Box>
					</EditorPanel>
				</Box>
			</EditorGrid>
		</EditorPage>
	);
}
