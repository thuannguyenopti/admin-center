import {Box, Avatar} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {
	useState,
	useEffect,
	useRef,
	DragEvent,
	MouseEvent as ReactMouseEvent,
	CSSProperties,
} from "react";
import type {PlannerCard, PlannerInteraction, WeekColumn, PlannerPerson} from "../types";
import {
	plannerPalette,
	plannerPeopleColumnDefaultWidth,
	plannerPeopleColumnMinWidth,
	plannerPeopleColumnMaxWidth,
	plannerDayMinWidth,
	plannerLaneHeight,
	plannerCellInset,
	fullTimelineDays,
} from "../constants";
import {
	getPlannerBadgeStyle,
	getPlannerStatusLabel,
	getPlannerAccentColor,
	isPlannerCardPlacementValid,
	canPlaceCardInLane,
	normalizePlannerCardLanes,
	packVisiblePlannerCards,
	getAvailableLane,
	getUtilizationPercentForRange,
	isPlannerDayOverloaded,
} from "../utils";
import {plannerPeople, generatePlannerBlocksFromTargets} from "../mockData";

const plannerBlocks = generatePlannerBlocksFromTargets();

export function PlannerCardTile({
	card,
	dragged,
	theme,
	showStartHandle,
	showEndHandle,
	onMouseDown,
	onResizeHandleMouseDown,
	onDragStart,
	onDragEnd,
}: {
	card: PlannerCard;
	dragged: boolean;
	theme: "light" | "dark";
	showStartHandle: boolean;
	showEndHandle: boolean;
	onMouseDown: (cardId: string) => void;
	onResizeHandleMouseDown: (
		event: ReactMouseEvent<HTMLDivElement>,
		cardId: string,
		edge: "start" | "end"
	) => void;
	onDragStart: (event: DragEvent<HTMLDivElement>, cardId: string) => void;
	onDragEnd: () => void;
}) {
	const badgeStyle = getPlannerBadgeStyle(card.status, theme);
	const isComplete = card.status === "done";
	const palette = plannerPalette[theme];
	const clippedDuration =
		"clippedDuration" in card
			? (card as PlannerCard & {clippedDuration: number}).clippedDuration
			: card.duration;
	const isCompactCard = clippedDuration <= 1;

	return (
		<div
			draggable={card.draggable !== false}
			onMouseDown={() => {
				if (card.draggable !== false) {
					onMouseDown(card.id);
				}
			}}
			onDragStart={(event) => onDragStart(event, card.id)}
			onDragEnd={onDragEnd}
			style={
				{
					backgroundColor: palette.cardBackground,
					border: "0",
					borderLeft: `3px solid ${getPlannerAccentColor(card.accent, theme)}`,
					borderRadius: 8,
					boxShadow: dragged
						? "0 18px 34px rgba(15, 23, 42, 0.20)"
						: "0 1px 2px rgba(16, 24, 40, 0.08)",
					cursor: card.draggable === false ? "default" : "grab",
					display: "flex",
					height: "100%",
					alignItems: "center",
					justifyContent: "space-between",
					opacity: isComplete ? 0.5 : dragged ? 0.84 : 1,
					overflow: "hidden",
					padding: "8px 12px",
					position: "relative",
					transform: dragged ? "scale(1.01)" : undefined,
					transition: "box-shadow 120ms ease, opacity 120ms ease, transform 120ms ease",
					userSelect: "none",
					WebkitUserDrag: card.draggable !== false ? "element" : "none",
					width: "100%",
				} as CSSProperties
			}
		>
			{showStartHandle ? (
				<div
					onMouseDown={(event) => {
						event.stopPropagation();
						event.preventDefault();
						onResizeHandleMouseDown(event, card.id, "start");
					}}
					style={{
						bottom: 0,
						cursor: "ew-resize",
						left: 0,
						position: "absolute",
						top: 0,
						width: 10,
						zIndex: 3,
					}}
				/>
			) : null}
			{showEndHandle ? (
				<div
					onMouseDown={(event) => {
						event.stopPropagation();
						event.preventDefault();
						onResizeHandleMouseDown(event, card.id, "end");
					}}
					style={{
						bottom: 0,
						cursor: "ew-resize",
						position: "absolute",
						right: 0,
						top: 0,
						width: 10,
						zIndex: 3,
					}}
				/>
			) : null}
			<Box
				alignItems="center"
				display="grid"
				style={{
					alignItems: "center",
					columnGap: isCompactCard ? 8 : 12,
					flex: 1,
					gridTemplateColumns: "minmax(0, 1fr) auto",
					minWidth: 0,
				}}
			>
				<Box display="flex" flexDirection="column" style={{flex: 1, gap: 2, minWidth: 0}}>
					<Text
						fontSize="sm"
						fontWeight="600"
						style={{
							color: palette.cardText,
							lineHeight: "20px",
							maxWidth: "none",
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{card.title}
					</Text>
					<Text
						fontSize="xs"
						style={{
							color: palette.cardSubtext,
							lineHeight: "16px",
							maxWidth: "none",
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{card.taskId} · {card.subtitle}
					</Text>
				</Box>

				<Box
					alignItems="end"
					display="flex"
					flexDirection="column"
					style={{flexShrink: 0, gap: 6, minWidth: isCompactCard ? 66 : 74}}
				>
					<Box
						alignItems="center"
						display="inline-flex"
						justifyContent="center"
						rounded="full"
						style={{
							...badgeStyle,
							flexShrink: 0,
							fontSize: 11,
							fontWeight: 500,
							lineHeight: "14px",
							padding: "3px 10px",
							whiteSpace: "nowrap",
						}}
					>
						{getPlannerStatusLabel(card.status)}
					</Box>
					<Text
						fontSize="xs"
						fontWeight="600"
						style={{color: palette.cardText, lineHeight: "16px", maxWidth: "none"}}
					>
						{card.hoursPerDay}h/day
					</Text>
				</Box>
			</Box>
		</div>
	);
}

export function PlannerGrid({
	cards,
	setCards,
	theme,
	visibleWeeks,
	selectedPersonId,
}: {
	cards: PlannerCard[];
	setCards: React.Dispatch<React.SetStateAction<PlannerCard[]>>;
	theme: "light" | "dark";
	visibleWeeks: WeekColumn[];
	selectedPersonId?: string;
}) {
	const [interaction, setInteraction] = useState<PlannerInteraction | null>(null);
	const [hoveredDropTarget, setHoveredDropTarget] = useState<string | null>(null);
	const [plannerPeopleColumnWidth, setPlannerPeopleColumnWidth] = useState(
		plannerPeopleColumnDefaultWidth
	);
	const [resizeState, setResizeState] = useState<{
		startWidth: number;
		startX: number;
	} | null>(null);
	const dragPreviewRef = useRef<HTMLDivElement | null>(null);
	const plannerContentRef = useRef<HTMLDivElement | null>(null);
	const activeCard = cards.find((card) => card.id === interaction?.cardId) ?? null;
	const interactionMode = interaction?.mode ?? null;
	const visibleRangeStartDay = visibleWeeks[0]?.startDay ?? 0;
	const visibleRangeEndDay =
		visibleWeeks[visibleWeeks.length - 1]?.startDay +
		(visibleWeeks[visibleWeeks.length - 1]?.duration ?? 1) -
		1;
	const visiblePlannerDays = fullTimelineDays.slice(visibleRangeStartDay, visibleRangeEndDay + 1);
	const dayColumnTemplate = `repeat(${visiblePlannerDays.length}, minmax(${plannerDayMinWidth}px, 1fr))`;
	const plannerGridMinWidth =
		plannerPeopleColumnWidth + visiblePlannerDays.length * plannerDayMinWidth;
	const effectiveCards = cards.map((card) =>
		interaction?.cardId === card.id &&
		(interactionMode === "resize-start" || interactionMode === "resize-end")
			? {
					...card,
					startDay: interaction.draftStartDay ?? card.startDay,
					duration: interaction.draftDuration ?? card.duration,
				}
			: card
	);

	useEffect(() => {
		if (!resizeState) {
			return undefined;
		}

		const handlePointerMove = (event: MouseEvent) => {
			const nextWidth = resizeState.startWidth + event.clientX - resizeState.startX;
			setPlannerPeopleColumnWidth(
				Math.min(
					plannerPeopleColumnMaxWidth,
					Math.max(plannerPeopleColumnMinWidth, nextWidth)
				)
			);
		};

		const handlePointerUp = () => {
			setResizeState(null);
		};

		window.addEventListener("mousemove", handlePointerMove);
		window.addEventListener("mouseup", handlePointerUp);

		return () => {
			window.removeEventListener("mousemove", handlePointerMove);
			window.removeEventListener("mouseup", handlePointerUp);
		};
	}, [resizeState]);

	useEffect(() => {
		if (!interaction || interaction.mode !== "move") {
			return undefined;
		}

		const handleMouseUp = () => {
			window.setTimeout(() => {
				setInteraction(null);
				setHoveredDropTarget(null);
			}, 0);
		};

		window.addEventListener("mouseup", handleMouseUp);

		return () => {
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [interaction]);

	useEffect(() => {
		if (
			!interaction ||
			!activeCard ||
			(interaction.mode !== "resize-start" && interaction.mode !== "resize-end") ||
			interaction.startX === undefined ||
			interaction.originStartDay === undefined ||
			interaction.originEndDay === undefined
		) {
			return undefined;
		}

		const handleMouseMove = (event: MouseEvent) => {
			const timelineWidth = plannerContentRef.current
				? plannerContentRef.current.clientWidth - plannerPeopleColumnWidth
				: plannerDayMinWidth * visiblePlannerDays.length;
			const dayWidth = timelineWidth / visiblePlannerDays.length;
			const deltaDays = Math.round((event.clientX - interaction.startX!) / dayWidth);
			let nextStartDay = interaction.originStartDay!;
			let nextEndDay = interaction.originEndDay!;

			if (interaction.mode === "resize-start") {
				nextStartDay = Math.max(
					visibleRangeStartDay,
					Math.min(interaction.originEndDay!, interaction.originStartDay! + deltaDays)
				);
			} else {
				nextEndDay = Math.min(
					visibleRangeEndDay,
					Math.max(interaction.originStartDay!, interaction.originEndDay! + deltaDays)
				);
			}

			const nextDuration = nextEndDay - nextStartDay + 1;
			const isValid =
				isPlannerCardPlacementValid(
					activeCard,
					nextStartDay,
					nextDuration,
					visibleRangeStartDay,
					visibleRangeEndDay
				) &&
				canPlaceCardInLane(
					cards,
					activeCard.assigneeId,
					activeCard.lane,
					nextStartDay,
					nextDuration,
					activeCard.id
				);

			setInteraction((current) =>
				current
					? {
							...current,
							draftDuration: nextDuration,
							draftStartDay: nextStartDay,
							valid: isValid,
						}
					: current
			);
		};

		const handleMouseUp = () => {
			const nextStartDay = interaction.draftStartDay ?? interaction.originStartDay!;
			const nextDuration =
				interaction.draftDuration ?? interaction.originDuration ?? activeCard.duration;
			const isValid = interaction.valid ?? false;

			if (isValid) {
				setCards((currentCards) =>
					normalizePlannerCardLanes(
						currentCards.map((card) =>
							card.id === activeCard.id
								? {
										...card,
										startDay: nextStartDay,
										duration: nextDuration,
									}
								: card
						)
					)
				);
			}

			setInteraction(null);
			setHoveredDropTarget(null);
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [
		activeCard,
		cards,
		interaction,
		plannerPeopleColumnWidth,
		visiblePlannerDays.length,
		visibleRangeEndDay,
		visibleRangeStartDay,
	]);

	const getVisiblePersonCards = (assigneeId: string) =>
		packVisiblePlannerCards(
			effectiveCards.filter((card) => card.assigneeId === assigneeId),
			visibleRangeStartDay,
			visibleRangeEndDay
		);

	const getPersonLaneCount = (assigneeId: string) => {
		const visiblePersonCards = getVisiblePersonCards(assigneeId);
		const maxLane = visiblePersonCards.reduce(
			(highest, card) => Math.max(highest, card.localLane),
			-1
		);

		return Math.max(1, maxLane + 1 + (interactionMode === "move" && activeCard ? 1 : 0));
	};

	const getPersonRowHeight = (laneCount: number) => plannerLaneHeight * laneCount;

	const handleResizeStart = (event: ReactMouseEvent<HTMLDivElement>) => {
		event.preventDefault();
		setResizeState({
			startWidth: plannerPeopleColumnWidth,
			startX: event.clientX,
		});
	};

	const handleMoveStart = (cardId: string) => {
		setInteraction({cardId, mode: "move"});
		setHoveredDropTarget(null);
	};

	const handleResizeHandleMouseDown = (
		event: ReactMouseEvent<HTMLDivElement>,
		cardId: string,
		edge: "start" | "end"
	) => {
		const card = cards.find((item) => item.id === cardId);
		if (!card) {
			return;
		}

		setInteraction({
			cardId,
			mode: edge === "start" ? "resize-start" : "resize-end",
			originDuration: card.duration,
			originStartDay: card.startDay,
			originEndDay: card.startDay + card.duration - 1,
			startX: event.clientX,
			draftDuration: card.duration,
			draftStartDay: card.startDay,
			valid: true,
		});
		setHoveredDropTarget(null);
	};

	const handleDragStart = (event: DragEvent<HTMLDivElement>, cardId: string) => {
		const dragCard = cards.find((card) => card.id === cardId);
		event.dataTransfer.effectAllowed = "move";
		event.dataTransfer.setData("text/plain", cardId);
		event.dataTransfer.setData("text", cardId);
		setInteraction({cardId, mode: "move"});
		setHoveredDropTarget(null);

		if (dragCard) {
			const preview = document.createElement("div");
			const palette = plannerPalette[theme];
			preview.style.background = palette.cardBackground;
			preview.style.borderLeft = `3px solid ${getPlannerAccentColor(dragCard.accent, theme)}`;
			preview.style.borderRadius = "8px";
			preview.style.boxShadow = "0 18px 34px rgba(15, 23, 42, 0.20)";
			preview.style.color = palette.cardText;
			preview.style.display = "flex";
			preview.style.alignItems = "center";
			preview.style.justifyContent = "space-between";
			preview.style.gap = "12px";
			preview.style.padding = "8px 12px";
			preview.style.pointerEvents = "none";
			preview.style.position = "fixed";
			preview.style.top = "-9999px";
			preview.style.left = "-9999px";
			preview.style.width = `${Math.max(200, dragCard.duration * plannerDayMinWidth - plannerCellInset * 2)}px`;
			preview.style.zIndex = "9999";
			preview.innerHTML = `
				<div style="display:flex; flex-direction:column; min-width:0; gap:2px; flex:1;">
					<div style="font-size:14px; font-weight:600; line-height:20px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${dragCard.title}</div>
					<div style="font-size:12px; line-height:16px; color:${palette.cardSubtext}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${dragCard.taskId} · ${dragCard.subtitle}</div>
				</div>
				<div style="font-size:12px; font-weight:600; line-height:16px; white-space:nowrap; margin-left:12px;">${dragCard.hoursPerDay}h/day</div>
			`;
			document.body.appendChild(preview);
			dragPreviewRef.current = preview;
			event.dataTransfer.setDragImage(preview, 24, 20);
			window.setTimeout(() => {
				preview.remove();
				if (dragPreviewRef.current === preview) {
					dragPreviewRef.current = null;
				}
			}, 0);
		}
	};

	const handleDragEnd = () => {
		setInteraction(null);
		setHoveredDropTarget(null);
		if (dragPreviewRef.current) {
			dragPreviewRef.current.remove();
			dragPreviewRef.current = null;
		}
	};

	const handleDrop = (
		assigneeId: string,
		startDay: number,
		lane: number | null,
		isValid: boolean
	) => {
		if (!activeCard || lane === null || !isValid) {
			setInteraction(null);
			setHoveredDropTarget(null);
			return;
		}

		setCards((currentCards) =>
			normalizePlannerCardLanes(
				currentCards.map((card) =>
					card.id === activeCard.id
						? {
								...card,
								assigneeId,
								startDay,
								lane,
							}
						: card
				)
			)
		);

		setInteraction(null);
		setHoveredDropTarget(null);
	};

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			rounded="lg"
			overflow="hidden"
			w="full"
			style={{height: "100%", minHeight: 0}}
		>
			<Box overflow="auto" w="full" flex="1" style={{minHeight: 0}}>
				<Box ref={plannerContentRef} style={{minWidth: plannerGridMinWidth, width: "100%"}}>
					<Box
						display="grid"
						style={{
							borderBottom: "1px solid var(--ax-colors-border-tertiary)",
							gridTemplateColumns: `${plannerPeopleColumnWidth}px minmax(0, 1fr)`,
						}}
					>
						<Box
							alignItems="center"
							bg="bg.secondary"
							display="flex"
							px="20"
							py="12"
							style={{
								borderRight: "1px solid var(--ax-colors-border-tertiary)",
								left: 0,
								position: "sticky",
								zIndex: 5,
							}}
						>
							<Text
								color="fg.secondary"
								fontSize="sm"
								style={{lineHeight: "20px", maxWidth: "none"}}
							>
								People
							</Text>
							<div
								aria-label="Resize people column"
								onDoubleClick={() =>
									setPlannerPeopleColumnWidth(plannerPeopleColumnDefaultWidth)
								}
								onMouseDown={handleResizeStart}
								role="separator"
								style={{
									bottom: 0,
									cursor: "col-resize",
									position: "absolute",
									right: -4,
									top: 0,
									width: 8,
									zIndex: 4,
								}}
							>
								<div
									style={{
										backgroundColor: resizeState
											? "var(--ax-colors-border-default)"
											: "var(--ax-colors-border-tertiary)",
										borderRadius: 999,
										height: 40,
										left: "50%",
										position: "absolute",
										top: "50%",
										transform: "translate(-50%, -50%)",
										width: 2,
									}}
								/>
							</div>
						</Box>

						<Box
							bg="bg.default"
							display="grid"
							style={{
								gridTemplateColumns: dayColumnTemplate,
							}}
						>
							{visiblePlannerDays.map((day, index) => (
								<Box
									key={day.id}
									alignItems="center"
									display="flex"
									justifyContent="center"
									py="10"
									style={{
										borderRight:
											index === visiblePlannerDays.length - 1
												? undefined
												: "1px solid var(--ax-colors-border-tertiary)",
										gap: 6,
									}}
								>
									<Text
										color="fg.tertiary"
										fontSize="xs"
										style={{lineHeight: "16px", maxWidth: "none"}}
									>
										{day.dayLabel}
									</Text>
									{day.isToday ? (
										<Box
											alignItems="center"
											bg="bg.accent"
											display="inline-flex"
											justifyContent="center"
											rounded="full"
											style={{minWidth: 42, padding: "2px 10px"}}
										>
											<Text
												color="fg.white"
												fontSize="xs"
												fontWeight="600"
												style={{lineHeight: "16px", maxWidth: "none"}}
											>
												{day.dateLabel}
											</Text>
										</Box>
									) : (
										<Text
											color="fg.secondary"
											fontSize="sm"
											style={{lineHeight: "16px", maxWidth: "none"}}
										>
											{day.dateLabel}
										</Text>
									)}
								</Box>
							))}
						</Box>
					</Box>

					{plannerPeople.map((person) => {
						const personCards = getVisiblePersonCards(person.id);
						const utilization = getUtilizationPercentForRange(
							person,
							cards,
							visibleRangeStartDay,
							visiblePlannerDays.length
						);
						const overCapacity = !person.isTeam && utilization > 100;
						const laneCount = getPersonLaneCount(person.id);
						const rowHeight = getPersonRowHeight(laneCount);

						return (
							<Box
								key={person.id}
								display="grid"
								style={{
									gridTemplateColumns: `${plannerPeopleColumnWidth}px minmax(0, 1fr)`,
								}}
							>
								<Box
									alignItems={laneCount > 1 ? "start" : "center"}
									bg="bg.default"
									display="flex"
									gap="12"
									px="8"
									py="8"
									style={{
										backgroundColor:
											selectedPersonId === person.id
												? "var(--ax-colors-bg-secondary)"
												: undefined,
										borderBottom: "1px solid var(--ax-colors-border-tertiary)",
										borderRight: "1px solid var(--ax-colors-border-tertiary)",
										left: 0,
										height: rowHeight,
										overflow: "hidden",
										position: "sticky",
										zIndex: 5,
									}}
								>
									{person.isTeam ? (
										<Box
											alignItems="center"
											bg="bg.secondary"
											display="flex"
											justifyContent="center"
											rounded="full"
											style={{flexShrink: 0, height: 32, width: 32}}
										>
											<Text
												color="fg.secondary"
												fontSize="xs"
												fontWeight="600"
												style={{maxWidth: "none"}}
											>
												TA
											</Text>
										</Box>
									) : (
										<Avatar
											name={person.name}
											size="sm"
											src={person.avatarSrc}
											style={{flexShrink: 0, height: 32, width: 32}}
										/>
									)}

									<Box
										display="flex"
										flexDirection="column"
										style={{flex: 1, gap: 2, minWidth: 0}}
									>
										<Box
											alignItems="center"
											display="flex"
											gap="8"
											justifyContent="space-between"
										>
											<Text
												color="fg.default"
												fontSize="md"
												fontWeight="600"
												style={{lineHeight: "24px"}}
												truncate
											>
												{person.name}
											</Text>
											<Box
												alignItems="center"
												display="inline-flex"
												justifyContent="center"
												rounded="full"
												style={{
													backgroundColor: overCapacity
														? "var(--ax-colors-bg-error-subtle)"
														: "var(--ax-colors-bg-secondary)",
													color: overCapacity
														? "var(--ax-colors-fg-error)"
														: "var(--ax-colors-fg-secondary)",
													flexShrink: 0,
													fontSize: 12,
													fontWeight: 500,
													lineHeight: "16px",
													padding: "2px 8px",
												}}
											>
												{utilization}%
											</Box>
										</Box>
										<Text
											color="fg.secondary"
											fontSize="sm"
											style={{lineHeight: "18px"}}
											truncate
										>
											{person.role}
										</Text>
										<Text
											color="fg.tertiary"
											fontSize="xs"
											style={{lineHeight: "16px"}}
											truncate
										>
											{person.weeklyCapacity}
											{person.timezone ? ` · ${person.timezone}` : ""}
										</Text>
									</Box>
								</Box>

								<Box
									bg="bg.default"
									style={{
										borderBottom: "1px solid var(--ax-colors-border-tertiary)",
										height: rowHeight,
										position: "relative",
									}}
								>
									<Box
										display="grid"
										style={{
											gridTemplateColumns: dayColumnTemplate,
											height: "100%",
											position: "absolute",
											inset: 0,
										}}
									>
										{visiblePlannerDays.map((day, dayIndex) => {
											const globalDayIndex = visibleRangeStartDay + dayIndex;
											const block = plannerBlocks.find(
												(item) =>
													item.assigneeId === person.id &&
													globalDayIndex >= item.startDay &&
													globalDayIndex < item.startDay + item.duration
											);
											const isBlockStart = block
												? globalDayIndex === block.startDay
												: false;
											const isOverloaded = isPlannerDayOverloaded(
												person,
												globalDayIndex,
												cards
											);

											return (
												<Box
													key={`${person.id}-${day.id}`}
													bg="bg.secondary"
													style={{
														backgroundColor: isOverloaded
															? plannerPalette[theme]
																	.overloadBackground
															: block
																? theme === "dark"
																	? "#2a3142"
																	: "#DADFEB"
																: "var(--ax-colors-bg-secondary)",
														backgroundImage: block
															? theme === "dark"
																? "repeating-linear-gradient(-63deg, rgba(255,255,255,0.30) 0 2px, rgba(255,255,255,0) 2px 16px)"
																: "repeating-linear-gradient(-63deg, rgba(255,255,255,0.30) 0 2px, rgba(255,255,255,0) 2px 16px)"
															: undefined,
														borderRight:
															dayIndex ===
															visiblePlannerDays.length - 1
																? undefined
																: "1px solid var(--ax-colors-border-tertiary)",
														borderRadius: block ? 0 : undefined,
														padding: block ? "4px 8px" : 0,
													}}
												>
													{block && isBlockStart ? (
														<Box
															display="flex"
															flexDirection="column"
															style={{
																alignItems: "flex-start",
																gap: 10,
																justifyContent: "center",
															}}
														>
															<Text
																color="fg.tertiary"
																fontSize="xs"
																fontWeight="500"
																style={{lineHeight: "14px"}}
															>
																{block.label}
															</Text>
															{block.description ? (
																<Text
																	color="fg.tertiary"
																	fontSize="xs"
																	style={{lineHeight: "14px"}}
																>
																	{block.description}
																</Text>
															) : null}
														</Box>
													) : null}
												</Box>
											);
										})}
									</Box>

									<Box
										style={{
											display: "grid",
											gridTemplateColumns: dayColumnTemplate,
											gridTemplateRows: `repeat(${laneCount}, ${plannerLaneHeight}px)`,
											inset: 0,
											position: "absolute",
										}}
									>
										{activeCard && interactionMode === "move"
											? plannerPeople.flatMap((slotPerson) =>
													visiblePlannerDays.map((day, localDayIndex) => {
														const startDay =
															visibleRangeStartDay + localDayIndex;
														const lane = getAvailableLane(
															cards,
															slotPerson.id,
															startDay,
															activeCard.duration,
															activeCard.id
														);
														if (lane === null) {
															return null;
														}

														const isValid = isPlannerCardPlacementValid(
															activeCard,
															startDay,
															activeCard.duration,
															visibleRangeStartDay,
															visibleRangeEndDay
														);
														const dropKey = `${slotPerson.id}-${startDay}-${lane}`;
														const isHovered =
															hoveredDropTarget === dropKey;
														return (
															<div
																key={`${slotPerson.id}-${startDay}`}
																onDragEnter={() => {
																	if (
																		slotPerson.id === person.id
																	) {
																		setHoveredDropTarget(
																			dropKey
																		);
																	}
																}}
																onDragLeave={() => {
																	if (
																		hoveredDropTarget ===
																		dropKey
																	) {
																		setHoveredDropTarget(null);
																	}
																}}
																onMouseEnter={() => {
																	if (
																		slotPerson.id ===
																			person.id &&
																		activeCard
																	) {
																		setHoveredDropTarget(
																			dropKey
																		);
																	}
																}}
																onMouseLeave={() => {
																	if (
																		hoveredDropTarget ===
																		dropKey
																	) {
																		setHoveredDropTarget(null);
																	}
																}}
																onMouseUp={(event) => {
																	event.preventDefault();
																	if (
																		slotPerson.id === person.id
																	) {
																		handleDrop(
																			slotPerson.id,
																			startDay,
																			lane,
																			isValid
																		);
																	}
																}}
																onDragOver={(event) => {
																	event.preventDefault();
																	event.dataTransfer.dropEffect =
																		isValid ? "move" : "none";
																}}
																onDrop={(event) => {
																	event.preventDefault();
																	if (
																		slotPerson.id === person.id
																	) {
																		handleDrop(
																			slotPerson.id,
																			startDay,
																			lane,
																			isValid
																		);
																	}
																}}
																style={{
																	display:
																		slotPerson.id === person.id
																			? "block"
																			: "none",
																	gridColumn: `${localDayIndex + 1} / span ${activeCard.duration}`,
																	gridRow: `${lane + 1}`,
																	padding: plannerCellInset,
																	pointerEvents:
																		slotPerson.id === person.id
																			? "auto"
																			: "none",
																	zIndex: 1,
																}}
															>
																<div
																	style={{
																		backgroundColor: isValid
																			? isHovered
																				? plannerPalette[
																						theme
																					]
																						.dropValidHoverBackground
																				: plannerPalette[
																						theme
																					]
																						.dropValidBackground
																			: isHovered
																				? plannerPalette[
																						theme
																					]
																						.dropInvalidHoverBackground
																				: plannerPalette[
																						theme
																					]
																						.dropInvalidBackground,
																		border: `1.5px dashed ${
																			isValid
																				? plannerPalette[
																						theme
																					]
																						.dropValidBorder
																				: plannerPalette[
																						theme
																					]
																						.dropInvalidBorder
																		}`,
																		borderRadius: 8,
																		boxShadow: isHovered
																			? isValid
																				? "inset 0 0 0 1px rgba(255,255,255,0.24), 0 0 0 1px rgba(61, 99, 245, 0.10)"
																				: "inset 0 0 0 1px rgba(255,255,255,0.18), 0 0 0 1px rgba(226, 87, 87, 0.10)"
																			: isValid
																				? "inset 0 0 0 1px rgba(255,255,255,0.20)"
																				: "inset 0 0 0 1px rgba(255,255,255,0.14)",
																		height: "100%",
																		transition:
																			"background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease",
																		width: "100%",
																	}}
																/>
															</div>
														);
													})
												)
											: null}

										{personCards.map((card) => {
											return (
												<div
													key={card.id}
													style={{
														alignItems: "center",
														display: "flex",
														gridColumn: `${
															card.visibleStartDay -
															visibleRangeStartDay +
															1
														} / span ${card.clippedDuration}`,
														gridRow: `${card.localLane + 1}`,
														height: "100%",
														padding: plannerCellInset,
														position: "relative",
														zIndex: 2,
													}}
												>
													<PlannerCardTile
														card={card}
														dragged={interaction?.cardId === card.id}
														theme={theme}
														showEndHandle={card.showEndHandle}
														showStartHandle={card.showStartHandle}
														onMouseDown={handleMoveStart}
														onResizeHandleMouseDown={
															handleResizeHandleMouseDown
														}
														onDragEnd={handleDragEnd}
														onDragStart={handleDragStart}
													/>
												</div>
											);
										})}
									</Box>
								</Box>
							</Box>
						);
					})}
				</Box>
			</Box>
		</Box>
	);
}
