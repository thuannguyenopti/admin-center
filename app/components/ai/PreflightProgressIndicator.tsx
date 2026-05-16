"use client";

import React from "react";
import {Box, Flex, Heading, Text, Spinner} from "@optiaxiom/react";
import {
	IconChecklist,
	IconCircle,
	IconCheck,
	IconX,
} from "@tabler/icons-react";

/**
 * Checklist item representing the status of an individual audit
 */
interface ChecklistItem {
	label: string;
	status: "pending" | "running" | "completed" | "failed";
}

interface PreflightProgressIndicatorProps {
	checklist: ChecklistItem[];
	title?: string;
}

/**
 * Component that renders a checklist showing audit progress
 * Displays status icons for each audit: pending, running, completed, failed
 */
export function PreflightProgressIndicator({checklist, title = "Running Preflight Audit..."}: PreflightProgressIndicatorProps) {
	return (
		<Box p="12" bg="bg.secondary" style={{borderRadius: "8px"}}>
			<Flex gap="8" alignItems="center" mb="8" style={{flexDirection: "row"}}>
				<IconChecklist size={20} style={{color: "var(--ax-colors-fg-tertiary)"}} />
				<Heading level="4" fontSize="md" fontWeight="600" m="0">
					{title}
				</Heading>
			</Flex>
			<ul style={{padding: 0, margin: 0, listStyle: "none"}}>
				{checklist.map((item, idx) => (
					<Flex key={idx} gap="8" alignItems="center" py="4" style={{flexDirection: "row"}}>
						{item.status === "pending" && (
							<IconCircle size={16} style={{color: "var(--ax-colors-fg-tertiary)"}} />
						)}
						{item.status === "running" && <Spinner size="sm" />}
						{item.status === "completed" && (
							<IconCheck size={16} style={{color: "var(--ax-colors-fg-success)"}} />
						)}
						{item.status === "failed" && <IconX size={16} style={{color: "var(--ax-colors-fg-error)"}} />}
						<Text
							fontSize="sm"
							style={{
								color: item.status === "completed" ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
							}}
						>
							{item.label}
						</Text>
					</Flex>
				))}
			</ul>
		</Box>
	);
}
