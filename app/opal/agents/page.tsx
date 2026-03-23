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
        id: "email-campaign",
        icon: <IconAgent />,
        emoji: "✍️",
        name: "Write an email campaign",
        handle: "@email_gen_agent",
        tag: "New",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Content strategy", bg: "#c6dbfa", color: "#0d46a0" }, { label: "Copywriting", bg: "#e9f7f1", color: "#17492b" }, { label: "Email marketing", bg: "#fdf4ff", color: "#701a75" }],
        description: "Generate compelling email campaigns tailored to your audience with strategic copy and subject lines.",
        activity: "0 Runs",
        lastModified: { date: "Mar 1, 2026", user: "John Smith" },
        status: "Active",
    },
    {
        id: "optimize-geo",
        icon: <IconAgent />,
        emoji: "🌐",
        name: "Optimize my GEO",
        handle: "@opal_GEO",
        tag: "New",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "SEO/GEO", bg: "#f5f3ff", color: "#4c1d95" }, { label: "Analytics", bg: "#c6dbfa", color: "#0d46a0" }],
        description: "Optimize your content for generative engine optimization to improve AI-driven discoverability and reach.",
        activity: "0 Runs",
        lastModified: { date: "Mar 1, 2026", user: "John Smith" },
        status: "Active",
    },
    {
        id: "analyze-competitors",
        icon: <IconAgent />,
        emoji: "📊",
        name: "Analyze my competitors",
        handle: "@competitors_are_dust",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Competitive analysis", bg: "#e9f7f1", color: "#17492b" }, { label: "Research", bg: "#f5f3ff", color: "#4c1d95" }],
        description: "Deep-dive into competitor strategies, positioning, and content to uncover opportunities for your brand.",
        activity: "2 Runs",
        lastModified: { date: "Feb 20, 2026", user: "John Smith" },
        status: "Active",
    },
    {
        id: "ab-experiment",
        icon: <IconAgent />,
        emoji: "⚗️",
        name: "Set up an A/B experiment",
        handle: "@ab_test_plan",
        tag: "New",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Testing", bg: "#e0f2fe", color: "#0369a1" }, { label: "Experimentation", bg: "#f5f3ff", color: "#4c1d95" }, { label: "CRO", bg: "#e9f7f1", color: "#17492b" }],
        description: "Design a rigorous A/B experiment with hypothesis, variants, metrics, and success criteria ready to run.",
        activity: "0 Runs",
        lastModified: { date: "Mar 1, 2026", user: "John Smith" },
        status: "Active",
    },
    {
        id: "content-calendar",
        icon: <IconAgent />,
        emoji: "📅",
        name: "Build a content calendar",
        handle: "@content_cal",
        tag: "New",
        creator: { name: "User Name", avatar: "/avatars/user.png" },
        tags: [{ label: "Content strategy", bg: "#c6dbfa", color: "#0d46a0" }, { label: "Planning", bg: "#fffaea", color: "#7a2e0d" }],
        description: "Plan and organize your content publishing schedule across channels for maximum impact and consistency.",
        activity: "1 Run",
        lastModified: { date: "Mar 5, 2026", user: "John Smith" },
        status: "Active",
    },
    {
        id: "ad-variations",
        icon: <IconAgent />,
        emoji: "🎨",
        name: "Generate ad variations",
        handle: "@ad_variants",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Paid media", bg: "#c6dbfa", color: "#0d46a0" }, { label: "Testing", bg: "#e0f2fe", color: "#0369a1" }],
        description: "Create multiple high-performing ad copy variations optimized for different audiences and placements.",
        activity: "3 Runs",
        lastModified: { date: "Feb 15, 2026", user: "John Smith" },
        status: "Active",
    },
    {
        id: "seo-audit",
        icon: <IconAgent />,
        emoji: "🔎",
        name: "Audit my SEO performance",
        handle: "@seo_audit",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Competitive analysis", bg: "#e9f7f1", color: "#17492b" }, { label: "Market review", bg: "#fffaea", color: "#7a2e0d" }, { label: "Keywords", bg: "#f5f3ff", color: "#4c1d95" }, { label: "Technical SEO", bg: "#e0f2fe", color: "#0369a1" }],
        description: "Audit your site's SEO health, identify gaps, and get prioritized recommendations to improve rankings.",
        activity: "4 Runs",
        lastModified: { date: "Feb 10, 2026", user: "John Smith" },
        status: "Active",
    },
    {
        id: "social-media-strategy",
        icon: <IconAgent />,
        emoji: "📱",
        name: "Create social media strategy",
        handle: "@social_strategy",
        creator: { name: "User Name", avatar: "/avatars/user.png" },
        tags: [{ label: "Strategy", bg: "#f5f3ff", color: "#4c1d95" }, { label: "Social media", bg: "#fdf4ff", color: "#701a75" }],
        description: "Build a comprehensive social media strategy with platform-specific content plans and engagement tactics.",
        activity: "5 Runs",
        lastModified: { date: "Jan 28, 2026", user: "John Smith" },
        status: "Active",
    },
    {
        id: "content-localizer",
        icon: <IconAgent />,
        emoji: "🌍",
        name: "Content Localizer",
        handle: "@content_localizer",
        creator: { name: "User Name", avatar: "/avatars/user.png" },
        tags: [{ label: "Content strategy", bg: "#c6dbfa", color: "#0d46a0" }, { label: "Localization", bg: "#e9f7f1", color: "#17492b" }],
        description: "Localize your content with specific regional context while maintaining brand voice.",
        activity: "1 Run",
        lastModified: { date: "Dec 1, 2025", user: "John Smith" },
        status: "Active",
    },
    {
        id: "heatmap-analysis",
        icon: <IconAgent />,
        emoji: "🔥",
        name: "Heatmap Analysis",
        handle: "@heatmap_analysis",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Testing", bg: "#e0f2fe", color: "#0369a1" }, { label: "Analytics", bg: "#c6dbfa", color: "#0d46a0" }],
        description:
            "Transforms a provided heatmap image and url into precise, tailored test ideas. It eliminates the burden of manual analysis, converting data into insights.",
        activity: "3 Runs",
        lastModified: { date: "Sep 15, 2025", user: "John Smith" },
        status: "Active",
    },
    {
        id: "experiment-planning",
        icon: <IconAgent />,
        emoji: "🧪",
        name: "Experiment Planning Agent",
        handle: "@test_planning",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Testing", bg: "#e0f2fe", color: "#0369a1" }, { label: "Experimentation", bg: "#f5f3ff", color: "#4c1d95" }],
        description:
            "Transforms your raw ideas into a fully-formed test plan, complete with suggested hypotheses, key metrics, identified risks, and more.",
        activity: "6 Runs",
        lastModified: { date: "Jul 29, 2025", user: "John Smith" },
        status: "Active",
    },
    {
        id: "geo-recommendations",
        icon: <IconAgent />,
        emoji: "📡",
        name: "GEO Recommendations",
        handle: "@opti_geo_recommendati...",
        tag: "Updated",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "SEO/GEO", bg: "#f5f3ff", color: "#4c1d95" }, { label: "Analytics", bg: "#c6dbfa", color: "#0d46a0" }],
        description:
            "Audits webpages for LLM discoverability, retrievability, and understandability to deliver actionable recommendations to optimize conversion.",
        activity: "4 Runs",
        lastModified: { date: "Oct 10, 2025", user: "John Smith" },
        status: "Inactive",
    },
    {
        id: "resource-manager",
        icon: <IconAgent />,
        emoji: "👥",
        name: "Resource Manager",
        handle: "@rm",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Planning", bg: "#fffaea", color: "#7a2e0d" }, { label: "Automation", bg: "#e9f7f1", color: "#17492b" }],
        description: "Look up available team members for task assignment based on workload and expertise.",
        activity: "7 Runs",
        lastModified: { date: "Jul 30, 2025", user: "John Smith" },
        status: "Inactive",
    },
    {
        id: "seo-keyword-research",
        icon: <IconAgent />,
        emoji: "🔑",
        name: "SEO Keyword Research",
        handle: "@seo_keyword_resaerch",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "SEO/GEO", bg: "#f5f3ff", color: "#4c1d95" }, { label: "Research", bg: "#e9f7f1", color: "#17492b" }],
        description:
            "Takes a topic, leverages data from Idea Lab and the broader web, and returns a curated list of keywords designed to maximize content reach.",
        activity: "2 Runs",
        lastModified: { date: "Nov 3, 2025", user: "John Smith" },
        status: "Active",
    },
    {
        id: "cmp-workflow",
        icon: <IconCodeBranch />,
        emoji: "⚙️",
        name: "CMP Workflow Agent",
        handle: "@cmp_workflow",
        creator: { name: "Optimizely", type: "system" },
        tags: [{ label: "Automation", bg: "#fffaea", color: "#7a2e0d" }, { label: "Campaigns", bg: "#e9f7f1", color: "#17492b" }],
        description: "Orchestrate specialized agents to process CMP webhook payloads and generate enriched campaign content.",
        activity: "0 Runs",
        lastModified: { date: "Mar 13, 2026", user: "Pei Chien" },
        status: "Active",
    },
    {
        id: "meeting-synthesizer",
        icon: <IconAgent />,
        emoji: "📝",
        name: "Meeting Synthesizer",
        handle: "@meeting_synthesizer",
        creator: { name: "User Name", avatar: "/avatars/user.png" },
        tags: [{ label: "Automation", bg: "#fffaea", color: "#7a2e0d" }, { label: "Planning", bg: "#e9f7f1", color: "#17492b" }],
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
        <Box p="24" display="flex" flexDirection="column" gap="24" overflow="auto" h="full">
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
                        <Th>Activity</Th>
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
                                <Box display="flex" flexDirection="row" gap="12" alignItems="start">
                                    {agent.emoji && (
                                        <Box
                                            style={{
                                                flexShrink: 0,
                                                width: 24,
                                                height: 24,
                                                borderRadius: 6,
                                                background: "radial-gradient(circle, rgba(245,243,255,1) 0%, rgba(229,239,255,1) 50%, rgba(221,214,254,1) 100%)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 13,
                                                lineHeight: 1,
                                            }}
                                        >
                                            {agent.emoji}
                                        </Box>
                                    )}
                                    <Box>
                                        <Text fontWeight="500">{agent.name}</Text>
                                        <Text fontSize="sm" color="fg.secondary">
                                            {agent.handle}
                                        </Text>
                                        {agent.tag && (
                                            <Box mt="4">
                                                <Badge intent={agent.tag === "New" ? "information" : "success"} variant="subtle">{agent.tag}</Badge>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Td>
                            <Td>
                                <Box display="flex" flexDirection="row" gap="8" alignItems="center">
                                    <Avatar name={agent.creator.name} src={agent.creator.avatar} size="sm" />
                                    <Text>{agent.creator.name}</Text>
                                </Box>
                            </Td>
                            <Td>
                                <Box display="flex" flexDirection="row" gap="4" style={{ flexWrap: "wrap" }}>
                                    {agent.tags?.map((tag) => (
                                        <span key={tag.label} style={{
                                            background: tag.bg,
                                            color: tag.color,
                                            borderRadius: 6,
                                            padding: "2px 6px",
                                            fontSize: 12,
                                            lineHeight: "16px",
                                            fontFamily: "Inter, sans-serif",
                                            whiteSpace: "nowrap",
                                        }}>
                                            {tag.label}
                                        </span>
                                    ))}
                                </Box>
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
