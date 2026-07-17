"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogBody,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	Box,
	Separator,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import {IconTriangleExclamation, IconFileLines} from "@/app/lib/axiom-icons";
import type { ContentInstance } from "@/app/db/cmpInitialData";
import type { Application, Page } from "@/app/db/initialData";
import type { PublishingChannel } from "../../types";
import { getChannelDef } from "./channelDefinitions";
import { ChannelIcon } from "./ChannelIcon";
import { getApplicationNamesForPages } from "@/app/lib/pageApplicationUtils";
import { useMemo } from "react";

type PublishConfirmDialogProps = {
	applications: Application[];
	channels: PublishingChannel[];
	contentInstances: ContentInstance[];
	onCancel: () => void;
	onConfirm: () => void;
	open: boolean;
	pages: Page[];
};

function getInstanceName(instance: ContentInstance): string {
	const f = instance.fields;
	return f.headline || f.title || f.subject_line || f.message || f.name || instance.modelDisplayName;
}

export function PublishConfirmDialog({ applications, channels, contentInstances, onCancel, onConfirm, open, pages }: PublishConfirmDialogProps) {
	const hasInstances = contentInstances.length > 0;
	const hasPages = pages.length > 0;

	// Enhance CMS channels with application names
	const channelsWithAppInfo = useMemo(() => {
		return channels.map((channel) => {
			if (channel.channelTypeId !== "cms-12") {
				return { ...channel, appNames: [] };
			}

			// Get application names from page metadata first, fallback to hierarchy lookup
			const appNamesFromMetadata = channel.selectedContentIds
				.map((id) => pages.find((p) => p.id === id)?.cmpTaskMetadata?.applicationName)
				.filter((name): name is string => !!name);

			const uniqueAppNames = Array.from(new Set(appNamesFromMetadata));

			// If we found app names in metadata, use those; otherwise fall back to hierarchy lookup
			const appNames = uniqueAppNames.length > 0
				? uniqueAppNames.sort()
				: getApplicationNamesForPages(channel.selectedContentIds, pages, applications);

			return { ...channel, appNames };
		});
	}, [channels, pages, applications]);

	const channelsWithContent = channelsWithAppInfo.filter((ch) => ch.selectedContentIds.length > 0);
	const hasChannelsWithContent = channelsWithContent.length > 0;
	const hasAnyContent = hasInstances || hasPages || hasChannelsWithContent;

	// Check if any CMS pages are NOT assigned to a CMS channel
	const cmsChannelPageIds = new Set(
		channels
			.filter((ch) => ch.channelTypeId === "cms-12")
			.flatMap((ch) => ch.selectedContentIds),
	);
	const unpublishedPages = pages.filter((page) => !cmsChannelPageIds.has(page.id));
	const hasUnpublishedPages = unpublishedPages.length > 0;

	// Determine dialog title based on content type
	const onlyLibraryContent = hasInstances && !hasChannelsWithContent && !hasPages;
	const dialogTitle = !hasAnyContent
		? "Complete Task"
		: onlyLibraryContent
			? "Publish to Library"
			: "Publish & Complete Task";

	return (
		<>
			{open && (
				<Box
					style={{
						backdropFilter: "blur(8px)",
						background: "rgba(231, 239, 255, 0.42)",
						inset: 0,
						position: "fixed",
						zIndex: 79,
					}}
				/>
			)}
			<AlertDialog onOpenChange={(o) => { if (!o) onCancel(); }} open={open}>
				<AlertDialogContent
					size="md"
					style={{
						borderRadius: 12,
						boxShadow: "0 4px 4px 1px rgba(9, 30, 66, 0.04), 0 6px 12px -3px rgba(9, 30, 66, 0.08), 0 6px 18px 0 rgba(9, 30, 66, 0.04)",
						maxWidth: 600,
						overflow: "hidden",
						width: "min(600px, calc(100vw - 48px))",
					}}
				>
					<AlertDialogHeader addonBefore={null} style={{ padding: "24px 24px 16px" }}>
						<Text
							color="fg.default"
							style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.6px", lineHeight: "32px", maxWidth: "none" }}
						>
							{dialogTitle}
						</Text>
					</AlertDialogHeader>
					<AlertDialogBody style={{ padding: "0 24px 16px" }}>
						<Box display="flex" flexDirection="column" gap="16">
							{hasInstances && (
								<Box display="flex" flexDirection="column" gap="8">
									<Text color="fg.default" style={{ fontSize: 13, fontWeight: 600, lineHeight: "18px", maxWidth: "none" }}>
										Save to CMP Library
									</Text>
									{contentInstances.map((instance) => (
										<Box key={instance.id} alignItems="center" display="flex" gap="8" style={{ paddingLeft: 8 }}>
											<IconFileLines color="var(--ax-colors-fg-secondary)" size={14} />
											<Text color="fg.default" style={{ fontSize: 13, lineHeight: "18px", maxWidth: "none" }}>
												{getInstanceName(instance)}
											</Text>
										</Box>
									))}
								</Box>
							)}

							{(hasChannelsWithContent || hasInstances) && (
								<>
									{hasInstances && <Separator />}
									<Text color="fg.default" style={{ fontSize: 13, fontWeight: 600, lineHeight: "18px", maxWidth: "none" }}>
										Publish to Channels
									</Text>
									{hasChannelsWithContent ? (
										channelsWithContent.map((channel) => {
											const def = getChannelDef(channel.channelTypeId);
											if (!def) return null;

											// For CMS channels, append application names if available
											const displayName =
												channel.channelTypeId === "cms-12" && channel.appNames.length > 0 ? `${def.name} - ${channel.appNames.join(", ")}` : def.name;

											return (
												<Box key={channel.id} display="flex" flexDirection="column" gap="4" style={{ paddingLeft: 8 }}>
													<Box alignItems="center" display="flex" gap="8">
														<ChannelIcon icon={def.icon} size={14} />
														<Text color="fg.default" style={{ fontSize: 13, fontWeight: 500, lineHeight: "18px", maxWidth: "none" }}>
															{displayName}
														</Text>
														<Text color="fg.tertiary" style={{ fontSize: 12, lineHeight: "16px", maxWidth: "none" }}>
															({channel.selectedContentIds.length} items)
														</Text>
													</Box>
												</Box>
											);
										})
									) : (
										<Box style={{ paddingLeft: 8 }}>
											<Text color="fg.tertiary" style={{ fontSize: 13, lineHeight: "18px", maxWidth: "none" }}>
												No channels added.
											</Text>
										</Box>
									)}
								</>
							)}

							{hasUnpublishedPages && (
								<>
									{(hasInstances || hasChannelsWithContent) && <Separator />}
									<Box alignItems="start" display="flex" gap="8" p="12" rounded="sm" style={{ backgroundColor: "var(--ax-colors-bg-warning-subtle)" }}>
										<IconTriangleExclamation color="var(--ax-colors-fg-warning)" size={16} style={{ flexShrink: 0, marginTop: 2 }} />
										<Box display="flex" flexDirection="column" gap="4">
											<Text color="fg.default" style={{ fontSize: 13, fontWeight: 500, lineHeight: "18px", maxWidth: "none" }}>
												{unpublishedPages.length === 1 ? "1 CMS page" : `${unpublishedPages.length} CMS pages`} not assigned to a publishing channel
											</Text>
											{unpublishedPages.map((page) => (
												<Text key={page.id} color="fg.secondary" style={{ fontSize: 13, lineHeight: "18px", maxWidth: "none" }}>
													{page.name}
												</Text>
											))}
											<Text color="fg.tertiary" style={{ fontSize: 12, lineHeight: "16px", maxWidth: "none" }}>
												Add a CMS channel in the Publishing tab to publish these pages.
											</Text>
										</Box>
									</Box>
								</>
							)}

							{!hasInstances && !hasPages && !hasChannelsWithContent && (
								<Text color="fg.tertiary" style={{ fontSize: 14, lineHeight: "20px", maxWidth: "none" }}>
									No content to publish. The task will be marked as complete.
								</Text>
							)}
						</Box>
					</AlertDialogBody>
					<AlertDialogFooter
						alignItems="center"
						borderColor="border.tertiary"
						borderT="1"
						display="flex"
						justifyContent="flex-end"
						style={{ gap: 16, padding: "20px 24px" }}
					>
						<AlertDialogCancel appearance="subtle" onClick={onCancel} size="lg">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction appearance="primary" onClick={onConfirm} size="lg">
							{!hasAnyContent ? "Mark Complete" : onlyLibraryContent ? "Save & Complete" : "Publish & Complete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
