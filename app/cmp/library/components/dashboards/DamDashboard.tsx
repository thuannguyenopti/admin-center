"use client";

import { useState } from "react";
import { Box, toaster } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { IconPlus } from "@optimizely/axiom-icons";
import { DashboardBarChart } from "./DashboardBarChart";
import { DashboardLineChart } from "./DashboardLineChart";
import { DashboardStatCard } from "./DashboardStatCard";
import {
	ARCHIVES_VS_SHARES,
	ASSETS_BY_CUSTOMER_FIELDS,
	BOTTOM_STATS,
	MID_STATS,
	TOP_STATS,
	TOP_VIEWED_COLLECTIONS,
	UPLOADS_VS_DELETIONS,
	USER_CREATED_VS_LOGINS,
	VIEWS_VS_DOWNLOADS,
	type BarChartSpec,
	type LineChartSpec,
} from "./data";

type CardId =
	| "views-vs-downloads"
	| "uploads-vs-deletions"
	| "assets-by-fields"
	| "top-viewed-collections"
	| "user-created-vs-logins"
	| "archives-vs-shares";

/** DAM usage-analytics dashboard (Figma "Account Information", Library — Master node
 * 4464:46730) — general asset views/downloads/uploads/storage reporting, distinct from
 * the OPAL review-queue workflow tracked elsewhere in this product. */
export function DamDashboard() {
	const [removedCards, setRemovedCards] = useState<Set<CardId>>(new Set());
	const remove = (id: CardId) => setRemovedCards((prev) => new Set(prev).add(id));

	return (
		<Box display="flex" flexDirection="column" gap="20">
			<Box alignItems="center" display="flex" justifyContent="space-between">
				<Text color="fg.default" fontSize="xl" fontWeight="700">Account Information</Text>
				<Button appearance="primary" icon={<IconPlus size={14} />} iconPosition="start" size="md" onClick={() => toaster.create("Adding new cards is coming soon", { intent: "information" })}>
					Add Card
				</Button>
			</Box>

			<Box style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(4, 1fr)" }}>
				{TOP_STATS.map((stat) => (
					<DashboardStatCard key={stat.label + stat.value} size="lg" stat={stat} />
				))}
			</Box>

			<Box style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(2, 1fr)" }}>
				{!removedCards.has("views-vs-downloads") && <DashboardLineChart spec={VIEWS_VS_DOWNLOADS} onDelete={() => remove("views-vs-downloads")} />}
				{!removedCards.has("uploads-vs-deletions") && <DashboardLineChart spec={UPLOADS_VS_DELETIONS} onDelete={() => remove("uploads-vs-deletions")} />}
			</Box>

			<Box style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(4, 1fr)" }}>
				{MID_STATS.map((stat, i) => (
					<DashboardStatCard key={stat.label + i} size="sm" stat={stat} />
				))}
			</Box>

			<Box style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(2, 1fr)" }}>
				{!removedCards.has("assets-by-fields") && <DashboardBarChart spec={ASSETS_BY_CUSTOMER_FIELDS as BarChartSpec} onDelete={() => remove("assets-by-fields")} />}
				{!removedCards.has("top-viewed-collections") && <DashboardBarChart spec={TOP_VIEWED_COLLECTIONS as BarChartSpec} onDelete={() => remove("top-viewed-collections")} />}
			</Box>

			<Box style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(4, 1fr)" }}>
				<DashboardStatCard size="sm" stat={BOTTOM_STATS[0]} />
				<DashboardStatCard size="sm" stat={BOTTOM_STATS[1]} />
				<Box style={{ gridColumn: "span 2" }}>
					<DashboardStatCard size="sm" stat={BOTTOM_STATS[2]} />
				</Box>
			</Box>

			<Box style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(2, 1fr)" }}>
				{!removedCards.has("user-created-vs-logins") && <DashboardLineChart spec={USER_CREATED_VS_LOGINS as LineChartSpec} onDelete={() => remove("user-created-vs-logins")} />}
				{!removedCards.has("archives-vs-shares") && <DashboardLineChart spec={ARCHIVES_VS_SHARES as LineChartSpec} onDelete={() => remove("archives-vs-shares")} />}
			</Box>
		</Box>
	);
}
