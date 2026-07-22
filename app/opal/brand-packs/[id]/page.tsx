"use client";

import {use, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {Badge, Box, Button, Input, Switch, Text} from "@optiaxiom/react";
import {IconCheck, IconPenToSquare as IconEdit} from "@optiaxiom/icons";
import {useLayout} from "@/app/context/LayoutContext";
import {BrandPackPageHeader} from "../components/BrandPackPageHeader";
import {StatusBadge} from "../components/StatusBadge";
import {ColoursTab} from "./components/ColoursTab";
import {TypographyTab} from "./components/TypographyTab";
import {LogosTab} from "./components/LogosTab";
import {PhotographyTab} from "./components/PhotographyTab";
import {ToneOfVoiceTab} from "./components/ToneOfVoiceTab";
import {BrandBriefTab} from "./components/BrandBriefTab";
import {AssetsTab} from "./components/AssetsTab";
import {OverviewTab} from "./components/OverviewTab";
import {
	BrandContextTab,
	BrandSetupTab,
	DesignSystemsEditorTab,
} from "./components/SchemaSectionTabs";
import {BrandPackSectionNav, type SectionId} from "./components/BrandPackSectionNav";
import {getBrandPackById} from "../data";
import {getBrandTemplates, getBrandTypographySummary} from "../adapters";
import styles from "./BrandPackDetailPage.module.css";

const BRAND_PACKS_HOME = "/opal/context?tab=brand";

type PageProps = {
	params: Promise<{id: string}>;
};

export default function BrandPackDetailPage({params}: PageProps) {
	const {id} = use(params);
	const router = useRouter();
	const {setSubNavContent, setSubNavWidth, setHidePageHeader} = useLayout();
	const [activeSection, setActiveSection] = useState<SectionId>("overview");
	const [isEditingName, setIsEditingName] = useState(false);
	const [packName, setPackName] = useState(() => getBrandPackById(id)?.name ?? "");
	const [active, setActive] = useState(() => getBrandPackById(id)?.status === "active");

	const pack = getBrandPackById(id);

	useEffect(() => {
		setSubNavWidth(288);
		setHidePageHeader(true);

		return () => {
			setSubNavWidth(272);
			setHidePageHeader(false);
		};
	}, [setSubNavWidth, setHidePageHeader]);

	useEffect(() => {
		if (!pack) {
			setSubNavContent(null);
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

		return () => {
			setSubNavContent(null);
		};
	}, [activeSection, pack, packName, setSubNavContent]);

	if (!pack) {
		return (
			<Box
				alignItems="center"
				display="flex"
				flexDirection="column"
				gap="16"
				justifyContent="center"
				style={{padding: "80px 32px"}}
			>
				<Text fontWeight="700" style={{fontSize: 24}}>
					Brand not found
				</Text>
				<Text color="fg.secondary">The brand you're looking for doesn't exist.</Text>
				<Button appearance="default" onClick={() => router.push(BRAND_PACKS_HOME)}>
					Back to Brand
				</Button>
			</Box>
		);
	}

	const isActive = active;
	const typographySummary = getBrandTypographySummary(pack);
	const templateCount =
		pack.template_metadata?.template_count ??
		pack.templateCount ??
		getBrandTemplates(pack).length;

	return (
		<Box
			className={styles.detailPage}
			display="flex"
			flexDirection="column"
			h="full"
			overflow="auto"
			pb="64"
		>
			<Box
				className={styles.detailInner}
				display="flex"
				flexDirection="column"
				gap="24"
			>
				<BrandPackPageHeader
					title={
						<>
							{isEditingName ? (
								<Box alignItems="center" display="flex" gap="8">
									<Input
										value={packName}
										onChange={(event) => setPackName(event.target.value)}
										style={{width: 240}}
									/>
									<Button
										appearance="primary"
										size="md"
										onClick={() => setIsEditingName(false)}
									>
										Save
									</Button>
								</Box>
							) : (
								<Box alignItems="center" display="flex" gap="8">
									<Text fontWeight="700" style={{fontSize: 22, lineHeight: 1.15}}>
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
								<Badge intent="success" variant="subtle" style={{fontSize: 12}}>
									<IconCheck
										size={12}
										style={{color: "var(--ax-colors-fg-success)"}}
									/>
									Active
								</Badge>
							) : (
								<StatusBadge
									status={pack.status === "active" ? "published" : pack.status}
								/>
							)}
						</>
					}
					subtitle={`${typographySummary.heading} · ${templateCount} templates · ${pack.channels.join(", ")}`}
					actions={
						<Box
							alignItems="center"
							display="flex"
							gap="8"
							className={styles.brandToggle}
						>
							<Text color="fg.secondary" style={{fontSize: 12, lineHeight: 1.35}}>
								Active
							</Text>
							<Switch checked={active} onCheckedChange={setActive} />
						</Box>
					}
				/>

				<Box className={styles.sectionContent}>
					{activeSection === "overview" && (
						<OverviewTab
							pack={pack}
							onSelectTab={(section) => setActiveSection(section)}
						/>
					)}
					{activeSection === "setup" && <BrandSetupTab pack={pack} />}
					{activeSection === "brief" && <BrandBriefTab pack={pack} />}
					{activeSection === "colours" && <ColoursTab pack={pack} />}
					{activeSection === "typography" && <TypographyTab pack={pack} />}
					{activeSection === "photography" && <PhotographyTab pack={pack} />}
					{activeSection === "logos-devices" && (
						<LogosTab pack={pack} onManageAssets={() => setActiveSection("assets")} />
					)}
					{activeSection === "design-systems" && <DesignSystemsEditorTab pack={pack} />}
					{activeSection === "voice-audience" && (
						<Box display="flex" flexDirection="column" gap="24">
							<ToneOfVoiceTab pack={pack} />
							<BrandContextTab pack={pack} />
						</Box>
					)}
					{activeSection === "assets" && <AssetsTab pack={pack} />}
				</Box>
			</Box>
		</Box>
	);
}
