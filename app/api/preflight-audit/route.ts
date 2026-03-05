import {NextResponse} from "next/server";
import type {
	PreflightAuditIssue,
	PreflightAuditResult,
	PageField,
	AuditIssueType,
} from "@/app/components/ai/PreflightAuditTypes";

/**
 * Mock audit functions for Phase 1 MVP
 * These return hardcoded issues to test the UI and orchestration
 * Will be replaced with real implementations in Phase 2
 */

async function checkBrokenLinks(pageUrl: string, fields: PageField[]): Promise<PreflightAuditIssue[]> {
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

async function checkMissingImages(fields: PageField[]): Promise<PreflightAuditIssue[]> {
	// Mock: Return sample missing image issue using a real field ID
	if (fields.length < 2) return [];

	const field = fields[Math.min(4, fields.length - 1)]; // Use 5th field or last
	return [
		{
			fieldId: field.fieldId,
			fieldLabel: field.fieldLabel,
			type: "missing-image",
			severity: "critical",
			message: "Hero image is missing or cannot be loaded",
			original: "",
			suggestion: "Upload a hero image (recommended size: 1920x1080px)",
			metadata: {
				imageUrl: "",
			},
		},
	];
}

async function checkRequiredFields(fields: PageField[]): Promise<PreflightAuditIssue[]> {
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

async function checkAltText(fields: PageField[]): Promise<PreflightAuditIssue[]> {
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

async function checkContentFreshness(fields: PageField[]): Promise<PreflightAuditIssue[]> {
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

async function checkSEO(fields: PageField[], pageUrl: string): Promise<PreflightAuditIssue[]> {
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

async function checkGEO(fields: PageField[], pageUrl: string): Promise<PreflightAuditIssue[]> {
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

async function checkProofreading(fields: PageField[]): Promise<PreflightAuditIssue[]> {
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

async function checkBrandTone(fields: PageField[]): Promise<PreflightAuditIssue[]> {
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

/**
 * Master preflight audit orchestrator
 * Runs all 9 audits in parallel using Promise.allSettled
 * Aggregates results and filters for critical/high severity only
 */
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const {fields, pageUrl} = body;

		console.log("[Preflight Audit API] Request received:", {
			fieldsCount: fields?.length,
			pageUrl,
		});

		// Validate inputs
		if (!fields || !Array.isArray(fields)) {
			return NextResponse.json({error: "fields is required and must be an array"}, {status: 400});
		}

		console.log("[Preflight Audit API] Running 9 audits in parallel...");

		// Run all 9 audits in parallel with Promise.allSettled
		// This continues even if individual audits fail
		const results = await Promise.allSettled([
			checkBrokenLinks(pageUrl || "", fields),
			checkMissingImages(fields),
			checkRequiredFields(fields),
			checkAltText(fields),
			checkContentFreshness(fields),
			checkSEO(fields, pageUrl || ""),
			checkGEO(fields, pageUrl || ""),
			checkProofreading(fields),
			checkBrandTone(fields),
		]);

		const auditTypes: AuditIssueType[] = [
			"broken-link",
			"missing-image",
			"required-field",
			"missing-alt-text",
			"content-freshness",
			"seo",
			"geo",
			"proofreading",
			"brand-tone",
		];

		// Aggregate results and track statuses
		const issues: PreflightAuditIssue[] = [];
		const auditStatuses: Record<AuditIssueType, "success" | "failed" | "skipped"> = {} as any;

		results.forEach((result, index) => {
			const auditType = auditTypes[index];

			if (result.status === "fulfilled") {
				// Audit succeeded
				auditStatuses[auditType] = "success";
				const auditIssues = result.value;

				// Filter for critical/high severity only
				const filteredIssues = auditIssues.filter(
					(issue) => issue.severity === "critical" || issue.severity === "high"
				);

				issues.push(...filteredIssues);
				console.log(`[Preflight Audit API] ${auditType}: ${filteredIssues.length} issues`);
			} else {
				// Audit failed
				auditStatuses[auditType] = "failed";
				console.error(`[Preflight Audit API] ${auditType} failed:`, result.reason);
			}
		});

		// Sort issues by severity (critical first, then high)
		issues.sort((a, b) => {
			const severityOrder = {critical: 0, high: 1, medium: 2, low: 3};
			return severityOrder[a.severity] - severityOrder[b.severity];
		});

		const criticalCount = issues.filter((i) => i.severity === "critical").length;
		const highCount = issues.filter((i) => i.severity === "high").length;

		// Generate summary
		let summary = "";
		if (issues.length === 0) {
			summary = "All checks passed! Your content is ready to publish.";
		} else if (criticalCount > 0) {
			summary = `Found ${criticalCount} critical and ${highCount} high-priority issues that should be addressed before publishing.`;
		} else {
			summary = `Found ${highCount} high-priority issues. Consider addressing these before publishing.`;
		}

		const response: PreflightAuditResult = {
			totalIssues: issues.length,
			criticalCount,
			highCount,
			issues,
			summary,
			auditStatuses,
		};

		console.log("[Preflight Audit API] Complete:", {
			totalIssues: response.totalIssues,
			criticalCount: response.criticalCount,
			highCount: response.highCount,
			auditStatuses: response.auditStatuses,
		});

		return NextResponse.json(response);
	} catch (error) {
		console.error("[Preflight Audit API] Error occurred:", error);
		if (error instanceof Error) {
			console.error("[Preflight Audit API] Error message:", error.message);
		}
		return NextResponse.json({error: "Internal Server Error"}, {status: 500});
	}
}
