"use client";

import { Badge, Box, Card, CardHeader, CardImage, CardPreview } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconCalendar } from "@tabler/icons-react";
import Image from "next/image";
import type { ContentPreviewProps } from "./ContentPreviewRenderer";
import { MetadataRow } from "./MetadataRow";
import { PreviewLabel } from "./PreviewLabel";

const getImageName = (url: string) => {
	if (!url) return "";
	try {
		const base =
			typeof window !== "undefined" && window.location?.origin
				? window.location.origin
				: "http://localhost";
		const urlObj = new URL(url, base);
		const parts = urlObj.pathname.split("/").filter(Boolean);
		// Walk backwards to find a segment that isn't purely numeric (skip dimension segments like "800", "600")
		for (let i = parts.length - 1; i >= 0; i--) {
			const segment = parts[i];
			if (segment && !/^\d+$/.test(segment)) {
				return segment;
			}
		}
		return parts[parts.length - 1] || "Image";
	} catch {
		const parts = url.split("/").filter(Boolean);
		for (let i = parts.length - 1; i >= 0; i--) {
			const segment = (parts[i] || "").split("#")[0].split("?")[0];
			if (segment && !/^\d+$/.test(segment)) {
				return segment;
			}
		}
		return "Image";
	}
};

export function DefaultContentPreview({ instance, contentModel }: ContentPreviewProps) {
	const { fields, createdAt } = instance;
	const properties = contentModel.properties ?? [];

	return (
		<Box display="flex" flexDirection="column" style={{ gap: 16, padding: "18px" }}>
			{properties.map((property) => {
				const value = fields[property.name];
				if (value === undefined || value === null || value === "") return null;

				const label = property.displayName || property.name;

				// Image types
				if (property.type === "ImageReference" && typeof value === "string") {
					return (
						<Box key={property.id} display="flex" flexDirection="column" gap="4">
							<PreviewLabel>{label}</PreviewLabel>
							<Box style={{ maxWidth: "400px" }}>
								<Card>
									<CardPreview h="224">
										<CardImage asChild>
											<Image
												src={value}
												alt={label}
												fill
												unoptimized
												style={{ objectFit: "cover" }}
											/>
										</CardImage>
									</CardPreview>
									<CardHeader>{getImageName(value)}</CardHeader>
								</Card>
							</Box>
						</Box>
					);
				}

				// Rich text
				if (property.type === "XhtmlString" && typeof value === "string") {
					return (
						<Box key={property.id} display="flex" flexDirection="column" gap="4">
							<PreviewLabel>{label}</PreviewLabel>
							<div
								className="preview-rich-text"
								dangerouslySetInnerHTML={{ __html: value }}
							/>
						</Box>
					);
				}

				// Tag arrays
				if (Array.isArray(value)) {
					return (
						<Box key={property.id} display="flex" flexDirection="column" gap="4">
							<PreviewLabel>{label}</PreviewLabel>
							<Box alignItems="center" display="flex" flexWrap="wrap" gap="8">
								{value.map((item: string, i: number) => (
									<Badge key={i} intent="neutral">{item}</Badge>
								))}
							</Box>
						</Box>
					);
				}

				// Plain text
				if (typeof value === "string" || typeof value === "number") {
					return (
						<Box key={property.id} display="flex" flexDirection="column" gap="4">
							<PreviewLabel>{label}</PreviewLabel>
							<Text color="fg.default" fontSize="md">{String(value)}</Text>
						</Box>
					);
				}

				// Boolean
				if (typeof value === "boolean") {
					return (
						<Box key={property.id} display="flex" flexDirection="column" gap="4">
							<PreviewLabel>{label}</PreviewLabel>
							<Text color="fg.default" fontSize="md">{value ? "Yes" : "No"}</Text>
						</Box>
					);
				}

				return null;
			})}

			<Box display="flex" flexDirection="column" gap="12" mt="8">
				<MetadataRow
					icon={<IconCalendar size={16} />}
					label={`Created ${new Date(createdAt).toLocaleDateString()}`}
				/>
			</Box>
		</Box>
	);
}
