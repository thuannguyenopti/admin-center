import {
	IconBrandFigma,
	IconBrandGoogle,
	IconBrandSlack,
	IconBrandNotion,
	IconBrandAirtable,
	IconBrandGithub,
	IconBrandAsana,
} from "@/app/lib/axiom-icons";

export type ToolMeta = {
	icon: React.ReactNode;
	color: string;
	name: string;
	textLabel?: string;
};

export const TOOL_ICONS: Record<string, ToolMeta> = {
	figma:      { icon: <IconBrandFigma size={16} />,    color: "#9b59b6", name: "Figma" },
	google:     { icon: <IconBrandGoogle size={16} />,   color: "#4285F4", name: "Google" },
	slack:      { icon: <IconBrandSlack size={16} />,    color: "#4A154B", name: "Slack" },
	notion:     { icon: <IconBrandNotion size={16} />,   color: "#000000", name: "Notion" },
	airtable:   { icon: <IconBrandAirtable size={16} />, color: "#18BFFF", name: "Airtable" },
	github:     { icon: <IconBrandGithub size={16} />,   color: "#24292e", name: "GitHub" },
	asana:      { icon: <IconBrandAsana size={16} />,    color: "#F06A6A", name: "Asana" },
	salesforce: { icon: null, color: "#00A1E0", name: "Salesforce", textLabel: "SF" },
	hubspot:    { icon: null, color: "#FF7A59", name: "HubSpot",    textLabel: "HS" },
	"opti-cms":                 { icon: null, color: "#0037FF", name: "Optimizely CMS",              textLabel: "CMS" },
	"opti-cmp":                 { icon: null, color: "#0d46a0", name: "Content Marketing Platform", textLabel: "CMP" },
	"opti-web-experimentation": { icon: null, color: "#4c1d95", name: "Web Experimentation",        textLabel: "WEX" },
	"opti-odp":                 { icon: null, color: "#17492b", name: "Optimizely Data Platform",   textLabel: "ODP" },
};
