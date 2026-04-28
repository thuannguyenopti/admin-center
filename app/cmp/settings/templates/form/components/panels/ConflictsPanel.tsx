"use client";

import { Box } from "@optiaxiom/react";
import {
	DetailsPanel,
	DetailsPanelBody,
	DetailsPanelHeader,
} from "@optiaxiom/react/unstable";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import { IconX, IconAlertTriangle } from "@tabler/icons-react";
import Image from "next/image";
import type { FormConflict } from "../../utils/detectFormConflicts";

const SEVERITY_DOT: Record<string, string> = {
	error: "var(--ax-colors-fg-critical, #dc2626)",
	warning: "#ca8a04",
};

export function ConflictsPanel({
	conflicts,
	activeConflictId,
	isAllHighlighted,
	onHighlightConflict,
	onHighlightAll,
	onClearHighlight,
	onSuggestFixes,
	onClose,
}: {
	conflicts: FormConflict[];
	activeConflictId: string | null;
	isAllHighlighted: boolean;
	onHighlightConflict: (conflict: FormConflict) => void;
	onHighlightAll: () => void;
	onClearHighlight: () => void;
	onSuggestFixes: () => void;
	onClose: () => void;
}) {
	const handleCardClick = (conflict: FormConflict) => {
		if (activeConflictId === conflict.id && !isAllHighlighted) {
			onClearHighlight();
		} else {
			onHighlightConflict(conflict);
		}
	};

	return (
		<DetailsPanel style={{ borderRadius: 0 }}>
			<DetailsPanelHeader>
				<Box display="flex" alignItems="center" justifyContent="space-between" w="full">
					<Box display="flex" alignItems="center" gap="8">
						<IconAlertTriangle size={16} color="#ca8a04" />
						<Text fontWeight="600" color="fg.default">
							{conflicts.length} Issue{conflicts.length !== 1 ? "s" : ""} Found
						</Text>
					</Box>
					<Button
						appearance="subtle"
						icon={<IconX size={16} />}
						onClick={onClose}
						aria-label="Close issues panel"
					/>
				</Box>
			</DetailsPanelHeader>

			<DetailsPanelBody>
				<Box display="flex" flexDirection="column" gap="12" p="16">

					{/* Highlight all — tertiary button */}
					<Button
						appearance="subtle"
						onClick={() => isAllHighlighted ? onClearHighlight() : onHighlightAll()}
						style={{ alignSelf: "flex-start" }}
					>
						{isAllHighlighted ? "Clear highlights" : "Highlight all issues"}
					</Button>

					{/* Conflict cards */}
					{conflicts.map((conflict) => {
						const dotColor = SEVERITY_DOT[conflict.severity] ?? SEVERITY_DOT.warning;
						const isActive = activeConflictId === conflict.id && !isAllHighlighted;

						return (
							<Box
								key={conflict.id}
								rounded="sm"
								onClick={() => handleCardClick(conflict)}
								style={{
									border: isActive
										? "1.5px solid var(--ax-colors-border-accent)"
										: "1px solid var(--ax-colors-border-tertiary)",
									cursor: "pointer",
									boxShadow: isActive ? "0 0 0 3px var(--ax-colors-bg-accent-subtle)" : "none",
									transition: "box-shadow 0.15s ease, border-color 0.15s ease",
									padding: "10px 12px",
									background: isActive ? "var(--ax-colors-bg-accent-subtle)" : "var(--ax-colors-bg-default)",
									display: "flex",
									gap: "8px",
									alignItems: "flex-start",
								}}
							>
								<Box style={{
									width: 6,
									height: 6,
									borderRadius: "50%",
									background: dotColor,
									flexShrink: 0,
									marginTop: 5,
								}} />
								<Text fontSize="sm" color="fg.default" style={{ lineHeight: 1.5 }}>
									{conflict.message}
								</Text>
							</Box>
						);
					})}

					{/* Divider */}
					<Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)", margin: "4px -16px 0" }} />

					{/* Suggest fixes */}
					<Button
						appearance="default-opal"
						onClick={onSuggestFixes}
						icon={<Image src="/opal-orb.png" alt="" width={16} height={16} />}
						style={{ width: "100%", justifyContent: "center" }}
					>
						Suggest fixes
					</Button>
				</Box>
			</DetailsPanelBody>
		</DetailsPanel>
	);
}
