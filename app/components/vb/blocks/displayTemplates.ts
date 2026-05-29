/**
 * Display Template Registry (Optimizely Pattern + AI Enhancements)
 *
 * Templates are pure data that define abstract settings (not CSS).
 * The front-end renderer interprets these settings and outputs CSS classes.
 *
 * Enhancements over real Optimizely product:
 * - semanticTags: For AI natural language mapping
 * - defaultSettings: For AI simple application without configuring each setting
 */

import { DisplayTemplate } from "../types";

export const DISPLAY_TEMPLATES: DisplayTemplate[] = [
	// =========================================================================
	// EXPERIENCE (PAGE) TEMPLATES
	// =========================================================================

	{
		key: "defaultExperience",
		displayName: "Default",
		baseType: "experience",
		isDefault: true,
		semanticTags: ["default", "normal", "standard"],
		defaultSettings: {
			backgroundColor: "light-blue",
			spacing: "default"
		},
		settings: {
			backgroundColor: {
				displayName: "Background color",
				editor: "select",
				sortOrder: 10,
				choices: {
					"light-blue": { displayName: "Light Blue", sortOrder: 10 },
					"white": { displayName: "White", sortOrder: 20 },
					"dark": { displayName: "Dark", sortOrder: 30 }
				}
			},
			spacing: {
				displayName: "Section spacing",
				editor: "select",
				sortOrder: 20,
				choices: {
					"compact": { displayName: "Compact", sortOrder: 10 },
					"default": { displayName: "Default", sortOrder: 20 },
					"spacious": { displayName: "Spacious", sortOrder: 30 }
				}
			}
		}
	},

	{
		key: "darkExperience",
		displayName: "Dark Theme",
		baseType: "experience",
		semanticTags: ["dark", "night", "black", "inverse"],
		defaultSettings: {
			backgroundColor: "dark",
			spacing: "default"
		},
		settings: {
			backgroundColor: {
				displayName: "Background color",
				editor: "select",
				sortOrder: 10,
				choices: {
					"dark": { displayName: "Dark", sortOrder: 10 },
					"darker": { displayName: "Darker", sortOrder: 20 }
				}
			},
			spacing: {
				displayName: "Section spacing",
				editor: "select",
				sortOrder: 20,
				choices: {
					"compact": { displayName: "Compact", sortOrder: 10 },
					"default": { displayName: "Default", sortOrder: 20 }
				}
			}
		}
	},

	{
		key: "minimalExperience",
		displayName: "Minimal",
		baseType: "experience",
		semanticTags: ["minimal", "clean", "simple", "white"],
		defaultSettings: {
			backgroundColor: "white",
			spacing: "compact"
		},
		settings: {
			backgroundColor: {
				displayName: "Background color",
				editor: "select",
				sortOrder: 10,
				choices: {
					"white": { displayName: "White", sortOrder: 10 }
				}
			},
			spacing: {
				displayName: "Section spacing",
				editor: "select",
				sortOrder: 20,
				choices: {
					"compact": { displayName: "Compact", sortOrder: 10 },
					"default": { displayName: "Default", sortOrder: 20 }
				}
			}
		}
	},

	// =========================================================================
	// SECTION TEMPLATES
	// =========================================================================

	{
		key: "defaultSection",
		displayName: "Default",
		baseType: "section",
		isDefault: true,
		semanticTags: ["default", "normal", "standard"],
		defaultSettings: {
			colorScheme: "default",
			spacing: "default"
		},
		settings: {
			colorScheme: {
				displayName: "Color scheme",
				editor: "select",
				sortOrder: 10,
				choices: {
					"default": { displayName: "Default", sortOrder: 10 },
					"light-gray": { displayName: "Light Gray", sortOrder: 20 },
					"dark": { displayName: "Dark", sortOrder: 30 }
				}
			},
			spacing: {
				displayName: "Spacing",
				editor: "select",
				sortOrder: 20,
				choices: {
					"compact": { displayName: "Compact", sortOrder: 10 },
					"default": { displayName: "Default", sortOrder: 20 },
					"spacious": { displayName: "Spacious", sortOrder: 30 },
					"extra-top": { displayName: "Extra Top", sortOrder: 40 }
				}
			}
		}
	},

	{
		key: "darkSection",
		displayName: "Dark",
		baseType: "section",
		semanticTags: ["dark", "night", "inverse", "black"],
		defaultSettings: {
			colorScheme: "dark",
			spacing: "default"
		},
		settings: {
			colorScheme: {
				displayName: "Color scheme",
				editor: "select",
				sortOrder: 10,
				choices: {
					"dark": { displayName: "Dark", sortOrder: 10 },
					"darker": { displayName: "Darker", sortOrder: 20 }
				}
			},
			spacing: {
				displayName: "Spacing",
				editor: "select",
				sortOrder: 20,
				choices: {
					"compact": { displayName: "Compact", sortOrder: 10 },
					"default": { displayName: "Default", sortOrder: 20 },
					"spacious": { displayName: "Spacious", sortOrder: 30 },
					"extra-top": { displayName: "Extra Top", sortOrder: 40 }
				}
			}
		}
	},

	// =========================================================================
	// COMPONENT (ELEMENT) TEMPLATES - HEADINGS
	// =========================================================================

	{
		key: "defaultHeading",
		displayName: "Default",
		contentType: "ct-heading",
		isDefault: true,
		semanticTags: ["default", "normal", "standard"],
		defaultSettings: {
			size: "default",
			emphasis: "normal"
		},
		settings: {
			size: {
				displayName: "Size",
				editor: "select",
				sortOrder: 10,
				choices: {
					"small": { displayName: "Small", sortOrder: 10 },
					"default": { displayName: "Default", sortOrder: 20 },
					"large": { displayName: "Large", sortOrder: 30 }
				}
			},
			emphasis: {
				displayName: "Emphasis",
				editor: "select",
				sortOrder: 20,
				choices: {
					"subtle": { displayName: "Subtle", sortOrder: 10 },
					"normal": { displayName: "Normal", sortOrder: 20 },
					"bold": { displayName: "Bold", sortOrder: 30 }
				}
			}
		}
	},

	{
		key: "prominentHeading",
		displayName: "Prominent",
		contentType: "ct-heading",
		semanticTags: ["prominent", "large", "hero", "big", "emphasize"],
		defaultSettings: {
			size: "large",
			emphasis: "bold"
		},
		settings: {
			size: {
				displayName: "Size",
				editor: "select",
				sortOrder: 10,
				choices: {
					"large": { displayName: "Large", sortOrder: 10 },
					"extra-large": { displayName: "Extra Large", sortOrder: 20 }
				}
			},
			emphasis: {
				displayName: "Emphasis",
				editor: "select",
				sortOrder: 20,
				choices: {
					"bold": { displayName: "Bold", sortOrder: 10 },
					"extra-bold": { displayName: "Extra Bold", sortOrder: 20 }
				}
			}
		}
	},

	{
		key: "subtleHeading",
		displayName: "Subtle",
		contentType: "ct-heading",
		semanticTags: ["subtle", "small", "minimal", "quiet", "de-emphasize"],
		defaultSettings: {
			size: "small",
			emphasis: "subtle"
		},
		settings: {
			size: {
				displayName: "Size",
				editor: "select",
				sortOrder: 10,
				choices: {
					"small": { displayName: "Small", sortOrder: 10 }
				}
			},
			emphasis: {
				displayName: "Emphasis",
				editor: "select",
				sortOrder: 20,
				choices: {
					"subtle": { displayName: "Subtle", sortOrder: 10 },
					"normal": { displayName: "Normal", sortOrder: 20 }
				}
			}
		}
	},

	{
		key: "accentHeading",
		displayName: "Accent Color",
		contentType: "ct-heading",
		semanticTags: ["accent", "red", "blue", "color", "highlight"],
		defaultSettings: {
			size: "default",
			color: "red"
		},
		settings: {
			size: {
				displayName: "Size",
				editor: "select",
				sortOrder: 10,
				choices: {
					"small": { displayName: "Small", sortOrder: 10 },
					"default": { displayName: "Default", sortOrder: 20 },
					"large": { displayName: "Large", sortOrder: 30 }
				}
			},
			color: {
				displayName: "Accent color",
				editor: "select",
				sortOrder: 20,
				choices: {
					"red": { displayName: "Red", sortOrder: 10 },
					"blue": { displayName: "Blue", sortOrder: 20 }
				}
			}
		}
	},

	// =========================================================================
	// COMPONENT (ELEMENT) TEMPLATES - TEXT
	// =========================================================================

	{
		key: "defaultText",
		displayName: "Default",
		contentType: "ct-text",
		isDefault: true,
		semanticTags: ["default", "normal", "standard"],
		defaultSettings: {
			size: "default",
			emphasis: "normal"
		},
		settings: {
			size: {
				displayName: "Size",
				editor: "select",
				sortOrder: 10,
				choices: {
					"small": { displayName: "Small", sortOrder: 10 },
					"default": { displayName: "Default", sortOrder: 20 },
					"large": { displayName: "Large", sortOrder: 30 }
				}
			},
			emphasis: {
				displayName: "Emphasis",
				editor: "select",
				sortOrder: 20,
				choices: {
					"subtle": { displayName: "Subtle", sortOrder: 10 },
					"normal": { displayName: "Normal", sortOrder: 20 },
					"bold": { displayName: "Bold", sortOrder: 30 }
				}
			}
		}
	},

	{
		key: "prominentText",
		displayName: "Prominent",
		contentType: "ct-text",
		semanticTags: ["prominent", "large", "emphasis", "important"],
		defaultSettings: {
			size: "large",
			emphasis: "bold"
		},
		settings: {
			size: {
				displayName: "Size",
				editor: "select",
				sortOrder: 10,
				choices: {
					"large": { displayName: "Large", sortOrder: 10 }
				}
			},
			emphasis: {
				displayName: "Emphasis",
				editor: "select",
				sortOrder: 20,
				choices: {
					"normal": { displayName: "Normal", sortOrder: 10 },
					"bold": { displayName: "Bold", sortOrder: 20 }
				}
			}
		}
	},

	{
		key: "subtleText",
		displayName: "Subtle",
		contentType: "ct-text",
		semanticTags: ["subtle", "small", "secondary", "muted", "quiet"],
		defaultSettings: {
			size: "small",
			emphasis: "subtle"
		},
		settings: {
			size: {
				displayName: "Size",
				editor: "select",
				sortOrder: 10,
				choices: {
					"small": { displayName: "Small", sortOrder: 10 }
				}
			},
			emphasis: {
				displayName: "Emphasis",
				editor: "select",
				sortOrder: 20,
				choices: {
					"subtle": { displayName: "Subtle", sortOrder: 10 },
					"normal": { displayName: "Normal", sortOrder: 20 }
				}
			}
		}
	},

	{
		key: "accentText",
		displayName: "Accent",
		contentType: "ct-text",
		semanticTags: ["accent", "blue", "label", "tag"],
		defaultSettings: {
			color: "blue"
		},
		settings: {
			color: {
				displayName: "Accent color",
				editor: "select",
				sortOrder: 10,
				choices: {
					"blue": { displayName: "Blue", sortOrder: 10 }
				}
			}
		}
	},

	// =========================================================================
	// COMPONENT (ELEMENT) TEMPLATES - BUTTONS
	// =========================================================================

	{
		key: "primaryButton",
		displayName: "Primary",
		contentType: "ct-button",
		isDefault: true,
		semanticTags: ["primary", "main", "cta", "prominent", "important"],
		defaultSettings: {},
		settings: {}
	},

	{
		key: "secondaryButton",
		displayName: "Secondary",
		contentType: "ct-button",
		semanticTags: ["secondary", "outline", "ghost", "alternative"],
		defaultSettings: {},
		settings: {}
	},

	{
		key: "subtleButton",
		displayName: "Subtle",
		contentType: "ct-button",
		semanticTags: ["subtle", "text", "link", "minimal"],
		defaultSettings: {},
		settings: {}
	},

	// =========================================================================
	// COMPONENT (ELEMENT) TEMPLATES - CARDS
	// =========================================================================

	{
		key: "defaultCard",
		displayName: "Default",
		contentType: "ct-card",
		isDefault: true,
		semanticTags: ["default", "normal", "complex", "fancy"],
		defaultSettings: {
			style: "complex"
		},
		settings: {
			style: {
				displayName: "Style",
				editor: "select",
				sortOrder: 10,
				choices: {
					"complex": { displayName: "Complex", sortOrder: 10 },
					"simple": { displayName: "Simple", sortOrder: 20 }
				}
			}
		}
	},

	// =========================================================================
	// COMPONENT (ELEMENT) TEMPLATES - HERO
	// =========================================================================

	{
		key: "defaultHero",
		displayName: "Default",
		contentType: "ct-hero",
		isDefault: true,
		semanticTags: ["default", "normal", "app", "homepage"],
		defaultSettings: {
			layout: "default"
		},
		settings: {
			layout: {
				displayName: "Layout",
				editor: "select",
				sortOrder: 10,
				choices: {
					"default": { displayName: "Default", sortOrder: 10 },
					"centered": { displayName: "Centered", sortOrder: 20 },
					"event": { displayName: "Event", sortOrder: 30 }
				}
			}
		}
	},

	// =========================================================================
	// ROW TEMPLATES
	// =========================================================================

	{
		key: "singleColumn",
		displayName: "Single Column",
		nodeType: "row",
		isDefault: true,
		semanticTags: ["single", "one", "full-width", "1"],
		defaultSettings: {
			columns: "1"
		},
		settings: {
			columns: {
				displayName: "Columns",
				editor: "select",
				sortOrder: 10,
				choices: {
					"1": { displayName: "1", sortOrder: 10 }
				}
			}
		}
	},

	{
		key: "twoColumn",
		displayName: "Two Column",
		nodeType: "row",
		semanticTags: ["two", "split", "half", "2"],
		defaultSettings: {
			columns: "2",
			gap: "default"
		},
		settings: {
			columns: {
				displayName: "Columns",
				editor: "select",
				sortOrder: 10,
				choices: {
					"2": { displayName: "2", sortOrder: 10 }
				}
			},
			gap: {
				displayName: "Gap",
				editor: "select",
				sortOrder: 20,
				choices: {
					"tight": { displayName: "Tight", sortOrder: 10 },
					"default": { displayName: "Default", sortOrder: 20 },
					"wide": { displayName: "Wide", sortOrder: 30 }
				}
			}
		}
	},

	{
		key: "threeColumn",
		displayName: "Three Column",
		nodeType: "row",
		semanticTags: ["three", "triple", "3"],
		defaultSettings: {
			columns: "3",
			gap: "default"
		},
		settings: {
			columns: {
				displayName: "Columns",
				editor: "select",
				sortOrder: 10,
				choices: {
					"3": { displayName: "3", sortOrder: 10 }
				}
			},
			gap: {
				displayName: "Gap",
				editor: "select",
				sortOrder: 20,
				choices: {
					"tight": { displayName: "Tight", sortOrder: 10 },
					"default": { displayName: "Default", sortOrder: 20 },
					"wide": { displayName: "Wide", sortOrder: 30 }
				}
			}
		}
	}
];
