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
	const [pages, setPages, isHydrated] = usePersistentState("pages", initialPages) as [
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

	type PagePatch = {outlines?: any; properties?: any};

	const handleSave = (patch: PagePatch) => {
		if (!page) return;

		const nextPage: Page = {
			...page,
			// merge the outlines + properties directly into the page
			outlines: patch.outlines ?? page.outlines,
			data: patch.properties ?? page.data,
			status: "Changed" as const, // keep union literal type
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

	if (!isHydrated || !page) {
		return <Box p="24">Loading...</Box>;
	}

	return (
		<VBPrototype
			initialData={page}
			onSave={handleSave}
			onPublish={handlePublish}
			pageName={page.name}
			pageStatus={page.status}
		/>
	);
}
