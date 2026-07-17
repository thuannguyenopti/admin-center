"use client";

import {
    Box,
    Button,
    Text,
    Badge,
    Avatar,
    Disclosure,
    DisclosureTrigger,
    DisclosureContent,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Tooltip,
    Link,
} from "@optiaxiom/react";
import {
    HoverCard,
    HoverCardTrigger,
    HoverCardContent,
} from "@optiaxiom/react/unstable";
import { IconCopy } from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";
import AgentIcon from "@/app/assets/agent-icon.svg";
import CloseIcon from "@/app/assets/close-icon.svg";
import HelpIcon from "@/app/assets/help-icon.svg";
import ExpandIcon from "@/app/assets/expand-icon.svg";
import ChevronRightDisclosure from "@/app/assets/chevron-right-disclosure.svg";
import SparklesIcon from "@/app/assets/sparkles-icon.svg";
import DownloadIcon from "@/app/assets/download-icon.svg";
import ChevronDownSmall from "@/app/assets/chevron-down-small.svg";

interface DetailsPanelProps {
    activity: any;
    onClose: () => void;
    focusOutput?: boolean;
}

const GuardrailHoverCardContent = ({ status, mode, isHelp }: { status?: string, mode?: string, isHelp?: boolean }) => {
    if (isHelp) {
        return (
            <Box display="flex" flexDirection="column" gap="8">
                <Box display="flex" flexDirection="column" gap="4">
                    <Text fontSize="md" fontWeight="600">Execution Guardrails</Text>
                    <Text fontSize="sm" color="fg.secondary">
                        Execution status based on the agent’s guardrails.
                    </Text>
                </Box>
                <Link
                    href="https://support.optimizely.com/hc/en-us/articles/39333562134413-Create-specialized-agents"
                    target="_blank"
                    fontSize="sm"
                    color="fg.accent"
                >
                    Learn more
                </Link>
            </Box>
        );
    }

    let content = "";
    if (status === "Passed") content = "This execution operated within the current guardrails for this agent.";
    if (status === "Failed") content = "The agent did not complete its execution due to a system or runtime failure.";
    if (status === "Terminated") content = "The execution was automatically stopped after anomalous tool call behavior was detected.";
    if (status === "Review Needed") content = "Anomalous tool call behavior was detected in Observer mode and flagged for review.";

    if (!content) return null;

    return (
        <Box display="flex" flexDirection="column" gap="8">
            <Box display="flex" flexDirection="column" gap="4">
                <Text fontSize="md" fontWeight="600">Execution Guardrails: {status}</Text>
                <Text fontSize="sm" color="fg.secondary">{content}</Text>
                {mode && (
                    <Text fontSize="sm" color="fg.secondary" mt="4">
                        Agent Mode: <strong>{mode}</strong>
                    </Text>
                )}
            </Box>
            <Link
                href="https://support.optimizely.com/hc/en-us/articles/39333562134413-Create-specialized-agents"
                target="_blank"
                fontSize="sm"
                color="fg.accent"
            >
                Learn more
            </Link>
        </Box>
    );
};



const QualityScoreHoverCardContent = ({ score, baseScore, isHelp, isPassed: isPassedProp }: { score?: string, baseScore?: string, isHelp?: boolean, isPassed?: boolean }) => {
    if (isHelp) {
        return (
            <Box display="flex" flexDirection="column" gap="8">
                <Box display="flex" flexDirection="column" gap="4">
                    <Text fontSize="md" fontWeight="600">Output Quality Score</Text>
                    <Text fontSize="sm" color="fg.secondary">
                        An LLM-assessed score measuring how well the output meets the agent builder’s quality standards and examples.
                    </Text>
                </Box>
                <Link
                    href="https://support.optimizely.com/hc/en-us/articles/39333562134413-Create-specialized-agents#h_01KACEGNBW103Q3S521AN6YA5R"
                    target="_blank"
                    fontSize="sm"
                    color="fg.accent"
                >
                    Learn more
                </Link>
            </Box>
        );
    }

    const isPassed = isPassedProp ?? (score === "95%");
    const status = isPassed ? "Passed" : "Failed";

    return (
        <Box display="flex" flexDirection="column" gap="8">
            <Box display="flex" flexDirection="column" gap="4">
                <Text fontSize="md" fontWeight="600">Output Quality: {status}</Text>
                <Text fontSize="sm" color="fg.secondary">
                    {isPassed
                        ? "This output met the agent builder’s quality threshold based on LLM evaluation."
                        : "This output fell below the agent builder’s quality threshold based on LLM evaluation."}
                </Text>
                {baseScore && (
                    <Text fontSize="sm" color="fg.secondary">
                        Minimum base score: <strong>{baseScore}</strong>
                    </Text>
                )}
            </Box>
            <Link
                href="https://support.optimizely.com/hc/en-us/articles/39333562134413-Create-specialized-agents#h_01KACEGNBW103Q3S521AN6YA5R"
                target="_blank"
                fontSize="sm"
                color="fg.accent"
            >
                Learn more
            </Link>
        </Box>
    );
};


export default function DetailsPanel({ activity, onClose, focusOutput }: DetailsPanelProps) {
    const [panelWidth, setPanelWidth] = useState(360);
    const [isResizing, setIsResizing] = useState(false);
    const [openSections, setOpenSections] = useState<string[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const outputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (focusOutput) {
            setOpenSections(prev => Array.from(new Set([...prev, "output"])));
            setTimeout(() => {
                outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        }
    }, [focusOutput]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        const startX = e.clientX;
        const startWidth = panelWidth;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const delta = startX - moveEvent.clientX;
            const newWidth = Math.max(320, Math.min(600, startWidth + delta));
            setPanelWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    const toggleSection = (id: string) => {
        setOpenSections(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const expandAll = () => {
        setOpenSections(["input", "output", "memory"]);
    };

    const statusIntent =
        activity.status === "Completed" ? "success" :
            activity.status === "Review Needed" ? "warning" :
                activity.status === "Failed" ? "danger" : "neutral";

    const guardrailStatus = activity.guardrails && activity.guardrails !== "--"
        ? activity.guardrails
        : (activity.status === "Completed" ? "Passed" : activity.status);

    const guardrailIntent =
        guardrailStatus === "Passed" ? "success" :
            (guardrailStatus === "Failed" || guardrailStatus === "Terminated") ? "danger" :
                guardrailStatus === "Review Needed" ? "warning" : "neutral";

    if (!isMounted) return null;

    return (
        <Box
            bg="bg.default"
            borderL="1"
            borderColor="border.tertiary"
            style={{
                width: `${panelWidth}px`,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                zIndex: 50,
                transition: isResizing ? "none" : "width 0.1s ease",
            }}
        >
            {/* Resize Handle */}
            <div
                onMouseDown={handleMouseDown}
                style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "12px",
                    height: "48px",
                    cursor: "col-resize",
                    zIndex: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#F5F6FA",
                    border: "1px solid #CACFDC",
                    borderRadius: "4px",
                    marginLeft: "-6px"
                }}
            >
                <Box color="fg.tertiary" display="flex" flexDirection="column" gap="4">
                    <Box style={{ width: '2px', height: '2px', backgroundColor: 'currentColor', borderRadius: '50%' }} />
                    <Box style={{ width: '2px', height: '2px', backgroundColor: 'currentColor', borderRadius: '50%' }} />
                    <Box style={{ width: '2px', height: '2px', backgroundColor: 'currentColor', borderRadius: '50%' }} />
                </Box>
            </div>

            {/* Header */}
            <Box px="24" py="20" display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap="8">
                    <Box p="4" style={{ backgroundColor: '#F0F2F7', borderRadius: '6px' }}>
                        <AgentIcon width={17} height={16} />
                    </Box>
                    <Text fontWeight="600" fontSize="md" style={{ letterSpacing: "-0.2px" }}>Agent Execution</Text>
                    <Badge intent={statusIntent as any}>{activity.status}</Badge>
                </Box>
                <Button appearance="subtle" size="sm" onClick={onClose} icon={<CloseIcon width={10} height={10} />} aria-label="Close" />
            </Box>

            {/* Content */}
            <Box flex="1" overflowY="auto">
                <Tabs defaultValue="details">
                    <Box px="16" borderB="1" borderColor="border.tertiary">
                        <TabsList borderB="0">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="trace">Trace</TabsTrigger>
                        </TabsList>
                    </Box>

                    <Box p="16">
                        <TabsContent value="details">
                            <Box display="flex" flexDirection="column" gap="16">
                                {/* Metrics Table */}
                                <Box border="1" borderColor="border.tertiary" style={{ borderRadius: '6px', overflow: 'hidden' }}>
                                    <MetricRow label="Agent Name">
                                        <Box display="flex" alignItems="center" justifyContent="space-between" w="full">
                                            <Box>
                                                <Text fontSize="md" fontWeight="400">{activity.agent.name}</Text>
                                                <Text fontSize="sm" color="fg.secondary">{activity.agent.version}</Text>
                                            </Box>
                                            <IconCopy size={16} color="#4F576E" style={{ cursor: 'pointer' }} />
                                        </Box>
                                    </MetricRow>
                                    <MetricRow label="Execution ID" borderT>
                                        <Box display="flex" alignItems="center" justifyContent="space-between" w="full">
                                            <Text fontSize="md" fontWeight="400" truncate>{activity.id}</Text>
                                            <IconCopy size={16} color="#4F576E" style={{ cursor: 'pointer' }} />
                                        </Box>
                                    </MetricRow>
                                    <MetricRow label="Execution Started" borderT>
                                        <Text fontSize="md" fontWeight="400">{activity.started.replace('\n', ', ')}</Text>
                                    </MetricRow>
                                    <MetricRow label="Duration" borderT>
                                        <Text fontSize="md" fontWeight="400">{activity.duration || "5.98 seconds"}</Text>
                                    </MetricRow>
                                    <MetricRow label="Executed By" borderT>
                                        <Box display="flex" alignItems="center" gap="8">
                                            <Avatar size="xs" src={activity.triggeredBy.avatar} name={activity.triggeredBy.name} />
                                            <Text fontSize="md" fontWeight="400">{activity.triggeredBy.name}</Text>
                                        </Box>
                                    </MetricRow>
                                    {(() => {
                                        const scoreValue = parseInt(activity.qualityScore);
                                        const isPassed = !isNaN(scoreValue) && scoreValue >= 85;
                                        return (
                                            <MetricRow
                                                label="Output Quality Score"
                                                borderT
                                                helpContent={
                                                    <HoverCard openDelay={200}>
                                                        <HoverCardTrigger asChild>
                                                            <HelpIcon width={16} height={16} color="#4F576E" style={{ cursor: "help" }} />
                                                        </HoverCardTrigger>
                                                        <HoverCardContent style={{ maxWidth: "280px" }}>
                                                            <QualityScoreHoverCardContent isHelp />
                                                        </HoverCardContent>
                                                    </HoverCard>
                                                }
                                            >
                                                <Box display="flex" alignItems="center" gap="8">
                                                    <Text fontSize="md" fontWeight="400" style={{ color: isPassed ? "#24663E" : "#911D1D" }}>
                                                        {activity.qualityScore}
                                                    </Text>
                                                    <HoverCard openDelay={200}>
                                                        <HoverCardTrigger asChild>
                                                            <Box display="inline-block">
                                                                <Badge intent={isPassed ? "success" : "danger"}>
                                                                    {isPassed ? "Passed" : "Failed"}
                                                                </Badge>
                                                            </Box>
                                                        </HoverCardTrigger>
                                                        <HoverCardContent style={{ maxWidth: "280px" }}>
                                                            <QualityScoreHoverCardContent
                                                                score={activity.qualityScore}
                                                                baseScore={(activity.agent as any).baseQualityScore}
                                                                isPassed={isPassed}
                                                            />
                                                        </HoverCardContent>
                                                    </HoverCard>
                                                </Box>
                                            </MetricRow>
                                        );
                                    })()}
                                    <MetricRow
                                        label="Guardrail Status"
                                        borderT
                                        helpContent={
                                            <HoverCard openDelay={200}>
                                                <HoverCardTrigger asChild>
                                                    <HelpIcon width={16} height={16} color="#4F576E" style={{ cursor: "help" }} />
                                                </HoverCardTrigger>
                                                <HoverCardContent style={{ maxWidth: "280px" }}>
                                                    <GuardrailHoverCardContent isHelp />
                                                </HoverCardContent>
                                            </HoverCard>
                                        }
                                    >
                                        <HoverCard openDelay={200}>
                                            <HoverCardTrigger asChild>
                                                <Box display="inline-block">
                                                    <Badge intent={guardrailIntent as any}>{guardrailStatus}</Badge>
                                                </Box>
                                            </HoverCardTrigger>
                                            <HoverCardContent style={{ maxWidth: "280px" }}>
                                                <GuardrailHoverCardContent status={guardrailStatus} />
                                            </HoverCardContent>
                                        </HoverCard>
                                    </MetricRow>
                                    <MetricRow label="Credits" borderT>
                                        <Text fontSize="md" fontWeight="400">20 credits</Text>
                                    </MetricRow>
                                </Box>

                                {/* Disclosures */}
                                <Box display="flex" justifyContent="end">
                                    <Button appearance="subtle" size="sm" onClick={expandAll} icon={<ExpandIcon width={16} height={16} />} aria-label="Expand all sections">
                                        Expand all
                                    </Button>
                                </Box>

                                <Box display="flex" flexDirection="column">
                                    <DisclosureItem
                                        label="Input Variables"
                                        isOpen={openSections.includes("input")}
                                        onToggle={() => toggleSection("input")}
                                    >
                                        <Box p="12">Input content placeholder...</Box>
                                    </DisclosureItem>

                                    <DisclosureItem
                                        label="Output"
                                        isOpen={openSections.includes("output")}
                                        onToggle={() => toggleSection("output")}
                                        ref={outputRef}
                                    >
                                        <Box p="12" display="flex" flexDirection="column" gap="8">
                                            <Box display="flex" alignItems="center" gap="8">
                                                <Text fontSize="md" fontWeight="500">Output Quality Score: {activity.qualityScore}</Text>
                                                {(() => {
                                                    const scoreValue = parseInt(activity.qualityScore);
                                                    const isPassed = !isNaN(scoreValue) && scoreValue >= 85;
                                                    return (
                                                        <HoverCard openDelay={200}>
                                                            <HoverCardTrigger asChild>
                                                                <Box display="inline-block">
                                                                    <Badge intent={isPassed ? "success" : "danger"}>
                                                                        {isPassed ? "Passed" : "Failed"}
                                                                    </Badge>
                                                                </Box>
                                                            </HoverCardTrigger>
                                                            <HoverCardContent style={{ maxWidth: "280px" }}>
                                                                <QualityScoreHoverCardContent
                                                                    score={activity.qualityScore}
                                                                    baseScore={(activity.agent as any).baseQualityScore}
                                                                    isPassed={isPassed}
                                                                />
                                                            </HoverCardContent>
                                                        </HoverCard>
                                                    );
                                                })()}
                                                <HoverCard openDelay={200}>
                                                    <HoverCardTrigger asChild>
                                                        <HelpIcon width={16} height={16} color="#4F576E" style={{ cursor: 'help' }} />
                                                    </HoverCardTrigger>
                                                    <HoverCardContent style={{ maxWidth: "280px" }}>
                                                        <QualityScoreHoverCardContent isHelp />
                                                    </HoverCardContent>
                                                </HoverCard>
                                            </Box>

                                            <Box display="flex" flexDirection="column" gap="4" pl="24">
                                                <Text fontSize="md" color="fg.default">Minimum base score : 80%</Text>
                                                <Text fontSize="md" color="fg.default" style={{ lineHeight: '20px' }}>
                                                    Evaluation Feedback: Exceptional output. The agent provided a highly structured, comprehensive, and strategically insightful keyword analysis with a strong rationale, exceeding implicit expectations.
                                                </Text>
                                            </Box>

                                            <Box display="flex" alignItems="center" gap="8" mt="8">
                                                <Text fontSize="md" fontWeight="500">Guardrail Status : </Text>
                                                <HoverCard openDelay={200}>
                                                    <HoverCardTrigger asChild>
                                                        <Box display="inline-block">
                                                            <Badge intent={guardrailIntent as any}>{guardrailStatus}</Badge>
                                                        </Box>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent style={{ maxWidth: "280px" }}>
                                                        <GuardrailHoverCardContent status={guardrailStatus} mode={activity.agent.mode} />
                                                    </HoverCardContent>
                                                </HoverCard>
                                                <HoverCard openDelay={200}>
                                                    <HoverCardTrigger asChild>
                                                        <HelpIcon width={16} height={16} color="#4F576E" style={{ cursor: 'help' }} />
                                                    </HoverCardTrigger>
                                                    <HoverCardContent style={{ maxWidth: "280px" }}>
                                                        <GuardrailHoverCardContent isHelp />
                                                    </HoverCardContent>
                                                </HoverCard>
                                            </Box>

                                            <Box pl="24" mt="4">
                                                <Button size="sm" appearance="default" style={{ borderRadius: '999px' }} icon={<SparklesIcon width={16} height={16} />} aria-label="Explain this quality result">
                                                    Explain this
                                                </Button>
                                            </Box>
                                        </Box>
                                    </DisclosureItem>

                                    <DisclosureItem
                                        label="Execution Memory"
                                        isOpen={openSections.includes("memory")}
                                        onToggle={() => toggleSection("memory")}
                                    >
                                        <Box p="12">Memory usage details...</Box>
                                    </DisclosureItem>
                                </Box>
                            </Box>
                        </TabsContent>
                    </Box>
                </Tabs>
            </Box>

            {/* Footer */}
            <Box p="16" borderT="1" borderColor="border.tertiary" display="flex" justifyContent="center" gap="8" bg="bg.default">
                <Box display="flex" alignItems="center" style={{ border: '1px solid #CACFDC', borderRadius: '6px', overflow: 'hidden' }}>
                    <Button appearance="subtle" size="md" icon={<DownloadIcon width={16} height={16} />} style={{ borderRight: '1px solid #CACFDC', borderRadius: 0 }} aria-label="Download execution logs">
                        Download
                    </Button>
                    <Box px="8" py="10" cursor="pointer" className="hover:bg-[var(--ax-colors-bg-default-hovered)]" asChild>
                        <div>
                            <ChevronDownSmall width={11} height={5} />
                        </div>
                    </Box>
                </Box>
                <Button appearance="default" size="md" onClick={onClose} style={{ minWidth: '80px' }}>
                    Close
                </Button>
            </Box>
        </Box>
    );
}

function MetricRow({ label, children, borderT, helpText, helpContent }: { label: string; children: React.ReactNode; borderT?: boolean; helpText?: string; helpContent?: React.ReactNode }) {
    return (
        <Box display="flex" p="16" borderT={borderT ? "1" : "0"} borderColor="border.tertiary" bg="bg.default">
            <Box display="flex" alignItems="center" gap="4" style={{ width: '128px' }}>
                <Text fontSize="md" fontWeight="500" color="fg.default">{label}</Text>
                {helpContent ? helpContent : (helpText && (
                    <Tooltip content={helpText}>
                        <HelpIcon width={16} height={16} color="#4F576E" />
                    </Tooltip>
                ))}
            </Box>
            <Box flex="1">
                {children}
            </Box>
        </Box>
    );
}

import React from "react";
const DisclosureItem = React.forwardRef(({ label, isOpen, onToggle, children }: { label: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }, ref: any) => {
    return (
        <Box ref={ref} borderB="1" borderColor="border.tertiary">
            <Box
                px="16" py="12"
                display="flex" alignItems="center" gap="8"
                cursor="pointer"
                onClick={onToggle}
                className="hover:bg-[var(--ax-colors-bg-default-hovered)]"
            >
                <Box style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: 'transform 0.2s' }}>
                    <ChevronRightDisclosure width={6} height={11} />
                </Box>
                <Text fontSize="md" fontWeight="500" color="fg.default">{label}</Text>
            </Box>
            {isOpen && <Box style={{ backgroundColor: '#F9FAFB' }}>{children}</Box>}
        </Box>
    );
});