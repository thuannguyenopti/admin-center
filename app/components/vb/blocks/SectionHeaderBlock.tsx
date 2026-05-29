"use client";

import React from "react";
import { getProperty } from "./utils";

export const SectionHeaderBlock = React.memo(function SectionHeaderBlock({
    properties,
    hasBgImage
}: {
    properties: any;
    hasBgImage?: boolean
}) {
    const accentText = getProperty(properties, "accent", "Accent Text") || "JOIN US - NEW VIEW";
    const heading = getProperty(properties, "heading", "Heading") || "Level up your game - Join Stride today.";
    const body = getProperty(properties, "body", "Body Text") || "";
    const number = getProperty(properties, "number", "Number") || "";

    return (
        <div className="relative w-full" style={{ marginBottom: "64px" }}>
            {/* Block Element - Number, Line, and Accent Text */}
            <div
                className="flex flex-col items-start relative w-full"
                style={{ gap: "16px", paddingBottom: "32px" }}
            >
                {/* Number Badge - 20px x 18px */}
                {number && (
                    <div style={{
                        width: "20px",
                        height: "18px",
                        background: hasBgImage ? "rgba(255, 255, 255, 0.9)" : "#1C1C1C",
                        color: hasBgImage ? "#1C1C1C" : "#F2F8FC",
                        fontFamily: "'Space Mono', monospace",
                        fontWeight: "700",
                        fontSize: "12px",
                        letterSpacing: "0.6px",
                        textTransform: "uppercase",
                        textAlign: "center",
                        lineHeight: "18px",
                    }}>
                        {number}
                    </div>
                )}

                {/* Line - 3px height, full width */}
                <div
                    className="w-full"
                    style={{
                        height: "3px",
                        background: hasBgImage ? "rgba(255, 255, 255, 0.2)" : "#1C1C1C"
                    }}
                />

                {/* Vertical Accent Text - absolutely positioned at left -24px, top 78px */}
                <div
                    className="absolute flex items-center justify-center"
                    style={{
                        left: "-24px",
                        top: "78px",
                        width: "18px",
                        height: "71px",
                    }}
                >
                    <div style={{ transform: "rotate(90deg)", flexShrink: 0 }}>
                        <p style={{
                            fontFamily: "'Space Mono', monospace",
                            fontWeight: "700",
                            fontSize: "12px",
                            letterSpacing: "0.6px",
                            textTransform: "uppercase",
                            color: hasBgImage ? "rgba(255, 255, 255, 0.9)" : "#0980F6",
                            lineHeight: "normal",
                            fontStyle: "normal",
                            whiteSpace: "nowrap",
                        }}>
                            {accentText}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content - Heading and Body */}
            <div className="w-full">
                <h2
                    className="font-stride-sans"
                    style={{
                        fontSize: "48px",
                        fontWeight: "590",
                        lineHeight: "1.1",
                        color: hasBgImage ? "#FFFFFF" : "#1C1C1C",
                    }}
                >
                    {heading}
                </h2>

                {body && (
                    <p
                        className="font-stride-sans max-w-3xl"
                        style={{
                            fontSize: "18px",
                            fontWeight: "510",
                            lineHeight: "1.55",
                            paddingTop: "24px",
                            color: hasBgImage ? "rgba(255, 255, 255, 0.9)" : "#1C1C1C",
                        }}
                    >
                        {body}
                    </p>
                )}
            </div>
        </div>
    );
});
