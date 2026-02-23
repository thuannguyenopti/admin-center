"use client";

import VBPrototype from "@/app/components/VBPrototype";
import {useParams} from "next/navigation";
import {use} from "react";
import usePersistentState from "@/app/usePersistentState";
import {initialPages, Page} from "@/app/db/initialData";
import {useEffect, useState} from "react";
import {Box, Heading} from "@optiaxiom/react";
import {buildPageSlug} from "@/app/site/resolveSlug";
import {useVersionHistory} from "@/app/hooks/useVersionHistory";
import {ToastProvider} from "@/app/hooks/useToast";

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
	const versionHistory = useVersionHistory(id);

	useEffect(() => {
		if (pages && isHydrated) {
			const found = pages.find((p) => p.id === id);
			setPage(found || null);
		}
	}, [id, pages, isHydrated]);

	type PagePatch = {outlines?: any; properties?: any; variationId?: string};

	const handleSave = (patch: PagePatch) => {
		if (!page) return;

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
	};

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
		return <Box p="24">Loading...</Box>;
	}

	const handleViewOnWebsite = () => {
		if (!page) return;
		const slug = buildPageSlug(page, pages);
		const url = slug ? `/site/${slug}` : `/site`;
		window.open(url, "_blank");
	};

	return (
		<ToastProvider>
			<VBPrototype
				key={id}
				initialData={page}
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
			/>
		</ToastProvider>
	);
}
