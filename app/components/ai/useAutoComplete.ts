"use client";

import { useEffect, useRef, useState } from "react";

const AUTO_COMPLETE_DELAY = 1500; // ms - trigger after 1.5s pause
const MIN_TEXT_LENGTH = 15; // Only suggest for longer text

interface UseAutoCompleteResult {
	completion: string;
	isLoading: boolean;
	clearCompletion: () => void;
}

export function useAutoComplete(
	value: string,
	enabled: boolean = true
): UseAutoCompleteResult {
	const [completion, setCompletion] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastCheckedValue = useRef<string>("");
	const abortController = useRef<AbortController | null>(null);

	const fetchCompletion = async (text: string) => {
		// Cancel any existing request
		if (abortController.current) {
			abortController.current.abort();
		}

		abortController.current = new AbortController();

		console.log("[useAutoComplete] Fetching completion for:", text);
		setIsLoading(true);

		try {
			const response = await fetch("/api/ai/complete", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ text, maxTokens: 30 }),
				signal: abortController.current.signal,
			});

			if (!response.ok) {
				console.error("[useAutoComplete] API error:", response.statusText);
				setCompletion("");
				return;
			}

			const data = await response.json();
			console.log("[useAutoComplete] Received completion:", data.completion);
			setCompletion(data.completion || "");
			lastCheckedValue.current = text;
		} catch (error: any) {
			if (error.name === "AbortError") {
				console.log("[useAutoComplete] Request aborted");
			} else {
				console.error("[useAutoComplete] Error:", error);
			}
			setCompletion("");
		} finally {
			setIsLoading(false);
		}
	};

	// Debounced auto-completion
	useEffect(() => {
		// Clear existing timer
		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current);
		}

		// Clear completion when value changes (user is typing)
		if (completion) {
			setCompletion("");
		}

		// Skip if disabled, empty, too short, or unchanged
		if (
			!enabled ||
			!value ||
			value.trim().length < MIN_TEXT_LENGTH ||
			value === lastCheckedValue.current
		) {
			return;
		}

		console.log("[useAutoComplete] Setting debounce timer");

		// Set new timer
		debounceTimer.current = setTimeout(() => {
			fetchCompletion(value);
		}, AUTO_COMPLETE_DELAY);

		// Cleanup
		return () => {
			if (debounceTimer.current) {
				clearTimeout(debounceTimer.current);
			}
		};
	}, [value, enabled]);

	const clearCompletion = () => {
		setCompletion("");
		if (abortController.current) {
			abortController.current.abort();
		}
	};

	return {
		completion,
		isLoading,
		clearCompletion,
	};
}
