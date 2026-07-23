"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Text } from "@optiaxiom/react";
import { useLayout } from "@/app/context/LayoutContext";
import { OverviewTab } from "./components/OverviewTab";
import { AssetsTab } from "./components/AssetsTab";
import { ColoursTab } from "./components/ColoursTab";
import { TypographyTab } from "./components/TypographyTab";
import { ToneOfVoiceTab } from "./components/ToneOfVoiceTab";
import { BrandBriefTab } from "./components/BrandBriefTab";
import { LogosTab } from "./components/LogosTab";
import { ImagesTab } from "./components/ImagesTab";
import { DSDetailView } from "./components/DSDetailView";
import { BrandPackSectionNav, type SectionId } from "./components/BrandPackSectionNav";
import { getBrandPackById } from "../data";
import styles from "./BrandPackDetailPage.module.css";

const BRAND_PACKS_HOME = "/opal/context?tab=brand";

type PageProps = {
	params: Promise<{ id: string }>;
};

export default function BrandPackDetailPage({ params }: PageProps) {
	const { id } = use(params);
	const router = useRouter();
	const { setSubNavContent, setSubNavWidth, setHidePageHeader } = useLayout();
	const [activeSection, setActiveSection] = useState<SectionId>("overview");
	const pack = getBrandPackById(id);
	const packName = pack?.name ?? "";

	useEffect(() => {
		setSubNavWidth(250);
		setHidePageHeader(true);
		return () => {
			setSubNavWidth(272);
			setHidePageHeader(false);
		};
	}, [setSubNavWidth, setHidePageHeader]);

	useEffect(() => {
		// When design-system is active, DSDetailView injects its own nav via setSubNavContent
		if (!pack || activeSection === "design-system") {
			if (!pack) setSubNavContent(null);
			return;
		}
		setSubNavContent(
			<BrandPackSectionNav
				activeSection={activeSection}
				onBack={() => router.push(BRAND_PACKS_HOME)}
				onSelectSection={setActiveSection}
				pack={pack}
				packName={packName}
			/>
		);
		return () => { setSubNavContent(null); };
	}, [activeSection, pack, packName, router, setSubNavContent]);

	if (!pack) {
		return (
			<Box
				alignItems="center"
				display="flex"
				flexDirection="column"
				gap="16"
				justifyContent="center"
				style={{ padding: "80px 32px" }}
			>
				<Text fontWeight="700" style={{ fontSize: 24 }}>Pack not found</Text>
				<Text color="fg.secondary">The brand pack you're looking for doesn't exist.</Text>
				<Button appearance="default" onClick={() => router.push(BRAND_PACKS_HOME)}>
					Back to Brands
				</Button>
			</Box>
		);
	}

	return (
		<Box
			className={styles.detailPage}
			display="flex"
			flexDirection="column"
			h="full"
			overflow="auto"
		>
			<Box className={styles.sectionContent} style={{ overflowY: "auto" }}>
				{activeSection === "overview" && (
					<OverviewTab
						pack={pack}
						onSelectTab={(tab) => {
							const map: Record<string, SectionId> = {
								colours: "assets-colors",
								typography: "assets-typography",
								logos: "assets-library",
								images: "instructions-photography",
								descriptors: "design-system",
								tone: "instructions-voice",
								templates: "assets-library",
								brief: "instructions-system",
								publish: "overview",
							};
							setActiveSection(map[tab] ?? "overview");
						}}
					/>
				)}
				{activeSection === "assets-library" && <AssetsTab pack={pack} />}
				{activeSection === "assets-colors" && <ColoursTab pack={pack} />}
				{activeSection === "assets-typography" && <TypographyTab pack={pack} />}
				{activeSection === "instructions-logo" && (
					<Box style={{ padding: "28px 40px" }}>
						<LogosTab pack={pack} onManageAssets={() => setActiveSection("assets-library")} />
					</Box>
				)}
				{activeSection === "instructions-photography" && (
					<Box style={{ padding: "28px 40px" }}>
						<ImagesTab pack={pack} />
					</Box>
				)}
				{activeSection === "instructions-voice" && (
					<Box style={{ padding: "28px 40px" }}>
						<ToneOfVoiceTab pack={pack} />
					</Box>
				)}
				{activeSection === "instructions-system" && <BrandBriefTab pack={pack} />}
				{activeSection === "design-system" && (
					<DSDetailView
						onBack={() => setActiveSection("overview")}
						pack={pack}
					/>
				)}
			</Box>
		</Box>
	);
}
