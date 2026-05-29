/**
 * Template System for CMS Elements and Sections
 *
 * This system allows AI and users to change visual styling without modifying content.
 * Templates use semantic tags that the AI can map from natural language requests.
 */

export type TemplateDefinition = {
    id: string;
    label: string;
    description: string;
    semanticTags: string[]; // For AI natural language mapping
    cssClasses: string;
    conditionalClasses?: (props: any) => string;
};

export type ElementTemplates = {
    [elementType: string]: {
        defaultTemplate: string;
        templates: TemplateDefinition[];
    };
};

export type SectionTemplates = {
    defaultTemplate: string;
    templates: TemplateDefinition[];
};

/**
 * Element Templates
 * Each element type has multiple visual templates that can be swapped
 */
export const ELEMENT_TEMPLATES: ElementTemplates = {
    "ct-heading": {
        defaultTemplate: "default",
        templates: [
            {
                id: "default",
                label: "Default",
                description: "Standard heading style",
                semanticTags: ["default", "normal", "standard"],
                cssClasses: "text-3xl md:text-4xl font-semibold leading-tight",
                conditionalClasses: (props) => {
                    const { hasBgImage } = props;
                    return hasBgImage ? "text-white" : "text-gray-900";
                }
            },
            {
                id: "prominent",
                label: "Prominent",
                description: "Large, hero-style heading",
                semanticTags: ["prominent", "large", "hero", "big", "emphasize", "bold"],
                cssClasses: "text-5xl md:text-6xl font-bold leading-tight",
                conditionalClasses: (props) => {
                    const { hasBgImage } = props;
                    return hasBgImage ? "text-white" : "text-gray-900";
                }
            },
            {
                id: "subtle",
                label: "Subtle",
                description: "Smaller, understated heading",
                semanticTags: ["subtle", "small", "minimal", "quiet", "de-emphasize"],
                cssClasses: "text-xl font-medium leading-tight",
                conditionalClasses: (props) => {
                    const { hasBgImage } = props;
                    return hasBgImage ? "text-white/90" : "text-gray-700";
                }
            },
            {
                id: "accent-red",
                label: "Red Accent",
                description: "Red color accent",
                semanticTags: ["red", "danger", "alert", "warning", "urgent"],
                cssClasses: "text-red-600 font-semibold leading-tight",
                conditionalClasses: () => ""
            },
            {
                id: "accent-blue",
                label: "Blue Accent",
                description: "Blue color accent",
                semanticTags: ["blue", "primary", "brand", "cool"],
                cssClasses: "text-blue-600 font-semibold leading-tight",
                conditionalClasses: () => ""
            }
        ]
    },

    "ct-text": {
        defaultTemplate: "default",
        templates: [
            {
                id: "default",
                label: "Default",
                description: "Standard paragraph text",
                semanticTags: ["default", "normal", "standard"],
                cssClasses: "text-base leading-relaxed",
                conditionalClasses: (props) => {
                    const { hasBgImage } = props;
                    return hasBgImage ? "text-white/90" : "text-gray-600";
                }
            },
            {
                id: "prominent",
                label: "Prominent",
                description: "Larger, emphasized text",
                semanticTags: ["prominent", "large", "emphasis", "important"],
                cssClasses: "text-lg md:text-xl leading-relaxed font-medium",
                conditionalClasses: (props) => {
                    const { hasBgImage } = props;
                    return hasBgImage ? "text-white" : "text-gray-800";
                }
            },
            {
                id: "subtle",
                label: "Subtle",
                description: "Smaller, secondary text",
                semanticTags: ["subtle", "small", "secondary", "muted", "quiet"],
                cssClasses: "text-sm leading-relaxed",
                conditionalClasses: (props) => {
                    const { hasBgImage } = props;
                    return hasBgImage ? "text-white/80" : "text-gray-500";
                }
            }
        ]
    },

    "ct-button": {
        defaultTemplate: "primary",
        templates: [
            {
                id: "primary",
                label: "Primary",
                description: "Main call-to-action button",
                semanticTags: ["primary", "main", "cta", "prominent", "important"],
                cssClasses: "bg-[#194BFF] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0037DD] transition-colors shadow-sm",
                conditionalClasses: () => ""
            },
            {
                id: "secondary",
                label: "Secondary",
                description: "Outline style button",
                semanticTags: ["secondary", "outline", "ghost", "alternative"],
                cssClasses: "border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors",
                conditionalClasses: () => ""
            },
            {
                id: "subtle",
                label: "Subtle",
                description: "Text-link style button",
                semanticTags: ["subtle", "text", "link", "minimal"],
                cssClasses: "text-blue-600 px-3 py-2 font-semibold hover:text-blue-700 transition-colors underline-offset-2 hover:underline",
                conditionalClasses: () => ""
            }
        ]
    }
};

/**
 * Section Templates
 * Control background, theme, and overall section appearance
 */
export const SECTION_TEMPLATES: SectionTemplates = {
    defaultTemplate: "default",
    templates: [
        {
            id: "default",
            label: "Default",
            description: "Standard white background",
            semanticTags: ["default", "normal", "standard", "white"],
            cssClasses: "bg-white",
            conditionalClasses: () => ""
        },
        {
            id: "light-gray",
            label: "Light Gray",
            description: "Subtle gray background",
            semanticTags: ["gray", "grey", "subtle", "light"],
            cssClasses: "bg-gray-50",
            conditionalClasses: () => ""
        },
        {
            id: "dark",
            label: "Dark",
            description: "Dark background with light text",
            semanticTags: ["dark", "black", "night", "inverse"],
            cssClasses: "bg-gray-900 text-white",
            conditionalClasses: () => ""
        },
        {
            id: "blue-accent",
            label: "Blue Accent",
            description: "Blue branded background",
            semanticTags: ["blue", "brand", "primary", "accent"],
            cssClasses: "bg-blue-50",
            conditionalClasses: () => ""
        },
        {
            id: "gradient-blue",
            label: "Blue Gradient",
            description: "Blue gradient background",
            semanticTags: ["gradient", "blue-gradient", "modern", "dynamic"],
            cssClasses: "bg-gradient-to-br from-blue-50 to-indigo-100",
            conditionalClasses: () => ""
        },
        {
            id: "compact",
            label: "Compact",
            description: "Reduced padding for tighter spacing",
            semanticTags: ["compact", "tight", "small-padding", "condensed"],
            cssClasses: "bg-white py-8",
            conditionalClasses: () => ""
        },
        {
            id: "spacious",
            label: "Spacious",
            description: "Extra padding for breathing room",
            semanticTags: ["spacious", "large-padding", "airy", "relaxed"],
            cssClasses: "bg-white py-24",
            conditionalClasses: () => ""
        }
    ]
};
