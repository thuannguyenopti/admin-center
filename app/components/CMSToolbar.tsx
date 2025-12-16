"use client";

import React from "react";
import { Box, Text, Button, Menu, MenuTrigger, MenuContent, LabelMenuButton } from "@optiaxiom/react";
import {
	IconListTree,
	IconFile,
	IconCloud,
	IconMessage,
	IconDevices,
	IconChevronDown,
	IconDots,
} from "@tabler/icons-react";
import { PreviewSettings } from "./vb/PreviewSettings";


interface CMSToolbarProps {
	pageName?: string;
	lastSaved?: Date | null;
	pageStatus?: string;
	onPublish?: () => void;

	languageOptions?: Array<{ label: string; value: string }>;
	variationOptions?: Array<{ label: string; value: string }>;
	selectedLanguage?: string;
	selectedVariation?: string;
	onLanguageChange?: (value: string) => void;
	onVariationChange?: (value: string) => void;

	// ✅ controlled preview state
	preview?: PreviewSettings;
	onPreviewChange?: (patch: Partial<PreviewSettings>) => void;

	contentTypeIcon?: React.ReactNode;
}

export default function CMSToolbar({
	pageName = "New Page",
	lastSaved = null,
	pageStatus = "Draft",
	onPublish = () => { },

	languageOptions = [
		{ label: "English (Main)", value: "en" },
		{ label: "Spanish", value: "es" },
		{ label: "French", value: "fr" },
	],
	variationOptions = [
		{ label: "Original", value: "original" },
		{ label: "Variation A", value: "a" },
		{ label: "Variation B", value: "b" },
	],
	selectedLanguage = "en",
	selectedVariation = "original",
	onLanguageChange = () => { },
	onVariationChange = () => { },

	preview = { mode: "responsive", width: 1100, maxWidth: 1100 },
	onPreviewChange = () => { },

	contentTypeIcon,
}: CMSToolbarProps) {
	const currentLanguage = languageOptions.find((opt) => opt.value === selectedLanguage);
	const currentVariation = variationOptions.find((opt) => opt.value === selectedVariation);

	const previewLabel =
		preview.mode === "responsive"
			? "Responsive"
			: preview.mode === "scale"
				? `Scale (${preview.width}px)`
				: `${preview.width}px`;

	const previewOptions = [
		{
			label: "Responsive (reflow)",
			execute: () => onPreviewChange({ mode: "responsive", maxWidth: 1100 }),
		},
		{ label: "Desktop 1440", execute: () => onPreviewChange({ mode: "fixed", width: 1440 }) },
		{ label: "Desktop 1100", execute: () => onPreviewChange({ mode: "fixed", width: 1100 }) },
		{ label: "Tablet 768", execute: () => onPreviewChange({ mode: "fixed", width: 768 }) },
		{ label: "Mobile 390", execute: () => onPreviewChange({ mode: "fixed", width: 390 }) },
		{ label: "Scale to fit (1100)", execute: () => onPreviewChange({ mode: "scale", width: 1100 }) },
	];

	return (
		<Box
			w="full"
			gridColumn="2"
			px="24"
			py="12"
			display="flex"
			alignItems="center"
			gap="8"
			justifyContent="space-between"
			style={{ minHeight: "64px" }}
			bg="bg.default"
			borderB="1"
			borderColor="border.tertiary"
		>
			{/* Left Section */}
			<Box display="flex" alignItems="center" gap="16">
				<Button appearance="default" icon={<IconListTree size={16} />} aria-label="Toggle tree view" h="40" w="40" />
				<Box display="flex" alignItems="center" color="fg.default">
					{contentTypeIcon || <IconFile size={16} />}
				</Box>
				<Text fontSize="md" fontWeight="600" color="fg.default">
					{pageName}
				</Text>

				<Text
					fontSize="sm"
					fontWeight="500"
					px="8"
					py="2"
					rounded="full"
					bg="bg.success.subtle"
					color="fg.success.strong"
					className={`transition-opacity duration-500 ${lastSaved ? "opacity-100" : "opacity-0"}`}
				>
					{lastSaved ? "Auto-saved" : "Saved"}
				</Text>

				<Box color="fg.default" className={`transition-opacity duration-500 ${lastSaved ? "opacity-100" : "opacity-0"}`}>
					<IconCloud size={16} />
				</Box>
			</Box>

			{/* Right Section */}
			<Box display="flex" alignItems="center" gap="8">
				{/* Language Filter */}
				<Menu options={languageOptions.map((opt) => ({ label: opt.label, execute: () => onLanguageChange(opt.value) }))}>
					<MenuTrigger asChild>
						<LabelMenuButton label="Language" h="40">
							{currentLanguage?.label}
						</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				{/* Variation Filter */}
				<Menu options={variationOptions.map((opt) => ({ label: opt.label, execute: () => onVariationChange(opt.value) }))}>
					<MenuTrigger asChild>
						<LabelMenuButton label="Variation" h="40">
							{currentVariation?.label}
						</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				<Button appearance="default" icon={<IconMessage size={16} />} aria-label="Comments" h="40" w="40" />

				{/* ✅ Preview Button -> Menu */}
				<Menu options={previewOptions}>
					<MenuTrigger asChild>
						<LabelMenuButton label="Preview" h="40">
							{previewLabel}
						</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				{/* Publish Button with Menu */}
				<Menu
					options={[
						{ label: "Publish now", execute: onPublish },
						{ label: "Schedule publish", execute: () => { } },
						{ label: "Publish settings", execute: () => { } },
					]}
				>
					<MenuTrigger asChild>
						<Button
							appearance={pageStatus === "Published" ? "default" : "primary"}
							icon={<IconChevronDown size={12} />}
							iconPosition="end"
							h="40"
						>
							{pageStatus === "Published" ? "Published" : "Publish"}
						</Button>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				<Button appearance="default" icon={<IconDots size={16} />} aria-label="More options" h="40" w="40" />
			</Box>
		</Box>
	);
}
