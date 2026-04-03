"use client";

import { Box, Button, Spinner, Text, Textarea } from "@optiaxiom/react";
import { IconSparkles, IconPhoto, IconVideo } from "@tabler/icons-react";

export interface PromptHistoryEntry {
	prompt: string;
	image: string;
}

export function PromptBar({
	prompt,
	setPrompt,
	onGenerate,
	isGenerating,
}: {
	prompt: string;
	setPrompt: (value: string) => void;
	onGenerate: () => void;
	isGenerating: boolean;
}) {
	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="8"
			style={{
				position: "absolute",
				bottom: 24,
				left: 24,
				right: 24,
				zIndex: 10,
			}}
		>
			<Box
				bg="bg.default"
				border="1"
				borderColor={isGenerating ? "border.accent" : "border.secondary"}
				rounded="xl"
				shadow="lg"
				display="flex"
				flexDirection="column"
				p="4"
				style={{
					transition: "border-color 0.3s ease",
				}}
			>
				<Box p="12" style={{ paddingBottom: 4 }}>
					<Text fontSize="xs" fontWeight="600" color={isGenerating ? "fg.accent" : "fg.tertiary"} mb="4">
						{isGenerating ? "Generating…" : "Prompt"}
					</Text>
					<Textarea
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						placeholder="Describe the image you want to generate"
						disabled={isGenerating}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey && !isGenerating) {
								e.preventDefault();
								onGenerate();
							}
						}}
						style={{
							border: "none",
							outline: "none",
							resize: "none",
							minHeight: 48,
							fontSize: 14,
							padding: 0,
							background: "transparent",
							boxShadow: "none",
							opacity: isGenerating ? 0.6 : 1,
						}}
					/>
				</Box>

				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					style={{ padding: "8px 12px" }}
					borderT="1"
					borderColor="border.tertiary"
				>
					<Box display="flex" alignItems="center" gap="8">
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconPhoto size={16} />}
							aria-label="Upload reference image"
							disabled={isGenerating}
						/>
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconVideo size={16} />}
							aria-label="Generate video"
							disabled={isGenerating}
						/>
					</Box>

					<Box display="flex" alignItems="center" gap="12">
						{isGenerating ? (
							<Box display="flex" alignItems="center" gap="8">
								<Spinner size="sm" />
								<Text fontSize="xs" color="fg.accent" fontWeight="600">
									Generating image…
								</Text>
							</Box>
						) : (
							<>
								<Text fontSize="xs" color="fg.tertiary">
									Uses 20 credits
								</Text>
								<Button
									appearance="primary"
									size="sm"
									icon={<IconSparkles size={14} />}
									onClick={onGenerate}
									disabled={!prompt.trim()}
								>
									Generate
								</Button>
							</>
						)}
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
