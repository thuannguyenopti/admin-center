"use client";

import React from "react";
import {
    Box,
    Button,
    Field,
    Menu,
    MenuContent,
    MenuTrigger,
    Tabs,
    TabsList,
    TabsTrigger,
    Text,
} from "@optiaxiom/react";
import { IconPlus, IconSection, IconSparkles, IconSquare } from "@tabler/icons-react";
import styles from "../VBPrototype.module.css";

type OutlineHeaderProps = {
    AI: boolean;
    setAI: React.Dispatch<React.SetStateAction<boolean>>;

    activeTab: string;
    setActiveTab: (value: string) => void;

    onAddSection: () => void;
    onAddRandomBlock: () => void;

    onSendAIMessage: (message: string) => Promise<void> | void;
};

export default function OutlineHeader({
    AI,
    setAI,
    activeTab,
    setActiveTab,
    onAddSection,
    onAddRandomBlock,
    onSendAIMessage,
}: OutlineHeaderProps) {
    return (
        <>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap="4"
                px="24"
                pr="0"
                py="8"
            >
                <Text fontSize="2xl" fontWeight="500" color="fg.default">
                    Page
                </Text>

                <Box display="flex" alignItems="center" gap="2">
                    <Button
                        onClick={() => setAI(!AI)}
                        appearance="subtle"
                        size="sm"
                        aria-label="AI"
                        icon={<IconSparkles />}
                    />

                    <Menu
                        options={[
                            { addon: <IconSection size={16} />, label: "Section", execute: onAddSection },
                            { addon: <IconSquare size={16} />, label: "Random Block", execute: onAddRandomBlock },
                        ]}
                    >
                        <MenuTrigger
                            icon={<IconPlus />}
                            aria-label="add"
                            appearance="subtle"
                            size="sm"
                            iconPosition="start"
                        />
                        <MenuContent />
                    </Menu>

                    <div
                        className={`absolute -right-[10px] top-[62px] opacity-0 invisible z-10 p-1 rounded-md ${styles.popupMenu}`}
                        style={{
                            visibility: AI ? "visible" : undefined,
                            opacity: AI ? 1 : 0,
                            transform: AI ? "scale(1)" : "scale(0.9)",
                            transformOrigin: "top center",
                            transition: "0.3s",
                        }}
                    >
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                await onSendAIMessage(e.currentTarget.prompt.value);
                                e.currentTarget.reset();
                            }}
                        >
                            <Field>
                                <textarea
                                    name="prompt"
                                    rows={3}
                                    className="w-full border rounded p-2 focus:outline-none focus:ring-2"
                                    placeholder="What do you want to build today?"
                                    ref={(el) => {
                                        if (AI && el) el.focus();
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            const form = (e.target as HTMLTextAreaElement).form;
                                            form?.requestSubmit();
                                            setAI(false);
                                        }
                                    }}
                                />
                            </Field>
                        </form>
                    </div>
                </Box>
            </Box>

            <Box display="flex">
                <Box w="20" />
                <Box flex="1" borderB="1" borderColor="border.tertiary">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList gap="24">
                            <TabsTrigger
                                value="main"
                                fontSize="md"
                                fontWeight="500"
                                color={activeTab === "main" ? "fg.default" : "fg.secondary"}
                            >
                                Main
                            </TabsTrigger>
                            <TabsTrigger
                                value="properties"
                                fontSize="md"
                                fontWeight="500"
                                color={activeTab === "properties" ? "fg.default" : "fg.secondary"}
                            >
                                Properties
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </Box>
            </Box>
        </>
    );
}
