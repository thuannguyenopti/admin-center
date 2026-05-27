"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Box,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	SearchInput,
	Text,
} from "@optiaxiom/react";
import { IconAngleDown } from "@optiaxiom/icons";
import { IconFilter } from "@optimizely/axiom-icons";
import { BrandPackCard, NewBrandPackCard } from "./BrandPackCard";
import { BrandPackHero } from "./BrandPackHero";
import { activePack, brandPacks } from "../data";
import type { BrandPackStatus } from "../types";

const statusFilters: Array<{ label: string; value: BrandPackStatus | "all" }> = [
	{ label: "All", value: "all" },
	{ label: "Published", value: "published" },
	{ label: "Draft", value: "draft" },
	{ label: "Archived", value: "archived" },
];

type BrandPacksOverviewProps = {
	embedded?: boolean;
};

export function BrandPacksOverview({ embedded = false }: BrandPacksOverviewProps) {
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<BrandPackStatus | "all">("all");

	const nonActivePacks = useMemo(() => {
		return brandPacks.filter((p) => p.status !== "active");
	}, []);

	const filtered = useMemo(() => {
		return nonActivePacks.filter((p) => {
			const matchesSearch = !search.trim() || p.name.toLowerCase().includes(search.toLowerCase());
			const matchesStatus = statusFilter === "all" || p.status === statusFilter;
			return matchesSearch && matchesStatus;
		});
	}, [nonActivePacks, search, statusFilter]);

	return (
		<Box h="full" overflow="auto">
			<Box
				display="flex"
				flexDirection="column"
				gap="32"
				style={{
					margin: embedded ? 0 : "0 auto",
					maxWidth: embedded ? "none" : 1200,
					// embedded: 0 top padding — the context page tabs already provide 16px
					// of visual separation via their mb="16" before this content area
					padding: embedded ? "0 32px 64px" : "32px 40px 64px",
					width: "100%",
				}}
			>
				{/* Header row */}
				<Box alignItems="start" display="flex" justifyContent="space-between">
					<Box display="flex" flexDirection="column" gap="4">
						{!embedded && (
							<Text fontWeight="700" style={{ fontSize: 28, color: "var(--ax-colors-fg-default)" }}>
								Brand Packs
							</Text>
						)}
						<Text color="fg.secondary" style={{ fontSize: 14 }}>
							Visually consistent. On-brand. Agentic by design.
						</Text>
					</Box>

					{/* Dropdown — chevron now means dropdown, not modal */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								appearance="primary"
								size="md"
								icon={<IconAngleDown />}
								iconPosition="end"
							>
								New Brand Pack
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => router.push("/opal/brand-packs/new/opal")}>
								<Box display="flex" flexDirection="column" gap="2" style={{ alignItems: "flex-start" }}>
									<Text fontSize="sm" fontWeight="500">Create with Opal</Text>
									<Text fontSize="xs" color="fg.tertiary">AI-powered brand generation</Text>
								</Box>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => router.push("/opal/brand-packs/new/figma")}>
								<Box display="flex" flexDirection="column" gap="2" style={{ alignItems: "flex-start" }}>
									<Text fontSize="sm" fontWeight="500">Import from Figma</Text>
									<Text fontSize="xs" color="fg.tertiary">Sync a Figma design library</Text>
								</Box>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => router.push("/opal/brand-packs/new/manual")}>
								<Box display="flex" flexDirection="column" gap="2" style={{ alignItems: "flex-start" }}>
									<Text fontSize="sm" fontWeight="500">Manual setup</Text>
									<Text fontSize="xs" color="fg.tertiary">Upload assets and configure manually</Text>
								</Box>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</Box>

				{activePack && <BrandPackHero pack={activePack} />}

				<Box display="flex" flexDirection="column" gap="16">
					{/* Section header + controls */}
					<Box
						alignItems="center"
						display="flex"
						justifyContent="space-between"
						style={{ gap: 16, flexWrap: "wrap" }}
					>
						<Box display="flex" flexDirection="column" gap="2">
							<Text fontWeight="600" style={{ fontSize: 16 }}>
								Explore Brand Systems
							</Text>
							<Text color="fg.tertiary" style={{ fontSize: 13 }}>
								Find the right pack for your channel, campaign, or audience.
							</Text>
						</Box>

						<Box alignItems="center" display="flex" gap="8">
							{/* Segmented status filter */}
							<Box
								alignItems="center"
								bg="bg.secondary"
								display="inline-flex"
								gap="2"
								p="2"
								rounded="full"
							>
								{statusFilters.map((f) => (
									<Button
										key={f.value}
										appearance="subtle"
										size="sm"
										onClick={() => setStatusFilter(f.value)}
										style={{
											background: statusFilter === f.value ? "var(--ax-colors-bg-default)" : "transparent",
											borderRadius: 999,
											color: statusFilter === f.value ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)",
											fontWeight: statusFilter === f.value ? 600 : 400,
											whiteSpace: "nowrap",
										}}
									>
										{f.label}
									</Button>
								))}
							</Box>

							<Box style={{ width: 200 }}>
								<SearchInput
									placeholder="Search packs..."
									size="md"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</Box>

							<Button
								appearance="default"
								aria-label="Filter brand packs"
								icon={<IconFilter />}
								size="md"
								style={{ flexShrink: 0 }}
								title="Filter brand packs"
							/>
						</Box>
					</Box>

					{/* Pack grid */}
					{filtered.length === 0 && search ? (
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
							<Text fontWeight="500">No packs match &ldquo;{search}&rdquo;</Text>
							<Text color="fg.secondary" fontSize="sm">
								Try a different name or clear the filter
							</Text>
						</Box>
					) : (
						<Box
							display="grid"
							gap="16"
							style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
						>
							{filtered.map((pack) => (
								<BrandPackCard key={pack.id} pack={pack} />
							))}
							<NewBrandPackCard onClick={() => router.push("/opal/brand-packs/new/opal")} />
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
}
