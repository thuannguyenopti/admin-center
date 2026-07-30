"use client";

import React, { useState } from "react";
import { Field, Menu, MenuTrigger, MenuContent, Button, type MenuOption } from "@optiaxiom/react";
import {IconSparkles} from "@/app/lib/axiom-icons";

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

	// Map AIAction[] to MenuOption[]. Actions marked with `group.hidden` belong
	// to the previous action's group (label shown once per group, separator
	// before each new labelled group after the first item).
	let currentGroup: MenuOption["group"];
	const menuOptions: MenuOption[] = aiActions.map((action, index) => {
		if (action.group) {
			if (!action.group.hidden || !currentGroup) {
				currentGroup = { label: action.group.label, separator: index > 0 };
			}
		} else {
			currentGroup = undefined;
		}
		return {
			key: `${index}-${action.label}`,
			label: action.label,
			group: currentGroup,
			execute: () => action.onClick(),
		};
	});

	return (
		<div style={{ position: "relative" }}>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
				<label style={{
					fontSize: "0.875rem",
					fontWeight: "500",
					lineHeight: "1.25rem",
					color: "var(--ax-colors-fg-default)"
				}}>{label}</label>
				<Menu open={isOpen} onOpenChange={setIsOpen} options={menuOptions}>
					<MenuTrigger asChild>
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
					</MenuTrigger>
					<MenuContent align="end" />
				</Menu>
			</div>
			{children}
		</div>
	);
};
