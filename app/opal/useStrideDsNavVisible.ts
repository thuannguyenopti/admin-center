"use client";

import { useEffect, useState } from "react";

const KEY = "opal-stride-ds-nav-visible";
const EVENT = "opal-stride-ds-nav-visibility-change";

export function readStrideDsNavVisible(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}

export function setStrideDsNavVisible(visible: boolean) {
  try {
    localStorage.setItem(KEY, String(visible));
  } catch {}
  window.dispatchEvent(new CustomEvent(EVENT, { detail: visible }));
}

export function useStrideDsNavVisible(): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readStrideDsNavVisible());
    const handler = (e: Event) => setVisible((e as CustomEvent<boolean>).detail);
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  return visible;
}
