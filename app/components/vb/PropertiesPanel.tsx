"use client";


import React from "react";
import {
    Box,
    Field,
    Text,
    Input as Input2,
    Select,
    SelectTrigger,
    SelectContent,
    Textarea,
} from "@optiaxiom/react";
import { getPropertiesForContentType } from "./getPropertiesForContentType";

export type PageProperties = {
    [key: string]: any;
};

type Props = {
    value: PageProperties;
    onChange: (patch: Partial<PageProperties>) => void;
    contentTypeId?: string;
};


export default function PropertiesPanel({ value, onChange, contentTypeId }: Props) {
    // Dynamically get property definitions from initialData
    const properties = contentTypeId ? getPropertiesForContentType(contentTypeId) : [];

    return (
        <Box pl="24" py="16" fontSize="sm">
            {properties.length > 0 ? (
                <Box display="flex" flexDirection="column" gap="16">
                    {properties.map((prop) => {
                        if (prop.type === "text") {
                            return (
                                <Field key={prop.id} label={prop.name}>
                                    <Input2
                                        placeholder={`Enter ${prop.name.toLowerCase()}`}
                                        value={value[prop.id] ?? ""}
                                        onChange={(e: any) => onChange({ [prop.id]: e.target.value })}
                                    />
                                </Field>
                            );
                        }
                        if (prop.type === "textarea" || prop.type === "richtext") {
                            return (
                                <Field key={prop.id} label={prop.name}>
                                    <Textarea
                                        placeholder={`Enter ${prop.name.toLowerCase()}`}
                                        rows={3}
                                        value={value[prop.id] ?? ""}
                                        onChange={(e: any) => onChange({ [prop.id]: e.target.value })}
                                    />
                                </Field>
                            );
                        }
                        if (prop.type === "checkbox") {
                            return (
                                <Field key={prop.id} label={prop.name}>
                                    <input
                                        type="checkbox"
                                        checked={!!value[prop.id]}
                                        onChange={(e: any) => onChange({ [prop.id]: e.target.checked })}
                                    />
                                </Field>
                            );
                        }
                        if (prop.type === "seo") {
                            // Render all SEO fields for the current locale/variant (assume en/original for now)
                            const seoValue = (value[prop.id]?.en?.original) || {};
                            const setSeoField = (field: string, fieldValue: string) => {
                                onChange({
                                    [prop.id]: {
                                        ...value[prop.id],
                                        en: {
                                            ...(value[prop.id]?.en || {}),
                                            original: {
                                                ...(value[prop.id]?.en?.original || {}),
                                                [field]: fieldValue,
                                            },
                                        },
                                    },
                                });
                            };
                            return (
                                <Box key={prop.id} display="flex" flexDirection="column" gap="8" p="8" border="1" borderColor="border.tertiary">
                                    <Text fontWeight="600" mb="4">SEO</Text>
                                    <Field label="Title">
                                        <Input2 value={seoValue.title || ""} onChange={e => setSeoField("title", e.target.value)} />
                                    </Field>
                                    <Field label="Description">
                                        <Textarea value={seoValue.description || ""} onChange={e => setSeoField("description", e.target.value)} rows={2} />
                                    </Field>
                                    <Field label="Canonical URL">
                                        <Input2 value={seoValue.canonicalUrl || ""} onChange={e => setSeoField("canonicalUrl", e.target.value)} />
                                    </Field>
                                    <Field label="Robots">
                                        <Input2 value={seoValue.robots || ""} onChange={e => setSeoField("robots", e.target.value)} />
                                    </Field>
                                    <Field label="Image URL">
                                        <Input2 value={seoValue.image || ""} onChange={e => setSeoField("image", e.target.value)} />
                                    </Field>
                                    <Field label="Open Graph Title">
                                        <Input2 value={seoValue.ogTitle || ""} onChange={e => setSeoField("ogTitle", e.target.value)} />
                                    </Field>
                                    <Field label="Open Graph Description">
                                        <Textarea value={seoValue.ogDescription || ""} onChange={e => setSeoField("ogDescription", e.target.value)} rows={2} />
                                    </Field>
                                    <Field label="Open Graph Image">
                                        <Input2 value={seoValue.ogImage || ""} onChange={e => setSeoField("ogImage", e.target.value)} />
                                    </Field>
                                    <Field label="Twitter Title">
                                        <Input2 value={seoValue.twitterTitle || ""} onChange={e => setSeoField("twitterTitle", e.target.value)} />
                                    </Field>
                                    <Field label="Twitter Description">
                                        <Textarea value={seoValue.twitterDescription || ""} onChange={e => setSeoField("twitterDescription", e.target.value)} rows={2} />
                                    </Field>
                                    <Field label="Twitter Image">
                                        <Input2 value={seoValue.twitterImage || ""} onChange={e => setSeoField("twitterImage", e.target.value)} />
                                    </Field>
                                </Box>
                            );
                        }
                        // For future: handle select/reference types
                        // Add more types as needed
                        return null;
                    })}
                </Box>
            ) : null}
        </Box>
    );
}
