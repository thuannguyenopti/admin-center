"use client";

import {createContext, useContext, useState, ReactNode} from "react";

type LayoutContextType = {
	asideContent: ReactNode | null;
	setAsideContent: (content: ReactNode | null) => void;
	titleActions: ReactNode | null;
	setTitleActions: (content: ReactNode | null) => void;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({children}: {children: ReactNode}) {
	const [asideContent, setAsideContent] = useState<ReactNode | null>(null);
	const [titleActions, setTitleActions] = useState<ReactNode | null>(null);

	return (
		<LayoutContext.Provider value={{asideContent, setAsideContent, titleActions, setTitleActions}}>
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
