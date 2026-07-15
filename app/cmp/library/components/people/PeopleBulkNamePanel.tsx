"use client";

import { Box, Button, Input, Text } from "@optiaxiom/react";
import { IconCheck, IconUserPlus } from "@optimizely/axiom-icons";

type Props = {
	count: number;
	name: string;
	onClear: () => void;
	onNameChange: (name: string) => void;
	onApply: () => void;
};

export function PeopleBulkNamePanel({
	count,
	name,
	onClear,
	onNameChange,
	onApply,
}: Props) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="grid"
			gap="16"
			p="16"
			rounded="md"
			style={{ gridTemplateColumns: "minmax(180px, 1fr) minmax(260px, 420px) auto" }}
		>
			<Box display="flex" flexDirection="column" gap="2">
				<Box alignItems="center" display="flex" gap="8">
					<IconUserPlus size={16} style={{ color: "var(--ax-colors-fg-secondary)" }} />
					<Text fontSize="sm" fontWeight="600">
						{name.trim() ? `Ready to name ${count}` : `${count} selected`}
					</Text>
				</Box>
				<Text color="fg.secondary" fontSize="sm">
					Apply one name to the selected unnamed people.
				</Text>
			</Box>
			<Input
				placeholder="Name selected people..."
				size="md"
				value={name}
				onChange={(event) => onNameChange(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === "Enter" && name.trim()) {
						onApply();
					}
				}}
			/>
			<Box alignItems="center" display="flex" gap="8" justifyContent="end">
				<Button appearance="subtle" size="md" onClick={onClear}>
					Clear
				</Button>
				<Button
					appearance="primary"
					disabled={!name.trim() || count === 0}
					icon={<IconCheck size={14} />}
					iconPosition="start"
					size="md"
					onClick={onApply}
				>
					Apply name
				</Button>
			</Box>
		</Box>
	);
}
