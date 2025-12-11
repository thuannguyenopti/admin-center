"use client";

import {Box, Badge, Menu, MenuTrigger, LabelMenuButton, MenuContent} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
import {IconSearch, IconArrowRight} from "@tabler/icons-react";
import {useState, useMemo} from "react";
import {reformulationQueries, ReformulationQuery, scaleValue} from "@/app/db/analyticsData";
import {Table, Tr, Td, Th} from "@/app/components/Table";

const allData: ReformulationQuery[] = reformulationQueries;

const timeRangeLabels: Record<string, string> = {
	"24h": "Last 24 hours",
	"7d": "Last 7 days",
	"30d": "Last 30 days",
	"90d": "Last 90 days",
};

export default function ReformulationRatePage() {
	const [timeRange, setTimeRange] = useState("7d");
	const [searchQuery, setSearchQuery] = useState("");

	const filteredData = useMemo(() => {
		let data = allData;

		// Filter by Time Range
		const now = new Date();
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
				count: scaleValue(item.count, timeRange),
			}));

		if (!searchQuery) return data;

		const query = searchQuery.toLowerCase();
		return data.filter(
			(item) =>
				item.originalQuery.toLowerCase().includes(query) ||
				item.reformulatedQuery.toLowerCase().includes(query)
		);
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
				<Flex
					gap="8"
					flexDirection="row"
				>
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
						<Th>Original Query</Th>
						<Th></Th>
						<Th>Reformulated To</Th>
						<Th align="right">Occurrences</Th>
						<Th>Confidence</Th>
					</Tr>
				</thead>
				<tbody>
					{filteredData.map((row, i) => (
						<Tr key={i}>
							<Td>
								<Text color="fg.secondary">{row.originalQuery}</Text>
							</Td>
							<Td>
								<IconArrowRight size={16} />
							</Td>
							<Td>{row.reformulatedQuery}</Td>
							<Td type="numeric">{row.count.toLocaleString()}</Td>
							<Td width={100}>
								<Badge intent={row.confidence > 0.9 ? "success" : "warning"}>
									{(row.confidence * 100).toFixed(0)}%
								</Badge>
							</Td>
						</Tr>
					))}
				</tbody>
			</Table>
		</Box>
	);
}
