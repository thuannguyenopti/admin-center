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

export type PageProperties = {
    seoTitle?: string;
    keywords?: string;
    description?: string;
    meta?: string;
    campaignMode?: "no" | "yes";
    someOtherSetting?: "setting1" | "setting2";
};

type Props = {
    value: PageProperties;
    onChange: (patch: Partial<PageProperties>) => void;
};

export default function PropertiesPanel({ value, onChange }: Props) {
    return (
        <Box pl="24" py="16" fontSize="sm">
            <Box mb="16">
                <Text fontSize="sm" fontWeight="600" mb="8">
                    SEO
                </Text>

                <Box display="flex" flexDirection="column" gap="8">
                    <Field label="Title">
                        <Input2
                            placeholder="Enter page title"
                            value={value.seoTitle ?? ""}
                            onChange={(e: any) => onChange({ seoTitle: e.target.value })}
                        />
                    </Field>

                    <Field label="Keywords">
                        <Input2
                            placeholder="Enter keywords"
                            value={value.keywords ?? ""}
                            onChange={(e: any) => onChange({ keywords: e.target.value })}
                        />
                    </Field>

                    <Field label="Description">
                        <Textarea
                            placeholder="Enter description"
                            rows={3}
                            value={value.description ?? ""}
                            onChange={(e: any) => onChange({ description: e.target.value })}
                        />
                    </Field>

                    <Field label="Meta">
                        <Textarea
                            placeholder="Enter meta information"
                            rows={3}
                            value={value.meta ?? ""}
                            onChange={(e: any) => onChange({ meta: e.target.value })}
                        />
                    </Field>
                </Box>
            </Box>

            <Box>
                <Text fontSize="sm" fontWeight="600" mb="8">
                    Settings
                </Text>

                <Box display="flex" flexDirection="column" gap="8">
                    <Field label="Campaign Mode">
                        <Select
                            value={value.campaignMode ?? "no"}
                            onValueChange={(v: any) => onChange({ campaignMode: v })}
                            options={[
                                { label: "No", value: "no" },
                                { label: "Yes", value: "yes" },
                            ]}
                        >
                            <SelectTrigger>{value.campaignMode ?? "no"}</SelectTrigger>
                            <SelectContent />
                        </Select>
                    </Field>

                    <Field label="Some other setting">
                        <Select
                            value={value.someOtherSetting ?? "setting1"}
                            onValueChange={(v: any) => onChange({ someOtherSetting: v })}
                            options={[
                                { label: "A setting", value: "setting1" },
                                { label: "Another setting", value: "setting2" },
                            ]}
                        >
                            <SelectTrigger>{value.someOtherSetting ?? "setting1"}</SelectTrigger>
                            <SelectContent />
                        </Select>
                    </Field>
                </Box>
            </Box>
        </Box>
    );
}
