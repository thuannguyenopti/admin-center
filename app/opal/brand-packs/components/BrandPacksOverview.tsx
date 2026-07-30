<<<<<<< HEAD
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, SearchInput, Text } from "@optiaxiom/react";
import { IconChevronDown, IconFilter } from "@optimizely/axiom-icons";
import { BrandPackCard, NewBrandPackCard } from "./BrandPackCard";
import { BrandPackHero } from "./BrandPackHero";
import { NewBrandPackModal } from "./NewBrandPackModal";
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
	const [showNewModal, setShowNewModal] = useState(false);

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

	const handleNewPack = (method: "opal" | "figma" | "manual") => {
		setShowNewModal(false);
		router.push(`/opal/brand-packs/new/${method}`);
	};

	return (
		<Box h="full" overflow="auto">
			<Box
				display="flex"
				flexDirection="column"
				gap="32"
				style={{
					margin: embedded ? 0 : "0 auto",
					maxWidth: embedded ? "none" : 1200,
					padding: embedded ? "24px 32px 64px" : "32px 40px 64px",
					width: "100%",
				}}
			>
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

					<Button
						appearance="primary"
						size="md"
						icon={<IconChevronDown />}
						iconPosition="end"
						onClick={() => setShowNewModal(true)}
					>
						New Brand Pack
					</Button>
				</Box>

				{activePack && <BrandPackHero pack={activePack} />}

				<Box display="flex" flexDirection="column" gap="16">
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

							<Box
								alignItems="center"
								bg="bg.secondary"
								border="1"
								borderColor="border.tertiary"
								display="flex"
								justifyContent="center"
								rounded="md"
								style={{
									cursor: "pointer",
									height: 36,
									width: 36,
									flexShrink: 0,
								}}
							>
								<IconFilter style={{ color: "var(--ax-colors-fg-secondary)", width: 15, height: 15 }} />
							</Box>
						</Box>
					</Box>

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
							<Text fontWeight="500">No packs match "{search}"</Text>
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
							<NewBrandPackCard onClick={() => setShowNewModal(true)} />
						</Box>
					)}
				</Box>
			</Box>

			{showNewModal && (
				<NewBrandPackModal
					onClose={() => setShowNewModal(false)}
					onSelectOpal={() => handleNewPack("opal")}
					onSelectFigma={() => handleNewPack("figma")}
					onSelectManual={() => handleNewPack("manual")}
				/>
			)}
		</Box>
	);
}
=======
"use client";

import { useRouter } from "next/navigation";
import {
	Box,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Text,
} from "@optiaxiom/react";
import { IconAngleDown } from "@optiaxiom/icons";
import { BrandPackCard, NewBrandPackCard } from "./BrandPackCard";
import { BrandPackHero } from "./BrandPackHero";
import { activePack, brandPacks } from "../data";

type BrandPacksOverviewProps = {
	embedded?: boolean;
};

export function BrandPacksOverview({ embedded = false }: BrandPacksOverviewProps) {
	const router = useRouter();

	return (
		<Box h="full" overflow="auto">
			<Box
				display="flex"
				flexDirection="column"
				gap="32"
				style={{
					margin: embedded ? 0 : "0 auto",
					maxWidth: embedded ? "none" : 1200,
					padding: embedded ? "0 32px 64px" : "32px 40px 64px",
					width: "100%",
				}}
			>
				{/* Header row */}
				<Box alignItems="start" display="flex" justifyContent="space-between">
					<Box display="flex" flexDirection="column" gap="4">
						{!embedded && (
							<Text fontWeight="700" style={{ fontSize: 28, color: "var(--ax-colors-fg-default)" }}>
								Brands
							</Text>
						)}
						<Text color="fg.secondary" style={{ fontSize: 14 }}>
							Visually consistent. On-brand. Agentic by design.
						</Text>
					</Box>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								appearance="primary"
								size="lg"
								icon={<IconAngleDown />}
								iconPosition="end"
							>
								New Brand
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
					<Box display="flex" flexDirection="column" gap="2">
						<Text fontWeight="600" style={{ fontSize: 16 }}>
							More brands or packs
						</Text>
						<Text color="fg.tertiary" style={{ fontSize: 13 }}>
							Find the right pack for your channel, campaign, or audience.
						</Text>
					</Box>

					<Box
						display="grid"
						gap="16"
						style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
					>
						{brandPacks
							.filter((pack) => pack.id !== activePack?.id)
							.map((pack) => (
								<BrandPackCard key={pack.id} pack={pack} />
							))}
						<NewBrandPackCard onClick={() => router.push("/opal/brand-packs/new/opal")} />
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
>>>>>>> origin/main
