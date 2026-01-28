"use client";

import VBPrototype from "@/app/components/VBPrototype";
import {useParams} from "next/navigation";
import {use} from "react";
import usePersistentState from "@/app/usePersistentState";
import {initialPages, Page} from "@/app/db/initialData";
import {useEffect, useState} from "react";
import {Box, Heading} from "@optiaxiom/react";

export default function EditPageDetail() {
	const params = useParams();
	const resolvedParams = params instanceof Promise ? use(params) : params;
	const id = (resolvedParams?.id ?? "") as string;
	const [pages, setPages, isHydrated] = usePersistentState("pages_v3", initialPages) as [
		Page[],
		any,
		boolean,
	];
	const [page, setPage] = useState<Page | null>(null);

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

	if (!isHydrated || !page) {
		return <Box p="24">Loading...</Box>;
	}

	return (
		<VBPrototype
			key={id}
			initialData={page}
			onSave={handleSave}
			onPublish={handlePublish}
			pageName={page.name}
			pageStatus={page.status}
			variations={page.variations}
			onAddVariation={handleAddVariation}
			onDeleteVariation={handleDeleteVariation}
			onRenameVariation={handleRenameVariation}
			onRenamePage={handleRenamePage}
			onTrash={handleTrash}
		/>
	);
}
