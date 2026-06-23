"use client";
import { Fragment, useEffect } from "react";
import Template from "./components/template";
import "./globals.css";
import "./site/stride.css";
import Script from "next/script";
import {ThemeProvider} from "@/app/providers/ThemeProvider";
import {ProofreadingProvider} from "@/app/components/ai/ProofreadingProvider";
import {OpalGenerationProvider} from "@/app/context/OpalGenerationContext";
import {usePathname} from "next/navigation";
import usePersistentState from "@/app/usePersistentState";
import {Algorithm, initialAlgorithms, ContentType, initialContentTypes} from "@/app/db/initialData";
import {webhooks as initialWebhooks} from "@/app/cms/settings/webhooks/mockData";
import {useSecretCode} from "@/app/hooks/useSecretCode";
import {SnowEffect} from "@/app/components/effects/SnowEffect";
import {NewYearEffect} from "@/app/components/effects/NewYearEffect";
import {HydrationErrorSuppressor} from "@/app/components/HydrationErrorSuppressor";
import {MigrationRunner} from "@/app/components/MigrationRunner";
import {BellIcon} from "@/app/components/icons/BellIcon";
import {
	IconLightbulb as IconBulb,
	IconChartColumn as IconChartBar,
	IconCodeBranch as IconGitFork,
	IconClock,
	IconCode,
	IconGauge as IconDashboard,
	IconFlask,
	IconHouse as IconHome,
	IconPen as IconPencil,
	IconSitemap as IconHierarchy3,
	IconGear as IconSettings,
	IconSearch,
	IconList,
	IconUsers,
	IconUserGroup as IconUsersGroup,
	IconPuzzlePiece as IconPuzzle,
	IconFolders,
	IconStore as IconBuildingStore,
	IconScrewdriverWrench as IconSettingsSearch,
} from "@optimizely/axiom-icons";
import { IconTeamsCustom } from "@/app/lib/axiom-icons";

// CMP custom icons
import CMPCreateIcon from "@/app/cmp/assets/plus-16.svg";
import CMPHomeIcon from "@/app/cmp/assets/home.svg";
import CMPPlanIcon from "@/app/cmp/assets/plan.svg";
import CMPDashboardIcon from "@/app/cmp/assets/dashboard.svg";
import CMPResourceManagementIcon from "@/app/cmp/assets/resource-management.svg";
import CMPIdeaLabIcon from "@/app/cmp/assets/sparkles 16.svg";
import CMPLibraryIcon from "@/app/cmp/assets/library.svg";
import CMPMarketplaceIcon from "@/app/cmp/assets/marketplace.svg";
import CMPWorkRequestIcon from "@/app/cmp/assets/workrequest.svg";
import { TailwindSafelist } from "@/app/components/vb/blocks/_tailwind-safelist";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	useEffect(() => {
		if (typeof window === "undefined" || !window.location.hash.includes("figmacapture=")) {
			return;
		}

		if (document.querySelector("script[data-figma-capture-script]")) {
			return;
		}

		const script = document.createElement("script");
		script.src = "https://mcp.figma.com/mcp/html-to-design/capture.js";
		script.async = true;
		script.setAttribute("data-figma-capture-script", "true");
		document.head.appendChild(script);
	}, []);

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
				label: "Add-ons",
				highlight: "cms/add-ons",
				url: "/cms/add-ons",
				icon: <IconPuzzle />,
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
		],
		"web-experimentation": [
			{
				label: "Projects",
				url: "/web-experimentation",
				highlight: "/web-experimentation/projects",
				icon: <IconGitFork />,
			},
			{
				label: "Home",
				url: "/web-experimentation/home",
				highlight: "/web-experimentation/home",
				icon: <IconHome />,
			},
			{
				label: "Optimizations",
				url: "/web-experimentation/optimizations",
				highlight: "/web-experimentation/optimizations",
				icon: <IconFlask />,
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
				icon: <IconSettings />,
			},
			{
				label: "Collaborate",
				url: "/web-experimentation",
				highlight: "/web-experimentation/collaborate",
				icon: <IconUsersGroup />,
			},
			{
				label: "Ideas",
				description: "Generate data-driven experiments powered by your content.",
				url: "/web-experimentation",
				highlight: "/web-experimentation",
				icon: <IconBulb />,
				exact: true,
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
				label: "Chats",
				url: "/opal",
				highlight: "/opal",
				icon: (
					<svg width={22.5} height={18} viewBox="0 0 20 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
						<path d="M2.76858 9.6875C2.73733 9.75 2.70608 9.8125 2.64358 9.84375C2.58108 10 2.48733 10.125 2.42483 10.2812C2.95608 10.1562 3.45608 9.9375 3.95608 9.71875C4.11233 9.65625 4.23733 9.59375 4.36233 9.53125C4.67483 9.375 4.98733 9.34375 5.33108 9.40625C5.70608 9.46875 6.08108 9.5 6.51858 9.5C9.51858 9.5 11.5186 7.5 11.5186 5.5C11.5186 3.53125 9.51858 1.5 6.51858 1.5C3.48733 1.5 1.51858 3.53125 1.51858 5.5C1.51858 6.375 1.86233 7.21875 2.51858 7.9375C2.98733 8.40625 3.08108 9.09375 2.76858 9.6875ZM6.51858 11C5.98733 11 5.51858 10.9688 5.01858 10.875C4.89358 10.9375 4.73733 11.0312 4.58108 11.0938C3.45608 11.5938 2.11233 12 0.76858 12C0.45608 12 0.17483 11.8438 0.0498304 11.5625C-0.0439196 11.2812 -0.0126696 10.9688 0.20608 10.75C0.64358 10.25 1.01858 9.6875 1.36233 9.125C1.39358 9.0625 1.42483 9 1.42483 8.96875C0.54983 8.03125 0.0185804 6.8125 0.0185804 5.5C0.0185804 2.46875 2.92483 0 6.51858 0C10.0811 0 13.0186 2.46875 13.0186 5.5C13.0186 8.5625 10.0811 11 6.51858 11ZM13.5186 15C10.9561 15 8.73733 13.75 7.67483 11.9375C8.20608 11.8438 8.73733 11.7188 9.23733 11.5625C10.0498 12.6875 11.5811 13.5 13.4873 13.5C13.8936 13.5 14.2998 13.4688 14.6748 13.4062C15.0186 13.3438 15.3311 13.375 15.6436 13.5312C15.7686 13.5938 15.8936 13.6562 16.0498 13.7188C16.5498 13.9375 17.0498 14.125 17.5811 14.2812C17.5186 14.125 17.4248 14 17.3623 13.8438C17.3311 13.7812 17.2686 13.7188 17.2373 13.6562C16.9561 13.0938 17.0498 12.4062 17.4873 11.9375C18.1436 11.2188 18.5186 10.375 18.5186 9.5C18.5186 7.65625 16.7373 5.75 14.0186 5.53125V5.5C14.0186 5 13.9248 4.5 13.7998 4.03125C17.2686 4.15625 20.0186 6.5625 20.0186 9.5C20.0186 10.8125 19.4561 12.0312 18.5811 12.9688C18.5811 13.0312 18.6123 13.0625 18.6436 13.125C18.9873 13.6875 19.3623 14.25 19.7998 14.75C20.0186 14.9688 20.0498 15.2812 19.9561 15.5625C19.8311 15.8438 19.5498 16 19.2686 16C17.9248 16 16.5498 15.5938 15.4248 15.0938C15.2686 15.0312 15.1123 14.9375 14.9873 14.875C14.4873 14.9688 14.0186 15 13.5186 15Z" />
					</svg>
				),
				exact: true,
				customLayout: true,
			},
			{
				label: "Threads",
				url: "/opal/im",
				highlight: "/opal/im",
				icon: <IconTeamsCustom size={18} />,
				customLayout: true,
			},
			{
				label: "Artifacts",
				url: "/opal/artifacts",
				highlight: "/opal/artifacts",
				icon: <CMPLibraryIcon />,
				hidePageHeader: true,
			},
			{
				label: "Notifications",
				url: "/opal/notifications",
				highlight: "/opal/notifications",
				icon: <BellIcon size={18} />,
				customLayout: true,
			},
			{
				label: "Directory",
				url: "/opal/directory",
				highlight: "/opal/directory",
				icon: <CMPMarketplaceIcon />,
				customLayout: true,
			},
			{label: "Configurations"},
			{
				label: "Context",
				url: "/opal/context",
				highlight: "/opal/context",
				customLayout: true,
				icon: (
					<svg width={20} height={20} viewBox="1 0 18 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
						<path d="M9.84375 4L8.5 2.65625C8.40625 2.5625 8.28125 2.5 8.15625 2.5H4C3.71875 2.5 3.5 2.75 3.5 3V13C3.5 13.2812 3.71875 13.5 4 13.5H16C16.25 13.5 16.5 13.2812 16.5 13V5C16.5 4.75 16.25 4.5 16 4.5H15V9.5C15 9.6875 14.875 9.875 14.7188 9.96875C14.5312 10.0312 14.3438 10.0312 14.1875 9.90625L12.5 8.625L10.7812 9.90625C10.625 10.0312 10.4375 10.0312 10.25 9.96875C10.0938 9.875 10 9.71875 10 9.5V4.125C9.9375 4.09375 9.90625 4.03125 9.84375 4ZM10.9062 2.9375C10.9688 3 11.0312 3 11.0938 3H16C17.0938 3 18 3.90625 18 5V13C18 14.125 17.0938 15 16 15H4C2.875 15 2 14.125 2 13V3C2 1.90625 2.875 1 4 1H8.15625C8.6875 1 9.1875 1.21875 9.5625 1.59375L10.9062 2.9375Z" />
					</svg>
				),
			},
			{
				label: "Virtual Teammates",
				url: "/opal/virtual-teammates",
				highlight: "/opal/virtual-teammates",
				icon: (
					<svg width={20} height={20} viewBox="2 0 12 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 1.5H4C3.71875 1.5 3.5 1.75 3.5 2V14C3.5 14.2812 3.71875 14.5 4 14.5H12C12.25 14.5 12.5 14.2812 12.5 14V2C12.5 1.75 12.25 1.5 12 1.5ZM12 0C13.0938 0 14 0.90625 14 2V14C14 15.125 13.0938 16 12 16H4C2.875 16 2 15.125 2 14V2C2 0.90625 2.875 0 4 0H12ZM6 6C6 5.3125 6.375 4.65625 7 4.28125C7.59375 3.9375 8.375 3.9375 9 4.28125C9.59375 4.65625 10 5.3125 10 6C10 6.71875 9.59375 7.375 9 7.75C8.375 8.09375 7.59375 8.09375 7 7.75C6.375 7.375 6 6.71875 6 6ZM4.5 11.1562C4.5 9.96875 5.4375 9 6.625 9H9.34375C10.5312 9 11.5 9.96875 11.5 11.1562C11.5 11.625 11.0938 12 10.625 12H5.34375C4.875 12 4.5 11.625 4.5 11.1562Z" />
					</svg>
				),
				customLayout: true,
			},
			{
				label: "Agents",
				url: "/opal/agents",
				highlight: "/opal/agents",
				icon: (
					<svg width={20} height={20} viewBox="1.5 0 17 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
						<path d="M9.39307 6.56848C9.59823 6.51031 9.84595 6.56304 10.0054 6.62317L17.7915 9.3136L17.8032 9.3175L17.8882 9.3595C18.0793 9.4657 18.2281 9.64186 18.2876 9.85071C18.4265 10.3394 18.1535 10.8287 17.6655 10.9679L17.6646 10.9669L14.6401 12.0626L14.6333 12.0646C14.3018 12.1705 14.1518 12.307 14.0845 12.3966C14.0504 12.442 14.034 12.4793 14.0269 12.5011C14.0239 12.51 14.0227 12.517 14.022 12.5206L14.021 12.5421L14.0122 12.5656L13.0708 15.4923L13.0688 15.5001L13.0659 15.5089C12.9603 15.7593 12.7411 15.9002 12.5239 15.962C12.2872 16.0291 12.0513 16.0064 11.854 15.8966C11.6597 15.7883 11.5174 15.6041 11.4487 15.3722L8.78369 7.72571L8.77979 7.71399C8.6445 7.23646 8.8942 6.71044 9.39307 6.56848ZM14.6567 0.00012207C15.8387 0.000133779 16.8196 0.946559 16.8198 2.16321V5.60559C16.8198 5.79241 16.7286 5.96337 16.6089 6.08313C16.4891 6.20278 16.3181 6.29407 16.1313 6.29407C15.7386 6.29384 15.443 5.9519 15.4429 5.60559L15.4429 2.16321C15.4426 1.72289 15.0744 1.37709 14.6567 1.37708L3.83936 1.37708C3.39523 1.37732 3.05347 1.71909 3.05322 2.16321L3.05322 12.9806C3.05323 13.3982 3.39904 13.7665 3.83936 13.7667L7.28174 13.7667C7.62805 13.7668 7.96998 14.0625 7.97021 14.4552C7.97021 14.6419 7.87893 14.813 7.75928 14.9327C7.63952 15.0525 7.46856 15.1436 7.28174 15.1437L3.83936 15.1437C2.62271 15.1434 1.67628 14.1626 1.67627 12.9806L1.67627 2.16321C1.67652 0.94871 2.62486 0.000372964 3.83936 0.00012207L14.6567 0.00012207ZM12.2593 13.5177L12.6899 12.1779C12.6946 12.1585 12.7065 12.1122 12.7192 12.0734L12.7632 11.9532C12.8144 11.8309 12.8859 11.6999 12.9839 11.5695C13.2465 11.2204 13.6429 10.9451 14.1714 10.7687L15.9351 10.129L10.4126 8.21985L12.2593 13.5177ZM4.73096 7.81848L4.7417 7.82141L6.83936 8.48254C7.19816 8.59566 7.42128 8.98138 7.3042 9.35364C7.19111 9.71219 6.80612 9.9351 6.43408 9.81848L4.33643 9.15833C3.96216 9.04062 3.78422 8.62599 3.86768 8.29797L3.87061 8.28723L3.89697 8.21985C4.04081 7.89273 4.42365 7.74054 4.73096 7.81848ZM5.76514 4.11438C6.00584 3.86533 6.45617 3.82403 6.73877 4.0968L8.15381 5.46399C8.2879 5.5938 8.3462 5.77819 8.34912 5.94739C8.35199 6.11666 8.29913 6.30231 8.16943 6.43665C7.89634 6.7192 7.44495 6.69496 7.1958 6.45422L5.78271 5.08704C5.50593 4.81952 5.49798 4.39137 5.76514 4.11438ZM9.91748 2.20618C10.2856 2.07666 10.6791 2.2859 10.8042 2.64075L11.5347 4.71497C11.6641 5.08298 11.4539 5.47652 11.0991 5.60168C10.7311 5.73109 10.3376 5.52083 10.2124 5.16614L9.48193 3.09192L9.479 3.08215C9.38445 2.75723 9.54758 2.33664 9.91748 2.20618Z" />
					</svg>
				),
				customLayout: true,
			},
			{
				label: "Connectors",
				url: "/opal/connectors",
				highlight: "/opal/connectors",
				icon: (
					<svg width={20} height={20} viewBox="3 1 14.5 14.5" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
						<path d="M7.5 2.5H4.5V5.5H7.5V2.5ZM4.5 1H7.5C8.3125 1 9 1.6875 9 2.5V5.5C9 6.34375 8.3125 7 7.5 7H4.5C3.65625 7 3 6.34375 3 5.5V2.5C3 1.6875 3.65625 1 4.5 1ZM7.5 10.5H4.5V13.5H7.5V10.5ZM4.5 9H7.5C8.3125 9 9 9.6875 9 10.5V13.5C9 14.3438 8.3125 15 7.5 15H4.5C3.65625 15 3 14.3438 3 13.5V10.5C3 9.6875 3.65625 9 4.5 9ZM12.5 2.5V5.5H15.5V2.5H12.5ZM11 2.5C11 1.6875 11.6562 1 12.5 1H15.5C16.3125 1 17 1.6875 17 2.5V5.5C17 6.34375 16.3125 7 15.5 7H12.5C11.6562 7 11 6.34375 11 5.5V2.5ZM14 8.5C14.4062 8.5 14.75 8.84375 14.75 9.25V11.25H16.75C17.1562 11.25 17.5 11.5938 17.5 12C17.5 12.4375 17.1562 12.75 16.75 12.75H14.75V14.75C14.75 15.1875 14.4062 15.5 14 15.5C13.5625 15.5 13.25 15.1875 13.25 14.75V12.75H11.25C10.8125 12.75 10.5 12.4375 10.5 12C10.5 11.5938 10.8125 11.25 11.25 11.25H13.25V9.25C13.25 8.84375 13.5625 8.5 14 8.5Z" />
					</svg>
				),
				hidePageHeader: true,
			},
			{
				label: "Settings",
				url: "/opal/settings",
				highlight: "/opal/settings",
				icon: (
					<svg width={20} height={20} viewBox="2 0 15.78 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
						<path d="M9.66406 0C10.1953 0 10.6953 0.0625 11.1953 0.15625C11.4453 0.21875 11.8828 0.34375 12.1328 0.78125C12.1953 0.90625 12.2266 1.03125 12.2578 1.15625L12.5703 2.375C12.6016 2.53125 12.9141 2.71875 13.1016 2.65625L14.2891 2.3125C14.4141 2.28125 14.5391 2.25 14.6641 2.25C15.1641 2.25 15.5078 2.5625 15.6641 2.75C16.3516 3.53125 16.8828 4.4375 17.2266 5.4375C17.3203 5.6875 17.4141 6.125 17.1328 6.53125C17.0703 6.65625 16.9766 6.75 16.8828 6.84375L16.0078 7.71875C15.8516 7.84375 15.8516 8.1875 16.0078 8.3125L16.8828 9.1875C16.9766 9.28125 17.0703 9.375 17.1328 9.5C17.3828 9.90625 17.2891 10.3438 17.2266 10.5938C16.8828 11.5938 16.3516 12.5 15.6641 13.2812C15.5078 13.4688 15.1641 13.7812 14.6641 13.7812C14.5391 13.7812 14.4141 13.75 14.2891 13.7188L13.1016 13.3438C12.9141 13.3125 12.6016 13.4688 12.5703 13.6562L12.2578 14.875C12.2266 15 12.1953 15.125 12.1328 15.25C11.8828 15.6875 11.4453 15.8125 11.1953 15.875C10.6953 15.9688 10.1953 16 9.66406 16C9.13281 16 8.60156 15.9688 8.10156 15.875C7.85156 15.8125 7.41406 15.6875 7.16406 15.25C7.10156 15.125 7.07031 15 7.03906 14.875L6.72656 13.6562C6.69531 13.4688 6.38281 13.3125 6.22656 13.3438L5.03906 13.7188C4.91406 13.75 4.75781 13.75 4.63281 13.7812C4.13281 13.7812 3.78906 13.4688 3.63281 13.2812C2.94531 12.5 2.41406 11.5938 2.07031 10.5938C2.00781 10.3438 1.91406 9.90625 2.16406 9.46875C2.22656 9.375 2.32031 9.25 2.41406 9.15625L3.32031 8.3125C3.44531 8.1875 3.44531 7.84375 3.32031 7.71875L2.41406 6.84375C2.32031 6.75 2.22656 6.65625 2.16406 6.53125C1.91406 6.125 2.00781 5.6875 2.07031 5.4375C2.41406 4.4375 2.94531 3.53125 3.63281 2.75C3.78906 2.5625 4.13281 2.25 4.63281 2.25C4.75781 2.25 4.91406 2.28125 5.03906 2.3125L6.22656 2.65625C6.38281 2.71875 6.69531 2.53125 6.72656 2.375L7.03906 1.15625C7.07031 1.03125 7.10156 0.90625 7.16406 0.78125C7.41406 0.34375 7.85156 0.21875 8.10156 0.15625C8.60156 0.0625 9.13281 0 9.66406 0ZM8.47656 1.625L8.19531 2.71875C7.94531 3.71875 6.78906 4.40625 5.78906 4.125L4.69531 3.78125C4.19531 4.40625 3.78906 5.09375 3.50781 5.84375L4.35156 6.625C5.10156 7.34375 5.10156 8.6875 4.35156 9.40625L3.50781 10.1875C3.78906 10.9375 4.19531 11.625 4.69531 12.25L5.78906 11.9062C6.78906 11.625 7.94531 12.3125 8.19531 13.3125L8.47656 14.4062C9.22656 14.5625 10.0703 14.5625 10.8516 14.4062L11.1016 13.3125C11.3516 12.3125 12.5078 11.625 13.5078 11.9062L14.6016 12.25C15.1016 11.625 15.5078 10.9375 15.7891 10.1875L14.9766 9.40625C14.2266 8.6875 14.2266 7.34375 14.9766 6.625L15.7891 5.84375C15.5078 5.09375 15.1016 4.40625 14.6016 3.78125L13.5078 4.125C12.5391 4.40625 11.3516 3.71875 11.1016 2.71875L10.8516 1.625C10.0703 1.46875 9.22656 1.46875 8.47656 1.625ZM8.16406 8C8.16406 8.5625 8.44531 9.03125 8.91406 9.3125C9.35156 9.59375 9.94531 9.59375 10.4141 9.3125C10.8516 9.03125 11.1641 8.5625 11.1641 8C11.1641 7.46875 10.8516 7 10.4141 6.71875C9.94531 6.4375 9.35156 6.4375 8.91406 6.71875C8.44531 7 8.16406 7.46875 8.16406 8ZM9.66406 11C8.57031 11 7.60156 10.4375 7.03906 9.5C6.50781 8.59375 6.50781 7.4375 7.03906 6.5C7.60156 5.59375 8.57031 5 9.66406 5C10.7266 5 11.6953 5.59375 12.2578 6.5C12.7891 7.4375 12.7891 8.59375 12.2578 9.5C11.6953 10.4375 10.7266 11 9.66406 11Z" />
					</svg>
				),
			},
		],
		cmp: [
			{
				label: "Create",
				icon: <CMPCreateIcon />,
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
				label: "Home",
				url: "/cmp/dashboard",
				highlight: "/cmp/dashboard",
				icon: <CMPHomeIcon />,
			},
			{
				label: "Plan",
				url: "/cmp/plan-view",
				highlight: "/cmp/plan-view",
				icon: <CMPPlanIcon />,
			},
			{
				label: "Library",
				url: "/cmp/library",
				highlight: "/cmp/library",
				icon: <CMPLibraryIcon />,
			},
			{
				label: "Stock Images",
				url: "/cmp/stock-images",
				highlight: "/cmp/stock-images",
				icon: <CMPMarketplaceIcon />,
			},
			{
				label: "Resource Management",
				url: "/cmp/resource-management",
				highlight: "/cmp/resource-management",
				icon: <CMPResourceManagementIcon />,
			},
			{
				label: "Idea Lab",
				url: "/cmp/idea-lab",
				highlight: "/cmp/idea-lab",
				icon: <CMPIdeaLabIcon />,
			},
			{
				label: "Analytics",
				url: "/cmp/reports",
				highlight: "/cmp/reports",
				icon: <CMPDashboardIcon />,
			},
			{
				label: "Requests",
				url: "/cmp/work-request",
				highlight: "/cmp/work-request",
				icon: <CMPWorkRequestIcon />,
			},
			{
				label: "Settings",
				highlight: "cmp/settings",
				url: "/cmp/settings",
				icon: <IconSettings />,
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
				<Script src="https://mcp.figma.com/mcp/html-to-design/capture.js" strategy="afterInteractive" />
				<ThemeProvider>
					<ProofreadingProvider>
						<OpalGenerationProvider>
							<HydrationErrorSuppressor key="hes" />
							<MigrationRunner key="mig" />
							<TailwindSafelist />
							<Fragment key="content">
								{menu ? <Template structure={menu}>{children}</Template> : children}
							</Fragment>
							{activeEffect === "snow" && <SnowEffect key="snow" />}
							{activeEffect === "newyear" && <NewYearEffect key="newyear" />}
						</OpalGenerationProvider>
					</ProofreadingProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
