"use client";

import {Box, Heading, SearchInput, Menu, MenuContent, MenuTrigger, EllipsisMenuButton} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Button} from "@/app/components/Button";
import {IconFilter, IconChevronRight, IconChevronDown, IconFile, IconPlus, IconPencil, IconFolderPlus, IconFilePlus, IconCut, IconCopy, IconClipboard, IconArrowUp, IconArrowDown, IconTrash} from "@tabler/icons-react";
import {Table, Tr, Th, Td} from "@/app/components/Table";
import Item from "@/app/components/Item";
import {Flex} from "@/app/components/Flex";
import usePersistentState from "@/app/usePersistentState";
import {initialPages, Page} from "@/app/db/initialData";
import {useState} from "react";
import {CreatePageDialog} from "./CreatePageDialog";

type PageNode = Page & {children: PageNode[]};

const buildTree = (pages: Page[]) => {
	const map = new Map<string, PageNode>();
	const roots: PageNode[] = [];

	pages.forEach((page) => {
		map.set(page.id, {...page, children: []});
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

const getStatusIntent = (status: string) => {
	switch (status) {
		case "Changed":
		case "Draft":
			return "warning";
		case "Scheduled":
		case "In Review":
			return "primary";
		case "Published":
			return "success";
		case "Expired":
		case "Scheduled to expire":
			return "danger";
		case "Archived":
		case "In Trash":
			return "neutral";
		default:
			return "neutral";
	}
};

const PageRow = ({node, level = 0}: {node: PageNode; level?: number}) => {
	const [expanded, setExpanded] = useState(true);
	const hasChildren = node.children.length > 0;

	const menuOptions = [
		{
			addon: <IconPencil size={16} />,
			label: "Rename",
			onSelect: () => console.log("Rename", node.id),
		},
		{
			addon: <IconFilePlus size={16} />,
			label: "Create child",
			onSelect: () => console.log("Create child", node.id),
		},
		{
			addon: <IconCut size={16} />,
			group: {
				separator: true,
			},
			label: "Cut",
			onSelect: () => console.log("Cut", node.id),
		},
		{
			addon: <IconCopy size={16} />,
			label: "Copy",
			onSelect: () => console.log("Copy", node.id),
		},
		{
			addon: <IconClipboard size={16} />,
			label: "Paste",
			onSelect: () => console.log("Paste", node.id),
		},
		{
			addon: <IconArrowUp size={16} />,
			group: {
				separator: true,
			},
			label: "Move up",
			onSelect: () => console.log("Move up", node.id),
		},
		{
			addon: <IconArrowDown size={16} />,
			label: "Move down",
			onSelect: () => console.log("Move down", node.id),
		},
		{
			addon: <IconTrash size={16} />,
			group: {
				separator: true,
			},
			intent: "danger" as const,
			label: "Delete",
			onSelect: () => console.log("Delete", node.id),
		},
	];

	return (
		<>
			<Tr url={`/cms/edit/${node.id}`}>
				<Td type="header">
					<Flex gap="8" style={{paddingLeft: level * 24}}>
						{hasChildren ? (
							<Box
								onClick={(e) => {
									e.stopPropagation();
									setExpanded(!expanded);
								}}
								cursor="pointer"
								p="4"
							>
								{expanded ? (
									<Box h="16" alignItems="center" display="flex">
										<Button
											size="sm"
											appearance="subtle"
											icon={<IconChevronDown size={16} />}
											aria-label="Collapse section"
										/>
									</Box>
								) : (
									<Box h="16" alignItems="center" display="flex">
										<Button
											size="sm"
											appearance="subtle"
											icon={<IconChevronRight size={16} />}
											aria-label="Expand section"
										/>
									</Box>
								)}
							</Box>
						) : (
							<Box w="32" />
						)}
						<Item icon={<IconFile size={16} />} title={node.name} />
					</Flex>
				</Td>
				<Td>Page</Td>
				<Td>{node.lastModified}</Td>
				<Td type="badge" data={getStatusIntent(node.status)}>
					{node.status}
				</Td>
				<Td>
					<Box
						onClick={(e) => {
							e.stopPropagation();
						}}
					>
						<Menu options={menuOptions}>
							<MenuTrigger asChild>
								<EllipsisMenuButton appearance="subtle" aria-label="Page options" />
							</MenuTrigger>
							<MenuContent />
						</Menu>
					</Box>
				</Td>
			</Tr>
			{expanded &&
				node.children.map((child) => (
					<PageRow key={child.id} node={child} level={level + 1} />
				))}
		</>
	);
};

export default function EditPage() {
	const [pages, , isHydrated] = usePersistentState("pages_v5", initialPages) as [
		Page[],
		any,
		boolean,
	];
	const tree = buildTree(pages);

	// Create root node containing all top-level nodes
	const rootNode: PageNode = {
		id: "root",
		name: "Root",
		parentId: null,
		status: "Published",
		lastModified: new Date().toISOString(),
		contentTypeId: "folder",
		children: tree,
	};

	if (!isHydrated) {
		return <Box p="24">Loading...</Box>;
	}

	return (
		<Box p="24" h="full" overflow="auto">
			<Heading level="3" mb="16">
				Edit pages
			</Heading>
			<Text mb="24" color="fg.secondary">
				Select pages from the content tree to view or modify their content.
			</Text>
			<Flex mb="24" gap="8" justifyContent="space-between">
				<Flex gap="8">
					<SearchInput size="lg" placeholder="Search content..." />
					<Button aria-label="Filter content" icon={<IconFilter />} />
				</Flex>
				<CreatePageDialog pages={pages}>
					<Button appearance="primary">
						Create Page
					</Button>
				</CreatePageDialog>
			</Flex>
			<Table>
				<thead>
					<Tr>
						<Th>
							<Box ml="40">Name</Box>
						</Th>
						<Th>Type</Th>
						<Th>Last Modified</Th>
						<Th>Status</Th>
						<Th></Th>
					</Tr>
				</thead>
				<tbody>
					<PageRow node={rootNode} />
				</tbody>
			</Table>
		</Box>
	);
}
