"use client";

import {Box, Text} from "@optiaxiom/react";
import {IconTableCells} from "@optiaxiom/icons";

const CSV_HEADERS = ["Email", "First Name", "Last Name", "Company", "Lead Score", "Source"];
const CSV_ROWS = [
	["m.johnson@acme.com", "Marcus", "Johnson", "Acme Corp", "87", "Webinar"],
	["s.lee@brightco.io", "Sara", "Lee", "BrightCo", "74", "Organic"],
	["t.patel@novalabs.ai", "Tariq", "Patel", "Nova Labs", "91", "LinkedIn"],
	["c.nguyen@zipstream.net", "Clara", "Nguyen", "ZipStream", "62", "Email"],
	["r.smith@optiflow.com", "Ryan", "Smith", "OptiFlow", "83", "Paid Search"],
	["a.kim@devhub.io", "Amy", "Kim", "DevHub", "55", "Referral"],
];

export function CsvPreview() {
	return (
		<Box display="flex" flexDirection="column" style={{height: "100%", overflow: "hidden"}}>
			{/* Toolbar */}
			<Box
				display="flex"
				alignItems="center"
				gap="8"
				px="16"
				py="8"
				bg="bg.secondary"
				style={{borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0}}
			>
				<IconTableCells size={16} color="var(--ax-colors-fg-tertiary)" />
				<Text fontSize="xs" color="fg.secondary" fontWeight="500">
					Leads Export.csv
				</Text>
				<Text fontSize="xs" color="fg.tertiary">
					· {CSV_ROWS.length} rows · {CSV_HEADERS.length} columns
				</Text>
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
								}}
							/>
							{CSV_HEADERS.map((h) => (
								<th
									key={h}
									style={{
										padding: "8px 12px",
										borderBottom: "1px solid var(--ax-colors-border-secondary)",
										textAlign: "left",
										fontWeight: 600,
										color: "var(--ax-colors-fg-secondary)",
										whiteSpace: "nowrap",
									}}
								>
									{h}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{CSV_ROWS.map((row, ri) => (
							<tr
								key={ri}
								style={{
									borderBottom: "1px solid var(--ax-colors-border-tertiary)",
									background:
										ri % 2 === 0
											? "var(--ax-colors-bg-default)"
											: "var(--ax-colors-bg-secondary)",
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
											color: "var(--ax-colors-fg-default)",
											fontFamily:
												ci === 0
													? "var(--ax-fonts-mono, monospace)"
													: undefined,
											fontSize: ci === 0 ? 12 : 13,
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
			<Box
				px="16"
				py="8"
				bg="bg.secondary"
				style={{borderTop: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0}}
			>
				<Text fontSize="xs" color="fg.tertiary">
					UTF-8 · comma-separated · exported Apr 29
				</Text>
			</Box>
		</Box>
	);
}
