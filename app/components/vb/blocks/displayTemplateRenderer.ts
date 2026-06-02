/**
 * Display Template Renderer
 *
 * Interprets abstract display template settings and outputs concrete CSS classes.
 * This is the front-end layer that translates data into visual styles.
 */

/**
 * Get CSS classes for a display template
 *
 * @param displayTemplateKey - Template key (e.g., "defaultSection", "prominentHeading")
 * @param displaySettings - Array of setting key-value pairs
 * @param context - Additional context for conditional rendering (hasBgImage, parentTheme, etc.)
 * @returns CSS class string
 */
export function getDisplayTemplateClasses(
	displayTemplateKey: string,
	displaySettings: Array<{key: string; value: string}> = [],
	context?: {hasBgImage?: boolean; parentTheme?: string}
): string {
	// Helper to get setting value
	const getSetting = (key: string): string | undefined =>
		displaySettings?.find(s => s.key === key)?.value;

	// =========================================================================
	// EXPERIENCE (PAGE) RENDERING
	// =========================================================================

	if (displayTemplateKey === "defaultExperience") {
		const bg = getSetting("backgroundColor");
		const spacing = getSetting("spacing");

		let classes = "";

		// Background
		if (bg === "light-blue") classes += "bg-[#F2F8FC] ";
		if (bg === "white") classes += "bg-white ";
		if (bg === "dark") classes += "bg-[#1a1a1a] text-white ";

		return classes.trim();
	}

	if (displayTemplateKey === "darkExperience") {
		const bg = getSetting("backgroundColor");

		if (bg === "dark") return "bg-[#1a1a1a] text-white";
		if (bg === "darker") return "bg-[#0a0a0a] text-white";

		return "bg-[#1a1a1a] text-white";  // Default fallback
	}

	if (displayTemplateKey === "minimalExperience") {
		return "bg-white";
	}

	// =========================================================================
	// SECTION RENDERING
	// =========================================================================

	if (displayTemplateKey === "defaultSection") {
		const colorScheme = getSetting("colorScheme");
		const spacing = getSetting("spacing");

		console.log("[displayTemplateRenderer] defaultSection:", {
			colorScheme,
			spacing,
			displaySettings,
		});

		let classes = "";

		// Spacing (vertical padding)
		if (spacing === "compact") classes += "pb-12 ";  // Bottom padding only (48px)
		else if (spacing === "default") classes += "py-12 ";  // Top + bottom (48px each)
		else if (spacing === "spacious") classes += "py-24 ";  // Top + bottom (96px each)
		else if (spacing === "extra-top") classes += "pt-20 pb-12 ";  // Extra top (80px top, 48px bottom)
		else if (spacing === "community") classes += "md:pt-40 pt-20 pb-20 ";  // stride-web section 4
		else if (spacing === "top-only") classes += "pt-30 ";  // Top padding only (120px, matches stride-web pt-30)
		else if (spacing === "none") classes += "";  // No padding (spacing handled elsewhere)
		else classes += "py-12 ";  // Fallback to default

		// Color scheme
		if (colorScheme === "light-gray") classes += "bg-stride-bg ";
		else if (colorScheme === "dark") classes += "bg-stride-dark text-white ";
		// "default" has no background

		console.log("[displayTemplateRenderer] defaultSection result:", classes);

		return classes.trim();
	}

	if (displayTemplateKey === "darkSection") {
		const colorScheme = getSetting("colorScheme");
		const spacing = getSetting("spacing");

		let classes = "";

		// Spacing
		if (spacing === "compact") classes += "pb-12 ";  // Bottom padding only (48px)
		else if (spacing === "default") classes += "py-12 ";  // Top + bottom (48px each)
		else if (spacing === "spacious") classes += "py-24 ";  // Top + bottom (96px each)
		else if (spacing === "extra-top") classes += "pt-20 pb-12 ";  // Extra top (80px top, 48px bottom)
		else classes += "py-12 ";

		// Color scheme
		if (colorScheme === "dark") classes += "bg-stride-dark text-white ";
		else if (colorScheme === "darker") classes += "bg-[#0a0a0a] text-white ";
		else classes += "bg-stride-dark text-white ";  // Default to dark

		return classes.trim();
	}

	// =========================================================================
	// COMPONENT (ELEMENT) RENDERING - HEADINGS
	// =========================================================================

	if (displayTemplateKey === "defaultHeading") {
		const size = getSetting("size");
		const emphasis = getSetting("emphasis");

		let classes = "font-stride-sans tracking-tight ";

		// Size - match stride-web h3/h4 sizing
		if (size === "small") classes += "text-xl ";
		else if (size === "default") classes += "text-2xl ";
		else if (size === "large") classes += "text-4xl ";
		else classes += "text-2xl ";  // Default to h3

		// Emphasis
		if (emphasis === "subtle") classes += "font-stride-medium ";
		else if (emphasis === "normal") classes += "font-stride-semibold ";
		else if (emphasis === "bold") classes += "font-stride-bold ";
		else classes += "font-stride-bold ";  // Default to bold like stride-web

		// Context-aware (inherit from parent)
		if (context?.hasBgImage || context?.parentTheme === "dark") {
			classes += "text-white ";
		} else {
			classes += "text-stride-dark ";
		}

		return classes.trim();
	}

	if (displayTemplateKey === "prominentHeading") {
		const size = getSetting("size");
		const emphasis = getSetting("emphasis");

		let classes = "font-stride-sans tracking-tight ";

		// Size - match stride-web h1/h2 responsive sizing
		if (size === "large") classes += "text-4xl md:text-6xl ";
		else if (size === "extra-large") classes += "text-5xl md:text-7xl ";
		else classes += "text-4xl md:text-6xl ";  // Default to h2

		// Emphasis
		if (emphasis === "bold") classes += "font-stride-bold ";
		else if (emphasis === "extra-bold") classes += "font-stride-extrabold ";
		else classes += "font-stride-bold ";  // Default

		// Context-aware
		if (context?.hasBgImage || context?.parentTheme === "dark") {
			classes += "text-white ";
		} else {
			classes += "text-stride-dark ";
		}

		return classes.trim();
	}

	if (displayTemplateKey === "subtleHeading") {
		const size = getSetting("size");
		const emphasis = getSetting("emphasis");

		let classes = "font-stride-sans tracking-tight ";

		// Size
		classes += "text-xl ";

		// Emphasis
		if (emphasis === "subtle") classes += "font-stride-medium ";
		else if (emphasis === "normal") classes += "font-stride-semibold ";
		else classes += "font-stride-medium ";  // Default to subtle

		// Context-aware with opacity
		if (context?.hasBgImage || context?.parentTheme === "dark") {
			classes += "text-white/90 ";
		} else {
			classes += "text-stride-dark/80 ";
		}

		return classes.trim();
	}

	if (displayTemplateKey === "accentHeading") {
		const size = getSetting("size");
		const color = getSetting("color");

		let classes = "font-stride-sans tracking-tight font-stride-semibold ";

		// Size
		if (size === "small") classes += "text-xl ";
		else if (size === "default") classes += "text-2xl ";
		else if (size === "large") classes += "text-4xl ";
		else classes += "text-2xl ";

		// Color (explicit, not context-aware)
		if (color === "red") classes += "text-red-600 ";
		else if (color === "blue") classes += "text-stride-blue ";
		else classes += "text-red-600 ";  // Default to red

		return classes.trim();
	}

	// =========================================================================
	// COMPONENT (ELEMENT) RENDERING - TEXT
	// =========================================================================

	if (displayTemplateKey === "defaultText") {
		const size = getSetting("size");
		const emphasis = getSetting("emphasis");

		let classes = "font-stride-sans leading-relaxed ";

		// Size
		if (size === "small") classes += "text-sm ";
		else if (size === "default") classes += "text-lg ";
		else if (size === "large") classes += "text-stride-lg md:text-stride-xl ";
		else classes += "text-lg ";

		// Emphasis
		if (emphasis === "subtle") classes += "font-stride-normal ";
		else if (emphasis === "normal") classes += "font-stride-medium ";
		else if (emphasis === "bold") classes += "font-stride-semibold ";
		else classes += "font-stride-medium ";

		// Context-aware
		if (context?.hasBgImage || context?.parentTheme === "dark") {
			classes += "text-white/90 ";
		} else {
			classes += "text-stride-dark/70 ";
		}

		return classes.trim();
	}

	if (displayTemplateKey === "prominentText") {
		const size = getSetting("size");
		const emphasis = getSetting("emphasis");

		let classes = "font-stride-sans leading-relaxed ";

		// Size - match stride-web large text
		classes += "text-xl ";

		// Emphasis
		if (emphasis === "normal") classes += "font-stride-medium ";
		else if (emphasis === "bold") classes += "font-stride-semibold ";
		else classes += "font-stride-medium ";

		// Context-aware
		if (context?.hasBgImage || context?.parentTheme === "dark") {
			classes += "text-white ";
		} else {
			classes += "text-stride-dark ";
		}

		return classes.trim();
	}

	if (displayTemplateKey === "subtleText") {
		const size = getSetting("size");
		const emphasis = getSetting("emphasis");

		let classes = "font-stride-sans leading-relaxed ";

		// Size
		classes += "text-sm ";

		// Emphasis
		if (emphasis === "subtle") classes += "font-stride-normal ";
		else if (emphasis === "normal") classes += "font-stride-medium ";
		else classes += "font-stride-normal ";

		// Context-aware with more opacity
		if (context?.hasBgImage || context?.parentTheme === "dark") {
			classes += "text-white/70 ";
		} else {
			classes += "text-stride-dark/60 ";
		}

		return classes.trim();
	}

	if (displayTemplateKey === "accentText") {
		const color = getSetting("color");

		let classes = "text-xs uppercase font-stride-semibold tracking-wider font-stride-sans ";

		// Color
		if (color === "blue") classes += "text-[#0980F6] ";
		else classes += "text-[#0980F6] ";  // Default to blue

		return classes.trim();
	}

	// =========================================================================
	// COMPONENT (ELEMENT) RENDERING - BUTTONS
	// =========================================================================

	if (displayTemplateKey === "primaryButton") {
		return "bg-stride-blue text-white px-6 py-3 rounded-stride-lg text-xs uppercase tracking-wider font-stride-medium font-stride-sans hover:bg-stride-blue-dark transition-colors shadow-sm";
	}

	if (displayTemplateKey === "secondaryButton") {
		return "border-2 border-stride-dark text-stride-dark px-6 py-3 rounded-md text-sm uppercase tracking-wider font-semibold font-stride-sans hover:-translate-y-0.5 transition-transform duration-100";
	}

	if (displayTemplateKey === "subtleButton") {
		return "text-stride-blue px-3 py-2 text-xs uppercase tracking-wider font-stride-medium font-stride-sans hover:text-stride-blue-dark transition-colors underline-offset-2 hover:underline";
	}

	if (displayTemplateKey === "blueFullWidthButton") {
		return "w-full bg-[#0980F6] hover:bg-[#0668C4] text-white px-6 py-4 rounded-xl text-sm uppercase tracking-wider font-semibold font-stride-sans transition-colors mt-2 text-center block";
	}

	// =========================================================================
	// COMPONENT (ELEMENT) RENDERING - HEADINGS
	// =========================================================================

	if (displayTemplateKey === "blueHeading") {
		return "text-[#0980F6] font-stride-sans text-4xl md:text-5xl font-normal leading-tight border-t-[3px] border-[#0980F6] pt-6";
	}

	// =========================================================================
	// COLUMN TEMPLATES
	// =========================================================================

	if (displayTemplateKey === "formCard") {
		const layout = getSetting("layout");
		if (layout === "form-2col") {
			return "bg-[#EBF3FB] rounded-2xl p-8 -mt-8 grid grid-cols-2 gap-4 [&>*:first-child]:col-span-2 [&>*:last-child]:col-span-2";
		}
		return "bg-[#EBF3FB] rounded-2xl p-8 -mt-8";
	}

	// =========================================================================
	// COMPONENT (ELEMENT) RENDERING - CARDS
	// =========================================================================

	if (displayTemplateKey === "defaultCard") {
		const style = getSetting("style");

		// Both styles handled by CardBlock component itself
		// Template just signals which variant to use
		return "";
	}

	// =========================================================================
	// COMPONENT (ELEMENT) RENDERING - HERO
	// =========================================================================

	if (displayTemplateKey === "defaultHero") {
		const layout = getSetting("layout");

		// Hero layout handled by HeroBlock component itself
		// Template just signals which variant to use
		return "";
	}

	// =========================================================================
	// ROW RENDERING
	// =========================================================================

	if (displayTemplateKey === "singleColumn") {
		return "grid grid-cols-1";
	}

	if (displayTemplateKey === "twoColumn") {
		const gap = getSetting("gap");

		let classes = "grid grid-cols-1 md:grid-cols-2 ";

		// Gap
		if (gap === "tight") classes += "gap-2 ";
		else if (gap === "default") classes += "gap-4 md:gap-8 ";
		else if (gap === "wide") classes += "gap-8 md:gap-12 ";
		else classes += "gap-4 md:gap-8 ";  // Default

		return classes.trim();
	}

	if (displayTemplateKey === "threeColumn") {
		const gap = getSetting("gap");

		let classes = "grid grid-cols-1 md:grid-cols-3 ";

		// Gap
		if (gap === "tight") classes += "gap-2 ";
		else if (gap === "default") classes += "gap-4 md:gap-8 ";
		else if (gap === "wide") classes += "gap-8 md:gap-12 ";
		else classes += "gap-4 md:gap-8 ";

		return classes.trim();
	}

	// =========================================================================
	// FALLBACK
	// =========================================================================

	console.warn(`[Display Template Renderer] Template "${displayTemplateKey}" not found`);
	return "";
}

/**
 * Get section spacing classes from experience (page) template settings
 *
 * @param displaySettings - Page display settings
 * @returns Tailwind spacing class (e.g., "space-y-12")
 */
export function getExperienceSpacing(
	displaySettings: Array<{key: string; value: string}> = []
): string {
	const spacing = displaySettings?.find(s => s.key === "spacing")?.value;

	if (spacing === "compact") return "space-y-12";
	if (spacing === "spacious") return "space-y-20";

	return "space-y-0";  // Default (sections control their own spacing)
}
