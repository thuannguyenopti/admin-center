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
                            gap="8"
                            style={{ minWidth: 80 }}
                        >
                            <Box
                                rounded="full"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                style={{
                                    width: 36,
                                    height: 36,
                                    background: isCompleted
                                        ? "var(--ax-colors-bg-success)"
                                        : isCurrent
                                            ? "var(--ax-colors-bg-information-subtle)"
                                            : "var(--ax-colors-bg-secondary)",
                                    border: isCompleted
                                        ? "2px solid var(--ax-colors-border-success)"
                                        : isCurrent
                                            ? "2px solid var(--ax-colors-border-focus)"
                                            : "2px solid var(--ax-colors-border-secondary)",
                                    flexShrink: 0,
                                }}
                            >
                                {isCompleted ? (
                                    <IconCheck size={16} color="var(--ax-colors-fg-success-strong)" />
                                ) : (
                                    <Text
                                        fontSize="sm"
                                        fontWeight="600"
                                        color={isPending ? "fg.secondary" : "fg.default"}
                                    >
                                        {index + 1}
                                    </Text>
                                )}
                            </Box>
                            <Text
                                fontSize="sm"
                                fontWeight={isCurrent ? "600" : "500"}
                                color={isPending ? "fg.secondary" : "fg.default"}
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
                                    marginTop: 17,
                                    marginLeft: 8,
                                    marginRight: 8,
                                    background: index < currentStep
                                        ? "var(--ax-colors-border-success)"
                                        : "var(--ax-colors-border-secondary)",
                                }}
                            />
                        )}
                    </Box>
                );
            })}
        </Box>
    );
}
