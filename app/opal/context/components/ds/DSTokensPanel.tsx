"use client";

import {useState} from "react";
import {Box, Text} from "@optiaxiom/react";
import {
	DS_TOKEN_COLORS,
	DS_TOKEN_TYPE,
	DS_TOKEN_SPACING,
	DS_TOKEN_RADIUS,
} from "../../data/designSystem";

export function DSTokensPanel() {
	const [section, setSection] = useState<"color" | "type" | "spacing" | "radius">("color");
	return (
		<Box display="flex" flexDirection="column" style={{height: "100%", overflow: "hidden"}}>
			<Box
				display="flex"
				px="20"
				pt="12"
				style={{borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0}}
			>
				{(["color", "type", "spacing", "radius"] as const).map((s) => (
					<Box
						key={s}
						px="12"
						py="8"
						style={{
							cursor: "pointer",
							borderBottom:
								section === s
									? "2px solid var(--ax-colors-fg-default)"
									: "2px solid transparent",
							marginBottom: -1,
						}}
						onClick={() => setSection(s)}
					>
						<Text
							fontSize="sm"
							fontWeight={section === s ? "500" : "400"}
							color={section === s ? "fg.default" : "fg.secondary"}
						>
							{s.charAt(0).toUpperCase() + s.slice(1)}
						</Text>
					</Box>
				))}
			</Box>

			<Box style={{flex: 1, overflowY: "auto", padding: "20px"}}>
				{section === "color" && (
					<Box display="flex" flexDirection="column" gap="6">
						{DS_TOKEN_COLORS.map((t) => (
							<Box
								key={t.name}
								display="flex"
								alignItems="center"
								gap="12"
								py="8"
								px="12"
								rounded="md"
								border="1"
								borderColor="border.secondary"
							>
								<Box
									rounded="sm"
									style={{
										width: 28,
										height: 28,
										flexShrink: 0,
										background: t.value,
										border: "1px solid var(--ax-colors-border-secondary)",
									}}
								/>
								<Box style={{flex: 1, minWidth: 0}}>
									<Text fontSize="sm" fontWeight="500" color="fg.default">
										{t.label}
									</Text>
									<Text
										fontSize="xs"
										color="fg.tertiary"
										style={{fontFamily: "monospace"}}
									>
										{t.name}
									</Text>
								</Box>
								<Text
									fontSize="xs"
									color="fg.secondary"
									style={{fontFamily: "monospace", flexShrink: 0}}
								>
									{t.value}
								</Text>
							</Box>
						))}
					</Box>
				)}

				{section === "type" && (
					<Box display="flex" flexDirection="column" gap="6">
						{DS_TOKEN_TYPE.map((t) => (
							<Box
								key={t.token}
								display="flex"
								alignItems="center"
								gap="16"
								py="10"
								px="12"
								rounded="md"
								border="1"
								borderColor="border.secondary"
							>
								<Text
									style={{
										fontSize: t.size,
										fontWeight: t.weight,
										lineHeight: 1.2,
										minWidth: 200,
										color: "var(--ax-colors-fg-default)",
									}}
								>
									{t.sample}
								</Text>
								<Box style={{flex: 1}}>
									<Text
										fontSize="xs"
										color="fg.tertiary"
										style={{fontFamily: "monospace"}}
									>
										{t.token}
									</Text>
									<Text fontSize="xs" color="fg.secondary">
										{t.size} / {t.weight}
									</Text>
								</Box>
							</Box>
						))}
					</Box>
				)}

				{section === "spacing" && (
					<Box display="flex" flexDirection="column" gap="10">
						{DS_TOKEN_SPACING.map((px) => (
							<Box key={px} display="flex" alignItems="center" gap="16">
								<Text
									fontSize="xs"
									color="fg.tertiary"
									style={{fontFamily: "monospace", width: 36, flexShrink: 0}}
								>
									{px}px
								</Text>
								<Box
									style={{
										width: px * 1.8,
										height: 18,
										background: "var(--ax-colors-bg-secondary)",
										border: "1px solid var(--ax-colors-border-default)",
										borderRadius: 3,
										flexShrink: 0,
									}}
								/>
								<Text
									fontSize="xs"
									color="fg.tertiary"
									style={{fontFamily: "monospace"}}
								>
									--spacing-{px}
								</Text>
							</Box>
						))}
					</Box>
				)}

				{section === "radius" && (
					<Box display="flex" flexDirection="column" gap="12">
						{DS_TOKEN_RADIUS.map((t) => (
							<Box key={t.token} display="flex" alignItems="center" gap="16">
								<Box
									style={{
										width: 48,
										height: 48,
										background: "var(--ax-colors-bg-secondary)",
										border: "1px solid var(--ax-colors-border-default)",
										borderRadius: t.value,
										flexShrink: 0,
									}}
								/>
								<Box>
									<Text fontSize="sm" fontWeight="500" color="fg.default">
										{t.value}
									</Text>
									<Text
										fontSize="xs"
										color="fg.tertiary"
										style={{fontFamily: "monospace"}}
									>
										{t.token}
									</Text>
								</Box>
							</Box>
						))}
					</Box>
				)}
			</Box>
		</Box>
	);
}
