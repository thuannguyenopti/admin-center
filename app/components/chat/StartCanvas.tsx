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
            prompt: "Please optimize [Page Name/URL] to improve its conversion rate by focusing on [Device Type] users and targeting [Key Metric]."
        },
        {
            icon: <IconPen size={24} />,
            title: "Plan campaign",
            description: "Brainstorm and map out your next campaign with Opal.",
            prompt: "Generate a comprehensive digital marketing campaign plan for [Product/Service] targeting [Target Audience] with a budget of [Budget Amount] over [Duration]."
        },
        {
            icon: <IconFile size={24} />,
            title: "Create landing page",
            description: "Turn your design into a high-converting landing page with structure.",
            prompt: "Create a high-converting landing page structure for [Campaign Topic] including a hero section, [Key Features], and a strong CTA for [Desired Action]."
        },
        {
            icon: <IconUserGroup size={24} />,
            title: "Find the right audience",
            description: "Identify high-performing audience segments based on past experiments.",
            prompt: "Analyze our recent performance data from [Time Period] to identify the top 3 high-performing audience segments for [Product Category]."
        },
        {
            icon: <IconChartLine size={24} />,
            title: "Analyze page performance",
            description: "Analyze traffic and bounce rate for the Home page.",
            prompt: "Conduct a deep-dive analysis of [Page Name] performance, specifically investigating why the bounce rate is high for [Traffic Source]."
        },
        {
            icon: <IconImage size={24} />,
            title: "Repurpose your assets",
            description: "Find existing assets you can reuse —and put them to work faster.",
            prompt: "Suggest 5 creative ways to repurpose our current [Asset Type, e.g., Video] content for [Social Platform] to increase engagement with [Audience]."
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
                        className="opal-landing-card"
                        display="flex"
                        flexDirection="column"
                        gap="12"
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
