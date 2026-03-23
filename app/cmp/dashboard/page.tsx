"use client";

import { useState } from "react";
import {
  Box,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Avatar,
  SearchInput,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
  IconFilter,
  IconChevronDown,
} from "@tabler/icons-react";
import {
  myWorkItems,
  teamWorkItems,
  watchingItems,
  recentlyViewedItems,
  WorkItem,
  RecentlyViewedItem,
} from "./mockData";

function WorkItemRow({ item }: { item: WorkItem }) {
  return (
    <Tr>
      <Td>
        <Box display="flex" flexDirection="column" gap="4">
          <Box display="flex" gap="8" alignItems="center">
            <Text fontSize="sm" color="fg.tertiary">
              {item.taskId}
            </Text>
            <Text fontSize="sm" color="fg.tertiary">
              In
            </Text>
            <Box display="flex" alignItems="center" gap="4">
              <Box
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: item.project.color,
                }}
              />
              <Text fontSize="sm" color="fg.secondary">
                {item.project.name}
              </Text>
            </Box>
          </Box>
          <Text fontSize="md" fontWeight="500" color="fg.default">
            {item.title}
          </Text>
        </Box>
      </Td>
      <Td>
        <Box display="flex" flexDirection="column" gap="4">
          <Text fontSize="sm" color="fg.tertiary">
            {item.step.current}/{item.step.total}
          </Text>
          <Box display="flex" alignItems="center" gap="8">
            <Avatar
              src={item.step.assignee.avatar}
              name={item.step.assignee.name}
              size="sm"
            />
            <Text fontSize="md" color="fg.default">
              {item.step.name}
            </Text>
          </Box>
          <Text fontSize="sm" color="fg.accent">
            Due in {item.daysUntilDue} days
          </Text>
        </Box>
      </Td>
      <Td>
        <Text fontSize="md" color="fg.default">
          {item.dueDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
      </Td>
    </Tr>
  );
}

function RecentlyViewedCard({ item }: { item: RecentlyViewedItem }) {
  return (
    <Box
      p="16"
      borderB="1"
      borderColor="border.tertiary"
      style={{ cursor: "pointer" }}
    >
      <Box display="flex" gap="8" alignItems="center" mb="4">
        <Text fontSize="sm" color="fg.tertiary">
          {item.taskId}
        </Text>
        <Text fontSize="sm" color="fg.tertiary">
          In
        </Text>
        <Box display="flex" alignItems="center" gap="4">
          <Box
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: item.project.color,
            }}
          />
          <Text fontSize="sm" color="fg.secondary" style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "200px"
          }}>
            {item.project.name}
          </Text>
        </Box>
      </Box>
      <Text fontSize="md" fontWeight="500" color="fg.default" mb="4">
        {item.title}
      </Text>
      <Text fontSize="sm" color="fg.tertiary">
        Last viewed {item.lastViewed}
      </Text>
    </Box>
  );
}

export default function CMPDashboardPage() {
  const [activeTab, setActiveTab] = useState("my-work");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearchQuery, setRecentSearchQuery] = useState("");

  const getItemsForTab = () => {
    switch (activeTab) {
      case "my-work":
        return myWorkItems;
      case "team-work":
        return teamWorkItems;
      case "watching":
        return watchingItems;
      default:
        return myWorkItems;
    }
  };

  const filteredItems = getItemsForTab().filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRecentItems = recentlyViewedItems.filter((item) =>
    item.title.toLowerCase().includes(recentSearchQuery.toLowerCase())
  );

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Box display="flex" gap="32" w="full" style={{ minHeight: "calc(100vh - 200px)" }}>
      {/* Main Content */}
      <Box flex="1" style={{ minWidth: 0 }}>
        {/* Welcome Header */}
        <Box display="flex" alignItems="center" gap="16" mb="24">
          <Avatar
            src="/avatars/tiffany.jpg"
            name="Tiffany"
            size="3xl"
            style={{ width: 80, height: 80 }}
          />
          <Box>
            <Text fontSize="sm" color="fg.tertiary" mb="4">
              {currentDate}
            </Text>
            <Text fontSize="2xl" fontWeight="600" color="fg.default">
              Welcome back, Tiffany
            </Text>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList mb="24">
            <TabsTrigger value="my-work">
              <Box display="flex" gap="8" alignItems="center">
                <Text fontSize="md" fontWeight="500">
                  My work
                </Text>
                <Badge intent={activeTab === "my-work" ? "primary" : "neutral"}>
                  {myWorkItems.length}
                </Badge>
              </Box>
            </TabsTrigger>
            <TabsTrigger value="team-work">
              <Box display="flex" gap="8" alignItems="center">
                <Text fontSize="md" fontWeight="500">
                  My team's work
                </Text>
                <Badge intent={activeTab === "team-work" ? "primary" : "neutral"}>
                  {teamWorkItems.length}
                </Badge>
              </Box>
            </TabsTrigger>
            <TabsTrigger value="watching">
              <Box display="flex" gap="8" alignItems="center">
                <Text fontSize="md" fontWeight="500">
                  Watching
                </Text>
                <Badge intent={activeTab === "watching" ? "primary" : "neutral"}>
                  {watchingItems.length}
                </Badge>
              </Box>
            </TabsTrigger>
          </TabsList>

          {/* Filter and Search */}
          <Box display="flex" gap="8" mb="16" alignItems="center">
            <Button
              appearance="subtle"
              size="md"
              style={{ position: "relative" }}
            >
              <IconFilter size={16} />
              <Box
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  backgroundColor: "var(--ax-colors-bg-accent-solid)",
                  color: "white",
                  fontSize: "11px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                1
              </Box>
            </Button>
            <Box flex="1" style={{ maxWidth: "300px" }}>
              <SearchInput
                placeholder="Search"
                size="lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Box>
          </Box>

          {/* Table */}
          <TabsContent value={activeTab}>
            <Table>
              <thead>
                <Tr>
                  <Th>
                    <Box display="flex" alignItems="center" gap="4">
                      Title
                      <IconChevronDown size={14} />
                    </Box>
                  </Th>
                  <Th>
                    <Box display="flex" alignItems="center" gap="4">
                      Step
                      <IconChevronDown size={14} />
                    </Box>
                  </Th>
                  <Th>
                    <Box display="flex" alignItems="center" gap="4">
                      End/Due Date
                      <IconChevronDown size={14} />
                    </Box>
                  </Th>
                </Tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <WorkItemRow key={item.id} item={item} />
                ))}
              </tbody>
            </Table>
          </TabsContent>
        </Tabs>
      </Box>

      {/* Recently Viewed Sidebar */}
      <Box
        style={{ width: 320, flexShrink: 0 }}
        bg="bg.default"
        rounded="md"
        border="1"
        borderColor="border.tertiary"
        overflow="hidden"
      >
        <Box p="16" borderB="1" borderColor="border.tertiary">
          <Text fontSize="lg" fontWeight="600" color="fg.default" mb="16">
            Recently viewed
          </Text>
          <SearchInput
            placeholder="Search"
            size="lg"
            value={recentSearchQuery}
            onChange={(e) => setRecentSearchQuery(e.target.value)}
          />
        </Box>
        <Box>
          {filteredRecentItems.map((item) => (
            <RecentlyViewedCard key={item.id} item={item} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
