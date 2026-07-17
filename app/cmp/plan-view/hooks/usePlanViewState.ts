"use client";

import { useState, useMemo, useEffect } from "react";
import { initialCmpTasks, initialCmpCampaigns } from "@/app/db/cmpInitialData";
import type { TaskWorkflowState } from "@/app/cmp/task/[id]/workflowTypes";
import { resolveTaskWorkflow } from "@/app/cmp/task/[id]/utils/workflowState";
import usePersistentState from "@/app/usePersistentState";
import type { PlanItem } from "../types";

function deriveWorkflowInfo(
	taskId: string,
	taskWorkflows: Record<string, TaskWorkflowState>,
): { currentStep: string | null; currentStepName: string | null } {
	const workflow = resolveTaskWorkflow(taskId, taskWorkflows, "brief");
	const steps = workflow.steps;
	if (steps.length === 0) return { currentStep: null, currentStepName: null };

	const doneCount = steps.filter((s) => s.done).length;
	const currentStepObj = steps.find((s) => !s.done);
	const currentStepIndex = currentStepObj ? steps.indexOf(currentStepObj) + 1 : doneCount;

	return {
		currentStep: `${currentStepIndex} of ${steps.length}`,
		currentStepName: currentStepObj?.title?.replace(/^\d+\.\s*/, "") ?? null,
	};
}

export function usePlanViewState() {
	const [taskWorkflows, , isHydrated] = usePersistentState(
		"cmpTaskWorkflows",
		{} as Record<string, TaskWorkflowState>,
	) as [Record<string, TaskWorkflowState>, unknown, boolean];

	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);
	const [pageSize] = useState(20);
	const [showHierarchy, setShowHierarchy] = useState(true);
	const [expandedGroups, setExpandedGroups] = useState<string[]>(() =>
		initialCmpCampaigns.filter((c) => c.badge).map((c) => c.id),
	);
	const [activeView, setActiveView] = useState("list");

	const planItems: PlanItem[] = useMemo(() => {
		const campaignItems: PlanItem[] = initialCmpCampaigns.map((c) => ({
			id: c.id,
			title: c.title,
			type: "Campaign" as const,
			reference: c.reference,
			owner: c.owner,
			creationDate: c.creationDate,
			startDate: c.startDate,
			endDate: c.endDate,
			status: c.status,
			parentCampaign: null,
			lastModified: c.lastModified,
			currentStep: null,
			currentStepName: null,
			badge: c.badge,
			isGroup: true,
		}));

		const taskItems: PlanItem[] = initialCmpTasks.map((t) => {
			const { currentStep, currentStepName } = isHydrated
				? deriveWorkflowInfo(t.id, taskWorkflows)
				: { currentStep: null, currentStepName: null };
			const parentCampaignTitle = t.parentCampaignId
				? initialCmpCampaigns.find((c) => c.id === t.parentCampaignId)?.title ?? null
				: null;
			return {
				id: t.id,
				title: t.title,
				type: "Task" as const,
				reference: t.reference,
				owner: t.owner,
				creationDate: t.creationDate,
				startDate: t.startDate,
				endDate: t.endDate,
				status: t.status,
				parentCampaign: parentCampaignTitle,
				lastModified: t.lastModified,
				currentStep,
				currentStepName,
			};
		});

		const all = [...taskItems, ...campaignItems];
		all.sort((a, b) => {
			const dateA = new Date(a.creationDate).getTime();
			const dateB = new Date(b.creationDate).getTime();
			return dateB - dateA;
		});
		return all;
	}, [taskWorkflows, isHydrated]);

	const filteredItems = useMemo(() => {
		if (!searchQuery.trim()) return planItems;
		const q = searchQuery.toLowerCase();
		return planItems.filter(
			(item) =>
				item.title.toLowerCase().includes(q) ||
				item.reference.toLowerCase().includes(q) ||
				item.owner.name.toLowerCase().includes(q),
		);
	}, [planItems, searchQuery]);

	const visibleItems = useMemo(() => {
		if (!showHierarchy) return filteredItems;
		return filteredItems.filter((item) => {
			if (item.isGroup) return true;
			if (!item.parentCampaign) return true;
			const parentCampaign = filteredItems.find(
				(fi) => fi.isGroup && fi.title === item.parentCampaign,
			);
			if (!parentCampaign) return true;
			return expandedGroups.includes(parentCampaign.id);
		});
	}, [filteredItems, showHierarchy, expandedGroups]);

	const totalItems = visibleItems.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	const paginatedItems = visibleItems.slice((page - 1) * pageSize, page * pageSize);

	useEffect(() => {
		setPage(1);
	}, [searchQuery]);

	const toggleGroup = (id: string) => {
		setExpandedGroups((prev) =>
			prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
		);
	};

	return {
		activeView,
		setActiveView,
		searchQuery,
		setSearchQuery,
		page,
		setPage,
		pageSize,
		totalItems,
		totalPages,
		showHierarchy,
		setShowHierarchy,
		expandedGroups,
		toggleGroup,
		allItems: visibleItems,
		paginatedItems,
	};
}
