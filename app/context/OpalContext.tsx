"use client";

import { createContext, useContext, useMemo, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useOpalHistory } from "@/app/hooks/useOpalHistory";
import { useOpalState } from "@/app/hooks/useOpalState";

// Types for navigation structure
type NavItem = {
  label: string;
  url?: string;
  highlight?: string;
  description?: string;
  children?: NavItem[] | { title: string; children: NavItem[] };
};

// Context types
export type PageContext = {
  path: string;
  productArea: string;
  pageName: string;
  pageDescription?: string;
};

export type OpalContextType = {
  currentPage: PageContext;
  availableFeatures: string[];
  opalCapabilities: string[];
  history?: any;
};

// Opal's capabilities - what it can help with
const OPAL_CAPABILITIES = [
  "Answer questions about Optimizely products and features",
  "Help with A/B testing and experimentation strategies",
  "Analyze content and page performance",
  "Assist with content creation and optimization",
  "Guide through feature configuration and setup",
  "Explain available features on the current page",
  "Suggest test ideas and optimization opportunities",
  "Help navigate the platform and find features",
  "Provide best practices for digital experience optimization",
  "Assist with audience targeting and segmentation",
];

// Product area mappings
const PRODUCT_AREA_MAP: Record<string, string> = {
  cms: "Content Management System (CMS)",
  opal: "Opal AI Platform",
  "admin-center": "Admin Center",
  "connect-platform": "Connect Platform",
  "fe-hosting": "Frontend Hosting",
};

// Helper function to extract features from navigation structure
function extractFeaturesFromNavigation(structure: NavItem[]): string[] {
  const features: string[] = [];

  for (const item of structure) {
    if (item.url && item.label) {
      features.push(item.label);
    }

    if (Array.isArray(item.children)) {
      for (const child of item.children) {
        if (child.url && child.label) {
          features.push(child.label);
        }
      }
    } else if (item.children && typeof item.children === 'object' && 'children' in item.children) {
      for (const child of item.children.children) {
        if (child.url && child.label) {
          features.push(child.label);
        }
      }
    }
  }

  return [...new Set(features)];
}

// Helper function to find the current page info from navigation
function findCurrentPageInfo(
  path: string,
  structure: NavItem[]
): { pageName: string; pageDescription?: string } {
  const flatItems: { label: string; url?: string; highlight?: string; description?: string }[] = [];

  function flatten(items: NavItem[]) {
    for (const item of items) {
      if (item.url || item.highlight) {
        flatItems.push({ label: item.label, url: item.url, highlight: item.highlight, description: item.description });
      }
      if (Array.isArray(item.children)) {
        flatten(item.children);
      } else if (item.children && typeof item.children === 'object' && 'children' in item.children) {
        flatten(item.children.children);
      }
    }
  }

  flatten(structure);

  const matches = flatItems
    .filter(item => {
      const matchPath = item.url || item.highlight;
      return matchPath && path.includes(matchPath);
    })
    .sort((a, b) => {
      const aPath = a.url || a.highlight || '';
      const bPath = b.url || b.highlight || '';
      return bPath.length - aPath.length;
    });

  if (matches.length > 0) {
    return { pageName: matches[0].label, pageDescription: matches[0].description };
  }

  return { pageName: "Unknown Page" };
}

// Default context value
const defaultContext: OpalContextType = {
  currentPage: { path: "/", productArea: "Unknown", pageName: "Unknown Page" },
  availableFeatures: [],
  opalCapabilities: OPAL_CAPABILITIES,
};

const OpalContext = createContext<OpalContextType>(defaultContext);

type OpalContextProviderProps = {
  children: ReactNode;
  navigationStructure?: NavItem[];
};

export function OpalContextProvider({
  children,
  navigationStructure = []
}: OpalContextProviderProps) {
  const pathname = usePathname();

  const contextValue = useMemo<OpalContextType>(() => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const productAreaKey = pathSegments[0] || "";
    const productArea = PRODUCT_AREA_MAP[productAreaKey] || "Optimizely Platform";

    const pageInfo = navigationStructure.length > 0
      ? findCurrentPageInfo(pathname, navigationStructure)
      : { pageName: productAreaKey || "Home" };

    const availableFeatures = extractFeaturesFromNavigation(navigationStructure);

    return {
      currentPage: { path: pathname, productArea, pageName: pageInfo.pageName, pageDescription: pageInfo.pageDescription },
      availableFeatures,
      opalCapabilities: OPAL_CAPABILITIES,
    };
  }, [pathname, navigationStructure]);

  const history = useOpalHistory();
  const chatState = useOpalState({
    activeChatId: history.activeChat,
    opalContext: contextValue
  });

  const value = useMemo(() => ({
    ...contextValue,
    history,
    chatState,
  }), [contextValue, history, chatState]);

  return (
    <OpalContext.Provider value={value}>
      {children}
    </OpalContext.Provider>
  );
}

export type OpalHistoryContextType = ReturnType<typeof useOpalHistory>;
export type OpalChatStateContextType = ReturnType<typeof useOpalState>;

export type OpalContextWithHistoryType = OpalContextType & {
  history: OpalHistoryContextType;
  chatState: OpalChatStateContextType;
};

export function useOpalContext() {
  const context = useContext(OpalContext) as OpalContextWithHistoryType;
  if (!context) {
    throw new Error("useOpalContext must be used within an OpalContextProvider");
  }
  return context;
}

export { OPAL_CAPABILITIES };
