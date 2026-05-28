"use client";
import Template from "./components/template";
import "./globals.css";
import {ThemeProvider} from "@/app/providers/ThemeProvider";
import {ProofreadingProvider} from "@/app/components/ai/ProofreadingProvider";
import {OpalGenerationProvider} from "@/app/context/OpalGenerationContext";
import {ExperimentResultsProvider} from "@/app/context/ExperimentResultsContext";
import {usePathname} from "next/navigation";
import usePersistentState from "@/app/usePersistentState";
import {Algorithm, initialAlgorithms, ContentType, initialContentTypes} from "@/app/db/initialData";
import {webhooks as initialWebhooks} from "@/app/cms/settings/webhooks/mockData";
import {useSecretCode} from "@/app/hooks/useSecretCode";
import {SnowEffect} from "@/app/components/effects/SnowEffect";
import {NewYearEffect} from "@/app/components/effects/NewYearEffect";
import {HydrationErrorSuppressor} from "@/app/components/HydrationErrorSuppressor";
import {MigrationRunner} from "@/app/components/MigrationRunner";
import {
	IconGrid2,
	IconChartColumn,
	IconPen,
	IconListTree,
	IconGear,
	IconList,
	IconUsers,
	IconPuzzlePiece,
	IconFolders,
	IconStore,
	IconCodeBranch,
	IconHouse,
	IconFlask,
	IconCode,
	IconClock,
	IconUserGroup,
	IconLightbulb,
	IconComments,
	IconBooks,
	IconBell,
	IconFolderBookmark,
	IconAgent,
	IconPlus,
	IconSparkles,
	IconFileLines,
	IconSquareUser,
} from "@optiaxiom/icons";
import {IconSettingsSearch} from "@tabler/icons-react";

// CMP custom icons

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
				icon: <IconGrid2 />,
			},
			{
				label: "Content Manager",
				url: "/cms/content",
				highlight: "cms/content",
				icon: <IconFolders />,
			},
			{
				label: "Edit",
				description: "Select pages from the content tree to view or modify their content.",
				url: "/cms/edit",
				highlight: "cms/edit",
				icon: <IconPen />,
				children: [
					{
						label: "Edit Item",
						url: "/cms/edit/",
						customLayout: true,
					},
				],
			},
			{
				label: "Reports",
				highlight: "cms/reports",
				url: "/cms/reports",
				icon: <IconChartColumn />,
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
				icon: <IconGear />,
				children: [
					// 1. AI & Automation (moved to top - prioritized)
					{label: "AI & Automation"},
					{label: "Opal", url: "/cms/settings/opal-actions"},

					// 2. Content (NEW GROUP - combines content-related settings)
					{label: "Content"},
					{
						label: "Content Types",
						url: "/cms/settings/content-types",
						children: currentContentType
							? {
									title:
										currentContentType.displayName || currentContentType.name,
									description:
										currentContentType.baseType === "Page"
											? "Page Type"
											: currentContentType.baseType === "Block"
												? "Block Type"
												: currentContentType.baseType === "Experience"
													? "Experience Type"
													: currentContentType.baseType === "Media"
														? "Media Type"
														: currentContentType.baseType === "Product"
															? "Product Type"
															: currentContentType.baseType,
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
					{label: "Blueprints", url: "/cms/settings/blueprints"},
					{label: "Forms Settings", url: "/cms/settings/forms-settings"},
					{label: "Property Groups", url: "/cms/settings/edit-tabs"},

					// 3. Taxonomy (moved to third position)
					{label: "Taxonomy"},
					{label: "Categories", url: "/cms/settings/categories"},
					{label: "Tags", url: "/cms/settings/tags"},

					// 4. Configure (merged with old Config section)
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
					{label: "API Keys", url: "/cms/settings/api-keys"},
					{label: "Set Access Rights", url: "/cms/settings/set-access-rights"},
					{label: "Languages", url: "/cms/settings/languages"},

					// 5. Data & Sync Management (unchanged)
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

					// 6. Tools (unchanged)
					{label: "Tools"},
					{label: "Change Log", url: "/cms/settings/change-log"},
					{label: "Convert Pages", url: "/cms/settings/convert-pages"},
					{label: "Export Data", url: "/cms/settings/export-data"},
					{label: "Import Data", url: "/cms/settings/import-data"},
					{label: "Search Configuration", url: "/cms/settings/search-configuration"},

					// 7. Add-ons (unchanged)
					{label: "Add-ons"},
					{label: "BVN/GETA 404 Handler", url: "/cms/settings/bvn"},
				],
			},
			{
				label: "Search Management",
				url: "/cms/search/search-analytics",
				highlight: "/cms/search",
				icon: <IconSettingsSearch />,
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

					{label: "Developer"},
					{
						label: "Development Account Management",
						description: "Request and manage developer instance access.",
						url: "/cms/search/development-account-management",
					},
				],
			},
			{
				label: "Add-ons",
				highlight: "cms/add-ons",
				url: "/cms/add-ons",
				icon: <IconPuzzlePiece />,
			},
		],
		"connect-platform": [
			{
				label: "Marketplace",
				url: "/connect-platform/marketplace",
				highlight: "/connect-platform/marketplace",
				icon: <IconStore />,
			},
			{
				label: "Graph",
				url: "/connect-platform/graph/dashboard",
				highlight: "/connect-platform/graph",
				icon: <IconListTree />,
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
				label: "Chats",
				url: "/opal",
				highlight: "/opal",
				icon: (
					<span
						style={{
							display: "inline-flex",
							width: 24,
							height: 24,
							minWidth: 24,
							minHeight: 24,
							maxWidth: 24,
							maxHeight: 24,
							borderRadius: "50%",
							overflow: "hidden",
							flexShrink: 0,
						}}
					>
						<img
							src="/opal-icon-nav.png"
							alt=""
							style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
						/>
					</span>
				),
				exact: true,
				customLayout: true,
			},
			{
				label: "Threads",
				url: "/opal/im",
				highlight: "/opal/im",
				icon: <IconComments />,
				customLayout: true,
			},
			{
				label: "Artifacts",
				url: "/opal/artifacts",
				highlight: "/opal/artifacts",
				icon: <IconBooks />,
				description:
					"Browse and manage all files and outputs generated by your Opal agents.",
				hidePageHeader: true,
			},
			{
				label: "Activities",
				url: "/opal/notifications",
				highlight: "/opal/notifications",
				icon: <IconBell />,
				customLayout: true,
			},
			{label: "Configurations"},
			{
				label: "Context",
				url: "/opal/context",
				highlight: "/opal/context",
				customLayout: true,
				icon: <IconFolderBookmark />,
			},
			{
				label: "Virtual Teammates",
				url: "/opal/virtual-teammates",
				highlight: "/opal/virtual-teammates",
				icon: <IconSquareUser />,
				customLayout: true,
			},
				{
					label: "Agents",
					url: "/opal/agents",
					highlight: "/opal/agents",
					icon: <IconAgent />,
					customLayout: true,
				},
			{
				label: "Connectors",
				url: "/opal/connectors",
				highlight: "/opal/connectors",
				icon: <IconPuzzlePiece />,
				hidePageHeader: true,
			},
			{
				label: "Settings",
				url: "/opal/settings",
				highlight: "/opal/settings",
				icon: <IconGear />,
			},
		],
		cmp: [
			{
				label: "Create",
				icon: <IconPlus />,
				isMenuTrigger: true,
				menuOptions: [
					{label: "Campaign", url: "/cmp/create/campaign"},
					{label: "Task", url: "/cmp/create/task"},
					{label: "Hypothesis", url: "/cmp/create/hypothesis"},
					{label: "Event", url: "/cmp/create/event"},
					{label: "Milestone", url: "/cmp/create/milestone"},
					{label: "Work Request", url: "/cmp/create/work-request"},
					{label: "Pitch Request", url: "/cmp/create/pitch-request"},
				],
			},
			{
				label: "Plan",
				url: "/cmp/plan-view",
				highlight: "/cmp/plan-view",
				icon: <IconList />,
			},
			{
				label: "Library",
				url: "/cmp/library",
				highlight: "/cmp/library",
				icon: <IconBooks />,
			},
			{
				label: "Stock Images",
				url: "/cmp/stock-images",
				highlight: "/cmp/stock-images",
				icon: <IconStore />,
			},
			{
				label: "Resource Management",
				url: "/cmp/resource-management",
				highlight: "/cmp/resource-management",
				icon: <IconUserGroup />,
			},
			{
				label: "Idea Lab",
				url: "/cmp/idea-lab",
				highlight: "/cmp/idea-lab",
				icon: <IconSparkles />,
			},
			{
				label: "Analytics",
				url: "/cmp/reports",
				highlight: "/cmp/reports",
				icon: <IconChartColumn />,
			},
			{
				label: "Requests",
				url: "/cmp/work-request",
				highlight: "/cmp/work-request",
				icon: <IconFileLines />,
			},
			{
				label: "Settings",
				highlight: "cmp/settings",
				url: "/cmp/settings",
				icon: <IconGear />,
				hidePageHeader: true,
				children: [
					{label: "Stefan Svebeck (Admin)", url: "/cmp/settings/profile"},
					{label: "Organization", url: "/cmp/settings/organization"},
					{label: "Users & Teams", url: "/cmp/settings/users-teams", separator: true},
					{label: "AI", url: "/cmp/settings/ai", separator: true},
					{label: "Assets", url: "/cmp/settings/assets"},
					{label: "Fields", url: "/cmp/settings/fields"},
					{label: "Integrations", url: "/cmp/settings/integrations"},
					{label: "Routing Rules", url: "/cmp/settings/routing-rules"},
					{label: "Strategy", url: "/cmp/settings/strategy"},
					{label: "Templates", url: "/cmp/settings/content-models"},
					{label: "Workflows", url: "/cmp/settings/workflows", separator: true},
					{label: "Reports", url: "/cmp/settings/reports"},
					{label: "Activity Log", url: "/cmp/settings/activity-log"},
					{label: "Recycle Bin", url: "/cmp/settings/recycle-bin", separator: true},
					{label: "Marketo", url: "/cmp/settings/marketo"},
					{label: "Eloqua", url: "/cmp/settings/eloqua"},
					{label: "Salesforce", url: "/cmp/settings/salesforce"},
					{label: "Apps & Webhooks", url: "/cmp/settings/apps-webhooks"},
					{
						label: "Brand Compliance",
						url: "/cmp/settings/brand-compliance",
						separator: true,
					},
					{label: "Social Accounts", url: "/cmp/settings/social-accounts"},
				],
			},
		],
		"web-experimentation": [
			{
				label: "Projects",
				url: "/web-experimentation",
				highlight: "/web-experimentation/projects",
				icon: <IconCodeBranch />,
			},
			{
				label: "Home",
				url: "/web-experimentation/home",
				highlight: "/web-experimentation/home",
				icon: <IconHouse />,
			},
			{
				label: "Optimizations",
				url: "/web-experimentation/optimizations",
				highlight: "/web-experimentation/optimizations",
				icon: <IconFlask />,
				children: [
					{
						label: "Optimization Details",
						url: "/web-experimentation/optimizations/",
						customLayout: true,
					},
				],
			},
			{
				label: "Audiences",
				url: "/web-experimentation",
				highlight: "/web-experimentation/audiences",
				icon: <IconUsers />,
			},
			{
				label: "Implementation",
				url: "/web-experimentation",
				highlight: "/web-experimentation/implementation",
				icon: <IconCode />,
			},
			{
				label: "History",
				url: "/web-experimentation",
				highlight: "/web-experimentation/history",
				icon: <IconClock />,
			},
			{
				label: "Settings",
				url: "/web-experimentation",
				highlight: "/web-experimentation/settings",
				icon: <IconGear />,
			},
			{
				label: "Collaborate",
				url: "/web-experimentation",
				highlight: "/web-experimentation/collaborate",
				icon: <IconUserGroup />,
			},
			{
				label: "Ideas",
				description: "Generate data-driven experiments powered by your content.",
				url: "/web-experimentation",
				highlight: "/web-experimentation",
				icon: <IconLightbulb />,
				exact: true,
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
				{/* figma-capture: remove after capture */}
				<script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
			</head>
			<body suppressHydrationWarning data-brand="v3">
				<ThemeProvider>
					<ProofreadingProvider>
						<OpalGenerationProvider>
							<ExperimentResultsProvider>
								<HydrationErrorSuppressor />
								<MigrationRunner />
								<div data-brand="v3" style={{display: "contents"}}>
									{menu ? (
										<Template structure={menu}>{children}</Template>
									) : (
										children
									)}
								</div>
								{activeEffect === "snow" && <SnowEffect />}
								{activeEffect === "newyear" && <NewYearEffect />}
							</ExperimentResultsProvider>
						</OpalGenerationProvider>
					</ProofreadingProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
