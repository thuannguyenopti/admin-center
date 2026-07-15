"use client";

import { Button, Menu, MenuContent, MenuTrigger, toaster } from "@optiaxiom/react";
import { IconEllipsisSolid as IconMore } from "@optimizely/axiom-icons";

/** Shared "•••" overflow menu for every dashboard card. Delete is real (removes the card
 * from the dashboard's local layout state); Resize has no backing system yet. */
export function CardOverflowMenu({ editing, onDelete, onToggleEdit }: { editing: boolean; onDelete: () => void; onToggleEdit: () => void }) {
	return (
		<Menu
			options={[
				{ disabledReason: "Coming soon", label: "Resize" },
				{ execute: onToggleEdit, label: "Edit", selected: editing },
				{
					execute: () => {
						onDelete();
						toaster.create("Card removed", { intent: "information" });
					},
					label: "Delete",
				},
			]}
		>
			<MenuTrigger asChild>
				<Button appearance="subtle" aria-label="Card options" icon={<IconMore size={16} />} size="sm" />
			</MenuTrigger>
			<MenuContent />
		</Menu>
	);
}
