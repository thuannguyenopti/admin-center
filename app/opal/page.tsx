"use client";

import { Box, Heading, Text, Button } from "@optiaxiom/react";
import { IconBrowser, IconPen, IconFile, IconUserGroup, IconChartLine, IconImage } from "@optimizely/axiom-icons";
import { IconChevronRight } from "@tabler/icons-react";
import { useOpalState } from "@/app/hooks/useOpalState";
import { useOpalHistory } from "@/app/hooks/useOpalHistory";
import { useOpalContext } from "../context/OpalContext";
import { OpalChatView } from "../components/Opal/OpalChatView";

const opal_primary = "#7C3AED";

export default function OpalPage() {
    const opalContext = useOpalContext();
    const { activeChat } = opalContext.history;
    const {
        messages,
        inputValue,
        isLoading,
        error,
        setInputValue,
        sendMessage,
        enableAI,
        setEnableAI,
        updateMessage,
        editPrompt,
        regenerate,
    } = opalContext.chatState;

    const cards = [
        {
            icon: <Box style={{ color: opal_primary }}><IconBrowser size={24} /></Box>,
            title: "Optimize webpage",
            description: "Refine the page Event - Triathlon NYC to meet the business goal.",
            prompt: "Please optimize [Page Name/URL] to improve its conversion rate by focusing on [Device Type] users and targeting [Key Metric]."
        },
        {
            icon: <Box style={{ color: opal_primary }}><IconPen size={24} /></Box>,
            title: "Plan campaign",
            description: "Brainstorm and map out your next campaign with Opal.",
            prompt: "Generate a comprehensive digital marketing campaign plan for [Product/Service] targeting [Target Audience] with a budget of [Budget Amount] over [Duration]."
        },
        {
            icon: <Box style={{ color: opal_primary }}><IconFile size={24} /></Box>,
            title: "Create landing page",
            description: "Turn your design into a high-converting landing page with structure.",
            prompt: "Create a high-converting landing page structure for [Campaign Topic] including a hero section, [Key Features], and a strong CTA for [Desired Action]."
        },
        {
            icon: <Box style={{ color: opal_primary }}><IconUserGroup size={24} /></Box>,
            title: "Find the right audience",
            description: "Identify high-performing audience segments based on past experiments.",
            prompt: "Analyze our recent performance data from [Time Period] to identify the top 3 high-performing audience segments for [Product Category]."
        },
        {
            icon: <Box style={{ color: opal_primary }}><IconChartLine size={24} /></Box>,
            title: "Analyze page performance",
            description: "Analyze traffic and bounce rate for the Home page.",
            prompt: "Conduct a deep-dive analysis of [Page Name] performance, specifically investigating why the bounce rate is high for [Traffic Source]."
        },
        {
            icon: <Box style={{ color: opal_primary }}><IconImage size={24} /></Box>,
            title: "Repurpose your assets",
            description: "Find existing assets you can reuse —and put them to work faster.",
            prompt: "Suggest 5 creative ways to repurpose our current [Asset Type, e.g., Video] content for [Social Platform] to increase engagement with [Audience]."
        }
    ];

    const handleCardClick = (prompt: string) => {
        setInputValue(prompt);
        // Scroll to input if needed or just focus it
        const textarea = document.querySelector('textarea');
        if (textarea) textarea.focus();
    };

    const landingHeader = (
        <Box textAlign="center" mb="24" mt="64">
            <Heading level="2" fontSize="4xl" color="fg.default" fontWeight="600" style={{ letterSpacing: '-0.02em' }}>What are we working on today?</Heading>
        </Box>
    );

    const emptyState = (
        <Box w="full" px="32" py="48" display="flex" flexDirection="column" alignItems="center">
            <Box
                display="grid"
                style={{
                    gridTemplateColumns: "repeat(3, 272px)",
                    gap: "24px",
                    justifyContent: "center"
                }}
                w="full"
                mb="48"
            >
                {cards.map((card, index) => (
                    <Box
                        key={index}
                        p="12"
                        bg="bg.default"
                        rounded="xl"
                        border="1"
                        borderColor="border.tertiary"
                        display="flex"
                        flexDirection="column"
                        gap="12"
                        w="full"
                        style={{
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            position: 'relative'
                        }}
                        onClick={() => handleCardClick(card.prompt)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--opal-accent-purple)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--axiom-border-tertiary, #e5e7eb)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                        }}
                    >
                        <Box style={{ position: 'absolute', top: '24px', right: '24px' }}>
                            {card.icon}
                        </Box>
                        <Box mt="32">
                            <Heading level="4" fontSize="lg" fontWeight="600" mb="4">{card.title}</Heading>
                            <Text color="fg.secondary" fontSize="md" style={{ lineHeight: '1.5' }}>{card.description}</Text>
                        </Box>
                    </Box>
                ))}
            </Box>

            <Box w="full" style={{ maxWidth: "864px" }} display="flex" justifyContent="flex-end">
                <Button appearance="subtle" style={{ color: 'fg.secondary', minWidth: 'max-content' }}>
                    <Box display="flex" alignItems="center" gap="4" style={{ whiteSpace: 'nowrap', minWidth: 'max-content' }}>
                        See more <IconChevronRight size={16} />
                    </Box>
                </Button>
            </Box>
        </Box>
    );

    return (
        <Box
            className="opal-landing-page"
            display="flex"
            flexDirection="column"
            alignItems="center"
            h="full"
            w="full"
            style={{
                backgroundColor: 'var(--opal-bg-page)',
                overflow: 'hidden',
                minHeight: 0, // Added minHeight: 0
            }}
        >
            <OpalChatView
                variant="home"
                messages={messages}
                inputValue={inputValue}
                isLoading={isLoading}
                error={error}
                setInputValue={setInputValue}
                onSend={sendMessage}
                onSuggestionClick={sendMessage}

                onToggleHistory={opalContext.history.toggleHistory}
                onNewChat={opalContext.history.createNewChat}
                isHistoryVisible={opalContext.history.isHistoryVisible}
                groupedHistory={opalContext.history.groupedHistory}
                activeChat={opalContext.history.activeChat}
                searchQuery={opalContext.history.searchQuery}
                onSearchChange={opalContext.history.setSearchQuery}
                onDeleteChat={opalContext.history.deleteChat}
                onSelectChat={opalContext.history.selectChat}

                landingHeader={landingHeader}
                emptyState={emptyState}
                enableAI={enableAI}
                onEnableAIChange={setEnableAI}
                onMessageEdit={(id, content) => editPrompt(id, content)}
                onRegenerate={(id) => regenerate(id)}
            />
        </Box>
    );
}
