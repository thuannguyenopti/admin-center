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
