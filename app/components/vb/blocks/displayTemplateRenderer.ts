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
	_context?: {hasBgImage?: boolean; parentTheme?: string}
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
