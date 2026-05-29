"use client";

import { Box, Button, Text } from "@optiaxiom/react";
import { IconXmark, IconSparkles, IconPenToSquare as IconEdit } from "@optimizely/axiom-icons";
import { IconBrandFigma as IconFigma } from "@tabler/icons-react";

type NewBrandPackModalProps = {
	onClose: () => void;
	onSelectOpal: () => void;
	onSelectFigma: () => void;
	onSelectManual: () => void;
};

type OptionCardProps = {
	icon: React.ReactNode;
	title: string;
	description: string;
	accent?: boolean;
	onClick: () => void;
};

function OptionCard({ icon, title, description, accent, onClick }: OptionCardProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			style={{
				alignItems: "flex-start",
				background: accent ? "var(--ax-colors-bg-accent-subtle)" : "var(--ax-colors-bg-default)",
				border: `1.5px solid ${accent ? "var(--ax-colors-border-accent)" : "var(--ax-colors-border-tertiary)"}`,
				borderRadius: 16,
				cursor: "pointer",
				display: "flex",
				flexDirection: "column",
				gap: 12,
				padding: "20px",
				textAlign: "left",
				transition: "border-color 0.15s ease, box-shadow 0.15s ease",
				width: "100%",
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.borderColor = "var(--ax-colors-border-accent)";
				e.currentTarget.style.boxShadow = "var(--ax-boxShadow-md)";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.borderColor = accent
					? "var(--ax-colors-border-accent)"
					: "var(--ax-colors-border-tertiary)";
				e.currentTarget.style.boxShadow = "none";
			}}
		>
			<Box
				alignItems="center"
				bg={accent ? "bg.accent" : "bg.secondary"}
				display="flex"
				justifyContent="center"
				rounded="lg"
				style={{ height: 40, width: 40, flexShrink: 0 }}
			>
				<Box style={{ color: accent ? "var(--ax-colors-fg-default-inverse)" : "var(--ax-colors-fg-secondary)" }}>
					{icon}
				</Box>
			</Box>
			<Box display="flex" flexDirection="column" gap="4">
				<Text fontWeight="600" style={{ fontSize: 15 }}>
					{title}
				</Text>
				<Text color="fg.secondary" fontSize="sm">
					{description}
				</Text>
			</Box>
		</button>
	);
}

export function NewBrandPackModal({ onClose, onSelectOpal, onSelectFigma, onSelectManual }: NewBrandPackModalProps) {
	return (
		<>
			{/* Backdrop */}
			<Box
				style={{
					background: "rgba(0,0,0,0.4)",
					bottom: 0,
					left: 0,
					position: "fixed",
					right: 0,
					top: 0,
					zIndex: 200,
				}}
				onClick={onClose}
			/>

			{/* Modal */}
			<Box
				bg="bg.default"
				border="1"
				borderColor="border.tertiary"
				rounded="xl"
				shadow="xl"
				style={{
					left: "50%",
					maxWidth: 560,
					padding: "28px",
					position: "fixed",
					top: "50%",
					transform: "translate(-50%, -50%)",
					width: "calc(100vw - 48px)",
					zIndex: 201,
				}}
			>
				{/* Header */}
				<Box alignItems="start" display="flex" justifyContent="space-between" mb="24">
					<Box display="flex" flexDirection="column" gap="4">
						<Text fontWeight="700" style={{ fontSize: 20 }}>
							New Brand Pack
						</Text>
						<Text color="fg.secondary" fontSize="sm">
							How do you want to create this brand pack?
						</Text>
					</Box>
					<Button
						appearance="subtle"
						size="sm"
						icon={<IconXmark />}
						aria-label="Close"
						onClick={onClose}
					/>
				</Box>

				{/* Options */}
				<Box display="flex" flexDirection="column" gap="12">
					<OptionCard
						icon={<IconSparkles />}
						title="Set up with Opal"
						description="Opal browses your website, extracts visual identity and tone of voice, and builds the pack automatically."
						accent
						onClick={onSelectOpal}
					/>
					<OptionCard
						icon={<IconFigma />}
						title="Import from Figma"
						description="Paste a Figma design library URL. Opal reads the file structure, derives channels and formats, and generates a template gallery."
						onClick={onSelectFigma}
					/>
					<OptionCard
						icon={<IconEdit />}
						title="Build manually"
						description="Set up colors, typography, tone of voice, and templates yourself using the brand pack editor."
						onClick={onSelectManual}
					/>
				</Box>
			</Box>
		</>
	);
}
