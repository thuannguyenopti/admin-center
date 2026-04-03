"use client";

import { Box, Tabs, TabsList, TabsTrigger } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import type { TaskTab } from "../../types";

type PageHeaderProps = {
	activeTab: TaskTab;
	onTabChange: (tab: string) => void;
};

export function PageHeader({ activeTab, onTabChange }: PageHeaderProps) {
	return (
		<Box display="flex" flexDirection="column" style={{ gap: 14, padding: "18px 32px 0" }}>
			<Box alignItems="center" display="flex" style={{ gap: 10 }}>
				<Text color="fg.tertiary" style={{ fontSize: 12, lineHeight: "16px", maxWidth: "none" }}>
					Label
				</Text>
				<Text color="fg.tertiary" style={{ fontSize: 12, lineHeight: "16px", maxWidth: "none" }}>
					/
				</Text>
				<Text color="fg.tertiary" style={{ fontSize: 12, lineHeight: "16px", maxWidth: "none" }}>
					Ca...
				</Text>
				<Text color="fg.tertiary" style={{ fontSize: 12, lineHeight: "16px", maxWidth: "none" }}>
					/
				</Text>
				<Text color="fg.tertiary" style={{ fontSize: 12, lineHeight: "16px", maxWidth: "none" }}>
					TSK...
				</Text>
			</Box>

			<Text
				color="fg.default"
				style={{
					fontSize: 28,
					fontWeight: 500,
					letterSpacing: "-0.8px",
					lineHeight: "40px",
					maxWidth: "none",
				}}
			>
				Ironman Miami triathlon 2026 Sponsor Package
			</Text>

			<Tabs onValueChange={onTabChange} value={activeTab}>
				<TabsList style={{ gap: 20 }}>
					<TabsTrigger value="brief">Brief</TabsTrigger>
					<TabsTrigger value="content">Content</TabsTrigger>
					<TabsTrigger value="fields">Fields</TabsTrigger>
					<TabsTrigger value="publishing">Publishing</TabsTrigger>
					<TabsTrigger value="related">Related</TabsTrigger>
					<TabsTrigger value="financial">Financial</TabsTrigger>
					<TabsTrigger value="history">History</TabsTrigger>
				</TabsList>
			</Tabs>
		</Box>
	);
}
