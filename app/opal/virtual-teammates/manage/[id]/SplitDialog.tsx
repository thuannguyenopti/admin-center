"use client";

import { useState } from "react";
import { Box, Button, Dialog, DialogContent, DialogTrigger, Text } from "@optiaxiom/react";
import { IconArrowLeft, IconArrowRightArrowLeft } from "@optiaxiom/icons";
import Image from "next/image";

type DialogConfig = {
	title: string;
	description: string;
	cta: string;
};

export const DIALOG_CONFIGS: Record<string, DialogConfig> = {
	manage: {
		title: "Manage as {name}",
		description: "{name} has a separate account, just like any teammate. Switch in to make this change — it takes a second and you can switch back anytime.",
		cta: "Sign in as {name}",
	},
	workflow: {
		title: "Install a workflow",
		description: "Workflows define what {name} can do autonomously. Browse and install pre-built workflows, or bring your own.",
		cta: "Browse workflows",
	},
	guardrails: {
		title: "Configure guardrails",
		description: "Set hard limits on what {name} can and can't do. Company-level guardrails are always enforced — yours stack on top.",
		cta: "Open guardrail settings",
	},
	reconnect: {
		title: "Reconnect {name}",
		description: "Some of {name}'s connectors have lost access. Reconnect to restore the tools and data {name} needs to do its job.",
		cta: "Reconnect {name}",
	},
	manage_tools: {
		title: "Manage {name}'s tools",
		description: "Tool settings live inside {name}'s account. Switch in to enable, disable, or configure tools — it only takes a second and you can switch back anytime.",
		cta: "Sign in as {name}",
	},
	manage_connectors: {
		title: "Manage {name}'s connectors",
		description: "Connector settings live inside {name}'s account. Switch in to add, remove, or reconfigure connectors — it only takes a second and you can switch back anytime.",
		cta: "Sign in as {name}",
	},
};

export function SplitDialog({
	type,
	name,
	children,
}: {
	type: keyof typeof DIALOG_CONFIGS;
	name: string;
	children: React.ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const cfg = DIALOG_CONFIGS[type];
	const fill = (s: string) => s.replace(/{name}/g, name);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent
				style={{
					padding: 0,
					overflow: "hidden",
					maxWidth: 860,
					width: "90vw",
					borderRadius: 16,
					display: "flex",
					flexDirection: "row",
				}}
			>
				{/* Left — content */}
				<Box
					display="flex"
					flexDirection="column"
					style={{ flex: "0 0 50%", padding: "56px 48px 48px", background: "var(--ax-colors-bg-default)", justifyContent: "space-between" }}
				>
					<Box>
						<Box
							style={{
								fontFamily: "var(--ax-font-family-headings, 'VC Nudge', sans-serif)",
								fontSize: 36,
								fontWeight: 700,
								lineHeight: 1.1,
								color: "var(--ax-colors-fg-default)",
								marginBottom: 20,
							}}
						>
							{fill(cfg.title)}
						</Box>
						<Text fontSize="md" color="fg.secondary" style={{ lineHeight: 1.6, maxWidth: 340 }}>
							{fill(cfg.description)}
						</Text>
						<Box mt="32" style={{ display: "flex", justifyContent: "center" }}>
							<Button
								appearance="primary"
								size="lg"
								style={{ width: "100%", justifyContent: "center" }}
								addonBefore={
									<Box style={{ width: 22, height: 22, borderRadius: 5, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
										<IconArrowRightArrowLeft style={{ color: "#fff", fontSize: 13, width: 13, height: 13 }} />
									</Box>
								}
							>
								{fill(cfg.cta)}
							</Button>
						</Box>
					</Box>
					<Box style={{ display: "flex", justifyContent: "center" }}>
						<Button appearance="subtle" size="md" addonBefore={<IconArrowLeft />} onClick={() => setOpen(false)}>
							Back
						</Button>
					</Box>
				</Box>

				{/* Right — illustration */}
				<Box
					style={{
						flex: "0 0 50%",
						background: "#BBFF00",
						position: "relative",
						minHeight: 420,
						overflow: "hidden",
					}}
				>
					<Image
						src="/keys.png"
						alt=""
						fill
						unoptimized
						style={{ objectFit: "cover", objectPosition: "center" }}
					/>
				</Box>
			</DialogContent>
		</Dialog>
	);
}
