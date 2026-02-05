"use client";

import { Box, Button, Menu, MenuTrigger, MenuContent } from "@optiaxiom/react";
import { Text } from "../Text";
import { IconMenu2, IconPlus, IconChevronDown } from "@tabler/icons-react";
import { opalTypography } from "@/app/styles/opalTypography";

type OpalHomeHeaderProps = {
    onToggleHistory: () => void;
    onNewChat: () => void;
};

export function OpalHomeHeader({
    onToggleHistory,
    onNewChat
}: OpalHomeHeaderProps) {
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            style={{
                padding: '12px 24px',
                width: '100%',
                backgroundColor: 'var(--opal-bg-primary)',
                borderBottom: '1px solid var(--opal-border-secondary)',
                minHeight: '64px',
                zIndex: 1,
            }}
        >
            <Box display="flex" alignItems="center" gap="8">
                <Button
                    appearance="subtle"
                    icon={<IconMenu2 size={20} />}
                    onClick={onToggleHistory}
                    aria-label="Toggle history"
                />
                <Button
                    appearance="subtle"
                    icon={<IconPlus size={20} />}
                    onClick={onNewChat}
                    aria-label="New chat"
                />
                <Menu
                    options={[
                        {
                            label: "Opal",
                            disabledReason: "Current view",
                        },
                        {
                            label: "Settings",
                            disabledReason: "Coming soon",
                        },
                    ]}
                >
                    <MenuTrigger asChild>
                        <Box
                            display="flex"
                            alignItems="center"
                            gap="4"
                            style={{ cursor: 'pointer', marginLeft: '8px' }}
                        >
                            <Text
                                style={{
                                    ...opalTypography.title,
                                    margin: 0,
                                    color: 'var(--opal-text-primary)',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                }}
                            >
                                Opal
                            </Text>
                            <IconChevronDown size={14} style={{ color: 'var(--opal-text-secondary)' }} />
                        </Box>
                    </MenuTrigger>
                    <MenuContent />
                </Menu>
            </Box>
        </Box>
    );
}
