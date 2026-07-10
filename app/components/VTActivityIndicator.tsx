"use client";

import {
	Box,
	Tooltip,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Badge,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import type { VTActivity, VTChange } from "@/app/cms/data/vt-activity";
import {
	IconCheck,
	IconArrowBackUp,
	IconArrowsRotate,
	IconChevronRight,
} from "@/app/lib/axiom-icons";

function statusLabel(activity: VTActivity): string {
	switch (activity.status) {
		case "analyzing":
			return `Analyzing — ${activity.operation}...`;
		case "optimizing":
			return `Reviewing — ${activity.operation}...`;
		case "complete":
			return `${activity.operation} complete`;
		case "error":
			return `${activity.operation} failed`;
		default:
			return "Idle";
	}
}

function ChangeRow({
	change,
	index,
	onUndo,
	onSelect,
}: {
	change: VTChange;
	index: number;
	onUndo?: (index: number) => void;
	onSelect?: (index: number) => void;
}) {
	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="2"
			p="8"
			rounded="sm"
			style={{
				background: change.undone
					? "var(--ax-colors-bg-default)"
					: "var(--ax-colors-bg-secondary)",
				opacity: change.undone ? 0.5 : 1,
				cursor: onSelect ? "pointer" : undefined,
				border: "1px solid transparent",
				transition: "border-color 0.15s",
			}}
			onClick={onSelect ? () => onSelect(index) : undefined}
			className={onSelect ? "vt-change-row" : undefined}
		>
			<Box display="flex" justifyContent="space-between" alignItems="center">
				<Box display="flex" alignItems="center" gap="4">
					{onSelect && (
						<IconChevronRight
							size={12}
							color="var(--ax-colors-fg-tertiary)"
						/>
					)}
					<Text fontSize="xs" fontWeight="500" color="fg.default">
						{change.field}
					</Text>
				</Box>
				{onUndo && (
					<Button
						appearance="subtle"
						size="sm"
						icon={
							change.undone ? (
								<IconArrowsRotate size={12} />
							) : (
								<IconArrowBackUp size={12} />
							)
						}
						aria-label={change.undone ? "Redo" : "Undo"}
						onClick={(e) => {
							e.stopPropagation();
							onUndo(index);
						}}
					/>
				)}
			</Box>
			{!change.undone && (
				<>
					<Text
						fontSize="xs"
						color="fg.tertiary"
						style={{ textDecoration: "line-through" }}
					>
						{change.oldValue}
					</Text>
					<Text fontSize="xs" color="fg.default">
						{change.newValue}
					</Text>
				</>
			)}
			{change.undone && (
				<Text fontSize="xs" color="fg.tertiary">
					Change reverted
				</Text>
			)}
		</Box>
	);
}

function VTAvatar({
	activity,
	onUndoChange,
	onUndoAll,
	onRerun,
	onSelectChange,
}: {
	activity: VTActivity;
	onUndoChange?: (activityId: string, changeIndex: number) => void;
	onUndoAll?: (activityId: string) => void;
	onRerun?: (activityId: string) => void;
	onSelectChange?: (activityId: string, changeIndex: number) => void;
}) {
	const isActive =
		activity.status === "analyzing" || activity.status === "optimizing";
	const isComplete = activity.status === "complete";

	return (
		<Popover>
			<Tooltip
				content={
					<Box display="flex" flexDirection="column" gap="2">
						<Text
							fontSize="sm"
							fontWeight="500"
							color="fg.default.inverse"
						>
							{activity.vtName}
						</Text>
						<Text fontSize="xs" color="fg.default.inverse">
							{activity.vtTemplateName}
						</Text>
						<Text fontSize="xs" color="fg.default.inverse">
							{statusLabel(activity)}
						</Text>
					</Box>
				}
				delayDuration={200}
			>
				<PopoverTrigger asChild>
					<button
						style={{
							position: "relative",
							width: 32,
							height: 32,
							borderRadius: "50%",
							overflow: "visible",
							background: "none",
							border: "none",
							padding: 0,
							cursor: "pointer",
							flexShrink: 0,
						}}
					>
						<Box
							className={isActive ? "vt-active-ring" : undefined}
							style={{
								width: 32,
								height: 32,
								borderRadius: "50%",
								overflow: "hidden",
								background: activity.vtAvatarBg,
							}}
						>
							<img
								src={activity.vtAvatar}
								alt={activity.vtName}
								width={32}
								height={32}
								style={{ display: "block" }}
							/>
						</Box>
						{isComplete && (
							<Box
								style={{
									position: "absolute",
									bottom: -2,
									right: -2,
									width: 16,
									height: 16,
									borderRadius: "50%",
									background: "var(--ax-colors-bg-success)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<IconCheck
									size={10}
									color="white"
									strokeWidth={3}
								/>
							</Box>
						)}
						{isActive && (
							<Box
								style={{
									position: "absolute",
									bottom: -2,
									right: -2,
									width: 16,
									height: 16,
									borderRadius: "50%",
									background:
										"var(--ax-colors-bg-information)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<Box
									style={{
										width: 6,
										height: 6,
										borderRadius: "50%",
										background: "white",
										animation:
											"vt-dot-pulse 1.5s ease-in-out infinite",
									}}
								/>
							</Box>
						)}
					</button>
				</PopoverTrigger>
			</Tooltip>

			<PopoverContent style={{ width: 340 }}>
				<Box display="flex" flexDirection="column" gap="12" p="4">
					{/* Header */}
					<Box display="flex" alignItems="center" gap="10">
						<Box
							style={{
								width: 36,
								height: 36,
								borderRadius: "50%",
								overflow: "hidden",
								background: activity.vtAvatarBg,
								flexShrink: 0,
							}}
						>
							<img
								src={activity.vtAvatar}
								alt={activity.vtName}
								width={36}
								height={36}
								style={{ display: "block" }}
							/>
						</Box>
						<Box display="flex" flexDirection="column" flex="1">
							<Box
								display="flex"
								alignItems="center"
								gap="6"
							>
								<Text
									fontSize="md"
									fontWeight="500"
									color="fg.default"
								>
									{activity.vtName}
								</Text>
								<Badge intent="information" variant="subtle">
									VT
								</Badge>
							</Box>
							<Text fontSize="sm" color="fg.tertiary">
								{activity.vtTemplateName}
							</Text>
						</Box>
					</Box>

					{/* Status card */}
					<Box
						display="flex"
						flexDirection="column"
						gap="4"
						p="10"
						rounded="md"
						bg="bg.secondary"
					>
						<Box
							display="flex"
							justifyContent="space-between"
							alignItems="center"
						>
							<Text
								fontSize="sm"
								fontWeight="500"
								color="fg.default"
							>
								{activity.operation}
							</Text>
							{isActive && (
								<Badge intent="information" variant="subtle">
									In Progress
								</Badge>
							)}
							{isComplete && (
								<Badge intent="success" variant="subtle">
									Done
								</Badge>
							)}
							{activity.status === "error" && (
								<Badge intent="danger" variant="subtle">
									Failed
								</Badge>
							)}
						</Box>
						<Text fontSize="sm" color="fg.tertiary">
							{activity.pageName}
						</Text>
					</Box>

					{/* Changes list */}
					{isComplete &&
						activity.changes &&
						activity.changes.length > 0 && (
							<Box
								display="flex"
								flexDirection="column"
								gap="6"
							>
								<Text
									fontSize="sm"
									fontWeight="500"
									color="fg.default"
								>
									Changes made ({activity.changes.length})
								</Text>
								{activity.changes.map((change, i) => (
									<ChangeRow
										key={i}
										change={change}
										index={i}
										onUndo={
											onUndoChange
												? () =>
														onUndoChange(
															activity.id,
															i
														)
												: undefined
										}
										onSelect={
											onSelectChange
												? () =>
														onSelectChange(
															activity.id,
															i
														)
												: undefined
										}
									/>
								))}
							</Box>
						)}

					{/* Action buttons */}
					{isComplete && (
						<Box
							display="flex"
							gap="8"
							justifyContent="space-between"
							style={{
								borderTop:
									"1px solid var(--ax-colors-border-tertiary)",
								paddingTop: 12,
							}}
						>
							<Button
								appearance="subtle"
								size="sm"
								icon={<IconArrowBackUp size={14} />}
								onClick={() => onUndoAll?.(activity.id)}
							>
								Undo all
							</Button>
							<Button
								appearance="default"
								size="sm"
								icon={<IconArrowsRotate size={14} />}
								onClick={() => onRerun?.(activity.id)}
							>
								Re-run
							</Button>
						</Box>
					)}
				</Box>
			</PopoverContent>
		</Popover>
	);
}

export function VTActivityIndicator({
	activities,
	onUndoChange,
	onUndoAll,
	onRerun,
	onSelectChange,
}: {
	activities: VTActivity[];
	onUndoChange?: (activityId: string, changeIndex: number) => void;
	onUndoAll?: (activityId: string) => void;
	onRerun?: (activityId: string) => void;
	onSelectChange?: (activityId: string, changeIndex: number) => void;
}) {
	const visible = activities.filter((a) => a.status !== "idle");
	if (visible.length === 0) return null;

	return (
		<Box display="flex" alignItems="center" gap="4">
			{visible.map((activity) => (
				<VTAvatar
					key={activity.id}
					activity={activity}
					onUndoChange={onUndoChange}
					onUndoAll={onUndoAll}
					onRerun={onRerun}
					onSelectChange={onSelectChange}
				/>
			))}
		</Box>
	);
}
