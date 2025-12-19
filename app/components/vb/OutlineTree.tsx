"use client";

import React, { useState } from "react";
import { Box, Button } from "@optiaxiom/react";
import { IconPlus } from "@tabler/icons-react";

import Section from "./Section";
import Row from "./Row";
import Col from "./Col";
import Ele, { EleMap } from "./Ele";

interface OutlineProps {
    cloning?: boolean;
    currentHoverEle: string;
    dragging: string | null;
    theEles: EleMap;

    setCurrentEle: React.Dispatch<React.SetStateAction<string>>;
    setDragging: React.Dispatch<React.SetStateAction<string | null>>;
    setData: React.Dispatch<React.SetStateAction<any[]>>;
    setCurrentHoverEle: React.Dispatch<React.SetStateAction<string>>;
    setTheEles: React.Dispatch<React.SetStateAction<EleMap>>;

    data: any[];
}

type AssetDropPosition = { colId: string; position: number } | null;

// Mark internal drags so we can ignore them in "asset image" handlers.
const INTERNAL_DND_MIME = "application/x-vb-internal";

const isImageDrag = (dt: DataTransfer) => {
    const types = Array.from(dt?.types || []);
    // NOTE: do NOT include "text/plain" here — internal drags can surface it and will
    // incorrectly enter asset-drag mode.
    return types.includes("image/url") || types.includes("text/uri-list") || types.includes("Files");
};

const getDraggedImageUrl = (dt: DataTransfer) => {
    const url = dt.getData("image/url") || dt.getData("text/uri-list") || dt.getData("text/plain");
    return typeof url === "string" ? url.trim() : "";
};

const getDraggedAlt = (dt: DataTransfer) => {
    const alt = dt.getData("image/alt") || "";
    return typeof alt === "string" ? alt : "";
};

const INSERT_BAR_STYLE: React.CSSProperties = {
    height: "2px",
    backgroundColor: "#0037FF",
    borderRadius: "2px",
    margin: "-1px 0",
    pointerEvents: "none",
};

export default function OutlineTree({
    cloning,
    setDragging,
    theEles,
    setCurrentEle,
    currentHoverEle,
    setCurrentHoverEle,
    data,
    setData,
    setTheEles,
    dragging,
}: OutlineProps) {
    const ASSET_DRAG_ID = "__asset:image__";

    // Support both old seeded ids (sec-*) and new ids (section-*)
    const isSectionId = (id: string) => id.startsWith("section-") || id.startsWith("sec-");
    const isRowId = (id: string) => id.startsWith("row-");
    const isColId = (id: string) => id.startsWith("col-");
    const isEleId = (id: string) => !isSectionId(id) && !isRowId(id) && !isColId(id);

    // "last" targets (append)
    const isSectionLast = (id: string) => id === "section-last" || id.startsWith("section-last");
    const isRowLast = (id: string) => id.startsWith("row-last-");
    const isColLast = (id: string) => id.startsWith("col-last-");
    const isLastEle = (id: string) => id.startsWith("last-ele-");

    const isInternalDrag = !!dragging && dragging !== ASSET_DRAG_ID;

    const [assetOverCol, setAssetOverCol] = useState<string | null>(null);
    const [assetDrop, setAssetDrop] = useState<AssetDropPosition>(null);

    type InternalDropPosition = { colId: string; position: number } | null;
    const [internalDrop, setInternalDrop] = useState<InternalDropPosition>(null);

    const isInternalEleDrag = (id: string | null) => {
        if (!id) return false;
        if (id === ASSET_DRAG_ID) return false;
        return isEleId(id);
    };

    const clearAssetDnD = () => {
        setAssetOverCol(null);
        setAssetDrop(null);
        setInternalDrop(null);
        // only clear the shared dragging state if we were the one that set it
        setDragging((prev) => (prev === ASSET_DRAG_ID ? null : prev));
    };

    // Set open state for section, row, or col by id
    const setOpen = (id: string, open: boolean) => {
        setData((prev) =>
            prev.map((section) => {
                if (section.id === id) return { ...section, open };

                return {
                    ...section,
                    children: (section.children || []).map((row: any) => {
                        if (row.id === id) return { ...row, open };

                        return {
                            ...row,
                            children: (row.children || []).map((col: any) => {
                                if (col.id === id) return { ...col, open };
                                return col;
                            }),
                        };
                    }),
                };
            })
        );
    };

    const addSection = (id: string) => {
        setData((prev) => {
            const idx = prev.findIndex((section) => section.id === id);
            const mk = () => {
                const t = Date.now();
                return {
                    id: "section-" + t,
                    open: true,
                    children: [
                        {
                            id: "row-" + t,
                            open: true,
                            children: [
                                {
                                    id: "col-" + t,
                                    open: true,
                                    children: [],
                                },
                            ],
                        },
                    ],
                };
            };

            if (idx === -1) return [...prev, mk()];
            return [...prev.slice(0, idx), mk(), ...prev.slice(idx)];
        });
    };

    const addCol = (e: any, section: number, row: number, at: any) => {
        e?.stopPropagation();

        setData((prev) => {
            const updatedSection = {
                ...prev[section],
                children: prev[section].children.map((r: any, idx: number) => {
                    if (idx === row) {
                        const newCol = {
                            label: "Column",
                            children: [],
                            isNew: true,
                            open: true,
                            id: "col-" + Date.now(),
                        };
                        const newChildren =
                            at === null || at === undefined
                                ? [...r.children, newCol]
                                : [...r.children.slice(0, at), newCol, ...r.children.slice(at)];
                        return { ...r, open: true, children: newChildren };
                    }
                    return r;
                }),
            };
            return [...prev.slice(0, section), updatedSection, ...prev.slice(section + 1)];
        });
    };

    const addRow = (e: any, section: number, at: any) => {
        e?.stopPropagation();

        setData((prev) => {
            const newRow = {
                label: "Row",
                open: true,
                isNew: true,
                children: [
                    {
                        label: "Column",
                        children: [],
                        open: true,
                        isNew: true,
                        id: "col-" + Date.now(),
                    },
                ],
                id: "row-" + Date.now(),
            };

            const sectionObj = prev[section];
            const newChildren =
                at === null || at === undefined
                    ? [...sectionObj.children, newRow]
                    : [...sectionObj.children.slice(0, at), newRow, ...sectionObj.children.slice(at)];

            return [
                ...prev.slice(0, section),
                { ...sectionObj, open: true, children: newChildren },
                ...prev.slice(section + 1),
            ];
        });
    };

    // addElement used by Col "+" menu
    const addElement = (type: string, colIndex: number, rowIndex: number, sectionIndex: number) => {
        const uKey = `${type}-${Date.now()}`;

        const pendingImageData = (window as any).__pendingImageData;
        const imageUrl = pendingImageData?.url || "";
        const imageAlt = pendingImageData?.alt || "";

        setTheEles((prev) => ({
            ...prev,
            [uKey]: {
                type,
                props: (() => {
                    switch (type) {
                        case "Heading":
                            return [{ type: "text", label: "Text" }];
                        case "Text":
                            return [{ type: "text", label: "Text" }];
                        case "Input":
                            return [
                                { type: "text", label: "Label" },
                                { type: "text", label: "Placeholder" },
                                { type: "text", label: "Tooltip" },
                                { type: "checkbox", label: "Required", value: false },
                            ];
                        case "Button":
                            return [{ type: "text", label: "Label" }];
                        case "Image":
                            return [
                                { type: "text", label: "Image URL", value: imageUrl },
                                { type: "text", label: "Title", value: imageAlt || "Untitled Image" },
                                { type: "text", label: "Alt Text", value: imageAlt },
                                { type: "text", label: "Width", value: "auto" },
                                { type: "text", label: "Height", value: "auto" },
                            ];
                        default:
                            return [];
                    }
                })(),
            },
        }));

        setData((prev) =>
            prev.map((section, sIdx) => {
                if (sIdx !== sectionIndex) return section;
                return {
                    ...section,
                    children: section.children.map((row: any, rIdx: number) => {
                        if (rIdx !== rowIndex) return row;
                        return {
                            ...row,
                            children: row.children.map((col: any, cIdx: number) => {
                                if (cIdx !== colIndex) return col;

                                const nextChildren = [...(col.children ?? [])];
                                let insertAt = nextChildren.length;

                                if (typeof currentHoverEle === "string" && currentHoverEle.startsWith("last-ele-")) {
                                    const targetColId = currentHoverEle.replace("last-ele-", "");
                                    if (targetColId === col.id) insertAt = nextChildren.length;
                                } else if (typeof currentHoverEle === "string" && currentHoverEle !== "none") {
                                    const idx = nextChildren.findIndex((r: any) => r?.id === currentHoverEle);
                                    if (idx !== -1) insertAt = idx;
                                }

                                nextChildren.splice(insertAt, 0, { id: uKey });
                                return { ...col, open: true, children: nextChildren };
                            }),
                        };
                    }),
                };
            })
        );
    };

    const removeSection = (sectionIndex: number) => {
        setData((prev) => prev.filter((_, index: number) => index !== sectionIndex));
    };

    const removeRow = (id: string) => {
        setData((prev) =>
            prev.map((section) => ({
                ...section,
                children: section.children.filter((row: any) => row.id !== id),
            }))
        );
    };

    const removeCol = (id: string) => {
        setData((prev) =>
            prev.map((section) => ({
                ...section,
                children: section.children.map((row: any) => ({
                    ...row,
                    children: row.children.filter((col: any) => col.id !== id),
                })),
            }))
        );
    };

    const removeEle = (id: string) => {
        setData((prev) =>
            prev.map((section) => ({
                ...section,
                children: (section.children || []).map((row: any) => ({
                    ...row,
                    children: (row.children || []).map((col: any) => ({
                        ...col,
                        children: (col.children || []).filter((ele: any) => ele.id !== id),
                    })),
                })),
            }))
        );
    };

    const onDragStart = (e: any, id: string) => {
        e.stopPropagation();
        try {
            if (e?.dataTransfer) {
                e.dataTransfer.setData(INTERNAL_DND_MIME, id);
                e.dataTransfer.effectAllowed = cloning ? "copy" : "move";
            }
        } catch { }
        setDragging(id);
    };

    const onDragHover = (e: any, id: string) => {
        e.stopPropagation();
        e.preventDefault();
        if (dragging && dragging !== ASSET_DRAG_ID) setCurrentHoverEle(String(id));
    };

    const insertImageIntoTree = (colId: string, position: number, imageUrl: string, imageAlt: string) => {
        const uKey = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        setTheEles((prev) => ({
            ...prev,
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
        }));

        setData((prev) =>
            prev.map((section: any) => ({
                ...section,
                children: (section.children || []).map((row: any) => ({
                    ...row,
                    children: (row.children || []).map((col: any) => {
                        if (col.id !== colId) return col;
                        const nextChildren = [...(col.children || [])];
                        const safePos = Math.max(0, Math.min(nextChildren.length, position));
                        nextChildren.splice(safePos, 0, { id: uKey });
                        return { ...col, open: true, children: nextChildren };
                    }),
                })),
            }))
        );
    };

    return (
        <div
            className="relative min-h-[300px] pr-3"
            onDragLeave={(e) => {
                if (e.currentTarget === e.target) clearAssetDnD();
            }}
        >
            <Box fontSize="sm" color="fg.secondary">
                {data.map((section: any, sindex: number) => {
                    const showSectionBarAbove =
                        isInternalDrag && dragging && isSectionId(dragging) && currentHoverEle === section.id;

                    return (
                        <div
                            key={sindex}
                            onDragOver={(e) => {
                                // allow dropping section BEFORE this section
                                if (dragging && isSectionId(dragging)) onDragHover(e, section.id);
                            }}
                        >
                            {showSectionBarAbove && <div style={INSERT_BAR_STYLE} />}

                            {!dragging && !data[sindex - 1]?.open && (
                                <div
                                    className="ind group h-2 mx-1 relative z-10 -my-1 -mr-[20px]"
                                    onMouseEnter={(e) => onDragHover(e, section.id)}
                                >
                                    <Box
                                        rounded="full"
                                        className="gap-1 translate-y-0.5 transition duration-500 h-[4px] group-hover:opacity-100 opacity-0 flex items-center justify-center"
                                    >
                                        <Box className="bg-black/5 h-1 w-full" />
                                        <Button
                                            aria-label="Add Section"
                                            size="sm"
                                            appearance="subtle"
                                            className="min-w-6"
                                            onClick={() => addSection(section.id)}
                                            icon={<IconPlus size={16} />}
                                        />
                                        <Box className="bg-black/5 h-1 w-full" />
                                    </Box>
                                </div>
                            )}

                            <Section
                                setOpen={setOpen}
                                section={section}
                                onDragStart={(e: any) => onDragStart(e, section.id)}
                                removeSection={() => removeSection(sindex)}
                                addSection={() => addSection(section.id)}
                                addRow={(e: any) => addRow(e, sindex, null)}
                            >
                                {(section.children ?? []).map((row: any, rIndex: number) => {
                                    const showRowBarAbove =
                                        isInternalDrag && dragging && isRowId(dragging) && currentHoverEle === row.id;

                                    return (
                                        <div
                                            key={rIndex}
                                            onDragOver={(e) => {
                                                if (dragging && isRowId(dragging)) onDragHover(e, row.id);
                                            }}
                                        >
                                            {showRowBarAbove && <div style={INSERT_BAR_STYLE} />}

                                            <Row
                                                row={row}
                                                addRow={(e: any) => addRow(e, sindex, rIndex)}
                                                addRowBelow={(e: any) => addRow(e, sindex, rIndex + 1)}
                                                setOpen={setOpen}
                                                onDragStart={(e: any) => onDragStart(e, row.id)}
                                                removeRow={() => removeRow(row.id)}
                                                addCol={(e: any) => addCol(e, sindex, rIndex, null)}
                                            >
                                                {(row.children ?? []).map((col: any, cIndex: number) => {
                                                    const showColBarAbove =
                                                        isInternalDrag && dragging && isColId(dragging) && currentHoverEle === col.id;

                                                    return (
                                                        <div
                                                            key={cIndex}
                                                            onDragOver={(e) => {
                                                                if (dragging && isColId(dragging)) onDragHover(e, col.id);
                                                            }}
                                                        >
                                                            {showColBarAbove && <div style={INSERT_BAR_STYLE} />}

                                                            <Col
                                                                col={col}
                                                                setOpen={setOpen}
                                                                onDragStart={(e: any) => onDragStart(e, col.id)}
                                                                removeCol={() => removeCol(col.id)}
                                                                addElement={(type: string) => addElement(type, cIndex, rIndex, sindex)}
                                                            >
                                                                <div
                                                                    className={assetOverCol === col.id ? "relative" : ""}
                                                                    onDragEnter={(e) => {
                                                                        if (isImageDrag(e.dataTransfer)) {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            setDragging(ASSET_DRAG_ID);
                                                                            return;
                                                                        }

                                                                        if (isInternalEleDrag(dragging)) {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                        }
                                                                    }}
                                                                    onDragOver={(e) => {
                                                                        if (isImageDrag(e.dataTransfer)) {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();

                                                                            setDragging(ASSET_DRAG_ID);
                                                                            setAssetOverCol(col.id);

                                                                            const wrappers =
                                                                                e.currentTarget.querySelectorAll<HTMLElement>("[data-tree-ele-id]");
                                                                            const mouseY = e.clientY;

                                                                            let insertPosition = (col.children || []).length;
                                                                            for (let k = 0; k < wrappers.length; k++) {
                                                                                const rect = wrappers[k].getBoundingClientRect();
                                                                                const middle = rect.top + rect.height / 2;
                                                                                if (mouseY < middle) {
                                                                                    insertPosition = k;
                                                                                    break;
                                                                                }
                                                                            }

                                                                            setAssetDrop({ colId: col.id, position: insertPosition });
                                                                            return;
                                                                        }

                                                                        if (isInternalEleDrag(dragging)) {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();

                                                                            const wrappers =
                                                                                e.currentTarget.querySelectorAll<HTMLElement>("[data-tree-ele-id]");
                                                                            const mouseY = e.clientY;

                                                                            let insertPosition = (col.children || []).length;
                                                                            for (let k = 0; k < wrappers.length; k++) {
                                                                                const rect = wrappers[k].getBoundingClientRect();
                                                                                const middle = rect.top + rect.height / 2;
                                                                                if (mouseY < middle) {
                                                                                    insertPosition = k;
                                                                                    break;
                                                                                }
                                                                            }

                                                                            setInternalDrop({ colId: col.id, position: insertPosition });

                                                                            const colChildren = col.children || [];
                                                                            const hoverId =
                                                                                insertPosition >= colChildren.length
                                                                                    ? `last-ele-${col.id}`
                                                                                    : (colChildren[insertPosition]?.id ?? `last-ele-${col.id}`);

                                                                            setCurrentHoverEle(hoverId);
                                                                        }
                                                                    }}
                                                                    onDragLeave={(e) => {
                                                                        e.stopPropagation();
                                                                        if (e.currentTarget === e.target) {
                                                                            setAssetOverCol(null);
                                                                            setAssetDrop(null);
                                                                            setInternalDrop(null);
                                                                        }
                                                                    }}
                                                                    onDrop={(e) => {
                                                                        if (isImageDrag(e.dataTransfer)) {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();

                                                                            const url = getDraggedImageUrl(e.dataTransfer);
                                                                            const alt = getDraggedAlt(e.dataTransfer);

                                                                            const dp = assetDrop;
                                                                            clearAssetDnD();

                                                                            if (!url || !dp || dp.colId !== col.id) return;
                                                                            insertImageIntoTree(dp.colId, dp.position, url, alt);
                                                                            return;
                                                                        }

                                                                        if (isInternalEleDrag(dragging)) {
                                                                            setInternalDrop(null);
                                                                        }
                                                                    }}
                                                                >
                                                                    {(col.children ?? []).length === 0 && assetOverCol === col.id && (
                                                                        <div
                                                                            style={{
                                                                                border: "2px dashed #0037FF",
                                                                                borderRadius: "8px",
                                                                                padding: "16px",
                                                                                textAlign: "center",
                                                                                color: "#0037FF",
                                                                                fontSize: "12px",
                                                                                backgroundColor: "rgba(0, 55, 255, 0.05)",
                                                                                margin: "6px 0",
                                                                            }}
                                                                        >
                                                                            Drop image here
                                                                        </div>
                                                                    )}

                                                                    {(col.children ?? []).map((element: any, j: number) => {
                                                                        const isAssetActive = assetOverCol === col.id && assetDrop?.colId === col.id;
                                                                        const isInternalActive =
                                                                            isInternalEleDrag(dragging) && internalDrop?.colId === col.id;

                                                                        return (
                                                                            <React.Fragment key={"ele-frag-" + element.id}>
                                                                                {isInternalActive && internalDrop?.position === j && <div style={INSERT_BAR_STYLE} />}
                                                                                {isAssetActive && assetDrop?.position === j && <div style={INSERT_BAR_STYLE} />}

                                                                                <div data-tree-ele-id={element.id}>
                                                                                    <Ele
                                                                                        removeEle={() => removeEle(element.id)}
                                                                                        onDragStart={(ev: any) => onDragStart(ev, element.id)}
                                                                                        type={theEles[element.id]?.type}
                                                                                        element={element}
                                                                                        label={theEles[element.id]?.props?.[0]?.value || undefined}
                                                                                        setCurrentEle={setCurrentEle}
                                                                                        setCurrentHoverEle={setCurrentHoverEle}
                                                                                    />
                                                                                </div>
                                                                            </React.Fragment>
                                                                        );
                                                                    })}

                                                                    {isInternalEleDrag(dragging) &&
                                                                        internalDrop?.colId === col.id &&
                                                                        internalDrop?.position === (col.children ?? []).length && <div style={INSERT_BAR_STYLE} />}

                                                                    {assetOverCol === col.id &&
                                                                        assetDrop?.colId === col.id &&
                                                                        assetDrop?.position === (col.children ?? []).length && <div style={INSERT_BAR_STYLE} />}
                                                                </div>
                                                            </Col>

                                                            {cIndex === (row.children ?? []).length - 1 && (
                                                                <div
                                                                    onDragOver={(e) => {
                                                                        if (dragging && isColId(dragging)) onDragHover(e, `col-last-${row.id}`);
                                                                    }}
                                                                >
                                                                    {isInternalDrag &&
                                                                        dragging &&
                                                                        isColId(dragging) &&
                                                                        currentHoverEle === `col-last-${row.id}` && <div style={INSERT_BAR_STYLE} />}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                                {(row.children ?? []).length === 0 && (
                                                    <div
                                                        onDragOver={(e) => {
                                                            if (dragging && isColId(dragging)) onDragHover(e, `col-last-${row.id}`);
                                                        }}
                                                    >
                                                        {isInternalDrag &&
                                                            dragging &&
                                                            isColId(dragging) &&
                                                            currentHoverEle === `col-last-${row.id}` && <div style={INSERT_BAR_STYLE} />}
                                                    </div>
                                                )}
                                            </Row>

                                            {rIndex === (section.children ?? []).length - 1 && (
                                                <div
                                                    onDragOver={(e) => {
                                                        if (dragging && isRowId(dragging)) onDragHover(e, `row-last-${section.id}`);
                                                    }}
                                                >
                                                    {isInternalDrag &&
                                                        dragging &&
                                                        isRowId(dragging) &&
                                                        currentHoverEle === `row-last-${section.id}` && <div style={INSERT_BAR_STYLE} />}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {(section.children ?? []).length === 0 && (
                                    <div
                                        onDragOver={(e) => {
                                            if (dragging && isRowId(dragging)) onDragHover(e, `row-last-${section.id}`);
                                        }}
                                        style={{ height: 10 }}
                                    >
                                        {isInternalDrag &&
                                            dragging &&
                                            isRowId(dragging) &&
                                            currentHoverEle === `row-last-${section.id}` && <div style={INSERT_BAR_STYLE} />}
                                    </div>
                                )}
                            </Section>

                            {sindex === data.length - 1 && (
                                <div
                                    onDragOver={(e) => {
                                        if (dragging && isSectionId(dragging)) onDragHover(e, "section-last");
                                    }}
                                    style={{ height: 10 }}
                                >
                                    {isInternalDrag &&
                                        dragging &&
                                        isSectionId(dragging) &&
                                        currentHoverEle === "section-last" && <div style={INSERT_BAR_STYLE} />}
                                </div>
                            )}
                        </div>
                    );
                })}

                {data.length === 0 && (
                    <div
                        onDragOver={(e) => {
                            if (dragging && isSectionId(dragging)) onDragHover(e, "section-last");
                        }}
                        style={{ height: 10 }}
                    >
                        {isInternalDrag &&
                            dragging &&
                            isSectionId(dragging) &&
                            currentHoverEle === "section-last" && <div style={INSERT_BAR_STYLE} />}
                    </div>
                )}
            </Box>
        </div>
    );
}
