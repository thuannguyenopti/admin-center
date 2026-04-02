"use client";

import VBPrototype from "@/app/components/VBPrototype";
import {useParams} from "next/navigation";
import {use} from "react";
import usePersistentState from "@/app/usePersistentState";
import {initialPages, Page, initialContentTypes, ContentType} from "@/app/db/initialData";
import {useEffect, useState, useCallback} from "react";
import {Alert, Badge, Box, Heading, Spinner, Text, toaster} from "@optiaxiom/react";
import Link from "next/link";
import {buildPageSlug} from "@/app/site/resolveSlug";
import {useVersionHistory} from "@/app/hooks/useVersionHistory";
import {useOpalPageGeneration} from "@/app/hooks/useOpalPageGeneration";
import {useOpalGeneration} from "@/app/context/OpalGenerationContext";
import ContentInstancePicker from "@/app/components/ContentInstancePicker";
import {initialContentInstances, ContentInstance} from "@/app/db/cmpInitialData";
import {connectInstanceToPage, syncPageWithInstance, disconnectPage, getCompatibleInstances} from "@/app/lib/contentConnection";

export default function EditPageDetail() {
	const params = useParams();
	const resolvedParams = params instanceof Promise ? use(params) : params;
	const id = (resolvedParams?.id ?? "") as string;
	const [pages, setPages, isHydrated] = usePersistentState("pages_v5", initialPages) as [
		Page[],
		any,
		boolean,
	];
	const [page, setPage] = useState<Page | null>(null);
	const [contentType, setContentType] = useState<ContentType | null>(null);
	const [renderKey, setRenderKey] = useState(0);
	const [hasPendingGeneration, setHasPendingGeneration] = useState(false);
	const versionHistory = useVersionHistory(id);

	// CMP Content Connection
	const [contentInstances] = usePersistentState("cmpContentInstances", initialContentInstances) as [ContentInstance[], any];
	const [contentTypes] = usePersistentState("contentTypes", initialContentTypes) as [ContentType[], any];
	const [isContentPickerOpen, setIsContentPickerOpen] = useState(false);

	// Check for pending generation immediately on mount
	useEffect(() => {
		const pendingData = localStorage.getItem(`opal_generation_${id}`);
		setHasPendingGeneration(!!pendingData);
	}, [id]);

	useEffect(() => {
		if (pages && isHydrated) {
			const found = pages.find((p) => p.id === id);
			setPage(found || null);

			// Load content type definition
			if (found?.contentTypeId) {
				const ct = contentTypes.find((ct) => ct.id === found.contentTypeId);
				setContentType(ct || null);
			}
		}
	}, [id, pages, isHydrated, contentTypes]);

	type PagePatch = {outlines?: any; properties?: any; variationId?: string};

	const handleSave = useCallback((patch: PagePatch) => {
		if (!page) {
			console.log("[handleSave] No page, skipping save");
			return;
		}

		console.log("[handleSave] Saving patch:", patch);

		const vid = patch.variationId || "original";

		// 1. Prepare Next State
		let nextVariations = page.variations ? [...page.variations] : [];
		let nextOutlines = page.outlines;
		let nextData = page.data;

		// Consolidated update logic: always update the variation in the array
		const idx = nextVariations.findIndex((v) => v.id === vid);
		if (idx !== -1) {
			nextVariations[idx] = {
				...nextVariations[idx],
				outlines: patch.outlines,
				data: patch.properties ?? nextVariations[idx].data,
			};

			// Also update page-level outlines if this is the original variation
			if (vid === "original" && patch.outlines !== undefined) {
				nextOutlines = patch.outlines;
			}
			// Update page-level data if properties were provided
			if (vid === "original" && patch.properties !== undefined) {
				nextData = patch.properties;
			}
		}

		const nextPage: Page = {
			...page,
			outlines: nextOutlines,
			variations: nextVariations,
			data: nextData,
			status: "Changed" as const,
		};

		setPages((prev: any[]) => prev.map((p) => (p.id === id ? nextPage : p)));

		setPage(nextPage);

		console.log("[handleSave] Saved successfully. Next page:", {
			outlinesCount: nextPage.outlines?.length,
			variationsCount: nextPage.variations?.length,
			firstVariationOutlinesCount: nextPage.variations?.[0]?.outlines?.length,
		});
	}, [page, id, setPages]);

	// CMP Content Connection Handlers
	const handleConnectInstance = useCallback((instance: ContentInstance | ContentInstance[]) => {
		if (!page) return;

		// Only handle single instance selection (not multi-select)
		const selectedInstance = Array.isArray(instance) ? instance[0] : instance;
		if (!selectedInstance) return;

		const connectedPage = connectInstanceToPage(
			selectedInstance,
			page,
			contentTypes
		);

		setPages((prev: Page[]) =>
			prev.map(p => p.id === page.id ? connectedPage : p)
		);

		setPage(connectedPage);
		setRenderKey(prev => prev + 1); // Force re-render to show updated data
		setIsContentPickerOpen(false);
		toaster.create("Content connected successfully", { intent: "success" });
	}, [page, setPages, contentTypes]);

	const handleSyncContent = useCallback(() => {
		if (!page) return;

		const syncedPage = syncPageWithInstance(
			page,
			contentInstances,
			contentTypes
		);

		if (syncedPage) {
			setPages((prev: Page[]) =>
				prev.map(p => p.id === page.id ? syncedPage : p)
			);
			setPage(syncedPage);
			setRenderKey(prev => prev + 1); // Force re-render to show updated data
			toaster.create("Content synced successfully", { intent: "success" });
		} else {
			toaster.create("Could not sync content - instance not found", { intent: "danger" });
		}
	}, [page, contentInstances, setPages, contentTypes]);

	const handleDisconnect = useCallback(() => {
		if (!page) return;

		const disconnectedPage = disconnectPage(page);

		setPages((prev: Page[]) =>
			prev.map(p => p.id === page.id ? disconnectedPage : p)
		);

		setPage(disconnectedPage);
		toaster.create("Content disconnected", { intent: "information" });
	}, [page, setPages]);

	const compatibleInstances = page ? getCompatibleInstances(page, contentInstances, contentTypes) : [];

	// Opal page generation hook (must be after handleSave is defined)
	const {isGenerating} = useOpalPageGeneration(
		id,
		page?.contentTypeId || "",
		handleSave
	);

	// Register page update handler and set active page for iteration
	const {setPageUpdateHandler, setActivePage, setPageDataGetter} = useOpalGeneration();
	useEffect(() => {
		setPageUpdateHandler(handleSave);
		setActivePage(id);

		// Provide a getter function that always returns fresh page data
		setPageDataGetter(() => {
			if (!page) return null;

			// Get outlines from the original variation or fallback to page.outlines
			const originalVariation = page.variations?.find(v => v.id === "original");
			const outlines = originalVariation?.outlines || page.outlines || [];

			return {
				outlines,
				variations: page.variations,
				data: page.data,
			};
		});

		return () => {
			setPageUpdateHandler(null);
			setActivePage(null);
			setPageDataGetter(null);
		};
	}, [setPageUpdateHandler, setActivePage, setPageDataGetter, handleSave, id, page]);

	// Clear hasPendingGeneration when actual generation starts
	useEffect(() => {
		if (isGenerating) {
			setHasPendingGeneration(false);
		}
	}, [isGenerating]);

	const handlePublish = () => {
		if (!page) return;

		// Create version snapshot before publishing
		// Get the current variation's data
		const currentVariation = page.variations?.find(v => v.id === "original") || null;
		const outlines = currentVariation?.outlines || page.outlines || [];
		const properties = currentVariation?.data || page.data || {};

		// Create version snapshot
		versionHistory.createVersion({
			author: "Current User", // TODO: Get from auth context
			status: "published",
			variationId: "original",
			variationName: "Original",
			isCurrent: true,
			changeSummary: "Published version",
			outlines: JSON.parse(JSON.stringify(outlines)), // Deep clone
			properties: JSON.parse(JSON.stringify(properties)), // Deep clone
		});

		// Update page status
		const updatedPages = pages.map((p) => {
			if (p.id === id) {
				return {...p, status: "Published"};
			}
			return p;
		});
		setPages(updatedPages);
	};

	const handleAddVariation = (payload: string | {name: string; outlines?: any[]; data?: any}) => {
		if (!page) return;
		const newId = `var-${Date.now()}`;

		let name = "";
		let sourceOutlines: any[] = [];
		let sourceData: any = {};

		if (typeof payload === "string") {
			name = payload;
			sourceOutlines = page.outlines ?? [];
			sourceData = page.data ?? {};
		} else {
			name = payload.name;
			sourceOutlines =
				payload.outlines && payload.outlines.length > 0
					? payload.outlines
					: (page.outlines ?? []);
			sourceData =
				payload.data && Object.keys(payload.data).length > 0
					? payload.data
					: (page.data ?? {});
		}

		// Deep copy and regenerate Outline IDs
		const initialData = JSON.parse(JSON.stringify(sourceData));
		const initialOutlines = (JSON.parse(JSON.stringify(sourceOutlines)) as any[]).map((o) => ({
			...o,
			id: `ol-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
		}));

		const newVariation = {
			id: newId,
			name,
			status: "Draft",
			outlines: initialOutlines,
			data: initialData,
		};

		const nextVariations = [...(page.variations || []), newVariation];
		const nextPage = {...page, variations: nextVariations};

		setPages((prev: any[]) => prev.map((p) => (p.id === id ? nextPage : p)));
		setPage(nextPage);
		return newId;
	};

	const handleDeleteVariation = (idToDelete: string) => {
		if (!page) return;

		const nextVariations = (page.variations || []).filter((v) => v.id !== idToDelete);
		const nextPage = {...page, variations: nextVariations};

		setPages((prev: any[]) => prev.map((p) => (p.id === id ? nextPage : p)));
		setPage(nextPage);
	};

	const handleRenameVariation = (idToRename: string, newName: string) => {
		if (!page) return;

		const nextVariations = (page.variations || []).map((v) => {
			if (v.id === idToRename) {
				return {...v, name: newName};
			}
			return v;
		});

		const nextPage = {...page, variations: nextVariations};

		setPages((prev: any[]) => prev.map((p) => (p.id === id ? nextPage : p)));
		setPage(nextPage);
	};

	const handleRenamePage = (newName: string) => {
		if (!page) return;
		const nextPage = {...page, name: newName};
		setPages((prev: any[]) => prev.map((p) => (p.id === id ? nextPage : p)));
		setPage(nextPage);
	};

	const handleTrash = () => {
		if (!page) return;
		const updatedPage = {...page, status: "In Trash" as const};
		setPages((prev: any[]) => prev.map((p) => (p.id === id ? updatedPage : p)));
		setPage(updatedPage);
	};

	const handleRestoreVersion = (version: any) => {
		if (!page) return;

		// Restore the version's content to the current page
		const variationId = version.variationId || "original";

		let nextVariations = page.variations ? [...page.variations] : [];
		let nextOutlines = page.outlines;
		let nextData = page.data;

		// Update the variation with the restored content
		if (variationId === "original") {
			nextOutlines = version.outlines;
			nextData = version.properties;
		} else {
			const idx = nextVariations.findIndex((v) => v.id === variationId);
			if (idx !== -1) {
				nextVariations[idx] = {
					...nextVariations[idx],
					outlines: version.outlines,
					data: version.properties,
				};
			}
		}

		const nextPage: Page = {
			...page,
			outlines: nextOutlines,
			variations: nextVariations,
			data: nextData,
			status: "Changed" as const,
		};

		setPages((prev: any[]) => prev.map((p) => (p.id === id ? nextPage : p)));
		setPage(nextPage);

		// Mark version as current in history
		versionHistory.markAsCurrent(version.id);

		console.log(`Restored version: ${version.id}`);
	};

	if (!isHydrated || !page) {
		// Show generation spinner if there's pending generation, otherwise show simple loading
		if (hasPendingGeneration) {
			return (
				<Box
					style={{height: "100%", width: "100%", position: "relative"}}
					bg="bg.page"
					display="flex"
					alignItems="center"
					justifyContent="center"
				>
					<Box
						display="flex"
						flexDirection="column"
						alignItems="center"
						gap="16"
						p="32"
						bg="bg.default"
						rounded="lg"
						shadow="lg"
						style={{border: "1px solid var(--ax-colors-border-default)"}}
					>
						<Spinner size="lg" />
						<Text fontSize="lg" fontWeight="500">
							Opal is generating your page...
						</Text>
						<Text fontSize="sm" color="fg.secondary">
							Please wait while we create your content
						</Text>
					</Box>
				</Box>
			);
		}
		return <Box p="24">Loading...</Box>;
	}

	const handleViewOnWebsite = () => {
		if (!page) return;
		const slug = buildPageSlug(page, pages);
		const url = slug ? `/site/${slug}` : `/site`;
		window.open(url, "_blank");
	};

	return (
		<>
			{/* Task Alert - show if page is part of a task */}
			{page?.cmpTaskMetadata && (
				<Box pl="24" pt="16" pr="12" pb="8" bg="bg.default">
					<Alert intent="information">
						<Box display="flex" alignItems="center" justifyContent="space-between" w="full">
							<Text>
								Part of task:{" "}
								<Link
									href={`/cmp/task/${page.cmpTaskMetadata.taskId}`}
									style={{
										color: "var(--ax-colors-fg-accent)",
										textDecoration: "underline",
										fontWeight: 600,
									}}
								>
									{page.cmpTaskMetadata.taskName}
								</Link>
							</Text>
							{page.cmpConnection && (
								<Badge intent="success">Connected to CMP</Badge>
							)}
						</Box>
					</Alert>
				</Box>
			)}

			<VBPrototype
				key={`${id}-${renderKey}`}
				initialData={page}
				contentType={contentType}
				onSave={handleSave}
				onPublish={handlePublish}
				pageName={page.name}
				pageId={page.id}
				pageStatus={page.status}
				variations={page.variations}
				onAddVariation={handleAddVariation}
				onDeleteVariation={handleDeleteVariation}
				onRenameVariation={handleRenameVariation}
				onRenamePage={handleRenamePage}
				onTrash={handleTrash}
				onViewOnWebsite={handleViewOnWebsite}
				versionHistory={versionHistory}
				onRestoreVersion={handleRestoreVersion}
				isOpalGenerating={isGenerating}
				hasPendingGeneration={hasPendingGeneration}
				onConnectContent={() => setIsContentPickerOpen(true)}
				onSyncContent={page?.cmpConnection ? handleSyncContent : undefined}
				onDisconnectContent={page?.cmpConnection ? handleDisconnect : undefined}
				hasConnection={!!page?.cmpConnection}
			/>

			<ContentInstancePicker
				open={isContentPickerOpen}
				onClose={() => setIsContentPickerOpen(false)}
				instances={compatibleInstances}
				onSelect={handleConnectInstance}
			/>
		</>
	);
}
