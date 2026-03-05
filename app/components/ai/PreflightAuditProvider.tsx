"use client";

import React, {createContext, useContext, useState, useCallback, useRef, ReactNode} from "react";
import {PreflightAuditSidePanel} from "./PreflightAuditSidePanel";
import {Aside} from "@/app/context/LayoutContext";
import {toaster} from "@optiaxiom/react";
import type {PreflightAuditResult, PageField} from "./PreflightAuditTypes";
import type {PropertySection} from "@/app/components/vb/PropertiesPanel";

interface PreflightAuditContextValue {
	runAudit: (
		fields: PageField[],
		pageUrl: string,
		fieldToElementMap: Record<string, string>,
		onApplyField?: (fieldId: string, suggestion: string) => void,
		onApplyAll?: (changes: Array<{fieldId: string; suggestion: string}>) => void
	) => Promise<void>;
	isAuditing: boolean;
	registerScrollFunction: (fn: (elementId: string) => void) => void;
	registerOpenPropertiesFunction: (fn: (section: PropertySection) => void) => void;
}

const PreflightAuditContext = createContext<PreflightAuditContextValue | null>(null);

export function usePreflightAudit() {
	const context = useContext(PreflightAuditContext);
	if (!context) {
		throw new Error("usePreflightAudit must be used within PreflightAuditProvider");
	}
	return context;
}

export function PreflightAuditProvider({children}: {children: ReactNode}) {
	const [isAuditing, setIsAuditing] = useState(false);
	const [result, setResult] = useState<PreflightAuditResult | null>(null);
	const [onApplyCallback, setOnApplyCallback] = useState<
		((fieldId: string, suggestion: string) => void) | undefined
	>();
	const [onApplyAllCallback, setOnApplyAllCallback] = useState<
		((changes: Array<{fieldId: string; suggestion: string}>) => void) | undefined
	>();
	const [fieldToElementMap, setFieldToElementMap] = useState<Record<string, string>>({});
	const scrollFunctionRef = useRef<((elementId: string) => void) | null>(null);
	const openPropertiesFunctionRef = useRef<((section: PropertySection) => void) | null>(null);

	const registerScrollFunction = useCallback((fn: (elementId: string) => void) => {
		console.log("[PreflightAuditProvider] Scroll function registered");
		scrollFunctionRef.current = fn;
	}, []);

	const registerOpenPropertiesFunction = useCallback((fn: (section: PropertySection) => void) => {
		console.log("[PreflightAuditProvider] Open properties function registered");
		openPropertiesFunctionRef.current = fn;
	}, []);

	const runAudit = useCallback(
		async (
			fields: PageField[],
			pageUrl: string,
			fieldToElementMap: Record<string, string>,
			onApplyField?: (fieldId: string, suggestion: string) => void,
			onApplyAll?: (changes: Array<{fieldId: string; suggestion: string}>) => void
		) => {
			console.log("[Preflight Audit] Starting audit for", fields.length, "fields");
			setIsAuditing(true);
			setResult(null);
			setFieldToElementMap(fieldToElementMap);
			setOnApplyCallback(() => onApplyField);
			setOnApplyAllCallback(() => onApplyAll);

			try {
				const response = await fetch("/api/preflight-audit", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({fields, pageUrl}),
				});

				if (!response.ok) {
					console.error("[Preflight Audit] API error:", response.statusText);
					throw new Error("Failed to run preflight audit");
				}

				const data = await response.json();
				console.log("[Preflight Audit] Audit complete:", data);
				setResult(data);
			} catch (error) {
				console.error("[Preflight Audit] Error:", error);
				// Show error in panel
				setResult({
					totalIssues: 0,
					criticalCount: 0,
					highCount: 0,
					issues: [],
					summary: "Failed to run preflight audit. Please try again.",
					auditStatuses: {
						"broken-link": "failed",
						"missing-image": "failed",
						"required-field": "failed",
						"missing-alt-text": "failed",
						"content-freshness": "failed",
						seo: "failed",
						geo: "failed",
						proofreading: "failed",
						"brand-tone": "failed",
					},
				});
			} finally {
				setIsAuditing(false);
			}
		},
		[]
	);

	const handleApply = useCallback(
		(suggestion: string, fieldId?: string) => {
			if (onApplyCallback && fieldId) {
				onApplyCallback(fieldId, suggestion);
				toaster.create("Suggestion applied", {intent: "success"});
			}
		},
		[onApplyCallback]
	);

	const handleApplyAll = useCallback(
		(changes: Array<{fieldId: string; suggestion: string}>) => {
			if (onApplyAllCallback) {
				onApplyAllCallback(changes);
				toaster.create(`Applied ${changes.length} change${changes.length !== 1 ? "s" : ""}`, {
					intent: "success",
				});
			}
		},
		[onApplyAllCallback]
	);

	const handleSelectField = useCallback(
		(fieldId: string) => {
			console.log("[PreflightAuditProvider] handleSelectField called:", {
				fieldId,
				mappingKeys: Object.keys(fieldToElementMap),
				mapping: fieldToElementMap,
				hasScrollFunction: !!scrollFunctionRef.current,
				hasOpenPropertiesFunction: !!openPropertiesFunctionRef.current,
			});

			// Check if this is a properties field (not in visual builder)
			const propertiesFieldMap: Record<string, PropertySection> = {
				"seo-title": "geo-seo",
				"meta-description": "geo-seo",
				"meta-keywords": "geo-seo",
				"canonical-url": "geo-seo",
				"geo-schema": "geo-seo",
				"page-title": "content-settings",
				"page-description": "content-settings",
			};

			const propertiesSection = propertiesFieldMap[fieldId];

			if (propertiesSection && openPropertiesFunctionRef.current) {
				console.log("[PreflightAuditProvider] Opening properties panel to section:", propertiesSection);
				openPropertiesFunctionRef.current(propertiesSection);
				return;
			}

			// Regular visual builder field - scroll to it
			const elementId = fieldToElementMap[fieldId];

			if (!elementId) {
				console.warn(
					"[PreflightAuditProvider] No element mapping found for field:",
					fieldId,
					"Available keys:",
					Object.keys(fieldToElementMap)
				);
				return;
			}

			if (!scrollFunctionRef.current) {
				console.warn("[PreflightAuditProvider] Scroll function not registered");
				return;
			}

			console.log("[PreflightAuditProvider] Calling scroll function with element:", elementId);
			scrollFunctionRef.current(elementId);
		},
		[fieldToElementMap]
	);

	const handleClose = useCallback(() => {
		setResult(null);
		setIsAuditing(false);
	}, []);

	return (
		<PreflightAuditContext.Provider value={{runAudit, isAuditing, registerScrollFunction, registerOpenPropertiesFunction}}>
			{children}
			{(isAuditing || result) && (
				<Aside>
					<PreflightAuditSidePanel
						result={result}
						isLoading={isAuditing}
						onClose={handleClose}
						onApply={onApplyCallback ? handleApply : undefined}
						onApplyAll={onApplyAllCallback ? handleApplyAll : undefined}
						onSelectField={handleSelectField}
					/>
				</Aside>
			)}
		</PreflightAuditContext.Provider>
	);
}
