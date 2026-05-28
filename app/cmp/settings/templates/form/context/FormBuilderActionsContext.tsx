"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Node, Edge } from "@xyflow/react";

export type FormBuilderActions = {
	removeEdge: (edgeId: string) => void;
	deleteNode: (nodeId: string) => void;
	applyGraph: (nodes: Node[], edges: Edge[]) => void;
};

const FormBuilderActionsContext = createContext<FormBuilderActions | null>(null);

export function FormBuilderActionsProvider({
	children,
	actions,
}: {
	children: ReactNode;
	actions: FormBuilderActions;
}) {
	return (
		<FormBuilderActionsContext.Provider value={actions}>
			{children}
		</FormBuilderActionsContext.Provider>
	);
}

export function useFormBuilderActions(): FormBuilderActions | null {
	return useContext(FormBuilderActionsContext);
}
