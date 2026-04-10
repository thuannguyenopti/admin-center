"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import type { ContentType, Page } from "@/app/db/initialData";
import type { ContentInstance } from "@/app/db/cmpInitialData";
import { convertCmpPropertyToCms } from "@/app/lib/contentTypeMigration";
import { PropertyRenderer } from "@/app/components/property-renderers";
import type { Outline } from "@/app/db/initialData";
import ScaledWebsitePreview from "@/app/components/ScaledWebsitePreview";
import type { AssetItem, TaskArticle } from "../../types";
import { recommendationAssets } from "../../constants";
import { initialCmpContentModels } from "@/app/db/cmpInitialData";
import { convertCmpModelToContentType } from "@/app/lib/contentTypeMigration";
import { ContentPreviewRenderer } from "../content-preview/ContentPreviewRenderer";

const cmpContentModels = initialCmpContentModels.map(convertCmpModelToContentType);

type SelectedContentBodyProps = {
	contentTypes: ContentType[];
	isEditingContentInstance: boolean;
	onContentInstanceChange: (nextInstance: ContentInstance) => void;
	previewCurrentEle: string;
	previewHoverEle: string;
	previewOutlines: Outline[];
	selectedArticle: TaskArticle | null;
	selectedContentInstance: ContentInstance | null;
	selectedPage: Page | null;
	selectedTaskAsset: AssetItem | null;
	setPreviewCurrentEle: React.Dispatch<React.SetStateAction<string>>;
	setPreviewHoverEle: React.Dispatch<React.SetStateAction<string>>;
	setPreviewOutlines: React.Dispatch<React.SetStateAction<Outline[]>>;
};

const articleBodyStyle = {
	color: "var(--ax-colors-fg-default)",
	fontFamily: "Inter, sans-serif",
	fontSize: 14,
	fontStyle: "normal" as const,
	fontWeight: 400,
	letterSpacing: "-0.1px",
	lineHeight: "20px",
};

export function SelectedContentBody({
	contentTypes,
	isEditingContentInstance,
	onContentInstanceChange,
	previewCurrentEle,
	previewHoverEle,
	previewOutlines,
	selectedArticle,
	selectedContentInstance,
	selectedPage,
	selectedTaskAsset,
	setPreviewCurrentEle,
	setPreviewHoverEle,
	setPreviewOutlines,
}: SelectedContentBodyProps) {
	if (selectedContentInstance) {
		const contentModel = cmpContentModels.find((model) => model.id === selectedContentInstance.modelId);

		if (!contentModel) {
			return (
				<Box display="flex" flexDirection="column" style={{ gap: 16, padding: "18px" }}>
					<Text color="fg.tertiary" fontSize="sm">
						Content model not found
					</Text>
				</Box>
			);
		}

		if (isEditingContentInstance) {
			return (
				<Box display="flex" flexDirection="column" style={{ gap: 16, padding: "18px" }}>
					{contentModel.properties?.map((cmpProperty) => {
						const cmsProperty = convertCmpPropertyToCms(cmpProperty);
						const fieldValue = selectedContentInstance.fields[cmpProperty.name];

						return (
							<PropertyRenderer
								context={{ runtimeContentTypes: contentTypes }}
								enableAI
								key={cmpProperty.id}
								mode="edit"
								onChange={(newValue: unknown) =>
									onContentInstanceChange({
										...selectedContentInstance,
										fields: {
											...selectedContentInstance.fields,
											[cmpProperty.name]: newValue,
										},
									})
								}
								property={cmsProperty}
								value={fieldValue}
							/>
						);
					})}
				</Box>
			);
		}

		return (
			<ContentPreviewRenderer
				contentModel={contentModel}
				instance={selectedContentInstance}
			/>
		);
	}

	if (selectedPage) {
		return (
			<ScaledWebsitePreview
				page={selectedPage}
				outlines={previewOutlines.length > 0 ? previewOutlines : undefined}
			/>
		);
	}

	if (selectedArticle) {
		return (
			<>
				<img
					alt="Runner sponsorship package"
					src={recommendationAssets.hero}
					style={{ display: "block", height: 272, objectFit: "cover", width: "100%" }}
				/>
				<Box display="flex" flexDirection="column" style={{ gap: 14, padding: "12px 18px 0" }}>
					<Box asChild>
						<div style={articleBodyStyle}>
							<>
								<p style={{ margin: 0 }}>
									When the whole world is gearing up for the Ironman Miami 2026 triathlon, here's a sneak
									peek at the Runner Sponsorship Package:
								</p>
								<div style={{ marginTop: 10 }}>
									<p style={{ fontWeight: 600, margin: 0 }}>Title Sponsor: The 'Victory Lap' Package ($5M)</p>
									<ul style={{ margin: "0 0 10px 18px", padding: 0 }}>
										<li>Headline billing on all event promotions.</li>
										<li>Logo placement on runner jerseys.</li>
										<li>Exclusive naming rights for the finish line.</li>
										<li>VIP access for 50 guests.</li>
										<li>Full-page ad in the event program.</li>
									</ul>
									<p style={{ fontWeight: 600, margin: 0 }}>Platinum Tier: The 'Sprint' Package ($3M)</p>
									<ul style={{ margin: "0 0 10px 18px", padding: 0 }}>
										<li>Prominent logo placement on event banners.</li>
										<li>Opportunity to set up an interactive booth at the event.</li>
										<li>VIP access for 30 guests.</li>
										<li>Half-page ad in the event program.</li>
									</ul>
									<p style={{ fontWeight: 600, margin: 0 }}>Gold Tier: The 'Marathon' Package ($1.5M)</p>
									<ul style={{ margin: "0 0 0 18px", padding: 0 }}>
										<li>Logo placement on event signage.</li>
										<li>Opportunity to distribute promotional materials.</li>
									</ul>
								</div>
							</>
						</div>
					</Box>
				</Box>
				<Box
					display="flex"
					flexDirection="column"
					gap="10"
					style={{ borderTop: "1px solid var(--ax-colors-border-tertiary)", marginTop: 12, padding: "12px 18px 18px" }}
				>
					<Box alignItems="center" display="flex" gap="6">
						{["Image", "Marathoner", "Millenials"].map((tag) => (
							<Box
								alignItems="center"
								bg="bg.secondary"
								display="flex"
								justifyContent="center"
								key={tag}
								rounded="full"
								style={{ height: 20, padding: "0 8px" }}
							>
								<Text color="fg.secondary" style={{ fontSize: 11, fontWeight: 500, lineHeight: "16px", maxWidth: "none" }}>
									{tag}
								</Text>
							</Box>
						))}
						<Text color="fg.accent" style={{ fontSize: 12, fontWeight: 500, lineHeight: "16px", maxWidth: "none" }}>
							+ 6
						</Text>
					</Box>
				</Box>
			</>
		);
	}

	if (selectedTaskAsset) {
		return (
			<Box display="flex" flexDirection="column" style={{ gap: 16, padding: "18px" }}>
				<Text color="fg.secondary" fontSize="sm">
					Task asset selected
				</Text>
				<Text color="fg.tertiary" fontSize="sm">
					Task asset rendering not yet implemented
				</Text>
			</Box>
		);
	}

	return (
		<Box display="flex" flexDirection="column" style={{ gap: 16, padding: "18px" }}>
			<Text color="fg.error" fontSize="sm">
				No content selected
			</Text>
		</Box>
	);
}
