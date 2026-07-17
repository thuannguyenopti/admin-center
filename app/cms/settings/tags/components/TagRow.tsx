import {Button, Checkbox, Menu, MenuTrigger, MenuContent} from "@optiaxiom/react";
import {useRouter} from "next/navigation";
import {Tag} from "../types";
import {Tr, Td} from "@/app/components/Table";
import {IconEllipsisSolid} from "@/app/lib/axiom-icons";
import TagIcon from "../tag-icon.svg";
import Item from "@/app/components/Item";

interface TagRowProps {
	tag: Tag;
	isSelected: boolean;
	onToggleSelection: (id: string) => void;
	onEdit: (tag: Tag) => void;
	onDelete: (tag: Tag) => void;
	isNewlyImported?: boolean;
}

export function TagRow({
	tag,
	isSelected,
	onToggleSelection,
	onEdit,
	onDelete,
	isNewlyImported = false,
}: TagRowProps) {
	const router = useRouter();

	const handleUsageClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (tag.usage > 0) {
			router.push(`/cms/content?tag=${tag.slug}`);
		}
	};

	return (
		<Tr
			className={`${isSelected ? "bg-[var(--ax-colors-bg-default-pressed)]" : ""} ${isNewlyImported ? "newly-imported" : ""}`}
		>
			<Td type="raw">
				<div className="flex items-center">
					<Checkbox
						checked={isSelected}
						onCheckedChange={() => onToggleSelection(tag.id)}
					/>
				</div>
			</Td>
			<Td type="header">
				<Item
					icon={
						<TagIcon
							style={{
								width: "16px",
								height: "16px",
								color: "var(--ax-colors-fg-default)",
							}}
						/>
					}
					title={tag.name}
				/>
			</Td>
			<Td>
				<span
					style={{
						fontSize: "14px",
						fontWeight: 400,
						fontFamily: "Hack, monospace",
						color: "var(--ax-colors-fg-secondary)",
					}}
				>
					/{tag.slug}
				</span>
			</Td>
			<Td>
				<span
					style={{
						fontSize: "14px",
						fontWeight: 400,
						letterSpacing: "-0.15px",
						color: "var(--ax-colors-fg-default)",
					}}
				>
					{tag.visibility.charAt(0).toUpperCase() + tag.visibility.slice(1)}
				</span>
			</Td>
			<Td>
				<span
					style={{
						fontSize: "14px",
						fontWeight: 400,
						letterSpacing: "-0.15px",
						color: "var(--ax-colors-fg-default)",
					}}
				>
					{tag.modifiedBy}
				</span>
			</Td>
			<Td>
				<span
					onClick={tag.usage > 0 ? handleUsageClick : undefined}
					className={tag.usage > 0 ? "cursor-pointer hover:underline" : ""}
					style={{
						fontSize: "14px",
						fontWeight: 400,
						letterSpacing: "-0.15px",
						color: "var(--ax-colors-fg-default)",
					}}
					title={
						tag.usage > 0 ? `View ${tag.usage} content items with this tag` : undefined
					}
				>
					{tag.usage}
				</span>
			</Td>
			<Td>
				<span
					style={{
						fontSize: "14px",
						fontWeight: 400,
						letterSpacing: "-0.15px",
						color: "var(--ax-colors-fg-default)",
					}}
				>
					{tag.lastModified}
				</span>
			</Td>
			<Td type="button">
				<Menu
					options={[
						{label: "Edit", execute: () => onEdit(tag)},
						{label: "Delete", execute: () => onDelete(tag)},
					]}
				>
					<MenuTrigger asChild>
						<Button
							appearance="subtle"
							size="sm"
							aria-label="Tag actions"
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
	);
}
