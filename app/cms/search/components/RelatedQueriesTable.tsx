import {Table, Tr, Td, Th} from "@/app/components/Table";
import Item from "@/app/components/Item";
import {IconCongruentTo, IconTrash, IconPen, IconEllipsisSolid} from "@/app/lib/axiom-icons";
import {Menu, MenuTrigger, MenuContent, Box, Pagination} from "@optiaxiom/react";
import {RelatedQuery} from "@/app/db/initialData";

interface RelatedQueriesTableProps {
	relatedQueries: RelatedQuery[];
	onEdit: (query: RelatedQuery) => void;
	onRemove: (query: string) => void;
	showOwner?: boolean;
	pagination?: {
		total: number;
		page: number;
		onPageChange: (page: number) => void;
	};
}

export default function RelatedQueriesTable({
	relatedQueries,
	onEdit,
	onRemove,
	showOwner = true,
	pagination,
}: RelatedQueriesTableProps) {
	return (
		<>
			<Table>
				<thead>
					<Tr>
						<Th>Query</Th>
						<Th>Synonyms</Th>
						{showOwner && <Th>Owner</Th>}
						<Th></Th>
					</Tr>
				</thead>
				<tbody>
					{relatedQueries.map((sq) => (
						<Tr key={sq.query} onClick={() => onEdit(sq)}>
							<Td type="header">
								<Item icon={<IconCongruentTo size={16} />} title={sq.query} />
							</Td>
							<Td>{sq.synonyms.join(", ")}</Td>
							{showOwner && <Td type="avatar">{sq.owner}</Td>}
							<Td type="button">
								<div onClick={(e) => e.stopPropagation()}>
									<Menu
										options={[
											{
												label: "Edit",
												addon: <IconPen size={16} />,
												execute: () => onEdit(sq),
											},
											{
												label: "Remove",
												addon: <IconTrash size={16} />,
												intent: "danger",
												execute: () => onRemove(sq.query),
											},
										]}
									>
										<MenuTrigger
											aria-label="Actions"
											icon={<IconEllipsisSolid size={16} />}
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
		</>
	);
}
