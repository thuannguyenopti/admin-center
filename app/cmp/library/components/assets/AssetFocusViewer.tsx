"use client";

import { useEffect, useState } from "react";
import { Box, Dialog, DialogContent } from "@optiaxiom/react";
import { CURRENT_USER, recordDecision, type DecisionAction } from "../../auditTrail";
import { AssetFocusPanel } from "./AssetFocusPanel";
import { AssetFocusStage } from "./AssetFocusStage";
import { AssetFocusToolbar, stepZoom } from "./AssetFocusToolbar";
import { AssetReviewActionsPanel } from "./AssetReviewActionsPanel";
import { OverrideReasonDialog } from "./OverrideReasonDialog";
import { VersionReviewDialog } from "./VersionReviewDialog";
import type { LibraryItem } from "../../page";

/**
 * Asset focus view — an in-page content mode (not a modal), matching Figma's Detail/Full
 * screen view exactly: it replaces the toolbar+grid inside the existing page shell, so the
 * global bar and sidenav stay visible and interactive throughout, including in fullscreen
 * (chromeHidden) mode. AssetFocusStage owns the big image; AssetFocusPanel is a plain
 * docked sibling in the same row, not a floating/modal panel.
 */
export function AssetFocusViewer({
	item,
	items,
	onNavigate,
	onClose,
}: {
	item: LibraryItem;
	items: LibraryItem[];
	onNavigate: (item: LibraryItem) => void;
	onClose: () => void;
}) {
	const [chromeHidden, setChromeHidden] = useState(false);
	const [zoom, setZoom] = useState<"fit" | number>("fit");
	const [activeMarkerIndex, setActiveMarkerIndex] = useState<number | null>(null);
	const [reviewingVersion, setReviewingVersion] = useState(false);
	const [reviewingAssessment, setReviewingAssessment] = useState(false);
	const [showOverrideDialog, setShowOverrideDialog] = useState(false);
	const [confirmingToolbarAction, setConfirmingToolbarAction] = useState<"delete" | "task" | null>(null);

	const needsOpalAction = item.opalStatus === "flagged" || item.opalStatus === "pending";
	// Includes the toolbar's own delete/create-task confirmations — without this, Escape on
	// one of those would fall through to this component's own keydown handler below and
	// close the whole viewer out from under the AlertDialog it was meant to dismiss.
	const nestedDialogOpen = reviewingVersion || reviewingAssessment || showOverrideDialog || confirmingToolbarAction !== null;

	const currentIndex = items.findIndex((candidate) => candidate.id === item.id);
	const hasPrev = currentIndex > 0;
	const hasNext = currentIndex !== -1 && currentIndex < items.length - 1;

	// Findings differ per asset, so the active marker doesn't carry over between them.
	// chromeHidden is left as-is — someone browsing image-only via arrows likely wants to stay that way.
	useEffect(() => { setActiveMarkerIndex(null); }, [item.id]);

	// Guarded so arrow keys/Escape typed into a draft textarea (version review, request
	// changes, override reason) don't navigate or close the viewer out from under it. There's
	// no Dialog here anymore to provide Escape-to-close for free, so it's handled explicitly:
	// Escape exits fullscreen first if active, otherwise closes back to the grid.
	//
	// Registered on the capture phase deliberately: a nested AlertDialog/Dialog dismisses
	// itself on Escape via a synchronous (flushSync-style) state update, which re-runs this
	// effect and re-attaches the listener *while the same native keydown event is still being
	// dispatched*. A bubble-phase listener would see that freshly-reattached listener on its
	// way back up through window and fire again for the very keystroke that was meant to only
	// close the nested dialog. Capture-phase listeners on window run once, at the very start of
	// dispatch, before any of that cascading can happen — so nestedDialogOpen is read from
	// before this keystroke did anything, not after.
	useEffect(() => {
		if (nestedDialogOpen) return;
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "ArrowLeft" && hasPrev) onNavigate(items[currentIndex - 1]);
			else if (event.key === "ArrowRight" && hasNext) onNavigate(items[currentIndex + 1]);
			else if (event.key === "Escape") {
				if (chromeHidden) setChromeHidden(false);
				else onClose();
			}
			else if (event.key === "+" || event.key === "=") setZoom((current) => stepZoom(current, 1));
			else if (event.key === "-" || event.key === "_") setZoom((current) => stepZoom(current, -1));
		}
		window.addEventListener("keydown", onKeyDown, true);
		return () => window.removeEventListener("keydown", onKeyDown, true);
	}, [nestedDialogOpen, hasPrev, hasNext, currentIndex, items, onNavigate, chromeHidden, onClose]);

	const ACTION_BY_KEY: Record<string, DecisionAction> = {
		approved: "approved",
		changes: "changes-requested",
		rejected: "rejected",
	};

	return (
		<>
			<Box display="flex" flexDirection="column" gap="16" style={{ flex: 1, minHeight: 0 }}>
				{!chromeHidden && (
					<AssetFocusToolbar
						confirming={confirmingToolbarAction}
						item={item}
						needsOpalAction={needsOpalAction}
						setConfirming={setConfirmingToolbarAction}
						onApproveAnyway={() => setShowOverrideDialog(true)}
						onClose={onClose}
						onOpenAssessment={() => setReviewingAssessment(true)}
						onZoomChange={setZoom}
						zoom={zoom}
					/>
				)}
				<Box display="flex" gap="16" style={{ flex: 1, minHeight: 0 }}>
					<AssetFocusStage
						activeMarkerIndex={activeMarkerIndex}
						chromeHidden={chromeHidden}
						hasNext={hasNext}
						hasPrev={hasPrev}
						item={item}
						onHoverMarker={setActiveMarkerIndex}
						onNext={() => hasNext && onNavigate(items[currentIndex + 1])}
						onPrev={() => hasPrev && onNavigate(items[currentIndex - 1])}
						onToggleChrome={() => setChromeHidden((v) => !v)}
						onZoomChange={setZoom}
						zoom={zoom}
					/>
					{!chromeHidden && (
						<AssetFocusPanel
							activeMarkerIndex={activeMarkerIndex}
							item={item}
							onHoverMarker={setActiveMarkerIndex}
							onReviewChanges={() => setReviewingVersion(true)}
						/>
					)}
				</Box>
			</Box>

			<VersionReviewDialog item={item} open={reviewingVersion} onClose={() => setReviewingVersion(false)} />

			{needsOpalAction && (
				<Dialog open={reviewingAssessment} onOpenChange={setReviewingAssessment}>
					<DialogContent size="md" style={{ height: "min(680px, 82vh)", width: "min(560px, calc(100vw - 48px))" }}>
						<AssetReviewActionsPanel
							item={item}
							onAction={(key, draft) => {
								recordDecision({
									action: ACTION_BY_KEY[key] ?? "changes-requested",
									actor: CURRENT_USER,
									itemId: item.id,
									itemTitle: item.title,
									note: draft,
								});
								setReviewingAssessment(false);
							}}
						/>
					</DialogContent>
				</Dialog>
			)}

			<OverrideReasonDialog
				itemTitle={item.title}
				open={showOverrideDialog}
				onCancel={() => setShowOverrideDialog(false)}
				onConfirm={(reason, folder) => {
					recordDecision({ action: "overridden", actor: CURRENT_USER, itemId: item.id, itemTitle: item.title, note: `${reason} — filed to ${folder}` });
					setShowOverrideDialog(false);
				}}
			/>
		</>
	);
}
