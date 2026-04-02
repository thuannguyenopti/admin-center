"use client";

import { Badge, Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconCalendar, IconCopy, IconLink } from "@tabler/icons-react";
import type { ContentPreviewProps } from "./ContentPreviewRenderer";
import { MetadataRow } from "./MetadataRow";
import { PreviewLabel } from "./PreviewLabel";

const MAX_VISIBLE_TAGS = 3;

export function ArticlePreview({ instance }: ContentPreviewProps) {
	const { fields, createdAt } = instance;
	const tags: string[] = Array.isArray(fields.tags) ? fields.tags : [];
	const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
	const overflowCount = tags.length - MAX_VISIBLE_TAGS;

	return (
		<Box display="flex" flexDirection="column" style={{ gap: 16, padding: "0 20px 20px" }}>
			{fields.hero_image && (
				<Box display="flex" flexDirection="column" gap="4" mt="16">
					<PreviewLabel>Hero Image</PreviewLabel>
					<Box rounded="lg" style={{ overflow: "hidden" }}>
						<img
							alt={fields.headline || "Article hero"}
							src={fields.hero_image}
							style={{ display: "block", width: "100%" }}
						/>
					</Box>
				</Box>
			)}

			{fields.subheadline && (
				<Box display="flex" flexDirection="column" gap="4">
					<PreviewLabel>Subheadline</PreviewLabel>
					<Text color="fg.secondary" fontSize="md">{fields.subheadline}</Text>
				</Box>
			)}

			{fields.byline && (
				<Box display="flex" flexDirection="column" gap="4">
					<PreviewLabel>Byline</PreviewLabel>
					<Text color="fg.tertiary" fontSize="sm">{fields.byline}</Text>
				</Box>
			)}

			{fields.body && (
				<Box display="flex" flexDirection="column" gap="4">
					<PreviewLabel>Body</PreviewLabel>
					<div
						className="preview-rich-text"
						dangerouslySetInnerHTML={{ __html: fields.body }}
					/>
				</Box>
			)}

			{tags.length > 0 && (
				<Box display="flex" flexDirection="column" gap="4">
					<PreviewLabel>Tags</PreviewLabel>
					<Box alignItems="center" display="flex" gap="8">
						{visibleTags.map((tag) => (
							<Badge key={tag} intent="neutral">{tag}</Badge>
						))}
						{overflowCount > 0 && (
							<Text color="fg.accent" fontSize="sm">+ {overflowCount}</Text>
						)}
					</Box>
				</Box>
			)}

			<Box display="flex" flexDirection="column" gap="12" mt="8">
				{fields.byline && (
					<MetadataRow
						icon={<IconCalendar size={16} />}
						label={`${fields.byline} \u2022 ${new Date(createdAt).toLocaleDateString()}`}
					/>
				)}
				<MetadataRow
					icon={<IconCopy size={16} />}
					label="Will be saved in Library > Articles"
				/>
				<MetadataRow
					icon={<IconLink size={16} />}
					label="Preview URL: https://www.stride.com/articles"
					link
				/>
			</Box>
		</Box>
	);
}
