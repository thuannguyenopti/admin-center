"use client";

import React, {createContext, useContext, useState, useCallback, useRef} from "react";
import {BrandToneSidePanel, BrandToneResult} from "./BrandToneSidePanel";
import {Aside} from "@/app/context/LayoutContext";
import {toaster} from "@optiaxiom/react";

interface PageField {
	fieldId: string;
	fieldLabel: string;
	text: string;
}

interface BrandToneContextValue {
	analyzeText: (
		text: string,
		context?: "property" | "page",
		onApply?: (suggestion: string, fieldId?: string) => void
	) => Promise<void>;
	analyzePage: (
		fields: PageField[],
		fieldToElementMap: Record<string, string>,
		onApplyField?: (fieldId: string, suggestion: string) => void,
		onApplyAll?: (changes: Array<{fieldId: string; suggestion: string}>) => void
	) => Promise<void>;
	isAnalyzing: boolean;
	registerScrollFunction: (fn: (elementId: string) => void) => void;
}

const BrandToneContext = createContext<BrandToneContextValue | null>(null);

export function useBrandTone() {
	const context = useContext(BrandToneContext);
	if (!context) {
		throw new Error("useBrandTone must be used within BrandToneProvider");
	}
	return context;
}

export function BrandToneProvider({children}: {children: React.ReactNode}) {
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [result, setResult] = useState<BrandToneResult | null>(null);
	const [onApplyCallback, setOnApplyCallback] = useState<((suggestion: string, fieldId?: string) => void) | undefined>();
	const [onApplyAllCallback, setOnApplyAllCallback] = useState<((changes: Array<{fieldId: string; suggestion: string}>) => void) | undefined>();
	const [fieldToElementMap, setFieldToElementMap] = useState<Record<string, string>>({});
	const scrollFunctionRef = useRef<((elementId: string) => void) | null>(null);

	const registerScrollFunction = useCallback((fn: (elementId: string) => void) => {
		console.log("[BrandToneProvider] Scroll function registered");
		scrollFunctionRef.current = fn;
	}, []);

	const analyzeText = useCallback(async (
		text: string,
		context: "property" | "page" = "property",
		onApply?: (suggestion: string, fieldId?: string) => void
	) => {
		console.log("[BrandTone] Starting analysis for:", context);
		setIsAnalyzing(true);
		setResult(null);
		setOnApplyCallback(() => onApply);
		setOnApplyAllCallback(undefined);
		setFieldToElementMap({});

		try {
			const response = await fetch("/api/ai/brand-tone", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({text, context}),
			});

			if (!response.ok) {
				console.error("[BrandTone] API error:", response.statusText);
				throw new Error("Failed to analyze brand tone");
			}

			const data = await response.json();
			console.log("[BrandTone] Analysis complete:", data);
			setResult(data);
		} catch (error) {
			console.error("[BrandTone] Error:", error);
			// Show error in panel
			setResult({
				score: 0,
				issues: [],
				summary: "Failed to analyze. Please try again.",
				strengths: [],
			});
		} finally {
			setIsAnalyzing(false);
		}
	}, []);

	const analyzePage = useCallback(async (
		fields: PageField[],
		fieldToElementMap: Record<string, string>,
		onApplyField?: (fieldId: string, suggestion: string) => void,
		onApplyAll?: (changes: Array<{fieldId: string; suggestion: string}>) => void
	) => {
		console.log("[BrandTone] Starting page analysis for", fields.length, "fields");
		setIsAnalyzing(true);
		setResult(null);
		setFieldToElementMap(fieldToElementMap);
		setOnApplyCallback(onApplyField ? (suggestion, fieldId) => {
			if (fieldId) {
				onApplyField(fieldId, suggestion);
			}
		} : undefined);
		setOnApplyAllCallback(() => onApplyAll);

		try {
			const response = await fetch("/api/ai/brand-tone", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({context: "page", fields}),
			});

			if (!response.ok) {
				console.error("[BrandTone] API error:", response.statusText);
				throw new Error("Failed to analyze brand tone");
			}

			const data = await response.json();
			console.log("[BrandTone] Page analysis complete:", data);
			setResult(data);
		} catch (error) {
			console.error("[BrandTone] Error:", error);
			// Show error in panel
			setResult({
				score: 0,
				issues: [],
				summary: "Failed to analyze. Please try again.",
				strengths: [],
			});
		} finally {
			setIsAnalyzing(false);
		}
	}, []);

	const handleApply = useCallback((suggestion: string, fieldId?: string) => {
		if (onApplyCallback) {
			onApplyCallback(suggestion, fieldId);
			toaster.create("Suggestion applied", { intent: "success" });
		}
	}, [onApplyCallback]);

	const handleApplyAll = useCallback((changes: Array<{fieldId: string; suggestion: string}>) => {
		if (onApplyAllCallback) {
			onApplyAllCallback(changes);
			toaster.create(`Applied ${changes.length} change${changes.length !== 1 ? "s" : ""}`, { intent: "success" });
		}
	}, [onApplyAllCallback]);

	const handleSelectField = useCallback((fieldId: string) => {
		console.log("[BrandToneProvider] handleSelectField called:", {
			fieldId,
			mappingKeys: Object.keys(fieldToElementMap),
			mapping: fieldToElementMap,
			hasScrollFunction: !!scrollFunctionRef.current,
		});

		const elementId = fieldToElementMap[fieldId];

		if (!elementId) {
			console.warn("[BrandToneProvider] No element mapping found for field:", fieldId, "Available keys:", Object.keys(fieldToElementMap));
			return;
		}

		if (!scrollFunctionRef.current) {
			console.warn("[BrandToneProvider] Scroll function not registered");
			return;
		}

		console.log("[BrandToneProvider] Calling scroll function with element:", elementId);
		scrollFunctionRef.current(elementId);
	}, [fieldToElementMap]);

	const handleClose = useCallback(() => {
		setResult(null);
		setIsAnalyzing(false);
	}, []);

	return (
		<BrandToneContext.Provider value={{analyzeText, analyzePage, isAnalyzing, registerScrollFunction}}>
			{children}
			{(isAnalyzing || result) && (
				<Aside>
					<BrandToneSidePanel
						result={result}
						isLoading={isAnalyzing}
						onClose={handleClose}
						onApply={onApplyCallback ? handleApply : undefined}
						onApplyAll={onApplyAllCallback ? handleApplyAll : undefined}
						onSelectField={handleSelectField}
					/>
				</Aside>
			)}
		</BrandToneContext.Provider>
	);
}
