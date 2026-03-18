"use client";

import {createContext, useContext, useState, useEffect, ReactNode} from "react";
import type {ChatMessage} from "@/app/hooks/useOpalState";

type OpalPanelControls = {
	openPanel: () => void;
	togglePanel: () => void;
	closePanel: () => void;
	addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
	updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
	removeMessage: (id: string) => void;
	setInputDisabled: (disabled: boolean) => void;
};

type LayoutContextType = {
	asideContent: ReactNode | null;
	setAsideContent: (content: ReactNode | null) => void;
	hidePageHeader: boolean;
	setHidePageHeader: (hide: boolean) => void;
	opalPanelControls: OpalPanelControls | null;
	setOpalPanelControls: (controls: OpalPanelControls | null) => void;
	opalPanelWidth: number;
	setOpalPanelWidth: (width: number) => void;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({children}: {children: ReactNode}) {
	const [asideContent, setAsideContent] = useState<ReactNode | null>(null);
	const [hidePageHeader, setHidePageHeader] = useState<boolean>(false);
	const [opalPanelControls, setOpalPanelControls] = useState<OpalPanelControls | null>(null);
	const [opalPanelWidth, setOpalPanelWidth] = useState<number>(0);

	return (
		<LayoutContext.Provider value={{asideContent, setAsideContent, hidePageHeader, setHidePageHeader, opalPanelControls, setOpalPanelControls, opalPanelWidth, setOpalPanelWidth}}>
			{children}
		</LayoutContext.Provider>
	);
}

export function useLayout() {
	const context = useContext(LayoutContext);
	if (!context) {
		throw new Error("useLayout must be used within a LayoutProvider");
	}
	return context;
}

// Helper component to use in pages
export function Aside({children}: {children: ReactNode}) {
	const {setAsideContent} = useLayout();

	// Update the aside content when this component mounts
	useEffect(() => {
		setAsideContent(children);
		return () => setAsideContent(null); // Cleanup on unmount
	}, [children, setAsideContent]);

	return null; // Renders nothing in the main flow
}
