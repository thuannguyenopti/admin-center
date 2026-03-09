"use client";

import { useState } from "react";
import {
  Box,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import {
  IconFileText,
  IconEye,
  IconUsers,
  IconClock,
  IconStar,
  IconDownload,
  IconCalendar,
  IconChevronDown,
} from "@tabler/icons-react";

// Mock metric data
const mockMetrics = {
  articlesViewed: 0,
  pageviews: 0,
  uniqueVisitors: 0,
  attentionTime: "—",
  engagementRate: "—",
};

// Mock chart data
const mockChartData = [
  { date: "Feb 1", pageviews: 1200, previous: 1100 },
  { date: "Feb 2", pageviews: 1900, previous: 1200 },
  { date: "Feb 3", pageviews: 1500, previous: 1400 },
  { date: "Feb 4", pageviews: 2200, previous: 1800 },
  { date: "Feb 5", pageviews: 2100, previous: 2000 },
  { date: "Feb 6", pageviews: 1800, previous: 1600 },
  { date: "Feb 7", pageviews: 2400, previous: 2100 },
];

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

function MetricCard({ icon, label, value, color }: MetricCardProps) {
  return (
    <Box
      p="16"
      bg="bg.default"
      border="1"
      borderColor="border.tertiary"
      rounded="md"
      style={{ flex: 1 }}
    >
      <Box display="flex" alignItems="center" gap="8" mb="12">
        <Box
          style={{
            width: 32,
            height: 32,
            borderRadius: "6px",
            backgroundColor: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          {icon}
        </Box>
        <Text fontSize="sm" color="fg.tertiary">
          {label}
        </Text>
      </Box>
      <Text fontSize="2xl" fontWeight="600" color="fg.default">
        {value}
      </Text>
    </Box>
  );
}

function ChartPlaceholder() {
  return (
    <Box
      p="32"
      bg="bg.default"
      border="1"
      borderColor="border.tertiary"
      rounded="md"
      style={{
        height: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <Box
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <svg
          width="200"
          height="120"
          viewBox="0 0 200 120"
          style={{ opacity: 0.3 }}
        >
          <polyline
            points="10,100 40,70 70,80 100,50 130,60 160,30 190,40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="10" cy="100" r="3" fill="currentColor" />
          <circle cx="40" cy="70" r="3" fill="currentColor" />
          <circle cx="70" cy="80" r="3" fill="currentColor" />
          <circle cx="100" cy="50" r="3" fill="currentColor" />
          <circle cx="130" cy="60" r="3" fill="currentColor" />
          <circle cx="160" cy="30" r="3" fill="currentColor" />
          <circle cx="190" cy="40" r="3" fill="currentColor" />
        </svg>
        <Text fontSize="md" color="fg.tertiary">
          Chart area - Ready for implementation
        </Text>
      </Box>
    </Box>
  );
}

export default function CMPReportsPage() {
  const [activeTab, setActiveTab] = useState("content");
  const [dateRange, setDateRange] = useState("past-30-days");
  const [compareToOption, setCompareToOption] = useState("previous-period");
  const [metricSelector, setMetricSelector] = useState("pageviews");
  const [viewToggle, setViewToggle] = useState("current-previous");
  const [timePeriod, setTimePeriod] = useState("daily");
  const [valueToggle, setValueToggle] = useState("value");

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Box display="flex" flexDirection="column" gap="24" w="full">
      {/* Header Section */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Text fontSize="2xl" fontWeight="600" color="fg.default" mb="12">
            Analytics
          </Text>
          <Box display="flex" alignItems="center" gap="16">
            <Box display="flex" alignItems="center" gap="8">
              <IconCalendar size={16} color="var(--ax-colors-fg-tertiary)" />
              <Button
                appearance="subtle"
                size="sm"
                style={{
                  padding: "6px 8px",
                }}
              >
                <Box display="flex" alignItems="center" gap="4">
                  <Text fontSize="sm">Past 30 Days</Text>
                  <IconChevronDown size={14} />
                </Box>
              </Button>
            </Box>
            <Text fontSize="sm" color="fg.tertiary">
              {currentDate}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Compare to Section */}
      <Box display="flex" alignItems="center" gap="12">
        <Text fontSize="sm" color="fg.tertiary">
          Compare to:
        </Text>
        <Button
          appearance="subtle"
          size="sm"
          style={{
            padding: "6px 12px",
          }}
        >
          <Box display="flex" alignItems="center" gap="4">
            <Text fontSize="sm">Previous Period</Text>
            <IconChevronDown size={14} />
          </Box>
        </Button>
      </Box>

      {/* Tabs and Export */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="content">
              <Text fontSize="md" fontWeight="500">
                Content
              </Text>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button appearance="secondary" size="md">
          <IconDownload size={16} />
          Export
        </Button>
      </Box>

      {/* Metric Cards */}
      <Box display="flex" gap="16" style={{ width: "100%" }}>
        <MetricCard
          icon={<IconFileText size={18} />}
          label="Articles Viewed"
          value={mockMetrics.articlesViewed}
          color="var(--ax-colors-bg-accent-solid)"
        />
        <MetricCard
          icon={<IconEye size={18} />}
          label="Pageviews"
          value={mockMetrics.pageviews}
          color="var(--ax-colors-bg-accent-solid)"
        />
        <MetricCard
          icon={<IconUsers size={18} />}
          label="Unique Visitors"
          value={mockMetrics.uniqueVisitors}
          color="var(--ax-colors-bg-accent-solid)"
        />
        <MetricCard
          icon={<IconClock size={18} />}
          label="Attention Time"
          value={mockMetrics.attentionTime}
          color="var(--ax-colors-bg-accent-solid)"
        />
        <MetricCard
          icon={<IconStar size={18} />}
          label="Engagement Rate"
          value={mockMetrics.engagementRate}
          color="var(--ax-colors-bg-accent-solid)"
        />
      </Box>

      {/* Chart Controls */}
      <Box
        display="flex"
        gap="24"
        alignItems="center"
        flexWrap="wrap"
        borderB="1"
        borderColor="border.tertiary"
        pb="16"
      >
        {/* Metric Selector */}
        <Box display="flex" alignItems="center" gap="8">
          <Text fontSize="sm" color="fg.tertiary">
            Metric:
          </Text>
          <Button
            appearance="subtle"
            size="sm"
            style={{
              padding: "6px 12px",
            }}
          >
            <Box display="flex" alignItems="center" gap="4">
              <Text fontSize="sm">{metricSelector}</Text>
              <IconChevronDown size={14} />
            </Box>
          </Button>
        </Box>

        {/* View Toggle */}
        <Box display="flex" alignItems="center" gap="8">
          <Text fontSize="sm" color="fg.tertiary">
            View:
          </Text>
          <Box display="flex" gap="4">
            <Button
              appearance={
                viewToggle === "current-previous" ? "primary" : "subtle"
              }
              size="sm"
              style={{
                padding: "6px 12px",
              }}
              onClick={() => setViewToggle("current-previous")}
            >
              <Text fontSize="sm">Current & Previous</Text>
            </Button>
            <Button
              appearance={viewToggle === "by-channel" ? "primary" : "subtle"}
              size="sm"
              style={{
                padding: "6px 12px",
              }}
              onClick={() => setViewToggle("by-channel")}
            >
              <Text fontSize="sm">By Channel</Text>
            </Button>
          </Box>
        </Box>

        {/* Time Period Toggle */}
        <Box display="flex" alignItems="center" gap="8">
          <Text fontSize="sm" color="fg.tertiary">
            Period:
          </Text>
          <Box display="flex" gap="4">
            <Button
              appearance={timePeriod === "daily" ? "primary" : "subtle"}
              size="sm"
              style={{
                padding: "6px 12px",
              }}
              onClick={() => setTimePeriod("daily")}
            >
              <Text fontSize="sm">Daily</Text>
            </Button>
            <Button
              appearance={timePeriod === "weekly" ? "primary" : "subtle"}
              size="sm"
              style={{
                padding: "6px 12px",
              }}
              onClick={() => setTimePeriod("weekly")}
            >
              <Text fontSize="sm">Weekly</Text>
            </Button>
            <Button
              appearance={timePeriod === "monthly" ? "primary" : "subtle"}
              size="sm"
              style={{
                padding: "6px 12px",
              }}
              onClick={() => setTimePeriod("monthly")}
            >
              <Text fontSize="sm">Monthly</Text>
            </Button>
          </Box>
        </Box>

        {/* Value/Percentage Toggle */}
        <Box display="flex" alignItems="center" gap="8">
          <Box display="flex" gap="4">
            <Button
              appearance={valueToggle === "value" ? "primary" : "subtle"}
              size="sm"
              style={{
                padding: "6px 12px",
              }}
              onClick={() => setValueToggle("value")}
            >
              <Text fontSize="sm">Value</Text>
            </Button>
            <Button
              appearance={valueToggle === "percentage" ? "primary" : "subtle"}
              size="sm"
              style={{
                padding: "6px 12px",
              }}
              onClick={() => setValueToggle("percentage")}
            >
              <Text fontSize="sm">%</Text>
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Chart Area */}
      <TabsContent value={activeTab}>
        <ChartPlaceholder />
      </TabsContent>

      {/* Chart Data Table (Optional) */}
      <Box
        p="16"
        bg="bg.default"
        border="1"
        borderColor="border.tertiary"
        rounded="md"
      >
        <Text fontSize="sm" fontWeight="500" color="fg.secondary" mb="12">
          Sample Data (Daily Pageviews)
        </Text>
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {mockChartData.map((data, index) => (
            <Box key={index} display="flex" flexDirection="column" gap="4">
              <Text fontSize="xs" color="fg.tertiary">
                {data.date}
              </Text>
              <Box display="flex" gap="16">
                <Box>
                  <Text fontSize="xs" color="fg.tertiary" mb="2">
                    Current
                  </Text>
                  <Text fontSize="md" fontWeight="500" color="fg.default">
                    {data.pageviews}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="fg.tertiary" mb="2">
                    Previous
                  </Text>
                  <Text fontSize="md" fontWeight="500" color="fg.default">
                    {data.previous}
                  </Text>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
