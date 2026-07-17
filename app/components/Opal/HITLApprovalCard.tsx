"use client";

import {Box, Button, Tooltip} from "@optiaxiom/react";
import {Text} from "../Text";
import {
	IconCheck,
	IconArrowUpRightFromSquare,
	IconListCheck,
	IconLock,
} from "@optiaxiom/icons";
import {useEffect, useState} from "react";

type ApprovalState = "pending" | "approved" | "changes-requested";

type HITLApprovalCardProps = {
	/** Task title shown as "Review needed: [fileName]" */
	fileName: string;
	/** Agent handle, e.g. "@ContentReview" */
	agentHandle?: string;
	/** Due date string, e.g. "Due on July 8 at 4:15PM" */
	dueDate?: string;
	/** Icon inside the green thumbnail (defaults to checklist icon) */
	icon?: React.ReactNode;
	/** Opens the artifact/preview */
	onPreview?: () => void;
	onViewTask?: () => void;
	/** Bold question text in the body */
	approvalTitle: string;
	/** Supporting description below the question */
	approvalDescription: string;
	onApprove?: () => void;
	onRequestChanges?: () => void;
	persistKey?: string;
	approvalState?: ApprovalState;
	approveLabel?: string;
	approveIcon?: React.ReactNode;
	rejectLabel?: string;
	cta?: boolean;
	/** Shows a lock + "You have view only access to this task" instead of action buttons */
	viewOnly?: boolean;
};

export function HITLApprovalCard({
	fileName,
	agentHandle,
	dueDate,
	icon,
	onPreview,
	onViewTask,
	approvalTitle,
	approvalDescription,
	onApprove,
	onRequestChanges,
	persistKey,
	approvalState: controlledState,
	approveLabel = "Approve",
	approveIcon,
	rejectLabel = "Request Changes",
	cta = false,
	viewOnly = false,
}: HITLApprovalCardProps) {
	const [hovered, setHovered] = useState(false);
	const [state, setState] = useState<ApprovalState>(() => {
		if (controlledState) return controlledState;
		if (!persistKey) return "pending";
		try {
			const saved = localStorage.getItem(persistKey);
			if (saved === "approved" || saved === "changes-requested") return saved;
		} catch {}
		return "pending";
	});

	useEffect(() => {
		if (controlledState) setState(controlledState);
	}, [controlledState]);

	const setPersistedState = (next: ApprovalState) => {
		setState(next);
		if (persistKey) {
			try {
				localStorage.setItem(persistKey, next);
			} catch {}
		}
	};

	const handleApprove = (e: React.MouseEvent) => {
		e.stopPropagation();
		onApprove?.();
		if (!cta) setPersistedState("approved");
	};

	const handleRequestChanges = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!cta) setPersistedState("changes-requested");
		onRequestChanges?.();
	};

	const subtitleParts: string[] = [];
	if (agentHandle) subtitleParts.push(agentHandle);
	if (dueDate) subtitleParts.push(dueDate);
	const subtitle = subtitleParts.join(" • ");

	return (
		<Box
			style={{position: "relative"}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<Box
				style={{
					border: hovered
						? "1px solid #a8d49a"
						: "1px solid var(--ax-colors-border-secondary)",
					borderRadius: 12,
					background: "var(--ax-colors-bg-default)",
					overflow: "hidden",
					width: 519,
					height: viewOnly ? 167 : 179,
					transform: hovered ? "translateY(-2px)" : "translateY(0)",
					boxShadow: hovered ? "0 4px 16px rgba(90,154,74,0.12)" : "none",
					transition: "transform 0.18s, border-color 0.18s, box-shadow 0.18s",
				}}
			>
				{/* Header */}
				<Box
					px="16"
					py="12"
					display="flex"
					alignItems="center"
					gap="10"
					onClick={onPreview}
					style={{cursor: onPreview ? "pointer" : "default"}}
				>
					{/* Green thumbnail */}
					<Box
						style={{
							width: 40,
							height: 40,
							borderRadius: 6,
							background: "var(--ax-colors-bg-success-subtle)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexShrink: 0,
						}}
					>
						{icon ?? (
							<IconListCheck
								size={18}
								style={{color: "var(--ax-colors-fg-secondary)"}}
							/>
						)}
					</Box>

					{/* Title + subtitle */}
					<Box style={{flex: 1, minWidth: 0}}>
						<Text
							fontWeight="500"
							style={{
								fontSize: 14,
								lineHeight: "20px",
								color: "var(--ax-colors-fg-default)",
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
								display: "block",
							}}
						>
							Review needed: {fileName}
						</Text>
						{subtitle && (
							<Text
								style={{
									fontSize: 12,
									lineHeight: "16px",
									color: "var(--ax-colors-fg-secondary)",
									display: "block",
									marginTop: 2,
								}}
							>
								{subtitle}
							</Text>
						)}
					</Box>

					{/* External link button */}
					{onPreview && (
						<Tooltip content="Open" delayDuration={300}>
							<Button
								size="sm"
								appearance="subtle"
								style={{width: 28, height: 28, padding: 0, flexShrink: 0}}
								icon={<IconArrowUpRightFromSquare size={14} />}
								onClick={(e) => {
									e.stopPropagation();
									onPreview?.();
								}}
							/>
						</Tooltip>
					)}
				</Box>

				{/* Divider */}
				<Box style={{height: 1, background: "var(--ax-colors-border-secondary)"}} />

				{/* Body */}
				<Box px="16" py="12" display="flex" flexDirection="column" gap="12">
					<Box display="flex" flexDirection="column" gap="4">
						<Text
							fontWeight="500"
							style={{fontSize: 14, lineHeight: "20px", display: "block"}}
						>
							{approvalTitle}
						</Text>
						<Text
							color="fg.secondary"
							style={{fontSize: 14, lineHeight: "20px", display: "block"}}
						>
							{approvalDescription}
						</Text>
					</Box>

					{/* Footer row */}
					{viewOnly ? (
						<Box display="flex" alignItems="center" gap="8">
							<IconLock style={{width: 16, height: 16, color: "var(--ax-colors-fg-secondary)", flexShrink: 0}} />
							<Text fontWeight="500" style={{fontSize: 14, lineHeight: "20px", color: "var(--ax-colors-fg-default)"}}>
								You have view only access to this task
							</Text>
						</Box>
					) : (
						<Box display="flex" alignItems="center" justifyContent="space-between">
							<Button
								appearance="subtle"
								size="sm"
								icon={<IconListCheck />}
								onClick={(e) => {
									e.stopPropagation();
									onViewTask?.();
								}}
							>
								View Task
							</Button>

							{state === "pending" ? (
								<Box display="flex" alignItems="center" gap="8">
									<Button appearance="subtle" size="sm" onClick={handleRequestChanges}>
										{rejectLabel}
									</Button>
									<Button
										appearance="primary"
										size="sm"
										icon={approveIcon !== undefined ? approveIcon : <IconCheck />}
										onClick={handleApprove}
									>
										{approveLabel}
									</Button>
								</Box>
							) : (
								<Text
									fontSize="sm"
									fontWeight="500"
									color={state === "approved" ? "fg.success" : "fg.warning"}
								>
									{state === "approved" ? "Approved" : "Changes requested"}
								</Text>
							)}
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
}
