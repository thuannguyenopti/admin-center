"use client";

import type {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconPlus} from "@/app/lib/axiom-icons";
import {ToolRailButton} from "./ToolRailButton";
import type {ActiveTool} from "../config";

interface ToolMenuItem {
	key: ActiveTool;
	label: string;
	icon: IconDefinition;
	onClick: () => void;
}

export function ToolRail({
	toolMenuItems,
	activeTool,
	toolPaletteExpanded,
	setToolPaletteExpanded,
}: {
	toolMenuItems: ToolMenuItem[];
	activeTool: ActiveTool;
	toolPaletteExpanded: boolean;
	setToolPaletteExpanded: (expanded: boolean) => void;
}) {
	return (
		<div
			style={{
				position: "relative",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				paddingTop: 8,
			}}
		>
			<div
				style={{
					width: 60,
					borderRadius: 28,
					border: "1px solid var(--ax-colors-border-tertiary)",
					background: "var(--ax-colors-bg-default)",
					boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
					padding: "10px 10px 12px",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 12,
				}}
			>
				<button
					type="button"
					onClick={() => setToolPaletteExpanded(!toolPaletteExpanded)}
					aria-label={toolPaletteExpanded ? "Close tools menu" : "Open tools menu"}
					style={{
						height: 40,
						width: 40,
						borderRadius: 12,
						border: 0,
						background: "var(--ax-colors-fg-secondary)",
						color: "var(--ax-colors-fg-default-inverse)",
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						cursor: "pointer",
					}}
				>
					<IconPlus size={20} />
				</button>

				<div
					style={{
						width: 32,
						height: 1,
						background: "var(--ax-colors-border-tertiary)",
					}}
				/>

				{toolMenuItems.slice(0, 4).map((item, index) => (
					<div key={item.key} style={{display: "contents"}}>
						<ToolRailButton
							active={activeTool === item.key}
							onClick={item.onClick}
							label={item.label}
							icon={item.icon}
							expanded={false}
						/>
						{index === 2 ? (
							<div
								style={{
									width: 32,
									height: 1,
									background: "var(--ax-colors-border-tertiary)",
								}}
							/>
						) : null}
					</div>
				))}
			</div>

			{toolPaletteExpanded ? (
				<div
					style={{
						position: "absolute",
						top: 8,
						left: 72,
						width: 236,
						borderRadius: 18,
						border: "1px solid var(--ax-colors-border-tertiary)",
						background: "var(--ax-colors-bg-default)",
						boxShadow: "0 16px 36px rgba(15, 23, 42, 0.12)",
						padding: 12,
						zIndex: 20,
					}}
				>
					<div
						style={{
							height: 40,
							borderRadius: 10,
							background: "var(--ax-colors-fg-secondary)",
							color: "var(--ax-colors-fg-default-inverse)",
							display: "flex",
							alignItems: "center",
							gap: 10,
							padding: "0 14px",
							fontSize: 15,
							fontWeight: 600,
						}}
					>
						<IconPlus size={18} />
						New
					</div>
					<div
						style={{
							height: 1,
							background: "var(--ax-colors-border-tertiary)",
							margin: "12px 0 8px",
						}}
					/>
					<div style={{display: "grid", gap: 4}}>
						{toolMenuItems.map((item, index) => (
							<div key={item.key}>
								<button
									type="button"
									onClick={() => {
										item.onClick();
										setToolPaletteExpanded(false);
									}}
									style={{
										width: "100%",
										height: 40,
										border: 0,
										borderRadius: 10,
										background:
											activeTool === item.key
												? "var(--ax-colors-bg-default-pressed)"
												: "transparent",
										color:
											activeTool === item.key
												? "var(--ax-colors-fg-default)"
												: "var(--ax-colors-fg-secondary)",
										display: "flex",
										alignItems: "center",
										gap: 12,
										padding: "0 12px",
										cursor: "pointer",
										fontSize: 15,
										fontWeight: 500,
									}}
								>
									<FontAwesomeIcon
										icon={item.icon}
										style={{fontSize: 16, width: 18}}
									/>
									<span>{item.label}</span>
								</button>
								{index === 3 ? (
									<div
										style={{
											height: 1,
											background: "var(--ax-colors-border-tertiary)",
											margin: "8px 0 4px",
										}}
									/>
								) : null}
							</div>
						))}
					</div>
				</div>
			) : null}
		</div>
	);
}
