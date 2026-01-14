"use client";

import { Box, Text } from "@optiaxiom/react";
import { forwardRef } from "react";

interface FieldComparisonProps {
    currentValue: string;
    previousValue: string;
    multiline?: boolean;
    mode?: 'side-by-side' | 'stacked';
    [key: string]: any;
}

export const FieldComparison = forwardRef<HTMLDivElement, FieldComparisonProps>(({
    currentValue,
    previousValue,
    multiline = false,
    mode = 'side-by-side',
    ...props
}, ref) => {
    // Shared render function for a diff line
    const renderDiffLine = (content: string, type: 'removed' | 'added' | 'unchanged', lineNumber: number | null = null, prefix: string = '') => {
        let bg: "bg.default" | "bg.error.subtle" | "bg.success.subtle" = "bg.default";
        let color = "var(--ax-colors-fg-default)";
        let indicatorColor = "transparent";

        if (type === 'removed') {
            bg = "bg.error.subtle";
            color = "var(--ax-colors-fg-danger-strong)";
            indicatorColor = "var(--ax-colors-fg-danger-strong)";
        } else if (type === 'added') {
            bg = "bg.success.subtle";
            color = "var(--ax-colors-fg-success-strong)";
            indicatorColor = "var(--ax-colors-fg-success-strong)";
        }

        return (
            <Box
                p="8"
                px="12"
                bg={bg}
            >
                <Box display="flex" gap="8">
                    <Text
                        fontSize="sm"
                        style={{
                            color: indicatorColor,
                            minWidth: "12px",
                            fontFamily: "monospace",
                            textAlign: "center"
                        }}
                    >
                        {prefix}
                    </Text>
                    {lineNumber !== null && (
                        <Text
                            fontSize="sm"
                            style={{
                                color: "var(--ax-colors-fg-tertiary)",
                                minWidth: "32px",
                                fontFamily: "monospace",
                                textAlign: "right"
                            }}
                        >
                            {lineNumber}
                        </Text>
                    )}
                    <Text
                        fontSize="sm"
                        style={{
                            color,
                            whiteSpace: "pre-wrap",
                            fontFamily: "monospace",
                            flex: 1
                        }}
                    >
                        {content || ' '}
                    </Text>
                </Box>
            </Box>
        );
    };

    if (mode === 'stacked') {
        if (!multiline) {
            // Single line stacked
            return (
                <Box
                    ref={ref}
                    w="full"
                    rounded="sm"
                    style={{ border: "1px solid var(--ax-colors-border-secondary)", overflow: "hidden" }}
                    {...props}
                >
                    {previousValue !== currentValue && (
                        renderDiffLine(previousValue, 'removed', null, '-')
                    )}
                    {renderDiffLine(currentValue, previousValue !== currentValue ? 'added' : 'unchanged', null, previousValue !== currentValue ? '+' : '')}
                </Box>
            );
        }

        // Multiline stacked
        const currentLines = currentValue.split('\n');
        const previousLines = previousValue.split('\n');
        const maxLines = Math.max(currentLines.length, previousLines.length);

        return (
            <Box
                ref={ref}
                w="full"
                rounded="sm"
                style={{ border: "1px solid var(--ax-colors-border-secondary)", overflow: "hidden" }}
                {...props}
            >
                {Array.from({ length: maxLines }).map((_, index) => {
                    const lineVal = currentLines[index] || '';
                    const prevLineVal = previousLines[index] || '';

                    const prevTrimmed = prevLineVal.trim();
                    const currTrimmed = lineVal.trim();
                    const isDifferent = prevTrimmed !== currTrimmed;
                    // Check if lines effectively exist
                    const hasPrev = index < previousLines.length;
                    const hasCurr = index < currentLines.length;

                    if (isDifferent) {
                        return (
                            <Box key={index}>
                                {hasPrev && renderDiffLine(prevLineVal, 'removed', index + 1, '-')}
                                {hasCurr && renderDiffLine(lineVal, 'added', index + 1, '+')}
                            </Box>
                        );
                    } else {
                        return <Box key={index}>{renderDiffLine(lineVal, 'unchanged', index + 1)}</Box>;
                    }
                })}
            </Box>
        );
    }

    if (!multiline) {
        // Single line side-by-side comparison
        return (
            <Box
                ref={ref}
                display="flex"
                gap="8"
                w="full"
                {...props}
            >
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
        <Box
            ref={ref}
            display="flex"
            gap="8"
            w="full"
            {...props}
        >
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
});

FieldComparison.displayName = "FieldComparison";
