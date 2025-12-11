"use client";

import { useState } from "react";
import {
  Box,
  Heading,
  Select,
  SelectTrigger,
  SelectContent,
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableCell,
  TableHeaderCell,
  Link as AxiomLink,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import Link from "next/link";
import { IconFolder, IconChevronDown, IconCaretDownFilled } from "@tabler/icons-react";
import { reportItems } from "./mockData";
import { DateTimeCell } from "./components/DateTimeCell";
import type { ReportType, PublishStatus, DateFilter, ChangedByFilter, LanguageFilter } from "./types";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("published");
  const [location, setLocation] = useState("/");
  const [dateFilter, setDateFilter] = useState<DateFilter>("any");
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("ready-to-publish");
  const [changedBy, setChangedBy] = useState<ChangedByFilter>("me");
  const [language, setLanguage] = useState<LanguageFilter>("any");

  return (
    <>
      {/* Type of Report Select */}
      <Box display="flex" flexDirection="column" gap="4" mb="24">
        <Text fontSize="md" color="fg.secondary">
          Type of Report
        </Text>
        <Select
          value={reportType}
          onValueChange={(value) => setReportType(value as ReportType)}
          options={[
            { label: "Published pages", value: "published" },
            { label: "Unpublished pages", value: "unpublished" },
            { label: "Scheduled pages", value: "scheduled" },
            { label: "Archived pages", value: "archived" },
          ]}
        >
          <SelectTrigger
            style={{
              width: "266px",
              height: "40px",
              borderRadius: "6px",
            }}
          >
            Published pages
          </SelectTrigger>
          <SelectContent />
        </Select>
      </Box>

      {/* Description */}
      <Text fontSize="md" color="fg.default" style={{ lineHeight: "20px" }} mb="24">
        This report displayes pages that have not yet been published and have a last changed date
        within a certain time span. Select a page from the list of report results to open it in
        edit mode.
      </Text>

      {/* Select Location */}
      <Box display="flex" flexDirection="column" gap="4" mb="24">
        <Text fontSize="md" color="fg.secondary">
          Select Location
        </Text>
        <Select
          value={location}
          onValueChange={setLocation}
          options={[
            { label: "/", value: "/" },
            { label: "/content", value: "/content" },
            { label: "/pages", value: "/pages" },
          ]}
        >
          <SelectTrigger
            style={{
              width: "100%",
              height: "40px",
              borderRadius: "6px",
            }}
          >
            <Box display="flex" alignItems="center" gap="8">
              <IconFolder size={16} color="#2E3442" />
              <Text>/</Text>
            </Box>
          </SelectTrigger>
          <SelectContent />
        </Select>
      </Box>

      {/* Filter Row */}
      <Box display="flex" gap="12" flexWrap="wrap" mb="24">
        {/* Date Filter */}
        <Select
          value={dateFilter}
          onValueChange={(value) => setDateFilter(value as DateFilter)}
          options={[
            { label: "Any", value: "any" },
            { label: "Today", value: "today" },
            { label: "This Week", value: "this-week" },
            { label: "This Month", value: "this-month" },
          ]}
        >
          <SelectTrigger
            style={{
              minWidth: "71px",
              height: "40px",
              borderRadius: "6px",
            }}
          >
            <Box display="flex" flexDirection="column" gap="2" alignItems="start">
              <Text fontSize="xs" color="fg.secondary" style={{ letterSpacing: "0.05px" }}>
                Date
              </Text>
              <Text fontSize="sm" color="fg.default" style={{ letterSpacing: "0.01px" }}>
                Any
              </Text>
            </Box>
          </SelectTrigger>
          <SelectContent />
        </Select>

        {/* Publish Status Filter */}
        <Select
          value={publishStatus}
          onValueChange={(value) => setPublishStatus(value as PublishStatus)}
          options={[
            { label: "Ready to Publish", value: "ready-to-publish" },
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
            { label: "Archived", value: "archived" },
          ]}
        >
          <SelectTrigger
            style={{
              minWidth: "143px",
              height: "40px",
              borderRadius: "6px",
            }}
          >
            <Box display="flex" flexDirection="column" gap="2" alignItems="start">
              <Text fontSize="xs" color="fg.secondary" style={{ letterSpacing: "0.05px" }}>
                Publish Status
              </Text>
              <Text fontSize="sm" color="fg.default" style={{ letterSpacing: "0.01px" }}>
                Ready to Publish
              </Text>
            </Box>
          </SelectTrigger>
          <SelectContent />
        </Select>

        {/* Changed by Filter */}
        <Select
          value={changedBy}
          onValueChange={(value) => setChangedBy(value as ChangedByFilter)}
          options={[
            { label: "Me", value: "me" },
            { label: "Anyone", value: "anyone" },
          ]}
        >
          <SelectTrigger
            style={{
              minWidth: "106px",
              height: "40px",
              borderRadius: "6px",
            }}
          >
            <Box display="flex" flexDirection="column" gap="2" alignItems="start">
              <Text fontSize="xs" color="fg.secondary" style={{ letterSpacing: "0.05px" }}>
                Changed by
              </Text>
              <Text fontSize="sm" color="fg.default" style={{ letterSpacing: "0.01px" }}>
                Me
              </Text>
            </Box>
          </SelectTrigger>
          <SelectContent />
        </Select>

        {/* Languages Filter */}
        <Select
          value={language}
          onValueChange={(value) => setLanguage(value as LanguageFilter)}
          options={[
            { label: "Any", value: "any" },
            { label: "English", value: "english" },
            { label: "Spanish", value: "spanish" },
            { label: "French", value: "french" },
          ]}
        >
          <SelectTrigger
            style={{
              minWidth: "101px",
              height: "40px",
              borderRadius: "6px",
            }}
          >
            <Box display="flex" flexDirection="column" gap="2" alignItems="start">
              <Text fontSize="xs" color="fg.secondary" style={{ letterSpacing: "0.05px" }}>
                Languages
              </Text>
              <Text fontSize="sm" color="fg.default" style={{ letterSpacing: "0.01px" }}>
                Any
              </Text>
            </Box>
          </SelectTrigger>
          <SelectContent />
        </Select>
      </Box>

      {/* Reports Table */}
      <Box
        style={{
          borderRadius: "6px",
          border: "1px solid #E9EDF5",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>
                <Text fontSize="sm" color="fg.tertiary" style={{ letterSpacing: "0.01px" }}>
                  Page Name
                </Text>
              </TableHeaderCell>
              <TableHeaderCell>
                <Box display="flex" alignItems="center" gap="4">
                  <Text fontSize="sm" color="fg.tertiary" style={{ letterSpacing: "0.01px" }}>
                    Published
                  </Text>
                  <IconCaretDownFilled size={7} color="#66708C" />
                </Box>
              </TableHeaderCell>
              <TableHeaderCell>
                <Box display="flex" alignItems="center" gap="4">
                  <Text fontSize="sm" color="fg.tertiary" style={{ letterSpacing: "0.01px" }}>
                    Unpublished
                  </Text>
                  <IconCaretDownFilled size={7} color="#66708C" />
                </Box>
              </TableHeaderCell>
              <TableHeaderCell>
                <Box display="flex" alignItems="center" gap="4">
                  <Text fontSize="sm" color="fg.tertiary" style={{ letterSpacing: "0.01px" }}>
                    Last Changed
                  </Text>
                  <IconCaretDownFilled size={7} color="#66708C" />
                </Box>
              </TableHeaderCell>
              <TableHeaderCell>
                <Text fontSize="sm" color="fg.tertiary" style={{ letterSpacing: "0.01px" }}>
                  Changed By
                </Text>
              </TableHeaderCell>
              <TableHeaderCell>
                <Text fontSize="sm" color="fg.tertiary" style={{ letterSpacing: "0.01px" }}>
                  Language
                </Text>
              </TableHeaderCell>
              <TableHeaderCell>
                <Text fontSize="sm" color="fg.tertiary" style={{ letterSpacing: "0.01px" }}>
                  Page Type
                </Text>
              </TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Link
                    href={`/cms/edit/${item.id}`}
                    style={{
                      color: "#0037FF",
                      fontSize: "14px",
                      fontWeight: 500,
                      letterSpacing: "-0.10px",
                      textDecoration: "none",
                    }}
                  >
                    {item.pageName}
                  </Link>
                </TableCell>
                <TableCell>
                  {item.published && (
                    <DateTimeCell date={item.published.date} time={item.published.time} />
                  )}
                </TableCell>
                <TableCell>
                  {item.unpublished && (
                    <DateTimeCell date={item.unpublished.date} time={item.unpublished.time} />
                  )}
                </TableCell>
                <TableCell>
                  <DateTimeCell date={item.lastChanged.date} time={item.lastChanged.time} />
                </TableCell>
                <TableCell>
                  <Text fontSize="md" color="fg.default" style={{ lineHeight: "20px" }}>
                    {item.changedBy}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text fontSize="md" color="fg.default">
                    {item.language}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text fontSize="md" color="fg.default">
                    {item.pageType}
                  </Text>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </>
  );
}