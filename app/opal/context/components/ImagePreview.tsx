"use client";

import {Box, Text} from "@optiaxiom/react";
import {IconImage} from "@optiaxiom/icons";

export function ImagePreview() {
	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			style={{height: "100%", padding: "40px 28px", boxSizing: "border-box"}}
		>
			<Box
				rounded="lg"
				shadow="sm"
				style={{
					width: "100%",
					maxWidth: 560,
					border: "1px solid var(--ax-colors-border-secondary)",
					overflow: "hidden",
				}}
			>
				{/* Simulated image — gradient placeholder with checkerboard suggestion */}
				<Box
					style={{
						height: 320,
						background:
							"linear-gradient(135deg, #6066F2 0%, #2E82F5 50%, #7FC8F8 100%)",
						position: "relative",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Box
						style={{
							position: "absolute",
							inset: 0,
							opacity: 0.12,
							backgroundImage:
								"repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)",
							backgroundSize: "20px 20px",
							backgroundPosition: "0 0, 10px 10px",
						}}
					/>
					<Box
						style={{
							background: "rgba(255,255,255,0.18)",
							backdropFilter: "blur(4px)",
							borderRadius: 12,
							padding: "16px 24px",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 8,
						}}
					>
						<IconImage size={32} color="var(--ax-colors-fg-inverse)" />
						<Text style={{color: "#fff", fontWeight: 600, fontSize: 14}}>
							Campaign Banner.png
						</Text>
						<Text style={{color: "rgba(255,255,255,0.7)", fontSize: 12}}>
							1920 × 1080 px · 2.1 MB
						</Text>
					</Box>
				</Box>
				<Box
					px="16"
					py="10"
					bg="bg.secondary"
					style={{borderTop: "1px solid var(--ax-colors-border-secondary)"}}
				>
					<Text fontSize="sm" fontWeight="500" color="fg.default">
						Campaign Banner.png
					</Text>
					<Text fontSize="xs" color="fg.tertiary">
						PNG · 1920×1080 · 2.1 MB · Uploaded Apr 28
					</Text>
				</Box>
			</Box>
		</Box>
	);
}
