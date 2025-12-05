import {Table, Tr, Td, Th} from "@/app/components/Table";
import Item from "@/app/components/Item";
import {
	IconRocket,
	IconTrash,
	IconPencil,
	IconDots,
	IconPlus,
	IconSwitch,
	IconActivity,
	IconPower,
} from "@tabler/icons-react";
import {
	Menu,
	MenuTrigger,
	MenuContent,
	Select,
	SelectTrigger,
	SelectContent,
	Separator,
	Switch,
} from "@optiaxiom/react";
import {BestBet} from "@/app/db/initialData";

interface BestBetsTableProps {
	bestBets: BestBet[];
	onEdit: (bet: BestBet) => void;
	onRemove: (query: string) => void;
	showStatus?: boolean;
	showOwner?: boolean;
	availableBestBets?: BestBet[];
	onAdd?: (bet: BestBet) => void;
	onCreate?: () => void;
	onToggleStatus?: (bet: BestBet, newStatus: "Active" | "Inactive") => void;
}

export default function BestBetsTable({
	bestBets,
	onEdit,
	onRemove,
	showStatus = true,
	showOwner = true,
	availableBestBets,
	onAdd,
	onCreate,
	onToggleStatus,
}: BestBetsTableProps) {
	const handleValueChange = (value: string) => {
		if (value === "__create__") {
			onCreate?.();
		} else {
			const bet = availableBestBets?.find((b) => b.query === value);
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
					},
			  ]
			: []),
		...(availableBestBets?.map((b) => ({label: b.query, value: b.query})) || []),
	];

	return (
		<>
			<Table>
				<thead>
					<Tr>
						<Th>Query</Th>
						<Th>Destination</Th>
						{showStatus && <Th>Status</Th>}
						{showOwner && <Th>Owner</Th>}
						<Th></Th>
					</Tr>
				</thead>
				<tbody>
					{bestBets.map((bet) => (
						<Tr key={bet.query}>
							<Td type="raw">
								<Item
									icon={<IconRocket size={16} />}
									title={bet.query}
								/>
							</Td>
							<Td>{bet.destination}</Td>
							{showStatus && (
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
											{
												label: "Active",
												addon: <IconPower size={16} />,
												execute: () =>
													onToggleStatus?.(
														bet,
														bet.status === "Active"
															? "Inactive"
															: "Active"
													),
												selected: bet.status === "Active",
												switch: true,
											},
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
			{availableBestBets && onAdd && (
				<Select
					onValueChange={handleValueChange}
					options={selectOptions}
					value=""
				>
					<SelectTrigger
						size="lg"
						mt="16"
						addonBefore={<IconPlus size={16} />}
					>
						Add Best Bet...
					</SelectTrigger>
					<SelectContent />
				</Select>
			)}
		</>
	);
}
