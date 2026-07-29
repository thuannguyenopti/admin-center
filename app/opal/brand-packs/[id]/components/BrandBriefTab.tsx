"use client";

import { useState } from "react";
import { Box, Button, Text, Textarea } from "@optiaxiom/react";
import {
	IconPenToSquare as IconEdit,
	IconCheck,
	IconSparkles,
} from "@optimizely/axiom-icons";
import type { BrandPack } from "../../types";

type BrandBriefTabProps = {
	pack: BrandPack;
};

export function BrandBriefTab({ pack }: BrandBriefTabProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [briefText, setBriefText] = useState(pack.brandBrief);
	const [saved, setSaved] = useState(false);

	const handleSave = () => {
		setSaved(true);
		setIsEditing(false);
		setTimeout(() => setSaved(false), 2000);
	};

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{ maxWidth: 760 }}>
			<Box
				bg="bg.default"
				border="1"
				borderColor="border.tertiary"
				display="flex"
				flexDirection="column"
				gap="16"
				p="20"
				rounded="xl"
				shadow="sm"
			>
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Text fontWeight="600" style={{ fontSize: 14 }}>Brand Instruction</Text>
					<Box alignItems="center" display="flex" gap="8">
						{!isEditing && (
							<Button
								appearance="subtle"
								size="sm"
								icon={<IconSparkles />}
								style={{ color: "var(--ax-colors-fg-accent)" }}
							>
								Regenerate with Opal
							</Button>
						)}
						{isEditing ? (
							<>
								<Button appearance="subtle" size="sm" onClick={() => setIsEditing(false)}>
									Cancel
								</Button>
								<Button
									appearance="primary"
									size="sm"
									icon={saved ? <IconCheck /> : undefined}
									onClick={handleSave}
								>
									{saved ? "Saved" : "Save"}
								</Button>
							</>
						) : (
							<Button appearance="subtle" size="sm" icon={<IconEdit />} onClick={() => setIsEditing(true)}>
								Edit
							</Button>
						)}
					</Box>
				</Box>

				{isEditing ? (
					<Textarea
						value={briefText}
						onChange={(e) => setBriefText(e.target.value)}
						rows={8}
						style={{ lineHeight: 1.6 }}
					/>
				) : (
					<Text color="fg.secondary" fontSize="sm" style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
						{briefText}
					</Text>
				)}
			</Box>
		</Box>
	);
}
