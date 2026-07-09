"use client";

import {
	Box,
	Badge,
	Sidebar,
	NavBody,
	NavFooter,
	NavItem,
	NavList,
	Nav,
	Heading,
	SubNav,
	Menu,
	MenuTrigger,
	MenuContent,
	SidebarToggle,
} from "@optiaxiom/react";
import {Text} from "./Text";
import React, {useEffect, useState, useMemo, Suspense} from "react";

import {useRouter, usePathname, useSearchParams} from "next/navigation";
import VT from "./VT";
import GlobalBar from "./GlobalBar";
import {LayoutProvider, useLayout} from "../context/LayoutContext";
import {OpalContextProvider, useOpalContext} from "../context/OpalContext";
import {BrandToneProvider} from "../components/ai/BrandToneProvider";
import {PreflightProvider} from "../components/ai/PreflightContext";
import {OpalPanelActionsProvider} from "../context/OpalPanelActionsContext";
import {OpalVariationBuildProvider} from "../context/OpalVariationBuildContext";
import {ExperimentResultsProvider} from "../context/ExperimentResultsContext";
import usePersistentState from "@/app/usePersistentState";
import {FilterPanelProvider} from "../cms/content/context/FilterPanelContext";
import {
	ContentManagerLayoutProvider,
	useContentManagerLayout,
} from "../cms/content/context/ContentManagerLayoutContext";
import ContentManagerSidebar from "../cms/content/components/ContentManagerSidebar";
import {OpalPanel} from "./OpalPanel";
import {useOpalState} from "@/app/hooks/useOpalState";
import {useOpalHistory} from "@/app/hooks/useOpalHistory";
import {CodePanel} from "./CodePanel";
import {IconSidebar} from "@optimizely/axiom-icons";
import {FEATURED_AGENTS} from "@/app/opal/opalAgents";
import {useAgentChatMode} from "@/app/hooks/useAgentChatMode";

type PendingOpalPrompt = {
	chatId: string;
	prompt: string;
};

function TemplateContent({
	children,
	structure,
}: Readonly<{
	children: React.ReactNode;
	structure: any;
}>) {
	const {
		asideContent,
		subNavContent,
		subNavWidth,
		titleActions,
		topContent,
		footerContent,
		hidePageHeader,
		setOpalPanelControls,
		opalPanelWidth,
		setCodePanelControls,
	} = useLayout();
	const opalContext = useOpalContext();
	// Stable slice — deps use primitive values (not object/array refs) so this memo
	// only recomputes when the actual content changes, even though OpalContextProvider
	// recreates its context value on every render (because navigationStructure is a new
	// array ref on each render from layout.tsx).
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const stableOpalCtx = useMemo(
		() => ({
			currentPage: opalContext.currentPage,
			availableFeatures: opalContext.availableFeatures,
			opalCapabilities: opalContext.opalCapabilities,
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}),
		[
			opalContext.currentPage?.path,
			opalContext.currentPage?.productArea,
			opalContext.currentPage?.pageName,
			opalContext.currentPage?.pageDescription,
			// eslint-disable-next-line react-hooks/exhaustive-deps
			JSON.stringify(opalContext.availableFeatures),
		]
	);
	const router = useRouter();
	const onOpalNavigate = React.useCallback(
		(p: string) => {
			router.push(p);
		},
		[router]
	);
	const path = usePathname();
	const searchParams = useSearchParams();
	const [isExpanded, setIsExpanded] = useState(false);
	const isHydrated = true;
	const [mounted, setMounted] = useState(false);
	const [pendingOpalPrompt, setPendingOpalPrompt] = useState<PendingOpalPrompt | null>(null);
	const [opalContextChip, setOpalContextChip] = useState<{label: string; content: string} | null>(
		null
	);
	// Code panel state
	const [isCodePanelOpen, setIsCodePanelOpen] = useState(false);
	const [codePanelTarget, setCodePanelTarget] = useState<string | null>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

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
		isInputDisabled,
		togglePanel: toggleOpal,
		closePanel: closeOpal,
		openPanel: openOpal,
		showExperimentCreationAgent,
		setInputValue,
		clearHistory,
		setInputDisabled,
		sendMessage,
		regenerate,
		addMessage,
		updateMessage,
		removeMessage,
	} = useOpalState({
		activeChatId: activeChat,
		opalContext: stableOpalCtx,
		onNavigate: onOpalNavigate,
	});

	const {
		agentSession: panelAgentSession,
		agentBarElement: panelAgentBar,
		sortedAgents: panelSortedAgents,
		handleSelectAgent: panelHandleSelectAgent,
		handleSendMessage: panelHandleSendMessage,
	} = useAgentChatMode({
		messages,
		inputValue,
		setInputValue,
		sendMessage,
		addMessage,
	});

	useEffect(() => {
		if (!pendingOpalPrompt || isLoading) return;
		if (activeChat !== pendingOpalPrompt.chatId) return;
		if (messages.length > 0) return;

		setInputValue(pendingOpalPrompt.prompt);
		void sendMessage(pendingOpalPrompt.prompt);
		setPendingOpalPrompt(null);
	}, [activeChat, isLoading, messages.length, pendingOpalPrompt, sendMessage, setInputValue]);

	const closeOpalWithRouteAwareness = () => {
		// `opalCloseReturnTo` is a nav-item flag (resolved below): closing the Opal
		// panel navigates to ?returnTo= (or the flag's fallback URL) instead of
		// staying on the page.
		if (opalCloseReturnTo) {
			const returnTo =
				typeof window !== "undefined"
					? new URLSearchParams(window.location.search).get("returnTo") ||
						opalCloseReturnTo
					: opalCloseReturnTo;
			closeOpal();
			router.push(returnTo);
			return;
		}

		closeOpal();
	};

	// Mutable ref holding latest versions of all Opal controls so the effect below
	// can register stable wrapper functions without re-running on every render.
	const opalControlsRef = React.useRef({
		openOpal,
		toggleOpal,
		closeOpal,
		createNewChat,
		clearHistory,
		addMessage,
		updateMessage,
		removeMessage,
		setInputValue,
		sendMessage,
		setInputDisabled,
		setPendingOpalPrompt,
		setOpalContextChip,
	});
	opalControlsRef.current = {
		openOpal,
		toggleOpal,
		closeOpal,
		createNewChat,
		clearHistory,
		addMessage,
		updateMessage,
		removeMessage,
		setInputValue,
		sendMessage,
		setInputDisabled,
		setPendingOpalPrompt,
		setOpalContextChip,
	};

	// Provide Opal panel controls through LayoutContext.
	// Stable wrapper functions delegate to the ref so this effect only runs once
	// (on mount / when setOpalPanelControls identity changes) — not on every render.
	useEffect(() => {
		setOpalPanelControls({
			openPanel: () => opalControlsRef.current.openOpal(),
			togglePanel: () => opalControlsRef.current.toggleOpal(),
			closePanel: () => opalControlsRef.current.closeOpal(),
			createNewChat: () => opalControlsRef.current.createNewChat(),
			clearHistory: () => opalControlsRef.current.clearHistory(),
			addMessage: (msg) => opalControlsRef.current.addMessage(msg),
			updateMessage: (id, updates) => opalControlsRef.current.updateMessage(id, updates),
			removeMessage: (id) => opalControlsRef.current.removeMessage(id),
			setInputValue: (v) => opalControlsRef.current.setInputValue(v),
			sendMessage: (content) => opalControlsRef.current.sendMessage(content),
			setInputDisabled: (disabled) => opalControlsRef.current.setInputDisabled(disabled),
			launchPrompt: (prompt: string) => {
				const trimmed = prompt.trim();
				if (!trimmed) return;
				const chatId = opalControlsRef.current.createNewChat();
				opalControlsRef.current.openOpal();
				opalControlsRef.current.setPendingOpalPrompt({chatId, prompt: trimmed});
			},
			launchWithContext: (label: string, content: string) => {
				opalControlsRef.current.createNewChat();
				opalControlsRef.current.openOpal();
				opalControlsRef.current.setOpalContextChip({label, content});
			},
		});
		return () => setOpalPanelControls(null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [setOpalPanelControls]);

	// Provide Code panel controls through LayoutContext
	useEffect(() => {
		setCodePanelControls({
			openPanel: (target: string) => {
				setCodePanelTarget(target);
				setIsCodePanelOpen(true);
			},
			closePanel: () => {
				setIsCodePanelOpen(false);
			},
			isOpen: isCodePanelOpen,
		});
		return () => setCodePanelControls(null);
	}, [setCodePanelControls, isCodePanelOpen]);

	const menuClick = (url: string, e?: React.MouseEvent) => {
		e?.stopPropagation();
		router.push(`${url}`);
	};

	const menuItems = Array.isArray(structure) ? structure : [];
	// Nav-item matching. `highlight` may be a string or an array of path prefixes.
	// An optional `query` object further constrains a match to specific search
	// params (e.g. {artifacts: "1"}). Returns the longest matching highlight, or
	// null when the item doesn't match the current location.
	const highlightMatch = (item: any): string | null => {
		if (item?.highlight == null) return null;
		if (
			item.query &&
			!Object.entries(item.query).every(([key, value]) => searchParams.get(key) === value)
		) {
			return null;
		}
		const highlights: string[] = Array.isArray(item.highlight)
			? item.highlight
			: [item.highlight];
		const matched = highlights.filter((h) => (item.exact ? path === h : path.includes(h)));
		const additional: string[] =
			item.additionalHighlights?.filter((h: string) => path.includes(h)) ?? [];
		return [...matched, ...additional].sort((a, b) => b.length - a.length)[0] ?? null;
	};

	// Best-matching nav item for the current route. Query-constrained matches beat
	// plain ones, hidden entries (which exist solely to carry layout flags for a
	// route) beat visible ones, then longest highlight wins.
	const routeHighlight = menuItems
		.map((item: any) => ({item, match: highlightMatch(item)}))
		.filter((entry: any) => entry.match != null)
		.sort(
			(a: any, b: any) =>
				(b.item.query ? 1 : 0) - (a.item.query ? 1 : 0) ||
				(b.item.hidden ? 1 : 0) - (a.item.hidden ? 1 : 0) ||
				b.match.length - a.match.length
		)[0]?.item;
	const lvl2 = routeHighlight?.children
		?.filter((item: any) => (item.url ? path.includes(item.url) : false))
		.sort((a: any, b: any) => b.url.length - a.url.length)[0];
	const lvl3 = lvl2?.children?.children
		?.filter((item: any) => (item.url ? path.includes(item.url) : false))
		.sort((a: any, b: any) => b.url.length - a.url.length)[0];
	const lvl4 = lvl3?.children?.children
		?.filter((item: any) => (item.url ? path.includes(item.url) : false))
		.sort((a: any, b: any) => b.url.length - a.url.length)[0];

	const heading = lvl4?.label || lvl3?.label || lvl2?.label;
	const desc =
		lvl4?.description || lvl3?.description || lvl2?.description || routeHighlight?.description;

	// Resolve a layout flag from the deepest matching nav level upward.
	const navFlag = (name: string) =>
		lvl4?.[name] ?? lvl3?.[name] ?? lvl2?.[name] ?? routeHighlight?.[name];

	// Nav-item layout flags — see CLAUDE.md. All layout variation must be driven
	// by these (or useLayout context), never by route checks in this file.
	const fullscreen = !!navFlag("fullscreen"); // no shell at all, children own the viewport
	const hideSidebar = !!navFlag("hideSidebar"); // no primary/secondary sidebar, GlobalBar stays
	const chromeless = !!navFlag("chromeless"); // no GlobalBar and no sidebars
	const opalCloseReturnTo = navFlag("opalCloseReturnTo") as string | undefined;

	// TODO(standards): the Content Manager coupling below (CMS-specific sidebar,
	// widths, and the FilterPanelProvider in TemplateWrapper) is the last
	// route-specific logic in this file. It should move behind a generic
	// secondary-sidebar mechanism (e.g. nav flag + useLayout content injection).
	const isContentManager = path.includes("/cms/content");
	const showVT =
		routeHighlight?.children?.length > 1 ||
		typeof lvl3 !== "undefined" ||
		typeof lvl4 !== "undefined";
	const showViaSubNavContent = !!subNavContent && !hideSidebar;
	const showSecondarySidebar =
		!hideSidebar && (isContentManager || showVT || showViaSubNavContent);
	const {contentSubNavExpanded} = useContentManagerLayout();
	// When Content Manager sub-nav is collapsed, reserve 56px; when expanded, 224px. Other secondary sidebars (VT) use 224px.
	const secondarySidebarWidth = showViaSubNavContent
		? subNavWidth
		: isContentManager
			? contentSubNavExpanded
				? 224
				: 56
			: 224;
	const customLayout = !!navFlag("customLayout");
	const shouldHidePageHeader = routeHighlight?.hidePageHeader || hidePageHeader;

	// Primary sidebar width: 56px collapsed, 224px expanded
	const primarySidebarWidth = hideSidebar || chromeless ? 0 : isExpanded ? 224 : 56;

	// Calculate total left offset for footer
	const footerLeftOffset =
		primarySidebarWidth + (showSecondarySidebar ? secondarySidebarWidth : 0);

	// `instantShell: true` on a nav item disables the shell slide transition
	const shellTransition = navFlag("instantShell") ? "none" : ".7s cubic-bezier(0, 1, 0, 1)";

	if (!isHydrated || !mounted) {
		return <Box style={{height: "100vh"}} bg="bg.page" />;
	}

	if (fullscreen) {
		return (
			<Box style={{height: "100vh", width: "100vw"}} bg="bg.default">
				{children}
			</Box>
		);
	}

	const sidebarColWidth = primarySidebarWidth;
	return (
		<OpalPanelActionsProvider
			openPanel={openOpal}
			sendMessage={sendMessage}
			openExperimentCreationAgent={showExperimentCreationAgent}
		>
			<OpalVariationBuildProvider addMessage={addMessage} updateMessage={updateMessage}>
				<Box
					className="grid grid-rows-[auto_1fr] h-screen"
					overflow="hidden"
					style={{
						gridTemplateColumns: `${sidebarColWidth}px 1fr`,
						transition: "grid-template-columns 0.2s ease-out",
					}}
					bg="bg.default"
				>
					{!chromeless && <GlobalBar onOpalClick={toggleOpal} />}
					{!hideSidebar && !chromeless ? (
						<Box display="flex" z="10" style={{minHeight: 0, height: "100%"}}>
							<Sidebar
								className="h-full z-10 relative"
								expanded={isExpanded}
								onExpandedChange={setIsExpanded}
								defaultExpanded={isExpanded}
							>
								<Box
									style={{
										flex: 1,
										minHeight: 0,
										display: "flex",
										flexDirection: "column",
									}}
								>
									<Nav>
										<NavBody>
											{menuItems
												.filter((item: any) => !item.hidden)
												.map((menuItem: any) => {
													if (menuItem.isMenuTrigger) {
														return (
															<React.Fragment key={menuItem.label}>
																<Menu
																	options={menuItem.menuOptions.map(
																		(opt: any) => ({
																			label: opt.label,
																			execute: () =>
																				menuClick(opt.url),
																		})
																	)}
																>
																	<MenuTrigger asChild>
																		<NavItem
																			aria-label={
																				menuItem.label
																			}
																			icon={menuItem.icon}
																			className="[&_svg]:w-6 [&_svg]:h-6 [&_svg]:overflow-visible"
																		>
																			{menuItem.label}
																		</NavItem>
																	</MenuTrigger>
																	<MenuContent />
																</Menu>
																<Box className="h-2" />
															</React.Fragment>
														);
													}

													if (!menuItem.url) {
														return (
															<Box
																key={menuItem.label}
																px="16"
																py="8"
																mt="4"
																borderT="1"
																borderColor="border.tertiary"
																onClick={(e: React.MouseEvent) =>
																	e.stopPropagation()
																}
															>
																{isExpanded && (
																	<Text
																		fontSize="sm"
																		color="fg.tertiary"
																		mt="2"
																	>
																		{menuItem.label}
																	</Text>
																)}
															</Box>
														);
													}

													const isActive =
														routeHighlight?.label === menuItem.label ||
														highlightMatch(menuItem) != null;

													const itemClick = (e: React.MouseEvent) =>
														menuClick(menuItem.url, e);
													// `badge` on a nav item shows a count badge while
													// the item is not active
													const showBadge =
														menuItem.badge != null && !isActive;

													// Expanded: plain NavItem with label
													return (
														<NavItem
															key={menuItem.label}
															onClick={itemClick}
															active={isActive}
															aria-label={menuItem.label}
															icon={menuItem.icon}
															addonAfter={
																showBadge ? (
																	<Badge
																		variant="strong"
																		intent="danger"
																	>
																		{menuItem.badge}
																	</Badge>
																) : undefined
															}
														>
															{menuItem.label}
														</NavItem>
													);
												})}
										</NavBody>
										<NavFooter>
											<NavList>
												<SidebarToggle icon={<IconSidebar />} />
											</NavList>
										</NavFooter>
									</Nav>
								</Box>
							</Sidebar>
							<Box
								style={{
									marginLeft: -secondarySidebarWidth,
									transform: showSecondarySidebar
										? `translateX(${secondarySidebarWidth}px)`
										: "translateX(0px)",
									transition: shellTransition,
									overflowX: "hidden",
									overflowY: isContentManager ? "hidden" : undefined,
									minHeight: isContentManager ? 0 : undefined,
									width: secondarySidebarWidth,
									minWidth: secondarySidebarWidth,
									flexShrink: 0,
									height: "100%",
								}}
								bg="bg.default"
								overflow="hidden"
								className="slide"
							>
								{showViaSubNavContent ? (
									<Box
										h="full"
										overflow="auto"
										style={{width: subNavWidth, minWidth: subNavWidth}}
									>
										{subNavContent}
									</Box>
								) : isContentManager ? (
									<ContentManagerSidebar />
								) : showVT ? (
									<Sidebar
										className="flex"
										h="full"
										style={{overflowY: "auto", overflowX: "hidden"}}
									>
										<SubNav
											style={{
												height: "100%",
												overflowY: "auto",
												overflowX: "hidden",
												borderRight: 0,
											}}
										>
											<div
												className="flex w-[500%]"
												style={{
													transform: `translateX(-${224 * (lvl4 ? 2 : lvl3 ? 1 : 0)}px)`,
													transition: shellTransition,
													minHeight: "100%",
													overflowX: "hidden",
												}}
											>
												{showVT && routeHighlight?.children && (
													<VT
														backLink={undefined}
														title={
															routeHighlight.children?.title ||
															routeHighlight.label
														}
														description={
															routeHighlight.children?.description
														}
														items={routeHighlight.children}
													/>
												)}
												{showVT && lvl3 && (
													<VT
														backLink={lvl2}
														title={lvl2.children?.title}
														description={lvl2.children?.description}
														items={lvl2.children?.children}
													/>
												)}
												{showVT && lvl4 && (
													<VT
														backLink={lvl3}
														title={lvl3.children?.title}
														description={lvl3.children?.description}
														items={lvl3.children?.children}
													/>
												)}
											</div>
										</SubNav>
									</Sidebar>
								) : null}
							</Box>
						</Box>
					) : null}
					<Box
						overflowX="hidden"
						display="flex"
						flexDirection="row"
						fontSize="md"
						color="fg.default"
						p="0"
						h="full"
						style={{
							minHeight: 0,
							...(chromeless ? {gridColumn: "1 / -1", gridRow: "1 / -1"} : {}),
						}}
					>
						<Box
							flex="1"
							className="min-w-0 relative main-scroll-area"
							overflow={customLayout ? "hidden" : "auto"}
							h="full"
							style={{minHeight: 0}}
						>
							{customLayout ? (
								children
							) : (
								<Box
									style={{
										marginLeft: secondarySidebarWidth,
										marginRight: -secondarySidebarWidth,
										width: !showSecondarySidebar
											? "100%"
											: `calc(100% - ${secondarySidebarWidth}px)`,
										transform: showSecondarySidebar
											? "translateX(0px)"
											: `translateX(-${secondarySidebarWidth}px)`,
										transition:
											"margin 0.2s ease-out, width 0.2s ease-out, transform 0.2s ease-out",
									}}
									color="fg.default"
									pb={footerContent ? "80" : "24"}
									p={"32"}
									bg="bg.page"
									rounded="lg"
									m="8"
								>
									{!shouldHidePageHeader && (
										<Box w="full" className="min-w-0" overflow="hidden">
											<Box
												display="flex"
												justifyContent="space-between"
												alignItems="center"
												w="full"
												mb="16"
											>
												<Heading level="1" truncate>
													{heading || routeHighlight?.label}
												</Heading>
												{titleActions}
											</Box>
											{desc && (
												<Text
													mb="24"
													color="fg.secondary"
													display="block"
													w="full"
													style={{
														width: "100%",
														maxWidth: "none",
													}}
												>
													{desc}
												</Text>
											)}
										</Box>
									)}
									{topContent && <Box>{topContent}</Box>}
									<Box
										mt={
											!shouldHidePageHeader && desc
												? "0"
												: !shouldHidePageHeader
													? "24"
													: "0"
										}
										z="10"
										className="relative"
										w="full"
										style={{width: "100%", maxWidth: "none"}}
									>
										{children}
									</Box>
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
								style={{
									width: "fit-content",
									minWidth: "384px",
									maxWidth: "760px",
									flexShrink: 0,
								}}
							>
								{asideContent}
							</Box>
						)}
					</Box>
					{footerContent && (
						<Box
							style={{
								position: "fixed",
								bottom: 0,
								left: `${footerLeftOffset}px`,
								right: `${opalPanelWidth}px`,
								transition:
									"left 0.2s ease-out, right 0.3s cubic-bezier(0, 1, 0, 1)",
							}}
							borderT="1"
							borderL="1"
							borderColor="border.secondary"
							bg="bg.default"
							px="32"
							py="16"
							display="flex"
							justifyContent="end"
							z="20"
						>
							{footerContent}
						</Box>
					)}
					<OpalPanel
						isOpen={isOpalOpen}
						onClose={closeOpalWithRouteAwareness}
						messages={messages}
						inputValue={inputValue}
						isLoading={isLoading}
						error={error}
						isInputDisabled={isInputDisabled}
						setInputValue={setInputValue}
						sendMessage={panelHandleSendMessage}
						regenerate={regenerate}
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
						contextChip={opalContextChip?.label ?? null}
						contextContent={opalContextChip?.content ?? null}
						onContextChipRemove={() => setOpalContextChip(null)}
						mentionableAgents={panelSortedAgents}
						onMentionSelect={panelHandleSelectAgent}
						agentBar={panelAgentBar}
						inputAgentCtx={
							panelAgentSession
								? {
										name: panelAgentSession.agent.name,
										handle: panelAgentSession.agent.handle,
									}
								: null
						}
					/>
					<CodePanel
						isOpen={isCodePanelOpen}
						onClose={() => setIsCodePanelOpen(false)}
						target={codePanelTarget}
					/>
				</Box>
			</OpalVariationBuildProvider>
		</OpalPanelActionsProvider>
	);
}

function TemplateWrapper(props: any) {
	const pathname = usePathname();
	const isContentManager = pathname.includes("/cms/content");

	if (isContentManager) {
		return (
			<Suspense fallback={<Box p="24">Loading...</Box>}>
				<ContentManagerLayoutProvider>
					<FilterPanelProvider>
						<TemplateContent {...props} />
					</FilterPanelProvider>
				</ContentManagerLayoutProvider>
			</Suspense>
		);
	}

	return (
		<Suspense fallback={null}>
			<ContentManagerLayoutProvider>
				<TemplateContent {...props} />
			</ContentManagerLayoutProvider>
		</Suspense>
	);
}

export default function Template(props: any) {
	return (
		<LayoutProvider>
			<BrandToneProvider>
				<PreflightProvider>
					<ExperimentResultsProvider>
						<OpalContextProvider navigationStructure={props.structure}>
							<TemplateWrapper {...props} />
						</OpalContextProvider>
					</ExperimentResultsProvider>
				</PreflightProvider>
			</BrandToneProvider>
		</LayoutProvider>
	);
}
