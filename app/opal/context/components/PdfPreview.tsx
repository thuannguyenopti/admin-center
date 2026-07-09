"use client";

import {Box, Text} from "@optiaxiom/react";

export function PdfPreview() {
	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			style={{
				height: "100%",
				overflowY: "auto",
				padding: "24px 28px",
				boxSizing: "border-box",
			}}
		>
			{/* PDF page mockup */}
			<Box
				bg="bg.default"
				rounded="sm"
				shadow="sm"
				style={{
					width: "100%",
					maxWidth: 600,
					minHeight: 800,
					padding: "64px 72px",
					boxSizing: "border-box",
				}}
			>
				{/* Header bar */}
				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="center"
					pb="24"
					style={{borderBottom: "2px solid #2E3442"}}
				>
					<Box>
						<Text style={{fontSize: 20, fontWeight: 700, color: "#2E3442"}}>
							Optimizely
						</Text>
						<Text style={{fontSize: 11, color: "#66708C", marginTop: 2}}>
							Brand Guidelines 2025
						</Text>
					</Box>
					<Box
						style={{
							width: 36,
							height: 36,
							borderRadius: 8,
							background: "linear-gradient(135deg, #6066F2 0%, #2E82F5 100%)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Text style={{color: "#fff", fontWeight: 700, fontSize: 16}}>O</Text>
					</Box>
				</Box>

				{/* Title */}
				<Box mt="32">
					<Text
						style={{fontSize: 28, fontWeight: 700, color: "#2E3442", lineHeight: 1.2}}
					>
						Brand Identity &amp; Usage Guidelines
					</Text>
					<Text style={{fontSize: 13, color: "#66708C", marginTop: 8}}>
						Version 4.2 · Effective January 2025 · Confidential
					</Text>
				</Box>

				{/* Section */}
				<Box mt="32">
					<Text
						style={{
							fontSize: 13,
							fontWeight: 700,
							color: "#2E82F5",
							textTransform: "uppercase",
							letterSpacing: "0.08em",
						}}
					>
						01 — Color System
					</Text>
					<Box mt="12" display="flex" gap="8">
						{[
							{name: "Navy", hex: "#2E3442"},
							{name: "Blue", hex: "#2E82F5"},
							{name: "Violet", hex: "#6066F2"},
							{name: "Cloud", hex: "#F5F6FA"},
						].map((c) => (
							<Box
								key={c.name}
								display="flex"
								flexDirection="column"
								alignItems="center"
								gap="4"
							>
								<Box
									style={{
										width: 48,
										height: 48,
										borderRadius: 8,
										background: c.hex,
									}}
								/>
								<Text style={{fontSize: 10, color: "#66708C", fontWeight: 600}}>
									{c.name}
								</Text>
								<Text
									style={{fontSize: 9, color: "#838DA4", fontFamily: "monospace"}}
								>
									{c.hex}
								</Text>
							</Box>
						))}
					</Box>
				</Box>

				{/* Section */}
				<Box mt="24">
					<Text
						style={{
							fontSize: 13,
							fontWeight: 700,
							color: "#2E82F5",
							textTransform: "uppercase",
							letterSpacing: "0.08em",
						}}
					>
						02 — Typography
					</Text>
					<Box mt="12" style={{borderLeft: "3px solid #E9EDF5", paddingLeft: 16}}>
						<Text style={{fontSize: 24, fontWeight: 700, color: "#2E3442"}}>
							Display / 24px Bold
						</Text>
						<Text
							style={{fontSize: 18, fontWeight: 600, color: "#2E3442", marginTop: 8}}
						>
							Heading / 18px Semibold
						</Text>
						<Text
							style={{fontSize: 14, color: "#4F576E", marginTop: 8, lineHeight: 1.6}}
						>
							Body text / 14px Regular — Our typeface is Inter. It combines warmth
							with precision, designed for clarity at every size across digital and
							print.
						</Text>
					</Box>
				</Box>

				{/* Section */}
				<Box mt="24">
					<Text
						style={{
							fontSize: 13,
							fontWeight: 700,
							color: "#2E82F5",
							textTransform: "uppercase",
							letterSpacing: "0.08em",
						}}
					>
						03 — Logo Usage
					</Text>
					<Box mt="12" display="flex" gap="12">
						{["Light background", "Dark background"].map((label, i) => (
							<Box
								key={label}
								display="flex"
								flexDirection="column"
								alignItems="center"
								gap="6"
								style={{flex: 1}}
							>
								<Box
									display="flex"
									alignItems="center"
									justifyContent="center"
									style={{
										height: 64,
										width: "100%",
										borderRadius: 6,
										background: i === 0 ? "#F5F6FA" : "#2E3442",
										border: i === 0 ? "1px solid #DADFEB" : "none",
									}}
								>
									<Text
										style={{
											fontWeight: 700,
											fontSize: 15,
											color: i === 0 ? "#2E3442" : "#F5F6FA",
										}}
									>
										Optimizely
									</Text>
								</Box>
								<Text style={{fontSize: 10, color: "#66708C"}}>{label}</Text>
							</Box>
						))}
					</Box>
				</Box>

				{/* Footer */}
				<Box
					mt="48"
					pt="16"
					style={{borderTop: "1px solid #DADFEB"}}
					display="flex"
					justifyContent="space-between"
				>
					<Text style={{fontSize: 10, color: "#838DA4"}}>
						© 2025 Optimizely Inc. — Confidential
					</Text>
					<Text style={{fontSize: 10, color: "#838DA4"}}>Page 1 of 12</Text>
				</Box>
			</Box>
		</Box>
	);
}
