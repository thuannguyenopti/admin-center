"use client";

import {
    Box,
    Text,
    Button,
    Disclosure,
    DisclosureTrigger,
    DisclosureContent,
} from "@optiaxiom/react";
import { IconChevronLeft, IconPlus } from "@optimizely/axiom-icons";
import {
    IconSparkles,
    IconX,
    IconGripVertical,
    IconLayoutList,
} from "@tabler/icons-react";

type StepContent = {
    title: string;
    bullets: string[];
    showShortcuts: boolean;
    showCommonActions: boolean;
};

const STEP_CONTENT: Record<string | number, StepContent> = {
    default: {
        title: "Prompt Template Assistant",
        bullets: [
            "Clearly define your agent's role and goals.",
            "Use variables for user's dynamic input, such as a specific URL.",
            "Provide sample output format to ensure consistency.",
        ],
        showShortcuts: true,
        showCommonActions: true,
    },
    1: {
        title: "Interaction Mode",
        bullets: [
            "Single-turn agents execute once per invocation.",
            "Multi-turn agents maintain context across exchanges.",
            "Enable multi-turn when users need to refine or follow up.",
        ],
        showShortcuts: false,
        showCommonActions: false,
    },
    2: {
        title: "Prompt Template",
        bullets: [
            "Describe the agent's role clearly at the top.",
            "Use [[variable]] for dynamic user inputs.",
            "Use { Instruction } blocks for inline directives.",
            "Use `tool` backtick syntax to invoke tools.",
        ],
        showShortcuts: true,
        showCommonActions: true,
    },
    3: {
        title: "System Prompt",
        bullets: [
            "Sets the agent's persona and guardrails — hidden from users.",
            "Always active in the background.",
            "Keep it concise: e.g. 'Never fabricate data.'",
        ],
        showShortcuts: false,
        showCommonActions: false,
    },
    4: {
        title: "Token Budget",
        bullets: [
            "Controls how many turns are kept in context.",
            "Higher values increase memory but also cost and latency.",
            "Recommended: 10 turns. Use 20+ for long research tasks.",
        ],
        showShortcuts: false,
        showCommonActions: false,
    },
    5: {
        title: "First Message",
        bullets: [
            "A static greeting shown before the user starts typing.",
            "Not sent to the model — purely a UI affordance.",
            "Use it to set expectations or suggest how to begin.",
        ],
        showShortcuts: false,
        showCommonActions: false,
    },
};

const SHORTCUTS = [
    { key: "/", label: "for all options" },
    { key: "[", label: "for variables" },
    { key: "{", label: "for instructions, retrieval (RAG), or example shots" },
    { key: "`", label: "for tools" },
];

const COMMON_ACTIONS = ["Create PDF", "Export to CSV", "Send Email"];

interface AgentAssistantPanelProps {
    activeStep: number | null;
    isOpen: boolean;
    onClose: () => void;
    view: "assistant" | "guide";
    onViewChange: (v: "assistant" | "guide") => void;
}

export function AgentAssistantPanel({
    activeStep,
    isOpen,
    onClose,
    view,
    onViewChange,
}: AgentAssistantPanelProps) {
    const content = STEP_CONTENT[activeStep ?? "default"] ?? STEP_CONTENT["default"];

    return (
        <Box
            style={{
                width: isOpen ? "348px" : "0px",
                transition: "width 0.3s ease-in-out",
                overflow: "hidden",
                display: "flex",
                flexShrink: 0,
                padding: isOpen ? "16px 16px 16px 0" : "0",
                alignItems: "flex-start",
            }}
        >
            {isOpen && (
                view === "assistant" ? (
                    <Box display="flex" flexDirection="column" style={{
                        flex: 1,
                        position: "relative",
                        overflow: "hidden",
                        border: "1px solid var(--ax-colors-border-secondary)",
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                        backgroundColor: "var(--ax-colors-bg-default)",
                        maxHeight: "calc(100vh - 112px)",
                    }}>
                        {/* Purple gradient background ellipse */}
                        <Box
                            style={{
                                position: "absolute",
                                width: "452px",
                                height: "452px",
                                top: "128px",
                                left: "-15px",
                                borderRadius: "50%",
                                background: "radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)",
                                filter: "blur(40px)",
                                pointerEvents: "none",
                                zIndex: 0,
                            }}
                        />

                        {/* Header */}
                        <Box
                            px="16"
                            py="12"
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            style={{
                                borderBottom: "1px solid var(--ax-colors-border-secondary)",
                                flexShrink: 0,
                                position: "relative",
                                zIndex: 1,
                            }}
                        >
                            <Box display="flex" alignItems="center" gap="8">
                                <IconSparkles size={18} color="var(--ax-colors-fg-tertiary)" />
                                <Text fontWeight="500" fontSize="md" color="fg.default">
                                    {content.title}
                                </Text>
                            </Box>
                            <Button
                                appearance="subtle"
                                size="sm"
                                onClick={() => onViewChange("guide")}
                            >
                                View guide
                            </Button>
                        </Box>

                        {/* Scrollable body */}
                        <Box
                            px="16"
                            py="16"
                            display="flex"
                            flexDirection="column"
                            gap="20"
                            style={{
                                flex: 1,
                                overflowY: "auto",
                                position: "relative",
                                zIndex: 1,
                            }}
                        >
                            {/* Contextual bullets */}
                            <Box display="flex" flexDirection="column" gap="8">
                                {content.bullets.map((bullet, i) => (
                                    <Box key={i} display="flex" gap="8" style={{ alignItems: "flex-start" }}>
                                        <Text
                                            color="fg.tertiary"
                                            fontSize="sm"
                                            style={{ flexShrink: 0, lineHeight: "20px" }}
                                        >
                                            •
                                        </Text>
                                        <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "20px" }}>
                                            {bullet}
                                        </Text>
                                    </Box>
                                ))}
                            </Box>

                            {/* Shortcuts */}
                            {content.showShortcuts && (
                                <Box display="flex" flexDirection="column" gap="8">
                                    <Text fontSize="sm" color="fg.secondary" fontWeight="500">
                                        Shortcuts:
                                    </Text>
                                    {SHORTCUTS.map(({ key, label }) => (
                                        <Box key={key} display="flex" gap="8" style={{ alignItems: "center" }}>
                                            <Text
                                                color="fg.tertiary"
                                                fontSize="sm"
                                                style={{ flexShrink: 0, lineHeight: "20px" }}
                                            >
                                                •
                                            </Text>
                                            <Box display="flex" gap="4" style={{ alignItems: "center", flexWrap: "wrap" }}>
                                                <Text fontSize="sm" color="fg.secondary">Type</Text>
                                                <Box
                                                    as="code"
                                                    style={{
                                                        background: "var(--ax-colors-bg-accent-subtle)",
                                                        border: "1px solid var(--ax-colors-border-secondary)",
                                                        borderRadius: "4px",
                                                        padding: "0 5px",
                                                        fontFamily: "monospace",
                                                        fontSize: "12px",
                                                        color: "var(--ax-colors-fg-default)",
                                                        lineHeight: "20px",
                                                    }}
                                                >
                                                    {key}
                                                </Box>
                                                <Text fontSize="sm" color="fg.secondary">{label}</Text>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* Common Actions */}
                            {content.showCommonActions && (
                                <Box display="flex" flexDirection="column" gap="8">
                                    <Box display="flex" gap="8" alignItems="center">
                                        <IconLayoutList size={16} color="var(--ax-colors-fg-tertiary)" />
                                        <Text fontWeight="500" fontSize="sm" color="fg.default">
                                            Common Actions
                                        </Text>
                                    </Box>
                                    <Box display="flex" flexDirection="column" gap="4">
                                        {COMMON_ACTIONS.map((action) => (
                                            <Disclosure key={action} rounded="sm" defaultOpen={false}>
                                                <DisclosureTrigger fontSize="sm">
                                                    <Box display="flex" gap="8" alignItems="center">
                                                        <IconGripVertical
                                                            size={14}
                                                            color="var(--ax-colors-fg-tertiary)"
                                                            style={{ flexShrink: 0 }}
                                                        />
                                                        <Text fontSize="sm" color="fg.default">{action}</Text>
                                                    </Box>
                                                </DisclosureTrigger>
                                                <DisclosureContent pb="8" pl="8">
                                                    <Button
                                                        appearance="subtle"
                                                        size="sm"
                                                        icon={<IconPlus size={14} />}
                                                    >
                                                        Insert to Prompt Template
                                                    </Button>
                                                </DisclosureContent>
                                            </Disclosure>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>
                ) : (
                    /* Guide view */
                    <Box display="flex" flexDirection="column" style={{
                        flex: 1,
                        border: "1px solid var(--ax-colors-border-secondary)",
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                        backgroundColor: "var(--ax-colors-bg-default)",
                        overflow: "hidden",
                        maxHeight: "calc(100vh - 112px)",
                    }}>
                        <Box
                            px="16"
                            py="12"
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}
                        >
                            <Box display="flex" alignItems="center" gap="4">
                                <Button
                                    appearance="subtle"
                                    size="sm"
                                    icon={<IconChevronLeft size={16} />}
                                    aria-label="Back to assistant"
                                    onClick={() => onViewChange("assistant")}
                                />
                                <Text fontWeight="500" fontSize="md" color="fg.default">
                                    Quick-start guide
                                </Text>
                            </Box>
                            <Button
                                appearance="subtle"
                                size="sm"
                                icon={<IconX size={16} />}
                                aria-label="Close panel"
                                onClick={onClose}
                            />
                        </Box>
                        <Box style={{ flex: 1, overflow: "hidden" }}>
                            <iframe
                                src="/agent-cheat-sheet.html"
                                style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                                title="Multi-turn agent quick-start guide"
                            />
                        </Box>
                    </Box>
                )
            )}
        </Box>
    );
}
