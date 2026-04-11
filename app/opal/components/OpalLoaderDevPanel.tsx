"use client";

import { useEffect, useState } from "react";
import { useLoaderDev, LoaderVersion } from "./useLoaderDev";
import { OpalLoader } from "./OpalLoader";
import { OpalLoaderV2 } from "./OpalLoaderV2";
import { OpalLoaderV3 } from "./OpalLoaderV3";
import { OpalLoaderV4 } from "./OpalLoaderV4";
import { OpalLoaderV5 } from "./OpalLoaderV5";

const COLOR = "#7C3AED";
const VERSIONS: LoaderVersion[] = ["V1", "V2", "V3", "V4", "V5"];

function LoaderPreview({ version, size = 16 }: { version: LoaderVersion; size?: number }) {
    const map = { V1: OpalLoader, V2: OpalLoaderV2, V3: OpalLoaderV3, V4: OpalLoaderV4, V5: OpalLoaderV5 };
    const L = map[version];
    return <L size={size} color={COLOR} />;
}

/** Floating dev panel — activated by Ctrl+Shift+L */
export function OpalLoaderDevPanel() {
    const { enabled, version, update } = useLoaderDev();
    const [visible, setVisible] = useState(false);

    // Secret keyboard shortcut: Ctrl+Shift+L
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === "L") {
                e.preventDefault();
                setVisible(v => !v);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    if (!visible) return null;

    return (
        <div style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            padding: "16px",
            minWidth: "260px",
            fontFamily: "system-ui, sans-serif",
        }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280" }}>
                    Loader Dev Mode
                </span>
                <button
                    onClick={() => setVisible(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "14px", padding: "0 2px" }}
                >✕</button>
            </div>

            {/* Toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ fontSize: "13px", color: "#374151" }}>Enable dev flow</span>
                <button
                    onClick={() => update({ enabled: !enabled })}
                    style={{
                        width: "40px", height: "22px", borderRadius: "11px",
                        background: enabled ? "#7C3AED" : "#d1d5db",
                        border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s",
                    }}
                >
                    <span style={{
                        position: "absolute", top: "3px",
                        left: enabled ? "21px" : "3px",
                        width: "16px", height: "16px", borderRadius: "50%",
                        background: "white", transition: "left 0.2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }} />
                </button>
            </div>

            {/* Version dropdown */}
            <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "11px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
                    Loader version
                </label>
                <select
                    value={version}
                    onChange={e => update({ version: e.target.value as LoaderVersion })}
                    style={{
                        width: "100%", padding: "6px 8px", borderRadius: "6px",
                        border: "1px solid #e5e7eb", fontSize: "13px", color: "#374151",
                        background: "white", cursor: "pointer",
                    }}
                >
                    {VERSIONS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
            </div>

            {/* Live preview */}
            <div style={{
                background: "#f9fafb", borderRadius: "8px", padding: "10px 12px",
                display: "flex", alignItems: "center", gap: "8px",
            }}>
                <LoaderPreview version={version} size={16} />
                <span style={{ fontSize: "12px", color: "#6b7280" }}>16px preview</span>
                <span style={{ marginLeft: "auto" }} />
                <LoaderPreview version={version} size={20} />
                <span style={{ fontSize: "12px", color: "#6b7280" }}>20px</span>
            </div>

            {/* Sequence description */}
            {enabled && (
                <div style={{ marginTop: "12px", borderTop: "1px solid #f3f4f6", paddingTop: "12px" }}>
                    <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0, lineHeight: "1.6" }}>
                        <strong style={{ color: "#7C3AED" }}>Flow:</strong> V5 20px · 4s →<br />
                        V3 + V2 16px streaming activities
                    </p>
                </div>
            )}

            <p style={{ fontSize: "10px", color: "#d1d5db", marginTop: "12px", marginBottom: 0, textAlign: "center" }}>
                Ctrl+Shift+L to toggle panel
            </p>
        </div>
    );
}
