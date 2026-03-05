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
	const scrollFunctionRef = useRef<((elementId: string) => void) | null>(null);

	const initializeContext = useCallback((data: PreflightContextData) => {
		setContextData(data);
	}, []);

	const clearContext = useCallback(() => {
		setContextData(null);
	}, []);

	const registerScrollFunction = useCallback((fn: (elementId: string) => void) => {
		console.log("[PreflightContext] Scroll function registered");
		scrollFunctionRef.current = fn;
	}, []);

	const scrollToField = useCallback((fieldId: string) => {
		console.log("[PreflightContext] scrollToField called:", {
			fieldId,
			hasContextData: !!contextData,
			hasScrollFunction: !!scrollFunctionRef.current,
		});

		if (!contextData) {
			console.warn("[PreflightContext] No context data available");
			return;
		}

		const elementId = contextData.fieldToElementMap[fieldId];

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
	}, [contextData]);

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
