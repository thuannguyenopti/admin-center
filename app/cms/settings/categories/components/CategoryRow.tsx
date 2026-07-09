import {Badge, Button, Checkbox, Menu, MenuTrigger, MenuContent} from "@optiaxiom/react";
import {useRouter} from "next/navigation";
import {Category} from "../types";
import {Tr, Td} from "@/app/components/Table";
import {getChildren} from "../utils";
import {IconEllipsisSolid, IconFolder} from "@/app/lib/axiom-icons";
import ChevronDownIcon from "@/public/icons/chevron-down.svg";
import Item from "@/app/components/Item";

interface CategoryRowProps {
	category: Category;
	allCategories: Category[];
	depth: number;
	isSelected: boolean;
	onToggleSelection: (id: string) => void;
	onToggleExpand: (id: string) => void;
	onEdit: (category: Category) => void;
	onDelete: (id: string) => void;
	newlyImportedIds?: Set<string>;
}

export function CategoryRow({
	category,
	allCategories,
	depth,
	isSelected,
	onToggleSelection,
	onToggleExpand,
	onEdit,
	onDelete,
	newlyImportedIds = new Set(),
}: CategoryRowProps) {
	const router = useRouter();
	const children = getChildren(category.id, allCategories);
	const hasChildren = children.length > 0;
	const indent = depth * 32; // 32px per level
	const isNewlyImported = newlyImportedIds.has(category.id);

	const statusColors: Record<string, "neutral" | "success" | "warning"> = {
		draft: "neutral",
		published: "success",
		"in-review": "warning",
	};

	const handleUsageClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (category.usage > 0) {
			router.push(`/cms/content?category=${category.slug}`);
		}
	};

	return (
		<>
			<Tr
				className={`${isSelected ? "bg-[var(--ax-colors-bg-default-pressed)]" : ""} hover:bg-[var(--ax-colors-bg-default-hovered)] ${isNewlyImported ? "newly-imported" : ""}`}
			>
				<Td type="raw">
					<div className="flex items-center gap-2" style={{paddingLeft: `${indent}px`}}>
						<Checkbox
							checked={isSelected}
							onCheckedChange={() => onToggleSelection(category.id)}
						/>
						{hasChildren ? (
							<Button
								appearance="subtle"
								size="sm"
								onClick={() => onToggleExpand(category.id)}
								aria-label={category.isExpanded ? "Collapse" : "Expand"}
								icon={
									<span
										style={{
											display: "inline-flex",
											alignItems: "center",
											justifyContent: "center",
											transform: category.isExpanded
												? "rotate(0deg)"
												: "rotate(-90deg)",
											transition: "transform 0.2s",
										}}
									>
										<ChevronDownIcon
											style={{
												width: "11px",
												height: "5px",
												color: "var(--ax-colors-fg-default)",
											}}
										/>
									</span>
								}
								style={{marginLeft: "8px"}}
							/>
						) : (
							<div style={{width: "27px"}} />
						)}
					</div>
				</Td>
				<Td type="header">
					<span
						className="cursor-pointer hover:underline"
						onClick={() => onEdit(category)}
					>
						<Item
							icon={
								<IconFolder
									size={16}
									style={{color: "var(--ax-colors-fg-default)"}}
								/>
							}
							title={category.name}
						/>
					</span>
				</Td>
				<Td>
					<span style={{fontFamily: "Hack, monospace", fontSize: "14px"}}>
						{depth > 0 ? `../${category.slug}` : `/${category.slug}`}
					</span>
				</Td>
				<Td>
					<Badge intent={statusColors[category.status] || "neutral"}>
						{category.status.charAt(0).toUpperCase() + category.status.slice(1)}
					</Badge>
				</Td>
				<Td>
					{category.visibility.charAt(0).toUpperCase() + category.visibility.slice(1)}
				</Td>
				<Td>{category.modifiedBy}</Td>
				<Td>
					<span
						onClick={category.usage > 0 ? handleUsageClick : undefined}
						className={category.usage > 0 ? "cursor-pointer hover:underline" : ""}
						style={{
							color: "var(--ax-colors-fg-default)",
						}}
						title={
							category.usage > 0
								? `View ${category.usage} content items in this category`
								: undefined
						}
					>
						{category.usage}
					</span>
				</Td>
				<Td>{category.lastModified}</Td>
				<Td type="button">
					<Menu
						options={[
							{label: "Edit", execute: () => onEdit(category)},
							{label: "Delete", execute: () => onDelete(category.id)},
						]}
					>
						<MenuTrigger asChild>
							<Button
								appearance="subtle"
								size="sm"
								aria-label="Category actions"
								icon={
									<IconEllipsisSolid
										size={16}
										style={{color: "var(--ax-colors-fg-default)"}}
									/>
								}
							/>
						</MenuTrigger>
						<MenuContent />
					</Menu>
				</Td>
			</Tr>
			{category.isExpanded &&
				children.map((child) => (
					<CategoryRow
						key={child.id}
						category={child}
						allCategories={allCategories}
						depth={depth + 1}
						isSelected={isSelected}
						onToggleSelection={onToggleSelection}
						onToggleExpand={onToggleExpand}
						onEdit={onEdit}
						onDelete={onDelete}
						newlyImportedIds={newlyImportedIds}
					/>
				))}
		</>
	);
}
