"use client";

import { useEffect } from "react";

export function HydrationErrorSuppressor() {
    useEffect(() => {
        // Store the original console.error
        const originalError = console.error;

        // Override console.error to filter out Radix UI hydration warnings
        console.error = (...args: any[]) => {
            // Check if this is a hydration error
            const errorMessage = args[0]?.toString() || "";

            // Filter out specific Radix UI hydration warnings
            if (
                errorMessage.includes("Hydration failed") ||
                errorMessage.includes("There was an error while hydrating") ||
                errorMessage.includes("aria-controls") ||
                errorMessage.includes("aria-expanded") ||
                errorMessage.includes("aria-haspopup") ||
                errorMessage.includes("data-state")
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
