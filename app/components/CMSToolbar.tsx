"use client";

import {
	Box,
	Text,
	Button,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
} from "@optiaxiom/react";
import {
	IconListTree,
	IconFile,
	IconCloud,
	IconMessage,
	IconDevices,
	IconChevronDown,
	IconDots,
} from "@tabler/icons-react";

interface CMSToolbarProps {
	pageName?: string;
	lastSaved?: Date | null;
	pageStatus?: string;
	onPublish?: () => void;
	languageOptions?: Array<{label: string; value: string}>;
	variationOptions?: Array<{label: string; value: string}>;
	selectedLanguage?: string;
	selectedVariation?: string;
	onLanguageChange?: (value: string) => void;
	onVariationChange?: (value: string) => void;
	contentTypeIcon?: React.ReactNode;
}

export default function CMSToolbar({
	pageName = "New Page",
	lastSaved = null,
	pageStatus = "Draft",
	onPublish = () => {},
	languageOptions = [
		{label: "English (Main)", value: "en"},
		{label: "Spanish", value: "es"},
		{label: "French", value: "fr"},
	],
	variationOptions = [
		{label: "Original", value: "original"},
		{label: "Variation A", value: "a"},
		{label: "Variation B", value: "b"},
	],
	selectedLanguage = "en",
	selectedVariation = "original",
	onLanguageChange = () => {},
	onVariationChange = () => {},
	contentTypeIcon,
}: CMSToolbarProps) {
	const currentLanguage = languageOptions.find((opt) => opt.value === selectedLanguage);
	const currentVariation = variationOptions.find((opt) => opt.value === selectedVariation);

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
			style={{minHeight: "64px"}}
			bg="bg.default"
			borderB="1"
			borderColor="border.tertiary"
		>
			{/* Left Section */}
			<Box
				display="flex"
				alignItems="center"
				gap="16"
			>
				<Button
					appearance="default"
					icon={<IconListTree size={16} />}
					aria-label="Toggle tree view"
					h="40"
					w="40"
				/>
				<Box
					display="flex"
					alignItems="center"
					color="fg.default"
				>
					{contentTypeIcon || <IconFile size={16} />}
				</Box>
				<Text
					fontSize="md"
					fontWeight="600"
					color="fg.default"
				>
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
					className={`transition-opacity duration-500 ${
						lastSaved ? "opacity-100" : "opacity-0"
					}`}
				>
					{lastSaved ? "Auto-saved" : "Saved"}
				</Text>
				<Box
					color="fg.default"
					className={`transition-opacity duration-500 ${lastSaved ? "opacity-100" : "opacity-0"}`}
				>
					<IconCloud size={16} />
				</Box>
			</Box>

			{/* Right Section */}
			<Box
				display="flex"
				alignItems="center"
				gap="8"
			>
				{/* Language Filter */}
				<Menu
					options={languageOptions.map(opt => ({
						label: opt.label,
						execute: () => onLanguageChange(opt.value),
					}))}
				>
					<MenuTrigger asChild>
						<LabelMenuButton label="Language" h="40">
							{currentLanguage?.label}
						</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				{/* Variation Filter */}
				<Menu
					options={variationOptions.map(opt => ({
						label: opt.label,
						execute: () => onVariationChange(opt.value),
					}))}
				>
					<MenuTrigger asChild>
						<LabelMenuButton label="Variation" h="40">
							{currentVariation?.label}
						</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				{/* Comment Button */}
				<Button
					appearance="default"
					icon={<IconMessage size={16} />}
					aria-label="Comments"
					h="40"
					w="40"
				/>

				{/* Preview Button */}
				<Button
					appearance="default"
					icon={<IconDevices size={16} />}
					aria-label="Preview on devices"
					h="40"
					w="40"
				/>

				{/* Publish Button with Menu */}
				<Menu
					options={[
						{
							label: "Publish now",
							execute: onPublish,
						},
						{
							label: "Schedule publish",
							execute: () => {},
						},
						{
							label: "Publish settings",
							execute: () => {},
						},
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

				{/* More Options Button */}
				<Button
					appearance="default"
					icon={<IconDots size={16} />}
					aria-label="More options"
					h="40"
					w="40"
				/>
			</Box>
		</Box>
	);
}