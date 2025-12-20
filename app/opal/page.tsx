"use client";

import { Box, Heading, Text, SearchInput, Grid, Button, Paper } from "@optiaxiom/react";
import { IconLayoutSidebar, IconPencil, IconFileText, IconUsers, IconChartBar, IconPhoto, IconMicrophone, IconPaperclip, IconLayout, IconCalendar } from "@tabler/icons-react";

export default function OpalPage() {
    const cards = [
        {
            icon: <IconLayout size={24} color="#7E22CE" />, // Purple
            title: "Optimize webpage",
            description: "Refine the page Event - Triathlon NYC to meet the business goal."
        },
        {
            icon: <IconPencil size={24} color="#7E22CE" />,
            title: "Plan campaign",
            description: "Brainstorm and map out your next campaign with Opal."
        },
        {
            icon: <IconFileText size={24} color="#7E22CE" />,
            title: "Create landing page",
            description: "Turn your design into a high-converting landing page with structure."
        },
        {
            icon: <IconUsers size={24} color="#7E22CE" />,
            title: "Find the right audience",
            description: "Identify high-performing audience segments based on past experiments."
        },
        {
            icon: <IconChartBar size={24} color="#7E22CE" />,
            title: "Analyze page performance",
            description: "Analyze traffic and bounce rate for the Home page."
        },
        {
            icon: <IconPhoto size={24} color="#7E22CE" />,
            title: "Repurpose your assets",
            description: "Find existing assets you can reuse —and put them to work faster."
        }
    ];

    return (
        <Box p="32" display="flex" flexDirection="column" gap="32" alignItems="center" style={{ maxWidth: "1200px" }} mx="auto">
            <Box textAlign="center" my="16">
                <Heading level="2" fontSize="3xl" color="fg.default">What are we working on today?</Heading>
            </Box>

            <Box w="full" style={{ maxWidth: "800px" }} bg="bg.default" p="16" rounded="lg" border="1" borderColor="border.tertiary" shadow="sm">
                <Box display="flex" flexDirection="column" gap="16">
                    <input
                        className="w-full text-lg outline-none bg-transparent placeholder-gray-400"
                        placeholder="Ask Opal anything—like “Plan a new campaign” or “Suggest an image for travel audience”"
                    />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" gap="8">
                            <Button appearance="subtle" icon={<IconFileText size={18} />} aria-label="Attach file" />
                            <Button appearance="subtle" icon={<IconLayout size={18} />} aria-label="Add layout" />
                        </Box>
                        <Button appearance="primary" size="lg" icon={<IconMicrophone />} rounded="full" aria-label="Voice search" bg="bg.accent" />
                    </Box>
                </Box>
            </Box>

            <Grid gridTemplateColumns={{ base: "1", md: "3" }} gap="16" w="full">
                {cards.map((card, index) => (
                    <Box
                        key={index}
                        p="24"
                        border="1"
                        borderColor="border.tertiary"
                        rounded="lg"
                        bg="bg.default"
                        display="flex"
                        flexDirection="column"
                        gap="12"
                        className="hover:border-purple-500 cursor-pointer transition-colors"
                    >
                        <Box display="flex" justifyContent="flex-end" mb="4">
                            {card.icon}
                        </Box>
                        <Heading level="4" fontSize="lg" fontWeight="600">{card.title}</Heading>
                        <Text color="fg.secondary" fontSize="md">{card.description}</Text>
                    </Box>
                ))}
            </Grid>

            <Box w="full" display="flex" justifyContent="flex-end">
                <Button appearance="subtle">See more &gt;</Button>
            </Box>
        </Box>
    );
}
