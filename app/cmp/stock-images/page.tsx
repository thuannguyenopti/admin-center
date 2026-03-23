"use client";

import { useMemo, useState } from "react";
import { Box, Badge, Heading, SearchInput } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import {
	IconChevronLeft,
	IconChevronRight,
	IconDownload,
} from "@tabler/icons-react";

interface StockImage {
	id: number;
	title: string;
	photographer: string;
	category: string;
}

const categories = [
	"Nature",
	"Business",
	"Technology",
	"People",
	"Food",
	"Architecture",
	"Travel",
	"Abstract",
];

const stockImages: StockImage[] = [
	{ id: 1, title: "Mountain Landscape", photographer: "John Smith", category: "Nature" },
	{ id: 2, title: "Office Team Meeting", photographer: "Sarah Johnson", category: "Business" },
	{ id: 3, title: "Tech Workspace", photographer: "Alex Chen", category: "Technology" },
	{ id: 4, title: "Portrait Study", photographer: "Emma Williams", category: "People" },
	{ id: 5, title: "Food Photography", photographer: "Marcus Brown", category: "Food" },
	{ id: 6, title: "Modern Building", photographer: "Lisa Anderson", category: "Architecture" },
	{ id: 7, title: "Beach Sunset", photographer: "James Taylor", category: "Travel" },
	{ id: 8, title: "Abstract Colors", photographer: "Nina Patel", category: "Abstract" },
	{ id: 9, title: "Forest Path", photographer: "Daniel Lee", category: "Nature" },
	{ id: 10, title: "City Skyline", photographer: "Rachel White", category: "Travel" },
	{ id: 11, title: "Modern Office", photographer: "Tom Harris", category: "Business" },
	{ id: 12, title: "Geometric Patterns", photographer: "Sophie Martin", category: "Abstract" },
];

function ImageCard({ image }: { image: StockImage }) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			overflow="hidden"
			rounded="lg"
		>
			<Box bg="bg.secondary" style={{ aspectRatio: "4 / 3", overflow: "hidden" }}>
				<img
					alt={image.title}
					src={`https://picsum.photos/400/300?random=${image.id}`}
					style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }}
				/>
			</Box>
			<Box display="flex" flexDirection="column" gap="12" p="16">
				<Box alignItems="start" display="flex" justifyContent="space-between" style={{ gap: 12 }}>
					<Box display="flex" flexDirection="column" gap="4" style={{ minWidth: 0 }}>
						<Text fontSize="md" fontWeight="500" color="fg.default">
							{image.title}
						</Text>
						<Text color="fg.secondary" fontSize="sm">
							by {image.photographer}
						</Text>
					</Box>
					<Badge intent="neutral">{image.category}</Badge>
				</Box>
				<Box>
					<Button appearance="default" icon={<IconDownload size={16} />} size="sm">
						Download
					</Button>
				</Box>
			</Box>
		</Box>
	);
}

export default function StockImagesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);

	const imagesPerPage = 12;

	const filteredImages = useMemo(
		() =>
			stockImages.filter((image) => {
				const matchesSearch =
					image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					image.photographer.toLowerCase().includes(searchQuery.toLowerCase());
				const matchesCategory = !selectedCategory || image.category === selectedCategory;
				return matchesSearch && matchesCategory;
			}),
		[searchQuery, selectedCategory]
	);

	const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
	const startIndex = (currentPage - 1) * imagesPerPage;
	const paginatedImages = filteredImages.slice(startIndex, startIndex + imagesPerPage);

	const handleCategoryChange = (category: string) => {
		setSelectedCategory((prev) => (prev === category ? null : category));
		setCurrentPage(1);
	};

	return (
		<Box bg="bg.page" style={{ minHeight: "calc(100vh - 48px)" }}>
			<Box
				bg="bg.default"
				borderB="1"
				borderColor="border.tertiary"
				display="flex"
				flexDirection="column"
				gap="8"
				px="24"
				py="24"
			>
				<Heading level="2">Stock Images</Heading>
				<Text color="fg.secondary" fontSize="md">
					Browse reusable stock imagery inside the CMP environment.
				</Text>
			</Box>

			<Box
				display="flex"
				flexDirection="column"
				gap="20"
				mx="auto"
				px="24"
				py="24"
				style={{ maxWidth: 1200 }}
			>
				<SearchInput
					placeholder="Search by title or photographer"
					size="lg"
					value={searchQuery}
					onChange={(e) => {
						setSearchQuery(e.target.value);
						setCurrentPage(1);
					}}
				/>

				<Box display="flex" flexWrap="wrap" gap="8">
					{categories.map((category) => (
						<Button
							key={category}
							appearance={selectedCategory === category ? "primary" : "default"}
							size="sm"
							onClick={() => handleCategoryChange(category)}
						>
							{category}
						</Button>
					))}
				</Box>

				<Text color="fg.secondary" fontSize="sm">
					Showing {paginatedImages.length > 0 ? startIndex + 1 : 0} to{" "}
					{Math.min(startIndex + imagesPerPage, filteredImages.length)} of{" "}
					{filteredImages.length} images
				</Text>

				{paginatedImages.length > 0 ? (
					<Box
						display="grid"
						gap="16"
						style={{
							gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
						}}
					>
						{paginatedImages.map((image) => (
							<ImageCard key={image.id} image={image} />
						))}
					</Box>
				) : (
					<Box
						alignItems="center"
						bg="bg.default"
						border="1"
						borderColor="border.tertiary"
						display="flex"
						justifyContent="center"
						p="40"
						rounded="lg"
					>
						<Text color="fg.secondary" fontSize="md">
							No images found matching your search criteria.
						</Text>
					</Box>
				)}

				{totalPages > 1 ? (
					<Box alignItems="center" display="flex" flexWrap="wrap" gap="12" justifyContent="center">
						<Button
							appearance="default"
							disabled={currentPage === 1}
							icon={<IconChevronLeft size={16} />}
							onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
							size="sm"
						>
							Previous
						</Button>

						<Box alignItems="center" display="flex" gap="8">
							{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
								<Button
									key={page}
									appearance={currentPage === page ? "primary" : "default"}
									onClick={() => setCurrentPage(page)}
									size="sm"
								>
									{page}
								</Button>
							))}
						</Box>

						<Button
							appearance="default"
							disabled={currentPage === totalPages}
							icon={<IconChevronRight size={16} />}
							iconPosition="end"
							onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
							size="sm"
						>
							Next
						</Button>
					</Box>
				) : null}
			</Box>
		</Box>
	);
}
