"use client";

import { Box, Field, Textarea } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { Caption } from "./Caption";

/**
 * Full-width "write to the submitter" view. Swaps in for a split comparison/verdict
 * layout once a decision needs an explanation, so the compose textarea gets a real
 * writing surface instead of a drawer squeezed into a narrow sidebar column. Shared
 * by the version-review dialog and the Pillar-1 assessment panel so this moment
 * looks and behaves identically everywhere it appears.
 */
export function FeedbackComposeView({
	actionLabel,
	assetImage,
	assetName,
	fieldLabel,
	hint = "OPAL drafted this — edit before sending.",
	intent,
	onCancel,
	onChange,
	onSend,
	sendLabel = "Send & continue",
	value,
}: {
	actionLabel: string;
	assetImage?: string;
	assetName: string;
	fieldLabel: string;
	hint?: string;
	intent?: "success" | "warning" | "danger";
	onCancel: () => void;
	onChange: (value: string) => void;
	onSend: () => void;
	sendLabel?: string;
	value: string;
}) {
	return (
		<Box display="flex" flexDirection="column" style={{ flex: 1, minHeight: 0 }}>
			<Box style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
				<Box display="flex" flexDirection="column" gap="24" style={{ maxWidth: 640, margin: "0 auto", padding: "48px 32px" }}>
					<Box alignItems="center" display="flex" gap="16">
						{assetImage && (
							<img
								alt=""
								src={assetImage}
								style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 10, flexShrink: 0 }}
							/>
						)}
						<Box display="flex" flexDirection="column" gap="2">
							<Caption style={intent ? { color: `var(--ax-colors-fg-${intent})` } : undefined}>{actionLabel}</Caption>
							<Text color="fg.default" fontWeight="600" fontSize="lg">{assetName}</Text>
						</Box>
					</Box>

					<Field info={hint} label={fieldLabel}>
						<Textarea autoFocus onChange={(e) => onChange(e.target.value)} rows={10} value={value} />
					</Field>
				</Box>
			</Box>

			<Box borderT="1" borderColor="border.secondary" display="flex" gap="8" px="32" py="16" style={{ flexShrink: 0 }}>
				<Button appearance="primary" onClick={onSend} size="md">{sendLabel}</Button>
				<Button appearance="default" onClick={onCancel} size="md">Cancel</Button>
			</Box>
		</Box>
	);
}
