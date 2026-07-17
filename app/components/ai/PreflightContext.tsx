"use client";

import React, {createContext, useContext, useState, useCallback, useRef, ReactNode} from "react";
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
	registerScrollFunction: (fn: (elementId: string) => void) => void;
	scrollToField: (fieldId: string) => void;
}

const PreflightContext = createContext<PreflightContextValue | null>(null);

/**
 * Provider component for Preflight Audit context
 * Wraps the app to provide page data and callbacks to chat components
 */
export function PreflightProvider({children}: {children: ReactNode}) {
	const [contextData, setContextData] = useState<PreflightContextData | null>(null);
	const contextDataRef = useRef<PreflightContextData | null>(null);
	const scrollFunctionRef = useRef<((elementId: string) => void) | null>(null);

	const initializeContext = useCallback((data: PreflightContextData) => {
		console.log("[PreflightContext] Initializing context with data:", {
			fieldsCount: data.fields.length,
			mappingKeys: Object.keys(data.fieldToElementMap),
		});
		contextDataRef.current = data;
		setContextData(data);
	}, []);

	const clearContext = useCallback(() => {
		console.log("[PreflightContext] Clearing context");
		contextDataRef.current = null;
		setContextData(null);
	}, []);

	const registerScrollFunction = useCallback((fn: (elementId: string) => void) => {
		scrollFunctionRef.current = fn;
	}, []);

	const scrollToField = useCallback((fieldId: string) => {
		const currentData = contextDataRef.current;
		console.log("[PreflightContext] scrollToField called:", {
			fieldId,
			hasContextData: !!currentData,
			hasScrollFunction: !!scrollFunctionRef.current,
		});

		if (!currentData) {
			console.warn("[PreflightContext] No context data available");
			return;
		}

		const elementId = currentData.fieldToElementMap[fieldId];

		if (!elementId) {
			console.warn("[PreflightContext] No element mapping found for field:", fieldId);
			return;
		}

		if (!scrollFunctionRef.current) {
			console.warn("[PreflightContext] Scroll function not registered");
			return;
		}

		console.log("[PreflightContext] Calling scroll function with element:", elementId);
		scrollFunctionRef.current(elementId);
	}, []);

	return (
		<PreflightContext.Provider value={{contextData, initializeContext, clearContext, registerScrollFunction, scrollToField}}>
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
