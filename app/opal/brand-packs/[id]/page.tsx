"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Box, Button, Input, Switch, Tabs, TabsList, TabsTrigger, Text } from "@optiaxiom/react";
import { IconCheck, IconPenToSquare as IconEdit } from "@optimizely/axiom-icons";
import { BrandPackPageHeader } from "../components/BrandPackPageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { OverviewTab } from "./components/OverviewTab";
import { ColoursTab } from "./components/ColoursTab";
import { TypographyTab } from "./components/TypographyTab";
import { TemplatesTab } from "./components/TemplatesTab";
import { LogosTab } from "./components/LogosTab";
import { ImagesTab } from "./components/ImagesTab";
import { StyleDescriptorsTab } from "./components/StyleDescriptorsTab";
import { ToneOfVoiceTab } from "./components/ToneOfVoiceTab";
import { BrandBriefTab } from "./components/BrandBriefTab";
import { TestPublishTab } from "./components/TestPublishTab";
import { getBrandPackById } from "../data";
import styles from "./BrandPackDetailPage.module.css";

type Tab =
	| "overview"
	| "colours"
	| "typography"
	| "templates"
	| "logos"
	| "images"
	| "descriptors"
	| "tone"
	| "brief"
	| "publish";

type TabDef = {
	id: Tab;
	label: string;
	count?: (pack: NonNullable<ReturnType<typeof getBrandPackById>>) => number;
};

const TAB_DEFS: TabDef[] = [
	{ id: "overview",    label: "Overview" },
	{ id: "colours",     label: "Colors",           count: (p) => p.colors.length },
	{ id: "typography",  label: "Typography" },
	{ id: "logos",       label: "Logos",             count: (p) => p.assets.filter((a) => a.type === "logo").length },
	{ id: "images",      label: "Images",            count: (p) => p.assets.filter((a) => a.type !== "logo").length },
	{ id: "descriptors", label: "Style Descriptors" },
	{ id: "tone",        label: "Tone of Voice" },
	{ id: "templates",   label: "Templates",         count: (p) => p.templates.length },
	{ id: "brief",       label: "Brand Brief" },
	{ id: "publish",     label: "Test & Publish" },
];

const BRAND_PACKS_HOME = "/opal/context?tab=brand-packs";

type PageProps = {
	params: Promise<{ id: string }>;
};

export default function BrandPackDetailPage({ params }: PageProps) {
	const { id } = use(params);
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<Tab>("overview");
	const [isEditingName, setIsEditingName] = useState(false);
	const [packName, setPackName] = useState(() => getBrandPackById(id)?.name ?? "");
	const [active, setActive] = useState(() => getBrandPackById(id)?.status === "active");

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

	const isActive = active;

	return (
		<Box
			className={styles.detailPage}
			display="flex"
			flexDirection="column"
			h="full"
			overflow="auto"
			pb="64"
			pt="0"
		>
			<Box
				display="flex"
				flexDirection="column"
				gap="16"
				style={{ margin: "0 auto", maxWidth: 1240, width: "100%" }}
			>
				<BrandPackPageHeader
					onBack={() => router.push(BRAND_PACKS_HOME)}
					title={
						<>
							{isEditingName ? (
								<Box alignItems="center" display="flex" gap="8">
									<Input
										value={packName}
										onChange={(event) => setPackName(event.target.value)}
										style={{ width: 240 }}
									/>
									<Button appearance="primary" size="md" onClick={() => setIsEditingName(false)}>
										Save
									</Button>
								</Box>
							) : (
								<Box alignItems="center" display="flex" gap="8">
									<Text fontWeight="700" style={{ fontSize: 22, lineHeight: 1.15 }}>
										{packName}
									</Text>
									<Button
										appearance="subtle"
										aria-label="Edit brand pack name"
										icon={<IconEdit />}
										onClick={() => setIsEditingName(true)}
										size="sm"
									/>
								</Box>
							)}
							{isActive ? (
								<Badge intent="success" variant="subtle">
									<IconCheck size={10} style={{ color: "var(--ax-colors-fg-success)" }} />
									Active
								</Badge>
							) : (
								<StatusBadge status={pack.status === "active" ? "published" : pack.status} />
							)}
						</>
					}
					subtitle={`${pack.typography.heading} · ${pack.templateCount} templates · ${pack.channels.join(", ")}`}
					actions={
						<Box alignItems="center" display="flex" gap="10">
							<Text color="fg.secondary" fontSize="sm">Active</Text>
							<Switch checked={active} onCheckedChange={setActive} />
						</Box>
					}
				/>

				<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Tab)}>
					<TabsList className={styles.tabsList} style={{ maxWidth: "100%" }}>
						{TAB_DEFS.map((tab) => {
							const count = tab.count?.(pack);
							return (
								<TabsTrigger key={tab.id} value={tab.id}>
									<Box alignItems="center" display="flex" gap="6">
										{tab.label}
										{count !== undefined && (
											<Badge intent="neutral" variant="subtle">{count}</Badge>
										)}
									</Box>
								</TabsTrigger>
							);
						})}
					</TabsList>
				</Tabs>

				<Box>
					{activeTab === "overview"    && <OverviewTab pack={pack} onSelectTab={setActiveTab} />}
					{activeTab === "colours"     && <ColoursTab pack={pack} />}
					{activeTab === "typography"  && <TypographyTab pack={pack} />}
					{activeTab === "templates"   && <TemplatesTab pack={pack} />}
					{activeTab === "logos"       && <LogosTab pack={pack} />}
					{activeTab === "images"      && <ImagesTab pack={pack} />}
					{activeTab === "descriptors" && <StyleDescriptorsTab />}
					{activeTab === "tone"        && <ToneOfVoiceTab pack={pack} />}
					{activeTab === "brief"       && <BrandBriefTab pack={pack} />}
					{activeTab === "publish"     && <TestPublishTab pack={pack} />}
				</Box>
			</Box>
		</Box>
	);
}
