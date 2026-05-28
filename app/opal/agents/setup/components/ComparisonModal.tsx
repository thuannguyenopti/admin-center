"use client";

import {
    Dialog,
    DialogContent,
    Box,
    Text,
    Button,
    Heading,
} from "@optiaxiom/react";
import { IconX } from "@tabler/icons-react";

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    versionName: string;
    currentData: {
        name: string;
        description: string;
        promptTemplate: string;
        tools: string;
    };
    previousData: {
        name: string;
        description: string;
        promptTemplate: string;
        tools: string;
    };
}

export function ComparisonModal({
    isOpen,
    onClose,
    versionName,
    currentData,
    previousData,
}: ComparisonModalProps) {
    const renderDiff = (current: string, previous: string) => {
        if (current === previous) {
            return (
                <Box display="flex" gap="16" w="full">
                    <Box flex="1" p="12" bg="bg.secondary" rounded="sm">
                        <Text style={{ whiteSpace: "pre-wrap" }}>{current}</Text>
                    </Box>
                    <Box flex="1" p="12" bg="bg.secondary" rounded="sm">
                        <Text style={{ whiteSpace: "pre-wrap" }}>{previous}</Text>
                    </Box>
                </Box>
            );
        }

        return (
            <Box display="flex" gap="16" w="full">
                {/* Current Version */}
                <Box flex="1" p="12" rounded="sm" style={{ backgroundColor: "var(--ax-colors-bg-success-subtle)", border: "1px solid var(--ax-colors-border-success)" }}>
                    <Text style={{ whiteSpace: "pre-wrap", color: "var(--ax-colors-fg-success-strong)" }}>{current}</Text>
                </Box>
                {/* Previous Version */}
                <Box flex="1" p="12" rounded="sm" style={{ backgroundColor: "var(--ax-colors-bg-danger-subtle)", border: "1px solid var(--ax-colors-border-danger)" }}>
                    <Text style={{ whiteSpace: "pre-wrap", color: "var(--ax-colors-fg-danger-strong)" }}>{previous}</Text>
                </Box>
            </Box>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent size="lg" style={{ maxWidth: "1200px", height: "80vh" }}>
                <Box display="flex" flexDirection="column" h="full">
                    {/* Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb="16">
                        <Heading level="3">
                            Comparing {versionName} with Current Version
                        </Heading>
                        <Button
                            appearance="subtle"
                            size="sm"
                            icon={<IconX size={16} />}
                            aria-label="Close"
                            onClick={onClose}
                        />
                    </Box>

                    {/* Column Headers */}
                    <Box display="flex" gap="16" mb="12">
                        <Box flex="1">
                            <Text fontWeight="600" style={{ color: "var(--ax-colors-fg-success-strong)" }}>Current Version (Added)</Text>
                        </Box>
                        <Box flex="1">
                            <Text fontWeight="600" style={{ color: "var(--ax-colors-fg-danger-strong)" }}>{versionName} (Removed)</Text>
                        </Box>
                    </Box>

                    {/* Scrollable Content */}
                    <Box flex="1" overflowY="auto" display="flex" flexDirection="column" gap="24">
                        {/* Name Comparison */}
                        <Box>
                            <Text fontWeight="600" mb="8">Agent Name</Text>
                            {renderDiff(currentData.name, previousData.name)}
                        </Box>

                        {/* Description Comparison */}
                        <Box>
                            <Text fontWeight="600" mb="8">Description</Text>
                            {renderDiff(currentData.description, previousData.description)}
                        </Box>

                        {/* Prompt Template Comparison */}
                        <Box>
                            <Text fontWeight="600" mb="8">Prompt Template</Text>
                            {renderDiff(currentData.promptTemplate, previousData.promptTemplate)}
                        </Box>

                        {/* Tools Comparison */}
                        <Box>
                            <Text fontWeight="600" mb="8">Tools</Text>
                            {renderDiff(currentData.tools, previousData.tools)}
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
