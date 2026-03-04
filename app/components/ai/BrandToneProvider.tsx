"use client";

import React, {createContext, useContext, useState, useCallback} from "react";
import {BrandTonePanel, BrandToneResult} from "./BrandTonePanel";

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
		onApplyField?: (fieldId: string, suggestion: string) => void,
		onApplyAll?: (changes: Array<{fieldId: string; suggestion: string}>) => void
	) => Promise<void>;
	isAnalyzing: boolean;
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
	const [isPanelOpen, setIsPanelOpen] = useState(false);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [result, setResult] = useState<BrandToneResult | null>(null);
	const [onApplyCallback, setOnApplyCallback] = useState<((suggestion: string, fieldId?: string) => void) | undefined>();
	const [onApplyAllCallback, setOnApplyAllCallback] = useState<((changes: Array<{fieldId: string; suggestion: string}>) => void) | undefined>();

	const analyzeText = useCallback(async (
		text: string,
		context: "property" | "page" = "property",
		onApply?: (suggestion: string, fieldId?: string) => void
	) => {
		console.log("[BrandTone] Starting analysis for:", context);
		setIsAnalyzing(true);
		setIsPanelOpen(true);
		setResult(null);
		setOnApplyCallback(() => onApply);
		setOnApplyAllCallback(undefined);

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
		onApplyField?: (fieldId: string, suggestion: string) => void,
		onApplyAll?: (changes: Array<{fieldId: string; suggestion: string}>) => void
	) => {
		console.log("[BrandTone] Starting page analysis for", fields.length, "fields");
		setIsAnalyzing(true);
		setIsPanelOpen(true);
		setResult(null);
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
			setIsPanelOpen(false);
		}
	}, [onApplyCallback]);

	return (
		<BrandToneContext.Provider value={{analyzeText, analyzePage, isAnalyzing}}>
			{children}
			<BrandTonePanel
				open={isPanelOpen}
				onOpenChange={setIsPanelOpen}
				result={result}
				isLoading={isAnalyzing}
				onApply={onApplyCallback ? handleApply : undefined}
				onApplyAll={onApplyAllCallback}
			/>
		</BrandToneContext.Provider>
	);
}
