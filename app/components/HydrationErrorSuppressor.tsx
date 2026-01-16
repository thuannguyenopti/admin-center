"use client";

import { useEffect } from "react";

export function HydrationErrorSuppressor() {
    useEffect(() => {
        // Store the original console.error
        const originalError = console.error;

        // Override console.error to filter out Radix UI hydration warnings
        console.error = (...args: any[]) => {
            // Convert all arguments to strings for checking
            const errorString = args.join(' ').toString();

            // Filter out specific Radix UI and React hydration warnings
            if (
                errorString.includes("Hydration failed") ||
                errorString.includes("There was an error while hydrating") ||
                errorString.includes("hydrating") ||
                errorString.includes("aria-controls") ||
                errorString.includes("aria-expanded") ||
                errorString.includes("aria-haspopup") ||
                errorString.includes("data-state") ||
                errorString.includes("htmlFor") ||
                errorString.includes("radix-") ||
                errorString.includes("A tree hydrated but some attributes") ||
                errorString.includes("server rendered HTML didn't match")
            ) {
                // Suppress these specific errors
                return;
            }

            // Call the original console.error for other errors
            originalError(...args);
        };

        // Cleanup: restore original console.error when component unmounts
        return () => {
            console.error = originalError;
        };
    }, []);

    return null;
}
