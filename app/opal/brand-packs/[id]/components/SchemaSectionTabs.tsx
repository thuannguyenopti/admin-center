"use client";

import * as React from "react";
import {Badge, Box, Button, Input, Select, Switch, Text, Textarea} from "@optiaxiom/react";
import {IconArrowUpRightFromSquare, IconCheck, IconPlus, IconXmark} from "@optiaxiom/icons";
import dsStyles from "./DesignSystemsEditor.module.css";
import {ChipList} from "./VoiceChips";
import type {
	BrandDevice,
	BrandPack,
	BrandSpecialistSystem,
	BrandWritingGuidelines,
	IllustrationSystem,
	LogoSystem,
	PhotographyCategory,
} from "../../types";
import {
	EditorField,
	EditorFieldStack,
	EditorGrid,
	EditorHeader,
	EditorPage,
	EditorPanel,
	EditorPills,
	EditorPreview,
	EditorSaveRow,
	EditorStat,
	EditorStatGrid,
	EditorTextValue,
} from "./EditorPrimitives";

function SectionCard({children, title}: {children: React.ReactNode; title: string}) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			gap="12"
			p="20"
			rounded="xl"
			shadow="sm"
		>
			<Text fontWeight="700" style={{fontSize: 15}}>
				{title}
			</Text>
			{children}
		</Box>
	);
}

function FieldRow({label, value}: {label: string; value: React.ReactNode}) {
	return (
		<Box display="grid" gap="16" style={{gridTemplateColumns: "180px minmax(0, 1fr)"}}>
			<Text color="fg.secondary" fontSize="sm" fontWeight="600">
				{label}
			</Text>
			<Box style={{minWidth: 0}}>
				{typeof value === "string" || value === null || value === undefined ? (
					<Text
						color={value ? "fg.default" : "fg.tertiary"}
						fontSize="sm"
						style={{lineHeight: 1.5}}
					>
						{value || "Not documented"}
					</Text>
				) : (
					value
				)}
			</Box>
		</Box>
	);
}

function PillList({items}: {items?: string[] | null}) {
	if (!items || items.length === 0) {
		return (
			<Text color="fg.tertiary" fontSize="sm">
				Not documented
			</Text>
		);
	}

	return (
		<Box alignItems="center" display="flex" gap="6" style={{flexWrap: "wrap"}}>
			{items.map((item) => (
				<Badge key={item} intent="neutral" variant="subtle" style={{width: "fit-content"}}>
					{item}
				</Badge>
			))}
		</Box>
	);
}

function BulletList({items}: {items?: string[] | null}) {
	if (!items || items.length === 0) {
		return (
			<Text color="fg.tertiary" fontSize="sm">
				Not documented
			</Text>
		);
	}

	return (
		<Box asChild>
			<ul style={{display: "grid", gap: 8, margin: 0, paddingLeft: 18}}>
				{items.map((item) => (
					<li key={item}>
						<Text color="fg.secondary" fontSize="sm" style={{lineHeight: 1.5}}>
							{item}
						</Text>
					</li>
				))}
			</ul>
		</Box>
	);
}

function EmptySection({label}: {label: string}) {
	return (
		<SectionCard title={label}>
			<Text color="fg.secondary" fontSize="sm" style={{lineHeight: 1.5}}>
				This section is part of the brand schema, but this brand does not have
				documented values for it yet.
			</Text>
		</SectionCard>
	);
}

function openUrl(url: string) {
	window.open(url, "_blank", "noopener,noreferrer");
}

function lines(value?: string[] | null) {
	return value?.join("\n") ?? "";
}

function splitLines(value: string) {
	return value
		.split("\n")
		.map((item) => item.trim())
		.filter(Boolean);
}

function SaveRow({saved, onSave}: {saved: boolean; onSave: () => void}) {
	return (
		<Box display="flex" justifyContent="end">
			<Button
				appearance="primary"
				icon={saved ? <IconCheck /> : undefined}
				onClick={onSave}
				size="md"
			>
				{saved ? "Saved" : "Save changes"}
			</Button>
		</Box>
	);
}

export function BrandSetupTab({pack}: {pack: BrandPack}) {
	const [name, setName] = React.useState(pack.identity?.name ?? pack.name);
	const [description, setDescription] = React.useState(
		pack.identity?.description ?? pack.description
	);
	const [brandType, setBrandType] = React.useState<string>(
		pack.identity?.brand_type ?? "master_brand"
	);
	const [parentBrand, setParentBrand] = React.useState(pack.identity?.parent_brand ?? "");
	const [expiryDate, setExpiryDate] = React.useState(pack.identity?.expiry_date ?? "");
	const [websiteUrl, setWebsiteUrl] = React.useState(pack.source?.website_url ?? "");
	const [pagesCrawled, setPagesCrawled] = React.useState(lines(pack.source?.pages_crawled));
	const [pdfFiles, setPdfFiles] = React.useState(lines(pack.source?.pdf_files_provided));
	const [extractionNotes, setExtractionNotes] = React.useState(
		pack.source?.extraction_notes ?? ""
	);
	const [confidenceNotes, setConfidenceNotes] = React.useState(
		pack.metadata?.confidence_notes ?? ""
	);
	const [saved, setSaved] = React.useState(false);

	const save = () => {
		setSaved(true);
		window.setTimeout(() => setSaved(false), 2000);
	};

	return (
		<EditorPage>
			<EditorHeader
				eyebrow="Brand Setup"
				title="Identity, source, and confidence"
				description="The canonical setup record for this brand: what it is, where evidence came from, and how much Opal should trust it."
				actions={<EditorSaveRow saved={saved} onSave={save} />}
			/>

			<EditorGrid
				aside={
					<Box display="flex" flexDirection="column" gap="16">
						<EditorPanel
							title="Status snapshot"
							description="Metadata Opal uses when resolving brand conflicts."
						>
							<EditorStatGrid>
								<EditorStat label="Schema" value={pack.schema_version ?? "1.0"} />
								<EditorStat
									label="Confidence"
									value={pack.metadata?.overall_confidence ?? "n/a"}
								/>
								<EditorStat
									label="Status"
									value={pack.metadata?.status ?? pack.status}
								/>
								<EditorStat
									label="Sources"
									value={
										(pack.source?.pages_crawled.length ?? 0) +
										(pack.source?.pdf_files_provided.length ?? 0)
									}
								/>
							</EditorStatGrid>
						</EditorPanel>
						<EditorPreview>
							<Text color="fg.success" fontSize="xs" fontWeight="700">
								Setup preview
							</Text>
							<Text
								fontWeight="700"
								style={{fontSize: 20, lineHeight: 1.2, marginTop: 8}}
							>
								{name}
							</Text>
							<Text
								color="fg.secondary"
								fontSize="sm"
								style={{lineHeight: 1.5, marginTop: 8}}
							>
								{description}
							</Text>
							<Box display="flex" gap="6" style={{flexWrap: "wrap", marginTop: 12}}>
								<Badge intent="success" variant="subtle">
									{brandType.replace("_", " ")}
								</Badge>
								<Badge intent="neutral" variant="subtle">
									{pack.brand_pack_type ?? "mixed"}
								</Badge>
							</Box>
						</EditorPreview>
					</Box>
				}
			>
				<Box display="flex" flexDirection="column" gap="16">
					<EditorPanel
						title="Brand identity"
						description="User-facing identity fields for the brand asset workspace."
					>
						<EditorFieldStack>
							<EditorField label="Brand name">
								<Input
									value={name}
									onChange={(event) => setName(event.target.value)}
								/>
							</EditorField>
							<EditorField label="Description">
								<Textarea
									value={description}
									onChange={(event) => setDescription(event.target.value)}
									rows={3}
								/>
							</EditorField>
							<EditorField label="Brand type">
								<Input
									value={brandType}
									onChange={(event) => setBrandType(event.target.value)}
								/>
							</EditorField>
							<EditorField label="Parent brand">
								<Input
									placeholder="Optional"
									value={parentBrand}
									onChange={(event) => setParentBrand(event.target.value)}
								/>
							</EditorField>
							<EditorField label="Expiry date">
								<Input
									placeholder="YYYY-MM-DD"
									value={expiryDate}
									onChange={(event) => setExpiryDate(event.target.value)}
								/>
							</EditorField>
						</EditorFieldStack>
					</EditorPanel>

					<EditorPanel
						title="Source record"
						description="Evidence that created or updated this pack."
					>
						<EditorFieldStack>
							<EditorField label="Website URL">
								<Input
									value={websiteUrl}
									onChange={(event) => setWebsiteUrl(event.target.value)}
								/>
							</EditorField>
							<EditorField label="Pages crawled">
								<Textarea
									value={pagesCrawled}
									onChange={(event) => setPagesCrawled(event.target.value)}
									rows={4}
								/>
							</EditorField>
							<EditorField label="PDF files">
								<Textarea
									value={pdfFiles}
									onChange={(event) => setPdfFiles(event.target.value)}
									rows={3}
								/>
							</EditorField>
							<EditorField label="Extraction notes">
								<Textarea
									value={extractionNotes}
									onChange={(event) => setExtractionNotes(event.target.value)}
									rows={4}
								/>
							</EditorField>
						</EditorFieldStack>
					</EditorPanel>

					<EditorPanel
						title="Confidence notes"
						description="Human-readable caveats for downstream generation and review."
					>
						<EditorFieldStack>
							<EditorField label="Agent version">
								<EditorTextValue>{pack.metadata?.agent_version}</EditorTextValue>
							</EditorField>
							<EditorField label="Notes">
								<Textarea
									value={confidenceNotes}
									onChange={(event) => setConfidenceNotes(event.target.value)}
									rows={4}
								/>
							</EditorField>
						</EditorFieldStack>
					</EditorPanel>
				</Box>
			</EditorGrid>
		</EditorPage>
	);
}

const STYLE_GUIDE_OPTIONS = [
	{label: "Not set", value: ""},
	{label: "AP", value: "AP"},
	{label: "British English", value: "British_English"},
	{label: "American English", value: "American_English"},
	{label: "Custom", value: "custom"},
];

type StyleGuideReference = NonNullable<BrandWritingGuidelines["style_guide_reference"]> | "";

export function BrandContextTab({pack}: {pack: BrandPack}) {
	const writing = pack.writing_guidelines;

	const [audience, setAudience] = React.useState(pack.brand_values?.target_audience ?? "");
	const [values, setValues] = React.useState<string[]>(
		(pack.brand_values?.values ?? []).map((value) => value.name)
	);
	const [styleGuide, setStyleGuide] = React.useState<StyleGuideReference>(
		writing?.style_guide_reference ?? ""
	);
	const [sentenceCase, setSentenceCase] = React.useState(
		writing?.sentence_case_headlines ?? false
	);
	const [grammar, setGrammar] = React.useState<string[]>(writing?.grammar_rules ?? []);
	const [descriptors, setDescriptors] = React.useState<string[]>(
		writing?.approved_descriptors ?? []
	);

	const prepend = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (value: string) =>
		setter((current) => [value, ...current]);
	const removeAt = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (index: number) =>
		setter((current) => current.filter((_, i) => i !== index));

	return (
		<EditorPage>
			<EditorPanel
				title="Audience and values"
				description="Who the brand speaks to and the principles Opal should reflect."
			>
				<EditorFieldStack>
					<EditorField label="Target audience">
						<Input
							placeholder="Who the brand is speaking to"
							size="md"
							value={audience}
							onChange={(event) => setAudience(event.target.value)}
						/>
					</EditorField>
					<EditorField label="Brand values">
						<ChipList
							items={values}
							placeholder="Add value"
							variant="neutral"
							onAdd={prepend(setValues)}
							onRemove={removeAt(setValues)}
						/>
					</EditorField>
				</EditorFieldStack>
			</EditorPanel>

			<EditorPanel
				title="Writing guidelines"
				description="Grammar, editorial style, and approved descriptors for text-on-image copy."
			>
				<EditorFieldStack>
					<EditorField label="Style reference">
						<Select
							options={STYLE_GUIDE_OPTIONS}
							value={styleGuide}
							onValueChange={(value) => setStyleGuide(value as StyleGuideReference)}
						/>
					</EditorField>
					<EditorField label="Sentence case headlines">
						<Switch checked={sentenceCase} onCheckedChange={setSentenceCase}>
							Required
						</Switch>
					</EditorField>
					<EditorField label="Grammar rules">
						<ChipList
							items={grammar}
							placeholder="Add a grammar rule"
							variant="do"
							onAdd={prepend(setGrammar)}
							onRemove={removeAt(setGrammar)}
						/>
					</EditorField>
					<EditorField label="Approved descriptors">
						<ChipList
							items={descriptors}
							placeholder="Add descriptor"
							variant="neutral"
							onAdd={prepend(setDescriptors)}
							onRemove={removeAt(setDescriptors)}
						/>
					</EditorField>
				</EditorFieldStack>
			</EditorPanel>
		</EditorPage>
	);
}

export function VisualSystemsManagerTab({pack}: {pack: BrandPack}) {
	const [logoRules, setLogoRules] = React.useState(lines(pack.logo_system?.do_not_alter_rules));
	const [placementZones, setPlacementZones] = React.useState(
		lines(pack.logo_system?.placement_zones)
	);
	const [devices, setDevices] = React.useState(
		lines(pack.brand_devices?.map((device) => `${device.name}: ${device.description}`))
	);
	const [layoutRules, setLayoutRules] = React.useState(pack.layout_grid?.layout_rules ?? "");
	const [dataVizRules, setDataVizRules] = React.useState(
		pack.data_visualisation?.style_notes ?? ""
	);
	const [saved, setSaved] = React.useState(false);

	const save = () => {
		setSaved(true);
		window.setTimeout(() => setSaved(false), 2000);
	};

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{width: "100%"}}>
			<SectionCard title="Logo system rules">
				<FieldRow
					label="Placement zones"
					value={
						<Textarea
							value={placementZones}
							onChange={(event) => setPlacementZones(event.target.value)}
							rows={3}
						/>
					}
				/>
				<FieldRow
					label="Do not alter"
					value={
						<Textarea
							value={logoRules}
							onChange={(event) => setLogoRules(event.target.value)}
							rows={4}
						/>
					}
				/>
				<FieldRow
					label="Minimum screen size"
					value={pack.logo_system?.minimum_size_screen ?? "Not documented"}
				/>
			</SectionCard>
			<SectionCard title="Graphic systems">
				<FieldRow
					label="Brand devices"
					value={
						<Textarea
							value={devices}
							onChange={(event) => setDevices(event.target.value)}
							rows={4}
						/>
					}
				/>
				<FieldRow
					label="Illustration"
					value={pack.illustration_system?.style_description ?? "Not documented"}
				/>
				<FieldRow label="Icon system" value={pack.icon_system?.style ?? "Not documented"} />
			</SectionCard>
			<SectionCard title="Layout and data visuals">
				<FieldRow
					label="Layout rules"
					value={
						<Textarea
							value={layoutRules}
							onChange={(event) => setLayoutRules(event.target.value)}
							rows={4}
						/>
					}
				/>
				<FieldRow
					label="Data visual rules"
					value={
						<Textarea
							value={dataVizRules}
							onChange={(event) => setDataVizRules(event.target.value)}
							rows={4}
						/>
					}
				/>
				<FieldRow
					label="Approved chart types"
					value={<PillList items={pack.data_visualisation?.approved_chart_types} />}
				/>
			</SectionCard>
			<SaveRow saved={saved} onSave={save} />
		</Box>
	);
}

export function LogosDevicesEditorTab({pack}: {pack: BrandPack}) {
	const [logoRules, setLogoRules] = React.useState(lines(pack.logo_system?.do_not_alter_rules));
	const [placementZones, setPlacementZones] = React.useState(
		lines(pack.logo_system?.placement_zones)
	);
	const [variants, setVariants] = React.useState(
		lines(
			pack.logo_system?.variants.map((variant) => `${variant.name}: ${variant.usage_context}`)
		)
	);
	const [devices, setDevices] = React.useState(
		lines(pack.brand_devices?.map((device) => `${device.name}: ${device.description}`))
	);
	const [saved, setSaved] = React.useState(false);

	const save = () => {
		setSaved(true);
		window.setTimeout(() => setSaved(false), 2000);
	};

	return (
		<EditorPage>
			<EditorHeader
				eyebrow="Logos & Devices"
				title="Logo rules and distinctive brand devices"
				description="Controls for how approved marks are placed, protected, and paired with recurring graphic devices."
				actions={<EditorSaveRow saved={saved} onSave={save} />}
			/>
			<EditorGrid
				aside={
					<EditorPanel
						title="Logo constraints"
						description="Quick rules surfaced during compositing."
					>
						<EditorFieldStack>
							<EditorField label="Screen size">
								<EditorTextValue>
									{pack.logo_system?.minimum_size_screen}
								</EditorTextValue>
							</EditorField>
							<EditorField label="Print size">
								<EditorTextValue>
									{pack.logo_system?.minimum_size_print}
								</EditorTextValue>
							</EditorField>
							<EditorField label="Clear space">
								<EditorTextValue>
									{pack.logo_system?.clear_space_rule}
								</EditorTextValue>
							</EditorField>
							<EditorField label="Sub-brands">
								<EditorPills items={pack.logo_system?.sub_brand_logos} />
							</EditorField>
						</EditorFieldStack>
					</EditorPanel>
				}
			>
				<Box display="flex" flexDirection="column" gap="16">
					<EditorPanel
						title="Logo system"
						description="Editable variant, placement, and protection rules."
					>
						<EditorFieldStack>
							<EditorField label="Variants">
								<Textarea
									value={variants}
									onChange={(event) => setVariants(event.target.value)}
									rows={4}
								/>
							</EditorField>
							<EditorField label="Placement zones">
								<Textarea
									value={placementZones}
									onChange={(event) => setPlacementZones(event.target.value)}
									rows={3}
								/>
							</EditorField>
							<EditorField label="Do not alter">
								<Textarea
									value={logoRules}
									onChange={(event) => setLogoRules(event.target.value)}
									rows={4}
								/>
							</EditorField>
						</EditorFieldStack>
					</EditorPanel>
					<EditorPanel
						title="Brand devices"
						description={`${pack.brand_devices?.length ?? 0} documented device${pack.brand_devices?.length === 1 ? "" : "s"} beyond logos.`}
					>
						<EditorFieldStack>
							<EditorField label="Devices">
								<Textarea
									value={devices}
									onChange={(event) => setDevices(event.target.value)}
									rows={5}
								/>
							</EditorField>
						</EditorFieldStack>
					</EditorPanel>
				</Box>
			</EditorGrid>
		</EditorPage>
	);
}

function InUseToggle({checked, onChange}: {checked: boolean; onChange: (value: boolean) => void}) {
	return (
		<Box className={dsStyles.toggleRow}>
			<Switch checked={checked} onCheckedChange={onChange}>
				In use
			</Switch>
			<Badge intent={checked ? "success" : "neutral"} variant="subtle">
				{checked ? "Active" : "Inactive"}
			</Badge>
		</Box>
	);
}

function DsChipList({
	items,
	onAdd,
	onRemove,
	tone,
	pill = false,
	placeholder,
}: {
	items: string[];
	onAdd: (value: string) => void;
	onRemove: (index: number) => void;
	tone: "green" | "red";
	pill?: boolean;
	placeholder: string;
}) {
	const [text, setText] = React.useState("");

	const submit = () => {
		const trimmed = text.trim();
		if (!trimmed) {
			return;
		}

		onAdd(trimmed);
		setText("");
	};

	const chipClass = [
		dsStyles.chip,
		pill ? dsStyles.chipPill : "",
		tone === "green" ? dsStyles.chipGreen : dsStyles.chipRed,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<Box display="flex" flexDirection="column" gap="8">
			<Box className={dsStyles.chipAddRow}>
				<Input
					placeholder={placeholder}
					size="md"
					value={text}
					onChange={(event) => setText(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							submit();
						}
					}}
				/>
				<Button appearance="default" aria-label="Add" icon={<IconPlus />} onClick={submit} size="md" />
			</Box>
			{items.length === 0 ? (
				<Text color="fg.tertiary" style={{fontSize: 14}}>
					None added
				</Text>
			) : (
				<Box className={pill ? dsStyles.chipWrap : dsStyles.chipStack}>
					{items.map((item, index) => (
						<Box key={`${item}-${index}`} className={chipClass}>
							<Text className={dsStyles.chipText}>{item}</Text>
							<button
								aria-label={`Remove ${item}`}
								className={dsStyles.chipDelete}
								type="button"
								onClick={() => onRemove(index)}
							>
								<IconXmark size={11} />
							</button>
						</Box>
					))}
				</Box>
			)}
		</Box>
	);
}

const HIERARCHY_OPTIONS = [
	{label: "Primary", value: "primary"},
	{label: "Secondary", value: "secondary"},
	{label: "Fallback", value: "fallback"},
];

export function DesignSystemsEditorTab({pack}: {pack: BrandPack}) {
	const illustration = pack.illustration_system;
	const icon = pack.icon_system;
	const layout = pack.layout_grid;
	const dataViz = pack.data_visualisation;

	// Illustration
	const [illoInUse, setIlloInUse] = React.useState(illustration?.in_use ?? false);
	const [illoHierarchy, setIlloHierarchy] = React.useState(illustration?.hierarchy ?? "");
	const [illoStyle, setIlloStyle] = React.useState(illustration?.style_description ?? "");
	const [illoDo, setIlloDo] = React.useState<string[]>(illustration?.do_rules ?? []);
	const [illoDont, setIlloDont] = React.useState<string[]>(illustration?.dont_rules ?? []);

	// Icon
	const [iconInUse, setIconInUse] = React.useState(icon?.in_use ?? false);
	const [iconStyle, setIconStyle] = React.useState(icon?.style ?? "");
	const [iconArtboard, setIconArtboard] = React.useState(
		icon?.artboard_px != null ? `${icon.artboard_px} px` : ""
	);
	const [iconLineWeight, setIconLineWeight] = React.useState(
		icon?.line_weight_px != null ? `${icon.line_weight_px} px` : ""
	);
	const [iconColour, setIconColour] = React.useState(icon?.colour_rules ?? "");

	// Layout grid
	const [layoutInUse, setLayoutInUse] = React.useState(layout?.in_use ?? false);
	const [layoutColumns, setLayoutColumns] = React.useState(
		layout?.column_count != null ? String(layout.column_count) : ""
	);
	const [layoutGutter, setLayoutGutter] = React.useState(layout?.gutter_rules ?? "");
	const [layoutMargins, setLayoutMargins] = React.useState(layout?.margin_rules ?? "");
	const [layoutRules, setLayoutRules] = React.useState(layout?.layout_rules ?? "");

	// Data visualisation
	const [dvInUse, setDvInUse] = React.useState(dataViz?.in_use ?? false);
	const [dvApproved, setDvApproved] = React.useState<string[]>(
		dataViz?.approved_chart_types ?? []
	);
	const [dvProhibited, setDvProhibited] = React.useState<string[]>(
		dataViz?.prohibited_chart_types ?? []
	);
	const [dvGradient, setDvGradient] = React.useState(dataViz?.gradient_permitted ?? false);
	const [dvStyleNotes, setDvStyleNotes] = React.useState(dataViz?.style_notes ?? "");

	const prepend = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (value: string) =>
		setter((current) => [value, ...current]);
	const removeAt = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (index: number) =>
		setter((current) => current.filter((_, i) => i !== index));

	return (
		<EditorPage>
			<EditorHeader
				eyebrow="Design Systems"
				title="Illustration, icons, layout, and data visuals"
				description="Specialist systems that shape generated visuals beyond core colour, type, photography, and logos."
			/>
			<EditorGrid wide>
				<EditorPanel
					title="Illustration system"
					description="Style, hierarchy, and rules for generated illustration."
				>
					<Box display="flex" flexDirection="column" gap="16">
						<InUseToggle checked={illoInUse} onChange={setIlloInUse} />
						{illoInUse && (
							<EditorFieldStack>
								<EditorField label="Hierarchy">
									<Select
										options={HIERARCHY_OPTIONS}
										value={illoHierarchy}
										onValueChange={(value) =>
											setIlloHierarchy(value as typeof illoHierarchy)
										}
									/>
								</EditorField>
								<EditorField label="Style">
									<Input
										placeholder="e.g. Geometric semi-flat with a limited palette"
										size="md"
										value={illoStyle}
										onChange={(event) => setIlloStyle(event.target.value)}
									/>
								</EditorField>
								<Box className={dsStyles.doDontGrid}>
									<Box display="flex" flexDirection="column" gap="8">
										<Text className={dsStyles.colHeading}>Do</Text>
										<DsChipList
											items={illoDo}
											placeholder="Add rule"
											tone="green"
											onAdd={prepend(setIlloDo)}
											onRemove={removeAt(setIlloDo)}
										/>
									</Box>
									<Box display="flex" flexDirection="column" gap="8">
										<Text className={dsStyles.colHeading}>Do not</Text>
										<DsChipList
											items={illoDont}
											placeholder="Add rule"
											tone="red"
											onAdd={prepend(setIlloDont)}
											onRemove={removeAt(setIlloDont)}
										/>
									</Box>
								</Box>
							</EditorFieldStack>
						)}
					</Box>
				</EditorPanel>

				<EditorPanel
					title="Icon system"
					description="Artboard, stroke, and colour rules for generated iconography."
				>
					<Box display="flex" flexDirection="column" gap="16">
						<InUseToggle checked={iconInUse} onChange={setIconInUse} />
						<EditorFieldStack>
							<EditorField label="Style">
								<Input
									placeholder="e.g. Simple linear icons with rounded joins"
									size="md"
									value={iconStyle}
									onChange={(event) => setIconStyle(event.target.value)}
								/>
							</EditorField>
							<EditorField label="Artboard">
								<Input
									placeholder="e.g. 24 px"
									size="md"
									value={iconArtboard}
									onChange={(event) => setIconArtboard(event.target.value)}
								/>
							</EditorField>
							<EditorField label="Line weight">
								<Input
									placeholder="e.g. 2 px"
									size="md"
									value={iconLineWeight}
									onChange={(event) => setIconLineWeight(event.target.value)}
								/>
							</EditorField>
							<EditorField label="Colour rules">
								<Input
									placeholder="e.g. Deep Forest on light backgrounds"
									size="md"
									value={iconColour}
									onChange={(event) => setIconColour(event.target.value)}
								/>
							</EditorField>
						</EditorFieldStack>
					</Box>
				</EditorPanel>

				<EditorPanel
					title="Layout grid"
					description="Column, gutter, and margin constraints for generated layouts."
				>
					<Box display="flex" flexDirection="column" gap="16">
						<InUseToggle checked={layoutInUse} onChange={setLayoutInUse} />
						<EditorFieldStack>
							<EditorField label="Columns">
								<Input
									placeholder="e.g. 12"
									size="md"
									value={layoutColumns}
									onChange={(event) => setLayoutColumns(event.target.value)}
								/>
							</EditorField>
							<EditorField label="Gutter">
								<Input
									placeholder="e.g. 24 px"
									size="md"
									value={layoutGutter}
									onChange={(event) => setLayoutGutter(event.target.value)}
								/>
							</EditorField>
							<EditorField label="Margins">
								<Input
									placeholder="e.g. 48 px on desktop, 16 px on mobile"
									size="md"
									value={layoutMargins}
									onChange={(event) => setLayoutMargins(event.target.value)}
								/>
							</EditorField>
							<EditorField label="Layout rules">
								<Input
									placeholder="e.g. Strong left alignment for copy-heavy templates"
									size="md"
									value={layoutRules}
									onChange={(event) => setLayoutRules(event.target.value)}
								/>
							</EditorField>
						</EditorFieldStack>
					</Box>
				</EditorPanel>

				<EditorPanel
					title="Data visualisation"
					description="Chart types, palette source, and style constraints."
				>
					<Box display="flex" flexDirection="column" gap="16">
						<InUseToggle checked={dvInUse} onChange={setDvInUse} />
						<EditorField label="Approved types">
							<DsChipList
								items={dvApproved}
								pill
								placeholder="Add chart type"
								tone="green"
								onAdd={prepend(setDvApproved)}
								onRemove={removeAt(setDvApproved)}
							/>
						</EditorField>
						<EditorField label="Prohibited types">
							<DsChipList
								items={dvProhibited}
								pill
								placeholder="Add chart type"
								tone="red"
								onAdd={prepend(setDvProhibited)}
								onRemove={removeAt(setDvProhibited)}
							/>
						</EditorField>
						<EditorField label="Gradients">
							<Switch checked={dvGradient} onCheckedChange={setDvGradient}>
								Permitted in chart fills
							</Switch>
						</EditorField>
						<EditorField label="Style notes">
							<Input
								placeholder="e.g. No decorative gradients in chart fills"
								size="md"
								value={dvStyleNotes}
								onChange={(event) => setDvStyleNotes(event.target.value)}
							/>
						</EditorField>
					</Box>
				</EditorPanel>
			</EditorGrid>
		</EditorPage>
	);
}

export function AdvancedGovernanceTab({pack}: {pack: BrandPack}) {
	const [expressionRules, setExpressionRules] = React.useState(
		lines(pack.expression_system?.rules)
	);
	const [brandCodesRules, setBrandCodesRules] = React.useState(lines(pack.brand_codes?.rules));
	const [motionRules, setMotionRules] = React.useState(lines(pack.motion_sonic?.rules));
	const [legalRules, setLegalRules] = React.useState(lines(pack.legal?.rules));
	const [saved, setSaved] = React.useState(false);

	const save = () => {
		setSaved(true);
		window.setTimeout(() => setSaved(false), 2000);
	};

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{width: "100%"}}>
			<SectionCard title="Expression system">
				<FieldRow
					label="Summary"
					value={pack.expression_system?.summary ?? "Not documented"}
				/>
				<FieldRow
					label="Rules"
					value={
						<Textarea
							value={expressionRules}
							onChange={(event) => setExpressionRules(event.target.value)}
							rows={4}
						/>
					}
				/>
			</SectionCard>
			<SectionCard title="Specialist brand systems">
				<FieldRow
					label="Brand codes"
					value={
						<Textarea
							value={brandCodesRules}
							onChange={(event) => setBrandCodesRules(event.target.value)}
							rows={3}
						/>
					}
				/>
				<FieldRow
					label="Motion and sonic"
					value={
						<Textarea
							value={motionRules}
							onChange={(event) => setMotionRules(event.target.value)}
							rows={3}
						/>
					}
				/>
				<FieldRow
					label="Legal rules"
					value={
						<Textarea
							value={legalRules}
							onChange={(event) => setLegalRules(event.target.value)}
							rows={3}
						/>
					}
				/>
				<FieldRow
					label="AI identity"
					value={pack.ai_identity?.summary ?? "Not documented"}
				/>
				<FieldRow
					label="Environmental"
					value={pack.environmental?.summary ?? "Not documented"}
				/>
			</SectionCard>
			<SaveRow saved={saved} onSave={save} />
		</Box>
	);
}

export function IdentityTab({pack}: {pack: BrandPack}) {
	const identity = pack.identity;

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{width: "100%"}}>
			<SectionCard title="Identity">
				<FieldRow label="Name" value={identity?.name ?? pack.name} />
				<FieldRow label="Description" value={identity?.description ?? pack.description} />
				<FieldRow
					label="Brand type"
					value={identity?.brand_type?.replace("_", " ") ?? "Not documented"}
				/>
				<FieldRow label="Parent brand" value={identity?.parent_brand} />
				<FieldRow label="Expiry date" value={identity?.expiry_date} />
			</SectionCard>
		</Box>
	);
}

export function SourceTab({pack}: {pack: BrandPack}) {
	const source = pack.source;
	if (!source) return <EmptySection label="Source" />;

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{width: "100%"}}>
			<SectionCard title="Source">
				<FieldRow
					label="Website"
					value={
						source.website_url ? (
							<Button
								appearance="subtle"
								icon={<IconArrowUpRightFromSquare size={12} />}
								iconPosition="end"
								onClick={() => openUrl(source.website_url!)}
								size="sm"
							>
								{source.website_url}
							</Button>
						) : null
					}
				/>
				<FieldRow
					label="Pages crawled"
					value={<BulletList items={source.pages_crawled} />}
				/>
				<FieldRow
					label="PDFs provided"
					value={<PillList items={source.pdf_files_provided} />}
				/>
				<FieldRow
					label="PDF types"
					value={<PillList items={source.pdf_types_detected} />}
				/>
				<FieldRow
					label="Public guidelines"
					value={source.guidelines_found ? "Found" : "Not found"}
				/>
				<FieldRow
					label="Guideline URLs"
					value={<BulletList items={source.guidelines_urls} />}
				/>
				<FieldRow label="Extraction notes" value={source.extraction_notes} />
			</SectionCard>
		</Box>
	);
}

function LogoVariantCard({variant}: {variant: LogoSystem["variants"][0]}) {
	return (
		<Box bg="bg.secondary" display="flex" flexDirection="column" gap="8" p="12" rounded="lg">
			<Text fontWeight="700" fontSize="sm">
				{variant.name}
			</Text>
			<Text color="fg.secondary" fontSize="sm" style={{lineHeight: 1.45}}>
				{variant.usage_context}
			</Text>
			<PillList items={variant.colour_versions} />
		</Box>
	);
}

export function LogoSystemTab({pack}: {pack: BrandPack}) {
	const logo = pack.logo_system;
	if (!logo) return <EmptySection label="Logo System" />;

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{width: "100%"}}>
			<SectionCard title="Logo System">
				<FieldRow
					label="Variants"
					value={
						<Box
							display="grid"
							gap="10"
							style={{gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"}}
						>
							{logo.variants.map((variant) => (
								<LogoVariantCard key={variant.name} variant={variant} />
							))}
						</Box>
					}
				/>
				<FieldRow label="Clear space" value={logo.clear_space_rule} />
				<FieldRow label="Minimum print size" value={logo.minimum_size_print} />
				<FieldRow label="Minimum screen size" value={logo.minimum_size_screen} />
				<FieldRow
					label="Placement zones"
					value={<PillList items={logo.placement_zones} />}
				/>
				<FieldRow
					label="Do not alter"
					value={<BulletList items={logo.do_not_alter_rules} />}
				/>
				<FieldRow
					label="Sub-brand logos"
					value={<PillList items={logo.sub_brand_logos} />}
				/>
			</SectionCard>
		</Box>
	);
}

function PhotographyCard({category}: {category: PhotographyCategory}) {
	return (
		<SectionCard title={category.name}>
			<Text color="fg.secondary" fontSize="sm" style={{lineHeight: 1.55}}>
				{category.description}
			</Text>
			<FieldRow label="Sub-categories" value={<PillList items={category.sub_categories} />} />
			<FieldRow label="Do" value={<BulletList items={category.do_rules} />} />
			<FieldRow label="Do not" value={<BulletList items={category.dont_rules} />} />
		</SectionCard>
	);
}

export function PhotographyCategoriesTab({pack}: {pack: BrandPack}) {
	const categories = pack.photography_categories;
	if (!categories || categories.length === 0)
		return <EmptySection label="Photography Categories" />;

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{width: "100%"}}>
			{categories.map((category) => (
				<PhotographyCard key={category.name} category={category} />
			))}
		</Box>
	);
}

function DeviceCard({device}: {device: BrandDevice}) {
	return (
		<SectionCard title={device.name}>
			<Text color="fg.secondary" fontSize="sm" style={{lineHeight: 1.55}}>
				{device.description}
			</Text>
			<FieldRow label="Usage rules" value={device.usage_rules} />
			{device.usage_restriction && (
				<FieldRow label="Never use as" value={device.usage_restriction} />
			)}
		</SectionCard>
	);
}

export function BrandDevicesTab({pack}: {pack: BrandPack}) {
	const devices = pack.brand_devices;
	if (!devices || devices.length === 0) return <EmptySection label="Brand Devices" />;

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{width: "100%"}}>
			{devices.map((device) => (
				<DeviceCard key={device.name} device={device} />
			))}
		</Box>
	);
}

export function IllustrationSystemTab({pack}: {pack: BrandPack}) {
	const illustration = pack.illustration_system;
	if (!illustration) return <EmptySection label="Illustration System" />;

	const skinToneLabels = illustration.skin_tones?.map((tone) => `${tone.label} ${tone.hex}`);

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{width: "100%"}}>
			<SectionCard title="Illustration System">
				<FieldRow label="In use" value={illustration.in_use ? "Yes" : "No"} />
				<FieldRow label="Hierarchy" value={illustration.hierarchy} />
				<FieldRow label="Style" value={illustration.style_description} />
				<FieldRow
					label="Human proportions"
					value={<ProportionList illustration={illustration} />}
				/>
				<FieldRow label="Skin tones" value={<PillList items={skinToneLabels} />} />
				<FieldRow label="Do" value={<BulletList items={illustration.do_rules} />} />
				<FieldRow label="Do not" value={<BulletList items={illustration.dont_rules} />} />
			</SectionCard>
		</Box>
	);
}

function ProportionList({illustration}: {illustration: IllustrationSystem}) {
	if (!illustration.human_proportions)
		return (
			<Text color="fg.tertiary" fontSize="sm">
				Not documented
			</Text>
		);

	return (
		<Box display="grid" gap="8">
			{Object.entries(illustration.human_proportions).map(([label, value]) => (
				<FieldRow key={label} label={label.replaceAll("_", " ")} value={value} />
			))}
		</Box>
	);
}

export function IconSystemTab({pack}: {pack: BrandPack}) {
	const icons = pack.icon_system;
	if (!icons) return <EmptySection label="Icon System" />;

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{width: "100%"}}>
			<SectionCard title="Icon System">
				<FieldRow label="In use" value={icons.in_use ? "Yes" : "No"} />
				<FieldRow label="Style" value={icons.style} />
				<FieldRow
					label="Artboard"
					value={icons.artboard_px ? `${icons.artboard_px}px` : null}
				/>
				<FieldRow label="Gutter" value={icons.gutter_px ? `${icons.gutter_px}px` : null} />
				<FieldRow
					label="Line weight"
					value={icons.line_weight_px ? `${icons.line_weight_px}px` : null}
				/>
				<FieldRow label="Color rules" value={icons.colour_rules} />
			</SectionCard>
		</Box>
	);
}

export function ValuesAudienceTab({pack}: {pack: BrandPack}) {
	const audience = pack.brand_values?.target_audience;
	return (
		<Box display="flex" flexDirection="column" gap="16" style={{width: "100%"}}>
			<SectionCard title="Brand Values">
				<PillList items={pack.brand_values?.values.map((value) => value.name)} />
			</SectionCard>
			<SectionCard title="Target Audience">
				<Text
					color={audience ? "fg.secondary" : "fg.tertiary"}
					fontSize="sm"
					style={{lineHeight: 1.6}}
				>
					{audience ?? "Not documented"}
				</Text>
			</SectionCard>
		</Box>
	);
}

export function WritingGuidelinesTab({pack}: {pack: BrandPack}) {
	const writing = pack.writing_guidelines;
	if (!writing) return <EmptySection label="Writing Guidelines" />;

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{width: "100%"}}>
			<SectionCard title="Writing Guidelines">
				<FieldRow label="Style reference" value={writing.style_guide_reference} />
				<FieldRow
					label="Sentence case headlines"
					value={writing.sentence_case_headlines ? "Required" : "No"}
				/>
				<FieldRow label="Grammar rules" value={<BulletList items={writing.grammar_rules} />} />
				<FieldRow
					label="Approved descriptors"
					value={<PillList items={writing.approved_descriptors} />}
				/>
			</SectionCard>
		</Box>
	);
}

export function LayoutGridTab({pack}: {pack: BrandPack}) {
	const layout = pack.layout_grid;
	if (!layout) return <EmptySection label="Layout Grid" />;

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{width: "100%"}}>
			<SectionCard title="Layout Grid">
				<FieldRow label="In use" value={layout.in_use ? "Yes" : "No"} />
				<FieldRow label="Columns" value={layout.column_count} />
				<FieldRow label="Gutter" value={layout.gutter_rules} />
				<FieldRow label="Margins" value={layout.margin_rules} />
				<FieldRow label="Layout rules" value={layout.layout_rules} />
			</SectionCard>
		</Box>
	);
}

export function DataVisualisationTab({pack}: {pack: BrandPack}) {
	const dataViz = pack.data_visualisation;
	if (!dataViz) return <EmptySection label="Data Visualization" />;

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{width: "100%"}}>
			<SectionCard title="Data Visualization">
				<FieldRow label="In use" value={dataViz.in_use ? "Yes" : "No"} />
				<FieldRow
					label="Approved charts"
					value={<PillList items={dataViz.approved_chart_types} />}
				/>
				<FieldRow
					label="Prohibited charts"
					value={<PillList items={dataViz.prohibited_chart_types} />}
				/>
				<FieldRow
					label="Gradients"
					value={dataViz.gradient_permitted ? "Permitted" : "Not permitted"}
				/>
				<FieldRow label="Style notes" value={dataViz.style_notes} />
			</SectionCard>
		</Box>
	);
}

function SpecialistSystemTab({
	emptyLabel,
	system,
	title,
}: {
	emptyLabel: string;
	system?: BrandSpecialistSystem | null;
	title: string;
}) {
	if (!system) return <EmptySection label={emptyLabel} />;

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{width: "100%"}}>
			<SectionCard title={title}>
				<FieldRow label="In use" value={system.in_use ? "Yes" : "No"} />
				<FieldRow label="Summary" value={system.summary} />
				<FieldRow
					label="Key fields"
					value={
						system.key_fields && system.key_fields.length > 0 ? (
							<Box display="grid" gap="8">
								{system.key_fields.map((field) => (
									<FieldRow
										key={field.label}
										label={field.label}
										value={field.value}
									/>
								))}
							</Box>
						) : null
					}
				/>
				<FieldRow
					label="States"
					value={
						system.states && system.states.length > 0 ? (
							<Box display="grid" gap="8">
								{system.states.map((state) => (
									<Box key={state.name} bg="bg.secondary" p="12" rounded="lg">
										<Text fontSize="sm" fontWeight="700">
											{state.name}
										</Text>
										<Text
											color="fg.secondary"
											fontSize="sm"
											style={{lineHeight: 1.5, marginTop: 4}}
										>
											{state.description}
										</Text>
									</Box>
								))}
							</Box>
						) : null
					}
				/>
				<FieldRow label="Rules" value={<BulletList items={system.rules} />} />
			</SectionCard>
		</Box>
	);
}

export function AIIdentityTab({pack}: {pack: BrandPack}) {
	return (
		<SpecialistSystemTab
			emptyLabel="AI Identity"
			system={pack.ai_identity}
			title="AI Identity"
		/>
	);
}

export function ExpressionSystemTab({pack}: {pack: BrandPack}) {
	return (
		<SpecialistSystemTab
			emptyLabel="Expression System"
			system={pack.expression_system}
			title="Expression System"
		/>
	);
}

export function BrandScalabilityTab({pack}: {pack: BrandPack}) {
	return (
		<SpecialistSystemTab
			emptyLabel="Brand Scalability System"
			system={pack.brand_scalability_system}
			title="Brand Scalability System"
		/>
	);
}

export function BrandCodesTab({pack}: {pack: BrandPack}) {
	return (
		<SpecialistSystemTab
			emptyLabel="Brand Codes"
			system={pack.brand_codes}
			title="Brand Codes"
		/>
	);
}

export function MotionSonicTab({pack}: {pack: BrandPack}) {
	return (
		<SpecialistSystemTab
			emptyLabel="Motion & Sonic"
			system={pack.motion_sonic}
			title="Motion & Sonic"
		/>
	);
}

export function LegalTab({pack}: {pack: BrandPack}) {
	return <SpecialistSystemTab emptyLabel="Legal" system={pack.legal} title="Legal" />;
}

export function EnvironmentalTab({pack}: {pack: BrandPack}) {
	return (
		<SpecialistSystemTab
			emptyLabel="Environmental"
			system={pack.environmental}
			title="Environmental"
		/>
	);
}

export function MetadataTab({pack}: {pack: BrandPack}) {
	const metadata = pack.metadata;

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{width: "100%"}}>
			<SectionCard title="Metadata">
				<FieldRow label="Created date" value={metadata?.created_date ?? pack.createdAt} />
				<FieldRow label="Agent version" value={metadata?.agent_version} />
				<FieldRow
					label="PDF source types"
					value={<PillList items={metadata?.pdf_source_types} />}
				/>
				<FieldRow
					label="Overall confidence"
					value={metadata?.overall_confidence ?? "Not documented"}
				/>
				<FieldRow label="Confidence notes" value={metadata?.confidence_notes} />
				<FieldRow label="Status" value={metadata?.status ?? pack.status} />
			</SectionCard>
		</Box>
	);
}
