"use client";

import React, { useEffect, useRef, useState } from "react";
import PreviewWrapper from "./PreviewWrapper";
import type { PreviewSettings } from "./PreviewSettings"; // adjust path
import { siteConfig } from "../../db/initialData";
import {
    IconPilcrow,
    IconForms,
    IconRectangle,
    IconHeading,
    IconBrackets,
    IconPhoto,
    IconMenu2,
    IconX,
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

const isImageDrag = (dt: DataTransfer) => {
    const types = Array.from(dt?.types || []);
    return (
        types.includes("image/url") || // your custom type (if browser exposes it)
        types.includes("text/uri-list") || // common for URL drags
        types.includes("text/plain") || // common fallback
        types.includes("Files") // if dragging files
    );
};

const getDraggedImageUrl = (dt: DataTransfer) => {
    const url =
        dt.getData("image/url") ||
        dt.getData("text/uri-list") ||
        dt.getData("text/plain");
    return typeof url === "string" ? url.trim() : "";
};

const getDraggedAlt = (dt: DataTransfer) => {
    const alt = dt.getData("image/alt") || "";
    return typeof alt === "string" ? alt : "";
};

export default function PreviewCanvas({
    outlines,
    theEles, // unused but kept for prop compatibility
    currentEle,
    currentHoverEle,
    setCurrentEle,
    setCurrentHoverEle,
    setOutlines,
    preview,
}: {
    outlines: Outline[];
    theEles: EleMap;
    currentEle: string;
    currentHoverEle: string;
    setCurrentEle: (value: React.SetStateAction<string>) => void;
    setCurrentHoverEle: (value: React.SetStateAction<string>) => void;
    setOutlines: React.Dispatch<React.SetStateAction<Outline[]>>;
    preview: PreviewSettings;
}) {
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
    const [dropPosition, setDropPosition] = useState<DropPosition>(null);

    // ✅ This MUST be the scroll container div inside PreviewWrapper
    const scrollRef = useRef<HTMLDivElement | null>(null);

    // "mobile only" breakpoint (tweak as you like)
    const MOBILE_BP = 480;

    const [viewportW, setViewportW] = useState<number>(() => {
        // fixed/scale should behave like that device width immediately
        return preview.mode === "responsive" ? 0 : preview.width;
    });

    useEffect(() => {
        if (preview.mode !== "responsive") {
            setViewportW(preview.width);
            return;
        }

        const el = scrollRef.current;
        if (!el) return;

        const update = () => setViewportW(el.clientWidth);
        update();

        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [preview.mode, preview.width]);

    const isMobileViewport = viewportW > 0 && viewportW <= MOBILE_BP;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!isMobileViewport) {
            setMobileMenuOpen(false);
        }
    }, [isMobileViewport]);

    const wrapperWidth = preview.width ?? 1100;
    const wrapperMaxWidth = preview.maxWidth ?? 1100;

    // Scroll the selected element into view
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

    const insertImageIntoOutline = (
        dp: NonNullable<DropPosition>,
        imageUrl: string,
        imageAlt: string
    ) => {
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

    // Outline-level aside detection
    const isAsideOutline = (o: any) => {
        if (!o || typeof o !== "object") return false;
        if (o.role === "aside") return true;
        if (o.isAside === true) return true;
        const t = (o.title ?? "").toString().trim().toLowerCase();
        return t === "aside" || t === "sidebar";
    };

    const renderOutlineTree = (outline: Outline) => {
        const renderElement = (node: any, eleIndex: number) => {
            const ele = outline.elements[node.id];
            const type = ele?.type;

            return (
                <React.Fragment key={node.id ?? eleIndex}>
                    <div className="relative group" data-element-id={node.id}>
                        {/* selection outline */}
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentEle(node.id);
                                setCurrentHoverEle("none");
                            }}
                            style={{
                                visibility:
                                    currentEle === node.id || currentHoverEle === node.id
                                        ? "visible"
                                        : undefined,
                                opacity:
                                    currentEle === node.id || currentHoverEle === node.id
                                        ? currentEle === node.id
                                            ? 1
                                            : 0.5
                                        : undefined,
                                top:
                                    currentEle === node.id || currentHoverEle === node.id
                                        ? "-8px"
                                        : undefined,
                                left:
                                    currentEle === node.id || currentHoverEle === node.id
                                        ? "-8px"
                                        : undefined,
                                right:
                                    currentEle === node.id || currentHoverEle === node.id
                                        ? "-8px"
                                        : undefined,
                                bottom:
                                    currentEle === node.id || currentHoverEle === node.id
                                        ? "-8px"
                                        : undefined,
                            }}
                            className="cursor-pointer group-hover:visible group-hover:-left-2 group-hover:-top-2 group-hover:-right-2 group-hover:-bottom-2 group-hover:opacity-50 transition-all duration-100 invisible opacity-0 absolute border-2 -left-1 -top-1 -right-1 -bottom-1 z-10 border-[#0037FF] rounded-[4px] rounded-tl-none"
                        >
                            <div className="bg-[#0037FF] flex gap-1 items-center text-white text-[9px] absolute px-2 py-[3px] rounded-[4px] -top-7 -left-[2px] rounded-b-none">
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

                        {/* element render */}
                        {(() => {
                            switch (type) {
                                case "Heading":
                                    return (
                                        <h1 className="text-3xl mb-5 font-bold">
                                            {ele?.props.find((p: any) => p.label === "Text")?.value || (
                                                <>&nbsp;</>
                                            )}
                                        </h1>
                                    );

                                case "Text":
                                    return (
                                        <p className="mb-2">
                                            {ele?.props.find((p: any) => p.label === "Text")?.value || (
                                                <>&nbsp;</>
                                            )}
                                        </p>
                                    );

                                case "Input": {
                                    const inputType = ele?.props.find((p: any) => p.label === "Type")?.value || "text";
                                    return (
                                        <div className="group relative mt-4">
                                            {ele?.props.find((p: any) => p.label === "Tooltip")?.value && (
                                                <div className="text-sm group-hover:opacity-100 group-hover:scale-100 group-hover:delay-1000 delay-0 group-hover:visible group-hover:-translate-y-2 opacity-0 text-center invisible absolute left-1/2 -translate-x-1/2 bottom-10 scale-90 shadow-lg transition-[.3s] px-2 py-1 rounded-md bg-[#000] text-white">
                                                    {ele?.props.find((p: any) => p.label === "Tooltip")?.value}
                                                </div>
                                            )}
                                            <label className="block text-sm font-medium mb-1">
                                                {ele?.props.find((p: any) => p.label === "Label")?.value || (
                                                    <>&nbsp;</>
                                                )}
                                            </label>
                                            <input
                                                type={inputType}
                                                placeholder={
                                                    ele?.props.find((p: any) => p.label === "Placeholder")?.value ||
                                                    undefined
                                                }
                                                className="border border-[#ffffff22] rounded-[6px] p-2 w-full bg-[#ffffff11] placeholder:text-[#ffffff66]"
                                            />
                                        </div>
                                    );
                                }

                                case "Textarea":
                                    return (
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium mb-1">
                                                {ele?.props.find((p: any) => p.label === "Label")?.value || <>&nbsp;</>}
                                            </label>
                                            <textarea
                                                placeholder={ele?.props.find((p: any) => p.label === "Placeholder")?.value || undefined}
                                                className="border border-[#ffffff22] rounded-[6px] p-2 w-full bg-[#ffffff11] placeholder:text-[#ffffff66] min-h-[100px]"
                                            />
                                        </div>
                                    );

                                case "Dropdown": {
                                    const options = (ele?.props.find((p: any) => p.label === "Options")?.value || "").split(",").map((s: string) => s.trim());
                                    return (
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium mb-1">
                                                {ele?.props.find((p: any) => p.label === "Label")?.value || <>&nbsp;</>}
                                            </label>
                                            <select className="border border-[#ffffff22] rounded-[6px] p-2 w-full bg-[#ffffff11] text-white">
                                                {options.map((opt: string, i: number) => (
                                                    <option key={i} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>
                                    );
                                }

                                case "Radio": {
                                    const options = (ele?.props.find((p: any) => p.label === "Options")?.value || "").split(",").map((s: string) => s.trim());
                                    const label = ele?.props.find((p: any) => p.label === "Label")?.value;
                                    return (
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium mb-2">{label || <>&nbsp;</>}</label>
                                            <div className="flex flex-col gap-2">
                                                {options.map((opt: string, i: number) => (
                                                    <label key={i} className="flex items-center gap-2 cursor-pointer">
                                                        <input type="radio" name={node.id} value={opt} className="w-4 h-4" />
                                                        <span>{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }

                                case "Checkbox": {
                                    const label = ele?.props.find((p: any) => p.label === "Label")?.value;
                                    const checked = ele?.props.find((p: any) => p.label === "Default Checked")?.value === "true";
                                    return (
                                        <div className="mt-4 flex items-center gap-2">
                                            <input type="checkbox" defaultChecked={checked} className="w-4 h-4" />
                                            <label className="text-sm font-medium cursor-pointer">{label || <>&nbsp;</>}</label>
                                        </div>
                                    );
                                }

                                case "Slider": {
                                    const label = ele?.props.find((p: any) => p.label === "Label")?.value;
                                    const min = ele?.props.find((p: any) => p.label === "Min")?.value || "0";
                                    const max = ele?.props.find((p: any) => p.label === "Max")?.value || "100";
                                    const step = ele?.props.find((p: any) => p.label === "Step")?.value || "1";
                                    return (
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium mb-2">{label || <>&nbsp;</>}</label>
                                            <input type="range" min={min} max={max} step={step} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                            <div className="flex justify-between text-xs mt-1 opacity-60">
                                                <span>{min}</span>
                                                <span>{max}</span>
                                            </div>
                                        </div>
                                    );
                                }

                                case "Button":
                                    return (
                                        <div className="text-right mt-4">
                                            <button className="rounded bg-[#6846FF] px-5 py-3 text-center text-white font-bold inline-block hover:bg-[#5836FF] transition-colors">
                                                {ele?.props.find((p: any) => p.label === "Label")?.value || (
                                                    <>&nbsp;</>
                                                )}
                                            </button>
                                        </div>
                                    );

                                case "Form": {
                                    const formName = ele?.props.find((p: any) => p.label === "Form Name")?.value || "Form";
                                    const action = ele?.props.find((p: any) => p.label === "Submit URL")?.value || "#";
                                    return (
                                        <div className="border border-[#ffffff22] rounded-lg p-6 bg-[#ffffff05] mt-6">
                                            <h2 className="text-xl font-semibold mb-4 opacity-80">{formName}</h2>
                                            <form action={action} onSubmit={(e) => e.preventDefault()}>
                                                {(node.children || []).map((child: any, i: number) => renderElement(child, i))}
                                            </form>
                                        </div>
                                    );
                                }

                                case "Image": {
                                    const imageUrlRaw =
                                        ele?.props.find((p: any) => p.label === "Image URL")?.value;
                                    const imageUrl =
                                        typeof imageUrlRaw === "string" ? imageUrlRaw.trim() : imageUrlRaw;

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
                </React.Fragment>
            );
        };

        return outline.tree.map((section: any, sindex: number) => (
            <section key={section.id ?? sindex}>
                {(section.children || []).map((row: any, rIndex: number) => (
                    <section
                        className="grid grid-flow-col auto-cols-fr gap-4 text-white"
                        key={row.id ?? rIndex}
                    >
                        {(row.children || []).map((col: any, cIndex: number) => {
                            const colChildren = col.children || [];
                            const isActiveDropCol =
                                dragOverColumn === col.id &&
                                dropPosition &&
                                dropPosition.outlineId === outline.id &&
                                dropPosition.colId === col.id;

                            return (
                                <div
                                    key={col.id ?? cIndex}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        // ✅ IMPORTANT: do NOT rely on only "image/url"
                                        if (!isImageDrag(e.dataTransfer)) return;

                                        setDragOverColumn(col.id);

                                        const elementDivs = e.currentTarget.querySelectorAll("[data-element-id]");
                                        const mouseY = e.clientY;

                                        let insertPosition = colChildren.length;

                                        for (let i = 0; i < elementDivs.length; i++) {
                                            const rect = (elementDivs[i] as HTMLElement).getBoundingClientRect();
                                            const middle = rect.top + rect.height / 2;
                                            if (mouseY < middle) {
                                                insertPosition = i;
                                                break;
                                            }
                                        }

                                        setDropPosition({
                                            outlineId: outline.id,
                                            colId: col.id,
                                            position: insertPosition,
                                        });
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
                                    {/* empty drop */}
                                    {colChildren.length === 0 && dragOverColumn === col.id && (
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

                                    {/* list */}
                                    {colChildren.map((element: any, eleIndex: number) => {
                                        const isActiveDropEle = isActiveDropCol && dropPosition!.position === eleIndex;
                                        return (
                                            <React.Fragment key={element.id ?? eleIndex}>
                                                {/* ✅ insert line BEFORE the element (middle positions now visible/usable) */}
                                                {isActiveDropEle && (
                                                    <div
                                                        style={{
                                                            height: "2px",
                                                            backgroundColor: "#0037FF",
                                                            borderRadius: "2px",
                                                            margin: "6px 0",
                                                            pointerEvents: "none",
                                                        }}
                                                    />
                                                )}
                                                {renderElement(element, eleIndex)}
                                            </React.Fragment>
                                        );
                                    })}

                                    {/* ✅ insert line at END of column */}
                                    {isActiveDropCol && dropPosition!.position === colChildren.length && (
                                        <div
                                            style={{
                                                height: "2px",
                                                backgroundColor: "#0037FF",
                                                borderRadius: "2px",
                                                margin: "6px 0",
                                                pointerEvents: "none",
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </section>
                ))}
            </section>
        ));
    };
                                    {/* ✅ insert line at END of column */}
                                    {isActiveDropCol && dropPosition!.position === colChildren.length && (
                                        <div
                                            style={{
                                                height: "2px",
                                                backgroundColor: "#0037FF",
                                                borderRadius: "2px",
                                                margin: "6px 0",
                                                pointerEvents: "none",
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </section>
                ))}
            </section>
        ));
    };

    const mainOutlines = outlines.filter((o) => !isAsideOutline(o));
    const asideOutlines = outlines.filter((o) => isAsideOutline(o));
    const hasAside = asideOutlines.length > 0 && mainOutlines.length > 0;

    // ✅ only break into 1 column on "mobile" preview widths
    const useTwoCol = hasAside && !isMobileViewport;

    return (
        <div
            className={`rounded-lg grow w-full mt-3 min-h-0 min-w-0 ${styles.canvas}`}
            style={{
                background: "darkgray",
                height: "100%",
                minHeight: 0,
                overflow: "hidden",
            }}
        >
            <PreviewWrapper
                contentRef={scrollRef}
                mode={preview.mode}
                width={wrapperWidth}
                maxWidth={wrapperMaxWidth}
                height="fill"
                className="h-full min-h-0"
                onClick={() => setCurrentEle("none")}
                onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    if (isImageDrag(e.dataTransfer)) (e.currentTarget as HTMLDivElement).style.opacity = "0.8";
                }}
                onDragLeave={(e: React.DragEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.opacity = "1";
                    setDragOverColumn(null);
                    setDropPosition(null);
                }}
                onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    (e.currentTarget as HTMLDivElement).style.opacity = "1";

                    const imageUrl = getDraggedImageUrl(e.dataTransfer);
                    const imageAlt = getDraggedAlt(e.dataTransfer);

                    const dp = dropPosition;
                    setDragOverColumn(null);
                    setDropPosition(null);

                    if (imageUrl && dp) insertImageIntoOutline(dp, imageUrl, imageAlt);
                }}
                style={{ transition: "opacity 0.2s" }}
            >
                {/* Fake Site Header */}
                <div className="w-full bg-white px-4 md:px-8 py-4 md:py-5 flex items-center justify-between border-b border-gray-100 shrink-0 sticky top-0 z-50 shadow-sm"
                >
                    <div className="flex items-center gap-4 md:gap-12">
                        {isMobileViewport && (
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 -ml-2 text-gray-600 hover:text-black transition-colors"
                            >
                                {mobileMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
                            </button>
                        )}
                        <div className="select-none">
                            <svg width="128" height="32" viewBox="0 0 128 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_690_41371)">
                                    <path d="M6.77799 2.59403C5.32643 4.22489 4.30713 6.51892 3.8335 9.12422C3.66336 10.0581 3.57752 10.9627 3.57752 11.8266C3.57752 12.8507 3.70015 13.8183 3.94999 14.6935C4.13699 15.3499 4.39756 15.9522 4.72251 16.4755C5.20994 17.265 5.84452 17.8763 6.58945 18.2823C7.3344 18.6883 8.18969 18.8958 9.1446 18.8958H18.4578C18.8011 18.8958 19.0894 18.9455 19.3162 19.0289C19.4863 19.0921 19.6227 19.1733 19.727 19.2613C19.8833 19.3966 19.9722 19.5342 20.0381 19.7079C20.1025 19.8838 20.1485 20.1184 20.1485 20.4635C20.1485 20.7365 20.1178 21.0771 20.0458 21.4741C19.868 22.4418 19.517 23.2042 19.0204 23.7478C18.5222 24.2892 17.8677 24.6185 17.0461 24.6208H1.31819L0 31.866H16.0973C18.3536 31.8683 20.268 30.8623 21.7226 29.1525C23.1788 27.4448 24.1705 25.0606 24.658 22.3741C24.874 21.1831 24.9875 20.0846 24.9875 19.0695C24.9875 18.0207 24.8649 17.0552 24.6028 16.2025C24.4066 15.5642 24.1322 14.9935 23.7904 14.513C23.2769 13.7913 22.6209 13.2815 21.8637 12.9543C21.1034 12.6273 20.2358 12.4762 19.2579 12.4762H9.97229C9.70865 12.4762 9.49099 12.4288 9.3224 12.3544C9.19519 12.298 9.09401 12.228 9.01587 12.1491C8.89782 12.0318 8.82424 11.9055 8.766 11.7363C8.70928 11.5671 8.671 11.3438 8.66942 11.0348C8.66942 10.7867 8.69551 10.4867 8.75835 10.1415C8.93155 9.20091 9.25191 8.49489 9.6765 8.00992C10.1041 7.52495 10.6467 7.24525 11.3227 7.24299H26.4084L27.7266 0H12.2715C10.1118 0 8.22955 0.960923 6.77951 2.59403H6.77799Z" fill="#194BFF" />
                                    <path d="M49.5055 0H29.1424L27.8242 7.24299H35.5204L31.037 31.866H36.0063L40.4897 7.24299H48.1873L49.5055 0Z" fill="#194BFF" />
                                    <path d="M76.297 0L70.5522 31.5502L65.9781 22.241C67.1841 21.4312 68.2603 20.2718 69.1539 18.8101C70.2531 17.0124 71.0775 14.7611 71.5513 12.1559C71.7982 10.7957 71.9238 9.51442 71.9256 8.31444C71.9256 7.0693 71.7891 5.91214 71.5052 4.87452C71.2923 4.09857 70.998 3.39254 70.6238 2.779C70.0644 1.85868 69.3334 1.15491 68.4732 0.692494C67.6118 0.230079 66.6188 0 65.5044 0H50.4188L44.6172 31.866H49.5589L54.0423 7.24299H64.5556C64.9924 7.24299 65.3648 7.31291 65.6669 7.43472C65.8938 7.5272 66.0795 7.64676 66.2311 7.78661C66.458 7.99865 66.6097 8.24452 66.7213 8.57158C66.8335 8.90092 66.9039 9.32946 66.9039 9.89797C66.9039 10.4009 66.8475 11.0077 66.7182 11.7093C66.5575 12.5957 66.3397 13.3649 66.0764 14.0168C65.6791 14.9936 65.1841 15.7085 64.5865 16.1957C63.9872 16.683 63.2726 16.9469 62.4172 16.9492H53.4384L52.2321 23.5764H60.339L63.9611 31.866H75.4629L81.2678 0H76.297Z" fill="#194BFF" />
                                    <path d="M104.132 11.3145C104.132 9.63401 103.936 8.07308 103.552 6.68133C103.266 5.63695 102.872 4.68956 102.385 3.85947C101.652 2.61434 100.706 1.64214 99.5977 0.990245C98.4882 0.338353 97.2173 0 95.8178 0H83.548L77.7461 31.866H90.3859C91.905 31.866 93.3949 31.4307 94.7986 30.6366C96.903 29.448 98.8145 27.4607 100.358 24.9253C101.9 22.3877 103.076 19.2974 103.697 15.889C103.988 14.2875 104.132 12.7558 104.132 11.3168V11.3145ZM95.9391 22.0786C94.6057 23.6869 92.9823 24.6253 91.3359 24.623H84.0078L87.1732 7.24073H94.8708C95.5496 7.24073 96.1472 7.39412 96.6579 7.66706C97.4241 8.07984 97.9974 8.74753 98.399 9.63401C98.7975 10.5228 99.0263 11.6528 99.0275 13.0153C99.0275 13.807 98.9492 14.6755 98.7793 15.607C98.3074 18.2033 97.2725 20.4703 95.9403 22.0763L95.9391 22.0786Z" fill="#194BFF" />
                                    <path d="M110.727 18.8985H123.394L124.563 12.4766H111.896L110.727 18.8985Z" fill="#194BFF" />
                                    <path d="M108.061 0L102.258 31.866H121.813L123.132 24.623H108.52L111.685 7.24299H126.269L127.587 0H108.061Z" fill="#194BFF" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_690_41371">
                                        <rect width="128" height="32" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                        </div>
                        {!isMobileViewport && (
                            <div className="flex items-center gap-8">
                                {siteConfig.header.links.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className="text-gray-600 hover:text-black text-[15px] font-medium no-underline transition-colors"
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3 md:gap-6">
                        {!isMobileViewport && (
                            <>
                                <a
                                    href="#"
                                    className="text-gray-900 font-semibold text-[15px] no-underline hover:text-black transition-colors"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    {siteConfig.header.auth.signIn}
                                </a>
                                <button className="bg-[#05051F] text-white px-5 py-2.5 rounded-lg text-[15px] font-semibold hover:bg-black transition-colors">
                                    {siteConfig.header.auth.cta}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Overlay */}
                    {isMobileViewport && mobileMenuOpen && (
                        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg py-4 px-6 flex flex-col gap-4 z-50" >
                            {siteConfig.header.links.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="text-gray-600 hover:text-black text-[16px] font-medium no-underline py-2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setMobileMenuOpen(false);
                                    }}
                                >
                                    {link.label}
                                </a>
                            ))}
                            <hr className="border-gray-100 my-2" />
                            <a
                                href="#"
                                className="text-gray-900 font-semibold text-[16px] no-underline py-2"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setMobileMenuOpen(false);
                                }}
                            >
                                {siteConfig.header.auth.signIn}
                            </a>
                            <button
                                className="bg-[#05051F] text-white px-5 py-3 rounded-lg text-[16px] font-semibold hover:bg-black transition-colors w-full mt-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {siteConfig.header.auth.cta}
                            </button>
                        </div>
                    )}
                </div>

                <div className="w-full p-4 px-6 md:px-24 pt-8 md:pt-12 flex-1" style={{
                    background: "radial-gradient(112.7% 105.9% at 2.27% 5.46%, rgba(255, 0, 0, 0.10) 0%, rgba(0, 0, 0, 0.00) 100%), linear-gradient(180deg, #360041 0%, #002A3A 100%)"
                }}>
                    {useTwoCol ? (
                        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,340px)] gap-8 items-start">
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
                            {[...mainOutlines, ...asideOutlines].map((outline) => (
                                <div key={outline.id}>
                                    <div className="text-white/60 text-xs mb-3">{outline.title}</div>
                                    {renderOutlineTree(outline)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PreviewWrapper >
        </div >
    );
}
