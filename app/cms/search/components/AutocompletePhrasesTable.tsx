import {Table, Tr, Td, Th} from "@/app/components/Table";
import Item from "@/app/components/Item";
import {IconTrash, IconPencil, IconDots, IconAbc} from "@tabler/icons-react";
import {Menu, MenuTrigger, MenuContent} from "@optiaxiom/react";
import {AutocompletePhrase} from "@/app/db/initialData";

interface AutocompletePhrasesTableProps {
	phrases: AutocompletePhrase[];
	onEdit: (phrase: AutocompletePhrase) => void;
	onRemove: (id: string) => void;
	showOwner?: boolean;
}

export default function AutocompletePhrasesTable({
	phrases,
	onEdit,
	onRemove,
	showOwner = true,
}: AutocompletePhrasesTableProps) {
	return (
		<Table>
			<thead>
				<Tr>
					<Th>Phrase</Th>
					{showOwner && <Th>Owner</Th>}
					<Th></Th>
				</Tr>
			</thead>
			<tbody>
				{phrases.map((phrase) => (
					<Tr
						key={phrase.id}
						onClick={() => onEdit(phrase)}
					>
						<Td type="header">
							<Item
								icon={<IconAbc size={16} />}
								title={phrase.phrase}
							/>
						</Td>
						{showOwner && <Td type="avatar">{phrase.owner}</Td>}
						<Td type="button">
							<div onClick={(e) => e.stopPropagation()}>
								<Menu
									options={[
										{
											label: "Edit",
											addon: <IconPencil size={16} />,
											execute: () => onEdit(phrase),
										},
										{
											label: "Remove",
											addon: <IconTrash size={16} />,
											intent: "danger",
											execute: () => onRemove(phrase.id),
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
