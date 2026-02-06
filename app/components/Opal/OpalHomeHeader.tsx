"use client";

import { Box, Button, Menu, MenuTrigger, MenuContent } from "@optiaxiom/react";
import { Text } from "../Text";
import { IconBars, IconCirclePlus } from "@optimizely/axiom-icons";
import IconDropdown from "@/app/assets/opal/icon-dropdown.svg";
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
                padding: '16px 24px',
                width: '100%',
                backgroundColor: 'var(--opal-bg-primary)',
                borderBottom: '1px solid var(--opal-border-secondary)',
                minHeight: '56px',
                zIndex: 10,
                gap: '12px',
                position: 'sticky',
                top: 0,
            }}
        >
            <Box display="flex" alignItems="center" gap="12">
                <Button
                    appearance="subtle"
                    onClick={onToggleHistory}
                    aria-label="Toggle history"
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '6px',
                        padding: 0,
                        minWidth: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <IconBars size={16} />
                </Button>
                <Button
                    appearance="subtle"
                    onClick={onNewChat}
                    aria-label="New chat"
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '6px',
                        padding: 0,
                        minWidth: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <IconCirclePlus size={20} />
                </Button>
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
                            gap="8"
                            style={{ cursor: 'pointer' }}
                        >
                            <Text
                                style={{
                                    ...opalTypography.title,
                                    margin: 0,
                                    color: 'var(--opal-text-primary)',
                                }}
                            >
                                Opal
                            </Text>
                            <IconDropdown style={{ width: '10px', height: '5px' }} />
                        </Box>
                    </MenuTrigger>
                    <MenuContent />
                </Menu>
            </Box>
        </Box>
    );
}
