"use client";

import React, {createContext, useContext, useState, useCallback, ReactNode} from "react";
import type {PageField} from "@/app/components/ai/PreflightAuditTypes";

/**
 * Context data for Preflight Audit
 * Provides page data and callbacks to Opal chat components
 */
export interface PreflightContextData {
	fields: PageField[];
	pageUrl: string;
	fieldToElementMap: Record<string, string>;
	onApplyField: (fieldId: string, suggestion: string) => void;
	onApplyAll: (changes: Array<{fieldId: string; suggestion: string}>) => void;
}

interface PreflightContextValue {
	contextData: PreflightContextData | null;
	initializeContext: (data: PreflightContextData) => void;
	clearContext: () => void;
}

const PreflightContext = createContext<PreflightContextValue | null>(null);

/**
 * Provider component for Preflight Audit context
 * Wraps the app to provide page data and callbacks to chat components
 */
export function PreflightProvider({children}: {children: ReactNode}) {
	const [contextData, setContextData] = useState<PreflightContextData | null>(null);

	const initializeContext = useCallback((data: PreflightContextData) => {
		setContextData(data);
	}, []);

	const clearContext = useCallback(() => {
		setContextData(null);
	}, []);

	return (
		<PreflightContext.Provider value={{contextData, initializeContext, clearContext}}>
			{children}
		</PreflightContext.Provider>
	);
}

/**
 * Hook to access Preflight context
 */
export function usePreflightContext() {
	const context = useContext(PreflightContext);
	if (!context) {
		throw new Error("usePreflightContext must be used within PreflightProvider");
	}
	return context;
}
