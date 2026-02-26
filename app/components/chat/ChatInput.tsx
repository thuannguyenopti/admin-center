"use client";

import { Box, Button, Textarea, Tooltip, Menu, MenuContent, MenuTrigger } from "@optiaxiom/react";
import { IconMicrophone, IconArrowUp, IconSquare } from "@tabler/icons-react";
import { IconAgent, IconFileArrowUp } from "@optimizely/axiom-icons";
import { useState, useRef, useEffect } from "react";

const opal_primary = "#7C3AED";

interface ChatInputProps {
    onSend?: (value: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
}

const agents = [
    { label: "Opal (Default)", value: "opal" },
    { label: "Data Analyst", value: "data-analyst" },
    { label: "Content Writer", value: "content-writer" },
];

export function ChatInput({ onSend, placeholder, autoFocus }: ChatInputProps) {
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [status, setStatus] = useState<'empty' | 'typing' | 'processing'>('empty');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }

        if (status !== 'processing') {
            if (inputValue.trim().length > 0) {
                setStatus('typing');
            } else {
                setStatus('empty');
            }
        }

        if (inputValue.endsWith('@')) {
            setIsAgentMenuOpen(true);
        }
    }, [inputValue, status]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        if (inputValue.trim()) {
            setStatus('processing');
            onSend?.(inputValue);

            setTimeout(() => {
                setInputValue("");
                setStatus('empty');
            }, 1000);
        }
    };

    const handleCancel = () => {
        setStatus('empty');
    };

    const handleAgentSelect = (agentName: string) => {
        if (inputValue.endsWith('@')) {
            setInputValue(prev => prev + agentName + " ");
        } else {
            setInputValue(prev => prev + "@" + agentName + " ");
        }
        setIsAgentMenuOpen(false);
        setTimeout(() => textareaRef.current?.focus(), 0);
    };

    return (
        <Box
            w="full"
            style={{
                position: "relative",
                borderColor: isFocused ? opal_primary : '#E5E7EB',
                transition: "border-color 0.2s ease-in-out"
            }}
            bg="bg.default"
            px="16"
            py="8"
            rounded="lg"
            border="1"
            borderColor="border.tertiary"
            shadow="sm"
        >
            <Textarea
                className="w-full text-md outline-none bg-transparent placeholder-gray-400 resize-none"
                placeholder={placeholder || 'Ask Opal anything...'}
                value={inputValue}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                ref={textareaRef}
                rows={1}
                autoFocus={autoFocus}
                disabled={status === 'processing'}
                style={{
                    minHeight: "24px",
                    maxHeight: "200px",
                    border: "none",
                    padding: 0,
                    paddingBottom: "40px",
                    overflowY: "auto",
                    boxShadow: "none",
                    outline: "none",
                    backgroundColor: "transparent",
                    width: '100%'
                }}
            />
            <Box display="flex" justifyContent="space-between" alignItems="center" style={{ position: "absolute", bottom: "8px", left: "16px", right: "16px", pointerEvents: "none", zIndex: 10 }}>
                <Box display="flex" gap="4" style={{ pointerEvents: "auto" }}>

                    <Menu
                        open={isAgentMenuOpen}
                        onOpenChange={setIsAgentMenuOpen}
                        options={agents.map(agent => ({
                            label: agent.label,
                            execute: () => handleAgentSelect(agent.label)
                        }))}
                    >
                        <MenuTrigger asChild>
                            <Box>
                                <Tooltip content="Agents (@)">
                                    <Button appearance="subtle" size="sm" icon={<IconAgent />} aria-label="Agent" />
                                </Tooltip>
                            </Box>
                        </MenuTrigger>
                        <MenuContent />
                    </Menu>

                    <Tooltip content="Upload file">
                        <Button appearance="subtle" size="sm" icon={<IconFileArrowUp />} aria-label="File upload" />
                    </Tooltip>
                </Box>

                <Box style={{ pointerEvents: "auto" }}>
                    {status === 'empty' && (
                        <Tooltip content="Voice Input">
                            <Button appearance="primary" size="md" icon={<IconMicrophone />} rounded="full" aria-label="Voice search" style={{ backgroundColor: opal_primary }} onClick={() => { }} />
                        </Tooltip>
                    )}
                    {status === 'typing' && (
                        <Tooltip content="Send">
                            <Button appearance="primary" size="md" icon={<IconArrowUp />} rounded="full" aria-label="Send" style={{ backgroundColor: opal_primary }} onClick={handleSubmit} />
                        </Tooltip>
                    )}
                    {status === 'processing' && (
                        <Tooltip content="Stop generating">
                            <Button appearance="subtle" size="md" icon={<IconSquare fill="currentColor" size={14} />} rounded="full" aria-label="Stop" style={{ border: "1px solid #E5E7EB" }} onClick={handleCancel} />
                        </Tooltip>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
