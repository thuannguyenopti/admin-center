"use client";

import React, { useEffect, useRef, useState } from "react";
import PreviewWrapper from "./PreviewWrapper";
import {
    IconPilcrow,
    IconForms,
    IconRectangle,
    IconHeading,
    IconBrackets,
    IconPhoto,
} from "@tabler/icons-react";

import styles from "../VBPrototype.module.css";

export type EleMap = Record<string, { type: string; props: any[] }>;

export type Outline = {
    id: string;
    title: string;
    tree: any[];
    elements: EleMap;
};

type DropPosition = { outlineId: string; colId: string; position: number } | null;

export default function PreviewCanvas({
    outlines,
    theEles, // unused but kept for prop compatibility
    currentEle,
    currentHoverEle,
    setCurrentEle,
    setCurrentHoverEle,
    setOutlines,
}: {
    outlines: Outline[];
    theEles: EleMap;
    currentEle: string;
    currentHoverEle: string;
    setCurrentEle: (value: React.SetStateAction<string>) => void;
    setCurrentHoverEle: (value: React.SetStateAction<string>) => void;
    setOutlines: React.Dispatch<React.SetStateAction<Outline[]>>;
}) {
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
    const [dropPosition, setDropPosition] = useState<DropPosition>(null);

    // ✅ This MUST be the scroll container div inside PreviewWrapper
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!currentEle || currentEle === "none") return;

        const root = scrollRef.current;
        if (!root) return;

        const el = root.querySelector<HTMLElement>(`[data-element-id="${currentEle}"]`);
        if (!el) return;

        const r = el.getBoundingClientRect();
        const cr = root.getBoundingClientRect();

        const topVisible = r.top >= cr.top + 40;
        const bottomVisible = r.bottom <= cr.bottom - 40;
        if (topVisible && bottomVisible) return;

        const delta = (r.top - cr.top) - root.clientHeight / 2 + r.height / 2;
        root.scrollTo({ top: root.scrollTop + delta, behavior: "smooth" });
    }, [currentEle]);

    const insertImageIntoOutline = (dp: NonNullable<DropPosition>, imageUrl: string, imageAlt: string) => {
        const uKey = `img-${dp.outlineId}-${Date.now()}`;

        setOutlines((prev) =>
            prev.map((o) => {
                if (o.id !== dp.outlineId) return o;

                const nextElements: EleMap = {
                    ...o.elements,
                    [uKey]: {
                        type: "Image",
                        props: [
                            { type: "text", label: "Image URL", value: imageUrl },
                            { type: "text", label: "Title", value: imageAlt || "Untitled Image" },
                            { type: "text", label: "Alt Text", value: imageAlt },
                            { type: "text", label: "Width", value: "auto" },
                            { type: "text", label: "Height", value: "auto" },
                        ],
                    },
                };

                const nextTree = o.tree.map((section: any) => ({
                    ...section,
                    children: (section.children || []).map((row: any) => ({
                        ...row,
                        children: (row.children || []).map((col: any) => {
                            if (col.id !== dp.colId) return col;
                            const nextChildren = [...(col.children || [])];
                            nextChildren.splice(dp.position, 0, { id: uKey });
                            return { ...col, children: nextChildren };
                        }),
                    })),
                }));

                return { ...o, elements: nextElements, tree: nextTree };
            })
        );
    };

    const isAsideOutline = (o: any) => {
        if (!o || typeof o !== "object") return false;
        if (o.role === "aside") return true;
        if (o.isAside === true) return true;
        const t = (o.title ?? "").toString().trim().toLowerCase();
        return t === "aside" || t === "sidebar";
    };

    const renderOutlineTree = (outline: Outline) => {
        return outline.tree.map((section: any, sindex: number) => (
            <section key={section.id ?? sindex}>
                {(section.children || []).map((row: any, rIndex: number) => (
                    <section className="grid grid-flow-col auto-cols-fr gap-4 text-white" key={row.id ?? rIndex}>
                        {(row.children || []).map((col: any, cIndex: number) => (
                            <div
                                key={col.id ?? cIndex}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    const hasImageData = e.dataTransfer.types.includes("image/url");
                                    if (!hasImageData) return;

                                    setDragOverColumn(col.id);

                                    const elementDivs = e.currentTarget.querySelectorAll("[data-element-id]");
                                    const mouseY = e.clientY;

                                    let insertPosition = (col.children || []).length;
                                    for (let i = 0; i < elementDivs.length; i++) {
                                        const rect = elementDivs[i].getBoundingClientRect();
                                        const middle = rect.top + rect.height / 2;
                                        if (mouseY < middle) {
                                            insertPosition = i;
                                            break;
                                        }
                                    }

                                    setDropPosition({ outlineId: outline.id, colId: col.id, position: insertPosition });
                                }}
                                onDragLeave={(e) => {
                                    e.stopPropagation();
                                    if (e.currentTarget === e.target) {
                                        setDragOverColumn(null);
                                        setDropPosition(null);
                                    }
                                }}
                                className={dragOverColumn === col.id ? "relative" : ""}
                            >
                                {dragOverColumn === col.id &&
                                    dropPosition &&
                                    dropPosition.outlineId === outline.id &&
                                    dropPosition.colId === col.id && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                left: 0,
                                                right: 0,
                                                top: dropPosition.position === 0 ? 0 : undefined,
                                                bottom: dropPosition.position === (col.children || []).length ? 0 : undefined,
                                                height: "2px",
                                                backgroundColor: "#0037FF",
                                                zIndex: 1000,
                                                pointerEvents: "none",
                                            }}
                                        />
                                    )}

                                {(col.children || []).length === 0 && dragOverColumn === col.id && (
                                    <div
                                        style={{
                                            border: "2px dashed #0037FF",
                                            borderRadius: "8px",
                                            padding: "20px",
                                            textAlign: "center",
                                            color: "#0037FF",
                                            fontSize: "14px",
                                            backgroundColor: "rgba(0, 55, 255, 0.05)",
                                        }}
                                    >
                                        Drop image here
                                    </div>
                                )}

                                {(col.children || []).map((element: any, eleIndex: number) => {
                                    const ele = outline.elements[element.id];
                                    const type = ele?.type;

                                    return (
                                        <div key={element.id ?? eleIndex} className="relative group" data-element-id={element.id}>
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentEle(element.id);
                                                    setCurrentHoverEle("none");
                                                }}
                                                style={{
                                                    visibility: currentEle === element.id || currentHoverEle === element.id ? "visible" : undefined,
                                                    opacity:
                                                        currentEle === element.id || currentHoverEle === element.id
                                                            ? currentEle === element.id
                                                                ? 1
                                                                : 0.5
                                                            : undefined,
                                                    top: currentEle === element.id || currentHoverEle === element.id ? "-8px" : undefined,
                                                    left: currentEle === element.id || currentHoverEle === element.id ? "-8px" : undefined,
                                                    right: currentEle === element.id || currentHoverEle === element.id ? "-8px" : undefined,
                                                    bottom: currentEle === element.id || currentHoverEle === element.id ? "-8px" : undefined,
                                                }}
                                                className="cursor-pointer group-hover:visible group-hover:-left-2 group-hover:-top-2 group-hover:-right-2 group-hover:-bottom-2 group-hover:opacity-50 transition-all duration-100 invisible opacity-0 absolute border-2 -left-1 -top-1 -right-1 -bottom-1 z-10 border-[#0037FF] rounded-[4px] rounded-tl-none"
                                            >
                                                <div className="bg-[#0037FF] flex gap-1 items-center text-white text-[9px] absolute px-2 py-[3px] rounded-[4px] -top-5 -left-[2px] rounded-b-none">
                                                    {(() => {
                                                        switch (type) {
                                                            case "Heading":
                                                                return <IconHeading size={12} />;
                                                            case "Text":
                                                                return <IconPilcrow size={12} />;
                                                            case "Input":
                                                                return <IconForms size={12} />;
                                                            case "Button":
                                                                return <IconRectangle size={12} />;
                                                            case "Image":
                                                                return <IconPhoto size={12} />;
                                                            default:
                                                                return <IconBrackets size={12} />;
                                                        }
                                                    })()}
                                                    {type || "Unknown"}
                                                </div>
                                            </div>

                                            {(() => {
                                                switch (type) {
                                                    case "Heading":
                                                        return (
                                                            <h1 className="text-3xl mb-5 font-bold">
                                                                {ele?.props.find((p: any) => p.label === "Text")?.value || <>&nbsp;</>}
                                                            </h1>
                                                        );

                                                    case "Text":
                                                        return (
                                                            <p className="mb-2">
                                                                {ele?.props.find((p: any) => p.label === "Text")?.value || <>&nbsp;</>}
                                                            </p>
                                                        );

                                                    case "Input":
                                                        return (
                                                            <div className="group relative mt-4">
                                                                {ele?.props.find((p: any) => p.label === "Tooltip")?.value && (
                                                                    <div className="text-sm group-hover:opacity-100 group-hover:scale-100 group-hover:delay-1000 delay-0 group-hover:visible group-hover:-translate-y-2 opacity-0 text-center invisible absolute left-1/2 -translate-x-1/2 bottom-10 scale-90 shadow-lg transition-[.3s] px-2 py-1 rounded-md bg-[#000] text-white">
                                                                        {ele?.props.find((p: any) => p.label === "Tooltip")?.value}
                                                                    </div>
                                                                )}
                                                                <label>{ele?.props.find((p: any) => p.label === "Label")?.value || <>&nbsp;</>}</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder={ele?.props.find((p: any) => p.label === "Placeholder")?.value || undefined}
                                                                    className="border border-[#ffffff22] rounded-[6px] p-2 w-full bg-[#ffffff11] placeholder:text-[#ffffff66]"
                                                                />
                                                            </div>
                                                        );

                                                    case "Button":
                                                        return (
                                                            <div className="text-right mt-4">
                                                                <div className="rounded bg-[#6846FF] px-5 py-3 text-center text-white font-bold inline-block">
                                                                    {ele?.props.find((p: any) => p.label === "Label")?.value || <>&nbsp;</>}
                                                                </div>
                                                            </div>
                                                        );

                                                    case "Image": {
                                                        const imageUrlRaw = ele?.props.find((p: any) => p.label === "Image URL")?.value;
                                                        const imageUrl = typeof imageUrlRaw === "string" ? imageUrlRaw.trim() : imageUrlRaw;

                                                        const imageAlt = ele?.props.find((p: any) => p.label === "Alt Text")?.value;
                                                        const imageWidth = ele?.props.find((p: any) => p.label === "Width")?.value;
                                                        const imageHeight = ele?.props.find((p: any) => p.label === "Height")?.value;

                                                        return (
                                                            <div className="mb-4">
                                                                {imageUrl ? (
                                                                    <img
                                                                        src={imageUrl}
                                                                        alt={imageAlt || "Image"}
                                                                        style={{
                                                                            width: imageWidth === "auto" ? "100%" : imageWidth,
                                                                            height: imageHeight === "auto" ? "auto" : imageHeight,
                                                                            borderRadius: "8px",
                                                                            objectFit: "cover",
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="border border-[#ffffff33] bg-[#ffffff0d] text-center text-white/80 rounded-[8px] p-6 text-sm">
                                                                        No image selected
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    }

                                                    default:
                                                        return null;
                                                }
                                            })()}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </section>
                ))}
            </section>
        ));
    };

    const mainOutlines = outlines.filter((o) => !isAsideOutline(o));
    const asideOutlines = outlines.filter((o) => isAsideOutline(o));
    const hasAside = asideOutlines.length > 0 && mainOutlines.length > 0;

    return (
        <div
            className={`rounded-lg grow w-full mt-3 min-h-0 min-w-0 ${styles.canvas}`}
            style={{
                background:
                    "radial-gradient(112.7% 105.9% at 2.27% 5.46%, rgba(255, 0, 0, 0.10) 0%, rgba(0, 0, 0, 0.00) 100%), linear-gradient(180deg, #360041 0%, #002A3A 100%)",
                height: "100%",
                minHeight: 0,
                overflow: "hidden",
            }}
        >
            <PreviewWrapper
                contentRef={scrollRef}
                mode="responsive"
                width={1200}      // ✅ default is responsive
                height="fill"            // ✅ THIS is what makes it overflow/scroll
                className="h-full min-h-0"
                onClick={() => setCurrentEle("none")}
                onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    const hasImageData = e.dataTransfer.types.includes("image/url");
                    if (hasImageData) (e.currentTarget as HTMLDivElement).style.opacity = "0.8";
                }}
                onDragLeave={(e: React.DragEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.opacity = "1";
                    setDragOverColumn(null);
                    setDropPosition(null);
                }}
                onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    (e.currentTarget as HTMLDivElement).style.opacity = "1";

                    const imageUrl = e.dataTransfer.getData("image/url");
                    const imageAlt = e.dataTransfer.getData("image/alt");

                    const dp = dropPosition;
                    setDragOverColumn(null);
                    setDropPosition(null);

                    if (imageUrl && dp) insertImageIntoOutline(dp, imageUrl, imageAlt);
                }}
                style={{ transition: "opacity 0.2s" }}
            >   {/* IMPORTANT: remove the extra max-w wrapper inside OR keep it but don’t double-cap */}
                <div className="w-full p-4 pt-24" style={{ minHeight: "100%" }}>
                    {hasAside ? (
                        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] gap-8 items-start">
                            <div className="space-y-10">
                                {mainOutlines.map((outline) => (
                                    <div key={outline.id}>
                                        <div className="text-white/60 text-xs mb-3">{outline.title}</div>
                                        {renderOutlineTree(outline)}
                                    </div>
                                ))}
                            </div>

                            <aside className="space-y-10">
                                {asideOutlines.map((outline) => (
                                    <div key={outline.id}>
                                        <div className="text-white/60 text-xs mb-3">{outline.title}</div>
                                        {renderOutlineTree(outline)}
                                    </div>
                                ))}
                            </aside>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {outlines.map((outline) => (
                                <div key={outline.id}>
                                    <div className="text-white/60 text-xs mb-3">{outline.title}</div>
                                    {renderOutlineTree(outline)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PreviewWrapper>
        </div>
    );
}
