import React from "react";
import GoogleAnalyticsPanel from "@/app/extensions/google/GoogleAnalyticsPanel";
import ImageSelectorPanel from "@/app/extensions/ImageSelector/ImageSelectorPanel";
import VariationsPanel from "@/app/extensions/variations/VariationsPanel";
import extensionConfig from "./extensions.json";

// Types
export type ExtensionId = string;

export interface ExtensionDefinition {
	id?: ExtensionId;
	label?: string;
	width?: number;
	maxWidth?: number;
	type?: "separator" | "item";
	icon?: React.ReactNode;
	component?: React.ComponentType<any>;
}

// Helper to render SVG string
const SvgIcon = ({svgString}: {svgString: string}) => (
	<div
		style={{display: "contents"}}
		className="extension-icon"
		dangerouslySetInnerHTML={{__html: svgString}}
	/>
);

const empty = () => <div>Nothing here yet</div>;

// Map for Panels (Components + Manifests)
const panelMap: Record<string, {component: React.ComponentType<any>}> = {
	folders: {component: ImageSelectorPanel},
	google: {component: GoogleAnalyticsPanel},
	variations: {component: VariationsPanel},
	smile: {component: empty},
	stride: {component: empty},
	teams: {component: empty},
};

// Merged Registry
export const extensions: ExtensionDefinition[] = extensionConfig.map((item: any) => {
	const isSeparator = item.type === "separator";
	const entry: ExtensionDefinition = {
		...item,
		type: isSeparator ? "separator" : "item",
	};

	if (!isSeparator && item.icon) {
		entry.icon = <SvgIcon svgString={item.icon} />;
	}

	if (!isSeparator && item.id && panelMap[item.id]) {
		entry.component = panelMap[item.id].component;
	}

	return entry;
});

export const getExtensionById = (id: string) => extensions.find((e) => e.id === id);
