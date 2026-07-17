import {Box, Avatar} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {useState, CSSProperties} from "react";
import type {WorkloadCell, TeamMember} from "../types";
import {
	peopleColumnWidth,
	weekColumns,
	workloadCellMinWidth,
	workloadCellHeight,
	workloadGridMinWidth,
	groupedMonths,
} from "../constants";

export function WorkloadTabButton({
	active,
	children,
	onClick,
}: {
	active: boolean;
	children: string;
	onClick: () => void;
}) {
	return (
		<button
			onClick={onClick}
			style={{
				background: "transparent",
				border: 0,
				borderBottom: `2px solid ${active ? "var(--ax-colors-fg-default)" : "transparent"}`,
				cursor: "pointer",
				padding: "12px 8px",
			}}
			type="button"
		>
			<Text
				color={active ? "fg.default" : "fg.secondary"}
				fontSize="sm"
				fontWeight={active ? "500" : "400"}
			>
				{children}
			</Text>
		</button>
	);
}

export function WorkloadCellBox({
	cell,
	theme,
	active,
	onClick,
}: {
	cell: WorkloadCell;
	theme: "light" | "dark";
	active?: boolean;
	onClick?: () => void;
}) {
	const [isHovered, setIsHovered] = useState(false);

	const baseStyle: CSSProperties = {
		alignItems: "center",
		borderBottom: "1px solid var(--ax-colors-fg-white)",
		borderRight: "1px solid var(--ax-colors-fg-white)",
		display: "flex",
		height: workloadCellHeight,
		justifyContent: "center",
		padding: 24,
	};

	let backgroundColor = "var(--ax-colors-bg-secondary)";
	let backgroundImage: string | undefined;
	let textColor = "var(--ax-colors-fg-default)";

	if (cell.state === "over") {
		if (theme === "dark") {
			backgroundColor = isHovered ? "#4a2a2a" : "var(--ax-colors-bg-error-subtle)";
			textColor = "var(--ax-colors-fg-error)";
		} else {
			backgroundColor = isHovered ? "#e9c1c1" : "#f6d0d0";
			textColor = "#2e3442";
		}
	}

	if (cell.state === "under") {
		if (theme === "dark") {
			backgroundColor = isHovered ? "#294437" : "var(--ax-colors-bg-success-subtle)";
			textColor = "var(--ax-colors-fg-success)";
		} else {
			backgroundColor = isHovered ? "#b7d9b8" : "#c8e6c9";
			textColor = "#2e3442";
		}
	}

	if (cell.state === "pto") {
		backgroundColor =
			theme === "dark"
				? isHovered
					? "#434d5f"
					: "var(--ax-colors-bg-tertiary)"
				: isHovered
					? "#d5dceb"
					: "#DADFEB";
		backgroundImage =
			theme === "dark"
				? "repeating-linear-gradient(-63deg, rgba(255,255,255,0.30) 0 2px, rgba(255,255,255,0) 2px 16px)"
				: "repeating-linear-gradient(-63deg, rgba(255,255,255,0.30) 0 2px, rgba(255,255,255,0) 2px 16px)";
	}

	if (!cell.state || cell.state === "default") {
		backgroundColor = isHovered
			? "var(--ax-colors-bg-tertiary)"
			: "var(--ax-colors-bg-secondary)";
	}

	return (
		<button
			onClick={onClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			style={{
				background: "transparent",
				border: 0,
				cursor: onClick ? "pointer" : "default",
				display: "block",
				padding: 0,
				width: "100%",
			}}
			type="button"
		>
			<Box
				alignItems="center"
				display="flex"
				justifyContent="center"
				style={{
					...baseStyle,
					backgroundColor,
					backgroundImage,
					boxShadow: active
						? "inset 0 0 0 2px var(--ax-colors-border-default)"
						: undefined,
					transition: "background-color 120ms ease, box-shadow 120ms ease",
				}}
			>
				{cell.value !== null ? (
					<Text
						color="fg.default"
						fontSize="md"
						fontWeight="600"
						style={{color: textColor, maxWidth: "none"}}
					>
						{cell.value}
					</Text>
				) : null}
			</Box>
		</button>
	);
}

export function WorkloadGrid({
	rows,
	theme,
	selectedWeekIndex,
	selectedPersonId,
	onSelectCell,
}: {
	rows: TeamMember[];
	theme: "light" | "dark";
	selectedWeekIndex?: number;
	selectedPersonId?: string;
	onSelectCell: (personId: string, weekIndex: number) => void;
}) {
	const tableColumns = `${peopleColumnWidth}px repeat(${weekColumns.length}, minmax(${workloadCellMinWidth}px, 1fr))`;

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
				<Box
					style={{
						minWidth: workloadGridMinWidth,
						width: "100%",
					}}
				>
					<Box
						display="grid"
						style={{
							borderBottom: "1px solid var(--ax-colors-border-tertiary)",
							gridTemplateColumns: tableColumns,
						}}
					>
						<Box
							bg="bg.default"
							style={{
								left: 0,
								position: "sticky",
								zIndex: 4,
							}}
						/>
						{groupedMonths.map((month) => (
							<Box
								key={month.label}
								alignItems="center"
								bg="bg.default"
								display="flex"
								justifyContent="center"
								py="8"
								style={{
									borderLeft:
										month.label === "Jun"
											? "1px solid var(--ax-colors-border-tertiary)"
											: undefined,
									gridColumn: `span ${month.weeks}`,
								}}
							>
								<Text
									color="fg.secondary"
									fontSize="sm"
									style={{lineHeight: "16px", maxWidth: "none"}}
								>
									{month.label}
								</Text>
							</Box>
						))}
					</Box>

					<Box
						display="grid"
						style={{
							borderBottom: "1px solid var(--ax-colors-border-tertiary)",
							gridTemplateColumns: tableColumns,
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
								zIndex: 4,
							}}
						>
							<Text
								color="fg.secondary"
								fontSize="sm"
								style={{lineHeight: "20px", maxWidth: "none"}}
							>
								People
							</Text>
						</Box>
						{weekColumns.map((week, index) => (
							<Box
								key={`${week.month}-${week.label}`}
								alignItems="center"
								bg="bg.default"
								display="flex"
								justifyContent="center"
								py="8"
								style={{
									borderLeft:
										index === 0 || index === 4 || index === 8
											? "1px solid var(--ax-colors-border-tertiary)"
											: undefined,
									borderRight: "1px solid var(--ax-colors-border-tertiary)",
								}}
							>
								<Text
									color="fg.secondary"
									fontSize="sm"
									style={{lineHeight: "16px", maxWidth: "none"}}
								>
									{week.label}
								</Text>
							</Box>
						))}
					</Box>

					{rows.map((member) => (
						<Box
							key={member.id}
							display="grid"
							style={{gridTemplateColumns: tableColumns}}
						>
							<Box
								alignItems="center"
								bg="bg.default"
								display="flex"
								gap="12"
								px="12"
								py="12"
								style={{
									borderBottom: "1px solid var(--ax-colors-border-default)",
									borderRight: "1px solid var(--ax-colors-border-tertiary)",
									boxShadow:
										selectedPersonId === member.id
											? "inset 3px 0 0 var(--ax-colors-border-default)"
											: undefined,
									height: workloadCellHeight,
									left: 0,
									position: "sticky",
									zIndex: 3,
								}}
							>
								<Avatar name={member.name} size="md" src={member.avatarSrc} />
								<Box
									display="flex"
									flexDirection="column"
									style={{gap: 1, minWidth: 0}}
								>
									<Text
										color="fg.default"
										fontSize="md"
										fontWeight="600"
										style={{lineHeight: "24px"}}
										truncate
									>
										{member.name}
									</Text>
									<Text
										color="fg.secondary"
										fontSize="sm"
										style={{lineHeight: "18px"}}
										truncate
									>
										{member.role}
									</Text>
									<Text
										color="fg.tertiary"
										fontSize="sm"
										style={{lineHeight: "18px"}}
										truncate
									>
										{member.weeklyCapacity} · {member.timezone}
									</Text>
								</Box>
							</Box>

							{member.cells.map((cell, index) => (
								<WorkloadCellBox
									key={`${member.id}-${index}`}
									active={
										selectedPersonId === member.id &&
										selectedWeekIndex === index
									}
									cell={cell}
									onClick={() => onSelectCell(member.id, index)}
									theme={theme}
								/>
							))}
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	);
}
