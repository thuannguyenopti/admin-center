import {NextResponse} from "next/server";
import type {
	PreflightAuditResult,
	AuditIssueType,
} from "@/app/components/ai/PreflightAuditTypes";
import {
	checkBrokenLinks,
	checkMissingImages,
	checkRequiredFields,
	checkAltText,
	checkContentFreshness,
	checkSEO,
	checkGEO,
	checkProofreading,
	checkBrandTone,
} from "./utils";

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
		const issues: any[] = [];
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
			const severityOrder = {critical:  0, high: 1, medium: 2, low: 3} as Record<string, number>;
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
