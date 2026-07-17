"use client";

import { useState } from "react";
import { Box, Button, Textarea } from "@optiaxiom/react";
import { IconXmark } from "@optiaxiom/icons";
import { Text } from "@/app/components/Text";

// "Describe your edit" popover — matches the Image Gen II Figma flow
// (tTfVt7im2cBdVBmnorJ1rl, node 7259:24919): title, a free-text description,
// and a footer that either adds a new queued edit or updates/removes the
// existing one for this slot. Anchored by the caller (EditableImage).
export function EditPopover({
	initialValue = "",
	onCancel,
	onRemove,
	onSubmit,
	title,
}: {
	initialValue?: string;
	onCancel: () => void;
	onRemove?: () => void;
	onSubmit: (description: string) => void;
	title: string;
}) {
	const [draft, setDraft] = useState(initialValue);
	const hasExisting = initialValue.length > 0;

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.default"
			rounded="lg"
			shadow="md"
			p="16"
			style={{ width: 320 }}
			onClick={(event) => event.stopPropagation()}
		>
			<Box display="flex" alignItems="center" justifyContent="space-between" style={{ marginBottom: 10 }}>
				<Text fontSize="md" fontWeight="700">
					{title}
				</Text>
				<Button appearance="subtle" size="sm" icon={<IconXmark size={15} />} aria-label="Close" onClick={onCancel} />
			</Box>
			<Textarea
				aria-label="Describe your edit"
				autoFocus
				placeholder="Describe your edit"
				value={draft}
				onChange={(event) => setDraft(event.target.value)}
				style={{ minHeight: 84, width: "100%" }}
			/>
			<Box display="flex" gap="8" justifyContent="flex-end" style={{ marginTop: 12 }}>
				{hasExisting && onRemove && (
					<Button appearance="subtle" size="sm" onClick={onRemove}>
						Remove
					</Button>
				)}
				<Button appearance="primary" size="sm" disabled={!draft.trim()} onClick={() => onSubmit(draft.trim())}>
					{hasExisting ? "Update" : "Add to Queue"}
				</Button>
			</Box>
		</Box>
	);
}
