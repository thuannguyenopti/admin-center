"use client";

import { Box, Text } from "@optiaxiom/react";
import { IconCheck } from "@optiaxiom/icons";

interface ModalStepperProps {
    currentStep: number;
    steps: string[];
}

export function ModalStepper({ currentStep, steps }: ModalStepperProps) {
    return (
        <Box display="flex" alignItems="start" w="full" mb="32" mt="8">
            {steps.map((label, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                const isPending = index > currentStep;

                return (
                    <Box
                        key={label}
                        display="flex"
                        alignItems="start"
                        style={{ flex: index < steps.length - 1 ? 1 : "initial", minWidth: 0 }}
                    >
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            gap="12"
                            style={{ minWidth: 112 }}
                        >
                            <Box
                                rounded="full"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                style={{
                                    width: 40,
                                    height: 40,
                                    background: isCompleted
                                        ? "var(--ax-colors-bg-success-subtle)"
                                        : isCurrent
                                            ? "var(--ax-colors-bg-accent-subtle)"
                                            : "var(--ax-colors-bg-tertiary)",
                                    border: isCurrent
                                        ? "2px solid var(--ax-colors-border-focus)"
                                        : "2px solid transparent",
                                    color: isCompleted
                                        ? "var(--ax-colors-fg-success)"
                                        : isCurrent
                                            ? "var(--ax-colors-fg-accent)"
                                            : "var(--ax-colors-fg-tertiary)",
                                    flexShrink: 0,
                                }}
                            >
                                {isCompleted ? (
                                    <IconCheck size={18} />
                                ) : (
                                    <Text
                                        fontSize="sm"
                                        fontWeight="600"
                                        color={isPending ? "fg.tertiary" : "fg.accent"}
                                    >
                                        {index + 1}
                                    </Text>
                                )}
                            </Box>
                            <Text
                                fontSize="md"
                                fontWeight={isCurrent ? "600" : "500"}
                                color={isPending ? "fg.tertiary" : "fg.default"}
                                textAlign="center"
                                style={{ lineHeight: 1.25 }}
                            >
                                {label}
                            </Text>
                        </Box>

                        {index < steps.length - 1 && (
                            <Box
                                style={{
                                    flex: 1,
                                    height: 2,
                                    marginTop: 19,
                                    marginLeft: 12,
                                    marginRight: 12,
                                    background: index < currentStep
                                        ? "var(--ax-colors-border-success)"
                                        : "var(--ax-colors-border-tertiary)",
                                }}
                            />
                        )}
                    </Box>
                );
            })}
        </Box>
    );
}
