"use client";

import { useState, useEffect } from "react";
import { Box, Field, Input } from "@optiaxiom/react";
import { DetailsPanel, DetailsPanelBody, DetailsPanelHeader } from "@optiaxiom/react/unstable";
import { Button } from "@/app/components/Button";
import { IconX } from "@tabler/icons-react";
import { Text } from "@/app/components/Text";
import type { Node } from "@xyflow/react";

interface FormContentPanelProps {
	node: Node;
	onClose: () => void;
	onLabelChange: (nodeId: string, label: string) => void;
}

export function FormContentPanel({ node, onClose, onLabelChange }: FormContentPanelProps) {
	const d = node.data as any;
	const [label, setLabel] = useState(String(d.label ?? ""));

	useEffect(() => {
		setLabel(String(d.label ?? ""));
	}, [node.id, d.label]);

	const handleChange = (value: string) => {
		setLabel(value);
		onLabelChange(node.id, value);
	};

	return (
		<DetailsPanel style={{ borderRadius: 0 }}>
			<DetailsPanelHeader>
				<Box display="flex" alignItems="center" justifyContent="space-between" w="full">
					<Box display="flex" alignItems="center" gap="8">
						{d.icon && (
							<Box
								p="6"
								rounded="sm"
								bg="bg.accent.subtle"
								color="fg.default"
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								{d.icon}
							</Box>
						)}
						<Text fontWeight="600" color="fg.default">
							{d.isStartingNode ? "Form Title" : "Content"}
						</Text>
					</Box>
					<Button
						appearance="subtle"
						icon={<IconX size={16} />}
						onClick={onClose}
						aria-label="Close panel"
					/>
				</Box>
			</DetailsPanelHeader>

			<DetailsPanelBody>
				<Box p="16">
					<Field label="Text">
						<Input
							value={label}
							onValueChange={handleChange}
							placeholder="Enter text..."
						/>
					</Field>
				</Box>
			</DetailsPanelBody>
		</DetailsPanel>
	);
}
