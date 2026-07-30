<<<<<<< HEAD
"use client";

import { useEffect } from "react";

// Store the original console.error and console.warn outside so they bind immediately
if (typeof window !== "undefined") {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
        const errorString = args.join(' ').toString().toLowerCase();
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
            return;
        }
        originalError(...args);
    };

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
}

export function HydrationErrorSuppressor() {
    return null;
}
=======
"use client";

import { useEffect } from "react";

// Store the original console.error and console.warn outside so they bind immediately
if (typeof window !== "undefined") {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
        const errorString = args.join(' ').toString().toLowerCase();
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
            errorString.includes("icon only") ||
            errorString.includes("tree hydrated but some attributes") ||
            errorString.includes("server rendered html") ||
            errorString.includes("client properties") ||
            errorString.includes("server-rendered html") ||
            errorString.includes("did not match") ||
            errorString.includes("didn't match") ||
            errorString.includes("params are being enumerated") ||
            errorString.includes("params is a promise")
        ) {
            return;
        }
        originalError(...args);
    };

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
}

export function HydrationErrorSuppressor() {
    return null;
}
>>>>>>> origin/main
