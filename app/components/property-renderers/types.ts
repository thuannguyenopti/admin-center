import React from "react";
import { Property, PropertyType, ContentType } from "@/app/db/initialData";

// Base props for all renderers
export interface PropertyRendererProps {
	property: Property;
	value: any;
	onChange: (value: any) => void;
	enableAI?: boolean;
	error?: string;
	context?: PropertyRendererContext;
	mode?: "edit" | "readonly";
	className?: string;
}

// Context data available to renderers
export interface PropertyRendererContext {
	// For categories/tags
	availableCategories?: { name: string; slug: string }[];
	availableTags?: { name: string; slug: string }[];
	onCreateCategory?: (name: string) => void;
	onCreateTag?: (name: string) => void;

	// For content references
	contentTypes?: ContentType[];
	runtimeContentTypes?: ContentType[];

	// For parent context
	pageId?: string;
	pageName?: string;
}

// Renderer component type
export type PropertyRendererComponent = React.FC<PropertyRendererProps>;

// Registry entry
export interface PropertyRendererRegistryEntry {
	type: PropertyType | PropertyType[];
	component: PropertyRendererComponent;
	matcher?: (property: Property, context?: PropertyRendererContext) => boolean;
}
