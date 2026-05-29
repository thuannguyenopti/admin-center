export function getProperty(properties: any, key: string, label: string) {
    if (Array.isArray(properties)) {
        return properties.find((p: any) => p.label === label)?.value;
    }
    // Direct value format (after display template migration)
    return properties?.[key];
}

export const VB_INTERNAL_MIME = "application/x-vb-internal";

export const isImageDrag = (dt: DataTransfer) => {
    const types = Array.from(dt?.types || []);
    // Ensure it's not an internal VB drag
    if (types.includes(VB_INTERNAL_MIME)) return false;

    return (
        types.includes("image/url") ||
        types.includes("text/uri-list") ||
        types.includes("image/id") ||
        types.includes("Files")
    );
};

export const isInternalDrag = (dt: DataTransfer) => {
    const types = Array.from(dt?.types || []);
    return types.includes(VB_INTERNAL_MIME);
};

export const isValidVBDrag = (dt: DataTransfer) => isImageDrag(dt) || isInternalDrag(dt);
