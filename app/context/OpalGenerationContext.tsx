"use client";

import {createContext, useContext, useState, useCallback, ReactNode, useRef} from "react";

export interface OpalGenerationData {
	pageId: string;
	instructions: string;
	contentTypeId: string;
	files?: File[];
}

export interface PagePatch {
	outlines?: any[];
	properties?: any;
	variationId?: string;
}

export interface PageStructure {
	outlines: any[];
	variations?: any[];
	data?: any;
}

interface OpalGenerationContextValue {
	generationData: OpalGenerationData | null;
	activePageId: string | null;
	setPendingGeneration: (data: OpalGenerationData) => void;
	setActivePage: (pageId: string | null) => void;
	clearGeneration: () => void;
	getCurrentPageData: () => PageStructure | null;
	onPageUpdate: ((patch: PagePatch) => void) | null;
	setPageUpdateHandler: (handler: ((patch: PagePatch) => void) | null) => void;
	setPageDataGetter: (getter: (() => PageStructure | null) | null) => void;
}

const OpalGenerationContext = createContext<OpalGenerationContextValue | null>(null);

export function OpalGenerationProvider({children}: {children: ReactNode}) {
	const [generationData, setGenerationData] = useState<OpalGenerationData | null>(null);
	const [activePageId, setActivePageId] = useState<string | null>(null);
	const [onPageUpdate, setOnPageUpdate] = useState<((patch: PagePatch) => void) | null>(null);
	const pageDataGetterRef = useRef<(() => PageStructure | null) | null>(null);

	const setPendingGeneration = useCallback((data: OpalGenerationData) => {
		// Store in both state and localStorage for persistence
		setGenerationData(data);
		localStorage.setItem(
			`opal_generation_${data.pageId}`,
			JSON.stringify({
				instructions: data.instructions,
				contentTypeId: data.contentTypeId,
			})
		);
	}, []);

	const setActivePage = useCallback((pageId: string | null) => {
		setActivePageId(pageId);
		if (pageId) {
			// Store in localStorage so it persists across reloads
			localStorage.setItem('opal_active_page', pageId);
		} else {
			localStorage.removeItem('opal_active_page');
		}
	}, []);

	const clearGeneration = useCallback(() => {
		if (generationData) {
			localStorage.removeItem(`opal_generation_${generationData.pageId}`);
		}
		setGenerationData(null);
		// Don't clear activePageId - keep it for iteration
	}, [generationData]);

	const setPageUpdateHandler = useCallback((handler: ((patch: PagePatch) => void) | null) => {
		setOnPageUpdate(() => handler);
	}, []);

	const setPageDataGetter = useCallback((getter: (() => PageStructure | null) | null) => {
		pageDataGetterRef.current = getter;
	}, []);

	const getCurrentPageData = useCallback(() => {
		return pageDataGetterRef.current ? pageDataGetterRef.current() : null;
	}, []);

	return (
		<OpalGenerationContext.Provider
			value={{
				generationData,
				activePageId,
				setPendingGeneration,
				setActivePage,
				clearGeneration,
				getCurrentPageData,
				onPageUpdate,
				setPageUpdateHandler,
				setPageDataGetter,
			}}
		>
			{children}
		</OpalGenerationContext.Provider>
	);
}

export function useOpalGeneration() {
	const context = useContext(OpalGenerationContext);
	if (!context) {
		throw new Error("useOpalGeneration must be used within OpalGenerationProvider");
	}
	return context;
}
