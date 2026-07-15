"use client";

import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogBody,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	Box,
	Field,
	LabelMenuButton,
	Menu,
	MenuContent,
	MenuTrigger,
	Select,
	SelectContent,
	SelectTrigger,
	Textarea,
} from "@optiaxiom/react";
import { IconFolder } from "@optimizely/axiom-icons";
import { Text } from "@/app/components/Text";

const REASON_OPTIONS = [
	{ label: "Time-sensitive campaign", value: "time-sensitive" },
	{ label: "False positive", value: "false-positive" },
	{ label: "Approved by brand team", value: "brand-team-approved" },
	{ label: "Other", value: "other" },
];

// Matches the two existing mock folders already in the library (item-3, item-4) plus Home,
// so the picker points at folders that already "exist" in this prototype's data.
const FOLDER_OPTIONS = ["Home", "Campaign Planning", "Social Media Assets"];

/** Confirmation for "Approve anyway" — requires a reason before overriding OPAL's own findings, since the confirmed action gets recorded to auditTrail.ts. Stays mounted (parent just flips `open`) rather than being conditionally rendered, so its own reset logic — not unmount — clears state between uses. */
export function OverrideReasonDialog({
	open,
	itemTitle,
	onCancel,
	onConfirm,
}: {
	open: boolean;
	itemTitle: string;
	onCancel: () => void;
	onConfirm: (reason: string, folder: string) => void;
}) {
	const [reason, setReason] = useState("");
	const [otherDetail, setOtherDetail] = useState("");
	const [folder, setFolder] = useState("Home");

	if (!open) return null;

	const isOther = reason === "other";
	const canConfirm = !!reason && (!isOther || otherDetail.trim().length > 0);

	function reset() {
		setReason("");
		setOtherDetail("");
		setFolder("Home");
	}

	function handleCancel() {
		reset();
		onCancel();
	}

	function handleConfirm() {
		const label = REASON_OPTIONS.find((o) => o.value === reason)?.label ?? reason;
		onConfirm(isOther ? `Other — ${otherDetail.trim()}` : label, folder);
		reset();
	}

	return (
		<>
			<Box style={{ backdropFilter: "blur(8px)", background: "rgba(231, 239, 255, 0.42)", inset: 0, position: "fixed", zIndex: 79 }} />
			<AlertDialog open onOpenChange={(next) => { if (!next) handleCancel(); }}>
				<AlertDialogContent size="md" style={{ maxWidth: 480, width: "min(480px, calc(100vw - 48px))" }}>
					<AlertDialogHeader addonBefore={null}>
						<Text color="fg.default" fontSize="lg" fontWeight="600">Approve despite OPAL findings?</Text>
					</AlertDialogHeader>
					<AlertDialogBody>
						<Box display="flex" flexDirection="column" gap="16">
							<Text color="fg.secondary" fontSize="md">
								&ldquo;{itemTitle}&rdquo; has open OPAL findings. Approving anyway records an override in this asset&rsquo;s audit trail.
							</Text>
							<Field label="Reason for override" required>
								<Select options={REASON_OPTIONS} value={reason} onValueChange={setReason}>
									<SelectTrigger placeholder="Select a reason" />
									<SelectContent />
								</Select>
							</Field>
							{isOther && (
								<Field label="Details" required>
									<Textarea
										placeholder="Describe why this is being approved despite the findings"
										rows={3}
										value={otherDetail}
										onChange={(e) => setOtherDetail(e.target.value)}
									/>
								</Field>
							)}
							<Field label="Save to folder" required>
								<Menu
									options={FOLDER_OPTIONS.map((f) => ({
										label: f,
										addon: <IconFolder size={14} />,
										execute: () => setFolder(f),
										...(folder === f && { selected: true }),
									}))}
								>
									<MenuTrigger asChild>
										<LabelMenuButton label="Folder">
											<span style={{ alignItems: "center", display: "inline-flex", gap: 6 }}>
												<IconFolder size={14} />
												{folder}
											</span>
										</LabelMenuButton>
									</MenuTrigger>
									<MenuContent />
								</Menu>
							</Field>
						</Box>
					</AlertDialogBody>
					<AlertDialogFooter alignItems="center" display="flex" justifyContent="flex-end" style={{ gap: 8 }}>
						<AlertDialogCancel appearance="subtle" onClick={handleCancel}>Cancel</AlertDialogCancel>
						<AlertDialogAction appearance="primary" disabled={!canConfirm} onClick={handleConfirm}>Approve</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
