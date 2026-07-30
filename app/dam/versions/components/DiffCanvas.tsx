"use client";

import { Box } from "@optiaxiom/react";
import { Caption } from "@/app/dam/components/Caption";
import { Text } from "@/app/components/Text";
import type { VersionSubmission } from "../data";
import styles from "./DiffCanvas.module.css";

/** Side-by-side Live/Pending comparison at comparable scale, with OPAL flag markers on the pending image. */
export function DiffCanvas({ submission }: { submission: VersionSubmission }) {
	const markers = submission.brandRegressions.filter((flag) => flag.marker);

	return (
		<Box
			bg="bg.page"
			className={styles.root}
			display="flex"
			flexDirection="column"
		>
			<div className={styles.compareGrid}>
				<ImageColumn alt={submission.assetName} label="Live" src={submission.currentImage} />
				<ImageColumn alt={submission.assetName} label="Pending" markers={markers} src={submission.pendingImage} />
			</div>
		</Box>
	);
}

function ImageColumn({
	alt,
	label,
	markers,
	src,
}: {
	alt: string;
	label: string;
	markers?: VersionSubmission["brandRegressions"];
	src: string;
}) {
	const dotColor = label === "Live" ? "var(--ax-colors-fg-tertiary)" : "var(--ax-colors-fg-accent)";

	return (
		<Box display="flex" flexDirection="column" gap="12" style={{ minHeight: 0, minWidth: 0 }}>
			<Box alignItems="center" display="flex" gap="8">
				<Box style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
				<Caption fontWeight="600">{label}</Caption>
			</Box>
			<div className={styles.frame}>
				<Box style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", maxWidth: "100%", maxHeight: "100%" }}>
					<img
						alt={`${alt} — ${label}`}
						src={src}
						style={{
							maxWidth: "100%",
							maxHeight: "100%",
							objectFit: "contain",
							borderRadius: 8,
							display: "block",
							boxShadow: "0 1px 2px var(--ax-colors-border-secondary), 0 12px 32px -12px rgba(16,24,40,0.18)",
						}}
					/>
					{markers?.map((flag, i) => (
						<Box
							key={i}
							style={{
								position: "absolute",
								left: `${flag.marker!.x}%`,
								top: `${flag.marker!.y}%`,
								transform: "translate(-50%, -50%)",
							}}
						>
							<Box
								style={{
									width: 14,
									height: 14,
									borderRadius: "50%",
									background: "var(--ax-colors-bg-warning)",
									border: "2px solid white",
									boxShadow: "0 0 0 1px var(--ax-colors-border-warning)",
								}}
							/>
							<Box
								bg="bg.default"
								border="1"
								borderColor="border.warning"
								rounded="sm"
								style={{
									position: "absolute",
									top: 20,
									left: "50%",
									transform: "translateX(-50%)",
									padding: "4px 8px",
									whiteSpace: "nowrap",
									boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
									zIndex: 1,
								}}
							>
								<Text color="fg.default" fontSize="sm">{flag.category}</Text>
							</Box>
						</Box>
					))}
				</Box>
			</div>
		</Box>
	);
}
