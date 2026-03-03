"use client";

import React, { useState } from "react";
import { Field, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, Button, Text } from "@optiaxiom/react";
import { IconSparkles } from "@tabler/icons-react";

interface AIAction {
	label: string;
	onClick: () => void;
}

interface FieldWithAIActionsProps {
	label: string;
	children: React.ReactNode;
	aiActions?: AIAction[];
}

export const FieldWithAIActions: React.FC<FieldWithAIActionsProps> = ({
	label,
	children,
	aiActions = []
}) => {
	const [isOpen, setIsOpen] = useState(false);

	if (aiActions.length === 0) {
		// No AI actions, render normal field
		return <Field label={label}>{children}</Field>;
	}

	return (
		<div style={{ position: "relative" }}>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
				<Text fontSize="sm" fontWeight="500" asChild>
					<label>{label}</label>
				</Text>
				<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
					<DropdownMenuTrigger asChild>
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconSparkles size={16} />}
							style={{
								padding: "4px",
								minWidth: "auto",
								height: "auto"
							}}
							aria-label="AI Actions"
						/>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{aiActions.map((action, index) => (
							<DropdownMenuItem
								key={index}
								onSelect={() => {
									action.onClick();
								}}
							>
								{action.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			{children}
		</div>
	);
};
