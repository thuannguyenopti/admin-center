"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	ReactNode,
} from "react";

type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";

type ThemeContextValue = {
	theme: Theme;
	preference: ThemePreference;
	mounted: boolean;
	setPreference: (next: ThemePreference) => void;
	toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const getSystemTheme = (): Theme =>
	window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";

const applyThemeToDocument = (newTheme: Theme) => {
	const html = document.documentElement;
	const body = document.body;

	if (newTheme === "dark") {
		html.setAttribute("data-theme", "dark");
		html.classList.add("dark");
		html.style.colorScheme = "dark";
		body.classList.add("dark");
		body.style.colorScheme = "dark";
	} else {
		html.removeAttribute("data-theme");
		html.classList.remove("dark");
		html.style.colorScheme = "light";
		body.classList.remove("dark");
		body.style.colorScheme = "light";
	}
};

function useThemeManager(): ThemeContextValue {
	const [theme, setTheme] = useState<Theme>("light");
	const [preference, setPreferenceState] = useState<ThemePreference>("system");
	const [mounted, setMounted] = useState(false);
	const preferenceRef = useRef<ThemePreference>("system");
	const themeRef = useRef<Theme>("light");

	const applyTheme = useCallback((next: Theme) => {
		themeRef.current = next;
		setTheme(next);
		applyThemeToDocument(next);
	}, []);

	const persistPreference = useCallback(
		(next: ThemePreference) => {
			preferenceRef.current = next;
			setPreferenceState(next);
			localStorage.setItem("theme", next);

			const resolvedTheme = next === "system" ? getSystemTheme() : next;
			applyTheme(resolvedTheme);
		},
		[applyTheme]
	);

	useEffect(() => {
		setMounted(true);
		const savedPreference =
			(localStorage.getItem("theme") as ThemePreference | null) ?? "system";
		preferenceRef.current = savedPreference;
		setPreferenceState(savedPreference);

		const initialTheme = savedPreference === "system" ? getSystemTheme() : savedPreference;
		applyTheme(initialTheme);

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = (event: MediaQueryListEvent) => {
			if (preferenceRef.current === "system") {
				const next = event.matches ? "dark" : "light";
				applyTheme(next);
			}
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [applyTheme]);

	const toggleTheme = useCallback(() => {
		const next = themeRef.current === "light" ? "dark" : "light";
		persistPreference(next);
	}, [persistPreference]);

	return useMemo(
		() => ({
			theme,
			preference,
			mounted,
			setPreference: persistPreference,
			toggleTheme,
		}),
		[theme, preference, mounted, persistPreference, toggleTheme]
	);
}

export function ThemeControllerProvider({children}: {children: ReactNode}) {
	const value = useThemeManager();
	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within ThemeControllerProvider");
	}
	return context;
}
