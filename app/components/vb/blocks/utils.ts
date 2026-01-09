export function getProperty(properties: any, key: string, label: string) {
    if (Array.isArray(properties)) {
        return properties.find((p: any) => p.label === label)?.value;
    }
    return properties?.[key]?.value;
}
