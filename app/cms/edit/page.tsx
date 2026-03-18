"use client";

import {Box, Heading, SearchInput, Menu, MenuContent, MenuTrigger, EllipsisMenuButton} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Button} from "@/app/components/Button";
import {IconFilter, IconChevronRight, IconChevronDown, IconFile, IconPlus, IconPencil, IconFolderPlus, IconFilePlus, IconCut, IconCopy, IconClipboard, IconArrowUp, IconArrowDown, IconTrash, IconHome} from "@tabler/icons-react";
import {Table, Tr, Th, Td} from "@/app/components/Table";
import Item from "@/app/components/Item";
import {Flex} from "@/app/components/Flex";
import usePersistentState from "@/app/usePersistentState";
import {initialPages, Page, initialContentTypes, initialApplications, Application} from "@/app/db/initialData";
import {useState, useMemo} from "react";
import {useRouter} from "next/navigation";
import {CreatePageDialog} from "./CreatePageDialog";

type PageNode = Page & {children: PageNode[]};

const buildTree = (pages: Page[], startPageId?: string) => {
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

	// If we have a start page, restructure to make it the primary root
	if (startPageId) {
		const startPage = map.get(startPageId);
		if (startPage) {
			// Get all descendants of the start page
			const isDescendantOf = (nodeId: string, ancestorId: string): boolean => {
				const node = map.get(nodeId);
				if (!node || !node.parentId) return false;
				if (node.parentId === ancestorId) return true;
				return isDescendantOf(node.parentId, ancestorId);
			};

			// Separate in-scope and out-of-scope pages
			const outOfScopeRoots = roots.filter(
				(node) => node.id !== startPageId && !isDescendantOf(node.id, startPageId)
			);

			return { startPage, outOfScopeRoots };
		}
	}

	return { startPage: null, outOfScopeRoots: roots };
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

const getContentTypeName = (contentTypeId: string) => {
	const contentType = initialContentTypes.find((ct) => ct.id === contentTypeId);
	return contentType?.displayName || contentType?.name || contentTypeId;
};

const PageRow = ({node, level = 0, startPageId}: {node: PageNode; level?: number; startPageId?: string}) => {
	const router = useRouter();
	const [expanded, setExpanded] = useState(true);
	const hasChildren = node.children.length > 0;
	const isStartPage = startPageId === node.id;

	const menuOptions = [
		...(isStartPage
			? [
					{
						addon: <IconHome size={16} />,
						label: "Edit Application",
						onSelect: () => router.push("/cms/settings/applications/mosey-bank/settings"),
					},
					{
						addon: <IconPencil size={16} />,
						label: "Rename",
						onSelect: () => console.log("Rename", node.id),
						group: {
							separator: true,
							label: "",
						},
					},
			  ]
			: [
					{
						addon: <IconPencil size={16} />,
						label: "Rename",
						onSelect: () => console.log("Rename", node.id),
					},
			  ]),
		{
			addon: <IconFilePlus size={16} />,
			label: "Create child",
			onSelect: () => console.log("Create child", node.id),
		},
		{
			addon: <IconCut size={16} />,
			group: {
				separator: true,
				label: "",
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
				label: "",
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
				label: "",
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
						<Item icon={isStartPage ? <IconHome size={16} /> : <IconFile size={16} />} title={node.name} />
					</Flex>
				</Td>
				<Td>{getContentTypeName(node.contentTypeId)}</Td>
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
					<PageRow key={child.id} node={child} level={level + 1} startPageId={startPageId} />
				))}
		</>
	);
};

export default function EditPage() {
	const [pages, setPages, isHydrated] = usePersistentState("pages_v5", initialPages) as [
		Page[],
		(pages: Page[]) => void,
		boolean,
	];
	const [savedApplications] = usePersistentState("applications", initialApplications) as [
		Application[],
		(value: Application[]) => void,
		boolean,
	];

	const applications = useMemo(() => {
		if (!savedApplications) return initialApplications;
		const savedMap = new Map(savedApplications.map((app) => [app.id, app]));
		initialApplications.forEach((app) => {
			if (!savedMap.has(app.id)) {
				savedMap.set(app.id, app);
			}
		});
		return Array.from(savedMap.values());
	}, [savedApplications]);

	// Get the start page ID from the first application (for now)
	const startPageId = applications[0]?.startPageId;

	const tree = buildTree(pages);

	const handleCreatePage = (newPage: Page) => {
		setPages([...pages, newPage]);
	};

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
				<CreatePageDialog pages={pages} onCreatePage={handleCreatePage}>
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
					<PageRow node={rootNode} startPageId={startPageId} />
				</tbody>
			</Table>
		</Box>
	);
}
