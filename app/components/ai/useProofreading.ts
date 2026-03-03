"use client";

import {useEffect, useRef, useState} from "react";
import {useProofreadingContext, type GrammarError} from "./ProofreadingProvider";

const GRAMMAR_CHECK_DELAY = 800; // ms
const MIN_CHECK_INTERVAL = 2000; // ms - throttle checks
const MIN_TEXT_LENGTH = 10;

interface UseProofreadingResult {
	errors: GrammarError[];
	isChecking: boolean;
	checkNow: () => void;
	dismissError: (index: number) => void;
}

export function useProofreading(value: string): UseProofreadingResult {
	const {checkGrammar, isChecking: globalIsChecking} = useProofreadingContext();
	const [errors, setErrors] = useState<GrammarError[]>([]);
	const [isChecking, setIsChecking] = useState(false);

	const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastCheckTime = useRef<number>(0);
	const lastCheckedValue = useRef<string>("");

	const performCheck = async () => {
		const now = Date.now();

		// Throttling: skip if checked too recently
		if (now - lastCheckTime.current < MIN_CHECK_INTERVAL) {
			return;
		}

		// Skip if text too short or unchanged
		if (value.trim().length < MIN_TEXT_LENGTH || value === lastCheckedValue.current) {
			return;
		}

		lastCheckTime.current = now;
		lastCheckedValue.current = value;

		setIsChecking(true);
		try {
			const result = await checkGrammar(value);
			setErrors(result);
		} catch (error) {
			console.error("Grammar check failed:", error);
			setErrors([]);
		} finally {
			setIsChecking(false);
		}
	};

	// Debounced grammar check on value change
	useEffect(() => {
		// Clear existing timer
		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current);
		}

		// Skip check for empty or very short text
		if (!value || value.trim().length < MIN_TEXT_LENGTH) {
			setErrors([]);
			return;
		}

		// Set new timer
		debounceTimer.current = setTimeout(() => {
			performCheck();
		}, GRAMMAR_CHECK_DELAY);

		// Cleanup
		return () => {
			if (debounceTimer.current) {
				clearTimeout(debounceTimer.current);
			}
		};
	}, [value]);

	const checkNow = () => {
		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current);
		}
		performCheck();
	};

	const dismissError = (index: number) => {
		setErrors((prev) => prev.filter((_, i) => i !== index));
	};

	return {
		errors,
		isChecking: isChecking || globalIsChecking,
		checkNow,
		dismissError,
	};
}
