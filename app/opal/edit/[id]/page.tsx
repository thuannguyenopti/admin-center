"use client";

import VBPrototype from "@/app/components/VBPrototype";
import {useParams} from "next/navigation";
import {use} from "react";
import usePersistentState from "@/app/usePersistentState";
import {initialPages, Page, initialContentTypes, ContentType} from "@/app/db/initialData";
import {useEffect, useState, useCallback} from "react";
import {useLayout} from "@/app/context/LayoutContext";

export default function OpalEditPage() {
	const params = useParams();
	const resolvedParams = params instanceof Promise ? use(params) : params;
	const id = (resolvedParams?.id ?? "") as string;

	const [pages, setPages, isHydrated] = usePersistentState("pages_v5", initialPages) as [
		Page[],
		any,
		boolean,
	];
	const [contentTypes] = usePersistentState("contentTypes", initialContentTypes) as [
		ContentType[],
		any,
	];
	const [page, setPage] = useState<Page | null>(null);
	const [contentType, setContentType] = useState<ContentType | null>(null);

	useEffect(() => {
		if (pages && isHydrated) {
			const found = pages.find((p) => p.id === id);
			setPage(found || null);
			if (found?.contentTypeId) {
				const ct = contentTypes.find((ct) => ct.id === found.contentTypeId);
				setContentType(ct || null);
			}
		}
	}, [id, pages, isHydrated, contentTypes]);

	const handleSave = useCallback(
		(patch: any) => {
			if (!page) return;
			setPages((prev: Page[]) =>
				prev.map((p) => (p.id === id ? {...p, ...patch} : p))
			);
		},
		[page, id, setPages],
	);

	// Open Opal panel when arriving from the blog creation wizard
	const {opalPanelControls} = useLayout();
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		if (params.get("from") === "blog-create" && opalPanelControls) {
			opalPanelControls.openPanel();
		}
	}, [opalPanelControls]);

	if (!isHydrated || !page) return null;

	return (
		<VBPrototype
			key={id}
			initialData={page}
			contentType={contentType}
			onSave={handleSave}
			pageName={page.name}
			pageId={page.id}
			pageStatus={page.status}
			variations={page.variations}
		/>
	);
}
