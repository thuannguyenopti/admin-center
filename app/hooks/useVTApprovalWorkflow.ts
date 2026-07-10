"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { VTActivity } from "@/app/cms/data/vt-activity";
import { MOCK_SEO_CHANGES } from "@/app/cms/data/vt-activity";
import {
	type ApprovalRequest,
	type ApprovalReviewer,
	DEFAULT_REVIEWERS,
	MOCK_BRAND_CHANGES,
	MOCK_LEGAL_CHANGES,
} from "@/app/cms/data/approval-workflow";

const CHANGE_MAP: Record<string, typeof MOCK_SEO_CHANGES> = {
	frank: MOCK_SEO_CHANGES,
	henry: MOCK_BRAND_CHANGES,
	lena: MOCK_LEGAL_CHANGES,
};

function makeActivity(
	reviewer: (typeof DEFAULT_REVIEWERS)[number],
	pageId: string,
	pageName: string,
): VTActivity {
	return {
		id: `vt-activity-${reviewer.vtId}-${Date.now()}`,
		vtId: reviewer.vtId,
		vtName: reviewer.vtName,
		vtAvatar: reviewer.vtAvatar,
		vtAvatarBg: reviewer.vtAvatarBg,
		vtTemplateName: reviewer.vtTemplateName,
		pageId,
		pageName,
		status: "analyzing",
		operation: reviewer.role,
		startedAt: new Date().toISOString(),
	};
}

export type PreflightStatus = "idle" | "running" | "done";

export function usePreflightWorkflow(
	pageId: string,
	pageName: string,
	onAllComplete?: () => void,
) {
	const [activities, setActivities] = useState<VTActivity[]>([]);
	const [preflightStatus, setPreflightStatus] =
		useState<PreflightStatus>("idle");
	const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

	useEffect(() => {
		return () => {
			timers.current.forEach(clearTimeout);
		};
	}, []);

	const completeReviewer = useCallback(
		(reviewerId: string, activityId: string) => {
			const changes = CHANGE_MAP[reviewerId] ?? [];
			setActivities((prev) =>
				prev.map((a) =>
					a.id === activityId
						? {
								...a,
								status: "complete" as const,
								completedAt: new Date().toISOString(),
								changes: changes.map((c) => ({ ...c })),
							}
						: a,
				),
			);
		},
		[],
	);

	const startReviewer = useCallback(
		(reviewer: (typeof DEFAULT_REVIEWERS)[number], delayMs: number) => {
			const activity = makeActivity(reviewer, pageId, pageName);

			const t0 = setTimeout(() => {
				setActivities((prev) => [...prev, activity]);
			}, delayMs);

			const t1 = setTimeout(
				() => {
					setActivities((prev) =>
						prev.map((a) =>
							a.id === activity.id
								? { ...a, status: "optimizing" as const }
								: a,
						),
					);
				},
				delayMs + 3000,
			);

			const t2 = setTimeout(
				() => {
					completeReviewer(reviewer.vtId, activity.id);
				},
				delayMs + 6000,
			);

			timers.current.push(t0, t1, t2);
		},
		[pageId, pageName, completeReviewer],
	);

	const startPreflight = useCallback(() => {
		timers.current.forEach(clearTimeout);
		timers.current = [];
		setActivities([]);
		setPreflightStatus("running");

		startReviewer(DEFAULT_REVIEWERS[0], 0);
		startReviewer(DEFAULT_REVIEWERS[1], 7000);
		startReviewer(DEFAULT_REVIEWERS[2], 7500);
	}, [startReviewer]);

	const cancelPreflight = useCallback(() => {
		timers.current.forEach(clearTimeout);
		timers.current = [];
		setActivities([]);
		setPreflightStatus("idle");
	}, []);

	const undoChange = useCallback(
		(activityId: string, changeIndex: number) => {
			setActivities((prev) =>
				prev.map((a) => {
					if (a.id !== activityId || !a.changes) return a;
					const changes = a.changes.map((c, i) =>
						i === changeIndex ? { ...c, undone: !c.undone } : c,
					);
					return { ...a, changes };
				}),
			);
		},
		[],
	);

	const undoAllChanges = useCallback(() => {
		setActivities((prev) =>
			prev.map((a) => {
				if (!a.changes) return a;
				return { ...a, changes: a.changes.map((c) => ({ ...c, undone: true })) };
			}),
		);
	}, []);

	// Detect when all reviewers are complete
	const allComplete =
		preflightStatus === "running" &&
		activities.length === DEFAULT_REVIEWERS.length &&
		activities.every((a) => a.status === "complete");

	useEffect(() => {
		if (allComplete) {
			setPreflightStatus("done");
			onAllComplete?.();
		}
	}, [allComplete, onAllComplete]);

	return {
		activities,
		preflightStatus,
		allComplete: preflightStatus === "done",
		startPreflight,
		cancelPreflight,
		undoChange,
		undoAllChanges,
	};
}
