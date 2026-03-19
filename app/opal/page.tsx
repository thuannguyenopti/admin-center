"use client";

import { Box, Heading, Text, Button, Textarea } from "@optiaxiom/react";
import { IconMicrophone } from "@tabler/icons-react";
import { IconAgent, IconFileArrowUp, IconArrowUp, IconCircleStop, IconBrowser, IconPen, IconFile, IconUserGroup, IconChartLine, IconImage } from "@optimizely/axiom-icons";
import { useState, useRef, useEffect } from "react";

const opal_primary = "#7C3AED";

export default function OpalPage() {
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const hasValue = inputValue.trim().length > 0;

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, window.innerHeight / 3)}px`;
        }
    }, [inputValue]);

    const toggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());
                setIsTranscribing(true);
                try {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const formData = new FormData();
                    formData.append('audio', audioBlob, 'recording.webm');
                    const response = await fetch('/api/transcribe', { method: 'POST', body: formData });
                    if (response.ok) {
                        const { text } = await response.json();
                        if (text) setInputValue((v) => v + (v && !v.endsWith(' ') ? ' ' : '') + text);
                    }
                } catch (err) {
                    console.error('[Voice] Transcription error:', err);
                } finally {
                    setIsTranscribing(false);
                }
            };

            mediaRecorder.onerror = () => {
                setIsRecording(false);
                stream.getTracks().forEach((t) => t.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('[Voice] Mic access denied:', err);
            alert('Microphone access was denied. Please check your browser permissions.');
        }
    };

    const handleSend = () => {
        if (!hasValue) return;
        // TODO: wire to chat
        setInputValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const cards = [
        {
            icon: <Box style={{ color: opal_primary }}><IconBrowser size={24} /></Box>,
            title: "Optimize webpage",
            description: "Refine the page Event - Triathlon NYC to meet the business goal.",
            prompt: "Optimize the [page name] to improve [key metric] for [target audience]. Focus on [specific element] and ensure it aligns with our business goal of [goal]."
        },
        {
            icon: <Box style={{ color: opal_primary }}><IconPen size={24} /></Box>,
            title: "Plan campaign",
            description: "Brainstorm and map out your next campaign with Opal.",
            prompt: "Create a comprehensive campaign plan for [campaign name] targeting [audience]. Include [number] creative variations, timeline spanning [duration], and key messaging around [theme]."
        },
        {
            icon: <Box style={{ color: opal_primary }}><IconFile size={24} /></Box>,
            title: "Create landing page",
            description: "Turn your design into a high-converting landing page with structure.",
            prompt: "Design a landing page for [product/service] that converts [target audience]. Include sections for [section 1], [section 2], and [section 3]. The primary CTA should be [call to action]."
        },
        {
            icon: <Box style={{ color: opal_primary }}><IconUserGroup size={24} /></Box>,
            title: "Find the right audience",
            description: "Identify high-performing audience segments based on past experiments.",
            prompt: "Analyze our customer data to identify audience segments for [product/campaign]. Focus on users who [behavior/characteristic] and have shown interest in [interest area]. Include demographic and psychographic insights."
        },
        {
            icon: <Box style={{ color: opal_primary }}><IconChartLine size={24} /></Box>,
            title: "Analyze page performance",
            description: "Analyze traffic and bounce rate for the Home page.",
            prompt: "Analyze the performance of [page name] focusing on [metric 1], [metric 2], and [metric 3]. Provide insights on [time period] data and suggest [number] actionable improvements."
        },
        {
            icon: <Box style={{ color: opal_primary }}><IconImage size={24} /></Box>,
            title: "Repurpose your assets",
            description: "Find existing assets you can reuse —and put them to work faster.",
            prompt: "Identify existing [asset type] that can be repurposed for [new channel/campaign]. Focus on content related to [topic/theme] and suggest [number] ways to adapt them for [platform/audience]."
        }
    ];

    const handleCardClick = (prompt: string) => {
        setInputValue(prompt);
        textareaRef.current?.focus();
    };

    return (
        <Box p="32" display="flex" flexDirection="column" gap="32" alignItems="center" style={{ maxWidth: "1200px" }} mx="auto">
            <Box textAlign="center" my="16">
                <Heading level="2" fontSize="3xl" color="fg.default">What are we working on today?</Heading>
            </Box>

            <Box
                w="full"
                style={{
                    maxWidth: "800px",
                    position: "relative",
                    borderColor: isFocused || isRecording ? opal_primary : undefined,
                    transition: "border-color 0.2s ease-in-out"
                }}
                bg="bg.default"
                px="16"
                py="4"
                rounded="lg"
                border="1"
                borderColor={isFocused || isRecording ? undefined : "border.tertiary"}
                shadow="sm"
            >
                <Textarea
                    className="w-full text-md outline-none bg-transparent placeholder-gray-400 resize-none"
                    placeholder='Ask Opal anything—like "Plan a new campaign" or "Suggest test ideas"'
                    value={inputValue}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    ref={textareaRef}
                    rows={1}
                    style={{ minHeight: "22px", maxHeight: "33vh", border: "none", padding: 0, paddingBottom: "40px", overflowY: "auto", boxShadow: "none", outline: "none", backgroundColor: "transparent" }}
                />
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    style={{ position: "absolute", bottom: "8px", left: "16px", right: "16px", zIndex: 10 }}
                >
                    {/* Left: Agent, File */}
                    <Box display="flex" gap="4" alignItems="center">
                        <Button appearance="subtle" size="sm" icon={<IconAgent />} aria-label="Agent" style={{ color: "var(--ax-colors-fg-tertiary)" }} />
                        <Button appearance="subtle" size="sm" icon={<IconFileArrowUp />} aria-label="File upload" style={{ color: "var(--ax-colors-fg-tertiary)" }} />
                    </Box>

                    {/* Right: Mic + Send */}
                    <Box display="flex" gap="8" alignItems="center">
                        <Button
                            appearance="subtle"
                            size="sm"
                            icon={isRecording || isTranscribing ? <IconCircleStop size={16} /> : <IconMicrophone size={16} />}
                            aria-label={isRecording ? "Stop recording" : "Voice input"}
                            onClick={toggleRecording}
                            disabled={isTranscribing}
                            style={{
                                color: isRecording ? '#E01E5A' : "var(--ax-colors-fg-tertiary)",
                                backgroundColor: isRecording ? 'rgba(224, 30, 90, 0.1)' : 'transparent',
                                opacity: isTranscribing ? 0.5 : 1,
                            }}
                        />
                        <Button
                            appearance="primary"
                            size="lg"
                            icon={<IconArrowUp size={20} />}
                            rounded="full"
                            aria-label="Send message"
                            onClick={handleSend}
                            disabled={!hasValue}
                            style={{
                                backgroundColor: hasValue ? opal_primary : undefined,
                                opacity: hasValue ? 1 : 0.4,
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            <Box display="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(268px, 268px))", gap: "24px", justifyContent: "center" }} w="full">
                {cards.map((card, index) => (
                    <Box
                        key={index}
                        p="24"
                        border="1"
                        borderColor="border.tertiary"
                        rounded="lg"
                        bg="bg.default"
                        display="flex"
                        flexDirection="column"
                        gap="12"
                        style={{ maxWidth: "268px" }}
                        w="full"
                        className="hover:border-purple-500 cursor-pointer transition-colors"
                        onClick={() => handleCardClick(card.prompt)}
                    >
                        <Box display="flex" justifyContent="flex-end" mb="4">
                            {card.icon}
                        </Box>
                        <Heading level="4" fontSize="lg" fontWeight="600">{card.title}</Heading>
                        <Text color="fg.secondary" fontSize="md">{card.description}</Text>
                    </Box>
                ))}
            </Box>

            <Box w="full" style={{ maxWidth: "852px" }} display="flex" justifyContent="flex-end">
                <Button appearance="subtle">See more &gt;</Button>
            </Box>
        </Box>
    );
}
