"use client";

import { useEffect } from "react";

export function HydrationErrorSuppressor() {
    useEffect(() => {
        // Store the original console.error and console.warn
        const originalError = console.error;
        const originalWarn = console.warn;

        // Override console.error to filter out Radix UI and React hydration warnings
        console.error = (...args: any[]) => {
            // Convert all arguments to strings for checking
            const errorString = args.join(' ').toString().toLowerCase();

            // Filter out specific Radix UI and React hydration warnings
            if (
                errorString.includes("hydration") ||
                errorString.includes("hydrating") ||
                errorString.includes("aria-controls") ||
                errorString.includes("aria-expanded") ||
                errorString.includes("aria-haspopup") ||
                errorString.includes("aria-labelledby") ||
                errorString.includes("data-state") ||
                errorString.includes("data-radix") ||
                errorString.includes("htmlfor") ||
                errorString.includes("radix-") ||
                errorString.includes("radix_") ||
                errorString.includes("radix__") ||
                errorString.includes("radix-r_") ||
                errorString.includes("tree hydrated but some attributes") ||
                errorString.includes("server rendered html") ||
                errorString.includes("client properties") ||
                errorString.includes("server-rendered html") ||
                errorString.includes("did not match") ||
                errorString.includes("didn't match") ||
                errorString.includes("params are being enumerated") ||
                errorString.includes("params is a promise")
            ) {
                // Suppress these specific errors
                return;
            }

            // Call the original console.error for other errors
            originalError(...args);
        };

        // Also suppress warnings
        console.warn = (...args: any[]) => {
            const warnString = args.join(' ').toString().toLowerCase();

            if (
                warnString.includes("hydration") ||
                warnString.includes("radix") ||
                warnString.includes("aria-")
            ) {
                return;
            }

            originalWarn(...args);
        };

        // Cleanup: restore original console methods when component unmounts
        return () => {
            console.error = originalError;
            console.warn = originalWarn;
        };
    }, []);

    return null;
}
