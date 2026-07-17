"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogBody,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	Box,
	Menu,
	MenuContent,
	MenuTrigger,
	toaster,
	Tooltip,
} from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import {
	IconChevronDown,
	IconDownload,
	IconPenToSquare,
	IconPlus,
	IconShareNodes as IconShare,
	IconTrashCan,
} from "@optimizely/axiom-icons";
import type { LibraryItem } from "../../page";

export const ZOOM_LEVELS = [50, 75, 100, 150, 200, 300];

// "fit" has no numeric position to step from, so the first +/- press (keyboard or menu)
// lands on 100% — the natural anchor point — then subsequent presses walk ZOOM_LEVELS.
export function stepZoom(current: "fit" | number, direction: 1 | -1): "fit" | number {
	if (current === "fit") return 100;
	const index = ZOOM_LEVELS.indexOf(current);
	const nextIndex = Math.min(Math.max(index + direction, 0), ZOOM_LEVELS.length - 1);
	return ZOOM_LEVELS[nextIndex];
}

/**
 * Toolbar above the image+panel row — matches Figma's Detail view "bar": zoom controls
 * left, delete/download/send/edit center, Close + a primary right-hand action. The
 * primary slot is Create Task for a plain approved asset, or the OPAL review cluster
 * when the asset needs a decision — the two never appear together, since each is "the
 * one decisive action for this screen."
 */
export function AssetFocusToolbar({
	item,
	zoom,
	onZoomChange,
	onClose,
	needsOpalAction,
	onOpenAssessment,
	onApproveAnyway,
	confirming,
	setConfirming,
}: {
	item: LibraryItem;
	zoom: "fit" | number;
	onZoomChange: (zoom: "fit" | number) => void;
	onClose: () => void;
	needsOpalAction: boolean;
	onOpenAssessment: () => void;
	onApproveAnyway: () => void;
	confirming: "delete" | "task" | null;
	setConfirming: (value: "delete" | "task" | null) => void;
}) {
	function download() {
		if (!item.image) return;
		const link = document.createElement("a");
		link.href = item.image;
		link.download = item.title;
		link.click();
		toaster.create("Download started", { intent: "success" });
	}

	function copyLink() {
		navigator.clipboard?.writeText(`https://axiom-play-lac.vercel.app/cmp/library?asset=${item.id}`);
		toaster.create("Link copied to clipboard", { intent: "success" });
	}

	return (
		<>
			<Box alignItems="center" bg="bg.default" display="flex" gap="8" justifyContent="space-between" p="12" rounded="lg" style={{ flexWrap: "wrap", rowGap: 8 }}>
				<Box display="flex" gap="8">
					<Button appearance={zoom === "fit" ? "default" : "subtle"} size="lg" onClick={() => onZoomChange("fit")}>Fit</Button>
					<Menu
						options={ZOOM_LEVELS.map((level) => ({
							label: `${level}%`,
							execute: () => onZoomChange(level),
							...(zoom === level && { selected: true }),
						}))}
					>
						<MenuTrigger asChild>
							<Button appearance={zoom !== "fit" ? "default" : "subtle"} icon={<IconChevronDown size={14} />} iconPosition="end" size="lg">
								{zoom === "fit" ? "100%" : `${zoom}%`}
							</Button>
						</MenuTrigger>
						<MenuContent />
					</Menu>
				</Box>

				{/* Delete/download/share/edit are asset-management actions for an already-approved
				  asset. An item still under OPAL review hasn't earned them yet — the only
				  decisions available are the Reject/Approve anyway/Request changes cluster
				  on the right, so this middle group is omitted entirely rather than shown
				  disabled or dead. */}
				{!needsOpalAction && (
					<Box display="flex" gap="8">
						<Tooltip content="Delete">
							<Button appearance="subtle" icon={<IconTrashCan size={16} />} aria-label="Delete" size="lg" onClick={() => setConfirming("delete")} />
						</Tooltip>
						<Tooltip content="Download">
							<Button appearance="subtle" icon={<IconDownload size={16} />} aria-label="Download" size="lg" onClick={download} />
						</Tooltip>
						<Menu options={[{ label: "Copy link", execute: copyLink }]}>
							<MenuTrigger asChild>
								<span>
									<Tooltip content="Share">
										<Button appearance="subtle" icon={<IconShare size={16} />} aria-label="Share" size="lg" />
									</Tooltip>
								</span>
							</MenuTrigger>
							<MenuContent />
						</Menu>
						<Tooltip content="Editing coming soon">
							<Button appearance="subtle" disabled icon={<IconPenToSquare size={16} />} aria-label="Edit" size="lg" />
						</Tooltip>
					</Box>
				)}

				<Box display="flex" gap="8">
					<Button appearance="default" size="lg" onClick={onClose}>Close</Button>
					{needsOpalAction ? (
						<>
							<Button appearance="subtle" size="lg" style={{ color: "var(--ax-colors-fg-error)" }} onClick={onOpenAssessment}>Reject</Button>
							<Button appearance="default" size="lg" onClick={onApproveAnyway}>Approve anyway</Button>
							<Button appearance="primary" size="lg" onClick={onOpenAssessment}>Request changes</Button>
						</>
					) : (
						<Button appearance="primary" icon={<IconPlus size={16} />} size="lg" onClick={() => setConfirming("task")}>Create Task</Button>
					)}
				</Box>
			</Box>

			<AlertDialog open={confirming === "delete"} onOpenChange={(next) => { if (!next) setConfirming(null); }}>
				<AlertDialogContent size="md" style={{ maxWidth: 440, width: "min(440px, calc(100vw - 48px))" }}>
					<AlertDialogHeader addonBefore={null}>
						<Text color="fg.default" fontSize="lg" fontWeight="600">Delete this asset?</Text>
					</AlertDialogHeader>
					<AlertDialogBody>
						<Text color="fg.secondary" fontSize="md">
							&ldquo;{item.title}&rdquo; will be removed from the library. This can&rsquo;t be undone.
						</Text>
					</AlertDialogBody>
					<AlertDialogFooter alignItems="center" display="flex" justifyContent="flex-end" style={{ gap: 8 }}>
						<AlertDialogCancel appearance="subtle" onClick={() => setConfirming(null)}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							appearance="danger"
							onClick={() => {
								setConfirming(null);
								toaster.create(`"${item.title}" deleted`, { intent: "success" });
								onClose();
							}}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={confirming === "task"} onOpenChange={(next) => { if (!next) setConfirming(null); }}>
				<AlertDialogContent size="md" style={{ maxWidth: 440, width: "min(440px, calc(100vw - 48px))" }}>
					<AlertDialogHeader addonBefore={null}>
						<Text color="fg.default" fontSize="lg" fontWeight="600">Create a task for this asset?</Text>
					</AlertDialogHeader>
					<AlertDialogBody>
						<Text color="fg.secondary" fontSize="md">
							A new task will be created for &ldquo;{item.title}&rdquo; in the current project.
						</Text>
					</AlertDialogBody>
					<AlertDialogFooter alignItems="center" display="flex" justifyContent="flex-end" style={{ gap: 8 }}>
						<AlertDialogCancel appearance="subtle" onClick={() => setConfirming(null)}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							appearance="primary"
							onClick={() => {
								setConfirming(null);
								toaster.create("Task created", { intent: "success" });
							}}
						>
							Create Task
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
