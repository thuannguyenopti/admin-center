export type SourceInspectorSelector =
	| {
			type: "symbol";
			symbol: string;
	  }
	| {
			type: "lines";
			start: number;
			end: number;
	  };

export type SourceInspectorView = {
	id: string;
	label: string;
	path: string;
	description?: string;
	selector?: SourceInspectorSelector;
};

export type SourceInspectorManifest = {
	title: string;
	description?: string;
	defaultViewId?: string;
	views: SourceInspectorView[];
};

const routeManifests: Record<string, SourceInspectorManifest> = {
	"/cmp/resource-management": {
		title: "Resource Management",
		description: "Review the scheduling workspace by focused surface area instead of the full route file.",
		defaultViewId: "planner-grid",
		views: [
			{
				id: "planner-grid",
				label: "Planner Grid",
				path: "app/cmp/resource-management/components/PlannerView.tsx",
				description: "Timeline layout, drag and drop, resizing, lane stacking, and sticky person rows.",
				selector: { type: "symbol", symbol: "PlannerGrid" },
			},
			{
				id: "workload-grid",
				label: "Workload Grid",
				path: "app/cmp/resource-management/components/WorkloadView.tsx",
				description: "Weekly workload table with sticky columns, status coloring, and cell interactions.",
				selector: { type: "symbol", symbol: "WorkloadGrid" },
			},
			{
				id: "page-shell",
				label: "Page Shell",
				path: "app/cmp/resource-management/page.tsx",
				description: "Tabs, toolbar controls, and the viewport-bounded workspace shell.",
				selector: { type: "symbol", symbol: "CMPResourceManagementPage" },
			},
			{
				id: "lane-packing",
				label: "Lane Packing",
				path: "app/cmp/resource-management/utils.ts",
				description: "Planner lane normalization and card packing logic used to keep rows collision-free.",
				selector: { type: "symbol", symbol: "normalizePlannerCardLanes" },
			},
		],
	},
	"/cmp/task/[id]": {
		title: "CMP Task Detail",
		description: "Focused views into the refactored task detail flow so developers can inspect the live experience by area.",
		defaultViewId: "task-orchestrator",
		views: [
			{
				id: "task-orchestrator",
				label: "Task Orchestrator",
				path: "app/cmp/task/[id]/TaskDetailView.tsx",
				description: "Scene switching and the top-level composition of the task experience.",
				selector: { type: "symbol", symbol: "TaskDetailView" },
			},
			{
				id: "task-state",
				label: "Task State",
				path: "app/cmp/task/[id]/useTaskDetailState.ts",
				description: "The central state machine that coordinates scenes, selections, and task actions.",
				selector: { type: "symbol", symbol: "useTaskDetailState" },
			},
			{
				id: "content-filled",
				label: "Content Filled Page",
				path: "app/cmp/task/[id]/components/content/ContentFilledPage.tsx",
				description: "The populated content experience used after assets and content have been added.",
				selector: { type: "symbol", symbol: "ContentFilledPage" },
			},
			{
				id: "search-page",
				label: "Asset Search Page",
				path: "app/cmp/task/[id]/components/assets/SearchPage.tsx",
				description: "The search and recommendation view for finding assets to add to the task.",
				selector: { type: "symbol", symbol: "SearchPage" },
			},
		],
	},
	"/cmp/library": {
		title: "CMP Library",
		description: "The Library experience is still mostly route-local, so the inspector starts with the page shell.",
		defaultViewId: "library-page",
		views: [
			{
				id: "library-page",
				label: "Library Page",
				path: "app/cmp/library/page.tsx",
				description: "The main Library route, including tabs, toolbar controls, and asset grid rendering.",
			},
		],
	},
};

export function normalizeRoutePath(route: string) {
	const cleanRoute = route.split("?")[0].split("#")[0] || "/";
	if (cleanRoute === "/") {
		return "/";
	}

	return `/${cleanRoute.split("/").filter(Boolean).join("/")}`.replace(/\/+$/, "");
}

export function buildPageFilePathFromRoute(route: string) {
	const cleanRoute = normalizeRoutePath(route);
	if (cleanRoute === "/") {
		return "app/page.tsx";
	}

	return `app${cleanRoute}/page.tsx`;
}

function buildManifestCandidates(route: string) {
	const cleanRoute = normalizeRoutePath(route);
	if (cleanRoute === "/") {
		return ["/"];
	}

	const segments = cleanRoute.split("/").filter(Boolean);
	const candidates = new Set<string>([cleanRoute]);

	for (let index = 0; index < segments.length; index += 1) {
		const segment = segments[index];
		if (!segment || segment.startsWith("[") || segment === "new") {
			continue;
		}

		const replaced = [...segments];
		replaced[index] = "[id]";
		candidates.add(`/${replaced.join("/")}`);
	}

	return Array.from(candidates).sort((left, right) => right.length - left.length);
}

export function getSourceInspectorManifest(route: string) {
	const normalizedRoute = normalizeRoutePath(route);
	const manifestRoute = buildManifestCandidates(route).find((candidate) => routeManifests[candidate]);
	return {
		manifest: (manifestRoute ? routeManifests[manifestRoute] : null) ?? null,
		route: normalizedRoute,
	};
}
