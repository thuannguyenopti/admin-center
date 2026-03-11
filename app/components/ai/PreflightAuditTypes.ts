/**
 * Type definitions for Preflight Audit feature
 *
 * Provides unified interface for aggregating results from multiple audit types
 * (broken links, missing images, required fields, alt-text, SEO, GEO, proofreading, brand tone, content freshness)
 */

export type AuditIssueType =
	| "broken-link"
	| "missing-image"
	| "required-field"
	| "missing-alt-text"
	| "content-freshness"
	| "seo"
	| "geo"
	| "proofreading"
	| "brand-tone";

/**
 * Unified issue interface for all audit types
 * Extends the BrandToneIssue pattern with audit-specific metadata
 */
export interface PreflightAuditIssue {
	// Core fields (matches BrandToneIssue pattern)
	fieldId?: string; // Which field has the issue
	fieldLabel?: string; // Human-readable field name
	type: AuditIssueType; // Which audit found this
	severity: "critical" | "high" | "medium" | "low";
	message: string; // Description of the issue
	original: string; // Current value
	suggestion: string; // Recommended fix

	// Audit-specific metadata (extensible)
	metadata?: {
		url?: string; // For broken links
		position?: {start: number; end: number}; // For proofreading
		statusCode?: number; // For link checking
		seoField?: string; // For SEO issues (e.g., "meta-description", "title-tag")
		geoField?: string; // For GEO issues (e.g., "schema-markup", "nap")
		imageUrl?: string; // For image-related issues
		// ... extensible for future audit types
	};
}

/**
 * Result from running a complete preflight audit
 * Aggregates issues from all audit types with summary statistics
 */
export interface PreflightAuditResult {
	totalIssues: number;
	criticalCount: number;
	highCount: number;
	issues: PreflightAuditIssue[];
	summary: string;
	auditStatuses: Record<AuditIssueType, "success" | "failed" | "skipped">;
}

/**
 * Field data passed to audit endpoints
 */
export interface PageField {
	fieldId: string;
	fieldLabel: string;
	text: string;
	src?: string;
	alt?: string;
}

/**
 * Human-readable labels for audit issue types
 */
export const AuditTypeLabels: Record<AuditIssueType, string> = {
	"broken-link": "Broken Links",
	"missing-image": "Missing Images",
	"required-field": "Required Fields",
	"missing-alt-text": "Missing Alt-Text",
	"content-freshness": "Content Freshness",
	seo: "SEO",
	geo: "GEO",
	proofreading: "Proofreading",
	"brand-tone": "Brand Tone",
};

/**
 * Maps severity to Axiom Badge intent
 */
export const SeverityIntent: Record<
	PreflightAuditIssue["severity"],
	"danger" | "warning" | "information" | "neutral"
> = {
	critical: "danger",
	high: "warning",
	medium: "warning",
	low: "information",
};

/**
 * Sort order for severity (most severe first)
 */
export const SeverityOrder: Record<PreflightAuditIssue["severity"], number> = {
	critical: 0,
	high: 1,
	medium: 2,
	low: 3,
};
