"use client";

import {
	Box,
	Text,
	Button,
	Menu,
	MenuTrigger,
	MenuContent,
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
			py="4"
			display="flex"
			alignItems="center"
			gap="8"
			justifyContent="space-between"
			style={{minHeight: "56px"}}
			bg="bg.default"
			borderB="1"
			borderColor="border.tertiary"
		>
			{/* Left Section */}
			<Box
				display="flex"
				alignItems="center"
				gap="8"
			>
				<button
					className="border border-[#CACFDC] rounded-md p-2 flex items-center justify-center cursor-pointer bg-transparent"
					style={{width: "40px", height: "40px"}}
					aria-label="Toggle tree view"
				>
					<IconListTree size={16} />
				</button>
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
					className={`rounded-full bg-[#D1F0E1] block text-[#24663E] transition-opacity duration-500 ${
						lastSaved ? "opacity-100" : "opacity-0"
					}`}
				>
					{lastSaved ? "Auto-saved" : "Saved"}
				</Text>
				<IconCloud
					size={16}
					className={`transition-opacity duration-500 ${lastSaved ? "opacity-100" : "opacity-0"}`}
				/>
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
						<button
							className="border border-[#CACFDC] rounded-md px-3 py-2 flex items-center gap-3 cursor-pointer bg-transparent"
							style={{height: "40px"}}
						>
							<Box
								display="flex"
								flexDirection="column"
								gap="2"
								alignItems="start"
							>
								<Text
									fontSize="xs"
									color="fg.secondary"
									style={{lineHeight: "14px"}}
								>
									Language
								</Text>
								<Text 
									fontSize="sm"
									style={{lineHeight: "16px"}}
								>
									{currentLanguage?.label}
								</Text>
							</Box>
							<IconChevronDown 
								size={12} 
								style={{color: "#2E3442"}}
							/>
						</button>
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
						<button
							className="border border-[#CACFDC] rounded-md px-3 py-2 flex items-center gap-3 cursor-pointer bg-transparent"
							style={{height: "40px"}}
						>
							<Box
								display="flex"
								flexDirection="column"
								gap="2"
								alignItems="start"
							>
								<Text
									fontSize="xs"
									color="fg.secondary"
									style={{lineHeight: "14px"}}
								>
									Variation
								</Text>
								<Text 
									fontSize="sm"
									style={{lineHeight: "16px"}}
								>
									{currentVariation?.label}
								</Text>
							</Box>
							<IconChevronDown 
								size={12}
								style={{color: "#2E3442"}}
							/>
						</button>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				{/* Comment Button */}
				<button
					className="border border-[#CACFDC] rounded-md p-2 flex items-center justify-center cursor-pointer bg-transparent"
					style={{width: "40px", height: "40px"}}
					aria-label="Comments"
				>
					<IconMessage size={16} />
				</button>

				{/* Preview Button */}
				<button
					className="border border-[#CACFDC] rounded-md p-2 flex items-center justify-center cursor-pointer bg-transparent"
					style={{width: "40px", height: "40px"}}
					aria-label="Preview on devices"
				>
					<IconDevices size={16} />
				</button>

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
						<button
							className={`border rounded-md px-4 py-2 flex items-center gap-1 cursor-pointer ${
								pageStatus === "Published"
									? "border-[#CACFDC] bg-transparent text-[#2E3442]"
									: "border-transparent bg-[#0037FF] text-white"
							}`}
							style={{height: "40px"}}
						>
							<Text fontSize="sm">
								{pageStatus === "Published" ? "Published" : "Publish"}
							</Text>
							<IconChevronDown size={12} />
						</button>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				{/* More Options Button */}
				<button
					className="border border-[#CACFDC] rounded-md p-2 flex items-center justify-center cursor-pointer bg-transparent"
					style={{width: "40px", height: "40px"}}
					aria-label="More options"
				>
					<IconDots size={16} />
				</button>
			</Box>
		</Box>
	);
}