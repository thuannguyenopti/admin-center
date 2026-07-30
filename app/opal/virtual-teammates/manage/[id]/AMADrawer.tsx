"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import { IconArrowsMaximize, IconPaperPlaneTop, IconXmark } from "@optiaxiom/icons";
import Image from "next/image";
import type { VAU } from "@/app/opal/data/vaus";

type ChatMessage = { role: "user" | "assistant"; content: string };

const PREVIEW_CARDS = [
	{ src: "/avatars/DailyBriefCard.png", title: "Daily Brief",    bg: "#C4A87A", contain: true,  position: "center" },
	{ src: "/avatars/ManyFaces.png",      title: "Weekly recap",   bg: "#9ACD32", contain: false, position: "center top" },
	{ src: "/avatars/Cheetah.png",        title: "Weekly nudges",  bg: "#D6EEF5", contain: false, position: "center" },
];

// Panel width must fit 3 × 143px cards + 2 × 8px gaps + 2 × 24px padding = 493px
const PANEL_WIDTH = 493;
const CARD_W = 143;
const CARD_H = 164;

function ChatBubble({
	message,
	avatarSrc,
	avatarBg,
}: {
	message: ChatMessage;
	avatarSrc: string;
	avatarBg: string;
}) {
	const isUser = message.role === "user";
	return (
		<Box display="flex" gap="8" alignItems="start" style={{ flexDirection: isUser ? "row-reverse" : "row" }}>
			{!isUser && (
				<Box
					style={{
						width: 28,
						height: 28,
						borderRadius: "50%",
						overflow: "hidden",
						flexShrink: 0,
						backgroundColor: avatarBg,
					}}
				>
					<Image src={avatarSrc} alt="" width={28} height={28} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
				</Box>
			)}
			<Box
				style={{
					maxWidth: "82%",
					background: isUser ? "#202320" : "var(--ax-colors-bg-secondary)",
					color: isUser ? "var(--ax-colors-fg-white)" : "#202320",
					borderRadius: isUser ? "12px 12px 2px 12px" : "2px 12px 12px 12px",
					padding: "10px 14px",
					fontSize: 14,
					lineHeight: "1.5",
					letterSpacing: "0.14px",
				}}
			>
				{message.content}
			</Box>
		</Box>
	);
}

function TypingIndicator({ avatarSrc, avatarBg }: { avatarSrc: string; avatarBg: string }) {
	return (
		<Box display="flex" gap="8" alignItems="start">
			<Box style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", flexShrink: 0, backgroundColor: avatarBg }}>
				<Image src={avatarSrc} alt="" width={28} height={28} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
			</Box>
			<Box style={{ background: "var(--ax-colors-bg-secondary)", borderRadius: "2px 12px 12px 12px", padding: "12px 16px", display: "flex", gap: 4, alignItems: "center" }}>
				{[0, 1, 2].map((i) => (
					<Box key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ax-colors-fg-tertiary)", animation: `ama-dot 1.2s ${i * 0.2}s ease-in-out infinite` }} />
				))}
			</Box>
		</Box>
	);
}

export function AMADrawer({ vau, onClose }: { vau: VAU; onClose: () => void }) {
	const characterName = vau.characterName ?? vau.name;
	const greeting = `Hey, I'm ${characterName}. I'd love to work with you. I take the hundred small things off your plate — pulling reports, drafting updates, prepping stakeholder reviews — so your week is smooth sailing.`;

	const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: greeting }]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, loading]);

	const send = async (text: string, surprise = false) => {
		if (!text.trim() && !surprise) return;
		setLoading(true);
		const userMessage: ChatMessage = { role: "user", content: surprise ? `✨ Surprise me, ${characterName}` : text };
		const updated = [...messages, userMessage];
		setMessages(updated);
		setInput("");

		if (surprise) {
			setTimeout(() => {
				setMessages([...updated, { role: "assistant", content: "I believe I would be very good at curling. The sport. I think about this often." }]);
				setLoading(false);
			}, 800);
			return;
		}

		try {
			const res = await fetch("/api/opal/vau-chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					messages: updated.slice(1).map((m) => ({ role: m.role, content: m.content })),
					vauName: characterName,
					vauRole: vau.name,
					vauTraits: vau.traits,
					surprise,
				}),
			});
			const data = await res.json();
			setMessages([...updated, { role: "assistant", content: data.reply ?? "Something went sideways. Try again." }]);
		} catch {
			setMessages([...updated, { role: "assistant", content: "Hmm, can't reach the server right now. Try again." }]);
		} finally {
			setLoading(false);
		}
	};

	const hasInput = input.trim().length > 0;

	return (
		<>
			{/* Backdrop */}
			<Box onClick={onClose} style={{ position: "fixed", inset: 0, background: "var(--ax-colors-bg-overlay)", zIndex: 40 }} />

			{/* Panel */}
			<Box
				style={{
					position: "fixed",
					top: 0,
					right: 0,
					height: "100vh",
					width: PANEL_WIDTH,
					background: "var(--ax-colors-bg-default)",
					borderLeft: "1px solid var(--ax-colors-border-default)",
					zIndex: 50,
					display: "flex",
					flexDirection: "column",
				}}
			>
				{/* Header */}
				<Box style={{ padding: "20px 24px 16px", flexShrink: 0 }}>
					{/* Name + badge row */}
					<Box display="flex" alignItems="center">
						<Box
							style={{
								width: 32,
								height: 32,
								borderRadius: "50%",
								overflow: "hidden",
								flexShrink: 0,
								backgroundColor: vau.avatarBg,
								marginRight: 10,
							}}
						>
							<Image src={vau.avatar} alt={characterName} width={32} height={32} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
						</Box>
						<Box display="flex" flexDirection="column" gap="4" style={{ flex: 1, minWidth: 0 }}>
							<Box display="flex" alignItems="center" gap="8">
								<Text style={{ fontWeight: 700, fontSize: 15, color: "var(--ax-colors-fg-default)", lineHeight: 1 }}>
									{characterName}
								</Text>
								<span
									style={{
										display: "inline-flex",
										alignItems: "center",
										height: 20,
										padding: "0 8px",
										borderRadius: 4,
										background: "var(--ax-colors-bg-information-subtle)",
										color: "#036988",
										fontFamily: "Roboto Mono, monospace",
										fontSize: 10,
										fontWeight: 500,
										letterSpacing: "0.3px",
										textTransform: "uppercase",
										whiteSpace: "nowrap",
									}}
								>
									Virtual teammate
								</span>
							</Box>
							{/* Role — 4px below name via gap="4" above */}
							<Text fontSize="sm" color="fg.tertiary" style={{ fontWeight: 400, lineHeight: 1 }}>
								{vau.name}
							</Text>
						</Box>
						<Box style={{ display: "flex", gap: 2, flexShrink: 0, marginLeft: 8 }}>
							<Button appearance="subtle" size="sm" icon={<IconArrowsMaximize size={14} />} aria-label="Expand" />
							<Button appearance="subtle" size="sm" icon={<IconXmark size={14} />} aria-label="Close" onClick={onClose} />
						</Box>
					</Box>
				</Box>

				{/* Divider */}
				<Box style={{ height: 1, background: "var(--ax-colors-border-default)", flexShrink: 0 }} />

				{/* Chat area */}
				<Box
					style={{
						flex: 1,
						overflowY: "auto",
						padding: "20px 24px 12px",
						display: "flex",
						flexDirection: "column",
						gap: 12,
					}}
				>
					{messages.map((m, i) => (
						<ChatBubble key={i} message={m} avatarSrc={vau.avatar} avatarBg={vau.avatarBg} />
					))}
					{loading && <TypingIndicator avatarSrc={vau.avatar} avatarBg={vau.avatarBg} />}
					<div ref={bottomRef} />
				</Box>

				{/* Preview cards */}
				<Box style={{ padding: "0 24px 12px", display: "flex", gap: 8, flexShrink: 0 }}>
					{PREVIEW_CARDS.map((card) => (
						<Box
							key={card.title}
							onClick={() => send(`Tell me more about your "${card.title}" capability`)}
							style={{
								width: CARD_W,
								height: CARD_H,
								borderRadius: 10,
								overflow: "hidden",
								cursor: "pointer",
								flexShrink: 0,
								border: "1px solid var(--ax-colors-border-default)",
								display: "flex",
								flexDirection: "column",
							}}
						>
							{/* Image area */}
							<Box style={{ flex: 1, position: "relative", background: card.bg, overflow: "hidden" }}>
								<Image
									src={card.src}
									alt={card.title}
									fill
									unoptimized
									style={{ objectFit: card.contain ? "contain" : "cover", objectPosition: card.position }}
								/>
							</Box>
							{/* White footer */}
							<Box
								style={{
									background: "var(--ax-colors-bg-default)",
									padding: "8px 10px 9px",
									flexShrink: 0,
									borderTop: "1px solid var(--ax-colors-border-default)",
								}}
							>
								<Text style={{ fontSize: 12, fontWeight: 600, color: "var(--ax-colors-fg-default)", lineHeight: "1.25", display: "block" }}>
									{card.title}
								</Text>
								<span style={{ fontSize: 9, color: "var(--ax-colors-fg-tertiary)", fontFamily: "Roboto Mono, monospace", letterSpacing: "0.4px", textTransform: "uppercase", marginTop: 2, display: "block" }}>
									Preview
								</span>
							</Box>
						</Box>
					))}
				</Box>

				{/* Input area — 16px above bottom */}
				<Box style={{ padding: "0 24px 16px", flexShrink: 0 }}>
					<Box
						style={{
							border: "1px solid var(--ax-colors-border-default)",
							borderRadius: 12,
							padding: "12px 14px 10px",
							background: "var(--ax-colors-bg-default)",
						}}
					>
						{/* Text field */}
						<input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
							placeholder="Try chatting..."
							disabled={loading}
							style={{
								width: "100%",
								border: "none",
								outline: "none",
								fontSize: 14,
								fontWeight: 400,
								color: "var(--ax-colors-fg-default)",
								background: "transparent",
								fontFamily: "inherit",
								lineHeight: "1.5",
							}}
						/>
						{/* Button row */}
						<Box display="flex" alignItems="center" justifyContent="flex-end" gap="8" style={{ marginTop: 10 }}>
							<Button
								size="md"
								onClick={() => send("", true)}
								disabled={loading}
							>
								✨ Surprise me, {characterName}
							</Button>
							<Button
								appearance="primary"
								size="md"
								icon={<IconPaperPlaneTop size={14} />}
								aria-label="Send"
								onClick={() => send(input)}
								disabled={loading || !hasInput}
							/>
						</Box>
					</Box>
				</Box>
			</Box>

			<style>{`
				@keyframes ama-dot {
					0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); }
					40% { opacity: 1; transform: scale(1); }
				}
			`}</style>
		</>
	);
}
