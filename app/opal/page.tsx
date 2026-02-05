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
        sendMessage
    } = opalContext.chatState;

    const cards = [
        {
            icon: <Box style={{ color: opal_primary }}><IconBrowser size={24} /></Box>,
            title: "Optimize webpage",
            description: "Refine the page Event - Triathlon NYC to meet the business goal.",
            prompt: "Optimize the page to improve conversion."
        },
        {
            icon: <Box style={{ color: opal_primary }}><IconPen size={24} /></Box>,
            title: "Plan campaign",
            description: "Brainstorm and map out your next campaign with Opal.",
            prompt: "Plan a new digital marketing campaign."
        },
        {
            icon: <Box style={{ color: opal_primary }}><IconFile size={24} /></Box>,
            title: "Create landing page",
            description: "Turn your design into a high-converting landing page with structure.",
            prompt: "Design a high-converting landing page structure."
        },
        {
            icon: <Box style={{ color: opal_primary }}><IconUserGroup size={24} /></Box>,
            title: "Find the right audience",
            description: "Identify high-performing audience segments based on past experiments.",
            prompt: "Analyze our segments for better targeting."
        },
        {
            icon: <Box style={{ color: opal_primary }}><IconChartLine size={24} /></Box>,
            title: "Analyze page performance",
            description: "Analyze traffic and bounce rate for the Home page.",
            prompt: "Analyze the home page performance metrics."
        },
        {
            icon: <Box style={{ color: opal_primary }}><IconImage size={24} /></Box>,
            title: "Repurpose your assets",
            description: "Find existing assets you can reuse —and put them to work faster.",
            prompt: "Suggest ways to repurpose our current brand assets."
        }
    ];

    const handleCardClick = (prompt: string) => {
        sendMessage(prompt);
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
                <Button appearance="subtle" style={{ color: 'fg.secondary' }}>See more <IconChevronRight size={16} style={{ marginLeft: '4px' }} /></Button>
            </Box>
        </Box>
    );

    return (
        <Box
            className="opal-landing-page"
            display="flex"
            flexDirection="column"
            alignItems="center"
            w="full"
            style={{
                height: '100%',
                backgroundColor: 'var(--opal-bg-page)',
                paddingTop: '64px',
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
            />
        </Box>
    );
}
