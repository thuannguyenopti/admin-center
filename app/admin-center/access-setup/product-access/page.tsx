"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Box,
	Heading,
	Link,
	SearchInput,
	Text,
} from "@optiaxiom/react";
import { IconCircleInfo } from "@optiaxiom/icons";

import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
	ACCOUNT_EXECUTIVE,
	CUSTOMER_SUCCESS_MANAGER,
	PRODUCT_ACCESS_LIST,
} from "./data";

export default function ProductAccessPage() {
	const router = useRouter();
	const [search, setSearch] = useState("");

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return PRODUCT_ACCESS_LIST;
		return PRODUCT_ACCESS_LIST.filter((p) =>
			[p.name, p.technicalContact].some((field) =>
				field.toLowerCase().includes(q),
			),
		);
	}, [search]);

	return (
		<Box>
			<Box display="flex" alignItems="center" gap="12" mb="16">
				<Heading level="2">Product access</Heading>
				<Link href="#" fontSize="md">
					Learn more
				</Link>
			</Box>

			<Box
				display="flex"
				alignItems="center"
				gap="12"
				p="16"
				mb="24"
				rounded="md"
				bg="bg.accent.subtle"
			>
				<Box style={{ flexShrink: 0 }}>
					<IconCircleInfo size={20} color="var(--ax-colors-fg-default)" />
				</Box>
				<Box display="flex" flexDirection="column" gap="2">
					<Text fontSize="sm" color="fg.default">
						<Text asChild fontWeight="600">
							<span>Account Executive: </span>
						</Text>
						{ACCOUNT_EXECUTIVE.name} {ACCOUNT_EXECUTIVE.phone} |{" "}
						{ACCOUNT_EXECUTIVE.email}
					</Text>
					<Text fontSize="sm" color="fg.default">
						<Text asChild fontWeight="600">
							<span>Customer Support Manager: </span>
						</Text>
						{CUSTOMER_SUCCESS_MANAGER.phone} |{" "}
						{CUSTOMER_SUCCESS_MANAGER.email}
					</Text>
				</Box>
			</Box>

			<Box mb="16" style={{ maxWidth: 360 }}>
				<SearchInput
					size="lg"
					placeholder="Search users by name or email..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</Box>

			<Table>
				<thead>
					<Tr>
						<Th>Product name</Th>
						<Th>Instances</Th>
						<Th>Users</Th>
						<Th>Technical Contact</Th>
					</Tr>
				</thead>
				<tbody>
					{filtered.length === 0 ? (
						<tr>
							<td colSpan={4}>
								<Box p="32" textAlign="center">
									<Text color="fg.tertiary">
										No products match the current search.
									</Text>
								</Box>
							</td>
						</tr>
					) : (
						filtered.map((p) => (
							<Tr
								key={p.id}
								onClick={() =>
									router.push(
										`/admin-center/access-setup/product-access/${p.id}`,
									)
								}
							>
								<Td>
									<Text color="fg.link.default" fontWeight="500">
										{p.name}
									</Text>
								</Td>
								<Td>{p.instances}</Td>
								<Td>{p.users}</Td>
								<Td>{p.technicalContact}</Td>
							</Tr>
						))
					)}
				</tbody>
			</Table>
		</Box>
	);
}
