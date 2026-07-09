"use client";

import {Box, Text} from "@optiaxiom/react";
import {IconTableCells} from "@optiaxiom/icons";

const SHEET_HEADERS = ["Campaign", "Channel", "Budget", "Spent", "Remaining", "ROI"];
const SHEET_ROWS = [
	["Q1 Brand Awareness", "Paid Social", "$48,000", "$44,200", "$3,800", "3.2×"],
	["SEO Content Push", "Organic", "$12,000", "$11,800", "$200", "8.7×"],
	["Email Re-engagement", "Email", "$6,500", "$6,500", "$0", "11.4×"],
	["LinkedIn Sponsored", "Paid Social", "$22,000", "$19,400", "$2,600", "2.1×"],
	["Webinar Series", "Events", "$15,000", "$13,200", "$1,800", "5.6×"],
	["Retargeting", "Display", "$9,000", "$8,750", "$250", "4.0×"],
];

export function SpreadsheetPreview() {
	return (
		<Box display="flex" flexDirection="column" style={{height: "100%", overflow: "hidden"}}>
			{/* Sheet tab bar */}
			<Box
				display="flex"
				alignItems="center"
				gap="2"
				px="16"
				pt="12"
				pb="0"
				bg="bg.secondary"
				style={{borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0}}
			>
				{["Q1 Budget", "Q2 Forecast", "YTD Summary"].map((tab, i) => (
					<Box
						key={tab}
						px="12"
						py="6"
						style={{
							borderRadius: "6px 6px 0 0",
							background: i === 0 ? "var(--ax-colors-bg-default)" : "transparent",
							border:
								i === 0 ? "1px solid var(--ax-colors-border-secondary)" : "none",
							borderBottom:
								i === 0 ? "1px solid var(--ax-colors-bg-default)" : "none",
							cursor: "pointer",
							marginBottom: i === 0 ? -1 : 0,
						}}
					>
						<Text
							fontSize="xs"
							fontWeight={i === 0 ? "500" : "400"}
							color={i === 0 ? "fg.default" : "fg.tertiary"}
						>
							{tab}
						</Text>
					</Box>
				))}
			</Box>

			{/* Table */}
			<Box style={{flex: 1, overflowY: "auto"}}>
				<table style={{width: "100%", borderCollapse: "collapse", fontSize: 13}}>
					<thead>
						<tr
							style={{
								background: "var(--ax-colors-bg-secondary)",
								position: "sticky",
								top: 0,
								zIndex: 1,
							}}
						>
							<th
								style={{
									width: 32,
									padding: "8px 12px",
									borderBottom: "1px solid var(--ax-colors-border-secondary)",
									textAlign: "center",
								}}
							>
								<Text fontSize="xs" color="fg.tertiary">
									#
								</Text>
							</th>
							{SHEET_HEADERS.map((h) => (
								<th
									key={h}
									style={{
										padding: "8px 12px",
										borderBottom: "1px solid var(--ax-colors-border-secondary)",
										textAlign: "left",
										fontWeight: 600,
										color: "var(--ax-colors-fg-secondary)",
									}}
								>
									{h}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{SHEET_ROWS.map((row, ri) => (
							<tr
								key={ri}
								style={{
									background:
										ri % 2 === 0
											? "var(--ax-colors-bg-default)"
											: "var(--ax-colors-bg-secondary)",
									borderBottom: "1px solid var(--ax-colors-border-tertiary)",
								}}
							>
								<td
									style={{
										padding: "7px 12px",
										textAlign: "center",
										color: "var(--ax-colors-fg-tertiary)",
										fontSize: 11,
									}}
								>
									{ri + 1}
								</td>
								{row.map((cell, ci) => (
									<td
										key={ci}
										style={{
											padding: "7px 12px",
											color:
												ci === 5
													? "var(--ax-colors-fg-success)"
													: "var(--ax-colors-fg-default)",
											fontWeight: ci === 5 ? 600 : 400,
										}}
									>
										{cell}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</Box>

			{/* Footer */}
			<Box
				display="flex"
				alignItems="center"
				gap="8"
				px="16"
				py="8"
				bg="bg.secondary"
				style={{borderTop: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0}}
			>
				<IconTableCells size={16} color="var(--ax-colors-fg-tertiary)" />
				<Text fontSize="xs" color="fg.tertiary">
					6 rows · Last edited Apr 29 by Jamie Chen
				</Text>
			</Box>
		</Box>
	);
}
