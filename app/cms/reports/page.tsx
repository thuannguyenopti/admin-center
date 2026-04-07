"use client";

import {useState} from "react";
import {
	Box,
	Heading,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
	Link as AxiomLink,
} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import Link from "next/link";
import {IconFolder} from "@tabler/icons-react";
import {Table, Tr, Th, Td} from "@/app/components/Table";
import {reportItems} from "./mockData";
import {DateTimeCell} from "./components/DateTimeCell";
import type {ReportType, PublishStatus, DateFilter, ChangedByFilter, LanguageFilter} from "./types";
import Flow from "@/app/components/Flow";

export default function ReportsPage() {
	const [reportType, setReportType] = useState<ReportType>("published");
	const [location, setLocation] = useState("/");
	const [dateFilter, setDateFilter] = useState<DateFilter>("any");
	const [publishStatus, setPublishStatus] = useState<PublishStatus>("ready-to-publish");
	const [changedBy, setChangedBy] = useState<ChangedByFilter>("me");
	const [language, setLanguage] = useState<LanguageFilter>("any");

	const reportTypeOptions = [
		{label: "Published pages", value: "published"},
		{label: "Unpublished pages", value: "unpublished"},
		{label: "Scheduled pages", value: "scheduled"},
		{label: "Archived pages", value: "archived"},
	];

	const locationOptions = [
		{label: "/", value: "/"},
		{label: "/content", value: "/content"},
		{label: "/pages", value: "/pages"},
	];

	const dateFilterOptions = [
		{label: "Any", value: "any"},
		{label: "Today", value: "today"},
		{label: "This Week", value: "this-week"},
		{label: "This Month", value: "this-month"},
	];

	const publishStatusOptions = [
		{label: "Ready to Publish", value: "ready-to-publish"},
		{label: "Draft", value: "draft"},
		{label: "Published", value: "published"},
		{label: "Archived", value: "archived"},
	];

	const changedByOptions = [
		{label: "Me", value: "me"},
		{label: "Anyone", value: "anyone"},
	];

	const languageOptions = [
		{label: "Any", value: "any"},
		{label: "English", value: "english"},
		{label: "Spanish", value: "spanish"},
		{label: "French", value: "french"},
	];

	return (
		<>
			{/* Type of Report Select */}
			<Flow>
				<Menu
					options={reportTypeOptions.map((opt) => ({
						label: opt.label,
						execute: () => setReportType(opt.value as ReportType),
					}))}
				>
					<MenuTrigger asChild>
						<LabelMenuButton label="Type of Report">
							{reportTypeOptions.find((opt) => opt.value === reportType)?.label}
						</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				{/* Description */}
				<Text>
					This report displayes pages that have not yet been published and have a last
					changed date within a certain time span. Select a page from the list of report
					results to open it in edit mode.
				</Text>
				{/* Select Location */}
				<Box>
					<Menu
						options={locationOptions.map((opt) => ({
							label: opt.label,
							execute: () => setLocation(opt.value),
						}))}
					>
						<MenuTrigger asChild>
							<LabelMenuButton label="Select Location">
								<Box as="span" display="inline-flex" alignItems="center" gap="8">
									<IconFolder size={16} color="#2E3442" />
									<Text as="span">
										{
											locationOptions.find((opt) => opt.value === location)
												?.label
										}
									</Text>
								</Box>
							</LabelMenuButton>
						</MenuTrigger>
						<MenuContent />
					</Menu>
				</Box>

				{/* Filter Row */}
				<Box display="flex" gap="8" flexWrap="wrap" mb="24">
					{/* Date Filter */}
					<Menu
						options={dateFilterOptions.map((opt) => ({
							label: opt.label,
							execute: () => setDateFilter(opt.value as DateFilter),
						}))}
					>
						<MenuTrigger asChild>
							<LabelMenuButton label="Date">
								{dateFilterOptions.find((opt) => opt.value === dateFilter)?.label}
							</LabelMenuButton>
						</MenuTrigger>
						<MenuContent />
					</Menu>

					{/* Publish Status Filter */}
					<Menu
						options={publishStatusOptions.map((opt) => ({
							label: opt.label,
							execute: () => setPublishStatus(opt.value as PublishStatus),
						}))}
					>
						<MenuTrigger asChild>
							<LabelMenuButton label="Publish Status">
								{
									publishStatusOptions.find((opt) => opt.value === publishStatus)
										?.label
								}
							</LabelMenuButton>
						</MenuTrigger>
						<MenuContent />
					</Menu>

					{/* Changed by Filter */}
					<Menu
						options={changedByOptions.map((opt) => ({
							label: opt.label,
							execute: () => setChangedBy(opt.value as ChangedByFilter),
						}))}
					>
						<MenuTrigger asChild>
							<LabelMenuButton label="Changed by">
								{changedByOptions.find((opt) => opt.value === changedBy)?.label}
							</LabelMenuButton>
						</MenuTrigger>
						<MenuContent />
					</Menu>

					{/* Languages Filter */}
					<Menu
						options={languageOptions.map((opt) => ({
							label: opt.label,
							execute: () => setLanguage(opt.value as LanguageFilter),
						}))}
					>
						<MenuTrigger asChild>
							<LabelMenuButton label="Languages">
								{languageOptions.find((opt) => opt.value === language)?.label}
							</LabelMenuButton>
						</MenuTrigger>
						<MenuContent />
					</Menu>
				</Box>

				{/* Reports Table */}
				<Table>
					<thead>
						<Tr>
							<Th>Page Name</Th>
							<Th>Published</Th>
							<Th>Unpublished</Th>
							<Th>Last Changed</Th>
							<Th>Changed By</Th>
							<Th>Language</Th>
							<Th>Page Type</Th>
						</Tr>
					</thead>
					<tbody>
						{reportItems.map((item) => (
							<Tr key={item.id} url={`/cms/reports/${item.id}`}>
								<Td type="header">{item.pageName}</Td>
								<Td description={item.published?.time}>{item.published?.date}</Td>
								<Td description={item.unpublished?.time}>
									{item.unpublished?.date}
								</Td>
								<Td description={item.lastChanged?.time}>
									{item.lastChanged?.date}
								</Td>
								<Td>{item.changedBy}</Td>
								<Td>{item.language}</Td>
								<Td>{item.pageType}</Td>
							</Tr>
						))}
					</tbody>
				</Table>
			</Flow>
		</>
	);
}
