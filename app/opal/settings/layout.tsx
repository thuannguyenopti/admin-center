"use client";

import { Box, Nav, NavBody, NavItem, Sidebar, Text } from "@optiaxiom/react";
import {
    IconBell,
    IconComments,
    IconEnvelope,
    IconPaintRoller,
    IconToggleOff,
} from "@optimizely/axiom-icons";
import { usePathname } from "next/navigation";

// ─── Settings sub-nav ─────────────────────────────────────────────────────────

const MY_SETTINGS = [
    {
        label: "Appearance",
        href: "/opal/settings/appearance",
        icon: <IconPaintRoller />,
    },
    {
        label: "Notifications",
        href: "/opal/settings/notifications",
        icon: <IconBell />,
    },
];

const ORG_SETTINGS = [
    {
        label: "Chat",
        href: "/opal/settings/chat",
        icon: <IconComments />,
    },
    {
        label: "Email domain",
        href: "/opal/settings/email-domain",
        icon: <IconEnvelope />,
    },
    {
        label: "Product Connections",
        href: "/opal/settings/product-connections",
        icon: <IconToggleOff />,
    },
];

function OpalSettingsSubNav() {
    const pathname = usePathname();

    return (
        <Box h="full" style={{ width: 272, flexShrink: 0, overflow: "hidden" }}>
        <Sidebar expanded={true} h="full">
                <Nav>
                    <NavBody>
                        {/* Title */}
                        <Box px="12" py="16">
                            <Text fontSize="md" fontWeight="600" color="fg.default">
                                Opal Configurations
                            </Text>
                        </Box>
                        <Box px="12" pb="4">
                            <Text fontSize="sm" color="fg.tertiary">
                                My Settings
                            </Text>
                        </Box>
                        {MY_SETTINGS.map((item) => (
                            <NavItem
                                key={item.label}
                                active={pathname === item.href}
                                icon={item.icon}
                                onClick={() =>
                                    (window.location.href = item.href)
                                }
                            >
                                {item.label}
                            </NavItem>
                        ))}
                        <Box px="12" pt="16" pb="4">
                            <Text fontSize="sm" color="fg.tertiary">
                                Organization
                            </Text>
                        </Box>
                        {ORG_SETTINGS.map((item) => (
                            <NavItem
                                key={item.label}
                                active={pathname === item.href}
                                icon={item.icon}
                                onClick={() =>
                                    (window.location.href = item.href)
                                }
                            >
                                {item.label}
                            </NavItem>
                        ))}
                    </NavBody>
                </Nav>
        </Sidebar>
        </Box>
    );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function OpalSettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Box display="flex" h="full" overflow="hidden" bg="bg.default">
            <OpalSettingsSubNav />
            <Box flex="1" h="full" overflowY="auto" bg="bg.default">
                {children}
            </Box>
        </Box>
    );
}
