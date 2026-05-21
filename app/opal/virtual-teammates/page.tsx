"use client";

import { Box, Button, Heading } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Input } from "@/app/components/Input";
import { IconPlus } from "@optiaxiom/icons";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { VAUS, type VAU } from "@/app/opal/data/vaus";
import { VAUCard } from "./VAUCard";

export default function VirtualTeammatesPage() {
	const [query, setQuery] = useState("");
	const router = useRouter();

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return VAUS;
		return VAUS.filter((vau) =>
			vau.name.toLowerCase().includes(q) ||
			vau.templateName.toLowerCase().includes(q) ||
			vau.description.toLowerCase().includes(q) ||
			vau.tags.some((t) => t.label.toLowerCase().includes(q))
		);
	}, [query]);

	const handleSelect = (vau: VAU) => {
		router.push(`/opal/virtual-teammates/${vau.id}`);
	};

	return (
		<Box px="32" py="24" display="flex" flexDirection="column" gap="24" overflow="auto" h="full">
			{/* Header */}
			<Box display="flex" flexDirection="column" gap="8">
				<Heading level="1" fontSize="2xl">Virtual Teammates</Heading>
				<Text fontSize="sm" color="fg.secondary">
					AI marketers your team can collaborate with. Each Virtual Teammate runs a curated set of agents and connects to the tools they need.
				</Text>
			</Box>

			{/* Search + Add CTA */}
			<Box display="flex" alignItems="center" justifyContent="space-between" gap="16">
				<Box style={{ width: 320 }}>
					<Input
						placeholder="Search by name, role, or specialty"
						value={query}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
					/>
				</Box>
				<Button appearance="primary" icon={<IconPlus />}>
					Add Virtual Teammate
				</Button>
			</Box>

			{/* Card grid */}
			{filtered.length === 0 ? (
				<Text color="fg.tertiary">No teammates match your search.</Text>
			) : (
				<Box
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
						gap: "24px",
					}}
				>
					{filtered.map((vau) => (
						<VAUCard key={vau.id} vau={vau} onSelect={handleSelect} />
					))}
				</Box>
			)}
		</Box>
	);
}
