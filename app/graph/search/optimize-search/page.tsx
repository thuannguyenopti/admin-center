"use client";

import Item from "@/app/components/Item";
import AbstractDialog from "@/app/components/AbstractDialog";
import {Box, Avatar, Field, Menu, MenuTrigger, MenuContent} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Flex} from "@/app/components/Flex";
import {Input} from "@/app/components/Input";
import {
	IconPlus,
	IconReportSearch,
	IconSearch,
	IconDots,
	IconPencil,
	IconTrash,
} from "@tabler/icons-react";
import {useState, useMemo, useEffect} from "react";
import {useRouter} from "next/navigation";
import usePersistentState from "@/app/usePersistentState";
import {Algorithm, initialAlgorithms} from "@/app/db/initialData";
import {Table, Tr, Td, Th} from "@/app/components/Table";

export default function OptimizeSearchPage() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [algorithms, setAlgorithms] = usePersistentState("algorithms", initialAlgorithms) as [
		Algorithm[],
		(val: Algorithm[]) => void
	];
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [newAlgorithmName, setNewAlgorithmName] = useState("");
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [algorithmToDelete, setAlgorithmToDelete] = useState<string | null>(null);

	useEffect(() => {
		if (algorithms.some((a) => !a.id)) {
			const patched = algorithms.map((a) =>
				a.id ? a : {...a, id: Math.random().toString(36).substr(2, 9)}
			);
			setAlgorithms(patched);
		}
	}, [algorithms, setAlgorithms]);

	const handleCreateAlgorithm = () => {
		if (!newAlgorithmName) return;

		const newAlgorithm: Algorithm = {
			id: Date.now().toString(),
			name: newAlgorithmName,
			publishState: "Draft",
			creationDate: new Date().toISOString().split("T")[0],
			owner: "Alice Johnson",
		};

		setAlgorithms([...algorithms, newAlgorithm]);
		setNewAlgorithmName("");
		setIsCreateDialogOpen(false);
	};

	const handleRemoveAlgorithm = (id: string) => {
		setAlgorithmToDelete(id);
		setIsDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (algorithmToDelete === null) return;
		const newAlgorithms = algorithms.filter((a) => a.id !== algorithmToDelete);
		setAlgorithms(newAlgorithms);
		setIsDeleteDialogOpen(false);
		setAlgorithmToDelete(null);
	};

	const filteredData = useMemo(() => {
		if (!searchQuery) return algorithms;

		const query = searchQuery.toLowerCase();
		return algorithms.filter(
			(algorithm) =>
				algorithm.name.toLowerCase().includes(query) ||
				algorithm.publishState.toLowerCase().includes(query) ||
				algorithm.owner.toLowerCase().includes(query)
		);
	}, [searchQuery, algorithms]);

	return (
		<Box>
			<Flex
				flexDirection="row"
				justifyContent="space-between"
				alignItems="center"
				gap="16"
				mb="24"
			>
				<Input
					addonBefore={<IconSearch size={16} />}
					placeholder="Search algorithms..."
					style={{width: "320px"}}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
				<Button
					size="lg"
					icon={<IconPlus size={16} />}
					appearance="primary"
					aria-label="Create Algorithm"
					onClick={() => setIsCreateDialogOpen(true)}
				>
					Create Algorithm
				</Button>
			</Flex>

			<Table>
				<thead>
					<Tr>
						<Th>Name</Th>
						<Th>Publish State</Th>
						<Th>Creation Date</Th>
						<Th>Owner</Th>
						<Th></Th>
					</Tr>
				</thead>
				<tbody>
					{filteredData.map((algorithm) => (
						<Tr
							key={algorithm.id}
							url={`/graph/search/optimize-search/${algorithm.id}/optimizations`}
						>
							<Td type="raw">
								<Item
									icon={<IconReportSearch size={16} />}
									title={algorithm.name}
								/>
							</Td>
							<Td>{algorithm.publishState}</Td>
							<Td>{algorithm.creationDate}</Td>
							<Td type="avatar">{algorithm.owner}</Td>
							<Td type="button">
								<div onClick={(e) => e.stopPropagation()}>
									<Menu
										options={[
											{
												label: "Edit",
												addon: <IconPencil size={16} />,
												execute: () =>
													router.push(
														`/graph/search/optimize-search/${algorithm.id}/optimizations`
													),
											},
											{
												label: "Remove",
												addon: <IconTrash size={16} />,
												intent: "danger",
												execute: () => handleRemoveAlgorithm(algorithm.id),
											},
										]}
									>
										<MenuTrigger
											aria-label="Actions"
											icon={<IconDots size={16} />}
											appearance="subtle"
											size="md"
										/>
										<MenuContent />
									</Menu>
								</div>
							</Td>
						</Tr>
					))}
				</tbody>
			</Table>

			<AbstractDialog
				title="Create Algorithm"
				description="Add a new search algorithm to the list."
				open={isCreateDialogOpen}
				setOpen={setIsCreateDialogOpen}
				footerPrimaryText="Create"
				footerPrimaryAction={handleCreateAlgorithm}
				footerAppearance="primary"
			>
				<Flex
					flexDirection="column"
					gap="16"
				>
					<Field
						label="Name"
						required
					>
						<Input
							placeholder="e.g. Seasonal Boost"
							value={newAlgorithmName}
							onChange={(e) => setNewAlgorithmName(e.target.value)}
						/>
					</Field>
				</Flex>
			</AbstractDialog>

			<AbstractDialog
				isAlert
				title="Remove Algorithm"
				description="Are you sure you want to remove this algorithm? This action cannot be undone."
				open={isDeleteDialogOpen}
				setOpen={setIsDeleteDialogOpen}
				footerPrimaryText="Remove"
				footerPrimaryAction={confirmDelete}
				footerAppearance="danger"
			/>
		</Box>
	);
}
