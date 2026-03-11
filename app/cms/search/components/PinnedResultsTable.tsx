import {Table, Tr, Td, Th} from "@/app/components/Table";
import Item from "@/app/components/Item";
import {
	IconTrash,
	IconPencil,
	IconDots,
	IconPlus,
	IconPower,
	IconFile,
	IconPinned,
} from "@tabler/icons-react";
import {
	Menu,
	MenuTrigger,
	MenuContent,
	Select,
	SelectTrigger,
	SelectContent,
	Box,
	Pagination,
} from "@optiaxiom/react";
import {PinnedResult, AlgorithmPinnedResult} from "@/app/db/initialData";
import searchResults from "@/app/db/searchResults.json";

interface PinnedResultsTableProps {
	pinnedResults: (PinnedResult | AlgorithmPinnedResult)[];
	onEdit: (bet: PinnedResult | AlgorithmPinnedResult) => void;
	onRemove: (query: string) => void;
	showStatus?: boolean;
	showOwner?: boolean;
	availablePinnedResults?: PinnedResult[];
	onAdd?: (bet: PinnedResult) => void;
	onCreate?: () => void;
	onToggleStatus?: (bet: AlgorithmPinnedResult, newStatus: "Active" | "Inactive") => void;
	pagination?: {
		total: number;
		page: number;
		onPageChange: (page: number) => void;
	};
}

export default function PinnedResultsTable({
	pinnedResults,
	onEdit,
	onRemove,
	showStatus = true,
	showOwner = true,
	availablePinnedResults,
	onAdd,
	onCreate,
	onToggleStatus,
	pagination,
}: PinnedResultsTableProps) {
	const handleValueChange = (value: string) => {
		if (value === "__create__") {
			onCreate?.();
		} else {
			const bet = availablePinnedResults?.find((b) => b.query === value);
			if (bet) onAdd?.(bet);
		}
	};

	const selectOptions = [
		...(onCreate
			? [
					{
						label: "Create new...",
						value: "__create__",
						addon: <IconPlus size={16} />,
						group: {label: "", hidden: true, separator: true},
						execute: () => handleValueChange("__create__"),
					},
				]
			: []),
		...(availablePinnedResults?.map((b) => ({
			label: searchResults.find((r) => r.url === b.destination)?.title || b.destination,
			value: b.query,
			description: b.query,
			execute: () => handleValueChange(b.query),
		})) || []),
	];

	return (
		<>
			<Table>
				<thead>
					<Tr>
						<Th>Pinned Result</Th>
						<Th>Destination</Th>
						{showStatus && <Th>Status</Th>}
						{showOwner && <Th>Owner</Th>}
						<Th></Th>
					</Tr>
				</thead>
				<tbody>
					{pinnedResults.map((bet) => (
						<Tr key={bet.query} onClick={() => onEdit(bet)}>
							<Td type="header">
								<Item
									icon={<IconPinned size={16} />}
									title={bet.query.split(",")[0].trim()}
									description={
										bet.query.split(",").slice(1).join(",").trim() || undefined
									}
								/>
							</Td>
							<Td>
								<Item
									icon={<IconFile size={16} />}
									title={
										searchResults.find((r) => r.url === bet.destination)
											?.title || bet.destination
									}
									description={bet.destination}
								/>
							</Td>
							{showStatus && "status" in bet && (
								<Td
									type="badge"
									data={bet.status === "Active" ? "success" : "neutral"}
								>
									{bet.status}
								</Td>
							)}
							{showOwner && <Td type="avatar">{bet.owner}</Td>}
							<Td type="button">
								<div onClick={(e) => e.stopPropagation()}>
									<Menu
										options={[
											...(showStatus && "status" in bet
												? [
														{
															label: "Active",
															addon: <IconPower size={16} />,
															execute: () =>
																onToggleStatus?.(
																	bet as AlgorithmPinnedResult,
																	bet.status === "Active"
																		? "Inactive"
																		: "Active"
																),
															selected: bet.status === "Active",
															switch: true,
														},
													]
												: []),
											{
												label: "Edit",
												addon: <IconPencil size={16} />,
												execute: () => onEdit(bet),
											},
											{
												label: "Remove",
												addon: <IconTrash size={16} />,
												intent: "danger",
												execute: () => onRemove(bet.query),
											},
										]}
									>
										<MenuTrigger
											aria-label="Actions"
											icon={<IconDots size={16} />}
											appearance="subtle"
											size="sm"
										/>
										<MenuContent />
									</Menu>
								</div>
							</Td>
						</Tr>
					))}
				</tbody>
			</Table>
			{pagination && (
				<Box display="flex" justifyContent="center" mt="16">
					<Pagination
						total={pagination.total}
						page={pagination.page}
						onPageChange={pagination.onPageChange}
					/>
				</Box>
			)}
			{availablePinnedResults && onAdd && (
				<Menu options={selectOptions}>
					<MenuTrigger size="lg" mt="16" addonBefore={<IconPlus size={16} />}>
						Add Pinned Result...
					</MenuTrigger>
					<MenuContent />
				</Menu>
			)}
		</>
	);
}
