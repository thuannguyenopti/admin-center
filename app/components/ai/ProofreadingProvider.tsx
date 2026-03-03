"use client";

import React, {createContext, useContext, useRef, useState, ReactNode} from "react";

export interface GrammarError {
	type: "grammar" | "spelling";
	start: number;
	end: number;
	message: string;
	suggestion: string;
	severity?: "error" | "warning" | "info";
	errorText?: string;
}

interface ProofreadingContextValue {
	isEnabled: boolean;
	setEnabled: (enabled: boolean) => void;
	checkGrammar: (text: string) => Promise<GrammarError[]>;
	isChecking: boolean;
}

const ProofreadingContext = createContext<ProofreadingContextValue | undefined>(undefined);

export function useProofreadingContext() {
	const context = useContext(ProofreadingContext);
	if (!context) {
		throw new Error("useProofreadingContext must be used within ProofreadingProvider");
	}
	return context;
}

interface ProofreadingProviderProps {
	children: ReactNode;
}

export function ProofreadingProvider({children}: ProofreadingProviderProps) {
	const [isEnabled, setEnabled] = useState(true);
	const [isChecking, setIsChecking] = useState(false);

	// Cache for grammar check results (text hash → errors)
	const grammarCache = useRef<Map<string, GrammarError[]>>(new Map());

	// Simple hash function for cache keys
	const hashText = (text: string): string => {
		let hash = 0;
		for (let i = 0; i < text.length; i++) {
			const char = text.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return hash.toString();
	};

	const checkGrammar = async (text: string): Promise<GrammarError[]> => {
		if (!isEnabled || !text || text.trim().length < 10) {
			return [];
		}

		// Check cache first
		const cacheKey = hashText(text);
		if (grammarCache.current.has(cacheKey)) {
			return grammarCache.current.get(cacheKey)!;
		}

		setIsChecking(true);

		try {
			const response = await fetch("/api/proofreading/check", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({text}),
			});

			if (!response.ok) {
				console.error("Grammar check failed:", response.statusText);
				return [];
			}

			const data = await response.json();
			const errors: GrammarError[] = data.errors || [];

			// Update cache (limit to 50 entries)
			if (grammarCache.current.size >= 50) {
				const firstKey = grammarCache.current.keys().next().value;
				grammarCache.current.delete(firstKey);
			}
			grammarCache.current.set(cacheKey, errors);

			return errors;
		} catch (error) {
			console.error("Grammar check error:", error);
			return [];
		} finally {
			setIsChecking(false);
		}
	};

	return (
		<ProofreadingContext.Provider
			value={{
				isEnabled,
				setEnabled,
				checkGrammar,
				isChecking,
			}}
		>
			{children}
		</ProofreadingContext.Provider>
	);
}
