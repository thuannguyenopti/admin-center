"use client";

import { Box, Button, Text, Textarea } from "@optiaxiom/react";
import { IconSparkles, IconPhoto, IconVideo } from "@tabler/icons-react";

export function PromptBar({
	prompt,
	setPrompt,
	onGenerate,
}: {
	prompt: string;
	setPrompt: (value: string) => void;
	onGenerate: () => void;
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
				borderColor="border.secondary"
				rounded="xl"
				shadow="lg"
				display="flex"
				flexDirection="column"
				p="4"
			>
				<Box p="12" style={{ paddingBottom: 4 }}>
					<Text fontSize="xs" fontWeight="600" color="fg.tertiary" mb="4">
						Prompt
					</Text>
					<Textarea
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						placeholder="Describe the image you want to generate"
						style={{
							border: "none",
							outline: "none",
							resize: "none",
							minHeight: 48,
							fontSize: 14,
							padding: 0,
							background: "transparent",
							boxShadow: "none",
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
						/>
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconVideo size={16} />}
							aria-label="Generate video"
						/>
					</Box>

					<Box display="flex" alignItems="center" gap="12">
						<Text fontSize="xs" color="fg.tertiary">
							Uses 20 credits
						</Text>
						<Button
							appearance="primary"
							size="sm"
							icon={<IconSparkles size={14} />}
							onClick={onGenerate}
						>
							Generate
						</Button>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
