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
    IconXmark,
    IconChevronRight,
} from "@optiaxiom/icons";
import {
    IconPlay,
    IconArrowsRotate,
} from "@/app/lib/axiom-icons";
import { useState } from "react";
import { OpalLoaderV5 } from "@/app/opal/components/OpalLoaderV5";

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

const MOCK_MEMORY_CHUNKS = [
    { label: "Target region", content: "United States (en-US)" },
    { label: "Brand voice", content: "Professional, approachable tone" },
    { label: "Terminology", content: "American English spelling, active voice preferred" },
    { label: "Prior runs", content: "2 previous localizations for this content" },
];

export function TestRunTray({
    isOpen,
    onClose,
    variables,
}: TestRunTrayProps) {
    const [inputValues, setInputValues] = useState<Record<string, string>>({});
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [showScaffold, setShowScaffold] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(false);
    const [isInputOpen, setIsInputOpen] = useState(true);

    const handleInputChange = (name: string, value: string) => {
        setInputValues(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRun = () => {
        setIsRunning(true);
        setShowScaffold(false);
        setShowSkeleton(false);
        setOutput("");
        setTimeout(() => setShowScaffold(true), 300);    // Phase 1 → 2
        setTimeout(() => setShowSkeleton(true), 2300);   // Phase 2 → 3
        setTimeout(() => {
            setOutput("Localized content for United States (en-US):\n\nHello world — adapted for American English with regional context applied. Brand voice maintained throughout.");
            setIsRunning(false);
            setShowScaffold(false);
            setShowSkeleton(false);
        }, 6800);                                         // Phase 4 (5300 + 1500ms)
    };

    const handleClearInputs = () => {
        const cleared = Object.keys(inputValues).reduce((acc, key) => {
            acc[key] = "";
            return acc;
        }, {} as Record<string, string>);
        setInputValues(cleared);
        setShowScaffold(false);
        setShowSkeleton(false);
    };

    const hasInputs = Object.values(inputValues).some(val => val.length > 0);

    return (
        <Box
            style={{
                width: isOpen ? "400px" : "0px",
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
                    >
                        <Text fontWeight="600" fontSize="md">
                            Test Run
                        </Text>
                        <Button
                            appearance="subtle"
                            size="sm"
                            icon={<IconXmark size={16} />}
                            aria-label="Close"
                            onClick={onClose}
                        />
                    </Box>

                    {/* Content */}
                    <Box
                        flex="1"
                        overflowY="auto"
                        px="16"
                        py="4"
                        display="flex"
                        flexDirection="column"
                        gap="16"
                    >
                        {/* Input Section */}
                        <Disclosure defaultOpen onOpenChange={setIsInputOpen} bg="bg.secondary" rounded="md" px="16" pt="4" pb="12">
                            <Box display="flex" alignItems="center" justifyContent="space-between" w="full">
                                <DisclosureTrigger style={{ flex: 1, textAlign: "left" }}>
                                    <Box display="flex" alignItems="center" gap="8">
                                        <Text fontWeight="600">Input</Text>
                                    </Box>
                                </DisclosureTrigger>
                                {hasInputs && isInputOpen && (
                                    <Button
                                        appearance="subtle"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClearInputs();
                                        }}
                                    >
                                        Clear all
                                    </Button>
                                )}
                            </Box>
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
                        <Disclosure defaultOpen bg="bg.secondary" rounded="md" px="16" pt="4" pb="12">
                            <Box display="flex" alignItems="center" justifyContent="space-between" w="full">
                                <DisclosureTrigger style={{ flex: 1, textAlign: "left" }}>
                                    <Box display="flex" alignItems="center" gap="8">
                                        <Text fontWeight="600">Output</Text>
                                    </Box>
                                </DisclosureTrigger>
                                {output && !isRunning && (
                                    <Button
                                        appearance="subtle"
                                        size="sm"
                                        icon={<IconArrowsRotate size={16} />}
                                        aria-label="Re-run test"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRun();
                                        }}
                                    />
                                )}
                            </Box>
                            <DisclosureContent>
                                <Box pt="12">
                                    {isRunning ? (
                                        // Phase 1 & 2: placeholder text only
                                        <Text
                                            color="fg.tertiary"
                                            fontSize="sm"
                                            style={{ fontFamily: "monospace", lineHeight: "1.6" }}
                                        >
                                            Generated content would appear here.
                                        </Text>
                                    ) : (
                                        // Phase 3: actual output
                                        <Textarea
                                            value={output}
                                            readOnly
                                            placeholder="Output will appear here after running..."
                                            className="h-32"
                                            style={{ fontFamily: "monospace", fontSize: "13px" }}
                                        />
                                    )}
                                </Box>
                            </DisclosureContent>
                        </Disclosure>

                        {/* Execution Memory Section — hidden in Phase 1, appears in Phase 2 & 3 */}
                        {(isRunning && showScaffold) || (!isRunning && output) ? (
                            <Disclosure
                                key={isRunning ? "memory-loading" : "memory-done"}
                                defaultOpen={isRunning}
                                bg="bg.secondary"
                                rounded="md"
                                px="16"
                                pt="4"
                                pb="12"
                            >
                                <DisclosureTrigger style={{ flex: 1, textAlign: "left" }}>
                                    <Box display="flex" alignItems="center" gap="8">
                                        <Text fontWeight="600">Execution Memory</Text>
                                        {!isRunning && (
                                            <Text
                                                color="fg.tertiary"
                                                fontSize="xs"
                                                style={{
                                                    background: "var(--ax-colors-bg-default)",
                                                    borderRadius: "10px",
                                                    padding: "1px 7px",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {MOCK_MEMORY_CHUNKS.length}
                                            </Text>
                                        )}
                                    </Box>
                                </DisclosureTrigger>
                                <DisclosureContent>
                                    <Box pt="12">
                                        {isRunning ? (
                                            // Phase 2 & 3: V5 loader, with skeleton appearing in Phase 3
                                            <Box display="flex" flexDirection="column" gap="12">
                                                <Box display="flex" justifyContent="center" alignItems="center" style={{ height: "80px" }}>
                                                    <OpalLoaderV5 size={32} color="#7C3AED" />
                                                </Box>
                                                {showSkeleton && (
                                                    <div className="animate-pulse flex flex-col gap-3">
                                                        <div className="h-8 rounded bg-gray-200 w-full" />
                                                        <div className="h-8 rounded bg-gray-200 w-full" />
                                                        <div className="h-8 rounded bg-gray-200 w-full" />
                                                        <div className="h-8 rounded bg-gray-200 w-full" />
                                                    </div>
                                                )}
                                            </Box>
                                        ) : (
                                            // Phase 3: memory chunks
                                            <Box display="flex" flexDirection="column" gap="8">
                                                {MOCK_MEMORY_CHUNKS.map((chunk, i) => (
                                                    <Box key={i} display="flex" gap="12">
                                                        <Text
                                                            color="fg.tertiary"
                                                            fontSize="sm"
                                                            style={{ minWidth: "96px", flexShrink: 0 }}
                                                        >
                                                            {chunk.label}
                                                        </Text>
                                                        <Text color="fg.secondary" fontSize="sm">
                                                            {chunk.content}
                                                        </Text>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                </DisclosureContent>
                            </Disclosure>
                        ) : null}
                    </Box>
                </>
            )}
        </Box>
    );
}
