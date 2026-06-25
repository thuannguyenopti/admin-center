"use client";

import {Button} from "../Button";
import {
	Box,
	Text,
	Heading,
	Field,
	Select,
	SelectTrigger,
	SelectContent,
	Switch,
} from "@optiaxiom/react";
import {
	getTemplatesByContentType,
	getTemplatesByBaseType,
	getTemplateByKey,
} from "./blocks/displayTemplateUtils";
import {IconArrowLeft} from "@optiaxiom/icons";
import {useMemo} from "react";
import usePersistentState from "@/app/usePersistentState";
import {PreviewCard, toIsolatedStoryUrl, deriveVariantStoryUrl, iframeStyleForTileSize} from "@/app/components/PreviewCard";
import {STORY_SIZES} from "./storySizes";
import {initialContentTypes} from "@/app/db/initialData";

type Props = {
	currentEle: string;
	elementType?: string;
	properties?: any;
	onBack: () => void;
	onStyleChange: (templateKey: string) => void;
	onSettingChange?: (settingKey: string, value: string) => void;
	outlineTitle?: string;
	isSectionMode?: boolean;
	sectionType?: string;
};

export default function StyleEditor({
	elementType,
	properties,
	onBack,
	onStyleChange,
	onSettingChange,
	outlineTitle,
	isSectionMode = false,
}: Props) {
	// Get available display templates for this element type or section
	const templates = isSectionMode
		? getTemplatesByBaseType("section")
		: getTemplatesByContentType(elementType || "");

	const [generatedArtifacts] = usePersistentState("opal:artifacts:generated", []) as [any[]];
	const registryStorybookUrl = useMemo(() => {
		if (isSectionMode || !elementType) return null;
		const artifact = Array.isArray(generatedArtifacts)
			? generatedArtifacts.find((a: any) => a?.id === "stride-cms-registry-artifact")
			: null;
		if (!artifact?.previewText) return null;
		try {
			const parsed = JSON.parse(artifact.previewText) as {
				registry?: Record<string, {"cms element type"?: string; "storybook url"?: string}>;
			};
			if (!parsed.registry) return null;
			const normalize = (v: string) => v.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
			const byName = new Map(
				Object.entries(parsed.registry)
					.filter(([, e]) => typeof e?.["storybook url"] === "string")
					.map(([name, e]) => [normalize(name), e["storybook url"] as string])
			);
			const ct = initialContentTypes.find((c) => c.id === elementType);
			const candidates = [
				ct?.displayName,
				ct?.name,
				ct?.displayName?.replace(/\s+Block$/i, ""),
			].filter(Boolean);
			for (const c of candidates) {
				const key = normalize(c!);
				const exact = byName.get(key);
				if (exact) return exact;
				// Prefix match (e.g. "heading" → "headingh1")
				const prefixMatches = [...byName.entries()].filter(([k]) => k.startsWith(key));
				if (prefixMatches.length > 0) {
					prefixMatches.sort(([a], [b]) =>
						a.endsWith("default") ? -1 : b.endsWith("default") ? 1 : a.localeCompare(b),
					);
					return prefixMatches[0][1];
				}
			}
			// Fallback: match by "cms element type" field
			for (const entry of Object.values(parsed.registry)) {
				if (entry["cms element type"] === elementType) return entry["storybook url"] ?? null;
			}
		} catch {}
		return null;
	}, [generatedArtifacts, elementType, isSectionMode]);

	// Get current template key
	const currentTemplate =
		properties?.displayTemplateKey ||
		templates.find((t) => t.isDefault)?.key ||
		"h1Heading";

	// Get current template definition
	const currentTemplateObj = getTemplateByKey(currentTemplate);

	// Get current display settings
	const displaySettings = properties?.displaySettings || [];

	if (templates.length === 0) {
		return (
			<div className="pl-6 pr-6 flex-none w-full pt-4">
				<Button
					className="-translate-x-2"
					appearance="subtle"
					icon={<IconArrowLeft />}
					size="sm"
					onClick={onBack}
				>
					{outlineTitle || "Outline"}
				</Button>
				<Box py="4">
					<Text color="fg.secondary">No styles available for this element type.</Text>
				</Box>
			</div>
		);
	}

	return (
		<div className="pl-6 pr-6 flex-none w-full pt-4">
			<Button
				className="-translate-x-2"
				appearance="subtle"
				icon={<IconArrowLeft />}
				size="sm"
				onClick={onBack}
			>
				{outlineTitle || "Outline"}
			</Button>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				gap="8"
				pr="0"
				py="4"
			>
				<Heading level="4">Style</Heading>
			</Box>
			<Box py="8">
				<Field label="Template">
					<Select
						value={currentTemplate}
						onValueChange={(value) => onStyleChange(value)}
						options={templates.map((t) => ({label: t.displayName, value: t.key}))}
					>
						<SelectTrigger>
							{templates.find((t) => t.key === currentTemplate)?.displayName ||
								currentTemplate}
						</SelectTrigger>
						<SelectContent />
					</Select>
				</Field>
				{templates.find((t) => t.key === currentTemplate)?.description && (
					<Text fontSize="sm" color="fg.secondary" mt="8">
						{templates.find((t) => t.key === currentTemplate)?.description}
					</Text>
				)}
			</Box>
			{/* Template Settings */}
			{currentTemplateObj &&
				Object.keys(currentTemplateObj.settings).length > 0 &&
				onSettingChange && (
					<Box mt="16" pt="16" borderT="1" borderColor="border.tertiary">
						<Text fontSize="sm" fontWeight="600" mb="12">
							Settings
						</Text>
						{Object.entries(currentTemplateObj.settings)
							.sort(([, a], [, b]) => a.sortOrder - b.sortOrder)
							.map(([settingKey, setting]) => {
								const currentValue =
									displaySettings.find((s: any) => s.key === settingKey)?.value ||
									currentTemplateObj.defaultSettings[settingKey] ||
									"";

								const sortedChoices = setting.choices
									? Object.entries(setting.choices)
											.sort(([, a], [, b]) => a.sortOrder - b.sortOrder)
											.map(([choiceKey, choice]) => ({
												label: choice.displayName,
												value: choiceKey,
											}))
									: [];

								return (
									<Box key={settingKey} py="8">
										{setting.editor === "select" && setting.choices && (
											<Field label={setting.displayName}>
												<Select
													value={currentValue}
													onValueChange={(value) =>
														onSettingChange?.(settingKey, value)
													}
													options={sortedChoices}
												>
													<SelectTrigger>
														{sortedChoices.find(
															(c) => c.value === currentValue
														)?.label || currentValue}
													</SelectTrigger>
													<SelectContent />
												</Select>
											</Field>
										)}

										{setting.editor === "checkbox" && (
											<Box display="flex" alignItems="center" gap="8">
												<Switch
													checked={currentValue === "true"}
													onCheckedChange={(checked) =>
														onSettingChange?.(
															settingKey,
															checked ? "true" : "false"
														)
													}
												/>
												<Text fontSize="sm">{setting.displayName}</Text>
											</Box>
										)}
									</Box>
								);
							})}
					</Box>
				)}
			{/* Template picker */}
			<Box
				mt="16"
				pt="16"
				borderT="1"
				borderColor="border.tertiary"
				style={{display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8}}
			>
				{templates.map((template) => (
					<PreviewCard
						key={template.key}
						label={template.displayName}
						storybookUrl={
							registryStorybookUrl
								? toIsolatedStoryUrl(
										template.templateValue
											? deriveVariantStoryUrl(registryStorybookUrl, template.templateValue)
											: registryStorybookUrl
									)
								: null
						}
						isSelected={currentTemplate === template.key}
						onClick={() => onStyleChange(template.key)}
						previewHeight={100}
						iframeStyle={iframeStyleForTileSize(130, 100, STORY_SIZES[elementType ?? ""])}
					/>
				))}
			</Box>
		</div>
	);
}
