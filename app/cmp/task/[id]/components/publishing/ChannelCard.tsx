"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Box, Button, Card, CardHeader, CardPreview, Separator, Tooltip } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconBrowser, IconFileText, IconPencil, IconRefresh, IconTrash } from "@tabler/icons-react";
import type { Page } from "@/app/db/initialData";
import WebsitePagePreview from "@/app/components/WebsitePagePreview";
import type { ChannelDefinition } from "./channelDefinitions";
import { ChannelIcon } from "./ChannelIcon";

export type ContentItem = {
	id: string;
	name: string;
	locale?: string;
	type: "page" | "instance";
	/** Full page object for rendering website preview (pages only) */
	page?: Page;
};

type ChannelCardProps = {
	channelDef: ChannelDefinition;
	contentItems: ContentItem[];
	onEdit: () => void;
	onRemove: () => void;
};

const RENDER_WIDTH = 1440;
const PREVIEW_HEIGHT = 120;

function PagePreviewThumbnail({ page }: { page: Page }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(0);

	const measure = useCallback(() => {
		if (containerRef.current) {
			setScale(containerRef.current.offsetWidth / RENDER_WIDTH);
		}
	}, []);

	useEffect(() => {
		measure();
		const observer = new ResizeObserver(measure);
		if (containerRef.current) observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, [measure]);

	return (
		<div
			ref={containerRef}
			style={{
				height: PREVIEW_HEIGHT,
				overflow: "hidden",
				position: "relative",
				width: "100%",
			}}
		>
			{scale > 0 && (
				<div
					style={{
						left: 0,
						pointerEvents: "none",
						position: "absolute",
						top: 0,
						transform: `scale(${scale})`,
						transformOrigin: "top left",
						width: RENDER_WIDTH,
					}}
				>
					<WebsitePagePreview page={page} />
				</div>
			)}
		</div>
	);
}

export function ChannelCard({ channelDef, contentItems, onEdit, onRemove }: ChannelCardProps) {
	return (
		<Card>
			<CardHeader
				addonBefore={<ChannelIcon icon={channelDef.icon} size={18} />}
				description={`${contentItems.length} content selected`}
				addonAfter={
					<>
						<Tooltip content="Sync">
							<Button appearance="subtle" size="sm" icon={<IconRefresh size={16} />} aria-label="Sync" />
						</Tooltip>
						<Tooltip content="Edit">
							<Button appearance="subtle" size="sm" icon={<IconPencil size={16} />} aria-label="Edit" onClick={onEdit} />
						</Tooltip>
						<Tooltip content="Remove">
							<Button appearance="subtle" size="sm" icon={<IconTrash size={16} />} aria-label="Remove" onClick={onRemove} />
						</Tooltip>
					</>
				}
			>
				Sending to {channelDef.name}
			</CardHeader>

			<Box display="flex" flexDirection="column" gap="12" p="16" pt="0">

				{/* Content list */}
				{contentItems.length > 0 && (
					<Box display="flex" flexDirection="column" gap="8">
						{contentItems.map((item) => (
							<Card key={item.id}>
								{item.type === "page" && item.page && (
									<CardPreview>
										<PagePreviewThumbnail page={item.page} />
									</CardPreview>
								)}
								<CardHeader
									addonBefore={item.type === "page" ? <IconBrowser size={16} /> : <IconFileText size={16} />}
									addonAfter={<Badge>{item.locale || "EN"}</Badge>}
								>
									{item.name}
								</CardHeader>
							</Card>
						))}
					</Box>
				)}

				<Separator />

				{/* Footer */}
				<Text fontSize="xs" color="fg.tertiary">
					TO BE PUBLISHED: Upon task completion
				</Text>
			</Box>
		</Card>
	);
}
