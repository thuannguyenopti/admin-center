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
    LabelMenuButton,
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
import { Input } from "@/app/components/Input";
import { useState } from "react";
import { useRouter } from "next/navigation";

const agents = [
    {
        id: "content-localizer",
        icon: <IconAgent />,
        name: "Content Localizer",
        handle: "@content_localizer",
        creator: { name: "User Name", avatar: "/avatars/user.png" }, // Mock avatar
        category: "Marketing",
        categoryColor: "primary",
        description: "Localize your content with specific regional context while maintaining brand voice.",
        activity: "1 Run",
        lastModified: { date: "Dec 1, 2025", user: "John Smith" },
        status: "Active",
    },
    {
        id: "heatmap-analysis",
        icon: <IconAgent />,
        name: "Heatmap Analysis",
        handle: "@heatmap_analysis",
        creator: { name: "Optimizely", type: "system", avatar: "/logo.svg" },
        category: "Optimization",
        categoryColor: "primary",
        description:
            "Transforms a provided heatmap image and url into precise, tailored test ideas. It eliminates the burden of manual analysis, converting data into insights.",
        activity: "3 Runs",
        lastModified: { date: "Sep 15, 2025", user: "John Smith" },
        status: "Active",
    },
    {
        id: "cmp-workflow",
        icon: <IconCodeBranch />,
        name: "CMP Workflow Agent",
        handle: "@cmp_workflow",
        creator: { name: "Optimizely", type: "system", avatar: "/logo.svg" },
        category: "Marketing",
        categoryColor: "primary",
        description: "Orchestrate specialized agents to process CMP webhook payloads and generate enriched campaign content.",
        activity: "0 Runs",
        lastModified: { date: "Mar 13, 2026", user: "Pei Chien" },
        status: "Active",
    },
    {
        id: "experiment-planning",
        icon: <IconAgent />,
        name: "Experiment Planning Agent",
        handle: "@test_planning",
        creator: { name: "Optimizely", type: "system", avatar: "/logo.svg" },
        category: "Product",
        categoryColor: "primary",
        description:
            "Transforms your raw ideas into a fully-formed test plan, complete with suggested hypotheses, key metrics, identified risks, and more.",
        activity: "6 Runs",
        lastModified: { date: "Jul 29, 2025", user: "John Smith" },
        status: "Active",
    },
    {
        id: "geo-recommendations",
        icon: <IconAgent />,
        name: "GEO Recommendations",
        handle: "@opti_geo_recommendati...",
        tag: "Updated",
        creator: { name: "Optimizely", type: "system", avatar: "/logo.svg" },
        category: "SEO",
        categoryColor: "primary",
        description:
            "Audits webpages for LLM discoverability, retrievability, and understandability to deliver actionable recommendations to optimize conversion.",
        activity: "4 Runs",
        lastModified: { date: "Oct 10, 2025", user: "John Smith" },
        status: "Inactive",
    },
    {
        id: "resource-manager",
        icon: <IconAgent />,
        name: "Resource Manager",
        handle: "@rm",
        creator: { name: "Optimizely", type: "system", avatar: "/logo.svg" },
        category: "Project Mgmt",
        categoryColor: "primary",
        description: "Look up available team members for task assignment based on workload and expertise.",
        activity: "7 Runs",
        lastModified: { date: "Jul 30, 2025", user: "John Smith" },
        status: "Inactive",
    },
    {
        id: "seo-keyword-research",
        icon: <IconAgent />,
        name: "SEO Keyword Research",
        handle: "@seo_keyword_resaerch",
        creator: { name: "Optimizely", type: "system", avatar: "/logo.svg" },
        category: "Marketing",
        categoryColor: "primary",
        description:
            "Takes a topic, leverages data from Idea Lab and the broader web, and returns a curated list of keywords designed to maximize content reach.",
        activity: "2 Runs",
        lastModified: { date: "Nov 3, 2025", user: "John Smith" },
        status: "Active",
    },
    {
        id: "meeting-synthesizer",
        icon: <IconAgent />,
        name: "Meeting Synthesizer",
        handle: "@meeting_synthesizer",
        creator: { name: "User Name", avatar: "/avatars/user.png" },
        category: "Productivity",
        categoryColor: "primary",
        description: "Summarize your meeting transcripts into actionable items and key takeaways.",
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
            <Box display="flex" flexDirection="column" gap="8">
                <Heading level="1" fontSize="2xl">Agents</Heading>
                <Text color="fg.secondary">Empower your marketing team by customizing Opal agents to meet your specific needs.</Text>
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
                <Box display="flex" gap="12" alignItems="center">
                    <Box className="w-[300px]">
                        <Input placeholder="Enter name or description" />
                    </Box>

                    {["Type", "Category", "Created by", "Modified by"].map((filter) => (
                        <Menu
                            key={filter}
                            placeholder={`Search ${filter.toLowerCase()}...`}
                            options={[{ label: "All" }]}
                        >
                            <MenuTrigger asChild>
                                <LabelMenuButton label={filter} h="40">
                                    All
                                </LabelMenuButton>
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
                        <Th>Activity / Runs</Th>
                        <Th>Last Modified</Th>
                        <Th>Status</Th>
                        <Th></Th>
                    </Tr>
                </thead>
                <tbody>
                    {agents.map((agent, index) => (
                        <Tr key={index} url={agent.id === 'cmp-workflow' ? '/opal/agents/workflow?preset=cmp-workflow' : `/opal/agents/setup?id=${agent.id}&mode=edit`}>
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
                                    {agent.creator.type === "system" ? (
                                        <Box className="w-6 h-6 rounded-full flex items-center justify-center bg-white border border-gray-200 overflow-hidden shrink-0">
                                            <img src={agent.creator.avatar} className="w-3.5 h-3.5" alt="" />
                                        </Box>
                                    ) : (
                                        <Avatar name={agent.creator.name} src={agent.creator.avatar} size="sm" />
                                    )}
                                    <Text>{agent.creator.name}</Text>
                                </Box>
                            </Td>
                            <Td>
                                <Badge intent="information" variant="subtle" className="whitespace-nowrap truncate max-w-[200px] block">
                                    {agent.category}
                                </Badge>
                            </Td>
                            <Td width="400px">
                                <Text fontSize="sm" color="fg.default" lineClamp="2">
                                    {agent.description}
                                </Text>
                            </Td>
                            <Td>{agent.activity.replace(/ Run(s)?/g, "")}</Td>
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
