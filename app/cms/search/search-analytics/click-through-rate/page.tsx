"use client";

import {Box, Menu, MenuTrigger, MenuContent, LabelMenuButton} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Button} from "@/app/components/Button";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
import {IconSearch, IconAlertCircle} from "@tabler/icons-react";
import {useState, useMemo} from "react";
import {ctrQueries, CTRQuery, scaleValue} from "@/app/db/analyticsData";
import {Table, Tr, Td, Th} from "@/app/components/Table";

const allData: CTRQuery[] = ctrQueries;

type TimeRange = "24h" | "7d" | "30d" | "90d";

export default function ClickThroughRatePage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [timeRange, setTimeRange] = useState<TimeRange>("7d");

	const timeRangeLabels = {
		"24h": "Last 24 hours",
		"7d": "Last 7 days",
		"30d": "Last 30 days",
		"90d": "Last 90 days",
	};

	const filteredData = useMemo(() => {
		let data = allData;

		// Filter by Time Range
		const dates = data.map((d) => new Date(d.lastSeen).getTime());
		const latestDate = dates.length > 0 ? Math.max(...dates) : Date.now();
		const now = new Date(latestDate);
		data = data
			.filter((item) => {
				const itemDate = new Date(item.lastSeen);
				const diffTime = Math.abs(now.getTime() - itemDate.getTime());
				const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

				switch (timeRange) {
					case "24h":
						return diffDays <= 1;
					case "7d":
						return diffDays <= 7;
					case "30d":
						return diffDays <= 30;
					case "90d":
						return diffDays <= 90;
					default:
						return true;
				}
			})
			.map((item) => ({
				...item,
				impressions: scaleValue(item.impressions, timeRange),
				clicks: scaleValue(item.clicks, timeRange),
			}));

		if (!searchQuery) return data;

		const query = searchQuery.toLowerCase();
		return data.filter((item) => item.query.toLowerCase().includes(query));
	}, [searchQuery, timeRange]);

	return (
		<Box>
			<Flex
				flexDirection="row"
				justifyContent="space-between"
				alignItems="center"
				gap="16"
				mb="24"
			>
				<Flex gap="8" flexDirection="row">
					<Input
						addonBefore={<IconSearch size={16} />}
						placeholder="Search queries..."
						style={{width: "320px"}}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<Menu
						options={[
							{label: "Last 24 hours", execute: () => setTimeRange("24h")},
							{label: "Last 7 days", execute: () => setTimeRange("7d")},
							{label: "Last 30 days", execute: () => setTimeRange("30d")},
							{label: "Last 90 days", execute: () => setTimeRange("90d")},
						]}
					>
						<MenuTrigger asChild>
							<LabelMenuButton label="Time Range">
								{timeRangeLabels[timeRange]}
							</LabelMenuButton>
						</MenuTrigger>
						<MenuContent />
					</Menu>
				</Flex>
			</Flex>

			<Table>
				<thead>
					<Tr>
						<Th>Query</Th>
						<Th>Impressions</Th>
						<Th>Clicks</Th>
						<Th>CTR</Th>
						<Th>Avg. Position</Th>
					</Tr>
				</thead>
				<tbody>
					{filteredData.map((row, i) => (
						<Tr key={i}>
							<Td type="header">{row.query}</Td>
							<Td>{row.impressions.toLocaleString()}</Td>
							<Td>{row.clicks.toLocaleString()}</Td>
							<Td>{row.ctr}%</Td>
							<Td>{row.position.toFixed(1)}</Td>
						</Tr>
					))}
				</tbody>
			</Table>
		</Box>
	);
}
