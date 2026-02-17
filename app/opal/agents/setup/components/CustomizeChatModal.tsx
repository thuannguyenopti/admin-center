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
} from "@optiaxiom/react";
import { IconTrashCan, IconPlus } from "@optimizely/axiom-icons";
import { useState, useEffect } from "react";

interface CustomizeChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMessage: string;
    onUpdate: (initialMessage: string, suggestedPrompts: string) => void;
    currentSuggestedPrompts: string;
}

export function CustomizeChatModal({
    isOpen,
    onClose,
    initialMessage,
    onUpdate,
    currentSuggestedPrompts,
}: CustomizeChatModalProps) {
    const [localInitialMessage, setLocalInitialMessage] = useState(initialMessage);
    const [promptsList, setPromptsList] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setLocalInitialMessage(initialMessage);
            // Convert newline-separated string to array, filtering empty lines
            setPromptsList(
                currentSuggestedPrompts
                    ? currentSuggestedPrompts.split("\n").filter((p) => p.trim() !== "")
                    : []
            );
        }
    }, [isOpen, initialMessage, currentSuggestedPrompts]);

    const handleAddPrompt = () => {
        setPromptsList([...promptsList, ""]);
    };

    const handleUpdatePrompt = (index: number, value: string) => {
        const newPrompts = [...promptsList];
        newPrompts[index] = value;
        setPromptsList(newPrompts);
    };

    const handleRemovePrompt = (index: number) => {
        const newPrompts = promptsList.filter((_, i) => i !== index);
        setPromptsList(newPrompts);
    };

    const handleSave = () => {
        onUpdate(localInitialMessage, promptsList.join("\n"));
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent style={{ maxWidth: "1096px", width: "1096px", height: "auto", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {/* Structure matching Figma: Left Panel (Inputs) + Right Panel (Preview) */}
                <Box display="flex" flexDirection="row" style={{ height: "660px" }}>
                    {/* Left Panel */}
                    <Box flex="1" p="32" display="flex" flexDirection="column" gap="16" style={{ borderRight: "1px solid var(--ax-colors-border-tertiary)" }} overflowY="auto">
                        {/* Title */}
                        <Heading level="3" mb="8">Customize Chat Interactions</Heading>

                        <Text fontWeight="600" color="fg.secondary" fontSize="sm">Multi-turn Chat Experience</Text>

                        {/* First Message */}
                        <Box>
                            <Box display="flex" gap="4" alignItems="center" mb="4">
                                <Text fontSize="sm" color="fg.secondary">First Message</Text>
                            </Box>
                            <Textarea
                                value={localInitialMessage}
                                onChange={(e) => setLocalInitialMessage(e.target.value)}
                                placeholder="Hi! I can help you..."
                                style={{ height: "120px", resize: "none" }}
                            />
                        </Box>

                        {/* Quick Start Prompts */}
                        <Box flex="1" overflowY="visible">
                            <Box display="flex" gap="4" alignItems="center" mb="4">
                                <Text fontSize="sm" color="fg.secondary">Quick Start Prompts</Text>
                            </Box>
                            <Box display="flex" flexDirection="column" gap="16">
                                {promptsList.map((prompt, index) => (
                                    <Box key={index} display="flex" gap="8" alignItems="end">
                                        <Box flex="1">
                                            <Text fontSize="sm" color="fg.secondary" mb="4">Suggested Prompt</Text>
                                            <Input
                                                value={prompt}
                                                onChange={(e) => handleUpdatePrompt(index, e.target.value)}
                                                placeholder="Eg. Localize my content"
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
                                <Button appearance="subtle" icon={<IconPlus />} size="sm" onClick={handleAddPrompt} style={{ alignSelf: "flex-start" }}>Add prompt</Button>
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

                                        {promptsList.filter(p => p).length > 0 && (
                                            <Box mt="16">
                                                <Text fontSize="xs" color="fg.secondary" mb="8">Suggestions:</Text>
                                                <Box display="flex" flexDirection="column" gap="8">
                                                    {promptsList.filter(p => p).map((p, i) => (
                                                        <Box key={i} px="16" py="8" rounded="md" style={{ border: "1px solid var(--ax-colors-border-focus)", backgroundColor: "var(--ax-colors-bg-accent-subtle)", borderColor: "#ddd6fe", background: "linear-gradient(90deg, #F5F3FF 0%, #E5EFFF 100%)" }}>
                                                            <Text fontSize="sm" lineClamp="1" color="fg.default">{p}</Text>
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
