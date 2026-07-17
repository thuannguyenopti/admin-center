"use client";

import type { CSSProperties } from "react";
import { Box, Button, Checkbox } from "@optiaxiom/react";
import {
	IconCheck,
	IconXmark,
	IconEye,
	IconEllipsisStroke,
	IconUser,
} from "@optiaxiom/icons";
import { Text } from "@/app/components/Text";

const CHECK_ITEMS = [
	{ id: "blog", label: "Review blog post" },
	{ id: "email", label: "Review email newsletter" },
	{ id: "social", label: "Review social assets" },
];

export function WorkflowDrawer({
	checks,
	done,
	onClose,
	onDone,
	onToggleCheck,
}: {
	checks: Record<string, boolean>;
	done: boolean;
	onClose: () => void;
	onDone: () => void;
	onToggleCheck: (id: string) => void;
}) {
	const checkedCount = CHECK_ITEMS.filter((check) => checks[check.id]).length;
	const assetsStepDone = done || checkedCount === CHECK_ITEMS.length;
	const progress = done ? 100 : 74 + checkedCount * 6;

	return (
		<Box
			className="cmp-workflow-inline-panel"
			bg="bg.default"
			borderL="1"
			borderColor="border.tertiary"
			style={{ display: "flex", flex: "0 0 444px", flexDirection: "column", minHeight: 0, overflow: "auto", width: 444 }}
		>
			<Box display="flex" alignItems="center" justifyContent="space-between" gap="16" px="16" style={{ minHeight: 64 }}>
				<Box display="flex" alignItems="center" gap="16">
					<Box display="flex">
						<span style={avatarCircleStyle}>
							<IconUser size={13} />
						</span>
						<span style={avatarPhotoStyle}>M</span>
						<span style={avatarPhotoStyle}>W</span>
						<span style={avatarCountStyle}>+3</span>
					</Box>
					<IconEye size={18} />
					<Box bg="bg.page" rounded="full" display="flex" alignItems="center" justifyContent="center" style={{ height: 24, width: 24 }}>
						<Text fontSize="xs" fontWeight="700">
							8
						</Text>
					</Box>
				</Box>
				<Button appearance={done ? "default" : "primary"} size="sm" onClick={onDone}>
					{done ? "Completed" : "Mark Complete"}
				</Button>
				<Button appearance="subtle" size="sm" icon={<IconXmark size={18} />} aria-label="Close workflow" onClick={onClose} />
				<IconEllipsisStroke size={18} />
			</Box>
			<Box display="flex" alignItems="center" gap="20" px="16" style={{ paddingTop: 8 }}>
				<Box bg="bg.default.inverse" rounded="full" px="10" style={{ color: "var(--ax-colors-fg-default-inverse)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: 11, letterSpacing: "0.04em", lineHeight: "20px" }}>
					{done ? "COMPLETED" : "IN PROGRESS"}
				</Box>
				<Text fontSize="sm" fontWeight="700">
					Started • May 11
				</Text>
				<Text fontSize="sm" fontWeight="700">
					Due • Jun 28
				</Text>
			</Box>
			<Box bg="bg.page" rounded="full" m="16" style={{ height: 8, overflow: "hidden" }}>
				<Box style={{ background: "var(--ax-colors-fg-secondary)", height: "100%", width: `${progress}%` }} />
			</Box>
			<Box borderB="1" borderColor="border.tertiary" display="flex" gap="24" px="16">
				<Text fontSize="md" fontWeight="700" style={{ borderBottom: "2px solid var(--ax-colors-fg-default)", paddingBottom: 10 }}>
					Workflow
				</Text>
				<Text fontSize="md" color="fg.tertiary">
					Comments
				</Text>
				<Text fontSize="md" color="fg.tertiary">
					Attachments
				</Text>
				<Text fontSize="md" color="fg.tertiary" style={{ marginLeft: "auto" }}>
					→|
				</Text>
			</Box>
			<Text fontSize="lg" fontWeight="700" borderB="1" borderColor="border.tertiary" px="16" py="20">
				Boston Marathon Event Promotion
			</Text>
			<Box display="flex" flexDirection="column" px="16" style={{ paddingBottom: 22, paddingTop: 14 }}>
				<WorkflowStep done title="Brief Created" date="Apr 2" />
				<WorkflowStep done title="Assets Generated" date="Apr 3" />
				<Box borderT="1" borderB="1" borderColor="border.tertiary">
					<WorkflowStep done={assetsStepDone} title="Design Review" date={assetsStepDone ? "Apr 4" : "TODAY"} />
					<Text fontSize="sm" color="fg.tertiary" style={{ margin: "-8px 0 18px 80px" }}>
						Assigned to JC
					</Text>
					<Text fontSize="md" color="fg.tertiary" style={{ margin: "0 0 14px 80px" }}>
						Review all generated assets before approval
					</Text>
					{CHECK_ITEMS.map((check) => {
						const checked = done || Boolean(checks[check.id]);
						return (
							<Box key={check.id} display="flex" alignItems="center" gap="8" style={{ minHeight: 30, paddingLeft: 80 }}>
								<Checkbox checked={checked} onCheckedChange={() => onToggleCheck(check.id)} aria-label={check.label} />
								<Text fontSize="md" fontWeight="600">
									{check.label}
								</Text>
							</Box>
						);
					})}
					<Box display="flex" alignItems="center" gap="20" style={{ margin: "18px 0 0 80px", paddingBottom: 14 }}>
						<Box bg="bg.page" rounded="full" px="8">
							<Text fontSize="xs" fontFamily="mono">
								{assetsStepDone ? "COMPLETE" : "IN PROGRESS"}
							</Text>
						</Box>
						<IconEllipsisStroke size={16} />
					</Box>
				</Box>
				<WorkflowStep done={done} title="Final Approval — Pei Chen" date="Apr 7" />
			</Box>
		</Box>
	);
}

function WorkflowStep({ date, done, title }: { date: string; done?: boolean; title: string }) {
	return (
		<Box display="grid" alignItems="center" gap="12" style={{ gridTemplateColumns: "28px 1fr auto", minHeight: 58 }}>
			<span style={done ? stepDotDoneStyle : stepDotStyle}>{done && <IconCheck size={12} />}</span>
			<Text fontSize="md" fontWeight="600">
				{title}
			</Text>
			<Text fontSize="sm" color="fg.tertiary">
				{date}
			</Text>
		</Box>
	);
}

const avatarCircleStyle: CSSProperties = {
	alignItems: "center",
	background: "var(--ax-colors-bg-default)",
	border: "1px dashed var(--ax-colors-border-secondary)",
	borderRadius: 999,
	color: "var(--ax-colors-fg-default)",
	display: "inline-flex",
	fontSize: 11,
	fontWeight: 800,
	height: 24,
	justifyContent: "center",
	marginLeft: -4,
	width: 24,
};

const avatarPhotoStyle: CSSProperties = {
	alignItems: "center",
	background: "var(--ax-colors-bg-page)",
	border: "2px solid var(--ax-colors-bg-default)",
	borderRadius: 999,
	color: "var(--ax-colors-fg-default)",
	display: "inline-flex",
	fontSize: 11,
	fontWeight: 800,
	height: 24,
	justifyContent: "center",
	marginLeft: -4,
	width: 24,
};

const avatarCountStyle: CSSProperties = {
	...avatarPhotoStyle,
	color: "var(--ax-colors-fg-secondary)",
};

const stepDotStyle: CSSProperties = {
	border: "1px dashed var(--ax-colors-border-secondary)",
	borderRadius: 999,
	display: "inline-block",
	height: 24,
	width: 24,
};

const stepDotDoneStyle: CSSProperties = {
	alignItems: "center",
	background: "#a9ff3f",
	borderRadius: 999,
	color: "#111711",
	display: "inline-flex",
	height: 24,
	justifyContent: "center",
	width: 24,
};
