"use client";

import { Box, Button, Switch, Tabs, TabsList, TabsTrigger, Tooltip, ToggleButton } from "@optiaxiom/react";
import {
	IconArrowRotateLeft,
	IconArrowRotateRight,
	IconArrowsMaximize,
	IconCode,
	IconCopy,
	IconEllipsisStroke,
	IconEye,
	IconXmark,
} from "@optiaxiom/icons";
import { Text } from "@/app/components/Text";
import type { ContentTab } from "./CanvasStage";

// Canvas header chrome — matches Figma "Image Gen II - 10 Channel Pack Items"
// (node 6708:90368/89886): code/preview toggle, content tabs, rationale switch,
// workflow trigger, and version/copy/fullscreen/close icon buttons.
//
// "Ask Opal" and "Run Now" live here instead of a canvas-owned chat panel —
// there's only ever one real Opal conversation (app/components/OpalPanel.tsx,
// opened via useLayout().opalPanelControls), so the canvas triggers it rather
// than rendering a second, out-of-sync lookalike.
export function Toolbar({
	activeTab,
	onAskOpal,
	onClose,
	onOpenWorkflow,
	onRunQueuedEdits,
	onTabChange,
	onToggleRationale,
	queuedEditsCount,
	showRationale,
	showWorkflow,
}: {
	activeTab: ContentTab;
	onAskOpal: () => void;
	onClose: () => void;
	onOpenWorkflow: () => void;
	onRunQueuedEdits: () => void;
	onTabChange: (tab: ContentTab) => void;
	onToggleRationale: () => void;
	queuedEditsCount: number;
	showRationale: boolean;
	showWorkflow: boolean;
}) {
	return (
		<Box
			bg="bg.default"
			borderB="1"
			borderColor="border.tertiary"
			display="grid"
			alignItems="center"
			px="24"
			// 57px matches the real Opal panel's hardcoded `top: 57px` offset
			// (app/components/OpalPanel.tsx) — it's fixed to sit just below the
			// GlobalBar, which this fullscreen canvas's own toolbar visually
			// replaces. Any other height leaves a gap or an overlapping seam
			// where the panel cuts into this toolbar.
			style={{ gridTemplateColumns: "auto minmax(320px, 1fr) auto", minHeight: 57 }}
		>
			<Box display="flex" alignItems="center" gap="8">
				<ToggleButton size="sm" appearance="subtle" pressed={false} icon={<IconCode size={17} />} aria-label="Code" />
				<ToggleButton size="sm" appearance="subtle" pressed={false} icon={<IconEye size={17} />} aria-label="Preview" />
			</Box>

			<Box aria-label="Content type" display="flex" alignItems="center" justifyContent="center" style={{ height: 64, minWidth: 0, overflow: "hidden" }}>
				<Tabs value={activeTab} onValueChange={(next) => onTabChange(next as ContentTab)}>
					<TabsList>
						<TabsTrigger value="blog">Blog Post</TabsTrigger>
						<TabsTrigger value="social">Social Posts</TabsTrigger>
						<TabsTrigger value="email">Email</TabsTrigger>
					</TabsList>
				</Tabs>
			</Box>

			<Box className="cmp-canvas-toolbar-right" display="flex" alignItems="center" gap="16" justifyContent="flex-end">
				{queuedEditsCount > 0 && (
					<Button appearance="primary" size="sm" onClick={onRunQueuedEdits}>
						Run Now ({queuedEditsCount})
					</Button>
				)}
				<Tooltip content="Ask Opal">
					<Button appearance="subtle" size="sm" icon={<img alt="" src="/opal-orb.png" style={{ borderRadius: 4, height: 18, width: 18 }} />} aria-label="Ask Opal" onClick={onAskOpal} />
				</Tooltip>
				{showWorkflow ? (
					<Tooltip content="More">
						<Button appearance="subtle" size="sm" icon={<IconEllipsisStroke size={18} />} aria-label="More" />
					</Tooltip>
				) : (
					<>
						<Box display="flex" alignItems="center" gap="8">
							<Switch checked={showRationale} onCheckedChange={onToggleRationale} />
							<Text fontSize="sm" fontWeight="700">
								Rationale
							</Text>
						</Box>
						<Button appearance="subtle" size="sm" onClick={onOpenWorkflow}>
							Workflow
						</Button>
						<Tooltip content="Previous Version">
							<Button appearance="subtle" size="sm" icon={<IconArrowRotateLeft size={17} />} aria-label="Previous Version" />
						</Tooltip>
						<Tooltip content="Next Version">
							<Button appearance="subtle" size="sm" icon={<IconArrowRotateRight size={17} />} aria-label="Next Version" />
						</Tooltip>
						<Tooltip content="Copy">
							<Button appearance="subtle" size="sm" icon={<IconCopy size={17} />} aria-label="Copy" />
						</Tooltip>
						<Tooltip content="Fullscreen">
							<Button appearance="subtle" size="sm" icon={<IconArrowsMaximize size={17} />} aria-label="Fullscreen" />
						</Tooltip>
						<Tooltip content="Close chat window">
							<Button appearance="subtle" size="sm" icon={<IconXmark size={17} />} aria-label="Close" onClick={onClose} />
						</Tooltip>
					</>
				)}
			</Box>
			<Box className="cmp-canvas-toolbar-short" display="none" alignItems="center" gap="16" justifyContent="flex-end">
				{!showWorkflow && (
					<Tooltip content="Close chat window">
						<Button appearance="subtle" size="sm" icon={<IconXmark size={17} />} aria-label="Close" onClick={onClose} />
					</Tooltip>
				)}
				<Button appearance="subtle" size="sm" icon={<IconEllipsisStroke size={18} />} aria-label="More" />
			</Box>
		</Box>
	);
}
