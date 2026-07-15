"use client";

import { Box, Button, Input, Text } from "@optiaxiom/react";
import { IconCheck } from "@optimizely/axiom-icons";

type Props = {
	draftName: string;
	hovered: boolean;
	isEditing: boolean;
	isNamed: boolean;
	name: string;
	onCancelEdit: () => void;
	onConfirmEdit: () => void;
	onDraftNameChange: (name: string) => void;
};

export function PersonCardFooter({
	draftName,
	hovered,
	isEditing,
	isNamed,
	name,
	onCancelEdit,
	onConfirmEdit,
	onDraftNameChange,
}: Props) {
	return (
		<Box px="12" py="10" style={{ minHeight: 42 }}>
			{!isNamed && isEditing ? (
				<form
					onClick={(event) => event.stopPropagation()}
					onSubmit={(event) => {
						event.preventDefault();
						onConfirmEdit();
					}}
					style={{ alignItems: "center", display: "flex", gap: 6 }}
				>
					<Input
						autoFocus
						value={draftName}
						onChange={(event) => onDraftNameChange(event.target.value)}
						onBlur={onConfirmEdit}
						onKeyDown={(event) => {
							if (event.key === "Escape") {
								event.stopPropagation();
								onCancelEdit();
							}
						}}
						placeholder="Type a name..."
						size="md"
						style={{ minWidth: 0 }}
					/>
					<Button
						appearance="primary"
						aria-label="Save name"
						disabled={!draftName.trim()}
						icon={<IconCheck size={13} />}
						size="sm"
						type="submit"
					/>
				</form>
			) : (
				<Box alignItems="center" display="flex" gap="6" justifyContent="space-between">
					<Text
						color={isNamed ? "fg.default" : "fg.secondary"}
						fontSize="sm"
						fontWeight={isNamed ? "600" : "500"}
						style={{
							flex: 1,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{name}
						</Text>
						{!isNamed && hovered ? (
							<Text color="fg.secondary" fontSize="xs" fontWeight="600" style={{ flexShrink: 0 }}>
								click to name
							</Text>
					) : null}
				</Box>
			)}
		</Box>
	);
}
