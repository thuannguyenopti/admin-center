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
	currentEle,
	elementType,
	properties,
	onBack,
	onStyleChange,
	onSettingChange,
	outlineTitle,
	isSectionMode = false,
	sectionType,
}: Props) {
	// Get available display templates for this element type or section
	const templates = isSectionMode
		? getTemplatesByBaseType("section")
		: getTemplatesByContentType(elementType || "");

	// Get current template key
	const currentTemplate =
		properties?.displayTemplateKey ||
		templates.find((t) => t.isDefault)?.key ||
		"defaultHeading";

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
			{/* Template Details */}
			<Box mt="16" pt="16" borderT="1" borderColor="border.tertiary">
				<Text fontSize="sm" fontWeight="600" mb="8">
					Template Details
				</Text>
				{templates.map((template) => (
					<Box
						key={template.key}
						p="8"
						mb="4"
						rounded="md"
						bg={currentTemplate === template.key ? "bg.accent.subtle" : "transparent"}
						className="cursor-pointer hover:bg-[var(--ax-colors-bg-default-hovered)] transition-colors"
						onClick={() => onStyleChange(template.key)}
						style={{
							marginLeft: -8,
						}}
					>
						<Text fontWeight="600" fontSize="sm" mb="4">
							{template.displayName}
						</Text>
						<Text fontSize="xs" color="fg.secondary">
							{template.description || "No description"}
						</Text>
					</Box>
				))}
			</Box>
		</div>
	);
}
