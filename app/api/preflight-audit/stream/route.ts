import type {
	PreflightAuditIssue,
	PreflightAuditResult,
	PageField,
	AuditIssueType,
} from "@/app/components/ai/PreflightAuditTypes";

/**
 * Import audit functions from utils
 * These are the same functions used in the non-streaming endpoint
 */
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
} from "../utils";
import {ChecklistItem, delay, sseHeaders} from "@/app/lib/streaming";

/**
 * SSE Streaming endpoint for Preflight Audit
 * Sends real-time progress updates as each audit completes
 */
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const {fields, pageUrl} = body;

		console.log("[Preflight Audit Stream] Request received:", {
			fieldsCount: fields?.length,
			pageUrl,
		});

		// Validate inputs
		if (!fields || !Array.isArray(fields)) {
			return new Response(JSON.stringify({error: "fields is required and must be an array"}), {
				status: 400,
				headers: {"Content-Type": "application/json"},
			});
		}

		// Create SSE stream
		const encoder = new TextEncoder();

		const stream = new ReadableStream({
			async start(controller) {
				// Helper to send SSE event
				const sendEvent = (event: string, data: any) => {
					const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
					controller.enqueue(encoder.encode(message));
				};

				// Helper to add minimum delay between tasks (100-200ms)
				const taskDelay = () => delay(100 + Math.random() * 100); // Random 100-200ms

				// Initial checklist with all audits pending
				const checklist: ChecklistItem[] = [
					{label: "Proofreading", status: "pending"},
					{label: "Brand Tone", status: "pending"},
					{label: "Required Fields", status: "pending"},
					{label: "Missing Alt-Text", status: "pending"},
					{label: "Broken Links", status: "pending"},
					{label: "Missing Images", status: "pending"},
					{label: "SEO Audit", status: "pending"},
					{label: "GEO Audit", status: "pending"},
					{label: "Content Freshness", status: "pending"},
				];

				// Send initial checklist
				sendEvent("checklist", checklist);

				try {
					const issues: PreflightAuditIssue[] = [];
					const auditStatuses: Record<AuditIssueType, "success" | "failed" | "skipped"> = {} as any;

					// Helper to update checklist status
					const updateChecklist = (index: number, status: ChecklistItem["status"]) => {
						checklist[index].status = status;
						sendEvent("checklist", checklist);
					};

					// Run each audit sequentially with progress updates
					// Audit 0: Proofreading
					try {
						updateChecklist(0, "running");
						const result = await checkProofreading(fields);
						const filtered = result.filter(
							(issue) => issue.severity === "critical" || issue.severity === "high"
						);
						issues.push(...filtered);
						auditStatuses["proofreading"] = "success";
						updateChecklist(0, "completed");
						await taskDelay();
					} catch (error) {
						console.error("[Stream] Proofreading failed:", error);
						auditStatuses["proofreading"] = "failed";
						updateChecklist(0, "failed");
						await taskDelay();
					}

					// Audit 1: Brand Tone
					try {
						updateChecklist(1, "running");
						const result = await checkBrandTone(fields);
						const filtered = result.filter(
							(issue) => issue.severity === "critical" || issue.severity === "high"
						);
						issues.push(...filtered);
						auditStatuses["brand-tone"] = "success";
						updateChecklist(1, "completed");
						await taskDelay();
					} catch (error) {
						console.error("[Stream] Brand Tone failed:", error);
						auditStatuses["brand-tone"] = "failed";
						updateChecklist(1, "failed");
						await taskDelay();
					}

					// Audit 2: Required Fields
					try {
						updateChecklist(2, "running");
						const result = await checkRequiredFields(fields);
						const filtered = result.filter(
							(issue) => issue.severity === "critical" || issue.severity === "high"
						);
						issues.push(...filtered);
						auditStatuses["required-field"] = "success";
						updateChecklist(2, "completed");
						await taskDelay();
					} catch (error) {
						console.error("[Stream] Required Fields failed:", error);
						auditStatuses["required-field"] = "failed";
						updateChecklist(2, "failed");
						await taskDelay();
					}

					// Audit 3: Missing Alt-Text
					try {
						updateChecklist(3, "running");
						const result = await checkAltText(fields);
						const filtered = result.filter(
							(issue) => issue.severity === "critical" || issue.severity === "high"
						);
						issues.push(...filtered);
						auditStatuses["missing-alt-text"] = "success";
						updateChecklist(3, "completed");
						await taskDelay();
					} catch (error) {
						console.error("[Stream] Alt-Text failed:", error);
						auditStatuses["missing-alt-text"] = "failed";
						updateChecklist(3, "failed");
						await taskDelay();
					}

					// Audit 4: Broken Links
					try {
						updateChecklist(4, "running");
						const result = await checkBrokenLinks(pageUrl || "", fields);
						const filtered = result.filter(
							(issue) => issue.severity === "critical" || issue.severity === "high"
						);
						issues.push(...filtered);
						auditStatuses["broken-link"] = "success";
						updateChecklist(4, "completed");
						await taskDelay();
					} catch (error) {
						console.error("[Stream] Broken Links failed:", error);
						auditStatuses["broken-link"] = "failed";
						updateChecklist(4, "failed");
						await taskDelay();
					}

					// Audit 5: Missing Images
					try {
						updateChecklist(5, "running");
						const result = await checkMissingImages(fields);
						const filtered = result.filter(
							(issue) => issue.severity === "critical" || issue.severity === "high"
						);
						issues.push(...filtered);
						auditStatuses["missing-image"] = "success";
						updateChecklist(5, "completed");
						await taskDelay();
					} catch (error) {
						console.error("[Stream] Missing Images failed:", error);
						auditStatuses["missing-image"] = "failed";
						updateChecklist(5, "failed");
						await taskDelay();
					}

					// Audit 6: SEO
					try {
						updateChecklist(6, "running");
						const result = await checkSEO(fields, pageUrl || "");
						const filtered = result.filter(
							(issue) => issue.severity === "critical" || issue.severity === "high"
						);
						issues.push(...filtered);
						auditStatuses["seo"] = "success";
						updateChecklist(6, "completed");
						await taskDelay();
					} catch (error) {
						console.error("[Stream] SEO failed:", error);
						auditStatuses["seo"] = "failed";
						updateChecklist(6, "failed");
						await taskDelay();
					}

					// Audit 7: GEO
					try {
						updateChecklist(7, "running");
						const result = await checkGEO(fields, pageUrl || "");
						const filtered = result.filter(
							(issue) => issue.severity === "critical" || issue.severity === "high"
						);
						issues.push(...filtered);
						auditStatuses["geo"] = "success";
						updateChecklist(7, "completed");
						await taskDelay();
					} catch (error) {
						console.error("[Stream] GEO failed:", error);
						auditStatuses["geo"] = "failed";
						updateChecklist(7, "failed");
						await taskDelay();
					}

					// Audit 8: Content Freshness
					try {
						updateChecklist(8, "running");
						const result = await checkContentFreshness(fields);
						const filtered = result.filter(
							(issue) => issue.severity === "critical" || issue.severity === "high"
						);
						issues.push(...filtered);
						auditStatuses["content-freshness"] = "success";
						updateChecklist(8, "completed");
						await taskDelay();
					} catch (error) {
						console.error("[Stream] Content Freshness failed:", error);
						auditStatuses["content-freshness"] = "failed";
						updateChecklist(8, "failed");
						await taskDelay();
					}

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

					// Send final results
					const result: PreflightAuditResult = {
						totalIssues: issues.length,
						criticalCount,
						highCount,
						issues,
						summary,
						auditStatuses,
					};

					sendEvent("results", result);

					console.log("[Preflight Audit Stream] Complete:", {
						totalIssues: result.totalIssues,
						criticalCount: result.criticalCount,
						highCount: result.highCount,
						auditStatuses: result.auditStatuses,
					});
				} catch (error) {
					console.error("[Preflight Audit Stream] Error occurred:", error);
					sendEvent("error", {message: "An error occurred during the audit"});
				} finally {
					controller.close();
				}
			},
		});

		return new Response(stream, {headers: sseHeaders()});
	} catch (error) {
		console.error("[Preflight Audit Stream] Error occurred:", error);
		return new Response(JSON.stringify({error: "Internal Server Error"}), {
			status: 500,
			headers: {"Content-Type": "application/json"},
		});
	}
}
