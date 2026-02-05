"use client";

import { Box, Heading, Text } from "@optiaxiom/react";
import { IconBrowser, IconPen, IconFile, IconUserGroup, IconChartLine, IconImage } from "@optimizely/axiom-icons";

const opal_primary = "#7C3AED";

interface StartCanvasProps {
    onCardClick: (prompt: string) => void;
}

export function StartCanvas({ onCardClick }: StartCanvasProps) {
    const cards = [
        {
            icon: <IconBrowser size={24} />,
            title: "Optimize webpage",
            description: "Refine the page Event - Triathlon NYC to meet the business goal.",
            prompt: "Optimize the [page name] to improve [key metric] for [target audience]. Focus on [specific element] and ensure it aligns with our business goal of [goal]."
        },
        {
            icon: <IconPen size={24} />,
            title: "Plan campaign",
            description: "Brainstorm and map out your next campaign with Opal.",
            prompt: "Create a comprehensive campaign plan for [campaign name] targeting [audience]. Include [number] creative variations, timeline spanning [duration], and key messaging around [theme]."
        },
        {
            icon: <IconFile size={24} />,
            title: "Create landing page",
            description: "Turn your design into a high-converting landing page with structure.",
            prompt: "Design a landing page for [product/service] that converts [target audience]. Include sections for [section 1], [section 2], and [section 3]. The primary CTA should be [call to action]."
        },
        {
            icon: <IconUserGroup size={24} />,
            title: "Find the right audience",
            description: "Identify high-performing audience segments based on past experiments.",
            prompt: "Analyze our customer data to identify audience segments for [product/campaign]. Focus on users who [behavior/characteristic] and have shown interest in [interest area]. Include demographic and psychographic insights."
        },
        {
            icon: <IconChartLine size={24} />,
            title: "Analyze page performance",
            description: "Analyze traffic and bounce rate for the Home page.",
            prompt: "Analyze the performance of [page name] focusing on [metric 1], [metric 2], and [metric 3]. Provide insights on [time period] data and suggest [number] actionable improvements."
        },
        {
            icon: <IconImage size={24} />,
            title: "Repurpose your assets",
            description: "Find existing assets you can reuse —and put them to work faster.",
            prompt: "Identify existing [asset type] that can be repurposed for [new channel/campaign]. Focus on content related to [topic/theme] and suggest [number] ways to adapt them for [platform/audience]."
        }
    ];

    return (
        <Box display="flex" flexDirection="column" alignItems="center" w="full" mx="auto" px="32" style={{ maxWidth: '1100px' }}>
            <Box textAlign="center" mb="48">
                <Heading level="2" fontSize="4xl" fontWeight="600" color="fg.default">What are we working on today?</Heading>
            </Box>

            <Box display="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }} w="full">
                {cards.map((card, index) => (
                    <Box
                        key={index}
                        p="24"
                        border="1"
                        borderColor="border.tertiary"
                        rounded="xl"
                        bg="bg.default"
                        display="flex"
                        flexDirection="column"
                        gap="12"
                        style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                        className="hover:shadow-md hover:border-purple-400"
                        onClick={() => onCardClick(card.prompt)}
                    >
                        <Box display="flex" justifyContent="flex-end" mb="8" style={{ color: opal_primary }}>
                            {card.icon}
                        </Box>
                        <Heading level="4" fontSize="lg" fontWeight="600" style={{ marginBottom: '4px' }}>{card.title}</Heading>
                        <Text color="fg.secondary" fontSize="md" style={{ lineHeight: '1.5' }}>{card.description}</Text>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
