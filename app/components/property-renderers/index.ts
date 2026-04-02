/**
 * Central registration for all property renderers
 * Import this file to ensure all renderers are registered
 */

import { registerPropertyRenderer } from "./PropertyRendererRegistry";
import { StringRenderer } from "./text/StringRenderer";
import { LongStringRenderer } from "./text/LongStringRenderer";
import { XhtmlStringRenderer } from "./text/XhtmlStringRenderer";
import { IntRenderer } from "./number/IntRenderer";
import { BooleanRenderer } from "./other/BooleanRenderer";
import { DateTimeRenderer } from "./other/DateTimeRenderer";
import { GuidRenderer } from "./other/GuidRenderer";
import { UrlRenderer } from "./link/UrlRenderer";
import { SelectOneRenderer } from "./selection/SelectOneRenderer";
import { ContentReferenceRenderer } from "./reference/ContentReferenceRenderer";
import { ImageReferenceRenderer } from "./reference/ImageReferenceRenderer";

// Register all renderers
// Order matters - first match wins, so more specific matchers should come first

// Content references (Media, Block types)
registerPropertyRenderer({
	type: "ContentReference",
	component: ContentReferenceRenderer,
});

// Legacy ImageReference
registerPropertyRenderer({
	type: "ImageReference",
	component: ImageReferenceRenderer,
});

// Rich text
registerPropertyRenderer({
	type: "XhtmlString",
	component: XhtmlStringRenderer,
});

// Text types
registerPropertyRenderer({
	type: ["String", "text"],
	component: StringRenderer,
});

registerPropertyRenderer({
	type: ["LongString", "textarea"],
	component: LongStringRenderer,
});

// Link/URL
registerPropertyRenderer({
	type: ["Url", "link"],
	component: UrlRenderer,
});

// Numbers
registerPropertyRenderer({
	type: "Int",
	component: IntRenderer,
});

// Boolean
registerPropertyRenderer({
	type: ["Boolean", "checkbox"],
	component: BooleanRenderer,
});

// Selection
registerPropertyRenderer({
	type: "SelectOne",
	component: SelectOneRenderer,
});

// DateTime
registerPropertyRenderer({
	type: "DateTime",
	component: DateTimeRenderer,
});

// Guid
registerPropertyRenderer({
	type: "Guid",
	component: GuidRenderer,
});

// Re-export main components
export { PropertyRenderer } from "./PropertyRenderer";
export { getRendererForProperty } from "./PropertyRendererRegistry";
export type { PropertyRendererProps, PropertyRendererContext } from "./types";
