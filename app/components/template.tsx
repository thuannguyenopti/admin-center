"use client";

import {
	Box,
	Sidebar,
	NavBody,
	NavItem,
	Nav,
	Heading,
	SubNav,
	Button,
	Indicator,
} from "@optiaxiom/react";
import { Text } from "./Text";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";

import { useRouter, usePathname } from "next/navigation";
import VT from "./VT";
import GlobalBar from "./GlobalBar";
import { LayoutProvider, useLayout } from "../context/LayoutContext";
import { OpalContextProvider, useOpalContext } from "../context/OpalContext";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import usePersistentState from "@/app/usePersistentState";
import { FilterPanelProvider } from "../cms/content/context/FilterPanelContext";
import ContentManagerSidebar from "../cms/content/components/ContentManagerSidebar";
import { OpalPanel } from "./OpalPanel";
import { useOpalState } from "@/app/hooks/useOpalState";
import { useOpalHistory } from "@/app/hooks/useOpalHistory";

function TemplateContent({
	children,
	structure,
}: Readonly<{
	children: React.ReactNode;
	structure: any;
}>) {
	const { asideContent } = useLayout();
	const opalContext = useOpalContext();
	const router = useRouter();
	const path = usePathname();
	const [isExpanded, setIsExpanded, isHydrated] = usePersistentState("sidebarExpanded", false);

	// Opal panel state
	const {
		groupedHistory,
		activeChat,
		searchQuery,
		isHistoryVisible,
		mode,
		setSearchQuery,
		toggleHistory,
		toggleMode,
		createNewChat,
		deleteChat,
		selectChat,
	} = useOpalHistory();

	const {
		isOpen: isOpalOpen,
		messages,
		inputValue,
		isLoading,
		error,
		togglePanel: toggleOpal,
		closePanel: closeOpal,
		setInputValue,
		sendMessage,
	} = useOpalState({ activeChatId: activeChat, opalContext });

	const menuClick = (url: string) => {
		router.push(`${url}`);
	};

	const menuItems = Array.isArray(structure) ? structure : [];

	const highlight1 = menuItems
		.filter((item: any) => item?.highlight != null && path.includes(item.highlight))
		.sort((a: any, b: any) => b.highlight.length - a.highlight.length)[0];
	const lvl2 = highlight1?.children
		?.filter((item: any) => (item.url ? path.includes(item.url) : false))
		.sort((a: any, b: any) => b.url.length - a.url.length)[0];
	const lvl3 = lvl2?.children?.children
		?.filter((item: any) => (item.url ? path.includes(item.url) : false))
		.sort((a: any, b: any) => b.url.length - a.url.length)[0];
	const lvl4 = lvl3?.children?.children
		?.filter((item: any) => (item.url ? path.includes(item.url) : false))
		.sort((a: any, b: any) => b.url.length - a.url.length)[0];

	const heading = lvl4?.label || lvl3?.label || lvl2?.label;
	const desc = lvl4?.description || lvl3?.description || lvl2?.description;

	// Check if we're on the Content Manager page
	const isContentManager = path.includes("/cms/content");

	const showVT =
		highlight1?.children?.length > 1 ||
		typeof lvl3 !== "undefined" ||
		typeof lvl4 !== "undefined";

	// Show secondary sidebar for Content Manager or hierarchical navigation
	const showSecondarySidebar = isContentManager || showVT;

	const customLayout = highlight1?.customLayout;

	// Check if we're on the Workflow Builder page
	const isWorkflowBuilder = path.startsWith("/opal/agents/workflow");

	if (!isHydrated) return <Box style={{ height: "100vh" }} bg="bg.page" />;

	if (isWorkflowBuilder) {
		return (
			<Box style={{ height: "100vh", width: "100vw" }} bg="bg.default">
				{children}
			</Box>
		);
	}

	return (
		<Box className="grid grid-cols-[0fr_1fr] grid-rows-[0fr_1fr] h-screen" bg="bg.page">
			<GlobalBar onOpalClick={toggleOpal} />
			<Box display="flex" z="10" style={{ minHeight: 0 }}>
				<Sidebar className="h-full z-10 relative" expanded={isExpanded}>
					<Nav>
						<NavBody>
							{menuItems.map((menuItem: any) =>
								menuItem.url ? (
									<NavItem
										onClick={() => menuClick(menuItem.url)}
										active={
											menuItem.exact
												? path === menuItem.highlight
												: path.includes(menuItem.highlight)
										}
										key={menuItem.label}
										aria-label={menuItem.label}
										icon={
											menuItem.label === "Notifications" &&
												!path.startsWith("/opal/notifications") ? (
												<Box style={{ position: "relative" }}>
													{menuItem.icon}
													<Box
														style={{
															position: "absolute",
															top: "-2px",
															right: "-2px",
															height: "8px",
															width: "8px",
															border: "1.5px solid #FFFFFF",
														}}
														bg="bg.error"
														rounded="full"
													/>
												</Box>
											) : (
												menuItem.icon
											)
										}
									>
										{menuItem.label}
									</NavItem>
								) : (
									<Box
										key={menuItem.label}
										px="16"
										py="8"
										mt="4"
										borderT="1"
										borderColor="border.tertiary"
									>
										{isExpanded && (
											<Text fontSize="sm" color="fg.tertiary" mt="2">
												{menuItem.label}
											</Text>
										)}
									</Box>
								)
							)}
						</NavBody>
					</Nav>
					<Box className="absolute bottom-0 left-0 right-0" p="8">
						<Button
							aria-label={!isExpanded ? "Expand sidebar" : "Collapse sidebar"}
							icon={!isExpanded ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
							onClick={() => setIsExpanded(!isExpanded)}
							size="sm"
							appearance="subtle"
						/>
					</Box>
				</Sidebar>
				<Box
					style={{
						marginLeft: "-224px",
						transform: showSecondarySidebar ? "translatex(224px)" : "translatex(0px)",
						transition: ".7s cubic-bezier(0, 1, 0, 1)",
						overflowX: "hidden",
						overflowY: isContentManager ? "hidden" : undefined,
						minHeight: isContentManager ? 0 : undefined,
					}}
					borderR="1"
					borderColor="border.tertiary"
					className="slide w-[224px]"
					h="full"
					bg="bg.default"
				>
					{isContentManager ? (
						<ContentManagerSidebar />
					) : showVT ? (
						<Sidebar className="flex" h="full" style={{ overflowY: "auto", overflowX: "hidden" }}>
							<SubNav style={{ height: "100%", overflowY: "auto", overflowX: "hidden" }}>
								<div
									className="flex w-[500%]"
									style={{
										transform: `translateX(-${224 * (lvl4 ? 2 : lvl3 ? 1 : 0)
											}px)`,
										transition: ".7s cubic-bezier(0, 1, 0, 1)",
										minHeight: "100%",
										overflowX: "hidden",
									}}
								>
									{showVT && highlight1?.children && (
										<VT
											backLink={undefined}
											title={highlight1?.children?.title || highlight1?.label}
											items={highlight1?.children}
										/>
									)}
									{showVT && lvl3 && (
										<VT
											backLink={lvl2}
											title={lvl2.children?.title}
											items={lvl2.children?.children}
										/>
									)}
									{showVT && lvl4 && (
										<VT
											backLink={lvl3}
											title={lvl3.children?.title}
											items={lvl3.children?.children}
										/>
									)}
								</div>
							</SubNav>
						</Sidebar>
					) : null}
				</Box>
			</Box>
			<Box
				overflowX="hidden"
				display="flex"
				flexDirection="row"
				fontSize="md"
				color="fg.default"
				h="full"
				style={{ minHeight: 0 }}
			>
				<Box
					flex="1"
					className="min-w-0 relative"
					overflow={customLayout ? "hidden" : "auto"}
					h="full"
				>
					{customLayout ? (
						children
					) : (
						<Box
							style={{
								marginLeft: "224px",
								marginRight: "-224px",
								width: !showSecondarySidebar ? "100%" : "calc(100% - 224px)",
								transform: showSecondarySidebar
									? "translatex(0px)"
									: "translatex(-224px)",
								transition: ".7s cubic-bezier(0, 1, 0, 1)",
							}}
							color="fg.default"
							overflow="auto"
							p="24"
						>
							<>
								<Heading level="3">{heading || highlight1?.label}</Heading>
								{desc && <Text mt="4">{desc}</Text>}
								<Box mt="16" z="10" className="relative">
									{children}
								</Box>
							</>
						</Box>
					)}
				</Box>
				{asideContent && (
					<Box
						borderL="1"
						borderColor="border.tertiary"
						bg="bg.default"
						h="full"
						overflow="auto"
					>
						{asideContent}
					</Box>
				)}
			</Box>
			<OpalPanel
				isOpen={isOpalOpen}
				onClose={closeOpal}
				messages={messages}
				inputValue={inputValue}
				isLoading={isLoading}
				error={error}
				setInputValue={setInputValue}
				sendMessage={sendMessage}
				groupedHistory={groupedHistory}
				activeChat={activeChat}
				searchQuery={searchQuery}
				isHistoryVisible={isHistoryVisible}
				mode={mode}
				setSearchQuery={setSearchQuery}
				toggleHistory={toggleHistory}
				toggleMode={toggleMode}
				createNewChat={createNewChat}
				deleteChat={deleteChat}
				selectChat={selectChat}
			/>
		</Box>
	);
}

function TemplateWrapper(props: any) {
	const pathname = usePathname();
	const isContentManager = pathname.includes("/cms/content");

	if (isContentManager) {
		return (
			<Suspense fallback={<Box p="24">Loading...</Box>}>
				<FilterPanelProvider>
					<TemplateContent {...props} />
				</FilterPanelProvider>
			</Suspense>
		);
	}

	return <TemplateContent {...props} />;
}

export default function Template(props: any) {
	return (
		<LayoutProvider>
			<OpalContextProvider navigationStructure={props.structure}>
				<TemplateWrapper {...props} />
			</OpalContextProvider>
		</LayoutProvider>
	);
}
