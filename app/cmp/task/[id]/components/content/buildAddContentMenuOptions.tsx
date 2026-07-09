"use client";

import {IconBroadcast, IconChevronDown, IconFileLines, IconImage, IconPlus, IconPuzzle} from "@/app/lib/axiom-icons";
import { Box } from "@optiaxiom/react";
import type { ContentType } from "@/app/db/initialData";
import { initialCmpContentModels } from "@/app/db/cmpInitialData";
import { convertCmpModelToContentType } from "@/app/lib/contentTypeMigration";

const cmpContentModels = initialCmpContentModels.map(convertCmpModelToContentType);

type BuildAddContentMenuOptionsArgs = {
	onAddArticle: () => void;
	onAddAsset: () => void;
	onAddContentFromModel: (model: ContentType) => void;
};

export function buildAddContentMenuOptions({
	onAddArticle,
	onAddAsset,
	onAddContentFromModel,
}: BuildAddContentMenuOptionsArgs) {
	return [
		{
			label: "Asset",
			addon: <IconImage size={20} />,
			description: "Add assets from recommendations",
			execute: onAddAsset,
		},
		{
			label: "Article",
			addon: <IconFileLines size={20} />,
			description: "Add a hardcoded article example",
			execute: onAddArticle,
		},
		{
			label: "From CMS",
			addon: <IconBroadcast size={20} />,
			description: "Add content from CMS",
			execute: () => {},
		},
		{
			label: "Component",
			addon: <IconPuzzle size={20} />,
			description: "Add a reusable component",
			execute: () => {},
		},
		{
			label: "Content Type",
			addon: <IconFileLines size={20} />,
			description: "Add content from a content model",
			subOptions: cmpContentModels
				.filter((model) => model.isActive !== false)
				.map((model) => ({
					label: model.displayName || model.name,
					description: model.description || `Create a new ${(model.displayName || model.name).toLowerCase()}`,
					execute: () => onAddContentFromModel(model),
				})),
		},
	];
}

export function AddContentButtonLabel() {
	return (
		<Box alignItems="center" display="flex" gap="8">
			<IconPlus size={16} />
			<span>Add Content</span>
			<IconChevronDown size={16} />
		</Box>
	);
}
