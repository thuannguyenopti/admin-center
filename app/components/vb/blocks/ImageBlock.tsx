"use client";

import React from "react";
import { getProperty } from "./utils";

export const ImageBlock = React.memo(function ImageBlock({ properties, hasBgImage }: { properties: any, hasBgImage?: boolean }) {
    const imageUrlRaw = getProperty(properties, "imageUrl", "Image URL");
    const imageUrl = typeof imageUrlRaw === "string" ? imageUrlRaw.trim() : imageUrlRaw;
    const imageAlt = getProperty(properties, "altText", "Alt Text");
    const imageWidth = getProperty(properties, "width", "Width");
    const imageHeight = getProperty(properties, "height", "Height");

    return (
        <div className="mb-4">
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={imageAlt || "Image"}
                    style={{
                        width: imageWidth === "auto" ? "100%" : imageWidth,
                        height: imageHeight === "auto" ? "auto" : imageHeight,
                        borderRadius: "10px",
                        objectFit: "cover",
                    }}
                />
            ) : (
                <div className="border border-[#ffffff33] bg-[#ffffff0d] text-center text-white/80 rounded-[10px] p-6 text-sm">
                    No image selected
                </div>
            )}
        </div>
    );
});
