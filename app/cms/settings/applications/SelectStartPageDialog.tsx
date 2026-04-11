"use client";

import { useState, useMemo } from "react";
import {
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
	Box,
	Group,
} from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import {
	IconFile,
	IconChevronRight,
	IconChevronDown,
} from "@tabler/icons-react";
import Item from "@/app/components/Item";
import { Page } from "@/app/db/initialData";

type PageNode = Page & { children: PageNode[] };

interface SelectStartPageDialogProps {
	children: React.ReactNode;
	pages: Page[];
	currentStartPageId?: string;
	onSelect: (pageId: string) => void;
}

const buildTree = (pages: Page[]) => {
	const map = new Map<string, PageNode>();
	const roots: PageNode[] = [];

	pages.forEach((page) => {
		map.set(page.id, { ...page, children: [] });
	});

	pages.forEach((page) => {
		const node = map.get(page.id)!;
		if (page.parentId) {
			const parent = map.get(page.parentId);
			if (parent) {
				parent.children.push(node);
			} else {
				roots.push(node);
			}
		} else {
			roots.push(node);
		}
	});

	return roots;
};

const PageTreeNode = ({
	node,
	level = 0,
	selectedPageId,
	onSelectPage,
}: {
	node: PageNode;
	level?: number;
	selectedPageId: string | null;
	onSelectPage: (id: string) => void;
}) => {
	const [expanded, setExpanded] = useState(true);
	const hasChildren = node.children.length > 0;
	const isSelected = selectedPageId === node.id;

	return (
		<Box>
			<Box
				onClick={() => onSelectPage(node.id)}
				cursor="pointer"
				p="8"
				rounded="sm"
				bg={isSelected ? "bg.accent.subtle" : undefined}
				style={{
					paddingLeft: level * 24 + 8,
				}}
			>
				<Group gap="8" alignItems="center">
					{hasChildren ? (
						<Box
							onClick={(e) => {
								e.stopPropagation();
								setExpanded(!expanded);
							}}
							cursor="pointer"
						>
							{expanded ? (
								<IconChevronDown size={16} />
							) : (
								<IconChevronRight size={16} />
							)}
						</Box>
					) : (
						<Box w="16" />
					)}
					<Item icon={<IconFile size={16} />} title={node.name} />
				</Group>
			</Box>
			{expanded &&
				node.children.map((child) => (
					<PageTreeNode
						key={child.id}
						node={child}
						level={level + 1}
						selectedPageId={selectedPageId}
						onSelectPage={onSelectPage}
					/>
				))}
		</Box>
	);
};

export function SelectStartPageDialog({
	children,
	pages,
	currentStartPageId,
	onSelect,
}: SelectStartPageDialogProps) {
	const [open, setOpen] = useState(false);
	const [selectedPageId, setSelectedPageId] = useState<string | null>(
		currentStartPageId || null
	);

	const tree = useMemo(() => buildTree(pages), [pages]);

	const handleSave = () => {
		if (selectedPageId) {
			onSelect(selectedPageId);
			setOpen(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent size="lg">
				<DialogHeader>Select Start Page</DialogHeader>
				<DialogBody>
					<Box
						border="1"
						borderColor="border.secondary"
						rounded="md"
						overflow="auto"
						style={{ maxHeight: "500px" }}
					>
						{tree.map((node) => (
							<PageTreeNode
								key={node.id}
								node={node}
								selectedPageId={selectedPageId}
								onSelectPage={setSelectedPageId}
							/>
						))}
					</Box>
				</DialogBody>
				<DialogFooter>
					<DialogClose asChild>
						<Button appearance="subtle">Cancel</Button>
					</DialogClose>
					<Button
						appearance="primary"
						onClick={handleSave}
						disabled={!selectedPageId}
					>
						Select
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
