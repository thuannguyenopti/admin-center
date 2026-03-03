"use client";
import Template from "./components/template";
import "./globals.css";
import {ThemeProvider} from "@/app/providers/ThemeProvider";
import {ProofreadingProvider} from "@/app/components/ai/ProofreadingProvider";
import {usePathname} from "next/navigation";
import usePersistentState from "@/app/usePersistentState";
import {Algorithm, initialAlgorithms, ContentType, initialContentTypes} from "@/app/db/initialData";
import {webhooks as initialWebhooks} from "@/app/cms/settings/webhooks/mockData";
import {useSecretCode} from "@/app/hooks/useSecretCode";
import {SnowEffect} from "@/app/components/effects/SnowEffect";
import {NewYearEffect} from "@/app/components/effects/NewYearEffect";
import {HydrationErrorSuppressor} from "@/app/components/HydrationErrorSuppressor";
import {
	IconChartBar,
	IconDashboard,
	IconPencil,
	IconHierarchy3,
	IconSettings,
	IconSearch,
	IconList,
	IconUsers,
	IconPuzzle,
	IconFolders,
	IconBuildingStore,
} from "@tabler/icons-react";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const path = usePathname() ?? "";
	const algorithmMatch = path.match(/\/cms\/search\/algorithms\/([^/]+)/);
	const algorithmId = algorithmMatch ? algorithmMatch[1] : null;
	const webhookMatch = path.match(/\/cms\/settings\/webhooks\/([^/]+)/);
	const webhookId = webhookMatch ? webhookMatch[1] : null;
	const contentTypeMatch = path.match(/\/cms\/settings\/content-types\/([^/]+)/);
	const contentTypeId = contentTypeMatch ? contentTypeMatch[1] : null;

	const [algorithmsState] = usePersistentState("algorithms", initialAlgorithms) as [
		Algorithm[] | undefined,
	];
	const [webhooksState] = usePersistentState("webhooks", initialWebhooks) as [
		typeof initialWebhooks | undefined,
	];
	const [contentTypesState] = usePersistentState("contentTypes", initialContentTypes) as [
		ContentType[] | undefined,
	];

	const safeAlgorithms =
		Array.isArray(algorithmsState) && algorithmsState.length > 0
			? algorithmsState
			: initialAlgorithms;
	const safeWebhooks =
		Array.isArray(webhooksState) && webhooksState.length > 0 ? webhooksState : initialWebhooks;
	const safeContentTypes =
		Array.isArray(contentTypesState) && contentTypesState.length > 0
			? contentTypesState
			: initialContentTypes;

	const currentAlgorithm = safeAlgorithms.find((a) => a.id === algorithmId);
	const currentWebhook = safeWebhooks.find((w) => w.id === webhookId);
	const currentContentType = safeContentTypes.find((ct) => ct.id === contentTypeId);

	const structure = {
		cms: [
			{
				label: "Dashboard",
				highlight: "cms/dashboard",
				url: "/cms/dashboard",
				icon: <IconDashboard />,
			},
			{
				label: "Content Manager",
				url: "/cms/content",
				highlight: "cms/content",
				icon: <IconFolders />,
			},
			{
				label: "Edit",
				url: "/cms/edit",
				highlight: "cms/edit",
				icon: <IconPencil />,
				customLayout: true,
			},
			{
				label: "Reports",
				highlight: "cms/reports",
				url: "/cms/reports",
				icon: <IconChartBar />,
			},
			{
				label: "Audiences",
				highlight: "cms/audiences",
				url: "/cms/audiences",
				icon: <IconUsers />,
			},
			{
				label: "Settings",
				highlight: "cms/settings",
				url: "/cms/settings",
				icon: <IconSettings />,
				children: [
					{label: "Taxonomy"},
					{label: "Categories", url: "/cms/settings/categories"},
					{label: "Tags", url: "/cms/settings/tags"},
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
					{label: "Blueprints", url: "/cms/settings/blueprints"},
					{
						label: "Content Types",
						url: "/cms/settings/content-types",
						children: currentContentType
							? {
									title: currentContentType.displayName || currentContentType.name,
									description: currentContentType.baseType === "Page" ? "Page Type" : 
										currentContentType.baseType === "Block" ? "Block Type" :
										currentContentType.baseType === "Experience" ? "Experience Type" :
										currentContentType.baseType === "Media" ? "Media Type" :
										currentContentType.baseType === "Product" ? "Product Type" :
										currentContentType.baseType,
									children: [
										{label: "Define"},
										{
											label: "Properties",
											url: `/cms/settings/content-types/${contentTypeId}/properties`,
										},
										{
											label: "Contracts",
											url: `/cms/settings/content-types/${contentTypeId}/contracts`,
										},
										{
											label: "Mappings",
											url: `/cms/settings/content-types/${contentTypeId}/mappings`,
										},
										{label: "Setup"},
										{
											label: "Details",
											url: `/cms/settings/content-types/${contentTypeId}/details`,
										},
										{
											label: "Default Values",
											url: `/cms/settings/content-types/${contentTypeId}/default-values`,
										},
										{
											label: "Child Content Types",
											url: `/cms/settings/content-types/${contentTypeId}/child-types`,
										},
										{
											label: "Permissions",
											url: `/cms/settings/content-types/${contentTypeId}/permissions`,
										},
										{
											label: "Settings",
											url: `/cms/settings/content-types/${contentTypeId}/settings`,
										},
									],
							  }
							: undefined,
					},
					{label: "Forms Settings", url: "/cms/settings/forms-settings"},
					{label: "Access Rights", url: "/cms/settings/access-rights"},
					{label: "API Clients", url: "/cms/settings/api-clients"},
					{label: "API Keys", url: "/cms/settings/api-keys"},
					{label: "Set Access Rights", url: "/cms/settings/set-access-rights"},
					{label: "Data & Sync Management"},
					{label: "GraphiQL", url: "/cms/settings/graphiql"},
					{label: "Scheduled Jobs", url: "/cms/settings/scheduled-jobs"},
					{label: "Smooth Rebuild", url: "/cms/settings/smooth-rebuild"},
					{
						label: "Webhooks",
						url: "/cms/settings/webhooks",
						children: {
							title: currentWebhook ? currentWebhook.name : "Webhook details",
							children: currentWebhook
								? [
										{
											label: "Settings",
											url: `/cms/settings/webhooks/${webhookId}/settings`,
										},
										{
											label: "Error Log",
											url: `/cms/settings/webhooks/${webhookId}/logs`,
										},
									]
								: [],
						},
					},
					{label: "AI & Automation"},
					{label: "Opal Actions", url: "/cms/settings/opal-actions"},
					{label: "Config"},
					{label: "Languages", url: "/cms/settings/languages"},
					{label: "Edit Tabs", url: "/cms/settings/edit-tabs"},
					{label: "Tools"},
					{label: "Change Log", url: "/cms/settings/change-log"},
					{label: "Convert Pages", url: "/cms/settings/convert-pages"},
					{label: "Export Data", url: "/cms/settings/export-data"},
					{label: "Import Data", url: "/cms/settings/import-data"},
					{label: "Search Configuration", url: "/cms/settings/search-configuration"},
					{label: "Add-ons"},
					{label: "BVN/GETA 404 Handler", url: "/cms/settings/bvn"},
				],
			},
			{
				label: "Add-ons",
				highlight: "cms/add-ons",
				url: "/cms/add-ons",
				icon: <IconPuzzle />,
			},
			{
				label: "Search Management",
				url: "/cms/search/search-analytics",
				highlight: "/cms/search",
				icon: <IconSearch />,
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
				icon: <IconBuildingStore />,
			},
			{
				label: "Graph",
				url: "/connect-platform/graph/dashboard",
				highlight: "/connect-platform/graph",
				icon: <IconHierarchy3 />,
				children: [
					{label: "Dashboard", url: "/connect-platform/graph/dashboard"},
					{label: "Browse", url: "/connect-platform/graph/browse"},
					{label: "Sync Log", url: "/connect-platform/graph/sync-log"},
					{label: "Settings", url: "/connect-platform/graph/settings"},
				],
			},
		],
		"fe-hosting": [
			{
				label: "Applications",
				url: "/fe-hosting/applications/apps",
				highlight: "/fe-hosting/applications",
				icon: <IconList />,
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
		opal: [
			{
				label: "Chat",
				url: "/opal",
				highlight: "/opal",
				icon: <img src="/nav_icons/comments.svg" alt="Chat" width={20} height={20} />,
				exact: true,
			},
			{
				label: "Prompt Library",
				url: "/opal/prompt-library",
				highlight: "/opal/prompt-library",
				icon: (
					<img
						src="/nav_icons/grid-round-2-plus.svg"
						alt="Prompt Library"
						width={20}
						height={20}
					/>
				),
			},
			{
				label: "Notifications",
				url: "/opal/notifications",
				highlight: "/opal/notifications",
				icon: <img src="/nav_icons/inbox.svg" alt="Notifications" width={20} height={20} />,
				customLayout: true,
			},
			{
				label: "Activities",
				url: "/opal/activities",
				highlight: "/opal/activities",
				icon: (
					<img src="/nav_icons/wave_pulse.svg" alt="Activities" width={20} height={20} />
				),
				customLayout: true,
			},
			{label: "Configurations"},
			{
				label: "Instructions",
				url: "/opal/instructions",
				highlight: "/opal/instructions",
				icon: <img src="/nav_icons/book.svg" alt="Instructions" width={20} height={20} />,
			},
			{
				label: "Agents",
				url: "/opal/agents",
				highlight: "/opal/agents",
				icon: <img src="/nav_icons/agent_nav.svg" alt="Agents" width={20} height={20} />,
				customLayout: true,
			},
			{
				label: "Tools",
				url: "/opal/tools",
				highlight: "/opal/tools",
				icon: (
					<img
						src="/nav_icons/screwdriver-wrench.svg"
						alt="Tools"
						width={20}
						height={20}
					/>
				),
			},
			{
				label: "RAG",
				url: "/opal/rag",
				highlight: "/opal/rag",
				icon: <img src="/nav_icons/database.svg" alt="RAG" width={20} height={20} />,
			},
			{
				label: "Connections",
				url: "/opal/connections",
				highlight: "/opal/connections",
				icon: (
					<img src="/nav_icons/toggle-off.svg" alt="Connections" width={20} height={20} />
				),
			},
			{
				label: "Settings",
				url: "/opal/settings",
				highlight: "/opal/settings",
				icon: <img src="/nav_icons/gear.svg" alt="Settings" width={20} height={20} />,
			},
		],
	};

	const key: string = path.split("/")[1] ?? "";
	const menu = key ? structure[key as keyof typeof structure] : undefined;
	const {activeEffect} = useSecretCode();

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link
					href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body suppressHydrationWarning>
				<ThemeProvider>
					<ProofreadingProvider>
						<HydrationErrorSuppressor />
						{menu ? <Template structure={menu}>{children}</Template> : children}
						{activeEffect === "snow" && <SnowEffect />}
						{activeEffect === "newyear" && <NewYearEffect />}
					</ProofreadingProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
