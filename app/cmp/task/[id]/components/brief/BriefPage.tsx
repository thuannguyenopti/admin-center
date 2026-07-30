"use client";

import { Box } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import {IconEllipsisSolid} from "@/app/lib/axiom-icons";
import { IconBolt } from "@/app/lib/axiom-icons";
import type { TaskTab } from "../../types";
import { BriefBody } from "./BriefBody";
import { PageHeader } from "../shared/PageHeader";

type BriefPageProps = {
	activeTab: TaskTab;
	briefContent: string;
	onOpenEdit: () => void;
	onTabChange: (tab: string) => void;
	taskTitle: string;
};

export function BriefPage({ activeTab, briefContent, onOpenEdit, onTabChange, taskTitle }: BriefPageProps) {
	return (
		<Box pb="32">
			<PageHeader activeTab={activeTab} onTabChange={onTabChange} taskTitle={taskTitle} />
			<Box display="flex" flexDirection="column" style={{ gap: 18, padding: "24px 28px 0", width: "100%" }}>
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Text color="fg.default" fontSize="xl" fontWeight="500" style={{ maxWidth: "none" }}>
						Brief - {taskTitle}
					</Text>
					<Button appearance="subtle" aria-label="More" icon={<IconEllipsisSolid size={18} />} size="sm" />
				</Box>

				<Box
					bg="bg.default"
					border="1"
					borderColor="border.tertiary"
					rounded="lg"
					style={{ lineHeight: 1.5, padding: 16 }}
				>
					<Box display="flex" flexDirection="column" style={{ gap: 16 }}>
						<Box
							alignItems="center"
							display="flex"
							gap="12"
							justifyContent="space-between"
							onClick={onOpenEdit}
							style={{
								alignItems: "center",
								background: "var(--ax-colors-bg-secondary)",
								border: "1px solid var(--ax-colors-border-tertiary)",
								borderRadius: 8,
								cursor: "pointer",
								height: 52,
								maxWidth: "100%",
								minHeight: 48,
								padding: 12,
							}}
						>
							<Text color="fg.secondary" fontSize="md" style={{ flex: 1 }}>
								Opal can suggest existing assets that meet the goals of your brief
							</Text>
							<Button
								appearance="primary"
								icon={<IconBolt size={14} />}
								onClick={(event) => {
									event.stopPropagation();
									onOpenEdit();
								}}
								size="lg"
								style={{
									borderRadius: 6,
									height: 40,
									minHeight: 40,
									padding: "0 12px",
								}}
							>
								Generate
							</Button>
						</Box>

						<Text color="fg.tertiary" fontSize="sm" style={{ maxWidth: "none" }}>
							Last Modified by Sasha Thiel on Jan 25, 2026, 2:58 PM
						</Text>

						<BriefBody content={briefContent} />
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
