"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import type { ExperimentCreationAgentPayload } from "@/app/components/Opal/experimentCreationAgentTypes";

type OpalPanelActionsContextType = {
	openPanelAndSendMessage: (message: string) => void;
	openExperimentCreationAgent: (payload: ExperimentCreationAgentPayload) => void;
};

const OpalPanelActionsContext = createContext<OpalPanelActionsContextType | undefined>(undefined);

export function OpalPanelActionsProvider({
	children,
	openPanel,
	sendMessage,
	openExperimentCreationAgent,
}: {
	children: ReactNode;
	openPanel: () => void;
	sendMessage: (content: string) => void;
	openExperimentCreationAgent: (payload: ExperimentCreationAgentPayload) => void;
}) {
	const openPanelAndSendMessage = useCallback(
		(message: string) => {
			openPanel();
			if (message.trim()) {
				sendMessage(message.trim());
			}
		},
		[openPanel, sendMessage],
	);

	return (
		<OpalPanelActionsContext.Provider
			value={{ openPanelAndSendMessage, openExperimentCreationAgent }}
		>
			{children}
		</OpalPanelActionsContext.Provider>
	);
}

export function useOpalPanelActions() {
	const context = useContext(OpalPanelActionsContext);
	if (context === undefined) {
		throw new Error("useOpalPanelActions must be used within an OpalPanelActionsProvider");
	}
	return context;
}
