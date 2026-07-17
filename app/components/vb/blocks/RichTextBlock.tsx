"use client";

import React from "react";
import { getProperty } from "./utils";

type TipTapTextNode = {
    type: "text";
    text: string;
    marks?: { type: string; attrs?: Record<string, any> }[];
};

type TipTapParagraphNode = {
    type: "paragraph";
    content?: TipTapNode[];
};

type TipTapDoc = {
    type: "doc";
    content?: TipTapNode[];
};

type TipTapNode = TipTapTextNode | TipTapParagraphNode | any;

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

const serializeNode = (node: TipTapNode): string => {
    if (!node) return "";
    if (node.type === "text") {
        const safeText = escapeHtml(node.text ?? "");
        const marks: any[] = node.marks || [];
        return marks.reduce((html: string, mark: any) => {
            switch (mark.type) {
                case "bold":
                case "strong":
                    return `<strong>${html}</strong>`;
                case "italic":
                case "em":
                    return `<em>${html}</em>`;
                case "link": {
                    const href = escapeHtml(mark.attrs?.href || "");
                    return href ? `<a href="${href}">${html}</a>` : html;
                }
                default:
                    return html;
            }
        }, safeText);
    }

    if (node.type === "paragraph") {
        const children = (node.content || []).map(serializeNode).join("");
        return `<p>${children}</p>`;
    }

    if (Array.isArray(node)) {
        return node.map(serializeNode).join("");
    }

    return "";
};

const serializeDoc = (doc: TipTapDoc | string): string => {
    if (typeof doc === "string") {
        try {
            const parsed = JSON.parse(doc);
            return serializeDoc(parsed as TipTapDoc);
        } catch {
            return doc; // fallback: assume HTML string
        }
    }

    if (!doc || doc.type !== "doc") return "";
    return (doc.content || []).map(serializeNode).join("") || "";
};

export const RichTextBlock = React.memo(function RichTextBlock({ properties, hasBgImage }: { properties: any; hasBgImage?: boolean }) {
    const richTextValue = getProperty(properties, "richtext", "Rich Text") ?? "";
    const html = serializeDoc(richTextValue) || "&nbsp;";

    return (
        <div
            className={hasBgImage ? "text-lg text-white/90 mb-6 max-w-2xl" : "text-base text-gray-600 mb-4"}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
});
