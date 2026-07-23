"use client";

import { Box, Button, Text } from "@optiaxiom/react";
import { IconAngleRight, IconArrowLeft } from "@optiaxiom/icons";
import type { BrandPack } from "../../types";
import styles from "../BrandPackDetailPage.module.css";

export type SectionId =
	| "overview"
	| "assets-library"
	| "assets-colors"
	| "assets-typography"
	| "instructions-logo"
	| "instructions-photography"
	| "instructions-voice"
	| "instructions-system"
	| "design-system";

type Props = {
	activeSection: SectionId;
	onBack: () => void;
	onSelectSection: (section: SectionId) => void;
	pack: BrandPack;
	packName: string;
};

function SubItem({
	count,
	id,
	label,
	selected,
	onClick,
}: {
	count?: number;
	id: SectionId;
	label: string;
	selected: boolean;
	onClick: () => void;
}) {
	return (
		<button
			aria-current={selected ? "page" : undefined}
			className={
				selected
					? `${styles.navSubItem} ${styles.navSubItemSelected}`
					: styles.navSubItem
			}
			type="button"
			onClick={onClick}
		>
			{label}
			{count !== undefined && count > 0 && (
				<span className={styles.sectionNavCount}>{count}</span>
			)}
		</button>
	);
}

export function BrandPackSectionNav({
	activeSection,
	onBack,
	onSelectSection,
	pack,
	packName,
}: Props) {
	const colorCount = pack.colors.length;
	const logoCount =
		(pack.logo_system?.variants.length ?? 0) + (pack.brand_devices?.length ?? 0);
	const photoCount = pack.assets.filter((a) => a.type === "photo").length;

	return (
		<Box className={styles.sectionNavPanel} display="flex" flexDirection="column">
			{/* Back + pack name */}
			<Box className={styles.sectionNavHeader}>
				<Button
					appearance="subtle"
					aria-label="Back to Brands"
					icon={<IconArrowLeft />}
					onClick={onBack}
					size="sm"
					style={{ marginLeft: -6 }}
				>
					Brand
				</Button>
				<Text color="fg.secondary" style={{ fontSize: 12, lineHeight: 1.35, paddingLeft: 2 }}>
					{packName}
				</Text>
			</Box>

			<Box display="flex" flexDirection="column" gap="4">
				{/* Overview — standalone */}
				<Box
					asChild
					className={
						activeSection === "overview"
							? `${styles.sectionNavItem} ${styles.sectionNavItemSelected}`
							: styles.sectionNavItem
					}
					style={{ minHeight: 36 }}
				>
					<button
						aria-current={activeSection === "overview" ? "page" : undefined}
						type="button"
						onClick={() => onSelectSection("overview")}
					>
						<span
							className={
								activeSection === "overview"
									? `${styles.sectionNavItemLabel} ${styles.sectionNavItemLabelSelected}`
									: styles.sectionNavItemLabel
							}
						>
							Overview
						</span>
					</button>
				</Box>

				{/* Assets group */}
				<Box display="flex" flexDirection="column">
					<span className={styles.navGroupHeader}>Assets</span>
					<Box display="flex" flexDirection="column" gap="2">
						<SubItem
							id="assets-library"
							label="Library"
							selected={activeSection === "assets-library"}
							onClick={() => onSelectSection("assets-library")}
						/>
						<SubItem
							id="assets-colors"
							label="Colors"
							count={colorCount}
							selected={activeSection === "assets-colors"}
							onClick={() => onSelectSection("assets-colors")}
						/>
						<SubItem
							id="assets-typography"
							label="Typography"
							selected={activeSection === "assets-typography"}
							onClick={() => onSelectSection("assets-typography")}
						/>
					</Box>
				</Box>

				{/* Instructions group */}
				<Box display="flex" flexDirection="column">
					<span className={styles.navGroupHeader}>Instructions</span>
					<Box display="flex" flexDirection="column" gap="2">
						<SubItem
							id="instructions-logo"
							label="Logos & Devices"
							count={logoCount > 0 ? logoCount : undefined}
							selected={activeSection === "instructions-logo"}
							onClick={() => onSelectSection("instructions-logo")}
						/>
						<SubItem
							id="instructions-photography"
							label="Photography"
							count={photoCount > 0 ? photoCount : undefined}
							selected={activeSection === "instructions-photography"}
							onClick={() => onSelectSection("instructions-photography")}
						/>
						<SubItem
							id="instructions-voice"
							label="Voice & Audience"
							selected={activeSection === "instructions-voice"}
							onClick={() => onSelectSection("instructions-voice")}
						/>
						<SubItem
							id="instructions-system"
							label="System"
							selected={activeSection === "instructions-system"}
							onClick={() => onSelectSection("instructions-system")}
						/>
					</Box>
				</Box>

				{/* Design System — separate box */}
				<div className={styles.navDSBox}>
					<span className={styles.navDSLabel}>Design System</span>
					<Box
						asChild
						className={
							activeSection === "design-system"
								? `${styles.sectionNavItem} ${styles.sectionNavItemSelected}`
								: styles.sectionNavItem
						}
					>
						<button
							aria-current={activeSection === "design-system" ? "page" : undefined}
							type="button"
							onClick={() => onSelectSection("design-system")}
						>
							<span className={styles.sectionNavItemContent}>
								<span className={styles.sectionNavItemTitle}>
									<span
										className={
											activeSection === "design-system"
												? `${styles.sectionNavItemLabel} ${styles.sectionNavItemLabelSelected}`
												: styles.sectionNavItemLabel
										}
										style={{ fontSize: 14, fontWeight: 700 }}
									>
										Design System
									</span>
									<span className={styles.sectionNavChevron}>
										<IconAngleRight size={12} />
									</span>
								</span>
								<span className={styles.sectionNavItemDescription}>
									Components, tokens, guidelines
								</span>
							</span>
						</button>
					</Box>
				</div>
			</Box>
		</Box>
	);
}
