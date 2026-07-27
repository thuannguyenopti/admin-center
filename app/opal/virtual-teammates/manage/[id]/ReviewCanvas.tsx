"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Box, Button, Text } from "@optiaxiom/react";
import { IconXmark, IconCircleCheck, IconArrowRotateLeft, IconPaperPlaneTop } from "@optiaxiom/icons";
import Image from "next/image";

type WorkItem = {
	title: string;
	description: string;
	source: string;
	priority: string;
};

type Message = {
	from: "vau" | "user";
	text: string;
	time: string;
};

function initialMessages(item: WorkItem, vauName: string): Message[] {
	return [
		{
			from: "vau",
			text: `I drafted this based on everything I had in context. Give it a read — let me know if the direction feels right or if you want me to adjust anything before you send it off.`,
			time: "9:02 AM",
		},
		{
			from: "user",
			text: "Can you make the opening a bit stronger?",
			time: "9:18 AM",
		},
		{
			from: "vau",
			text: `Done. Punched up the opening and tightened the second paragraph — the ask is clearer now. Ready for your sign-off whenever you are.`,
			time: "9:19 AM",
		},
	];
}

function documentBody(item: WorkItem): string {
	return `To: Leadership Team
From: Randy (Chief of Staff)
Re: ${item.title}
Date: Today

—

This document was prepared by Randy on your behalf and is ready for your review.

${item.description}

Key actions needed:

1. Review the content below and confirm the direction is aligned with your intent.
2. If any sections need adjustment, use the chat panel to give Randy specific feedback.
3. Once approved, click "Approve & send" to finalize.

—

Summary

Randy has drafted this document based on available context from your calendar, recent threads, and active workstreams. All claims and figures are derived from data already in the system — no assumptions were made without a source.

If anything looks off or needs a different tone, send it back with a note in the chat and Randy will revise it immediately.`;
}

interface ReviewCanvasProps {
	item: WorkItem;
	vauName: string;
	vauAvatar: string;
	vauAvatarBg: string;
	onClose: () => void;
	onApprove: () => void;
}

function ReviewCanvasInner({ item, vauName, vauAvatar, vauAvatarBg, onClose, onApprove }: ReviewCanvasProps) {
	const [messages, setMessages] = useState<Message[]>(() => initialMessages(item, vauName));
	const [input, setInput] = useState("");
	const [content, setContent] = useState(() => documentBody(item));
	const chatEndRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const sendMessage = () => {
		const text = input.trim();
		if (!text) return;
		const now = new Date();
		const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
		setMessages((prev) => [...prev, { from: "user", text, time }]);
		setInput("");
		// Randy auto-reply after short delay
		setTimeout(() => {
			setMessages((prev) => [
				...prev,
				{
					from: "vau",
					text: `Got it — making that change now. Give me a second.`,
					time,
				},
			]);
		}, 900);
	};

	return (
		<Box
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 9999,
				background: "#F9FCF8",
				display: "flex",
				flexDirection: "column",
			}}
		>
			{/* Header */}
			<Box
				style={{
					height: 52,
					borderBottom: "1px solid var(--ax-colors-border-secondary)",
					display: "flex",
					alignItems: "center",
					padding: "0 16px",
					gap: 12,
					background: "var(--ax-colors-bg-default)",
					flexShrink: 0,
				}}
			>
				<Button appearance="subtle" size="sm" icon={<IconXmark />} aria-label="Close" onClick={onClose} />
				<Box style={{ flex: 1, minWidth: 0 }}>
					<Text fontSize="md" fontWeight="500" color="fg.default" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
						{item.title}
					</Text>
				</Box>
				<Button appearance="default" size="sm" addonBefore={<IconArrowRotateLeft />} onClick={onClose}>
					Deny
				</Button>
				<Button
					appearance="primary"
					size="sm"
					addonBefore={<IconCircleCheck />}
					onClick={() => { onApprove(); onClose(); }}
				>
					Approve
				</Button>
			</Box>

			{/* Body */}
			<Box style={{ flex: 1, display: "flex", overflow: "hidden" }}>
				{/* Left — editable document */}
				<Box
					style={{
						flex: "0 0 60%",
						borderRight: "1px solid var(--ax-colors-border-secondary)",
						display: "flex",
						flexDirection: "column",
						overflow: "hidden",
						background: "var(--ax-colors-bg-default)",
					}}
				>
					{/* Doc toolbar */}
					<Box
						style={{
							padding: "8px 24px",
							borderBottom: "1px solid var(--ax-colors-border-tertiary)",
							display: "flex",
							alignItems: "center",
							gap: 4,
							flexShrink: 0,
						}}
					>
						{["B", "I", "U"].map((fmt) => (
							<Button key={fmt} appearance="subtle" size="sm" style={{ minWidth: 28, fontWeight: fmt === "B" ? 700 : fmt === "I" ? 400 : 400, fontStyle: fmt === "I" ? "italic" : "normal", textDecoration: fmt === "U" ? "underline" : "none" }}>
								{fmt}
							</Button>
						))}
						<Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", margin: "0 4px" }} />
						<Button appearance="subtle" size="sm">H1</Button>
						<Button appearance="subtle" size="sm">H2</Button>
						<Button appearance="subtle" size="sm">List</Button>
					</Box>

					{/* Scrollable doc area */}
					<Box style={{ flex: 1, overflowY: "auto", padding: "40px 80px" }}>
						<textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							style={{
								width: "100%",
								minHeight: 480,
								border: "none",
								outline: "none",
								resize: "none",
								fontFamily: "var(--ax-font-family-body, -apple-system, sans-serif)",
								fontSize: 15,
								lineHeight: "1.7",
								color: "var(--ax-colors-fg-default)",
								background: "transparent",
								whiteSpace: "pre-wrap",
							}}
						/>
					</Box>
				</Box>

				{/* Right — IM chat */}
				<Box
					style={{
						flex: "0 0 40%",
						display: "flex",
						flexDirection: "column",
						background: "#F9FCF8",
						overflow: "hidden",
					}}
				>
					{/* Chat header */}
					<Box
						style={{
							padding: "12px 20px",
							borderBottom: "1px solid var(--ax-colors-border-secondary)",
							display: "flex",
							alignItems: "center",
							gap: 10,
							flexShrink: 0,
							background: "var(--ax-colors-bg-default)",
						}}
					>
						<Box style={{ width: 32, height: 32, borderRadius: 8, background: vauAvatarBg, overflow: "hidden", flexShrink: 0 }}>
							<Image src={vauAvatar} alt={vauName} width={32} height={32} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
						</Box>
						<Box>
							<Text fontSize="md" fontWeight="500" color="fg.default">{vauName}</Text>
							<Text fontSize="sm" color="fg.tertiary">Chief of Staff · Active now</Text>
						</Box>
					</Box>

					{/* Messages */}
					<Box style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
						{messages.map((msg, i) => (
							<Box key={i} style={{ display: "flex", gap: 10, flexDirection: msg.from === "user" ? "row-reverse" : "row", alignItems: "flex-end" }}>
								{msg.from === "vau" ? (
									<Box style={{ width: 28, height: 28, borderRadius: 6, background: vauAvatarBg, overflow: "hidden", flexShrink: 0 }}>
										<Image src={vauAvatar} alt={vauName} width={28} height={28} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
									</Box>
								) : (
									<Box style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
										<Image src="/avatar-user.png" alt="You" width={28} height={28} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
									</Box>
								)}
								<Box
									style={{
										maxWidth: "75%",
										background: msg.from === "user" ? "var(--ax-colors-bg-success-subtle)" : "var(--ax-colors-bg-default)",
										border: msg.from === "user" ? "none" : "1px solid var(--ax-colors-border-secondary)",
										borderRadius: msg.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
										padding: "10px 14px",
									}}
								>
									<Text fontSize="sm" style={{ color: msg.from === "user" ? "#202320" : "var(--ax-colors-fg-default)", lineHeight: "1.5" }}>
										{msg.text}
									</Text>
									<Text fontSize="sm" style={{ color: "var(--ax-colors-fg-tertiary)", fontSize: 10, marginTop: 4 }}>
										{msg.time}
									</Text>
								</Box>
							</Box>
						))}
						<div ref={chatEndRef} />
					</Box>

					{/* Input */}
					<Box
						style={{
							padding: "12px 16px",
							borderTop: "1px solid var(--ax-colors-border-secondary)",
							display: "flex",
							alignItems: "flex-end",
							gap: 8,
							background: "var(--ax-colors-bg-default)",
							flexShrink: 0,
						}}
					>
						<textarea
							ref={textareaRef}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									sendMessage();
								}
							}}
							placeholder={`Message ${vauName}…`}
							rows={1}
							style={{
								flex: 1,
								resize: "none",
								border: "1px solid var(--ax-colors-border-secondary)",
								borderRadius: 8,
								padding: "8px 12px",
								fontFamily: "inherit",
								fontSize: 14,
								lineHeight: "1.5",
								color: "var(--ax-colors-fg-default)",
								background: "var(--ax-colors-bg-secondary)",
								outline: "none",
								overflow: "hidden",
							}}
						/>
						<Button
							appearance="primary"
							size="sm"
							icon={<IconPaperPlaneTop />}
							aria-label="Send"
							onClick={sendMessage}
						/>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

export function ReviewCanvas(props: ReviewCanvasProps) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	if (!mounted) return null;
	return createPortal(<ReviewCanvasInner {...props} />, document.body);
}
