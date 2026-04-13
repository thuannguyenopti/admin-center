"use client";

import {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
} from "react";

export type ExperimentResultsContextType = {
	optimizationId: string | null;
	setExperimentContext: (optimizationId: string | null) => void;
};

const ExperimentResultsContext = createContext<ExperimentResultsContextType | undefined>(undefined);

export function ExperimentResultsProvider({ children }: { children: ReactNode }) {
	const [optimizationId, setOptimizationId] = useState<string | null>(null);
	const setExperimentContext = useCallback((id: string | null) => {
		setOptimizationId(id);
	}, []);

	const value: ExperimentResultsContextType = {
		optimizationId,
		setExperimentContext,
	};

	return (
		<ExperimentResultsContext.Provider value={value}>
			{children}
		</ExperimentResultsContext.Provider>
	);
}

export function useExperimentResultsContext(): ExperimentResultsContextType {
	const context = useContext(ExperimentResultsContext);
	if (context === undefined) {
		throw new Error("useExperimentResultsContext must be used within ExperimentResultsProvider");
	}
	return context;
}
