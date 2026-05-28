"use client";

import {Box, Heading, SearchInput, Menu, MenuContent, MenuTrigger, EllipsisMenuButton} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Button} from "@/app/components/Button";
import {IconFilter, IconChevronRight, IconChevronDown, IconFile, IconPlus, IconPencil, IconFolderPlus, IconFilePlus, IconCut, IconCopy, IconClipboard, IconArrowUp, IconArrowDown, IconTrash, IconHome} from "@tabler/icons-react";
import {Table, Tr, Th, Td} from "@/app/components/Table";
import Item from "@/app/components/Item";
import {Flex} from "@/app/components/Flex";
import usePersistentState from "@/app/usePersistentState";
import {initialPages, Page, initialContentTypes, initialApplications, Application, canCreateChildType} from "@/app/db/initialData";
import {useState, useMemo, useEffect} from "react";
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

const PageRow = ({
	node,
	level = 0,
	startPageId,
	onCut,
	onCopy,
	onPaste,
	onMoveUp,
	onMoveDown,
	onDragStart,
	onDrop,
	onPageClick,
	selectedPageIds,
	clipboard,
	isDragging,
	allPages,
}: {
	node: PageNode;
	level?: number;
	startPageId?: string;
	onCut?: (pageId?: string) => void;
	onCopy?: (pageId?: string) => void;
	onPaste?: (targetParentId: string) => void;
	onMoveUp?: (pageId: string) => void;
	onMoveDown?: (pageId: string) => void;
	onDragStart?: (pageId: string) => void;
	onDrop?: (targetPageId: string, position?: 'before' | 'inside' | 'after') => void;
	onPageClick?: (pageId: string, event: React.MouseEvent) => void;
	selectedPageIds?: string[];
	clipboard?: {pageIds: string[]; operation: 'cut' | 'copy'} | null;
	isDragging?: boolean;
	allPages?: Page[];
}) => {
	const router = useRouter();
	const [expanded, setExpanded] = useState(true);
	const [dropPosition, setDropPosition] = useState<'before' | 'inside' | 'after' | null>(null);
	const hasChildren = node.children.length > 0;
	const isStartPage = startPageId === node.id;
	const isSelected = selectedPageIds?.includes(node.id) ?? false;
	const isInClipboard = clipboard?.pageIds.includes(node.id) ?? false;

	// Check if pasting would create a circular reference
	const isDescendantOf = (pageId: string, ancestorId: string): boolean => {
		if (!allPages) return false;
		const page = allPages.find(p => p.id === pageId);
		if (!page || !page.parentId) return false;
		if (page.parentId === ancestorId) return true;
		return isDescendantOf(page.parentId, ancestorId);
	};

	// Check if a content type can be a child of this node's content type
	const canDropHere = (draggedPageIds: string[]): boolean => {
		if (!allPages) return false;

		// Check if all dragged pages can be dropped here
		return draggedPageIds.every(pageId => {
			const draggedPage = allPages.find(p => p.id === pageId);
			if (!draggedPage) return false;

			// Use helper function to validate content type restrictions
			return canCreateChildType(node.contentTypeId, draggedPage.contentTypeId);
		});
	};

	const wouldCreateCircularReference = clipboard?.pageIds.some(
		pageId => pageId === node.id || isDescendantOf(node.id, pageId)
	) ?? false;

	const canPasteHere = clipboard && clipboard.pageIds.length > 0 && canDropHere(clipboard.pageIds);

	const menuOptions = [
		...(isStartPage
			? [
					{
						addon: <IconHome size={16} />,
						label: "Edit Application",
						execute: () => router.push("/cms/settings/applications/mosey-bank/settings"),
					},
					{
						addon: <IconPencil size={16} />,
						label: "Rename",
						execute: () => console.log("Rename", node.id),
					},
					{
						addon: <IconFilePlus size={16} />,
						label: "Create child",
						execute: () => console.log("Create child", node.id),
					},
			  ]
			: [
					{
						addon: <IconPencil size={16} />,
						label: "Rename",
						execute: () => console.log("Rename", node.id),
					},
					{
						addon: <IconFilePlus size={16} />,
						label: "Create child",
						execute: () => console.log("Create child", node.id),
					},
			  ]),
		{
			addon: <IconCut size={16} />,
			label: isSelected && (selectedPageIds?.length ?? 0) > 1 ? `Cut (${selectedPageIds?.length} items)` : "Cut",
			execute: () => onCut?.(isSelected ? undefined : node.id),
			group: {
				separator: true,
				label: "clipboard",
				hidden: true,
			},
		},
		{
			addon: <IconCopy size={16} />,
			label: isSelected && (selectedPageIds?.length ?? 0) > 1 ? `Copy (${selectedPageIds?.length} items)` : "Copy",
			execute: () => onCopy?.(isSelected ? undefined : node.id),
			group: {
				separator: true,
				label: "clipboard",
				hidden: true,
			},
		},
		{
			addon: <IconClipboard size={16} />,
			label: "Paste",
			execute: () => onPaste?.(node.id),
			disabled: !clipboard || clipboard.pageIds.length === 0 || wouldCreateCircularReference || !canPasteHere,
			group: {
				separator: true,
				label: "clipboard",
				hidden: true,
			},
		},
		{
			addon: <IconArrowUp size={16} />,
			label: "Move up",
			execute: () => onMoveUp?.(node.id),
			group: {
				separator: true,
				label: "move",
				hidden: true,
			},
		},
		{
			addon: <IconArrowDown size={16} />,
			label: "Move down",
			execute: () => onMoveDown?.(node.id),
			group: {
				separator: true,
				label: "move",
				hidden: true,
			},
		},
		{
			addon: <IconTrash size={16} />,
			intent: "danger" as const,
			label: "Delete",
			execute: () => console.log("Delete", node.id),
			group: {
				separator: true,
				label: "delete",
				hidden: true,
			},
		},
	];

	const handleDragStart = (e: React.DragEvent) => {
		e.stopPropagation();
		e.dataTransfer.effectAllowed = 'move';

		// If this node is selected along with others, drag all selected items
		if (isSelected && (selectedPageIds?.length ?? 0) > 1) {
			e.dataTransfer.setData('text/html', JSON.stringify(selectedPageIds));

			// Create drag preview showing the selected pages
			const dragImage = document.createElement('div');
			dragImage.style.position = 'absolute';
			dragImage.style.top = '-10000px';
			dragImage.style.left = '0';
			dragImage.style.backgroundColor = 'var(--ax-colors-bg-default)';
			dragImage.style.border = '1px solid var(--ax-colors-border-secondary)';
			dragImage.style.borderRadius = '6px';
			dragImage.style.padding = '8px';
			dragImage.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
			dragImage.style.minWidth = '200px';
			dragImage.style.maxWidth = '300px';

			// Show first 3 pages and count if more
			const selectedPageIdsList = selectedPageIds?.slice(0, 3) || [];
			const remainingCount = (selectedPageIds?.length || 0) - selectedPageIdsList.length;

			selectedPageIdsList.forEach((pageId, index) => {
				// Look up the page from allPages
				const page = allPages?.find(p => p.id === pageId);
				const pageName = page?.name || 'Page';

				const row = document.createElement('div');
				row.style.display = 'flex';
				row.style.alignItems = 'center';
				row.style.gap = '8px';
				row.style.padding = '4px 8px';
				row.style.fontSize = '13px';
				row.style.color = 'var(--ax-colors-fg-default)';
				if (index > 0) {
					row.style.borderTop = '1px solid var(--ax-colors-border-tertiary)';
					row.style.marginTop = '4px';
					row.style.paddingTop = '8px';
				}

				// Icon
				const icon = document.createElement('span');
				icon.innerHTML = '📄';
				icon.style.fontSize = '14px';
				row.appendChild(icon);

				// Page name
				const name = document.createElement('span');
				name.textContent = pageName;
				name.style.fontWeight = '500';
				row.appendChild(name);

				dragImage.appendChild(row);
			});

			// Show count badge if more than 3
			if (remainingCount > 0) {
				const badge = document.createElement('div');
				badge.style.marginTop = '8px';
				badge.style.padding = '4px 8px';
				badge.style.backgroundColor = 'var(--ax-colors-bg-accent-subtle)';
				badge.style.color = 'var(--ax-colors-fg-accent)';
				badge.style.borderRadius = '4px';
				badge.style.fontSize = '12px';
				badge.style.fontWeight = '500';
				badge.style.textAlign = 'center';
				badge.textContent = `+${remainingCount} more`;
				dragImage.appendChild(badge);
			}

			document.body.appendChild(dragImage);
			e.dataTransfer.setDragImage(dragImage, 0, 0);
			setTimeout(() => document.body.removeChild(dragImage), 0);
		} else {
			e.dataTransfer.setData('text/html', node.id);
			onDragStart?.(node.id);
		}
	};

	const handleDragEnd = (e: React.DragEvent) => {
		e.stopPropagation();
		setDropPosition(null);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();

		// Check if we can drop here based on content type restrictions
		const draggedIds = selectedPageIds && selectedPageIds.length > 0 ? selectedPageIds : [];
		if (draggedIds.length > 0 && !canDropHere(draggedIds)) {
			e.dataTransfer.dropEffect = 'none';
			setDropPosition(null);
			return;
		}

		// Determine drop position based on mouse Y position
		const rect = e.currentTarget.getBoundingClientRect();
		const y = e.clientY - rect.top;
		const height = rect.height;

		const threshold = 8; // pixels from top/bottom for before/after

		if (y < threshold) {
			setDropPosition('before');
		} else if (y > height - threshold) {
			setDropPosition('after');
		} else {
			setDropPosition('inside');
		}

		e.dataTransfer.dropEffect = 'move';
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDropPosition(null);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const position = dropPosition;
		setDropPosition(null);
		onDrop?.(node.id, position || 'inside');
	};

	return (
		<>
			<tr
				draggable
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={(e: React.MouseEvent) => {
					// Don't handle clicks on interactive elements
					if ((e.target as HTMLElement).closest('button, a, [role="menuitem"]')) {
						return;
					}

					// Handle multi-select
					if (e.shiftKey || e.metaKey || e.ctrlKey) {
						e.preventDefault();
						e.stopPropagation();
						onPageClick?.(node.id, e);
					} else {
						// Normal click - navigate and select single
						onPageClick?.(node.id, e);
						router.push(`/cms/edit/${node.id}`);
					}
				}}
				className="relative cursor-pointer hover:bg-[var(--ax-colors-bg-default-hovered)]"
				style={{
					opacity: isInClipboard && clipboard?.operation === 'cut' ? 0.5 : 1,
					backgroundColor: isSelected
						? 'var(--ax-colors-bg-accent-subtle)'
						: dropPosition === 'inside'
							? 'var(--ax-colors-bg-accent-subtle)'
							: undefined,
					borderTop: dropPosition === 'before' ? '2px solid var(--ax-colors-border-accent)' : undefined,
					borderBottom: dropPosition === 'after' ? '2px solid var(--ax-colors-border-accent)' : undefined,
				}}
			>
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
			</tr>
			{expanded &&
				node.children.map((child) => (
					<PageRow
						key={child.id}
						node={child}
						level={level + 1}
						startPageId={startPageId}
						onCut={onCut}
						onCopy={onCopy}
						onPaste={onPaste}
						onMoveUp={onMoveUp}
						onMoveDown={onMoveDown}
						onDragStart={onDragStart}
						onDrop={onDrop}
						onPageClick={onPageClick}
						selectedPageIds={selectedPageIds}
						clipboard={clipboard}
						isDragging={isDragging}
						allPages={allPages}
					/>
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

	const { startPage, outOfScopeRoots } = buildTree(pages, startPageId);

	// Selection state for multi-select
	const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
	const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

	// Clipboard state for cut/copy/paste
	const [clipboard, setClipboard] = useState<{pageIds: string[]; operation: 'cut' | 'copy'} | null>(null);
	const [draggedPageId, setDraggedPageId] = useState<string | null>(null);

	const handleCreatePage = (newPage: Page) => {
		setPages([...pages, newPage]);
	};

	// Handle page selection
	const handlePageClick = (pageId: string, event: React.MouseEvent) => {
		if (event.shiftKey && lastSelectedId) {
			// Shift-click: select range
			const allPageIds = pages.map(p => p.id);
			const lastIndex = allPageIds.indexOf(lastSelectedId);
			const currentIndex = allPageIds.indexOf(pageId);

			if (lastIndex !== -1 && currentIndex !== -1) {
				const start = Math.min(lastIndex, currentIndex);
				const end = Math.max(lastIndex, currentIndex);
				const rangeIds = allPageIds.slice(start, end + 1);
				setSelectedPageIds(rangeIds);
			}
		} else if (event.metaKey || event.ctrlKey) {
			// Cmd/Ctrl-click: toggle selection
			setSelectedPageIds(prev =>
				prev.includes(pageId)
					? prev.filter(id => id !== pageId)
					: [...prev, pageId]
			);
			setLastSelectedId(pageId);
		} else {
			// Normal click: select single
			setSelectedPageIds([pageId]);
			setLastSelectedId(pageId);
		}
	};

	// Cut operation
	const handleCut = (pageId?: string) => {
		const idsToUse = pageId ? [pageId] : selectedPageIds;
		if (idsToUse.length === 0) return;
		setClipboard({ pageIds: idsToUse, operation: 'cut' });
	};

	// Copy operation
	const handleCopy = (pageId?: string) => {
		const idsToUse = pageId ? [pageId] : selectedPageIds;
		if (idsToUse.length === 0) return;
		setClipboard({ pageIds: idsToUse, operation: 'copy' });
	};

	// Paste operation
	const handlePaste = (targetParentId: string) => {
		if (!clipboard || clipboard.pageIds.length === 0) return;

		// Prevent pasting a page onto itself
		if (clipboard.pageIds.includes(targetParentId)) {
			console.log("Cannot paste a page onto itself");
			return;
		}

		// Check if the target content type allows these child content types
		const targetPage = pages.find(p => p.id === targetParentId);
		if (targetPage) {
			// Check both parent-side and child-side restrictions
			const allAllowed = clipboard.pageIds.every(pageId => {
				const clipboardPage = pages.find(p => p.id === pageId);
				if (!clipboardPage) return false;

				// Use helper function to validate content type restrictions
				return canCreateChildType(targetPage.contentTypeId, clipboardPage.contentTypeId);
			});

			if (!allAllowed) {
				console.log("Cannot paste: content type restrictions not met");
				return;
			}
		}

		// Prevent pasting into a descendant (circular reference check)
		const isDescendant = (pageId: string, ancestorId: string): boolean => {
			const page = pages.find(p => p.id === pageId);
			if (!page || !page.parentId) return false;
			if (page.parentId === ancestorId) return true;
			return isDescendant(page.parentId, ancestorId);
		};

		const hasCircularReference = clipboard.pageIds.some(pageId =>
			isDescendant(targetParentId, pageId)
		);

		if (hasCircularReference) {
			console.log("Cannot paste into a descendant of the selected pages");
			return;
		}

		if (clipboard.operation === 'cut') {
			// Move the pages
			const updatedPages = pages.map(page =>
				clipboard.pageIds.includes(page.id)
					? { ...page, parentId: targetParentId }
					: page
			);
			setPages(updatedPages);
			setClipboard(null);
			setSelectedPageIds([]);
		} else {
			// Copy the pages (create new ones)
			const sourcePages = pages.filter(p => clipboard.pageIds.includes(p.id));
			const newPages = sourcePages.map((sourcePage, index) => ({
				...sourcePage,
				id: `page-${Date.now()}-${index}`,
				name: `${sourcePage.name} (Copy)`,
				parentId: targetParentId,
				lastModified: new Date().toISOString(),
			}));
			setPages([...pages, ...newPages]);
			setClipboard(null);
		}
	};

	// Move page up or down in the same parent
	const handleMoveUp = (pageId: string) => {
		const page = pages.find(p => p.id === pageId);
		if (!page) return;

		const siblings = pages.filter(p => p.parentId === page.parentId);
		const currentIndex = siblings.findIndex(p => p.id === pageId);

		if (currentIndex > 0) {
			// Swap with previous sibling
			const prevSibling = siblings[currentIndex - 1];
			const updatedPages = pages.map(p => {
				if (p.id === pageId) return { ...prevSibling, id: pageId, name: page.name, contentTypeId: page.contentTypeId };
				if (p.id === prevSibling.id) return { ...page, id: prevSibling.id, name: prevSibling.name, contentTypeId: prevSibling.contentTypeId };
				return p;
			});
			// This is a simple swap - in reality you'd want to use an order field
			console.log("Move up:", pageId);
		}
	};

	const handleMoveDown = (pageId: string) => {
		const page = pages.find(p => p.id === pageId);
		if (!page) return;

		const siblings = pages.filter(p => p.parentId === page.parentId);
		const currentIndex = siblings.findIndex(p => p.id === pageId);

		if (currentIndex < siblings.length - 1) {
			// Swap with next sibling
			console.log("Move down:", pageId);
		}
	};

	// Handle drop
	const handleDrop = (targetPageId: string, position: 'before' | 'inside' | 'after' = 'inside') => {
		// Determine which pages are being dragged
		const pagesToMove = selectedPageIds.length > 0 ? selectedPageIds : (draggedPageId ? [draggedPageId] : []);

		if (pagesToMove.length === 0 || pagesToMove.includes(targetPageId)) {
			setDraggedPageId(null);
			return;
		}

		const targetPage = pages.find(p => p.id === targetPageId);

		if (!targetPage) {
			setDraggedPageId(null);
			return;
		}

		// For 'inside' position, check content type restrictions
		if (position === 'inside') {
			// Check both parent-side and child-side restrictions
			const allAllowed = pagesToMove.every(pageId => {
				const draggedPage = pages.find(p => p.id === pageId);
				if (!draggedPage) return false;

				// Use helper function to validate content type restrictions
				return canCreateChildType(targetPage.contentTypeId, draggedPage.contentTypeId);
			});

			if (!allAllowed) {
				console.log("Cannot drop: content type restrictions not met");
				setDraggedPageId(null);
				return;
			}
		}

		// Prevent dropping a page into its own descendant
		const isDescendant = (pageId: string, ancestorId: string): boolean => {
			const page = pages.find(p => p.id === pageId);
			if (!page || !page.parentId) return false;
			if (page.parentId === ancestorId) return true;
			return isDescendant(page.parentId, ancestorId);
		};

		// Check if any of the pages being moved would create a circular reference
		const hasCircularReference = pagesToMove.some(pageId => isDescendant(targetPageId, pageId));

		if (hasCircularReference) {
			console.log("Cannot drop a page into its own descendant");
			setDraggedPageId(null);
			return;
		}

		// Determine the new parent and order based on position
		let updatedPages = [...pages];

		if (position === 'inside') {
			// Move as children of target
			updatedPages = pages.map(page =>
				pagesToMove.includes(page.id)
					? { ...page, parentId: targetPageId }
					: page
			);
		} else {
			// Move as siblings (before or after target)
			const newParentId = targetPage.parentId;

			// Get all siblings of the target (including target itself)
			const siblings = pages.filter(p => p.parentId === newParentId && !pagesToMove.includes(p.id));

			// Find target index in siblings array
			const targetIndex = siblings.findIndex(p => p.id === targetPageId);

			// Calculate insert position
			const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;

			// Update parent of dragged pages
			const movedPages = pagesToMove.map(pageId => {
				const page = pages.find(p => p.id === pageId)!;
				return { ...page, parentId: newParentId };
			});

			// Insert moved pages at the correct position among siblings
			siblings.splice(insertIndex, 0, ...movedPages);

			// Get all pages that are not siblings of the target (keep their original order)
			const otherPages = pages.filter(p => p.parentId !== newParentId && !pagesToMove.includes(p.id));

			// Combine: other pages + reordered siblings
			updatedPages = [...otherPages, ...siblings];
		}

		setPages(updatedPages);
		setDraggedPageId(null);
		setSelectedPageIds([]);
	};

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Only handle keyboard shortcuts when there are selected pages
			if (selectedPageIds.length === 0) return;

			// Check if we're in an input/textarea
			const target = e.target as HTMLElement;
			if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
				return;
			}

			// Use metaKey for Mac, ctrlKey for others
			const modifierKey = e.metaKey || e.ctrlKey;

			if (modifierKey) {
				switch (e.key.toLowerCase()) {
					case 'x':
						e.preventDefault();
						handleCut();
						break;
					case 'c':
						e.preventDefault();
						handleCopy();
						break;
					case 'v':
						e.preventDefault();
						// For paste, we need a target - use the first selected page's parent
						if (clipboard && clipboard.pageIds.length > 0 && selectedPageIds.length > 0) {
							const firstSelectedPage = pages.find(p => p.id === selectedPageIds[0]);
							if (firstSelectedPage?.parentId) {
								handlePaste(firstSelectedPage.parentId);
							}
						}
						break;
				}
			}

			// Delete key
			if (e.key === 'Delete' || e.key === 'Backspace') {
				e.preventDefault();
				console.log('Delete selected pages:', selectedPageIds);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [selectedPageIds, clipboard, pages]);

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
					{startPage ? (
						<>
							<PageRow
								node={startPage}
								startPageId={startPageId}
								onCut={handleCut}
								onCopy={handleCopy}
								onPaste={handlePaste}
								onMoveUp={handleMoveUp}
								onMoveDown={handleMoveDown}
								onDragStart={setDraggedPageId}
								onDrop={handleDrop}
								onPageClick={handlePageClick}
								selectedPageIds={selectedPageIds}
								clipboard={clipboard}
								isDragging={!!draggedPageId}
								allPages={pages}
							/>

							{/* Out of scope pages */}
							{outOfScopeRoots.length > 0 && (
								<>
									<tr>
										<td colSpan={5} style={{ padding: 0, borderTop: "1px solid var(--ax-colors-border-tertiary)" }}>
											<Box py="8" px="12" bg="bg.secondary">
												<Text fontSize="sm" fontWeight="500" color="fg.tertiary">
													Out of Scope (Not under application start page)
												</Text>
											</Box>
										</td>
									</tr>
									{outOfScopeRoots.map((node) => (
										<PageRow
											key={node.id}
											node={node}
											startPageId={startPageId}
											onCut={handleCut}
											onCopy={handleCopy}
											onPaste={handlePaste}
											onMoveUp={handleMoveUp}
											onMoveDown={handleMoveDown}
											onDragStart={setDraggedPageId}
											onDrop={handleDrop}
											onPageClick={handlePageClick}
											selectedPageIds={selectedPageIds}
											clipboard={clipboard}
											isDragging={!!draggedPageId}
											allPages={pages}
										/>
									))}
								</>
							)}
						</>
					) : (
						// No start page configured - show all pages
						outOfScopeRoots.map((node) => (
							<PageRow
								key={node.id}
								node={node}
								startPageId={startPageId}
								onCut={handleCut}
								onCopy={handleCopy}
								onPaste={handlePaste}
								onMoveUp={handleMoveUp}
								onMoveDown={handleMoveDown}
								onDragStart={setDraggedPageId}
								onDrop={handleDrop}
								onPageClick={handlePageClick}
								selectedPageIds={selectedPageIds}
								clipboard={clipboard}
								isDragging={!!draggedPageId}
								allPages={pages}
							/>
						))
					)}
				</tbody>
			</Table>
		</Box>
	);
}
