"use client";

import { Box, Menu, MenuContent, MenuTrigger } from "@optiaxiom/react";
import { Button } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import type { ContentType } from "@/app/db/initialData";
import type { TaskTab } from "../../types";
import { PageHeader } from "../shared/PageHeader";
import { AddContentButtonLabel, buildAddContentMenuOptions } from "./buildAddContentMenuOptions";

type ContentEmptyPageProps = {
	activeTab: TaskTab;
	onAddContent: () => void;
	onAddContentFromModel: (model: ContentType) => void;
	onAddArticle: () => void;
	onTabChange: (tab: string) => void;
	taskTitle: string;
};

export function ContentEmptyPage({
	activeTab,
	onAddContent,
	onAddContentFromModel,
	onAddArticle,
	onTabChange,
	taskTitle,
}: ContentEmptyPageProps) {
	return (
		<Box pb="40" style={{ minHeight: "calc(100vh - 48px)", position: "relative" }}>
			<PageHeader activeTab={activeTab} onTabChange={onTabChange} taskTitle={taskTitle} />
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
							"Add Content" button.
						</Text>
					</Box>
					<Menu options={buildAddContentMenuOptions({
						onAddArticle,
						onAddAsset: onAddContent,
						onAddContentFromModel,
					})}
					>
						<MenuTrigger asChild>
							<Button appearance="primary" size="lg">
								<AddContentButtonLabel />
							</Button>
						</MenuTrigger>
						<MenuContent />
					</Menu>
				</Box>

				</Box>
		</Box>
	);
}
