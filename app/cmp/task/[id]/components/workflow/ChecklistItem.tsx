<<<<<<< HEAD
"use client";

import { Checkbox } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";

type ChecklistItemProps = {
	checked: boolean;
	label: string;
	onToggle: () => void;
};

export function ChecklistItem({ checked, label, onToggle }: ChecklistItemProps) {
	return (
		<Checkbox checked={checked} onCheckedChange={onToggle}>
			<Text
				color={checked ? "fg.tertiary" : "fg.default"}
				style={{
					fontSize: 14,
					lineHeight: "20px",
					maxWidth: "none",
					textDecoration: checked ? "line-through" : "none",
				}}
			>
				{label}
			</Text>
		</Checkbox>
	);
}
=======
"use client";

import { Checkbox } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";

type ChecklistItemProps = {
	checked: boolean;
	label: string;
	onToggle: () => void;
};

export function ChecklistItem({ checked, label, onToggle }: ChecklistItemProps) {
	return (
		<Checkbox checked={checked} onCheckedChange={onToggle}>
			<Text
				color={checked ? "fg.tertiary" : "fg.default"}
				style={{
					fontSize: 14,
					lineHeight: "20px",
					maxWidth: "none",
					textDecoration: checked ? "line-through" : "none",
				}}
			>
				{label}
			</Text>
		</Checkbox>
	);
}
>>>>>>> origin/main
