"use client";
import { useState, useEffect } from "react";

const STORAGE_KEY = "opal_loader_dev";
const EVENT_NAME = "opal_loader_dev_change";

export type LoaderVersion = "V1" | "V2" | "V3" | "V4" | "V5";
export type LoaderSequenceOption = "V1_TO_V2" | "V2_TO_V3" | "V4";
export interface DevState {
    enabled: boolean;
    version: LoaderVersion;
    sequence: LoaderSequenceOption;
}

const DEFAULT_STATE: DevState = { enabled: false, version: "V5", sequence: "V1_TO_V2" };

function readState(): DevState {
    if (typeof window === "undefined") return DEFAULT_STATE;
    try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
        return { ...DEFAULT_STATE, ...raw };
    } catch { return DEFAULT_STATE; }
}

export function useLoaderDev() {
    const [state, setState] = useState<DevState>(DEFAULT_STATE);

    useEffect(() => {
        setState(readState());
        const sync = () => setState(readState());
        window.addEventListener(EVENT_NAME, sync);
        return () => window.removeEventListener(EVENT_NAME, sync);
    }, []);

    const update = (patch: Partial<DevState>) => {
        const next: DevState = { ...readState(), ...patch };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event(EVENT_NAME));
    };

    return { ...state, update };
}
