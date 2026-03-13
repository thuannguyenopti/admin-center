"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import {
	dataVizCategoricalColors,
	dataVizCoreColorFamilies,
	dataVizDivergingPalettes,
	dataVizNeutralScale,
	dataVizSemanticColors,
	dataVizSequentialPalettes,
} from "@/app/styles/dataVizColors";

function Swatch({
	color,
	label,
	textColor = "#111827",
}: {
	color: string;
	label: string;
	textColor?: string;
}) {
	return (
		<Box
			display="flex"
			flexDirection="column"
			justifyContent="space-between"
			rounded="md"
			style={{
				backgroundColor: color,
				border: "1px solid rgba(15, 23, 42, 0.08)",
				color: textColor,
				height: 96,
				minWidth: 96,
				padding: 12,
			}}
		>
			<Text fontSize="xs" fontWeight="600" style={{ color: textColor, lineHeight: "16px", maxWidth: "none" }}>
				{label}
			</Text>
			<Text fontSize="xs" style={{ color: textColor, lineHeight: "16px", maxWidth: "none" }}>
				{color}
			</Text>
		</Box>
	);
}

function RampRow({
	title,
	colors,
}: {
	title: string;
	colors: readonly string[];
}) {
	return (
		<Box display="flex" flexDirection="column" gap="8">
			<Text color="fg.default" fontSize="md" fontWeight="600" style={{ maxWidth: "none" }}>
				{title}
			</Text>
			<Box
				display="grid"
				gap="8"
				style={{
					gridTemplateColumns: `repeat(${colors.length}, minmax(72px, 1fr))`,
				}}
			>
				{colors.map((color, index) => (
					<Swatch
						key={`${title}-${color}`}
						color={color}
						label={`${index * 100 + 100}`}
						textColor={index > Math.floor(colors.length / 2) ? "#F8FAFC" : "#111827"}
					/>
				))}
			</Box>
		</Box>
	);
}

function getContrastTextColor(index: number, total: number) {
	return index > Math.floor(total / 2) ? "#F8FAFC" : "#111827";
}

function CoreFamilyColumn({
	title,
	colors,
}: {
	title: string;
	colors: readonly string[];
}) {
	return (
		<Box display="flex" flexDirection="column" gap="8">
			<Text fontSize="lg" fontWeight="600" style={{ color: "#FFFFFF", maxWidth: "none" }}>
				{title}
			</Text>
			<Box
				display="grid"
				style={{
					border: "1px solid rgba(255,255,255,0.14)",
					borderRadius: 12,
					gridTemplateRows: `repeat(${colors.length}, minmax(72px, auto))`,
					overflow: "hidden",
				}}
			>
				{colors.map((color, index) => (
					<Box
						key={`${title}-${index}`}
						display="flex"
						flexDirection="column"
						justifyContent="space-between"
						style={{
							backgroundColor: color,
							minHeight: 72,
							padding: 12,
						}}
					>
						<Text
							fontSize="xs"
							fontWeight="600"
							style={{ color: getContrastTextColor(index, colors.length), lineHeight: "16px", maxWidth: "none" }}
						>
							{(index + 1) * 100}
						</Text>
						<Text
							fontSize="xs"
							style={{ color: getContrastTextColor(index, colors.length), lineHeight: "16px", maxWidth: "none" }}
						>
							{color}
						</Text>
					</Box>
				))}
			</Box>
		</Box>
	);
}

function ContrastModeCard({
	title,
	background,
	textColor,
	borderColor,
	items,
}: {
	title: string;
	background: string;
	textColor: string;
	borderColor: string;
	items: ReadonlyArray<{ color: string; label: string; ratio: string; textColor: string }>;
}) {
	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="16"
			rounded="xl"
			style={{
				background,
				border: `1px solid ${borderColor}`,
				padding: 24,
			}}
		>
			<Text fontSize="lg" fontWeight="600" style={{ color: textColor, maxWidth: "none" }}>
				{title}
			</Text>
			<Box
				display="grid"
				style={{
					gridTemplateColumns: "repeat(10, minmax(72px, 1fr))",
					overflow: "hidden",
				}}
			>
				{items.map((item, index) => (
					<Box
						key={`${title}-${index}`}
						display="flex"
						flexDirection="column"
						gap="4"
						justifyContent="space-between"
						style={{
							backgroundColor: item.color,
							borderRight: index === items.length - 1 ? "0" : `1px solid ${borderColor}`,
							minHeight: 98,
							padding: 12,
						}}
					>
						<Text fontSize="xs" fontWeight="600" style={{ color: item.textColor, maxWidth: "none" }}>
							{item.label}
						</Text>
						<Text fontSize="md" fontWeight="700" style={{ color: item.textColor, maxWidth: "none" }}>
							{item.ratio}
						</Text>
					</Box>
				))}
			</Box>
		</Box>
	);
}

export default function DataVizColorsPage() {
	const coreFamilies = dataVizCoreColorFamilies;
	const lightContrastLabels = ["1.20:1", "1.42:1", "1.83:1", "2.44:1", "3.03:1", "4.54:1", "7.10:1", "9.39:1", "12.47:1", "15.03:1"] as const;
	const darkContrastLabels = ["17.43:1", "14.79:1", "11.50:1", "8.60:1", "6.92:1", "4.62:1", "2.96:1", "2.24:1", "1.68:1", "1.40:1"] as const;
	const lightContrastItems = coreFamilies.default.map((color, index) => ({
		color,
		label: `Blue ${(index + 1) * 10}`,
		ratio: lightContrastLabels[index],
		textColor: getContrastTextColor(index, coreFamilies.default.length),
	}));
	const darkContrastItems = coreFamilies.default.map((color, index) => ({
		color,
		label: `Blue ${(index + 1) * 10}`,
		ratio: darkContrastLabels[index],
		textColor: index <= 5 ? "#111827" : "#F8FAFC",
	}));

	return (
		<Box bg="bg.page" display="flex" justifyContent="center" px="24" py="32" w="full">
			<Box display="flex" flexDirection="column" gap="32" style={{ maxWidth: 1680, width: "100%" }}>
				<Box display="flex" flexDirection="column" gap="8">
					<Text color="fg.default" fontSize="3xl" fontWeight="700" style={{ maxWidth: "none" }}>
						Data Visualization Colors
					</Text>
					<Text color="fg.secondary" fontSize="md" style={{ maxWidth: 840 }}>
						Shared color reference for charts, dashboards, scheduler accents, legends, and other information-dense surfaces.
						UI tokens still own product chrome, controls, and base interaction states.
					</Text>
				</Box>

				<Box
					display="flex"
					flexDirection="column"
					gap="24"
					rounded="xl"
					style={{
						background: "#202124",
						padding: 28,
					}}
				>
					<Box
						display="grid"
						gap="24"
						style={{
							gridTemplateColumns: "repeat(10, minmax(120px, 1fr))",
						}}
					>
						<Text fontSize="xl" fontWeight="600" style={{ color: "#FFFFFF", gridColumn: "span 1", maxWidth: "none" }}>
							Default
						</Text>
						<Text fontSize="xl" fontWeight="600" style={{ color: "#FFFFFF", gridColumn: "span 1", maxWidth: "none" }}>
							Positive
						</Text>
						<Text fontSize="xl" fontWeight="600" style={{ color: "#FFFFFF", gridColumn: "span 1", maxWidth: "none" }}>
							Negative
						</Text>
						<Text fontSize="xl" fontWeight="600" style={{ color: "#FFFFFF", gridColumn: "span 6", maxWidth: "none", textAlign: "center" }}>
							Secondary
						</Text>
						<Text fontSize="xl" fontWeight="600" style={{ color: "#FFFFFF", gridColumn: "span 1", maxWidth: "none", textAlign: "right" }}>
							Neutral
						</Text>
					</Box>

					<Box
						display="grid"
						gap="24"
						style={{
							alignItems: "start",
							gridTemplateColumns: "repeat(10, minmax(120px, 1fr))",
						}}
					>
						<CoreFamilyColumn title="Default" colors={coreFamilies.default} />
						<CoreFamilyColumn title="Positive" colors={coreFamilies.positive} />
						<CoreFamilyColumn title="Negative" colors={coreFamilies.negative} />
						<CoreFamilyColumn title="Orange" colors={coreFamilies.orange} />
						<CoreFamilyColumn title="Yellow" colors={coreFamilies.yellow} />
						<CoreFamilyColumn title="Purple" colors={coreFamilies.purple} />
						<CoreFamilyColumn title="Teal" colors={coreFamilies.teal} />
						<CoreFamilyColumn title="Pink" colors={coreFamilies.pink} />
						<CoreFamilyColumn title="Tan" colors={coreFamilies.tan} />
						<CoreFamilyColumn title="Neutral" colors={coreFamilies.neutral} />
					</Box>
				</Box>

				<Box bg="bg.default" border="1" borderColor="border.tertiary" display="flex" flexDirection="column" gap="20" p="24" rounded="xl">
					<Text color="fg.default" fontSize="3xl" fontWeight="700" style={{ maxWidth: "none", textAlign: "center" }}>
						Light/Dark Mode
					</Text>
					<Text color="fg.secondary" fontSize="md" style={{ margin: "0 auto", maxWidth: 840, textAlign: "center" }}>
						These hue families are useful, not excessive, as long as we treat them like contrast-aware ramps. The usable slice changes between light and dark surfaces, so the system should document that explicitly.
					</Text>
					<ContrastModeCard
						title="Colors accessible to the 3:1 contrast ratio on a white background"
						background="#FFFFFF"
						borderColor="rgba(15, 23, 42, 0.12)"
						textColor="#111827"
						items={lightContrastItems}
					/>
					<ContrastModeCard
						title="Colors accessible to the 3:1 contrast ratio on a black background"
						background="#050505"
						borderColor="rgba(255, 255, 255, 0.14)"
						textColor="#FFFFFF"
						items={darkContrastItems}
					/>
				</Box>

				<Box bg="bg.default" border="1" borderColor="border.tertiary" display="flex" flexDirection="column" gap="20" p="24" rounded="xl">
					<Text color="fg.default" fontSize="xl" fontWeight="600" style={{ maxWidth: "none" }}>
						Categorical
					</Text>
					<Box
						display="grid"
						gap="12"
						style={{
							gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
						}}
					>
						{dataVizCategoricalColors.map((entry) => (
							<Swatch key={entry.name} color={entry.value} label={entry.name} textColor="#111827" />
						))}
					</Box>
				</Box>

				<Box bg="bg.default" border="1" borderColor="border.tertiary" display="flex" flexDirection="column" gap="20" p="24" rounded="xl">
					<Text color="fg.default" fontSize="xl" fontWeight="600" style={{ maxWidth: "none" }}>
						Sequential
					</Text>
					<Box display="flex" flexDirection="column" gap="20">
						{Object.entries(dataVizSequentialPalettes).map(([name, colors]) => (
							<RampRow key={name} title={name} colors={colors} />
						))}
					</Box>
				</Box>

				<Box bg="bg.default" border="1" borderColor="border.tertiary" display="flex" flexDirection="column" gap="20" p="24" rounded="xl">
					<Text color="fg.default" fontSize="xl" fontWeight="600" style={{ maxWidth: "none" }}>
						Diverging
					</Text>
					<Box display="flex" flexDirection="column" gap="20">
						{Object.entries(dataVizDivergingPalettes).map(([name, colors]) => (
							<RampRow key={name} title={name} colors={colors} />
						))}
					</Box>
				</Box>

				<Box bg="bg.default" border="1" borderColor="border.tertiary" display="flex" flexDirection="column" gap="20" p="24" rounded="xl">
					<Text color="fg.default" fontSize="xl" fontWeight="600" style={{ maxWidth: "none" }}>
						Semantic
					</Text>
					<Box
						display="grid"
						gap="12"
						style={{
							gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
						}}
					>
						{Object.entries(dataVizSemanticColors).map(([name, tones]) => (
							<Box
								key={name}
								border="1"
								borderColor="border.tertiary"
								display="flex"
								flexDirection="column"
								gap="8"
								p="12"
								rounded="lg"
							>
								<Text color="fg.default" fontSize="md" fontWeight="600" style={{ textTransform: "capitalize" }}>
									{name}
								</Text>
								<Swatch color={tones.subtle} label="subtle" />
								<Swatch color={tones.default} label="default" textColor="#FFFFFF" />
								<Swatch color={tones.strong} label="strong" textColor="#FFFFFF" />
							</Box>
						))}
					</Box>
				</Box>

				<Box bg="bg.default" border="1" borderColor="border.tertiary" display="flex" flexDirection="column" gap="20" p="24" rounded="xl">
					<Text color="fg.default" fontSize="xl" fontWeight="600" style={{ maxWidth: "none" }}>
						Neutral
					</Text>
					<RampRow title="neutral" colors={dataVizNeutralScale} />
				</Box>
			</Box>
		</Box>
	);
}
