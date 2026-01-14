"use client";

import { Box, Text } from "@optiaxiom/react";

interface FieldComparisonProps {
    currentValue: string;
    previousValue: string;
    multiline?: boolean;
}

export function FieldComparison({
    currentValue,
    previousValue,
    multiline = false,
}: FieldComparisonProps) {
    if (!multiline) {
        // Single line side-by-side comparison
        return (
            <Box display="flex" gap="8" w="full">
                {/* Previous Version (Left) */}
                <Box
                    flex="1"
                    p="12"
                    rounded="sm"
                    bg={currentValue !== previousValue ? "bg.error.subtle" : "bg.secondary"}
                    style={{
                        border: currentValue !== previousValue ? "1px solid var(--ax-colors-border-danger)" : "1px solid var(--ax-colors-border-secondary)"
                    }}
                >
                    <Text style={{
                        color: currentValue !== previousValue ? "var(--ax-colors-fg-danger-strong)" : "var(--ax-colors-fg-default)"
                    }}>
                        {(currentValue !== previousValue && previousValue) ? "- " : ""}
                        {previousValue || <span style={{ color: "var(--ax-colors-fg-tertiary)", fontStyle: "italic" }}>Empty</span>}
                    </Text>
                </Box>

                {/* Current Version (Right) */}
                <Box
                    flex="1"
                    p="12"
                    rounded="sm"
                    bg={currentValue !== previousValue ? "bg.success.subtle" : "bg.secondary"}
                    style={{
                        border: currentValue !== previousValue ? "1px solid var(--ax-colors-border-success)" : "1px solid var(--ax-colors-border-secondary)"
                    }}
                >
                    <Text style={{ color: currentValue !== previousValue ? "var(--ax-colors-fg-success-strong)" : "var(--ax-colors-fg-default)" }}>
                        {(currentValue !== previousValue && currentValue) ? "+ " : ""}
                        {currentValue || <span style={{ color: "var(--ax-colors-fg-tertiary)", fontStyle: "italic" }}>Empty</span>}
                    </Text>
                </Box>
            </Box>
        );
    }

    // Multiline side-by-side comparison
    const currentLines = currentValue.split('\n');
    const previousLines = previousValue.split('\n');
    const maxLines = Math.max(currentLines.length, previousLines.length);

    return (
        <Box display="flex" gap="8" w="full">
            {/* Previous Version (Left) */}
            <Box
                flex="1"
                rounded="sm"
                style={{
                    border: "1px solid var(--ax-colors-border-secondary)",
                    overflow: "hidden"
                }}
            >
                {previousLines.map((line, index) => {
                    const currentLine = currentLines[index] || '';
                    // Treat whitespace-only lines as empty
                    const prevTrimmed = line.trim();
                    const currTrimmed = currentLine.trim();
                    const isDifferent = prevTrimmed !== currTrimmed;

                    return (
                        <Box
                            key={index}
                            p="8"
                            px="12"
                            bg={isDifferent ? "bg.error.subtle" : "bg.default"}
                        >
                            <Box display="flex" gap="8">
                                <Text
                                    fontSize="sm"
                                    style={{
                                        color: isDifferent ? "var(--ax-colors-fg-danger-strong)" : "transparent",
                                        minWidth: "12px",
                                        fontFamily: "monospace",
                                        textAlign: "center"
                                    }}
                                >
                                    {isDifferent && line.trim() ? "-" : ""}
                                </Text>
                                <Text
                                    fontSize="sm"
                                    style={{
                                        color: "var(--ax-colors-fg-tertiary)",
                                        minWidth: "32px",
                                        fontFamily: "monospace",
                                        textAlign: "right"
                                    }}
                                >
                                    {index + 1}
                                </Text>
                                <Text
                                    fontSize="sm"
                                    style={{
                                        color: isDifferent ? "var(--ax-colors-fg-danger-strong)" : "var(--ax-colors-fg-default)",
                                        whiteSpace: "pre-wrap",
                                        fontFamily: "monospace",
                                        flex: 1
                                    }}
                                >
                                    {line || ' '}
                                </Text>
                            </Box>
                        </Box>
                    );
                })}
                {/* Add empty lines if previous has fewer lines */}
                {Array.from({ length: maxLines - previousLines.length }).map((_, index) => (
                    <Box
                        key={`empty-prev-${index}`}
                        p="8"
                        px="12"
                        style={{
                            backgroundColor: "var(--ax-colors-bg-secondary)"
                        }}
                    >
                        <Box display="flex" gap="8">
                            <Text fontSize="sm" style={{ minWidth: "12px" }}> </Text>
                            <Text fontSize="sm" style={{ color: "var(--ax-colors-fg-tertiary)", minWidth: "32px", fontFamily: "monospace", textAlign: "right" }}>
                                {previousLines.length + index + 1}
                            </Text>
                            <Text fontSize="sm" style={{ color: "var(--ax-colors-fg-tertiary)", fontFamily: "monospace", fontStyle: "italic" }}>
                                {' '}
                            </Text>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Current Version (Right) */}
            <Box
                flex="1"
                rounded="sm"
                style={{
                    border: "1px solid var(--ax-colors-border-secondary)",
                    overflow: "hidden"
                }}
            >
                {currentLines.map((line, index) => {
                    const previousLine = previousLines[index] || '';
                    // Treat whitespace-only lines as empty
                    const prevTrimmed = previousLine.trim();
                    const currTrimmed = line.trim();
                    const isDifferent = prevTrimmed !== currTrimmed;

                    return (
                        <Box
                            key={index}
                            p="8"
                            px="12"
                            bg={isDifferent ? "bg.success.subtle" : "bg.default"}
                        >
                            <Box display="flex" gap="8">
                                <Text
                                    fontSize="sm"
                                    style={{
                                        color: isDifferent ? "var(--ax-colors-fg-success-strong)" : "transparent",
                                        minWidth: "12px",
                                        fontFamily: "monospace",
                                        textAlign: "center"
                                    }}
                                >
                                    {isDifferent && line.trim() ? "+" : ""}
                                </Text>
                                <Text
                                    fontSize="sm"
                                    style={{
                                        color: "var(--ax-colors-fg-tertiary)",
                                        minWidth: "32px",
                                        fontFamily: "monospace",
                                        textAlign: "right"
                                    }}
                                >
                                    {index + 1}
                                </Text>
                                <Text
                                    fontSize="sm"
                                    style={{
                                        color: isDifferent ? "var(--ax-colors-fg-success-strong)" : "var(--ax-colors-fg-default)",
                                        whiteSpace: "pre-wrap",
                                        fontFamily: "monospace",
                                        flex: 1
                                    }}
                                >
                                    {line || ' '}
                                </Text>
                            </Box>
                        </Box>
                    );
                })}
                {/* Add empty lines if current has fewer lines */}
                {Array.from({ length: maxLines - currentLines.length }).map((_, index) => (
                    <Box
                        key={`empty-curr-${index}`}
                        p="8"
                        px="12"
                        style={{
                            backgroundColor: "var(--ax-colors-bg-secondary)"
                        }}
                    >
                        <Box display="flex" gap="8">
                            <Text fontSize="sm" style={{ minWidth: "12px" }}> </Text>
                            <Text fontSize="sm" style={{ color: "var(--ax-colors-fg-tertiary)", minWidth: "32px", fontFamily: "monospace", textAlign: "right" }}>
                                {currentLines.length + index + 1}
                            </Text>
                            <Text fontSize="sm" style={{ color: "var(--ax-colors-fg-tertiary)", fontFamily: "monospace", fontStyle: "italic" }}>
                                {' '}
                            </Text>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
