"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { ChatMessage } from "@/app/hooks/useOpalState";
import type { PendingVariationBuild } from "@/app/web-experimentation/optimizations/dynamicOptimizationStorage";
import type { VariationRow } from "@/app/web-experimentation/optimizations/variationSets";

const VARIATION_BUILD_STEP_MS = 1180;
const VARIATION_STEPS = [
	"Reviewing your test idea",
	"Generating variation experience",
	"Applying UI changes",
	"Validating setup",
] as const;

function delay(ms: number) {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});
}

type OpalVariationBuildContextValue = {
	runVariationBuild: (pending: PendingVariationBuild) => Promise<VariationRow>;
};

const OpalVariationBuildContext = createContext<OpalVariationBuildContextValue | null>(null);

type ProviderProps = {
	children: ReactNode;
	addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => ChatMessage;
	updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
};

export function OpalVariationBuildProvider({ children, addMessage, updateMessage }: ProviderProps) {
	const runVariationBuild = useCallback(
		async (pending: PendingVariationBuild): Promise<VariationRow> => {
			addMessage({
				role: "assistant",
				content:
					"Now I’m creating a variation from your idea. You’ll see a loading row in the Variations table until it’s ready.",
			});

			const loading = addMessage({
				role: "assistant",
				content: "",
				isLoading: true,
				loadingSteps: [...VARIATION_STEPS],
				loadingStepIndex: 0,
			});

			for (let i = 0; i < VARIATION_STEPS.length; i++) {
				updateMessage(loading.id, { loadingStepIndex: i });
				await delay(VARIATION_BUILD_STEP_MS);
			}
			updateMessage(loading.id, { loadingStepIndex: VARIATION_STEPS.length });
			await delay(480);

			const variation: VariationRow = {
				key: `opal-${pending.optimizationId}-b`,
				letter: "B",
				title: `${pending.experimentName} — Opal draft`,
				description:
					pending.description ||
					pending.hypothesis ||
					"Variation generated from your test idea and draft context.",
				preview: "highContrast",
			};

			updateMessage(loading.id, {
				isLoading: false,
				loadingSteps: undefined,
				loadingStepIndex: undefined,
				content:
					"Variation is built and ready for review. It’s in the Variations table with a preview—use Edit to open it in the editor when you want to refine it.",
			});

			return variation;
		},
		[addMessage, updateMessage],
	);

	const value = useMemo(() => ({ runVariationBuild }), [runVariationBuild]);

	return (
		<OpalVariationBuildContext.Provider value={value}>{children}</OpalVariationBuildContext.Provider>
	);
}

export function useOpalVariationBuild(): OpalVariationBuildContextValue {
	const ctx = useContext(OpalVariationBuildContext);
	if (!ctx) {
		throw new Error("useOpalVariationBuild must be used within OpalVariationBuildProvider");
	}
	return ctx;
}
