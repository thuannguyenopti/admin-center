"use client";

import React from "react";
import { getProperty } from "./utils";

export const ImageBlock = React.memo(function ImageBlock({ properties, hasBgImage }: { properties: any, hasBgImage?: boolean }) {
    // Read from ImageReference property
    const imageUrl = getProperty(properties, "image", "Image");

    // Read optional layout overrides
    const widthOverride = getProperty(properties, "width", "Width Override") || "auto";
    const heightOverride = getProperty(properties, "height", "Height Override") || "auto";

    // Parse URL
    const imageUrlStr = typeof imageUrl === "string" ? imageUrl.trim() : imageUrl;

    return (
        <div className="mb-4">
            {imageUrlStr ? (
                <img
                    src={imageUrlStr}
                    alt=""
                    style={{
                        width: widthOverride === "auto" ? "100%" : widthOverride,
                        height: heightOverride === "auto" ? "auto" : heightOverride,
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
