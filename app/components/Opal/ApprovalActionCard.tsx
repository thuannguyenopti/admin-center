<<<<<<< HEAD
"use client";

import { Box, Button } from "@optiaxiom/react";
import { Text } from "../Text";
import { IconCheck, IconXmark, IconArrowUpRightFromSquare } from "@/app/lib/axiom-icons";
import { useState } from "react";

type ApprovalState = "pending" | "approved" | "rejected";

type ApprovalActionCardProps = {
  title: string;
  description: string;
  thumbnail?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onOpenTask?: () => void;
};

export function ApprovalActionCard({
  title,
  description,
  thumbnail,
  onApprove,
  onReject,
  onOpenTask,
}: ApprovalActionCardProps) {
  const [state, setState] = useState<ApprovalState>("pending");

  const handleApprove = () => {
    setState("approved");
    onApprove?.();
  };

  const handleReject = () => {
    setState("rejected");
    onReject?.();
  };

  return (
    <Box
      display="flex"
      alignItems="stretch"
      rounded="lg"
      border="1"
      borderColor="border.default"
      bg="bg.default"
      style={{
        minWidth: "66.667%",
        width: "fit-content",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      {/* Thumbnail / preview area */}
      <Box
        bg="bg.secondary"
        display="flex"
        flexDirection="column"
        style={{ width: 120, flexShrink: 0, position: "relative" }}
      >
        {thumbnail ? (
          <img src={thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            gap="4"
            p="12"
            style={{ height: "100%" }}
          >
            {/* Mock doc preview lines */}
            <Box style={{ height: 6, borderRadius: 3, background: "var(--ax-colors-bg-tertiary)", width: "80%" }} />
            <Box style={{ height: 6, borderRadius: 3, background: "var(--ax-colors-bg-tertiary)", width: "60%" }} />
            <Box style={{ height: 6, borderRadius: 3, background: "var(--ax-colors-bg-tertiary)", width: "70%" }} />
            <Box style={{ height: 6, borderRadius: 3, background: "var(--ax-colors-bg-tertiary)", width: "50%" }} />
            <Box style={{ height: 6, borderRadius: 3, background: "var(--ax-colors-bg-tertiary)", width: "65%" }} />
            {/* Label */}
            <Box mt="auto">
              <Text fontSize="xs" color="fg.tertiary" fontWeight="500">Vari.</Text>
            </Box>
          </Box>
        )}
      </Box>

      {/* Content + actions */}
      <Box display="flex" flexDirection="column" justifyContent="space-between" p="16" style={{ flex: 1, minWidth: 0 }}>
        <Box display="flex" flexDirection="column" gap="4">
          <Text fontWeight="600" style={{ fontSize: 14, lineHeight: "20px" }}>
            {title}
          </Text>
          <Text
            color="fg.secondary"
            style={{
              fontSize: 13,
              lineHeight: "18px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 3,
            }}
          >
            {description}
          </Text>
        </Box>

        {state === "pending" ? (
          <Box display="flex" alignItems="center" justifyContent="space-between" gap="8" mt="12">
            {onOpenTask ? (
              <button
                type="button"
                onClick={onOpenTask}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--ax-colors-fg-accent)",
                }}
              >
                View Task
                <IconArrowUpRightFromSquare size={12} />
              </button>
            ) : (
              <Box />
            )}
            <Box display="flex" alignItems="center" gap="8">
              <Button
                appearance="subtle"
                size="sm"
                icon={<IconXmark size={14} />}
                onClick={handleReject}
                aria-label="Reject"
              />
              <Button
                appearance="subtle"
                size="sm"
                icon={<IconCheck size={14} />}
                onClick={handleApprove}
                aria-label="Approve"
                style={{ color: "var(--ax-colors-fg-success)" }}
              />
            </Box>
          </Box>
        ) : (
          <Box mt="12">
            <Text
              fontSize="sm"
              fontWeight="500"
              color={state === "approved" ? "fg.success" : "fg.error"}
            >
              {state === "approved" ? "Approved" : "Rejected"}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
=======
"use client";

import {Badge, Box, Button, Separator, Tooltip} from "@optiaxiom/react";
import {Text} from "../Text";
import {
	IconCheck,
	IconCode,
	IconArrowUpRightFromSquare,
	IconListCheck,
	IconMessageLines,
	IconThumbtack,
	IconEllipsisSolid,
} from "@optiaxiom/icons";
import {useEffect, useState} from "react";

type ApprovalState = "pending" | "approved" | "changes-requested";

type ApprovalActionCardProps = {
	authorName: string;
	authorAvatar?: string;
	isVAU?: boolean;
	badge?: string;
	fileName: string;
	fileSubtitle: string;
	onPreview?: () => void;
	onViewTask?: () => void;
	approvalTitle: string;
	approvalDescription: string;
	onApprove?: () => void;
	onRequestChanges?: () => void;
	selected?: boolean;
	/** localStorage key — persists approval state across navigation until demo reset */
	persistKey?: string;
	/** Controlled approval state — overrides internal state when provided */
	approvalState?: ApprovalState;
	/** Override the file-row icon (default: code icon) */
	icon?: React.ReactNode;
	/** Primary button label (default: "Approve") */
	approveLabel?: string;
	/** Primary button icon. Pass null to hide; defaults to a check. */
	approveIcon?: React.ReactNode;
	/** Secondary button label (default: "Ask Changes") */
	rejectLabel?: string;
	/** CTA mode: buttons invoke their handlers without flipping to an approved/changes state */
	cta?: boolean;
};

export function ApprovalActionCard({
	authorName,
	authorAvatar,
	isVAU,
	badge,
	fileName,
	fileSubtitle,
	onPreview,
	onViewTask,
	approvalTitle,
	approvalDescription,
	onApprove,
	onRequestChanges,
	selected = false,
	persistKey,
	approvalState: controlledState,
	icon,
	approveLabel = "Approve",
	approveIcon,
	rejectLabel = "Ask Changes",
	cta = false,
}: ApprovalActionCardProps) {
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
	const [hovered, setHovered] = useState(false);

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
		// Call onApprove before persisting so the handler's localStorage guard
		// hasn't been set yet and can run its send logic first.
		onApprove?.();
		if (!cta) setPersistedState("approved");
	};

	const handleRequestChanges = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!cta) setPersistedState("changes-requested");
		onRequestChanges?.();
	};

	return (
		<Box
			style={{position: "relative"}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{/* Hover action bar */}
			{hovered && (
				<Box
					rounded="lg"
					style={{
						position: "absolute",
						top: -44,
						right: 0,
						display: "flex",
						alignItems: "center",
						gap: 1,
						background: "var(--ax-colors-bg-default)",
						border: "1px solid var(--ax-colors-border-secondary)",
						padding: "5px 7px",
						zIndex: 10,
					}}
				>
					{["👍", "❤️", "😂"].map((e) => (
						<Tooltip key={e} content={e} delayDuration={300}>
							<Box
								rounded="sm"
								style={{
									cursor: "pointer",
									fontSize: 18,
									padding: "2px 4px",
									lineHeight: 1,
								}}
							>
								{e}
							</Box>
						</Tooltip>
					))}
					<Tooltip content="Add reaction" delayDuration={300}>
						<Box
							rounded="sm"
							style={{
								cursor: "pointer",
								fontSize: 18,
								padding: "2px 4px",
								color: "var(--ax-colors-fg-tertiary)",
								lineHeight: 1,
							}}
						>
							😊
						</Box>
					</Tooltip>
					<Box
						style={{
							width: 1,
							height: 20,
							background: "var(--ax-colors-border-secondary)",
							margin: "0 3px",
							flexShrink: 0,
						}}
					/>
					<Tooltip content="Reply in thread" delayDuration={300}>
						<Button
							size="sm"
							appearance="subtle"
							style={{width: 30, height: 30, padding: 0}}
							icon={<IconMessageLines size={15} />}
						/>
					</Tooltip>
					<Tooltip content="Pin message" delayDuration={300}>
						<Button
							size="sm"
							appearance="subtle"
							style={{width: 30, height: 30, padding: 0}}
							icon={<IconThumbtack size={15} />}
						/>
					</Tooltip>
					<Tooltip content="More options" delayDuration={300}>
						<Button
							size="sm"
							appearance="subtle"
							style={{width: 30, height: 30, padding: 0}}
							icon={<IconEllipsisSolid size={15} />}
						/>
					</Tooltip>
				</Box>
			)}
			<Box
				rounded="lg"
				onClick={onPreview}
				style={{
					border: selected
						? "1.5px solid var(--ax-colors-border-default)"
						: "1px solid var(--ax-colors-border-secondary)",
					outline: selected
						? "3px solid color-mix(in srgb, var(--ax-colors-border-default) 40%, transparent)"
						: "none",
					outlineOffset: 0,
					background: hovered
						? "var(--ax-colors-bg-secondary)"
						: "var(--ax-colors-bg-default)",
					overflow: "hidden",
					maxWidth: 560,
					cursor: onPreview ? "pointer" : "default",
					transition: "background 0.15s ease",
				}}
			>
				{/* Author + file section */}
				<Box px="16" py="12" display="flex" flexDirection="column" gap="10">
					{/* Author row */}
					<Box display="flex" alignItems="center" justifyContent="space-between">
						<Box display="flex" alignItems="center" gap="6">
							<span
								style={{
									position: "relative",
									display: "inline-flex",
									flexShrink: 0,
								}}
							>
								{authorAvatar ? (
									<img
										src={authorAvatar}
										alt={authorName}
										width={20}
										height={20}
										style={{
											width: 20,
											height: 20,
											borderRadius: "50%",
											objectFit: "cover",
										}}
									/>
								) : (
									<span
										style={{
											width: 20,
											height: 20,
											borderRadius: "50%",
											background: "var(--ax-colors-bg-avatar-green)",
											display: "inline-flex",
											alignItems: "center",
											justifyContent: "center",
											fontSize: 9,
											fontWeight: 700,
											color: "var(--ax-colors-fg-avatar-green)",
										}}
									>
										{authorName[0]?.toUpperCase()}
									</span>
								)}
							</span>
							<Text
								style={{
									fontSize: 11,
									fontWeight: 700,
									letterSpacing: "0.06em",
									textTransform: "uppercase",
									color: "var(--ax-colors-fg-default)",
								}}
							>
								{authorName}
							</Text>
						</Box>
						{badge && (
							<Badge
								intent={
									state === "approved"
										? "success"
										: state === "changes-requested"
											? "warning"
											: "neutral"
								}
								variant="subtle"
							>
								{state === "approved"
									? "APPROVED"
									: state === "changes-requested"
										? "CHANGES"
										: badge}
							</Badge>
						)}
					</Box>

					{/* File row */}
					<Box display="flex" alignItems="center" gap="10" style={{flex: 1, minWidth: 0}}>
						<span
							style={{
								width: 36,
								height: 36,
								borderRadius: 8,
								background: "var(--ax-colors-bg-secondary)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								flexShrink: 0,
							}}
						>
							{icon ?? (
								<IconCode
									style={{
										width: 16,
										height: 16,
										color: "var(--ax-colors-fg-secondary)",
									}}
								/>
							)}
						</span>
						<Box style={{flex: 1, minWidth: 0}}>
							<Box display="flex" alignItems="center" gap="4">
								<Text
									fontWeight="600"
									style={{
										fontSize: 13,
										lineHeight: "18px",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
								>
									{fileName}
								</Text>
								{onPreview && (
									<IconArrowUpRightFromSquare
										style={{
											width: 11,
											height: 11,
											color: "var(--ax-colors-fg-tertiary)",
											flexShrink: 0,
										}}
									/>
								)}
							</Box>
							<Text
								color="fg.secondary"
								style={{
									fontSize: 12,
									lineHeight: "16px",
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
									display: "block",
								}}
							>
								{fileSubtitle}
							</Text>
						</Box>
					</Box>
				</Box>

				<Separator />

				{/* Approval section */}
				<Box px="16" py="12" display="flex" flexDirection="column" gap="12">
					<Box>
						<Text
							fontWeight="600"
							style={{fontSize: 13, lineHeight: "18px", display: "block"}}
						>
							{approvalTitle}
						</Text>
						<Text
							color="fg.secondary"
							style={{
								fontSize: 13,
								lineHeight: "18px",
								display: "block",
								marginTop: 4,
							}}
						>
							{approvalDescription}
						</Text>
					</Box>

					{onViewTask && (
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconListCheck />}
							onClick={(e) => {
								e.stopPropagation();
								onViewTask();
							}}
							style={{alignSelf: "flex-start", color: "var(--ax-colors-fg-link)"}}
						>
							View Task
						</Button>
					)}

					{state === "pending" ? (
						<Box display="flex" alignItems="center" gap="8" justifyContent="flex-end">
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
							style={{textAlign: "right"}}
						>
							{state === "approved" ? "Approved" : "Changes requested"}
						</Text>
					)}
				</Box>
			</Box>
		</Box>
	);
}
>>>>>>> origin/main
