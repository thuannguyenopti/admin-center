"use client";

import { Box, Menu, MenuTrigger, MenuContent, LabelMenuButton } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { useState } from "react";
import ImageCard from "./ImageCard";
import { mockImages } from "./mockImageData";
import SearchIcon from "@/app/assets/search-icon.svg";
import FilterIcon from "@/app/assets/filter-icon.svg";
import ViewIcon from "@/app/assets/view-icon.svg";
import { Flex } from "@/app/components/Flex";

export default function ImageSelectorPanel() {
	const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
	const [sourceFilter, setSourceFilter] = useState<string>("CMS");

	return (
		<Flex flexDirection="column" justifyContent="stretch" maxH="full" gap="8">
			{/* Controls Row */}
			<Box display="flex" justifyContent="space-between" gap="8">
				{/* Source Dropdown */}
				<Menu
					options={[
						{ label: "CMS", execute: () => setSourceFilter("CMS") },
						{ label: "Library", execute: () => setSourceFilter("Library") },
						{ label: "Uploads", execute: () => setSourceFilter("Uploads") },
					]}
				>
					<MenuTrigger asChild>
						<LabelMenuButton label="Source" h="40">
							{sourceFilter}
						</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				{/* Action Buttons */}
				<Box display="flex" gap="4">
					<Button appearance="default" aria-label="Search" icon={<SearchIcon />} />
					<Button appearance="default" aria-label="Filter" icon={<FilterIcon />} />
					<Button appearance="default" aria-label="View options" icon={<ViewIcon />} />
				</Box>
			</Box>
			{/* Image Grid */}
			<Box overflow="auto" flex="1" rounded="lg">
				<Box display="flex" flexWrap="wrap" gap="8">
					{mockImages.map((image) => (
						<ImageCard
							key={image.id}
							image={image}
							isSelected={selectedImageId === image.id}
							onSelect={setSelectedImageId}
						/>
					))}
				</Box>
			</Box>
		</Flex>
	);
}
