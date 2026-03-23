"use client";

import { useState, useMemo } from "react";
import {
	Box,
	Heading,
	SearchInput,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
	Badge,
} from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { contentModelTemplates, ContentModelTemplate } from "@/app/db/contentModelTemplates";
import { useRouter } from "next/navigation";
import { IconPlus } from "@tabler/icons-react";

type TemplateCardProps = {
	icon: React.ReactNode;
	name: string;
	description: string;
	category?: string;
	onSelect: () => void;
	variant?: "create" | "default";
};

function TemplateCard({ icon, name, description, category, onSelect, variant = "default" }: TemplateCardProps) {
	return (
		<Box
			p="16"
			rounded="md"
			border="1"
			borderColor="border.tertiary"
			bg="bg.default"
			display="flex"
			flexDirection="column"
			gap="12"
			style={{ cursor: "pointer" }}
			onClick={onSelect}
		>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="center"
				w="48"
				h="48"
				rounded="md"
				bg="bg.accent.subtle"
				color="fg.accent"
			>
				{icon}
			</Box>

			<Box>
				<Box display="flex" alignItems="center" justifyContent="space-between" mb="4">
					<Text fontSize="md" fontWeight="500">
						{name}
					</Text>
					{category && <Badge intent="neutral">{category}</Badge>}
				</Box>
				<Text fontSize="sm" color="fg.secondary">
					{description}
				</Text>
			</Box>

			<Button appearance={variant === "create" ? "primary" : "default"} w="full">
				{variant === "create" ? "Create New" : "Use Template"}
			</Button>
		</Box>
	);
}

function EmptyState({ message }: { message: string }) {
	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			gap="16"
			py="40"
		>
			<Text fontSize="md" color="fg.secondary">
				{message}
			</Text>
		</Box>
	);
}

export default function ContentModelTemplatesPage() {
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

	const categories = useMemo(() => {
		const uniqueCategories = Array.from(new Set(contentModelTemplates.map((tpl) => tpl.category)));
		return [
			{ label: "All Categories", value: null },
			...uniqueCategories.map((cat) => ({ label: cat, value: cat })),
		];
	}, []);

	const filteredTemplates = useMemo(() => {
		return contentModelTemplates.filter((tpl) => {
			const searchLower = search.toLowerCase();
			const matchesSearch =
				!search ||
				tpl.name.toLowerCase().includes(searchLower) ||
				tpl.description.toLowerCase().includes(searchLower);

			const matchesCategory = !categoryFilter || tpl.category === categoryFilter;

			return matchesSearch && matchesCategory;
		});
	}, [search, categoryFilter]);

	const handleSelectTemplate = (template: ContentModelTemplate | null) => {
		if (template) {
			router.push(`/cmp/settings/content-models?template=${template.id}`);
		} else {
			router.push(`/cmp/settings/content-models?new=true`);
		}
	};

	const currentCategoryLabel = categories.find((cat) => cat.value === categoryFilter)?.label || "All Categories";

	return (
		<Box p="24">
			<Box mb="24">
				<Heading level="2" mb="8" fontSize="xl" fontWeight="500">
					Choose a Content Model Template
				</Heading>
				<Text color="fg.secondary" mb="16" fontSize="md">
					Start with a pre-configured template or create from scratch
				</Text>

				<Box display="flex" gap="8" alignItems="center">
					<SearchInput
						size="lg"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search templates..."
					/>

					<Menu
						options={categories.map((cat) => ({
							label: cat.label,
							execute: () => setCategoryFilter(cat.value),
							...(categoryFilter === cat.value && { selected: true }),
						}))}
					>
						<MenuTrigger asChild>
							<LabelMenuButton label="Category">{currentCategoryLabel}</LabelMenuButton>
						</MenuTrigger>
						<MenuContent />
					</Menu>
				</Box>
			</Box>

			<Box display="grid" gap="16" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
				<TemplateCard
					icon={<IconPlus size={24} />}
					name="Start from Scratch"
					description="Create a custom content model"
					onSelect={() => handleSelectTemplate(null)}
					variant="create"
				/>

				{filteredTemplates.map((tpl) => (
					<TemplateCard
						key={tpl.id}
						icon={tpl.icon}
						name={tpl.name}
						description={tpl.description}
						category={tpl.category}
						onSelect={() => handleSelectTemplate(tpl)}
					/>
				))}
			</Box>

			{filteredTemplates.length === 0 && <EmptyState message="No templates match your search" />}
		</Box>
	);
}
