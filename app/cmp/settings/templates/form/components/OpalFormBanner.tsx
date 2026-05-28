"use client";

import { useState } from "react";
import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconX, IconSparkles } from "@tabler/icons-react";

interface OpalFormBannerProps {
	onOpenOpal: () => void;
	onGenerate: (description: string) => void;
}

export function OpalFormBanner({ onOpenOpal, onGenerate }: OpalFormBannerProps) {
	const [dismissed, setDismissed] = useState(false);
	const [description, setDescription] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);

	if (dismissed) return null;

	const handleBuild = async () => {
		if (!description.trim()) {
			onOpenOpal();
			return;
		}
		setIsGenerating(true);
		await onGenerate(description.trim());
		setIsGenerating(false);
	};

	return (
		<div
			style={{
				position: "absolute",
				inset: 0,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				pointerEvents: "none",
				zIndex: 5,
			}}
		>
			<Box
				bg="bg.default"
				rounded="lg"
				p="32"
				display="flex"
				flexDirection="column"
				alignItems="center"
				gap="16"
				style={{
					pointerEvents: "all",
					border: "1px solid var(--ax-colors-border-default)",
					boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
					maxWidth: "400px",
					width: "100%",
					textAlign: "center",
					position: "relative",
				}}
			>
				{/* Dismiss */}
				<button
					onClick={() => setDismissed(true)}
					style={{
						position: "absolute",
						top: 12,
						right: 12,
						background: "none",
						border: "none",
						cursor: "pointer",
						color: "var(--ax-colors-fg-tertiary)",
						display: "flex",
						alignItems: "center",
						padding: 2,
					}}
					aria-label="Dismiss"
				>
					<IconX size={14} />
				</button>

				{/* Opal icon */}
				<Box
					style={{
						width: 48,
						height: 48,
						borderRadius: "12px",
						background: "linear-gradient(135deg, #7C3AED, #9D74F5)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<IconSparkles size={24} color="#fff" />
				</Box>

				<Box style={{ width: "100%" }}>
					<Text fontSize="md" fontWeight="600" color="fg.default" style={{ display: "block", marginBottom: "6px" }}>
						Build your form with Opal
					</Text>
					<Text fontSize="sm" color="fg.secondary">
						Describe what you need and Opal will generate a form structure for you to refine.
					</Text>
				</Box>

				{/* Description input */}
				<textarea
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="e.g. A work request form for marketing campaigns, including budget, timeline, and deliverables..."
					rows={3}
					style={{
						width: "100%",
						padding: "10px 12px",
						border: "1px solid var(--ax-colors-border-default)",
						borderRadius: "8px",
						fontSize: "13px",
						color: "var(--ax-colors-fg-default)",
						background: "var(--ax-colors-bg-input, var(--ax-colors-bg-default))",
						resize: "none",
						outline: "none",
						lineHeight: 1.5,
						boxSizing: "border-box",
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleBuild();
					}}
				/>

				<button
					onClick={handleBuild}
					disabled={isGenerating}
					style={{
						padding: "8px 20px",
						background: isGenerating
							? "var(--ax-colors-fg-tertiary)"
							: "linear-gradient(135deg, #7C3AED, #9D74F5)",
						border: "none",
						borderRadius: "8px",
						fontSize: "14px",
						fontWeight: 600,
						color: "#fff",
						cursor: isGenerating ? "not-allowed" : "pointer",
						width: "100%",
					}}
				>
					{isGenerating ? "Generating…" : description.trim() ? "Generate form" : "Open Opal chat"}
				</button>

				<Text fontSize="xs" color="fg.tertiary">
					Or drag fields from the library on the left to start manually.
				</Text>
			</Box>
		</div>
	);
}
