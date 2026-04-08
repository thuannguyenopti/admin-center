"use client";

import { Box } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import type { TaskTab } from "../../types";
import { EditorSurface } from "./EditorSurface";
import { PageHeader } from "../shared/PageHeader";

type BriefEditPageProps = {
	activeTab: TaskTab;
	briefContent: string;
	onBriefContentChange: (value: string) => void;
	onCancel: () => void;
	onSave: () => void;
	onTabChange: (tab: string) => void;
	taskTitle: string;
};

export function BriefEditPage({
	activeTab,
	briefContent,
	onBriefContentChange,
	onCancel,
	onSave,
	onTabChange,
	taskTitle,
}: BriefEditPageProps) {
	return (
		<Box pb="32">
			<PageHeader activeTab={activeTab} onTabChange={onTabChange} taskTitle={taskTitle} />
			<Box display="flex" flexDirection="column" style={{ gap: 18, padding: "24px 28px 0", width: "100%" }}>
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Text color="fg.default" fontSize="xl" fontWeight="500" style={{ maxWidth: "none" }}>
						Brief - {taskTitle}
					</Text>
					<Box alignItems="center" display="flex" style={{ gap: 14 }}>
						<Button appearance="subtle" onClick={onCancel} size="sm">
							Cancel Changes
						</Button>
						<Button appearance="primary" onClick={onSave} size="sm">
							Save
						</Button>
					</Box>
				</Box>

				<EditorSurface content={briefContent} onChange={onBriefContentChange} />
			</Box>
		</Box>
	);
}
