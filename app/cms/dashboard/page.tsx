"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  Menu,
  MenuTrigger,
  MenuContent,
  LabelMenuButton,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import {
  IconSearch,
  IconChevronDown,
  IconCaretDownFilled,
  IconDots,
} from "@tabler/icons-react";
import { workflowItems, brokenLinks } from "./mockData";
import { BrokenLinksWidget } from "./components/BrokenLinksWidget";
import { WorkflowStatus, TabConfig } from "./types";
import PageIcon from "@/app/assets/page-icon.svg";
import BlockIcon from "@/app/assets/block-icon.svg";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<WorkflowStatus>("draft");
  const [searchQuery, setSearchQuery] = useState("");
  const [modifiedBy, setModifiedBy] = useState("anyone");
  const [language, setLanguage] = useState("english");

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<WorkflowStatus, number> = {
      draft: 0,
      "in-review": 0,
      approved: 0,
      scheduled: 0,
      rejected: 0,
    };
    workflowItems.forEach((item) => {
      counts[item.status]++;
    });
    return counts;
  }, []);

  const tabs: TabConfig[] = [
    { value: "draft", label: "Drafts", count: tabCounts.draft },
    { value: "in-review", label: "In Review", count: tabCounts["in-review"] },
    { value: "approved", label: "Approved", count: tabCounts.approved },
    { value: "scheduled", label: "Scheduled", count: tabCounts.scheduled },
    { value: "rejected", label: "Rejected", count: tabCounts.rejected },
  ];

  // Filter data based on active tab and filters
  const filteredData = useMemo(() => {
    return workflowItems.filter((item) => {
      // Filter by status (tab)
      if (item.status !== activeTab) return false;

      // Filter by search query
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filter by modified by
      if (modifiedBy !== "anyone" && item.modifiedBy.name !== modifiedBy) {
        return false;
      }

      return true;
    });
  }, [activeTab, searchQuery, modifiedBy]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  return (
    <Box display="flex" gap="32" w="full">
      {/* Main Content */}
      <Box flex="1" style={{ minWidth: 0 }}>
        <Text fontSize="xl" fontWeight="700" color="fg.default" mb="24">
          Workflow Status
        </Text>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as WorkflowStatus)}>
          {/* Tabs */}
          <TabsList mb="24">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                <Box display="flex" gap="8" alignItems="center">
                  <Text fontSize="md" fontWeight="500">
                    {tab.label}
                  </Text>
                  <Badge
                    intent={tab.value === activeTab ? "primary" : "neutral"}
                  >
                    {tab.count}
                  </Badge>
                </Box>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Filters */}
          <Box display="flex" gap="8" mb="16">
            <Box flex="1" style={{ maxWidth: "266px", position: "relative" }}>
              <Input
                placeholder="Filter by name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "40px" }}
              />
              <Box
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
              >
                <IconSearch size={16} color="#66708C" />
              </Box>
            </Box>

            <Menu
              options={[
                { label: "Anyone", execute: () => setModifiedBy("anyone") },
              ]}
            >
              <MenuTrigger asChild>
                <LabelMenuButton label="Modified by">
                  {modifiedBy === "anyone" ? "Anyone" : modifiedBy}
                </LabelMenuButton>
              </MenuTrigger>
              <MenuContent />
            </Menu>

            <Menu
              options={[
                { label: "English", execute: () => setLanguage("english") },
              ]}
            >
              <MenuTrigger asChild>
                <LabelMenuButton label="Language">
                  {language === "english" ? "English" : language}
                </LabelMenuButton>
              </MenuTrigger>
              <MenuContent />
            </Menu>
          </Box>

          {/* Table */}
          <TabsContent value={activeTab}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>
                    <Text fontSize="sm" color="fg.tertiary">Name</Text>
                  </TableHeaderCell>
                  <TableHeaderCell>
                    <Box display="flex" gap="4" alignItems="center">
                      <Text fontSize="sm" color="fg.tertiary">Last Modified</Text>
                      <IconCaretDownFilled size={7} color="#66708C" />
                    </Box>
                  </TableHeaderCell>
                  <TableHeaderCell>
                    <Text fontSize="sm" color="fg.tertiary">Modified by</Text>
                  </TableHeaderCell>
                  <TableHeaderCell />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box display="flex" gap="8" alignItems="center">
                        {item.type === "page" ? (
                          <PageIcon width={12} height={16} />
                        ) : (
                          <BlockIcon width={14} height={14} />
                        )}
                        <Text fontSize="md" color="fg.default">
                          {item.name}
                        </Text>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" flexDirection="column" gap="2">
                        <Text fontSize="md" color="fg.default">
                          {formatDate(item.lastModified)}
                        </Text>
                        <Text fontSize="sm" color="fg.tertiary">
                          {formatTime(item.lastModified)}
                        </Text>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap="8" alignItems="center">
                        <Avatar
                          src={item.modifiedBy.avatar}
                          name={item.modifiedBy.name}
                          size="sm"
                        />
                        <Text fontSize="md" color="fg.default">
                          {item.modifiedBy.name}
                        </Text>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" justifyContent="end">
                        <Button
                          aria-label="Actions"
                          size="md"
                          icon={<IconDots />}
                          appearance="subtle"
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </Box>

      {/* Sidebar - Broken Links Widget */}
      <BrokenLinksWidget items={brokenLinks} />
    </Box>
  );
}