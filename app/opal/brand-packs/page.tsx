"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, SearchInput, Text } from "@optiaxiom/react";
import { IconChevronDown, IconFilter } from "@optimizely/axiom-icons";
import { BrandPackCard, NewBrandPackCard } from "./components/BrandPackCard";
import { BrandPackHero } from "./components/BrandPackHero";
import { NewBrandPackModal } from "./components/NewBrandPackModal";
import { brandPacks, activePack } from "./data";
import type { BrandPackStatus } from "./types";

const statusFilters: Array<{ label: string; value: BrandPackStatus | "all" }> = [
	{ label: "All", value: "all" },
	{ label: "Published", value: "published" },
	{ label: "Draft", value: "draft" },
	{ label: "Archived", value: "archived" },
];

export default function BrandPacksPage() {
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
				style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 40px 64px", width: "100%" }}
			>
				{/* Page header */}
				<Box alignItems="start" display="flex" justifyContent="space-between">
					<Box display="flex" flexDirection="column" gap="4">
						<Text fontWeight="700" style={{ fontSize: 28, color: "var(--ax-colors-fg-default)" }}>
							Brand Packs
						</Text>
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

				{/* Active pack hero */}
				{activePack && <BrandPackHero pack={activePack} />}

				{/* Explore section */}
				<Box display="flex" flexDirection="column" gap="16">
					{/* Section header row */}
					<Box
						alignItems="center"
						display="flex"
						justifyContent="space-between"
						style={{ gap: 16, flexWrap: "wrap" }}
					>
						{/* Title + subtitle */}
						<Box display="flex" flexDirection="column" gap="2">
							<Text fontWeight="600" style={{ fontSize: 16 }}>
								Explore Brand Systems
							</Text>
							<Text color="fg.tertiary" style={{ fontSize: 13 }}>
								Find the right pack for your channel, campaign, or audience.
							</Text>
						</Box>

						{/* Controls */}
						<Box alignItems="center" display="flex" gap="8">
							{/* Status filter tabs */}
							<Box
								alignItems="center"
								bg="bg.secondary"
								display="inline-flex"
								gap="2"
								p="2"
								rounded="full"
							>
								{statusFilters.map((f) => (
									<button
										key={f.value}
										type="button"
										onClick={() => setStatusFilter(f.value)}
										style={{
											background: statusFilter === f.value ? "var(--ax-colors-bg-default)" : "transparent",
											border: 0,
											borderRadius: 999,
											color: statusFilter === f.value ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)",
											cursor: "pointer",
											fontSize: 13,
											fontWeight: statusFilter === f.value ? 600 : 400,
											padding: "4px 12px",
											transition: "all 0.15s ease",
											whiteSpace: "nowrap",
										}}
									>
										{f.label}
									</button>
								))}
							</Box>

							{/* Search */}
							<Box style={{ width: 200 }}>
								<SearchInput
									placeholder="Search packs…"
									size="md"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</Box>

							{/* Filter icon */}
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

					{/* Grid */}
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

			{/* New pack modal */}
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
