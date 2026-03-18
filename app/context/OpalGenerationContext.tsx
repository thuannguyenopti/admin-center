"use client";

import {createContext, useContext, useState, useCallback, ReactNode} from "react";

export interface OpalGenerationData {
	pageId: string;
	instructions: string;
	contentTypeId: string;
	files?: File[];
}

interface OpalGenerationContextValue {
	generationData: OpalGenerationData | null;
	activePageId: string | null; // Track the currently active/generated page for iteration
	currentPageData: any | null; // Current page structure (outlines, elements, etc.)
	setPendingGeneration: (data: OpalGenerationData) => void;
	setActivePage: (pageId: string | null) => void;
	setCurrentPageData: (data: any) => void;
	clearGeneration: () => void;
	onPageUpdate: ((patch: {outlines?: any; properties?: any; variationId?: string}) => void) | null;
	setPageUpdateHandler: (handler: ((patch: {outlines?: any; properties?: any; variationId?: string}) => void) | null) => void;
}

const OpalGenerationContext = createContext<OpalGenerationContextValue | null>(null);

export function OpalGenerationProvider({children}: {children: ReactNode}) {
	const [generationData, setGenerationData] = useState<OpalGenerationData | null>(null);
	const [activePageId, setActivePageId] = useState<string | null>(null);
	const [currentPageData, setCurrentPageData] = useState<any | null>(null);
	const [onPageUpdate, setOnPageUpdate] = useState<((patch: {outlines?: any; properties?: any; variationId?: string}) => void) | null>(null);

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

	const setPageUpdateHandler = useCallback((handler: ((patch: {outlines?: any; properties?: any; variationId?: string}) => void) | null) => {
		setOnPageUpdate(() => handler);
	}, []);

	return (
		<OpalGenerationContext.Provider
			value={{generationData, activePageId, currentPageData, setPendingGeneration, setActivePage, setCurrentPageData, clearGeneration, onPageUpdate, setPageUpdateHandler}}
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
