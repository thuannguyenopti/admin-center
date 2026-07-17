"use client";

import { useMemo } from "react";
import { Box, Menu, MenuTrigger, MenuContent } from "@optiaxiom/react";
import { Button } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { initialContentTypes, type ContentType } from "@/app/db/initialData";
import { initialCmpContentModels } from "@/app/db/cmpInitialData";
import { convertCmpModelToContentType } from "@/app/lib/contentTypeMigration";
import usePersistentState from "@/app/usePersistentState";
import {IconBroadcast, IconChevronDown, IconFileLines, IconImage, IconPlus, IconPuzzle} from "@/app/lib/axiom-icons";
import type { TaskTab } from "../types";
import { figmaAssets } from "../data/assets";
import { PageHeader } from "./PageHeader";

export function ContentEmptyPage({
	activeTab,
	onAddContent,
	onAddContentFromModel,
	onTabChange,
}: {
	activeTab: TaskTab;
	onAddContent: () => void;
	onAddContentFromModel: (model: ContentType) => void;
	onTabChange: (tab: string) => void;
}) {
	const [contentTypes] = usePersistentState("contentTypes", initialContentTypes) as [
		ContentType[],
		(value: ContentType[]) => void,
	];

	// Use CMP content models directly, converted to ContentType format
	const cmpContentModels = useMemo(
		() => initialCmpContentModels.map(convertCmpModelToContentType),
		[]
	);

	return (
		<Box pb="40" style={{ minHeight: "calc(100vh - 48px)", position: "relative" }}>
			<PageHeader activeTab={activeTab} onTabChange={onTabChange} />
			<Box
				alignItems="center"
				display="flex"
				justifyContent="center"
				style={{ minHeight: "calc(100vh - 230px)", padding: "0 28px", position: "relative" }}
			>
				<Box
					alignItems="center"
					display="flex"
					flexDirection="column"
					style={{ gap: 32, maxWidth: 435, position: "relative", textAlign: "center", zIndex: 1 }}
				>
					<Box display="flex" flexDirection="column" style={{ gap: 8 }}>
						<Text color="fg.default" fontSize="3xl" fontWeight="500">
							Add Content
						</Text>
						<Text color="fg.secondary" fontSize="md" style={{ maxWidth: 360 }}>
							Use this workspace to add, revise, and optimize content. You can add assets by clicking the
							{" "}
							"Add Content" button.
						</Text>
					</Box>
					<Menu
						options={[
							{
								label: "Asset",
								addon: <IconImage size={20} />,
								description: "Add assets from recommendations",
								execute: () => onAddContent(),
							},
							{
								label: "From CMS",
								addon: <IconBroadcast size={20} />,
								description: "Add content from CMS",
								execute: () => { /* TODO: Implement CMS content selection */ },
							},
							{
								label: "Component",
								addon: <IconPuzzle size={20} />,
								description: "Add a reusable component",
								execute: () => { /* TODO: Implement component selection */ },
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
						]}
					>
						<MenuTrigger asChild>
							<Button appearance="primary" size="lg">
								<Box alignItems="center" display="flex" gap="8">
									<IconPlus size={16} />
									<span>Add Content</span>
									<IconChevronDown size={16} />
								</Box>
							</Button>
						</MenuTrigger>
						<MenuContent />
					</Menu>
				</Box>

				<img
					alt=""
					aria-hidden="true"
					src={figmaAssets.emptyContentBg}
					style={{
						left: "50%",
						maxWidth: 452,
						opacity: 0.92,
						pointerEvents: "none",
						position: "absolute",
						top: "50%",
						transform: "translate(-50%, -5%)",
						width: "40vw",
					}}
				/>
			</Box>
		</Box>
	);
}
