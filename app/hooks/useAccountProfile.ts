"use client";

import { useEffect, useState } from "react";

export type AccountProfile = {
	avatarDataUrl: string | null;
	firstName: string;
	lastName: string;
	email: string;
	jobTitle: string;
	department: string;
	phone: string;
	timezone: string;
	language: string;
	userType: "Local" | "SSO";
	authType: "Local" | "SSO";
	lastLogin: string;
};

export const DEFAULT_ACCOUNT_PROFILE: AccountProfile = {
	avatarDataUrl: null,
	firstName: "Aamr",
	lastName: "Fakhry",
	email: "aamr.fakhry@optimizely.com",
	jobTitle: "Senior Product Manager",
	department: "Product",
	phone: "+1 (555) 123-4567",
	timezone: "America/New_York",
	language: "English (US)",
	userType: "SSO",
	authType: "SSO",
	lastLogin: "Today at 9:15 AM",
};

export const ACCOUNT_PROFILE_STORAGE_KEY = "account_profile";

/** Fallback static avatar shown before localStorage hydrates or when avatarDataUrl is null. */
export const FALLBACK_AVATAR_SRC = "/avatars/aamr-fakhry.png";

// --- Shared module-level store: every useAccountProfile() consumer reads from
// the same in-memory copy and subscribes to changes. Without this, each hook
// instance has its own React state and updates in one component (e.g. the
// Account page) don't propagate to others (e.g. GlobalBar) without a reload.

let memoryProfile: AccountProfile | null = null;
const listeners = new Set<(p: AccountProfile) => void>();

function readFromStorage(): AccountProfile {
	if (memoryProfile) return memoryProfile;
	if (typeof window === "undefined") return DEFAULT_ACCOUNT_PROFILE;
	let parsed: AccountProfile = DEFAULT_ACCOUNT_PROFILE;
	try {
		const stored = window.localStorage.getItem(ACCOUNT_PROFILE_STORAGE_KEY);
		if (stored) {
			parsed = { ...DEFAULT_ACCOUNT_PROFILE, ...JSON.parse(stored) };
		}
	} catch {
		// ignore parse errors and fall through to default
	}
	memoryProfile = parsed;
	return parsed;
}

function writeToStorage(next: AccountProfile) {
	memoryProfile = next;
	if (typeof window !== "undefined") {
		try {
			window.localStorage.setItem(
				ACCOUNT_PROFILE_STORAGE_KEY,
				JSON.stringify(next),
			);
		} catch {
			// localStorage may be unavailable (private mode, quota) — keep
			// the in-memory update so the UI still reflects the change.
		}
	}
	listeners.forEach((l) => l(next));
}

export function useAccountProfile() {
	// Start with the default for SSR; swap to the persisted value after mount
	// to avoid hydration mismatches.
	const [profile, setProfileState] = useState<AccountProfile>(
		DEFAULT_ACCOUNT_PROFILE,
	);
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		setProfileState(readFromStorage());
		setIsHydrated(true);

		const listener = (next: AccountProfile) => setProfileState(next);
		listeners.add(listener);

		// Cross-tab sync — when another tab updates the profile via localStorage,
		// pick it up here too.
		const onStorage = (e: StorageEvent) => {
			if (e.key !== ACCOUNT_PROFILE_STORAGE_KEY) return;
			memoryProfile = null; // invalidate so readFromStorage re-parses
			setProfileState(readFromStorage());
		};
		window.addEventListener("storage", onStorage);

		return () => {
			listeners.delete(listener);
			window.removeEventListener("storage", onStorage);
		};
	}, []);

	const setProfile = (next: AccountProfile) => writeToStorage(next);

	return { profile, setProfile, isHydrated };
}
