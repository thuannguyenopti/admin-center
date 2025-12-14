"use client";

import { SearchInput, Checkbox, Pagination } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import { IconFilter, IconFile, IconBox, IconLayoutGrid, IconPhoto } from "@tabler/icons-react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import Item from "@/app/components/Item";
import { Flex } from "@/app/components/Flex";
import { useState } from "react";

type ContentItem = {
	id: string;
	name: string;
	type: "Page" | "Product" | "Block" | "Image";
	status: "Draft" | "Published";
	modifiedBy: string;
	language: string;
	lastModified: string;
};

const contentItems: ContentItem[] = [
	{ id: "1", name: "Features", type: "Page", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Jan 11, 2025" },
	{ id: "2", name: "Training Plans", type: "Page", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Jan 11, 2025" },
	{ id: "3", name: "Heart Rate Monitor", type: "Product", status: "Published", modifiedBy: "Tien Le", language: "en", lastModified: "Jan 11, 2025" },
	{ id: "4", name: "Getting Started", type: "Page", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Jan 11, 2025" },
	{ id: "5", name: "Pricing", type: "Block", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Jan 11, 2025" },
	{ id: "6", name: "Stride Premium", type: "Page", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Jan 11, 2025" },
	{ id: "7", name: "Community Stories", type: "Page", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Jan 11, 2025" },
	{ id: "8", name: "My Dashboard", type: "Page", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Jan 11, 2025" },
	{ id: "9", name: "Cycling Hero", type: "Image", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Jan 11, 2025" },
	{ id: "10", name: "Help Center", type: "Page", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Jan 11, 2025" },
	{ id: "11", name: "Beginner's Guide to Cycling", type: "Page", status: "Published", modifiedBy: "Sarah Chen", language: "en", lastModified: "Jan 10, 2025" },
	{ id: "12", name: "Advanced Training Techniques", type: "Page", status: "Published", modifiedBy: "Marcus Johnson", language: "en", lastModified: "Jan 9, 2025" },
	{ id: "13", name: "Route Planning 101", type: "Page", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Jan 8, 2025" },
	{ id: "14", name: "Performance Metrics Explained", type: "Page", status: "Published", modifiedBy: "Alex Rivera", language: "en", lastModified: "Jan 7, 2025" },
	{ id: "15", name: "Nutrition for Cyclists", type: "Page", status: "Draft", modifiedBy: "Emily Brown", language: "en", lastModified: "Jan 6, 2025" },
	{ id: "16", name: "Bike Maintenance Tips", type: "Page", status: "Published", modifiedBy: "James Wilson", language: "en", lastModified: "Jan 5, 2025" },
	{ id: "17", name: "Indoor Training Guide", type: "Page", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Jan 4, 2025" },
	{ id: "18", name: "Weather & Safety", type: "Page", status: "Published", modifiedBy: "Lisa Anderson", language: "en", lastModified: "Jan 3, 2025" },
	{ id: "19", name: "Race Preparation", type: "Page", status: "Draft", modifiedBy: "David Kim", language: "en", lastModified: "Jan 2, 2025" },
	{ id: "20", name: "Recovery Strategies", type: "Page", status: "Published", modifiedBy: "Michelle Taylor", language: "en", lastModified: "Jan 1, 2025" },
	{ id: "21", name: "Climbing Techniques", type: "Page", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Dec 31, 2024" },
	{ id: "22", name: "Sprint Training", type: "Page", status: "Draft", modifiedBy: "Robert Garcia", language: "en", lastModified: "Dec 30, 2024" },
	{ id: "23", name: "Cadence Optimization", type: "Page", status: "Published", modifiedBy: "Jessica Moore", language: "en", lastModified: "Dec 29, 2024" },
	{ id: "24", name: "Gear Ratios Guide", type: "Page", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Dec 28, 2024" },
	{ id: "25", name: "Community Rides", type: "Page", status: "Published", modifiedBy: "Chris Lee", language: "en", lastModified: "Dec 27, 2024" },
	{ id: "26", name: "Leaderboards", type: "Page", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Dec 26, 2024" },
	{ id: "27", name: "Achievement Badges", type: "Page", status: "Published", modifiedBy: "Patricia White", language: "en", lastModified: "Dec 25, 2024" },
	{ id: "28", name: "Social Features", type: "Page", status: "Draft", modifiedBy: "Kevin Davis", language: "en", lastModified: "Dec 24, 2024" },
	{ id: "29", name: "Premium Benefits", type: "Page", status: "Published", modifiedBy: "Jennifer Martin", language: "en", lastModified: "Dec 23, 2024" },
	{ id: "30", name: "Subscription FAQ", type: "Page", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Dec 22, 2024" },
	{ id: "31", name: "Cycle Computer Pro", type: "Product", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Dec 21, 2024" },
	{ id: "32", name: "HR Monitor Band", type: "Product", status: "Published", modifiedBy: "Thomas Brown", language: "en", lastModified: "Dec 20, 2024" },
	{ id: "33", name: "Smart Bike Trainer", type: "Product", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Dec 19, 2024" },
	{ id: "34", name: "Cadence Sensor", type: "Product", status: "Published", modifiedBy: "Amanda Price", language: "en", lastModified: "Dec 18, 2024" },
	{ id: "35", name: "Power Meter", type: "Product", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Dec 17, 2024" },
	{ id: "36", name: "Speed Sensor", type: "Product", status: "Published", modifiedBy: "Steven Clark", language: "en", lastModified: "Dec 16, 2024" },
	{ id: "37", name: "Aero Helmet", type: "Product", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Dec 15, 2024" },
	{ id: "38", name: "Bike Lights", type: "Product", status: "Published", modifiedBy: "Nancy Rodriguez", language: "en", lastModified: "Dec 14, 2024" },
	{ id: "39", name: "Water Bottle Holder", type: "Product", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Dec 13, 2024" },
	{ id: "40", name: "Repair Tool Kit", type: "Product", status: "Published", modifiedBy: "Daniel Lewis", language: "en", lastModified: "Dec 12, 2024" },
	{ id: "41", name: "Weekly Challenge Block", type: "Block", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Dec 11, 2024" },
	{ id: "42", name: "Achievement Block", type: "Block", status: "Published", modifiedBy: "Tien Le", language: "en", lastModified: "Dec 10, 2024" },
	{ id: "43", name: "Social Feed Block", type: "Block", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Dec 9, 2024" },
	{ id: "44", name: "Leaderboard Widget", type: "Block", status: "Published", modifiedBy: "Tien Le", language: "en", lastModified: "Dec 8, 2024" },
	{ id: "45", name: "Stats Summary", type: "Block", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Dec 7, 2024" },
	{ id: "46", name: "Upcoming Events Block", type: "Block", status: "Published", modifiedBy: "Tien Le", language: "en", lastModified: "Dec 6, 2024" },
	{ id: "47", name: "Testimonial Carousel", type: "Block", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Dec 5, 2024" },
	{ id: "48", name: "Payment Plans", type: "Block", status: "Published", modifiedBy: "Tien Le", language: "en", lastModified: "Dec 4, 2024" },
	{ id: "49", name: "Mountain Pass Scenery", type: "Image", status: "Published", modifiedBy: "Tien Le", language: "en", lastModified: "Dec 3, 2024" },
	{ id: "50", name: "Pro Cyclist In Action", type: "Image", status: "Draft", modifiedBy: "Tien Le", language: "en", lastModified: "Dec 2, 2024" },
];

function getIconForType(type: ContentItem["type"]) {
	switch (type) {
		case "Page":
			return <IconFile size={16} />;
		case "Product":
			return <IconBox size={16} />;
		case "Block":
			return <IconLayoutGrid size={16} />;
		case "Image":
			return <IconPhoto size={16} />;
	}
}

function getStatusIntent(status: ContentItem["status"]) {
	return status === "Published" ? "success" : "neutral";
}

export default function ContentPage() {
	const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;
	const totalPages = Math.ceil(contentItems.length / itemsPerPage);
	const paginatedItems = contentItems.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedRows(new Set(paginatedItems.map((item) => item.id)));
		} else {
			setSelectedRows(new Set());
		}
	};

	const handleSelectRow = (id: string, checked: boolean) => {
		const newSet = new Set(selectedRows);
		if (checked) {
			newSet.add(id);
		} else {
			newSet.delete(id);
		}
		setSelectedRows(newSet);
	};

	const isAllSelected =
		selectedRows.size === paginatedItems.length && paginatedItems.length > 0;
	const isSomeSelected = selectedRows.size > 0 && !isAllSelected;

	return (
		<>
			<Text mb="24" color="fg.secondary">
				Edit and manage your content using the visual builder.
			</Text>
			<Flex mb="24" gap="8">
				<SearchInput size="lg" placeholder="Search content..." />
				<Button aria-label="Filter content" icon={<IconFilter />} />
			</Flex>
			<Table>
				<thead>
					<Tr>
						<Th style={{ width: "40px" }}>
							<Checkbox
								checked={isAllSelected}
								indeterminate={isSomeSelected}
								onCheckedChange={handleSelectAll}
							/>
						</Th>
						<Th>Name</Th>
						<Th>Type</Th>
						<Th>Status</Th>
						<Th>Modified by</Th>
						<Th>Language</Th>
						<Th>Last Modified</Th>
						<Th style={{ width: "56px" }} />
					</Tr>
				</thead>
				<tbody>
					{paginatedItems.map((item) => (
						<Tr key={item.id}>
							<Td type="raw" style={{ width: "40px" }}>
								<Checkbox
									checked={selectedRows.has(item.id)}
									onCheckedChange={(checked) =>
										handleSelectRow(item.id, !!checked)
									}
								/>
							</Td>
							<Td type="header">
								<Item icon={getIconForType(item.type)} title={item.name} />
							</Td>
							<Td>{item.type}</Td>
							<Td type="badge" data={getStatusIntent(item.status)}>
								{item.status}
							</Td>
							<Td>{item.modifiedBy}</Td>
							<Td>{item.language}</Td>
							<Td>{item.lastModified}</Td>
							<Td type="button" />
						</Tr>
					))}
				</tbody>
			</Table>
			<Pagination
				total={totalPages}
				page={currentPage}
				onPageChange={setCurrentPage}
				mt="24"
			/>
		</>
	);
}