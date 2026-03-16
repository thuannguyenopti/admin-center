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
	setPendingGeneration: (data: OpalGenerationData) => void;
	clearGeneration: () => void;
}

const OpalGenerationContext = createContext<OpalGenerationContextValue | null>(null);

export function OpalGenerationProvider({children}: {children: ReactNode}) {
	const [generationData, setGenerationData] = useState<OpalGenerationData | null>(null);

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

	const clearGeneration = useCallback(() => {
		if (generationData) {
			localStorage.removeItem(`opal_generation_${generationData.pageId}`);
		}
		setGenerationData(null);
	}, [generationData]);

	return (
		<OpalGenerationContext.Provider
			value={{generationData, setPendingGeneration, clearGeneration}}
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
