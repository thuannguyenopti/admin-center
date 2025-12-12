import {Table, Tr, Td, Th} from "@/app/components/Table";
import Item from "@/app/components/Item";
import {
	IconTrash,
	IconPencil,
	IconDots,
	IconPlus,
	IconArrowsExchange,
	IconArrowRight,
} from "@tabler/icons-react";
import {Menu, MenuTrigger, MenuContent} from "@optiaxiom/react";
import {Synonym} from "@/app/db/initialData";

interface SynonymsTableProps {
	synonyms: Synonym[];
	onEdit: (synonym: Synonym) => void;
	onRemove: (id: string) => void;
	showOwner?: boolean;
	availableSynonyms?: Synonym[];
	onAdd?: (synonym: Synonym) => void;
	onCreate?: () => void;
}

export default function SynonymsTable({
	synonyms,
	onEdit,
	onRemove,
	showOwner = true,
	availableSynonyms,
	onAdd,
	onCreate,
}: SynonymsTableProps) {
	return (
		<Table>
			<thead>
				<Tr>
					<Th>Term</Th>
					<Th>Synonyms</Th>
					<Th>Type</Th>
					{showOwner && <Th>Owner</Th>}
					<Th></Th>
				</Tr>
			</thead>
			<tbody>
				{synonyms.map((synonym) => (
					<Tr
						key={synonym.id}
						onClick={() => onEdit(synonym)}
					>
						<Td type="header">
							<Item
								icon={
									synonym.type === "Two-way" ? (
										<IconArrowsExchange size={16} />
									) : (
										<IconArrowRight size={16} />
									)
								}
								title={synonym.term}
							/>
						</Td>
						<Td>{synonym.synonyms.join(", ")}</Td>
						<Td>{synonym.type}</Td>
						{showOwner && <Td type="avatar">{synonym.owner}</Td>}
						<Td type="button">
							<div onClick={(e) => e.stopPropagation()}>
								<Menu
									options={[
										{
											label: "Edit",
											addon: <IconPencil size={16} />,
											execute: () => onEdit(synonym),
										},
										{
											label: "Remove",
											addon: <IconTrash size={16} />,
											intent: "danger",
											execute: () => onRemove(synonym.id),
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
	);
}
