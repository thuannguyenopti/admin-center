"use client";

import {
    Dialog,
    DialogContent,
    Box,
    Text,
    Button,
    Input,
    Textarea,
    Heading,
    Select,
    SelectTrigger,
    SelectContent,
    Tooltip,
} from "@optiaxiom/react";
import { Range } from "@optiaxiom/react/unstable";
import { IconTrashCan, IconPlus } from "@optimizely/axiom-icons";
import { IconHelp } from "@tabler/icons-react";
import { useState, useEffect } from "react";

interface CustomizeChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMessage: string;
    onUpdate: (initialMessage: string, suggestedPrompts: { label: string; prompt: string }[], memoryTokenLimit: number) => void;
    currentSuggestedPrompts: { label: string; prompt: string }[];
    memoryTokenLimit: number;
}

export function CustomizeChatModal({
    isOpen,
    onClose,
    initialMessage,
    onUpdate,
    currentSuggestedPrompts,
    memoryTokenLimit,
}: CustomizeChatModalProps) {
    const [localInitialMessage, setLocalInitialMessage] = useState(initialMessage);
    const [promptsList, setPromptsList] = useState<{ label: string; prompt: string }[]>([]);
    const [localMemoryTokenLimit, setLocalMemoryTokenLimit] = useState(memoryTokenLimit);

    useEffect(() => {
        if (isOpen) {
            setLocalInitialMessage(initialMessage);
            setLocalMemoryTokenLimit(memoryTokenLimit);
            setPromptsList(currentSuggestedPrompts || []);
        }
    }, [isOpen, initialMessage, currentSuggestedPrompts, memoryTokenLimit]);

    const handleAddPrompt = () => {
        setPromptsList([...promptsList, { label: "", prompt: "" }]);
    };

    const handleUpdatePromptLabel = (index: number, value: string) => {
        const newPrompts = [...promptsList];
        newPrompts[index].label = value;
        setPromptsList(newPrompts);
    };

    const handleUpdatePromptValue = (index: number, value: string) => {
        const newPrompts = [...promptsList];
        newPrompts[index].prompt = value;
        setPromptsList(newPrompts);
    };

    const handleRemovePrompt = (index: number) => {
        const newPrompts = promptsList.filter((_, i) => i !== index);
        setPromptsList(newPrompts);
    };

    const handleSave = () => {
        onUpdate(localInitialMessage, promptsList, localMemoryTokenLimit);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent style={{ maxWidth: "1096px", width: "1096px", height: "auto", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {/* Structure matching Figma: Left Panel (Inputs) + Right Panel (Preview) */}
                <Box display="flex" flexDirection="row" style={{ height: "660px" }}>
                    {/* Left Panel */}
                    <Box flex="1" p="32" display="flex" flexDirection="column" gap="24" style={{ borderRight: "1px solid var(--ax-colors-border-tertiary)" }} overflowY="auto">
                        {/* Title */}
                        <Heading level="3" mb="8">Advanced Chat Settings</Heading>

                        {/* Model Settings Section */}
                        <Box display="flex" flexDirection="column" gap="16">


                            {/* Memory Token Limit Slider */}
                            <Box style={{ maxWidth: "360px" }}>
                                <Box display="flex" alignItems="center" gap="4" mb="8">
                                    <Text fontSize="md">Memory Token Limit</Text>
                                    <Tooltip delayDuration={300} content="Adjusts the context window size">
                                        <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />
                                    </Tooltip>
                                </Box>
                                <Box display="flex" alignItems="center" gap="16">
                                    <Box flex="1">
                                        <Range
                                            value={localMemoryTokenLimit}
                                            onValueChange={setLocalMemoryTokenLimit}
                                            max={700000}
                                            min={100000}
                                            step={1000}
                                            marks={[
                                                { value: 100000, label: "Low" },
                                                { value: 400000, label: "Medium" },
                                                { value: 700000, label: "High" },
                                            ]}
                                        />
                                    </Box>
                                    <Input
                                        type="number"
                                        value={localMemoryTokenLimit}
                                        onChange={(e) => setLocalMemoryTokenLimit(parseInt(e.target.value) || 0)}
                                        style={{ width: "100px", height: "32px", marginBottom: "20px" }}
                                    />
                                </Box>
                            </Box>

                        </Box>

                        <Box borderT="1" borderColor="border.tertiary" />

                        {/* Chat Experience Section */}
                        <Box display="flex" flexDirection="column" gap="16">
                            <Text fontWeight="600" color="fg.secondary" fontSize="md">Multi-turn Chat Experience</Text>

                            {/* First Message */}
                            <Box>
                                <Box display="flex" gap="4" alignItems="center" mb="4">
                                    <Text fontSize="md">First Message</Text>
                                </Box>
                                <Textarea
                                    value={localInitialMessage}
                                    onChange={(e) => setLocalInitialMessage(e.target.value)}
                                    placeholder="Hi! I can help you..."
                                    style={{ height: "120px", resize: "none" }}
                                />
                            </Box>

                            <Box flex="1" overflowY="visible" mt="16">
                                <Box display="flex" flexDirection="column" gap="4" mb="12">
                                    <Text fontSize="md">Quick Start Prompts</Text>
                                    <Text fontSize="sm" color="fg.secondary">Clickable buttons that offer suggested prompts to guide the conversation.</Text>
                                </Box>
                                <Box display="flex" flexDirection="column" gap="16">
                                    {promptsList.map((item, index) => (
                                        <Box key={index} display="flex" gap="12" alignItems="end">
                                            <Box flex="1">
                                                <Text fontSize="md" mb="4">Suggested Prompt</Text>
                                                <Input
                                                    value={item.label}
                                                    onChange={(e) => handleUpdatePromptLabel(index, e.target.value)}
                                                    placeholder="Author Bio"
                                                />
                                            </Box>
                                            <Box flex="1">
                                                <Text fontSize="md" mb="4">Prompt to LLM</Text>
                                                <Input
                                                    value={item.prompt}
                                                    onChange={(e) => handleUpdatePromptValue(index, e.target.value)}
                                                    placeholder="Tell me about..."
                                                />
                                            </Box>
                                            <Button
                                                appearance="subtle"
                                                icon={<IconTrashCan />}
                                                onClick={() => handleRemovePrompt(index)}
                                                aria-label="Remove prompt"
                                            />
                                        </Box>
                                    ))}
                                    <Button appearance="subtle" icon={<IconPlus />} size="md" onClick={handleAddPrompt} style={{ alignSelf: "flex-start" }}>Add Prompt</Button>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    {/* Right Panel - Preview */}
                    <Box bg="bg.secondary" p="24" display="flex" alignItems="center" justifyContent="center" style={{ width: "459px", borderLeft: "1px solid var(--ax-colors-border-secondary)" }}>
                        {/* Chat Preview Card */}
                        <Box bg="bg.page" rounded="lg" shadow="lg" w="full" h="full" display="flex" flexDirection="column" style={{ border: "1px solid var(--ax-colors-border-secondary)" }}>
                            {/* Header */}
                            <Box p="16" display="flex" justifyContent="center" style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
                                <Text fontWeight="500">Opal Chat Preview</Text>
                            </Box>

                            {/* Body */}
                            <Box flex="1" p="16" display="flex" flexDirection="column" gap="16" overflowY="auto">
                                {/* Agent Message */}
                                <Box display="flex" gap="8" alignItems="start">
                                    <Box flex="1" bg="bg.secondary" p="12" rounded="md" style={{ borderRadius: "0 8px 8px 8px" }}>
                                        <Text fontSize="md" style={{ whiteSpace: "pre-wrap" }}>{localInitialMessage || "Hi! I can help you..."}</Text>

                                        {promptsList.filter(p => p.label).length > 0 && (
                                            <Box mt="16">
                                                <Text fontSize="xs" color="fg.secondary" mb="8">Suggestions:</Text>
                                                <Box display="flex" flexDirection="column" gap="8">
                                                    {promptsList.filter(p => p.label).map((p, i) => (
                                                        <Box key={i} px="16" py="8" rounded="md" style={{ border: "1px solid var(--ax-colors-border-focus)", backgroundColor: "var(--ax-colors-bg-accent-subtle)", borderColor: "#ddd6fe", background: "linear-gradient(90deg, #F5F3FF 0%, #E5EFFF 100%)" }}>
                                                            <Text fontSize="sm" lineClamp="1" color="fg.default">{p.label}</Text>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box>

                            {/* Footer Input */}
                            <Box p="16" style={{ borderTop: "1px solid var(--ax-colors-border-secondary)" }}>
                                <Box bg="bg.default" rounded="md" p="8" style={{ height: "88px", border: "1px solid var(--ax-colors-border-default)" }}>
                                    <Text fontSize="sm" color="fg.tertiary">Ask Opal anything...</Text>
                                </Box>
                                <Text fontSize="xs" color="fg.tertiary" mt="8" textAlign="center">Opal can make mistakes. Double-check its responses.</Text>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Footer Buttons */}
                <Box p="20" display="flex" justifyContent="flex-end" gap="12" bg="bg.default" style={{ borderTop: "1px solid var(--ax-colors-border-tertiary)" }}>
                    <Button appearance="subtle" onClick={onClose}>Cancel</Button>
                    <Button appearance="primary" onClick={handleSave}>Update</Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
