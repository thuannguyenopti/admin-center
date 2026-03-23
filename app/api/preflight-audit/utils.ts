import type {
	PreflightAuditIssue,
	PageField,
} from "@/app/components/ai/PreflightAuditTypes";

/**
 * Mock audit functions for Phase 1 MVP
 * These return hardcoded issues to test the UI and orchestration
 * Will be replaced with real implementations in Phase 2
 */

export async function checkBrokenLinks(pageUrl: string, fields: PageField[]): Promise<PreflightAuditIssue[]> {
	// Mock: Return sample broken link issue using a real field ID
	if (fields.length === 0) return [];

	const field = fields[Math.min(3, fields.length - 1)]; // Use 4th field or last
	return [
		{
			fieldId: field.fieldId,
			fieldLabel: field.fieldLabel,
			type: "broken-link",
			severity: "high",
			message: "Broken link detected - returns 404",
			original: "https://example.com/old-page",
			suggestion: "https://example.com/new-page",
			metadata: {
				url: "https://example.com/old-page",
				statusCode: 404,
			},
		},
	];
}

export async function checkMissingImages(fields: PageField[]): Promise<PreflightAuditIssue[]> {
	const issues: PreflightAuditIssue[] = [];

	// Check all fields with src for broken/missing images
	for (const field of fields) {
		if (field.src !== undefined) {
			const imageUrl = field.src.trim();

			// Check if image URL is empty or obviously broken
			if (!imageUrl) {
				issues.push({
					fieldId: field.fieldId,
					fieldLabel: field.fieldLabel,
					type: "missing-image",
					severity: "critical",
					message: "Image URL is empty",
					original: "",
					suggestion: "Upload an image or provide a valid image URL",
					metadata: {
						imageUrl: "",
					},
				});
			} else if (imageUrl.includes("missing") || imageUrl.includes("404") || imageUrl.includes("example.com")) {
				// Detect common patterns for broken/test images
				issues.push({
					fieldId: field.fieldId,
					fieldLabel: field.fieldLabel,
					type: "missing-image",
					severity: "critical",
					message: "Image cannot be loaded (broken URL or missing file)",
					original: imageUrl,
					suggestion: "Upload a valid image or update the image URL",
					metadata: {
						imageUrl,
					},
				});
			}
		}
	}

	return issues;
}

export async function checkRequiredFields(fields: PageField[]): Promise<PreflightAuditIssue[]> {
	// Real implementation: Check for empty required fields
	const issues: PreflightAuditIssue[] = [];

	// List of common required fields to check
	const requiredFieldIds = [
		{id: "meta-description", label: "Meta Description", suggestion: "Add a compelling meta description (150-160 characters)"},
		{id: "seo-title", label: "SEO Title", suggestion: "Add a descriptive page title (50-60 characters)"},
		{id: "page-title", label: "Page Title", suggestion: "Add a page title"},
		{id: "hero-heading", label: "Hero Heading", suggestion: "Add a compelling hero heading"},
	];

	for (const required of requiredFieldIds) {
		const field = fields.find((f) => f.fieldId === required.id);

		// If field doesn't exist or is empty, it's a required field issue
		if (!field || !field.text || field.text.trim().length === 0) {
			issues.push({
				fieldId: required.id,
				fieldLabel: required.label,
				type: "required-field",
				severity: "critical",
				message: `${required.label} is required for SEO and content quality`,
				original: "",
				suggestion: required.suggestion,
			});
		}
	}

	return issues;
}

export async function checkAltText(fields: PageField[]): Promise<PreflightAuditIssue[]> {
	// Real implementation: Check for images without alt-text
	const issues: PreflightAuditIssue[] = [];

	for (const field of fields) {
		if (!field.text) continue;

		// Check for <img> tags without alt attribute
		const imgTagRegex = /<img[^>]*>/gi;
		const imgTags = field.text.match(imgTagRegex) || [];

		imgTags.forEach((imgTag, index) => {
			// Check if alt attribute exists and is not empty
			const hasAlt = /alt\s*=\s*["'][^"']+["']/i.test(imgTag);
			const hasEmptyAlt = /alt\s*=\s*["']["']/i.test(imgTag);

			if (!hasAlt || hasEmptyAlt) {
				// Extract src for context
				const srcMatch = imgTag.match(/src\s*=\s*["']([^"']+)["']/i);
				const imageUrl = srcMatch ? srcMatch[1] : "unknown";

				// Extract filename for suggestion
				const filename = imageUrl.split("/").pop()?.split(".")[0] || "image";
				const suggestion = `Add descriptive alt text for ${filename} (e.g., "Product photo showing...")`;

				issues.push({
					fieldId: field.fieldId,
					fieldLabel: field.fieldLabel,
					type: "missing-alt-text",
					severity: "high",
					message: "Image is missing alt-text for accessibility (WCAG requirement)",
					original: imgTag.substring(0, 50) + (imgTag.length > 50 ? "..." : ""),
					suggestion,
					metadata: {
						imageUrl,
					},
				});
			}
		});
	}

	return issues;
}

export async function checkContentFreshness(fields: PageField[]): Promise<PreflightAuditIssue[]> {
	// Mock: Return sample freshness issue using a real field ID
	if (fields.length < 3) return [];

	const field = fields[Math.min(5, fields.length - 1)]; // Use 6th field or last
	return [
		{
			fieldId: field.fieldId,
			fieldLabel: field.fieldLabel,
			type: "content-freshness",
			severity: "high",
			message: "Content contains outdated date reference",
			original: "As of 2020, our company leads the industry...",
			suggestion: "As of 2026, our company leads the industry...",
		},
	];
}

export async function checkSEO(fields: PageField[], pageUrl: string): Promise<PreflightAuditIssue[]> {
	// Mock: Return sample SEO issue that opens Properties panel
	return [
		{
			fieldId: "seo-title", // Maps to SEO Title field in page properties
			fieldLabel: "SEO Title",
			type: "seo",
			severity: "critical",
			message: "Page title is too short for optimal SEO",
			original: "Home",
			suggestion: "Welcome to Example Corp - Industry-Leading Solutions",
			metadata: {
				seoField: "title-tag",
			},
		},
	];
}

export async function checkGEO(fields: PageField[], pageUrl: string): Promise<PreflightAuditIssue[]> {
	// Mock: Return sample GEO issue that opens Properties panel
	return [
		{
			fieldId: "meta-description", // Maps to Meta Description field in page properties
			fieldLabel: "Meta Description",
			type: "geo",
			severity: "high",
			message: "Missing meta description for better search visibility",
			original: "",
			suggestion: "Add a compelling meta description (150-160 characters) that summarizes your page content",
			metadata: {
				geoField: "meta-description",
			},
		},
	];
}

export async function checkProofreading(fields: PageField[]): Promise<PreflightAuditIssue[]> {
	// Real implementation: Call LanguageTool API via existing proofreading endpoint
	const issues: PreflightAuditIssue[] = [];

	for (const field of fields) {
		if (!field.text || field.text.trim().length < 10) continue;

		try {
			const response = await fetch("http://localhost:3000/api/proofreading/check", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({text: field.text}),
			});

			if (!response.ok) continue;

			const data = await response.json();
			const errors = data.errors || [];

			// Transform LanguageTool errors to PreflightAuditIssue format
			// Filter for only error/warning severity (map to critical/high)
			errors
				.filter((err: any) => err.severity === "error" || err.severity === "warning")
				.forEach((err: any) => {
					const severity = err.severity === "error" ? "critical" : "high";
					const errorText = err.errorText || field.text.substring(err.start, err.end);

					issues.push({
						fieldId: field.fieldId,
						fieldLabel: field.fieldLabel,
						type: "proofreading",
						severity: severity as "critical" | "high",
						message: err.message,
						original: errorText,
						suggestion: err.suggestion,
						metadata: {
							position: {start: err.start, end: err.end},
						},
					});
				});
		} catch (error) {
			console.error(`[Proofreading] Error checking field ${field.fieldId}:`, error);
		}
	}

	return issues;
}

export async function checkBrandTone(fields: PageField[]): Promise<PreflightAuditIssue[]> {
	// Real implementation: Call existing brand tone API
	try {
		const response = await fetch("http://localhost:3000/api/ai/brand-tone", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({context: "page", fields}),
		});

		if (!response.ok) {
			console.error("[Brand Tone] API error:", response.statusText);
			return [];
		}

		const data = await response.json();
		const brandToneIssues = data.issues || [];

		// Transform BrandToneIssue to PreflightAuditIssue format
		// Filter for high severity only
		return brandToneIssues
			.filter((issue: any) => issue.severity === "high")
			.map((issue: any) => ({
				fieldId: issue.fieldId,
				fieldLabel: issue.fieldLabel,
				type: "brand-tone" as const,
				severity: "high" as const,
				message: issue.message,
				original: issue.original,
				suggestion: issue.suggestion,
			}));
	} catch (error) {
		console.error("[Brand Tone] Error:", error);
		return [];
	}
}
