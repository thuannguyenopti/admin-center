"use client";
import Template from "./components/template";
import "./globals.css";
import "./styles/opalStyles.css";
import {usePathname} from "next/navigation";
import {useState, useMemo} from "react";
import usePersistentState from "@/app/usePersistentState";
import {Algorithm, initialAlgorithms} from "@/app/db/initialData";
import {useSecretCode} from "@/app/hooks/useSecretCode";
import {SnowEffect} from "@/app/components/effects/SnowEffect";
import {NewYearEffect} from "@/app/components/effects/NewYearEffect";
import {ThemeProvider} from "@/app/providers/ThemeProvider";
import {
	IconChartBar,
	IconDashboard,
	IconPencil,
	IconPlayerPlay,
	IconHierarchy3,
	IconLogs,
	IconSettings,
	IconSearch,
	IconList,
	IconFile,
	IconUsers,
	IconPuzzle,
	IconFolders,
	IconBuildingStore,
} from "@tabler/icons-react";

// Memoize icon components outside component to prevent recreation
const iconComponents = {
	dashboard: <IconDashboard />,
	folders: <IconFolders />,
	pencil: <IconPencil />,
	chartBar: <IconChartBar />,
	users: <IconUsers />,
	settings: <IconSettings />,
	puzzle: <IconPuzzle />,
	search: <IconSearch />,
	buildingStore: <IconBuildingStore />,
	hierarchy3: <IconHierarchy3 />,
	list: <IconList />,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const path = usePathname();
	const algorithmMatch = useMemo(() => path.match(/\/cms\/search\/algorithms\/([^/]+)/), [path]);
	const algorithmId = algorithmMatch ? algorithmMatch[1] : null;

	const [algorithms] = usePersistentState("algorithms", initialAlgorithms) as [Algorithm[], any];
	const currentAlgorithm = useMemo(
		() => algorithms.find((a) => a.id === algorithmId),
		[algorithms, algorithmId]
	);

	const structure = useMemo(() => ({
		cms: [
			{
				label: "Dashboard",
				highlight: "cms/dashboard",
				url: "/cms/dashboard",
				icon: iconComponents.dashboard,
			},
			{
				label: "Content Manager",
				url: "/cms/content",
				highlight: "cms/content",
				icon: iconComponents.folders,
			},
			{
				label: "Edit",
				url: "/cms/edit",
				highlight: "cms/edit",
				icon: iconComponents.pencil,
				customLayout: true,
			},
			{
				label: "Reports",
				highlight: "cms/reports",
				url: "/cms/reports",
				icon: iconComponents.chartBar,
			},
			{
				label: "Audiences",
				highlight: "cms/audiences",
				url: "/cms/audiences",
				icon: iconComponents.users,
			},
			{
				label: "Settings",
				highlight: "cms/settings",
				url: "/cms/settings/content-types",
				icon: iconComponents.settings,
				children: [
					{label: "Configure"},
					{
						label: "Applications",
						url: "/cms/settings/applications",
						children: {
							title: "Stride",
							children: [
								{
									label: "Settings",
									url: "/cms/settings/applications/mosey-bank/settings",
								},
								{label: "Advanced"},
								{
									label: "Hostnames",
									url: "/cms/settings/applications/mosey-bank/hostnames",
								},
							],
						},
					},
					{label: "Access Rights", url: "/cms/settings/access-rights"},
					{label: "API Clients", url: "/cms/settings/api-clients"},
					{label: "Scheduled Jobs", url: "/cms/settings/scheduled-jobs"},
					{label: "Content Types", url: "/cms/settings/content-types"},
					{label: "Blueprints", url: "/cms/settings/blueprints"},
					{label: "Languages", url: "/cms/settings/languages"},
					{label: "Edit Tabs", url: "/cms/settings/edit-tabs"},
					{label: "Tools"},
					{label: "Import Data", url: "/cms/settings/import-data"},
					{label: "Export Data", url: "/cms/settings/export-data"},
					{label: "Convert Pages", url: "/cms/settings/convert-pages"},
					{label: "Change Log", url: "/cms/settings/change-log"},
					{label: "Add-ons"},
					{label: "BVN/GETA 404 Handler", url: "/cms/settings/bvn"},
				],
			},
			{
				label: "Add-ons",
				highlight: "cms/add-ons",
				url: "/cms/add-ons",
				icon: iconComponents.puzzle,
			},
			{
				label: "Search Management",
				url: "/cms/search/search-analytics",
				highlight: "/cms/search",
				icon: iconComponents.search,
				children: [
					{label: "Health & Monitoring"},
					{
						label: "Overview",
						url: "/cms/search/search-analytics",
						children: {
							title: "Analytics Details",
							children: [
								{
									label: "Total Queries",
									url: "/cms/search/search-analytics/total-queries",
								},
								{
									label: "Click-Through Rate",
									url: "/cms/search/search-analytics/click-through-rate",
								},
								{
									label: "Zero-Result Analysis",
									description: "Analyze queries with no results",
									url: "/cms/search/search-analytics/zero-result",
								},
								{
									label: "Reformulation Rate",
									url: "/cms/search/search-analytics/reformulation-rate",
								},
							],
						},
					},
					{label: "Manage"},

					{
						label: "Algorithms",
						description: "Manage search algorithms",
						url: "/cms/search/algorithms",
						children: {
							title: currentAlgorithm ? currentAlgorithm.name : "Algorithm details",
							children: currentAlgorithm
								? [
										...(currentAlgorithm?.type !== "Custom"
											? [
													{
														label: "Optimizations",
														url: `/cms/search/algorithms/${algorithmId}/optimizations`,
													},
											  ]
											: []),
										{
											label: "Filter",
											url: `/cms/search/algorithms/${algorithmId}/filter`,
										},
										{
											label: "Order",
											url: `/cms/search/algorithms/${algorithmId}/order`,
										},
										{
											label: "Settings",
											url: `/cms/search/algorithms/${algorithmId}/settings`,
										},
								  ]
								: [],
						},
					},
					{label: "Search Tools"},
					{
						label: "Pinned Results",
						description:
							"Curated search results that push chosen pages to the top for specific queries. They help highlight important content and improve results when normal ranking isn’t enough.",
						url: "/cms/search/pinned-results",
					},
					{
						label: "Related Queries",
						description:
							"Manage synonyms and related queries to improve search recall.",
						url: "/cms/search/related-queries",
					},
					{
						label: "Synonyms",
						description: "Manage synonyms to expand search results.",
						url: "/cms/search/synonyms",
					},
					{
						label: "Autocomplete Phrases",
						description: "Manage phrases for autocomplete suggestions.",
						url: "/cms/search/autocomplete-phrases",
					},
				],
			},
		],
		"connect-platform": [
			{
				label: "Marketplace",
				url: "/connect-platform/marketplace",
				highlight: "/connect-platform/marketplace",
				icon: iconComponents.buildingStore,
			},
			{
				label: "Graph",
				url: "/connect-platform/graph/dashboard",
				highlight: "/connect-platform/graph",
				icon: iconComponents.hierarchy3,
				children: [
					{
						label: "Dashboard",
						url: "/connect-platform/graph/dashboard",
					},
					{
						label: "Browse",
						url: "/connect-platform/graph/browse",
					},
					{
						label: "Sync Log",
						url: "/connect-platform/graph/sync-log",
					},
					{
						label: "Settings",
						url: "/connect-platform/graph/settings",
					},
				],
			},
		],
		"fe-hosting": [
			{
				label: "Applications",
				url: "/fe-hosting/applications/apps",
				highlight: "/fe-hosting/applications",
				icon: iconComponents.list,
				children: [
					{
						label: "Applications",
						url: "/fe-hosting/applications/apps",
						children: {
							title: "Stride",
							children: [
								{
									label: "Application Overview",
									url: "/fe-hosting/applications/apps/mosey-bank/overview",
									children: {
										title: "Deployment 5",
										children: [
											{
												label: "Deployment Overview",
												url: "/fe-hosting/applications/apps/mosey-bank/overview/deploy-5",
											},
										],
									},
								},
								{
									label: "Settings",
									url: "/fe-hosting/applications/apps/mosey-bank/settings",
								},
							],
						},
					},
				],
			},
		],
	}), [currentAlgorithm, algorithmId]);
	
	const key = useMemo(() => path.split("/")[1], [path]);
	const menu = useMemo(() => structure[key as keyof typeof structure], [structure, key]);

	const {activeEffect} = useSecretCode();

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* Inline script to prevent FOUC (Flash of Unstyled Content) */}
				{/* This runs before React renders, avoiding theme flashing */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
							(function() {
								try {
									const saved = localStorage.getItem('theme');
									const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
									const html = document.documentElement;
									html.setAttribute('data-theme', theme);
									html.classList.toggle('dark', theme === 'dark');
									html.style.colorScheme = theme;
									const body = document.body;
									body.classList.toggle('dark', theme === 'dark');
									body.style.colorScheme = theme;
								} catch (e) {}
							})();
						`,
					}}
				/>
			</head>
			<body suppressHydrationWarning>
				<ThemeProvider>
					{menu ? <Template structure={menu}>{children}</Template> : children}
					{activeEffect === "snow" && <SnowEffect />}
					{activeEffect === "newyear" && <NewYearEffect />}
				</ThemeProvider>
			</body>
		</html>
	);
}
