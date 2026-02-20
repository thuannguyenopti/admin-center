"use client";

import {
    Box,
    Heading,
    Text,
    Button,
    Badge,
    Avatar,
    Menu,
    MenuTrigger,
    MenuContent,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    Link,
} from "@optiaxiom/react";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
    IconSearch,
    IconPlus,
    IconChevronDown,
} from "@tabler/icons-react";
import { IconAgent, IconCodeBranch, IconFileImport } from "@optimizely/axiom-icons";
import { useState } from "react";
import { useRouter } from "next/navigation";

const agents = [
    {
        icon: <IconAgent />,
        url: "/opal/agents/setup?mode=edit",
        name: "Content Localizer",
        handle: "@content_localizer",
        creator: { name: "User Name", avatar: "/avatars/user.png" }, // Mock avatar
        category: "Category B",
        categoryColor: "primary",
        description: "Localize your content with specific regional context.",
        activity: "1 Run",
        lastModified: { date: "Dec 1, 2025", user: "John Smith" },
        status: "Active",
    },
    {
        icon: <IconAgent />,
        url: "/opal/agents/setup?mode=edit",
        name: "Heatmap Analysis",
        handle: "@heatmap_analysis",
        creator: { name: "Optimizely", type: "system" },
        category: "Option A",
        categoryColor: "primary",
        description:
            "Transforms a provided heatmap image and url into precise, tailored test ideas. It eliminates the burden of manual analysis, converting c...",
        activity: "3 Runs",
        lastModified: { date: "Sep 15, 2025", user: "John Smith" },
        status: "Active",
    },
    {
        icon: <IconAgent />,
        url: "/opal/agents/setup?mode=edit",
        name: "Experiment Planning Agent",
        handle: "@test_planning",
        creator: { name: "Optimizely", type: "system" },
        category: "Option B",
        categoryColor: "primary",
        description:
            "Transforms your raw ideas into a fully-formed test plan, complete with suggested hypotheses, key metrics, identified risks, an...",
        activity: "6 Runs",
        lastModified: { date: "Jul 29, 2025", user: "John Smith" },
        status: "Active",
    },
    {
        icon: <IconCodeBranch />,
        url: "/opal/agents/workflow",
        name: "GEO Recommendations",
        handle: "@opti_geo_recommendati...",
        tag: "Updated",
        creator: { name: "Optimizely", type: "system" },
        category: "Option C",
        categoryColor: "primary",
        description:
            "Audits webpages for LLM discoverability, retrievability, and understandability to deliver actionable recommendations to optimize co...",
        activity: "4 Runs",
        lastModified: { date: "Oct 10, 2025", user: "John Smith" },
        status: "Inactive",
    },
    {
        icon: <IconCodeBranch />,
        url: "/opal/agents/workflow",
        name: "Resource Manager",
        handle: "@rm",
        creator: { name: "Optimizely", type: "system" },
        category: "Category B",
        categoryColor: "primary",
        description: "Look up available team members for task assignment.",
        activity: "7 Runs",
        lastModified: { date: "Jul 30, 2025", user: "John Smith" },
        status: "Inactive",
    },
    {
        icon: <IconCodeBranch />,
        url: "/opal/agents/workflow",
        name: "SEO Keyword Research",
        handle: "@seo_keyword_resaerch",
        creator: { name: "Optimizely", type: "system" },
        category: "Category C",
        categoryColor: "primary",
        description:
            "Takes a topic, leverages data from Idea Lab and the broader web, and returns a curated list of keywords designed to maximize conte...",
        activity: "2 Runs",
        lastModified: { date: "Nov 3, 2025", user: "John Smith" },
        status: "Active",
    },
    {
        icon: <IconAgent />,
        url: "/opal/agents/setup?mode=edit",
        name: "Synthesize Agent",
        handle: "@meeting_synthesizer",
        creator: { name: "User Name", avatar: "/avatars/user.png" },
        category: "All Products",
        categoryColor: "primary",
        description: "Summarize your meeting.",
        activity: "5 Runs",
        lastModified: { date: "Aug 20, 2025", user: "John Smith" },
        status: "Inactive",
    },
];

export default function AgentsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("Your Agents");

    return (
        <Box p="24" display="flex" flexDirection="column" gap="24">
            {/* Header */}
            <Box>
                <Heading level="2">Agents</Heading>
                <Box display="flex" gap="8" alignItems="center" mt="4">
                    <Text color="fg.secondary">
                        Empower your marketing team by customizing Opal agents to meet your
                        specific needs.
                    </Text>
                    <Link href="#">Learn more.</Link>
                </Box>
            </Box>

            {/* Tabs */}
            <Box display="flex" gap="24" borderB="1" borderColor="border.tertiary">
                {["Your Agents", "Agent Directory"].map((tab) => (
                    <Box
                        key={tab}
                        pb="12"
                        cursor="pointer"
                        borderB={activeTab === tab ? "2" : "0"}
                        borderColor={activeTab === tab ? "border.default" : "transparent"}
                        onClick={() => setActiveTab(tab)}
                        style={activeTab === tab ? { borderBottomColor: "#0069ff" } : {}}
                    >
                        <Text
                            fontWeight={activeTab === tab ? "500" : "400"}
                            color={activeTab === tab ? "fg.default" : "fg.secondary"}
                        >
                            {tab}
                        </Text>
                    </Box>
                ))}
            </Box>

            {/* Toolbar */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" gap="12">
                    <Box style={{ width: "240px", position: "relative" }}>
                        <Box style={{ position: "absolute", left: "8px", top: "8px", zIndex: 20 }} color="fg.tertiary">
                            <IconSearch size={16} />
                        </Box>
                        <Box asChild>
                            <input
                                placeholder="Enter name or description"
                                style={{
                                    width: "100%",
                                    paddingLeft: "32px",
                                    paddingRight: "12px",
                                    paddingTop: "6px",
                                    paddingBottom: "6px",
                                    borderRadius: "6px",
                                    border: "1px solid var(--ax-colors-border-default)",
                                    outline: "none",
                                    fontSize: "14px",
                                    height: "32px",
                                    backgroundColor: "var(--ax-colors-bg-default)"
                                }}
                            />
                        </Box>
                    </Box>

                    {["Type", "Category", "Created by", "Modified by"].map((filter) => (
                        <Menu key={filter} options={[{ label: "All" }]}>
                            <MenuTrigger asChild>
                                <Button appearance="subtle" iconPosition="end" icon={<IconChevronDown />} className="menu-label-button">
                                    <Box display="flex" flexDirection="column" alignItems="start" textAlign="start">
                                        <Text fontSize="xs" color="fg.tertiary">
                                            {filter}
                                        </Text>
                                        <Text fontSize="sm">All</Text>
                                    </Box>
                                </Button>
                            </MenuTrigger>
                            <MenuContent />
                        </Menu>
                    ))}
                </Box>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            appearance="primary"
                            iconPosition="end"
                            icon={<IconChevronDown />}
                            className="data-[state=open]:ring-2 data-[state=open]:ring-offset-2 data-[state=open]:ring-[#0069ff] outline-none focus:ring-0"
                        >
                            Add Agent
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <Box p="12" display="flex" flexDirection="row" gap="12" alignItems="start" cursor="pointer" className="hover:bg-[var(--ax-colors-bg-default-hovered)] rounded-md" onClick={() => router.push("/opal/agents/setup")}>
                            <Box mt="2" color="fg.default"><IconAgent /></Box>
                            <Box>
                                <Text fontWeight="500" fontSize="md">Specialized Agent</Text>
                                <Text fontSize="sm" color="fg.secondary">Purpose-built to autonomously perform specific tasks creatively within guidelines...</Text>
                            </Box>
                        </Box>
                        <Box p="12" display="flex" flexDirection="row" gap="12" alignItems="start" cursor="pointer" className="hover:bg-[var(--ax-colors-bg-default-hovered)] rounded-md" onClick={() => router.push("/opal/agents/workflow")}>
                            <Box mt="2" color="fg.default"><IconCodeBranch /></Box>
                            <Box>
                                <Text fontWeight="500" fontSize="md">Workflow</Text>
                                <Text fontSize="sm" color="fg.secondary">Orchestrate agents and tools to fulfill your requirements.</Text>
                            </Box>
                        </Box>
                        <Box p="12" display="flex" flexDirection="row" gap="12" alignItems="start" cursor="pointer" className="hover:bg-[var(--ax-colors-bg-default-hovered)] rounded-md">
                            <Box mt="2" color="fg.default"><IconFileImport /></Box>
                            <Box>
                                <Text fontWeight="500" fontSize="md">Import</Text>
                                <Text fontSize="sm" color="fg.secondary">Import an agent from JSON data.</Text>
                            </Box>
                        </Box>
                    </DropdownMenuContent>
                </DropdownMenu>
            </Box>

            {/* Table */}
            <Table>
                <thead>
                    <Tr>
                        <Th>Type</Th>
                        <Th>Name</Th>
                        <Th>Created by</Th>
                        <Th>Category</Th>
                        <Th>Description</Th>
                        <Th>Activity</Th>
                        <Th>Last Modified</Th>
                        <Th>Status</Th>
                        <Th></Th>
                    </Tr>
                </thead>
                <tbody>
                    {agents.map((agent, index) => (
                        <Tr key={index} url={agent.url}>
                            <Td>
                                <Box color="fg.secondary">{agent.icon}</Box>
                            </Td>
                            <Td>
                                <Box>
                                    <Text fontWeight="500">{agent.name}</Text>
                                    <Text fontSize="sm" color="fg.secondary">
                                        {agent.handle}
                                    </Text>
                                    {agent.tag && (
                                        <Box mt="4">
                                            <Badge intent="success" variant="subtle">{agent.tag}</Badge>
                                        </Box>
                                    )}
                                </Box>
                            </Td>
                            <Td>
                                <Box display="flex" flexDirection="row" gap="8" alignItems="center">
                                    <Avatar name={agent.creator.name} src={agent.creator.avatar} size="sm" />
                                    <Text>{agent.creator.name}</Text>
                                </Box>
                            </Td>
                            <Td>
                                <Badge intent="information" variant="subtle">
                                    {agent.category}
                                </Badge>
                            </Td>
                            <Td width="400px">
                                <Text fontSize="sm" color="fg.default" lineClamp="2">
                                    {agent.description}
                                </Text>
                            </Td>
                            <Td>{agent.activity}</Td>
                            <Td>
                                <Box>
                                    <Text fontSize="sm">{agent.lastModified.date}</Text>
                                    <Text fontSize="xs" color="fg.secondary">by {agent.lastModified.user}</Text>
                                </Box>
                            </Td>
                            <Td type="badge" data={agent.status === "Active" ? "success" : "neutral"}>
                                {agent.status}
                            </Td>
                            <Td type="button">
                                {/* Uses default menu from Td */}
                            </Td>
                        </Tr>
                    ))}
                </tbody>
            </Table>
        </Box>
    );
}
