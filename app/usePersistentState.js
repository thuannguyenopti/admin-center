"use client";
import {useState, useEffect} from "react";

function usePersistentState(key, defaultValue) {
	const [state, setState] = useState(defaultValue); // Start with default value
	const [isHydrated, setIsHydrated] = useState(false); // Track hydration status

	useEffect(() => {
		// On the client side, read from localStorage and update the state
		try {
			const storedValue = localStorage.getItem(key);
			if (storedValue) {
				setState(JSON.parse(storedValue));
			}
		} catch (error) {
			console.error(`Error reading key "${key}" from localStorage:`, error);
		}
		setIsHydrated(true); // Mark hydration complete
	}, [key]);

	useEffect(() => {
		// Sync state to localStorage
		if (isHydrated) {
			try {
				if (state === undefined || state === null) {
					localStorage.removeItem(key); // Clean up invalid values
				} else {
					localStorage.setItem(key, JSON.stringify(state));
				}
			} catch (error) {
				console.error(`Error saving key "${key}" to localStorage:`, error);
			}
		}
	}, [key, state, isHydrated]);

	return [state, setState, isHydrated];
}

export default usePersistentState;
