"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import { IconCheck, IconEllipsisStroke as IconEllipsis } from "@optimizely/axiom-icons";
import { BrandPackPageHeader } from "../components/BrandPackPageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { ColoursTab } from "./components/ColoursTab";
import { TypographyTab } from "./components/TypographyTab";
import { TemplatesTab } from "./components/TemplatesTab";
import { LogosTab } from "./components/LogosTab";
import { ImagesTab } from "./components/ImagesTab";
import { StyleDescriptorsTab } from "./components/StyleDescriptorsTab";
import { ToneOfVoiceTab } from "./components/ToneOfVoiceTab";
import { TestPublishTab } from "./components/TestPublishTab";
import { SettingsTab } from "./components/SettingsTab";
import { getBrandPackById } from "../data";

type Tab =
	| "colours"
	| "typography"
	| "templates"
	| "logos"
	| "images"
	| "descriptors"
	| "tone"
	| "publish"
	| "settings";

type TabDef = {
	id: Tab;
	label: string;
	count?: (pack: NonNullable<ReturnType<typeof getBrandPackById>>) => number;
};

const TAB_DEFS: TabDef[] = [
	{ id: "colours",     label: "Colours",          count: (p) => p.colors.length },
	{ id: "typography",  label: "Typography" },
	{ id: "templates",   label: "Templates",         count: (p) => p.templates.length },
	{ id: "logos",       label: "Logos",             count: (p) => p.assets.filter((a) => a.type === "logo").length },
	{ id: "images",      label: "Images",            count: (p) => p.assets.filter((a) => a.type !== "logo").length },
	{ id: "descriptors", label: "Style Descriptors" },
	{ id: "tone",        label: "Tone of Voice" },
	{ id: "publish",     label: "Test & Publish" },
	{ id: "settings",    label: "Settings" },
];

const BRAND_PACKS_HOME = "/opal/context?tab=brand-packs";

type PageProps = {
	params: Promise<{ id: string }>;
};

export default function BrandPackDetailPage({ params }: PageProps) {
	const { id } = use(params);
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<Tab>("colours");

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
				<Button appearance="default" onClick={() => router.push(BRAND_PACKS_HOME)}>
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
			overflow="auto"
			style={{ padding: "32px 40px 64px" }}
		>
			<Box
				display="flex"
				flexDirection="column"
				gap="24"
				style={{ margin: "0 auto", maxWidth: 1240, width: "100%" }}
			>
				<BrandPackPageHeader
					onBack={() => router.push(BRAND_PACKS_HOME)}
					title={
						<>
							<Text fontWeight="700" style={{ fontSize: 22, lineHeight: 1.15 }}>
								{pack.name}
							</Text>
							{isActive ? (
								<Box
									alignItems="center"
									bg="bg.success.subtle"
									display="inline-flex"
									gap="4"
									rounded="full"
									style={{ padding: "2px 10px" }}
								>
									<IconCheck size={10} style={{ color: "var(--ax-colors-fg-success)" }} />
									<Text color="fg.success" style={{ fontSize: 11, fontWeight: 600 }}>
										ACTIVE
									</Text>
								</Box>
							) : (
								<StatusBadge status={pack.status} />
							)}
						</>
					}
					subtitle={`${pack.typography.heading} · ${pack.templateCount} templates · ${pack.channels.join(", ")}`}
					actions={
						<>
							{!isActive && (
								<Button appearance="primary" size="sm">
									Set as Active
								</Button>
							)}
							<Button appearance="subtle" size="sm" icon={<IconEllipsis />} aria-label="More options" />
						</>
					}
				/>

				{/* Tab bar */}
				<Box
					display="flex"
					flexDirection="column"
					gap="0"
					style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}
				>
					<Box
						alignItems="center"
						display="flex"
						gap="0"
						style={{ overflowX: "auto" }}
					>
						{TAB_DEFS.map((tab) => {
							const count = tab.count?.(pack);
							return (
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
										whiteSpace: "nowrap",
									}}
								>
									{tab.label}
									{count !== undefined && (
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
											{count}
										</span>
									)}
								</button>
							);
						})}
					</Box>
				</Box>

				{/* Tab content */}
				<Box>
					{activeTab === "colours"     && <ColoursTab pack={pack} />}
					{activeTab === "typography"  && <TypographyTab pack={pack} />}
					{activeTab === "templates"   && <TemplatesTab pack={pack} />}
					{activeTab === "logos"       && <LogosTab pack={pack} />}
					{activeTab === "images"      && <ImagesTab pack={pack} />}
					{activeTab === "descriptors" && <StyleDescriptorsTab />}
					{activeTab === "tone"        && <ToneOfVoiceTab pack={pack} />}
					{activeTab === "publish"     && <TestPublishTab pack={pack} />}
					{activeTab === "settings"    && <SettingsTab pack={pack} />}
				</Box>
			</Box>
		</Box>
	);
}
