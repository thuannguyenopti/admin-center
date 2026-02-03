import { initialContentTypes } from "@/app/db/initialData";

export function getPropertiesForContentType(contentTypeId: string) {
    const ct = initialContentTypes.find((c) => c.id === contentTypeId);
    return ct?.properties || [];
}
