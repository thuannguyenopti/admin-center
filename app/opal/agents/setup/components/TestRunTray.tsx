"use client";

import {
    Box,
    Text,
    Button,
    Disclosure,
    DisclosureTrigger,
    DisclosureContent,
    Field,
    Textarea,
} from "@optiaxiom/react";
import { Input } from "@/app/components/Input"; // Using local Input wrapper as seen in page.tsx
import {
    IconX,
    IconChevronRight,
} from "@tabler/icons-react";
import {
    IconPlay,
    IconArrowRotateLeft,
} from "@optimizely/axiom-icons";
import { useState } from "react";

interface Variable {
    name: string;
    description: string;
    type: string;
    required: boolean;
}

interface TestRunTrayProps {
    isOpen: boolean;
    onClose: () => void;
    variables: Variable[];
}

export function TestRunTray({
    isOpen,
    onClose,
    variables,
}: TestRunTrayProps) {
    const [inputValues, setInputValues] = useState<Record<string, string>>({});
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);

    const handleInputChange = (name: string, value: string) => {
        setInputValues(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRun = () => {
        setIsRunning(true);
        // Simulate a run
        setTimeout(() => {
            setOutput("This is a simulated output based on your inputs.\n\nGenerated content would appear here.");
            setIsRunning(false);
        }, 1500);
    };

    return (
        <Box
            style={{
                width: isOpen ? "400px" : "0px", // Slightly wider for inputs
                transition: "width 0.3s ease-in-out",
                overflow: "hidden",
                borderLeft: isOpen ? "1px solid var(--ax-colors-border-secondary)" : "none",
                backgroundColor: "var(--ax-colors-bg-default)",
                display: "flex",
                flexDirection: "column",
                flexShrink: 0,
            }}
        >
            {isOpen && (
                <>
                    {/* Header */}
                    <Box
                        px="16"
                        py="12"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        style={{
                            borderBottom: "1px solid var(--ax-colors-border-secondary)",
                        }}
                    >
                        <Text fontWeight="600" fontSize="md">
                            Test Run
                        </Text>
                        <Button
                            appearance="subtle"
                            size="sm"
                            icon={<IconX size={16} />}
                            aria-label="Close"
                            onClick={onClose}
                        />
                    </Box>

                    {/* Content */}
                    <Box
                        flex="1"
                        overflowY="auto"
                        px="16"
                        py="16"
                        display="flex"
                        flexDirection="column"
                        gap="16"
                    >
                        {/* Input Section */}
                        <Disclosure defaultOpen>
                            <DisclosureTrigger>
                                <Box display="flex" alignItems="center" gap="8" w="full">
                                    <Text fontWeight="600">Input</Text>
                                </Box>
                            </DisclosureTrigger>
                            <DisclosureContent>
                                <Box display="flex" flexDirection="column" gap="16" pt="12">
                                    {variables.length > 0 ? (
                                        variables.map((variable) => (
                                            <Field
                                                key={variable.name}
                                                label={variable.name}
                                                info={variable.description}
                                                required={variable.required}
                                            >
                                                <Input
                                                    placeholder={`Enter ${variable.name}`}
                                                    value={inputValues[variable.name] || ""}
                                                    onChange={(e) => handleInputChange(variable.name, e.target.value)}
                                                />
                                            </Field>
                                        ))
                                    ) : (
                                        <Text color="fg.secondary" fontSize="sm">No variables defined for this agent.</Text>
                                    )}

                                    <Box display="flex">
                                        <Button
                                            appearance="primary"
                                            icon={<IconPlay />}
                                            onClick={handleRun}
                                            loading={isRunning}
                                            disabled={variables.length > 0 && variables.some(v => v.required && !inputValues[v.name])}
                                        >
                                            Run Test
                                        </Button>
                                    </Box>
                                </Box>
                            </DisclosureContent>
                        </Disclosure>

                        {/* Output Section */}
                        <Disclosure defaultOpen>
                            <DisclosureTrigger>
                                <Box display="flex" alignItems="center" justifyContent="space-between" w="full">
                                    <Box display="flex" alignItems="center" gap="8">
                                        <Text fontWeight="600">Output</Text>
                                    </Box>
                                    {output && !isRunning && (
                                        <Button
                                            appearance="subtle"
                                            size="sm"
                                            icon={<IconArrowRotateLeft size={16} />}
                                            aria-label="Re-run test"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRun();
                                            }}
                                        />
                                    )}
                                </Box>
                            </DisclosureTrigger>
                            <DisclosureContent>
                                <Box pt="12">
                                    <Textarea
                                        value={output}
                                        readOnly
                                        placeholder="Output will appear here after running..."
                                        className="h-64"
                                        style={{ fontFamily: "monospace", fontSize: "13px" }}
                                    />
                                </Box>
                            </DisclosureContent>
                        </Disclosure>
                    </Box>
                </>
            )}
        </Box>
    );
}
