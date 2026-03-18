"use client";

import React, { useState } from "react";
import { Field, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, Button, Text } from "@optiaxiom/react";
import { IconSparkles } from "@tabler/icons-react";

interface AIAction {
	label: string;
	onClick: () => void;
	group?: {
		label: string;
		hidden: boolean;
	};
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
				<label style={{
					fontSize: "0.875rem",
					fontWeight: "500",
					lineHeight: "1.25rem",
					color: "var(--ax-colors-fg-default)"
				}}>{label}</label>
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
						{aiActions.map((action, index) => {
							const needsSeparator = index > 0 && action.group && !action.group.hidden;
							return (
								<React.Fragment key={index}>
									{needsSeparator && <DropdownMenuSeparator />}
									{action.group && !action.group.hidden && (
										<DropdownMenuLabel>{action.group.label}</DropdownMenuLabel>
									)}
									<DropdownMenuItem
										onSelect={() => {
											action.onClick();
										}}
									>
										{action.label}
									</DropdownMenuItem>
								</React.Fragment>
							);
						})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			{children}
		</div>
	);
};
