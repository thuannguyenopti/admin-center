"use client";

import { Box, Heading, Text } from "@optiaxiom/react";

interface PageTitleProps {
    title: string;
    description?: string;
}

export function PageTitle({ title, description }: PageTitleProps) {
    return (
        <Box display="flex" flexDirection="column" gap="8">
            <Heading level="1" fontSize="2xl" fontWeight="600">
                {title}
            </Heading>
            {description && (
                <Text fontSize="md" color="fg.secondary">
                    {description}
                </Text>
            )}
        </Box>
    );
}
