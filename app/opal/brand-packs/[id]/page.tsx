<<<<<<< HEAD
"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import { IconArrowLeft, IconCheck, IconEllipsisStroke as IconEllipsis } from "@optimizely/axiom-icons";
import { StatusBadge } from "../components/StatusBadge";
import { OverviewTab } from "./components/OverviewTab";
import { TemplatesTab } from "./components/TemplatesTab";
import { AssetsTab } from "./components/AssetsTab";
import { BrandBriefTab } from "./components/BrandBriefTab";
import { SettingsTab } from "./components/SettingsTab";
import { getBrandPackById } from "../data";

type Tab = "overview" | "templates" | "assets" | "brief" | "settings";

const tabs: Array<{ id: Tab; label: string }> = [
	{ id: "overview", label: "Overview" },
	{ id: "templates", label: "Templates" },
	{ id: "assets", label: "Assets" },
	{ id: "brief", label: "Brand Brief" },
	{ id: "settings", label: "Settings" },
];

type PageProps = {
	params: Promise<{ id: string }>;
};

export default function BrandPackDetailPage({ params }: PageProps) {
	const { id } = use(params);
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<Tab>("overview");

	const pack = getBrandPackById(id);

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
				<Button appearance="default" onClick={() => router.push("/opal/brand-packs")}>
					Back to Brand Packs
				</Button>
			</Box>
		);
	}

	const isActive = pack.status === "active";

	return (
		<Box
			display="flex"
			flexDirection="column"
			h="full"
			overflow="hidden"
		>
				{/* Page header */}
				<Box
					bg="bg.default"
					borderColor="border.tertiary"
					display="flex"
					flexDirection="column"
					gap="0"
					style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", zIndex: 10, flexShrink: 0 }}
				>
					<Box
						alignItems="center"
						display="flex"
						gap="16"
						justifyContent="space-between"
						style={{ padding: "16px 40px", flexWrap: "wrap" }}
					>
						{/* Left: back + title */}
						<Box alignItems="center" display="flex" gap="16">
							<Button
								appearance="subtle"
								size="sm"
								icon={<IconArrowLeft />}
								aria-label="Back to brand packs"
								onClick={() => router.push("/opal/brand-packs")}
							/>
							<Box display="flex" flexDirection="column" gap="2">
								<Box alignItems="center" display="flex" gap="10">
									<Text fontWeight="700" style={{ fontSize: 20 }}>
										{pack.name}
									</Text>
									{isActive ? (
										<Box
											alignItems="center"
											bg="bg.accent"
											display="inline-flex"
											gap="4"
											rounded="full"
											style={{ padding: "2px 10px" }}
										>
											<IconCheck size={10} style={{ color: "var(--ax-colors-fg-default-inverse)" }} />
											<Text style={{ color: "var(--ax-colors-fg-default-inverse)", fontSize: 11, fontWeight: 600 }}>
												ACTIVE
											</Text>
										</Box>
									) : (
										<StatusBadge status={pack.status} />
									)}
								</Box>
								<Text color="fg.secondary" fontSize="xs">
									{pack.typography.heading} · {pack.templateCount} templates · {pack.channels.join(", ")}
								</Text>
							</Box>
						</Box>

						{/* Right: actions */}
						<Box alignItems="center" display="flex" gap="8">
							{!isActive && (
								<Button
									appearance="primary"
									size="sm"
								>
									Set as Active
								</Button>
							)}
							<Button appearance="subtle" size="sm" icon={<IconEllipsis />} aria-label="More options" />
						</Box>
					</Box>

					{/* Tab bar */}
					<Box
						alignItems="center"
						display="flex"
						gap="0"
						style={{ padding: "0 40px" }}
					>
						{tabs.map((tab) => (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								style={{
									background: "transparent",
									border: 0,
									borderBottom: `2px solid ${activeTab === tab.id ? "var(--ax-colors-fg-default)" : "transparent"}`,
									color: activeTab === tab.id ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)",
									cursor: "pointer",
									fontSize: 14,
									fontWeight: activeTab === tab.id ? 600 : 400,
									marginBottom: -1,
									padding: "10px 16px",
									transition: "color 0.15s ease, border-color 0.15s ease",
								}}
							>
								{tab.label}
								{tab.id === "templates" && (
									<span
										style={{
											background: "var(--ax-colors-bg-secondary)",
											borderRadius: 999,
											color: "var(--ax-colors-fg-tertiary)",
											display: "inline-block",
											fontSize: 11,
											fontWeight: 600,
											marginLeft: 6,
											padding: "1px 6px",
										}}
									>
										{pack.templates.length}
									</span>
								)}
								{tab.id === "assets" && (
									<span
										style={{
											background: "var(--ax-colors-bg-secondary)",
											borderRadius: 999,
											color: "var(--ax-colors-fg-tertiary)",
											display: "inline-block",
											fontSize: 11,
											fontWeight: 600,
											marginLeft: 6,
											padding: "1px 6px",
										}}
									>
										{pack.assets.length}
									</span>
								)}
							</button>
						))}
					</Box>
				</Box>

			{/* Tab content */}
			<Box style={{ flex: 1, overflowY: "auto", padding: "28px 40px 64px" }}>
					{activeTab === "overview" && <OverviewTab pack={pack} />}
					{activeTab === "templates" && <TemplatesTab pack={pack} />}
					{activeTab === "assets" && <AssetsTab pack={pack} />}
					{activeTab === "brief" && <BrandBriefTab pack={pack} />}
					{activeTab === "settings" && <SettingsTab pack={pack} />}
			</Box>
		</Box>
	);
}
=======
"use client";

import { use, useCallback, useEffect, useState } from "react";
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
	const goToOverview = useCallback(() => setActiveSection("overview"), []);

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
						onBack={goToOverview}
						pack={pack}
					/>
				)}
			</Box>
		</Box>
	);
}
>>>>>>> origin/main
