"use client";

import React, { useState } from "react";
import {
    Box,
    Field,
    Text,
    Input as Input2,
    Select,
    SelectTrigger,
    SelectContent,
    Textarea,
    Badge,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Input,
} from "@optiaxiom/react";
import { IconChevronRight, IconCheck, IconX } from "@tabler/icons-react";
import { useGlobalTags } from "@/app/cms/hooks/useGlobalTags";
import { useGlobalCategories } from "@/app/cms/hooks/useGlobalCategories";

export type PageProperties = {
    seoTitle?: string;
    keywords?: string;
    description?: string;
    meta?: string;
    campaignMode?: "no" | "yes";
    someOtherSetting?: "setting1" | "setting2";
    categories?: string[]; // array of category slugs
    tags?: string[]; // array of tag slugs
};

export type PropertySection = "menu" | "content-settings" | "geo-seo" | "categories-tags";

type Props = {
    value: PageProperties;
    onChange: (patch: Partial<PageProperties>) => void;
    activeSection?: PropertySection;
    onSectionChange?: (section: PropertySection) => void;
};

export const navigationItems = [
    { id: "content-settings" as const, label: "Content settings" },
    { id: "geo-seo" as const, label: "GEO & SEO" },
    { id: "categories-tags" as const, label: "Categories & Tags" },
];

// Autocomplete input component for categories/tags
function AutocompleteMultiSelect({
    label,
    placeholder,
    selectedItems,
    availableItems,
    onAdd,
    onRemove,
    onCreateNew,
    itemExists,
    getItemLabel,
}: {
    label: string;
    placeholder: string;
    selectedItems: string[];
    availableItems: { name: string; slug: string }[];
    onAdd: (slug: string) => void;
    onRemove: (slug: string) => void;
    onCreateNew?: (name: string) => void;
    itemExists: (name: string) => boolean;
    getItemLabel: (slug: string) => string | undefined;
}) {
    const [inputValue, setInputValue] = useState("");
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    // Filter available items based on input
    const filteredItems = availableItems.filter(
        (item) =>
            !inputValue ||
            item.name.toLowerCase().includes(inputValue.toLowerCase())
    );

    // Create options for autocomplete dropdown
    const autocompleteOptions = filteredItems.map((item) => ({
        label: item.name,
        value: item.slug,
        isSelected: selectedItems.includes(item.slug),
    }));

    // Add custom item option if input doesn't match any available item
    const inputMatchesExisting = availableItems.some(
        (item) => item.name.toLowerCase() === inputValue.toLowerCase()
    );
    if (inputValue.trim() && !inputMatchesExisting && onCreateNew) {
        autocompleteOptions.push({
            label: `+ Add "${inputValue}"`,
            value: `__new__${inputValue}`,
            isSelected: false,
        });
    }

    const handleSelect = (option: { value: string; label: string }) => {
        if (option.value.startsWith("__new__")) {
            const newName = option.value.replace("__new__", "");
            onCreateNew?.(newName);
            // After creating, we need to wait for the item to be added
            // The parent component should handle this
        } else {
            if (selectedItems.includes(option.value)) {
                onRemove(option.value);
            } else {
                onAdd(option.value);
            }
        }
        setInputValue("");
        setIsOpen(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && autocompleteOptions.length > 0) {
            handleSelect(autocompleteOptions[0]);
        }
    };

    return (
        <Box display="flex" flexDirection="column" gap="8">
            <Text fontSize="sm" fontWeight="500" color="fg.default">
                {label}
            </Text>

            {/* Selected Items Display */}
            {selectedItems.length > 0 && (
                <Box display="flex" flexWrap="wrap" gap="6">
                    {selectedItems.map((slug) => {
                        const displayLabel = getItemLabel(slug) || slug;
                        return (
                            <Badge key={slug} intent="neutral">
                                <Box display="flex" alignItems="center" gap="4">
                                    <span>{displayLabel}</span>
                                    <button
                                        onClick={() => onRemove(slug)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            padding: "0",
                                            display: "flex",
                                            alignItems: "center",
                                            fontSize: "14px",
                                            fontWeight: "500",
                                            lineHeight: "1",
                                            color: "inherit",
                                        }}
                                        aria-label={`Remove ${displayLabel}`}
                                    >
                                        <IconX size={12} />
                                    </button>
                                </Box>
                            </Badge>
                        );
                    })}
                </Box>
            )}

            {/* Autocomplete Input */}
            <Popover open={isOpen && autocompleteOptions.length > 0} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Box>
                        <Input
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                setIsOpen(true);
                            }}
                            onFocus={() => setIsOpen(true)}
                            onKeyPress={handleKeyPress}
                            placeholder={placeholder}
                            size="md"
                        />
                    </Box>
                </PopoverTrigger>
                <PopoverContent
                    side="bottom"
                    sideOffset={4}
                    align="start"
                    style={{ width: "var(--radix-popover-trigger-width)" }}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    <Box
                        display="flex"
                        flexDirection="column"
                        gap="0"
                        py="2"
                        style={{ maxHeight: "200px" }}
                        overflow="auto"
                    >
                        {autocompleteOptions.length === 0 ? (
                            <Box px="8" py="6">
                                <Text fontSize="sm" color="fg.secondary">
                                    No results found
                                </Text>
                            </Box>
                        ) : (
                            autocompleteOptions.map((option, index) => (
                                <Box
                                    key={option.value}
                                    display="flex"
                                    alignItems="center"
                                    gap="8"
                                    px="8"
                                    py="6"
                                    rounded="sm"
                                    cursor="pointer"
                                    transition="colors"
                                    bg={hoveredIndex === index ? "bg.secondary" : "transparent"}
                                    onClick={() => handleSelect(option)}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    {option.isSelected && (
                                        <IconCheck size={14} style={{ flexShrink: 0 }} />
                                    )}
                                    <Text
                                        fontSize="sm"
                                        color={option.value.startsWith("__new__") ? "fg.accent" : "fg.default"}
                                        style={{ marginLeft: option.isSelected ? 0 : undefined }}
                                    >
                                        {option.label}
                                    </Text>
                                </Box>
                            ))
                        )}
                    </Box>
                </PopoverContent>
            </Popover>
        </Box>
    );
}

export default function PropertiesPanel({ value, onChange, activeSection = "menu", onSectionChange }: Props) {
    // Get global tags and categories from CMS settings
    const { tags: allTags, tagNames: availableTagNames, addTag, tagExists } = useGlobalTags();
    const { categories: allCategories, categoryNames: availableCategoryNames, addCategory, categoryExists, getCategoryNameBySlug } = useGlobalCategories();

    // Component is now controlled by parent
    const handleSectionChange = (section: PropertySection) => {
        onSectionChange?.(section);
    };

    // Categories handlers
    const selectedCategories = value.categories || [];
    const categoriesWithSlugs = allCategories.map((cat: any) => ({ name: cat.name, slug: cat.slug }));

    const handleAddCategory = (slug: string) => {
        if (!selectedCategories.includes(slug)) {
            onChange({ categories: [...selectedCategories, slug] });
        }
    };

    const handleRemoveCategory = (slug: string) => {
        onChange({ categories: selectedCategories.filter((s) => s !== slug) });
    };

    const handleCreateCategory = (name: string) => {
        addCategory(name);
        // Generate slug from name
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
        // Add to selected after a brief delay to allow state to update
        setTimeout(() => {
            onChange({ categories: [...selectedCategories, slug] });
        }, 50);
    };

    // Tags handlers
    const selectedTags = value.tags || [];
    const tagsWithSlugs = allTags.map((tag: any) => ({ name: tag.name, slug: tag.slug }));

    const handleAddTag = (slug: string) => {
        if (!selectedTags.includes(slug)) {
            onChange({ tags: [...selectedTags, slug] });
        }
    };

    const handleRemoveTag = (slug: string) => {
        onChange({ tags: selectedTags.filter((s) => s !== slug) });
    };

    const handleCreateTag = (name: string) => {
        addTag(name);
        // Generate slug from name
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
        // Add to selected after a brief delay to allow state to update
        setTimeout(() => {
            onChange({ tags: [...selectedTags, slug] });
        }, 50);
    };

    const getTagNameBySlug = (slug: string): string | undefined => {
        const tag = allTags.find((t: any) => t.slug === slug);
        return tag?.name;
    };

    // Render section-specific content
    const renderSectionContent = () => {
        switch (activeSection) {
            case "content-settings":
                return (
                    <Box display="flex" flexDirection="column" gap="8">
                        <Field label="Content Type">
                            <Input2 placeholder="Enter content type" />
                        </Field>
                        <Field label="Status">
                            <Select
                                options={[
                                    { label: "Draft", value: "draft" },
                                    { label: "Published", value: "published" },
                                ]}
                            >
                                <SelectTrigger>Draft</SelectTrigger>
                                <SelectContent />
                            </Select>
                        </Field>
                    </Box>
                );

            case "geo-seo":
                return (
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
                );

            case "categories-tags":
                return (
                    <Box display="flex" flexDirection="column" gap="20">
                        <AutocompleteMultiSelect
                            label="Categories"
                            placeholder="Search categories..."
                            selectedItems={selectedCategories}
                            availableItems={categoriesWithSlugs}
                            onAdd={handleAddCategory}
                            onRemove={handleRemoveCategory}
                            onCreateNew={handleCreateCategory}
                            itemExists={categoryExists}
                            getItemLabel={getCategoryNameBySlug}
                        />

                        <AutocompleteMultiSelect
                            label="Tags"
                            placeholder="Search tags..."
                            selectedItems={selectedTags}
                            availableItems={tagsWithSlugs}
                            onAdd={handleAddTag}
                            onRemove={handleRemoveTag}
                            onCreateNew={handleCreateTag}
                            itemExists={tagExists}
                            getItemLabel={getTagNameBySlug}
                        />
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <div className="h-full overflow-hidden">
            <div
                className="flex w-[200%] h-full transition-transform duration-300 ease-out will-change-transform"
                style={{
                    transform: activeSection === "menu" ? "translateX(0%)" : "translateX(-50%)",
                }}
            >
                {/* PANE 1: Properties Menu */}
                <div className="min-w-[50%] w-[50%] h-full flex flex-col">
                    <Box display="flex" flexDirection="column" w="full">
                        {navigationItems.map((item) => (
                            <Box
                                key={item.id}
                                pl="24"
                                pr="12"
                                py="8"
                                w="full"
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                cursor="pointer"
                                className="hover:bg-[var(--ax-colors-bg-default-hovered)] transition-colors"
                                onClick={() => handleSectionChange(item.id)}
                                style={{
                                    fontSize: '14px',
                                }}
                            >
                                <Text fontSize="sm">{item.label}</Text>
                                <IconChevronRight 
                                    size={16} 
                                    style={{ 
                                        opacity: 0.6,
                                        flexShrink: 0,
                                    }}
                                />
                            </Box>
                        ))}
                    </Box>
                </div>

                {/* PANE 2: Property Subsection Detail */}
                <div className="min-w-[50%] w-[50%] h-full flex flex-col">
                    {/* Section content */}
                    <Box px="24" py="16" style={{ overflowY: 'auto', flex: 1 }}>
                        {renderSectionContent()}
                    </Box>
                </div>
            </div>
        </div>
    );
}
