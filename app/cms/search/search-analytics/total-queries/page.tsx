"use client";

import {Box, Menu, MenuTrigger, MenuContent, LabelMenuButton} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
import {IconSearch, IconTrendingUp, IconTrendingDown} from "@/app/lib/axiom-icons";
import {useState, useMemo} from "react";
import {volumeQueries, VolumeQuery, scaleValue} from "@/app/db/analyticsData";
import {Table, Tr, Td, Th} from "@/app/components/Table";
import EmptyList from "@/app/components/EmptyList";

const allData: VolumeQuery[] = volumeQueries;

type TimeRange = "24h" | "7d" | "30d" | "90d";

export default function TotalQueriesPage() {
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

			{filteredData.length === 0 ? (
				<EmptyList
					heading="No results found"
					body="No queries match your current filters. Try adjusting the time range or search terms."
				/>
			) : (
				<Table>
					<thead>
						<Tr>
							<Th>Query</Th>
							<Th>Total Searches</Th>
							<Th>Trend (7d)</Th>
						</Tr>
					</thead>
					<tbody>
						{filteredData.map((row, i) => (
							<Tr key={i}>
								<Td type="header">{row.query}</Td>
								<Td>{row.count.toLocaleString()}</Td>
								<Td>
									<Flex
										alignItems="center"
										gap="4"
										flexDirection="row"
										color={row.trend >= 0 ? "fg.success" : "fg.error"}
									>
										{row.trend >= 0 ? (
											<IconTrendingUp size={16} />
										) : (
											<IconTrendingDown size={16} />
										)}
										<Text>{Math.abs(row.trend)}%</Text>
									</Flex>
								</Td>
							</Tr>
						))}
					</tbody>
				</Table>
			)}
		</Box>
	);
}
