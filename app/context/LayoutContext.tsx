"use client";

import {createContext, useContext, useState, useEffect, ReactNode} from "react";
import type {ChatMessage} from "@/app/hooks/useOpalState";

type OpalPanelControls = {
	openPanel: () => void;
	togglePanel: () => void;
	closePanel: () => void;
	clearHistory: () => void;
	setInputValue: (value: string) => void;
	addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
	updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
	removeMessage: (id: string) => void;
	setInputDisabled: (disabled: boolean) => void;
};

type CodePanelControls = {
	openPanel: (filePath: string) => void;
	closePanel: () => void;
	isOpen: boolean;
};

type LayoutContextType = {
	asideContent: ReactNode | null;
	setAsideContent: (content: ReactNode | null) => void;
	footerContent: ReactNode | null;
	setFooterContent: (content: ReactNode | null) => void;
	hidePageHeader: boolean;
	setHidePageHeader: (hide: boolean) => void;
	opalPanelControls: OpalPanelControls | null;
	setOpalPanelControls: (controls: OpalPanelControls | null) => void;
	opalPanelWidth: number;
	setOpalPanelWidth: (width: number) => void;
	codePanelControls: CodePanelControls | null;
	setCodePanelControls: (controls: CodePanelControls | null) => void;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({children}: {children: ReactNode}) {
	const [asideContent, setAsideContent] = useState<ReactNode | null>(null);
	const [footerContent, setFooterContent] = useState<ReactNode | null>(null);
	const [hidePageHeader, setHidePageHeader] = useState<boolean>(false);
	const [opalPanelControls, setOpalPanelControls] = useState<OpalPanelControls | null>(null);
	const [opalPanelWidth, setOpalPanelWidth] = useState<number>(0);
	const [codePanelControls, setCodePanelControls] = useState<CodePanelControls | null>(null);

	return (
		<LayoutContext.Provider value={{asideContent, setAsideContent, footerContent, setFooterContent, hidePageHeader, setHidePageHeader, opalPanelControls, setOpalPanelControls, opalPanelWidth, setOpalPanelWidth, codePanelControls, setCodePanelControls}}>
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

/**
 * Aside component for rendering content in the right sidebar panel.
 *
 * @example
 * ```tsx
 * <Aside>
 *   <ContentDetails item={selectedItem} />
 * </Aside>
 * ```
 */
export function Aside({children}: {children: ReactNode}) {
	const {setAsideContent} = useLayout();

	useEffect(() => {
		setAsideContent(children);
		return () => setAsideContent(null);
	}, [children, setAsideContent]);

	return null;
}

/**
 * Footer component for rendering a fixed footer at the bottom of the page.
 * The footer automatically:
 * - Positions itself at the bottom of the viewport
 * - Respects sidebars and panels (doesn't cover them)
 * - Adds appropriate padding to page content
 * - Transitions smoothly when sidebars expand/collapse
 *
 * @example
 * ```tsx
 * <Footer>
 *   <Button onClick={handleSave}>Save</Button>
 * </Footer>
 * ```
 */
export function Footer({children}: {children: ReactNode}) {
	const {setFooterContent} = useLayout();

	useEffect(() => {
		setFooterContent(children);
		return () => setFooterContent(null);
	}, [children, setFooterContent]);

	return null;
}
