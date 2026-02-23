"use client";
import Template from "./components/template";
import "./globals.css";
import { AxiomProvider } from "@optiaxiom/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import usePersistentState from "@/app/usePersistentState";
import { Algorithm, initialAlgorithms } from "@/app/db/initialData";
import { useSecretCode } from "@/app/hooks/useSecretCode";
import { SnowEffect } from "@/app/components/effects/SnowEffect";
import { NewYearEffect } from "@/app/components/effects/NewYearEffect";
import { NotificationToastProvider } from "@/app/components/NotificationToast";
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
import { IconAlignRight } from "@optimizely/axiom-icons";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const path = usePathname();
	const algorithmMatch = path.match(/\/cms\/search\/algorithms\/([^/]+)/);
	const algorithmId = algorithmMatch ? algorithmMatch[1] : null;

	const [algorithms] = usePersistentState("algorithms", initialAlgorithms) as [Algorithm[], any];
	const currentAlgorithm = algorithms.find((a) => a.id === algorithmId);

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
				url: "/cms/settings/content-types",
				icon: <IconSettings />,
				children: [
					{ label: "Configure" },
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
								{ label: "Advanced" },
								{
									label: "Hostnames",
									url: "/cms/settings/applications/mosey-bank/hostnames",
								},
							],
						},
					},
					{ label: "Access Rights", url: "/cms/settings/access-rights" },
					{ label: "API Clients", url: "/cms/settings/api-clients" },
					{ label: "Scheduled Jobs", url: "/cms/settings/scheduled-jobs" },
					{ label: "Content Types", url: "/cms/settings/content-types" },
					{ label: "Blueprints", url: "/cms/settings/blueprints" },
					{ label: "Languages", url: "/cms/settings/languages" },
					{ label: "Edit Tabs", url: "/cms/settings/edit-tabs" },
					{ label: "Tools" },
					{ label: "Import Data", url: "/cms/settings/import-data" },
					{ label: "Export Data", url: "/cms/settings/export-data" },
					{ label: "Convert Pages", url: "/cms/settings/convert-pages" },
					{ label: "Change Log", url: "/cms/settings/change-log" },
					{ label: "Add-ons" },
					{ label: "BVN/GETA 404 Handler", url: "/cms/settings/bvn" },
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
					{ label: "Health & Monitoring" },
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
					{ label: "Manage" },

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
					{ label: "Search Tools" },
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
				icon: (
					<img
						src="/nav_icons/comments.svg"
						alt="Chat"
						width={20}
						height={20}
					/>
				),
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
				icon: (
					<img
						src="/nav_icons/inbox.svg"
						alt="Notifications"
						width={20}
						height={20}
					/>
				),
				customLayout: true,
			},
			{
				label: "Activities",
				url: "/opal/activities",
				highlight: "/opal/activities",
				icon: (
					<img
						src="/nav_icons/clock-rotate-left.svg"
						alt="Activities"
						width={20}
						height={20}
					/>
				),
			},
			{
				label: "Configurations",
			},
			{
				label: "Instructions",
				url: "/opal/instructions",
				highlight: "/opal/instructions",
				icon: (
					<img
						src="/nav_icons/book.svg"
						alt="Instructions"
						width={20}
						height={20}
					/>
				),
			},
			{
				label: "Agents",
				url: "/opal/agents",
				highlight: "/opal/agents",
				icon: (
					<img
						src="/nav_icons/agent_nav.svg"
						alt="Agents"
						width={20}
						height={20}
					/>
				),
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
				label: "Settings",
				url: "/opal/settings",
				highlight: "/opal/settings",
				icon: (
					<img
						src="/nav_icons/gear.svg"
						alt="Settings"
						width={20}
						height={20}
					/>
				),
			},
			{
				label: "Notification Catalog",
				url: "/opal/notification-catalog",
				highlight: "/opal/notification-catalog",
				icon: <IconList />,
				customLayout: true,
			},
		],
	};
	const key: string = path.split("/")[1];
	const menu = structure[key as keyof typeof structure];

	const [feHostingState, setFeHostingState] = useState({});
	const { activeEffect } = useSecretCode();
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return (
			<html lang="en" suppressHydrationWarning>
				<body suppressHydrationWarning />
			</html>
		);
	}

	return (
		<html lang="en" suppressHydrationWarning>
			{/* eslint-disable-next-line @next/next/no-head-element */}
			<head>
				<script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
			</head>
			<body suppressHydrationWarning>
				<AxiomProvider>
					<NotificationToastProvider>
						{menu ? <Template structure={menu}>{children}</Template> : children}
						{activeEffect === "snow" && <SnowEffect />}
						{activeEffect === "newyear" && <NewYearEffect />}
					</NotificationToastProvider>
				</AxiomProvider>
			</body>
		</html>
	);
}
