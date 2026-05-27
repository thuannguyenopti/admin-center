"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, SearchInput, Text } from "@optiaxiom/react";
import { IconChevronDown, IconPaintRoller } from "@optimizely/axiom-icons";
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
			<Box alignItems="start" display="flex" justifyContent="space-between" style={{ flexWrap: "wrap", gap: 16 }}>
				<Box display="flex" flexDirection="column" gap="4">
					<Box alignItems="center" display="flex" gap="12">
						<Box
							alignItems="center"
							bg="bg.accent.subtle"
							display="flex"
							justifyContent="center"
							rounded="lg"
							style={{ height: 40, width: 40 }}
						>
							<IconPaintRoller style={{ color: "var(--ax-colors-fg-accent)" }} />
						</Box>
						<Text fontWeight="700" style={{ fontSize: 28 }}>
							Brand Packs
						</Text>
					</Box>
					<Text color="fg.secondary" fontSize="sm" style={{ paddingLeft: 52 }}>
						Visual identities Opal uses to generate on-brand content.
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
			{activePack && (
				<Box display="flex" flexDirection="column" gap="8">
					<Text color="fg.secondary" fontSize="xs" fontWeight="600" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
						Active Pack
					</Text>
					<BrandPackHero pack={activePack} />
				</Box>
			)}

			{/* All packs */}
			<Box display="flex" flexDirection="column" gap="16">
				{/* Section toolbar */}
				<Box alignItems="center" display="flex" gap="12" justifyContent="space-between" style={{ flexWrap: "wrap" }}>
					<Box alignItems="center" display="flex" gap="8">
						<Text fontWeight="600" style={{ fontSize: 16 }}>
							All Packs
						</Text>
						<Box
							alignItems="center"
							bg="bg.secondary"
							display="flex"
							justifyContent="center"
							rounded="full"
							style={{ height: 22, minWidth: 22, padding: "0 6px" }}
						>
							<Text color="fg.secondary" fontSize="xs" fontWeight="600">
								{nonActivePacks.length}
							</Text>
						</Box>
					</Box>

					<Box alignItems="center" display="flex" gap="8">
						{/* Status filter pills */}
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
									}}
								>
									{f.label}
								</button>
							))}
						</Box>

						{/* Search */}
						<Box style={{ width: 220 }}>
							<SearchInput
								placeholder="Search packs…"
								size="md"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
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
						<Text color="fg.secondary" fontSize="sm">Try a different name or clear the filter</Text>
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
		</Box>
	);
}
