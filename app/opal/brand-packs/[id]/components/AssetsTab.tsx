"use client";

import {type ChangeEvent, type ReactNode, useRef, useState} from "react";
import {
	Badge,
	Box,
	Button,
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	Text,
	Textarea,
} from "@optiaxiom/react";
import {
	IconArrowUpRightFromSquare,
	IconBolt,
	IconCheck,
	IconCopy,
	IconDownload,
	IconFile,
	IconImage,
	IconPlus,
	IconSparkles,
	IconTag,
} from "@optiaxiom/icons";
import {useLayout} from "@/app/context/LayoutContext";
import type {BrandAsset, BrandPack, BrandTemplate} from "../../types";
import {getBrandTemplates} from "../../adapters";
import "@/app/opal/brand-packs/components/TemplateCardBlock";

type AssetsTabProps = {
	pack: BrandPack;
};

type AssetLibraryTab =
	| "all"
	| "logos"
	| "photos"
	| "templates"
	| "icons"
	| "illustrations"
	| "backgrounds"
	| "misc";
type AssetClassification = "logo" | "photo" | "illustration" | "icon" | "background" | "misc";

const LIBRARY_TABS: Array<{label: string; value: AssetLibraryTab}> = [
	{label: "All", value: "all"},
	{label: "Logos", value: "logos"},
	{label: "Photos", value: "photos"},
	{label: "Templates", value: "templates"},
	{label: "Icons", value: "icons"},
	{label: "Illustrations", value: "illustrations"},
	{label: "Backgrounds", value: "backgrounds"},
	{label: "Misc", value: "misc"},
];

const assetTypeLabel: Record<BrandAsset["type"], string> = {
	background: "Background",
	icon: "Icon",
	illustration: "Illustration",
	logo: "Logo",
	photo: "Photo",
};

const assetTypeColor: Record<BrandAsset["type"], {bg: string; text: string}> = {
	background: {bg: "#E0F2F1", text: "#004D40"},
	icon: {bg: "#EDE7F6", text: "#4527A0"},
	illustration: {bg: "#FFF3E0", text: "#E65100"},
	logo: {bg: "var(--ax-colors-bg-accent-subtle)", text: "var(--ax-colors-fg-accent-strong)"},
	photo: {bg: "#E3F2FD", text: "#0D47A1"},
};

const uploadTargets: Record<
	Exclude<AssetLibraryTab, "all" | "templates">,
	{bucket: NonNullable<BrandAsset["bucket"]>; label: string; type: BrandAsset["type"]}
> = {
	backgrounds: {bucket: "style_references", label: "Upload background", type: "background"},
	icons: {bucket: "style_references", label: "Upload icon", type: "icon"},
	illustrations: {bucket: "style_references", label: "Upload illustration", type: "illustration"},
	logos: {bucket: "logos", label: "Upload logo", type: "logo"},
	misc: {bucket: "misc", label: "Upload misc", type: "photo"},
	photos: {bucket: "style_references", label: "Upload photo", type: "photo"},
};

const classificationOptions: Array<{
	description: string;
	destination: string;
	icon: ReactNode;
	label: string;
	value: AssetClassification;
}> = [
	{
		description: "Approved mark or lockup.",
		destination: "Logos tab and Logos & Devices guide",
		icon: <IconTag size={16} />,
		label: "Logo",
		value: "logo",
	},
	{
		description: "Photography or visual reference.",
		destination: "Photos tab and Photography guidance",
		icon: <IconImage size={16} />,
		label: "Photo",
		value: "photo",
	},
	{
		description: "Illustrated artwork or system sample.",
		destination: "Illustrations tab and Design Systems context",
		icon: <IconSparkles size={16} />,
		label: "Illustration",
		value: "illustration",
	},
	{
		description: "Icon source, pictogram, or UI glyph.",
		destination: "Icons tab and Icon System context",
		icon: <IconFile size={16} />,
		label: "Icon",
		value: "icon",
	},
	{
		description: "Background image or textured surface.",
		destination: "Backgrounds tab",
		icon: <IconImage size={16} />,
		label: "Background",
		value: "background",
	},
	{
		description: "Supporting file or reference-only material.",
		destination: "Misc tab",
		icon: <IconFile size={16} />,
		label: "Misc",
		value: "misc",
	},
];

function ratioPaddingTop(ratio: string): string {
	const map: Record<string, string> = {
		"1:1": "100%",
		"4:3": "75%",
		"4:5": "125%",
		"9:16": "177.78%",
		"16:9": "56.25%",
		Story: "177.78%",
	};
	return map[ratio] ?? "100%";
}

function AssetTypeBadge({type}: {type: BrandAsset["type"]}) {
	const colors = assetTypeColor[type];
	return (
		<Box
			rounded="full"
			style={{
				background: colors.bg,
				color: colors.text,
				display: "inline-block",
				fontSize: 12,
				fontWeight: 700,
				padding: "2px 8px",
			}}
		>
			{assetTypeLabel[type]}
		</Box>
	);
}

function openAsset(asset: BrandAsset) {
	window.open(asset.url, "_blank", "noopener,noreferrer");
}

function downloadAsset(asset: BrandAsset) {
	const link = document.createElement("a");
	link.href = asset.url;
	link.download = asset.name;
	document.body.appendChild(link);
	link.click();
	link.remove();
}

function assetFromFile(
	file: File,
	bucket: NonNullable<BrandAsset["bucket"]>,
	type: BrandAsset["type"]
): BrandAsset {
	const extension = file.name.split(".").pop()?.toUpperCase() || "FILE";

	return {
		bucket,
		format: extension,
		id: `uploaded-asset-${bucket}-${Date.now()}-${file.name}`,
		name: file.name,
		type,
		url: URL.createObjectURL(file),
	};
}

function belongsToTab(asset: BrandAsset, tab: AssetLibraryTab) {
	if (tab === "all") return true;
	if (tab === "logos") return asset.type === "logo" || asset.bucket === "logos";
	if (tab === "photos") return asset.type === "photo" && asset.bucket !== "misc";
	if (tab === "icons") return asset.type === "icon";
	if (tab === "illustrations") return asset.type === "illustration";
	if (tab === "backgrounds") return asset.type === "background";
	if (tab === "misc") {
		return (
			asset.bucket === "misc" ||
			!["logo", "photo", "icon", "illustration", "background"].includes(asset.type)
		);
	}
	return false;
}

function classificationFromAsset(asset: BrandAsset): AssetClassification {
	if (asset.bucket === "misc") return "misc";
	return asset.type as AssetClassification;
}

function classificationToPatch(
	classification: AssetClassification
): Pick<BrandAsset, "bucket" | "type"> {
	if (classification === "logo") return {bucket: "logos", type: "logo"};
	if (classification === "photo") return {bucket: "style_references", type: "photo"};
	if (classification === "illustration") {
		return {bucket: "style_references", type: "illustration"};
	}
	if (classification === "icon") return {bucket: "style_references", type: "icon"};
	if (classification === "background") return {bucket: "style_references", type: "background"};
	return {bucket: "misc", type: "photo"};
}

function AssetCard({
	asset,
	onEditGuidance,
}: {
	asset: BrandAsset;
	onEditGuidance: (asset: BrandAsset) => void;
}) {
	const [hovered, setHovered] = useState(false);
	const contained =
		asset.type === "logo" || asset.type === "icon" || asset.type === "illustration";

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			overflow="hidden"
			rounded="xl"
			shadow={hovered ? "md" : "sm"}
			style={{
				cursor: "pointer",
				transform: hovered ? "translateY(-2px)" : "none",
				transition: "box-shadow 0.18s ease, transform 0.18s ease",
			}}
			onClick={() => onEditGuidance(asset)}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<Box
				alignItems="center"
				bg="bg.secondary"
				display="flex"
				justifyContent="center"
				overflow="hidden"
				style={{height: 132, position: "relative"}}
			>
				<img
					alt={asset.name}
					src={asset.url}
					style={{
						height: contained ? "auto" : "100%",
						maxHeight: contained ? 84 : "100%",
						maxWidth: contained ? "76%" : "100%",
						objectFit: contained ? "contain" : "cover",
						width: contained ? "auto" : "100%",
					}}
				/>
				{hovered && (
					<Box
						alignItems="center"
						display="flex"
						gap="6"
						justifyContent="center"
						style={{
							background: "rgba(0,0,0,0.35)",
							bottom: 0,
							left: 0,
							position: "absolute",
							right: 0,
							top: 0,
						}}
					>
						<Button
							appearance="default"
							aria-label={`View ${asset.name}`}
							icon={<IconArrowUpRightFromSquare />}
							onClick={(event) => {
								event.stopPropagation();
								openAsset(asset);
							}}
							size="sm"
						/>
						<Button
							appearance="subtle"
							aria-label={`Download ${asset.name}`}
							icon={<IconDownload />}
							onClick={(event) => {
								event.stopPropagation();
								downloadAsset(asset);
							}}
							size="sm"
							style={{background: "rgba(255,255,255,0.15)", color: "#fff"}}
						/>
					</Box>
				)}
			</Box>

			<Box display="flex" flexDirection="column" gap="6" p="12">
				<Text
					fontWeight="700"
					style={{
						fontSize: 16,
						lineHeight: 1.25,
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{asset.name}
				</Text>
				<Box alignItems="center" display="flex" gap="6">
					<AssetTypeBadge type={asset.type} />
					<Text color="fg.tertiary" style={{fontSize: 12}}>
						{asset.format}
					</Text>
					{asset.llmGuidance && (
						<Badge intent="success" variant="subtle">
							Guidance
						</Badge>
					)}
				</Box>
			</Box>
		</Box>
	);
}

function AssetInspectorDialog({
	asset,
	classification,
	draft,
	onClassificationChange,
	onDraftChange,
	onOpenChange,
	onSave,
	open,
}: {
	asset: BrandAsset | null;
	classification: AssetClassification;
	draft: string;
	onClassificationChange: (value: AssetClassification) => void;
	onDraftChange: (value: string) => void;
	onOpenChange: (open: boolean) => void;
	onSave: () => void;
	open: boolean;
}) {
	const selectedOption =
		classificationOptions.find((option) => option.value === classification) ??
		classificationOptions[0];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				style={{
					bottom: "auto",
					maxHeight: "calc(100vh - 48px)",
					maxWidth: 720,
					top: "50%",
					translate: "-50% -50%",
					width: "min(92vw, 720px)",
				}}
			>
				<DialogHeader description="Classify this file and tell Opal how it should be used during generation.">
					Asset inspector
				</DialogHeader>
				<DialogBody style={{overflow: "auto"}}>
					{asset && (
						<Box display="flex" flexDirection="column" gap="20">
							<Box
								alignItems="center"
								bg="bg.secondary"
								border="1"
								borderColor="border.tertiary"
								display="flex"
								justifyContent="center"
								overflow="hidden"
								rounded="lg"
								style={{height: 220}}
							>
								<img
									alt={asset.name}
									src={asset.url}
									style={{
										height: asset.type === "logo" ? "auto" : "100%",
										maxHeight: asset.type === "logo" ? 120 : "100%",
										maxWidth: asset.type === "logo" ? "82%" : "100%",
										objectFit: asset.type === "logo" ? "contain" : "cover",
										width: asset.type === "logo" ? "auto" : "100%",
									}}
								/>
							</Box>

							<Box display="flex" flexDirection="column" gap="6">
								<Text fontWeight="700" style={{fontSize: 20, lineHeight: 1.2}}>
									{asset.name}
								</Text>
								<Box
									alignItems="center"
									display="flex"
									gap="6"
									style={{flexWrap: "wrap"}}
								>
									<AssetTypeBadge type={asset.type} />
									<Badge intent="neutral" variant="subtle">
										{asset.format}
									</Badge>
								</Box>
							</Box>

							<Box display="flex" flexDirection="column" gap="10">
								<Box display="flex" flexDirection="column" gap="4">
									<Text fontWeight="700" style={{fontSize: 16}}>
										Classify as
									</Text>
									<Text
										color="fg.secondary"
										style={{fontSize: 14, lineHeight: 1.45}}
									>
										This controls which asset tab and brand guide can use the
										file.
									</Text>
								</Box>
								<Box
									display="grid"
									gap="8"
									style={{gridTemplateColumns: "repeat(3, 1fr)"}}
								>
									{classificationOptions.map((option) => {
										const selected = classification === option.value;
										return (
											<button
												key={option.value}
												type="button"
												aria-pressed={selected}
												onClick={() => onClassificationChange(option.value)}
												style={{
													background: selected
														? "color-mix(in srgb, #abff44 18%, var(--ax-colors-bg-default))"
														: "var(--ax-colors-bg-secondary)",
													border: selected
														? "1.5px solid #8FEA22"
														: "1px solid var(--ax-colors-border-tertiary)",
													borderRadius: 12,
													boxShadow: selected
														? "0 0 0 3px rgb(171 255 68 / 18%)"
														: "none",
													color: "var(--ax-colors-fg-default)",
													cursor: "pointer",
													display: "flex",
													flexDirection: "column",
													gap: 8,
													minHeight: 116,
													padding: 12,
													textAlign: "left",
												}}
											>
												<span
													style={{
														alignItems: "center",
														display: "flex",
														justifyContent: "space-between",
														width: "100%",
													}}
												>
													<span
														style={{
															alignItems: "center",
															background:
																"var(--ax-colors-bg-default)",
															border: "1px solid var(--ax-colors-border-tertiary)",
															borderRadius: 999,
															display: "inline-flex",
															height: 30,
															justifyContent: "center",
															width: 30,
														}}
													>
														{option.icon}
													</span>
													{selected && (
														<IconCheck
															size={16}
															style={{
																color: "var(--ax-colors-fg-success)",
															}}
														/>
													)}
												</span>
												<span style={{fontSize: 14, fontWeight: 800}}>
													{option.label}
												</span>
												<span
													style={{
														color: "var(--ax-colors-fg-secondary)",
														fontSize: 12,
														lineHeight: 1.35,
													}}
												>
													{option.description}
												</span>
											</button>
										);
									})}
								</Box>
								<Box
									bg="bg.secondary"
									border="1"
									borderColor="border.tertiary"
									display="flex"
									flexDirection="column"
									gap="4"
									p="12"
									rounded="lg"
								>
									<Text
										color="fg.success"
										fontWeight="700"
										style={{fontSize: 12}}
									>
										Smart destination
									</Text>
									<Text
										color="fg.secondary"
										style={{fontSize: 14, lineHeight: 1.45}}
									>
										Saving as <strong>{selectedOption.label}</strong> will move
										this asset to <strong>{selectedOption.destination}</strong>.
									</Text>
								</Box>
							</Box>

							<Box display="flex" flexDirection="column" gap="6">
								<Text fontWeight="700" style={{fontSize: 16}}>
									LLM guidance
								</Text>
								<Textarea
									value={draft}
									onChange={(event) => onDraftChange(event.target.value)}
									placeholder="Example: Use as a composition reference only. Do not recreate the logo. Crop photos for motion and leave safe space for copy."
									rows={6}
									style={{fontSize: 14, lineHeight: 1.5, resize: "vertical"}}
								/>
								<Text color="fg.secondary" style={{fontSize: 12, lineHeight: 1.45}}>
									This guidance travels with the asset and helps Opal decide
									whether to place, crop, reference, or avoid regenerating it.
								</Text>
							</Box>

							<Box
								bg="bg.secondary"
								border="1"
								borderColor="border.tertiary"
								display="flex"
								flexDirection="column"
								gap="8"
								p="12"
								rounded="lg"
							>
								<Box
									alignItems="center"
									display="flex"
									justifyContent="space-between"
								>
									<Text fontWeight="700" style={{fontSize: 14}}>
										Auto-detected
									</Text>
									<Badge intent="success" variant="subtle">
										Suggested:{" "}
										{asset.type === "logo"
											? "Logo"
											: asset.type === "photo"
												? "Photo"
												: assetTypeLabel[asset.type]}
									</Badge>
								</Box>
								<Text color="fg.secondary" style={{fontSize: 12, lineHeight: 1.45}}>
									Based on the current filename and upload bucket. You can
									override it any time.
								</Text>
							</Box>
						</Box>
					)}
				</DialogBody>
				<DialogFooter>
					<DialogClose appearance="default" size="md">
						Cancel
					</DialogClose>
					<Button appearance="primary" onClick={onSave} size="md">
						Save asset
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function TemplateAssetCard({
	onDuplicateTemplate,
	onUseTemplate,
	template,
}: {
	onDuplicateTemplate: (template: BrandTemplate) => void;
	onUseTemplate: (template: BrandTemplate) => void;
	template: BrandTemplate;
}) {
	const [hovered, setHovered] = useState(false);

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			overflow="hidden"
			rounded="xl"
			shadow={hovered ? "md" : "sm"}
			style={{
				cursor: "pointer",
				transform: hovered ? "translateY(-2px)" : "none",
				transition: "box-shadow 0.18s ease, transform 0.18s ease",
			}}
			onClick={() => onUseTemplate(template)}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<Box
				overflow="hidden"
				style={{paddingTop: ratioPaddingTop(template.ratio), position: "relative"}}
			>
				<img
					alt={template.name}
					src={template.thumb}
					style={{
						bottom: 0,
						height: "100%",
						left: 0,
						objectFit: "cover",
						position: "absolute",
						right: 0,
						top: 0,
						width: "100%",
					}}
				/>
				{hovered && (
					<Box
						alignItems="center"
						display="flex"
						flexDirection="column"
						gap="8"
						justifyContent="center"
						style={{
							background: "rgba(0,0,0,0.52)",
							bottom: 0,
							left: 0,
							position: "absolute",
							right: 0,
							top: 0,
						}}
					>
						<Button
							appearance="default"
							icon={<IconBolt size={14} />}
							iconPosition="start"
							onClick={(event) => {
								event.stopPropagation();
								onUseTemplate(template);
							}}
							size="sm"
							style={{color: "var(--ax-colors-fg-default)", fontWeight: 700}}
						>
							Use template
						</Button>
						<Button
							appearance="subtle"
							aria-label={`Duplicate ${template.name}`}
							icon={<IconCopy size={14} />}
							onClick={(event) => {
								event.stopPropagation();
								onDuplicateTemplate(template);
							}}
							size="sm"
							style={{
								background: "rgba(255,255,255,0.15)",
								border: "1px solid rgba(255,255,255,0.2)",
								color: "#fff",
							}}
						/>
					</Box>
				)}
			</Box>

			<Box display="flex" flexDirection="column" gap="6" p="12">
				<Text fontWeight="700" style={{fontSize: 16, lineHeight: 1.25}}>
					{template.name}
				</Text>
				<Box alignItems="center" display="flex" gap="6" style={{flexWrap: "wrap"}}>
					<Badge intent="success" variant="subtle">
						Template
					</Badge>
					<Badge intent="neutral" variant="subtle">
						{template.channel}
					</Badge>
					<Text color="fg.tertiary" style={{fontSize: 12}}>
						{template.format} · {template.ratio}
					</Text>
				</Box>
			</Box>
		</Box>
	);
}

export function AssetsTab({pack}: AssetsTabProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const {opalPanelControls} = useLayout();
	const [activeTab, setActiveTab] = useState<AssetLibraryTab>("all");
	const [assets, setAssets] = useState(() => pack.assets);
	const [templates, setTemplates] = useState(() => getBrandTemplates(pack));
	const [activeUploadTarget, setActiveUploadTarget] =
		useState<Exclude<AssetLibraryTab, "all" | "templates">>("logos");
	const [editingAsset, setEditingAsset] = useState<BrandAsset | null>(null);
	const [classificationDraft, setClassificationDraft] = useState<AssetClassification>("photo");
	const [guidanceDraft, setGuidanceDraft] = useState("");

	const counts: Record<AssetLibraryTab, number> = {
		all: assets.length + templates.length,
		backgrounds: assets.filter((asset) => belongsToTab(asset, "backgrounds")).length,
		icons: assets.filter((asset) => belongsToTab(asset, "icons")).length,
		illustrations: assets.filter((asset) => belongsToTab(asset, "illustrations")).length,
		logos: assets.filter((asset) => belongsToTab(asset, "logos")).length,
		misc: assets.filter((asset) => belongsToTab(asset, "misc")).length,
		photos: assets.filter((asset) => belongsToTab(asset, "photos")).length,
		templates: templates.length,
	};

	const filteredAssets = assets.filter((asset) => belongsToTab(asset, activeTab));
	const visibleTemplates = activeTab === "all" || activeTab === "templates" ? templates : [];
	const visibleCount = filteredAssets.length + visibleTemplates.length;
	const canUpload = activeTab !== "all" && activeTab !== "templates";
	const activeUpload = canUpload ? uploadTargets[activeTab] : uploadTargets.logos;

	const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		const target = uploadTargets[activeUploadTarget];

		if (files?.length) {
			setAssets((current) => [
				...Array.from(files).map((file) => assetFromFile(file, target.bucket, target.type)),
				...current,
			]);
		}

		event.target.value = "";
	};

	const startUpload = (tab: Exclude<AssetLibraryTab, "all" | "templates">) => {
		setActiveUploadTarget(tab);
		fileInputRef.current?.click();
	};

	const handleUseTemplate = (template: BrandTemplate) => {
		if (!opalPanelControls) return;

		opalPanelControls.createNewChat();
		opalPanelControls.openPanel();
		opalPanelControls.addMessage({
			content: `Use template: ${template.name}`,
			messageType: "template_card",
			metadata: {template},
			role: "user",
		});

		window.setTimeout(() => {
			opalPanelControls.addMessage({
				content: `I've got **${template.name}** ready — a ${template.format} (${template.ratio}) built for ${template.channel}.\n\n**What do you want to create?** Tell me about your campaign, audience, or message and I'll draft the content to match your brand.`,
				role: "assistant",
			});
		}, 350);
	};

	const handleDuplicateTemplate = (template: BrandTemplate) => {
		setTemplates((current) => [
			{
				...template,
				id: `${template.id}-copy-${Date.now()}`,
				name: `${template.name} Copy`,
			},
			...current,
		]);
	};

	const openGuidanceEditor = (asset: BrandAsset) => {
		setEditingAsset(asset);
		setClassificationDraft(classificationFromAsset(asset));
		setGuidanceDraft(asset.llmGuidance ?? "");
	};

	const closeGuidanceEditor = () => {
		setEditingAsset(null);
		setClassificationDraft("photo");
		setGuidanceDraft("");
	};

	const saveAssetInspector = () => {
		if (!editingAsset) return;
		const nextGuidance = guidanceDraft.trim();
		const classificationPatch = classificationToPatch(classificationDraft);
		setAssets((current) =>
			current.map((asset) =>
				asset.id === editingAsset.id
					? {
							...asset,
							...classificationPatch,
							llmGuidance: nextGuidance || undefined,
						}
					: asset
			)
		);
		closeGuidanceEditor();
	};

	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="24"
			style={{overflowY: "auto", padding: "28px 32px 48px"}}
		>
			<input
				ref={fileInputRef}
				accept="image/svg+xml,image/png,image/jpeg,image/webp"
				aria-label="Upload brand asset files"
				multiple
				onChange={handleUpload}
				style={{display: "none"}}
				type="file"
			/>
			<Box display="flex" flexDirection="column" gap="16">
				<Box
					alignItems="center"
					display="flex"
					justifyContent="space-between"
					style={{flexWrap: "wrap", gap: 12}}
				>
					<Box
						alignItems="center"
						bg="bg.secondary"
						display="inline-flex"
						gap="2"
						p="2"
						rounded="full"
						style={{flexWrap: "wrap"}}
					>
						{LIBRARY_TABS.map((tab) => (
							<button
								key={tab.value}
								aria-pressed={activeTab === tab.value}
								type="button"
								onClick={() => setActiveTab(tab.value)}
								style={{
									background:
										activeTab === tab.value
											? "var(--ax-colors-bg-default)"
											: "transparent",
									border: 0,
									borderRadius: 999,
									color:
										activeTab === tab.value
											? "var(--ax-colors-fg-default)"
											: "var(--ax-colors-fg-secondary)",
									cursor: "pointer",
									fontSize: 14,
									fontWeight: activeTab === tab.value ? 700 : 500,
									padding: "6px 12px",
									transition: "all 0.15s ease",
								}}
							>
								{tab.label}
								<span
									style={{
										color: "var(--ax-colors-fg-tertiary)",
										fontSize: 12,
										fontWeight: 700,
										marginLeft: 6,
									}}
								>
									{counts[tab.value]}
								</span>
							</button>
						))}
					</Box>

					<Box alignItems="center" display="flex" gap="8">
						<Text color="fg.secondary" style={{fontSize: 14}}>
							{visibleCount} item{visibleCount === 1 ? "" : "s"}
						</Text>
						{canUpload ? (
							<Button
								appearance="default"
								icon={<IconPlus />}
								onClick={() => startUpload(activeTab)}
								size="sm"
							>
								{activeUpload.label}
							</Button>
						) : activeTab === "templates" ? null : (
							<Button
								appearance="default"
								disabled={filteredAssets.length === 0}
								icon={<IconDownload />}
								onClick={() =>
									filteredAssets.forEach((asset, index) =>
										window.setTimeout(() => downloadAsset(asset), index * 120)
									)
								}
								size="sm"
							>
								Download files
							</Button>
						)}
					</Box>
				</Box>

				{visibleCount > 0 ? (
					<Box
						display="grid"
						gap="12"
						style={{gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))"}}
					>
						{visibleTemplates.map((template) => (
							<TemplateAssetCard
								key={template.id}
								onDuplicateTemplate={handleDuplicateTemplate}
								onUseTemplate={handleUseTemplate}
								template={template}
							/>
						))}
						{filteredAssets.map((asset) => (
							<AssetCard
								key={asset.id}
								asset={asset}
								onEditGuidance={openGuidanceEditor}
							/>
						))}
					</Box>
				) : (
					<Box
						alignItems="center"
						bg="bg.secondary"
						display="flex"
						flexDirection="column"
						gap="8"
						justifyContent="center"
						py="48"
						rounded="xl"
					>
						<Text fontWeight="700" style={{fontSize: 16}}>
							No {activeTab} yet
						</Text>
						<Text color="fg.secondary" style={{fontSize: 14}}>
							Add files or templates to this brand pack to get started.
						</Text>
					</Box>
				)}
			</Box>
			<AssetInspectorDialog
				asset={editingAsset}
				classification={classificationDraft}
				draft={guidanceDraft}
				onClassificationChange={setClassificationDraft}
				onDraftChange={setGuidanceDraft}
				onOpenChange={(open) => {
					if (!open) closeGuidanceEditor();
				}}
				onSave={saveAssetInspector}
				open={Boolean(editingAsset)}
			/>
		</Box>
	);
}
