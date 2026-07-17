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
    [sectionType: string]: {
        defaultTemplate: string;
        templates: TemplateDefinition[];
    };
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
                description: "Standard heading style - Figma design system",
                semanticTags: ["default", "normal", "standard"],
                cssClasses: "text-stride-2xl md:text-stride-3xl font-stride-semibold leading-tight font-stride-sans",
                conditionalClasses: (props) => {
                    const { hasBgImage } = props;
                    return hasBgImage ? "text-white" : "text-stride-dark";
                }
            },
            {
                id: "prominent",
                label: "Prominent",
                description: "Large, hero-style heading - 48px Figma spec",
                semanticTags: ["prominent", "large", "hero", "big", "emphasize", "bold"],
                cssClasses: "text-stride-5xl font-stride-semibold font-stride-sans",
                conditionalClasses: (props) => {
                    const { hasBgImage } = props;
                    return hasBgImage ? "text-white" : "text-stride-dark";
                }
            },
            {
                id: "subtle",
                label: "Subtle",
                description: "Smaller, understated heading",
                semanticTags: ["subtle", "small", "minimal", "quiet", "de-emphasize"],
                cssClasses: "text-stride-lg font-stride-medium leading-tight font-stride-sans",
                conditionalClasses: (props) => {
                    const { hasBgImage } = props;
                    return hasBgImage ? "text-white/90" : "text-stride-dark/80";
                }
            },
            {
                id: "accent-red",
                label: "Red Accent",
                description: "Red color accent",
                semanticTags: ["red", "danger", "alert", "warning", "urgent"],
                cssClasses: "text-red-600 font-stride-semibold leading-tight font-stride-sans",
                conditionalClasses: () => ""
            },
            {
                id: "accent-blue",
                label: "Blue Accent",
                description: "Blue color accent",
                semanticTags: ["blue", "primary", "brand", "cool"],
                cssClasses: "text-stride-blue font-stride-semibold leading-tight font-stride-sans",
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
                description: "Standard paragraph text - Figma design system",
                semanticTags: ["default", "normal", "standard"],
                cssClasses: "text-stride-base font-stride-medium font-stride-sans leading-relaxed",
                conditionalClasses: (props) => {
                    const { hasBgImage } = props;
                    return hasBgImage ? "text-white/90" : "text-stride-dark/70";
                }
            },
            {
                id: "prominent",
                label: "Prominent",
                description: "Larger, emphasized text",
                semanticTags: ["prominent", "large", "emphasis", "important"],
                cssClasses: "text-stride-lg md:text-stride-xl leading-relaxed font-stride-medium font-stride-sans",
                conditionalClasses: (props) => {
                    const { hasBgImage } = props;
                    return hasBgImage ? "text-white" : "text-stride-dark";
                }
            },
            {
                id: "subtle",
                label: "Subtle",
                description: "Smaller, secondary text",
                semanticTags: ["subtle", "small", "secondary", "muted", "quiet"],
                cssClasses: "text-sm leading-relaxed font-stride-medium font-stride-sans",
                conditionalClasses: (props) => {
                    const { hasBgImage } = props;
                    return hasBgImage ? "text-white/70" : "text-stride-dark/60";
                }
            },
            {
                id: "accent-blue",
                label: "Blue Accent",
                description: "Blue color accent for labels",
                semanticTags: ["blue", "primary", "brand", "accent"],
                cssClasses: "text-xs font-semibold uppercase tracking-wider font-stride-sans",
                conditionalClasses: () => "text-[#0980F6]"
            }
        ]
    },

    "ct-button": {
        defaultTemplate: "primary",
        templates: [
            {
                id: "primary",
                label: "Primary",
                description: "Main call-to-action button - Figma design system",
                semanticTags: ["primary", "main", "cta", "prominent", "important"],
                cssClasses: "bg-stride-blue text-white px-6 py-3 rounded-stride-lg text-stride-base font-stride-semibold font-stride-sans hover:bg-stride-blue-dark transition-colors shadow-sm",
                conditionalClasses: () => ""
            },
            {
                id: "secondary",
                label: "Secondary",
                description: "Outline style button",
                semanticTags: ["secondary", "outline", "ghost", "alternative"],
                cssClasses: "border-2 border-stride-dark/20 text-stride-dark px-6 py-3 rounded-stride-lg text-stride-base font-stride-semibold font-stride-sans hover:border-stride-dark/40 hover:bg-stride-dark/5 transition-colors",
                conditionalClasses: () => ""
            },
            {
                id: "subtle",
                label: "Subtle",
                description: "Text-link style button",
                semanticTags: ["subtle", "text", "link", "minimal"],
                cssClasses: "text-stride-blue px-3 py-2 text-stride-base font-stride-semibold font-stride-sans hover:text-stride-blue-dark transition-colors underline-offset-2 hover:underline",
                conditionalClasses: () => ""
            }
        ]
    },

    "ct-card": {
        defaultTemplate: "default",
        templates: [
            {
                id: "default",
                label: "Default",
                description: "Card with backdrop blur, gradient overlay, and arrow button",
                semanticTags: ["default", "normal", "standard", "complex", "fancy"],
                cssClasses: "",
                conditionalClasses: () => ""
            },
            {
                id: "simple",
                label: "Simple",
                description: "Simple card with just image, title, and description",
                semanticTags: ["simple", "clean", "minimal", "basic", "plain"],
                cssClasses: "",
                conditionalClasses: () => ""
            }
        ]
    },

    "ct-hero": {
        defaultTemplate: "default",
        templates: [
            {
                id: "default",
                label: "Default",
                description: "Hero with app mockup on right, buttons, left-aligned content",
                semanticTags: ["default", "normal", "standard", "homepage", "app"],
                cssClasses: "",
                conditionalClasses: () => ""
            },
            {
                id: "centered",
                label: "Centered",
                description: "Centered hero with badge and no buttons",
                semanticTags: ["centered", "simple", "clean", "features"],
                cssClasses: "",
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
    "ct-section": {
        defaultTemplate: "default",
        templates: [
        {
            id: "default",
            label: "Default",
            description: "Standard section with padding",
            semanticTags: ["default", "normal", "standard"],
            cssClasses: "py-12",
            conditionalClasses: () => ""
        },
        {
            id: "compact",
            label: "Compact",
            description: "Minimal padding for tight spacing",
            semanticTags: ["compact", "tight", "minimal", "landing"],
            cssClasses: "pb-12",
            conditionalClasses: () => ""
        },
        {
            id: "light-gray",
            label: "Light Blue Background",
            description: "Subtle blue background with standard padding",
            semanticTags: ["gray", "grey", "subtle", "light", "blue"],
            cssClasses: "py-12 bg-stride-bg",
            conditionalClasses: () => ""
        },
        {
            id: "dark",
            label: "Dark",
            description: "Dark background with light text",
            semanticTags: ["dark", "black", "night", "inverse"],
            cssClasses: "py-12 bg-stride-dark text-white",
            conditionalClasses: () => ""
        },
        {
            id: "spacious",
            label: "Spacious",
            description: "Extra padding for breathing room",
            semanticTags: ["spacious", "large-padding", "airy", "relaxed"],
            cssClasses: "py-24",
            conditionalClasses: () => ""
        }
        ]
    }
};
