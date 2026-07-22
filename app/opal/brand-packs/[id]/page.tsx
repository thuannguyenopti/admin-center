"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Box, Button, Input, Switch, Text } from "@optiaxiom/react";
import { IconCheck, IconPenToSquare as IconEdit } from "@optimizely/axiom-icons";
import { BrandPackPageHeader } from "../components/BrandPackPageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { BrandSectionNav, type BrandSection } from "./components/BrandSectionNav";
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

const BRAND_HOME = "/opal/context?tab=brand";

type PageProps = {
	params: Promise<{ id: string }>;
};

export default function BrandPackDetailPage({ params }: PageProps) {
	const { id } = use(params);
	const router = useRouter();
	const [activeSection, setActiveSection] = useState<BrandSection>("overview");
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
				<Text fontWeight="700" style={{ fontSize: 24 }}>Brand not found</Text>
				<Text color="fg.secondary">The brand you're looking for doesn't exist.</Text>
				<Button appearance="default" onClick={() => router.push(BRAND_HOME)}>
					Back to Brand
				</Button>
			</Box>
		);
	}

	const isActive = active;

	const counts = {
		colours: pack.colors.length,
		images: pack.assets.filter((a) => a.type !== "logo").length,
		logos: pack.assets.filter((a) => a.type === "logo").length,
		templates: pack.templates.length,
	};

	return (
		<Box display="flex" h="full" overflow="hidden">
			<BrandSectionNav active={activeSection} counts={counts} onSelect={setActiveSection} />
			<Box className={styles.detailContent} display="flex" flexDirection="column" h="full" overflow="auto" pb="64" style={{ flex: 1 }}>
				<Box display="flex" flexDirection="column" gap="16" pt="24" style={{ margin: "0 auto", maxWidth: 960, width: "100%" }}>
					<BrandPackPageHeader
						maxWidth={960}
						onBack={() => router.push(BRAND_HOME)}
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
											aria-label="Edit brand name"
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

					<Box>
						{activeSection === "overview" && <OverviewTab pack={pack} onSelectTab={(t) => setActiveSection(t as BrandSection)} />}
						{activeSection === "colours" && <ColoursTab pack={pack} />}
						{activeSection === "typography" && <TypographyTab pack={pack} />}
						{activeSection === "templates" && <TemplatesTab pack={pack} />}
						{activeSection === "logos" && <LogosTab pack={pack} />}
						{activeSection === "images" && <ImagesTab pack={pack} />}
						{activeSection === "descriptors" && <StyleDescriptorsTab />}
						{activeSection === "tone" && <ToneOfVoiceTab pack={pack} />}
						{activeSection === "brief" && <BrandBriefTab pack={pack} />}
						{activeSection === "publish" && <TestPublishTab pack={pack} />}
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
