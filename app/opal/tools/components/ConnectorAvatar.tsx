"use client";

import type { ComponentType, SVGProps } from "react";
import { Box, Text } from "@optiaxiom/react";
import type { Connector } from "../data/connectors";
import asanaLogo from "../connector logos/Asana Logo.png";
import amplitudeLogo from "../connector logos/amplitude.png";
import bynderLogo from "../connector logos/Bynder Blue Logo.png";
import gmailLogo from "../connector logos/Gmail Logo Brand Assets.png";
import googleAnalyticsLogo from "../connector logos/Google Analytics Logo.png";
import googleDocLogo from "../connector logos/google doc.png";
import googleSheetsLogo from "../connector logos/google_sheet.png";
import googleSlidesLogo from "../connector logos/google slides.png";
import hubspotLogo from "../connector logos/HubSpot Logo.png";
import atlassianRovoLogo from "../connector logos/Atlassian 1.svg";
import outlookLogo from "../connector logos/outlook.jpeg";
import salesforceLogo from "../connector logos/Salesforce Logo Brand Assets.png";
import tableauLogo from "../connector logos/Tableau Logo.png";
import teamsLogo from "../connector logos/teams.jpeg";

type SvgLogoComponent = ComponentType<SVGProps<SVGElement>>;
type LogoSource = string | { src: string } | SvgLogoComponent;

const CONNECTOR_LOGOS: Partial<Record<Connector["id"], { src: LogoSource; alt: string; inset?: number; offsetY?: number }>> = {
    gmail: { src: gmailLogo, alt: "Gmail", inset: 5 },
    "google-calendar": { src: "https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png", alt: "Google Calendar", inset: 8 },
    "google-docs": { src: googleDocLogo, alt: "Google Docs", inset: 5 },
    "google-sheets": { src: googleSheetsLogo, alt: "Google Sheets", inset: 5 },
    "google-slides": { src: googleSlidesLogo, alt: "Google Slides", inset: 5 },
    "google-analytics": { src: googleAnalyticsLogo, alt: "Google Analytics", inset: 5 },
    "microsoft-outlook": { src: outlookLogo, alt: "Microsoft Outlook", inset: 5 },
    "microsoft-teams": { src: teamsLogo, alt: "Microsoft Teams", inset: 5 },
    salesforce: { src: salesforceLogo, alt: "Salesforce", inset: 5 },
    hubspot: { src: hubspotLogo, alt: "HubSpot", inset: 5 },
    amplitude: { src: amplitudeLogo, alt: "Amplitude", inset: 5 },
    "atlassian-rovo": { src: atlassianRovoLogo, alt: "Atlassian Rovo", inset: 5, offsetY: -4 },
    asana: { src: asanaLogo, alt: "Asana", inset: 5 },
    bynder: { src: bynderLogo, alt: "Bynder", inset: 5 },
    tableau: { src: tableauLogo, alt: "Tableau", inset: 5 },
    github: { src: "https://github.githubassets.com/favicons/favicon.svg", alt: "GitHub", inset: 8 },
    slack: { src: "https://a.slack-edge.com/80588/marketing/img/meta/slack_hash_256.png", alt: "Slack", inset: 6 },
    notion: { src: "https://www.notion.so/images/logo-ios.png", alt: "Notion", inset: 7 },
    figma: { src: "https://static.figma.com/app/icon/2/favicon.svg", alt: "Figma", inset: 7 },
    linkedin: { src: "https://static.licdn.com/aero-v1/scds/common/u/images/logos/favicons/v1/favicon.ico", alt: "LinkedIn", inset: 7 },
    zoom: { src: "https://st1.zoom.us/zoom.ico", alt: "Zoom", inset: 7 },
};

interface ConnectorAvatarProps {
    connector: Connector;
    size?: number;
    framed?: boolean;
}

export function ConnectorAvatar({ connector, size = 40, framed = true }: ConnectorAvatarProps) {
    const logo = CONNECTOR_LOGOS[connector.id];

    if (logo) {
        const inset = logo.inset ?? 8;
        const innerSize = framed ? size - inset * 2 : size;
        const offsetY = logo.offsetY ?? 0;

        if (typeof logo.src === "function") {
            const SvgLogo = logo.src;

            if (!framed) {
                return (
                    <SvgLogo
                        aria-label={logo.alt}
                        style={{
                            width: innerSize,
                            height: innerSize,
                            display: "block",
                            flexShrink: 0,
                            transform: `translateY(${offsetY}px)`,
                        }}
                    />
                );
            }

            return (
                <Box
                    rounded="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    style={{
                        width: size,
                        height: size,
                        background: "var(--ax-colors-bg-secondary)",
                        color: connector.color,
                        border: "1px solid var(--ax-colors-border-tertiary)",
                        flexShrink: 0,
                    }}
                >
                    <SvgLogo
                        aria-label={logo.alt}
                        style={{
                            width: innerSize,
                            height: innerSize,
                            display: "block",
                            transform: `translateY(${offsetY}px)`,
                        }}
                    />
                </Box>
            );
        }

        const src = typeof logo.src === "string" ? logo.src : logo.src.src;

        if (!framed) {
            return (
                <img
                    src={src}
                    alt={logo.alt}
                    style={{
                        width: innerSize,
                        height: innerSize,
                        objectFit: "contain",
                        display: "block",
                        flexShrink: 0,
                        transform: `translateY(${offsetY}px)`,
                    }}
                />
            );
        }

        return (
            <Box
                rounded="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
                style={{
                    width: size,
                    height: size,
                    background: "var(--ax-colors-bg-secondary)",
                    color: connector.color,
                    border: "1px solid var(--ax-colors-border-tertiary)",
                    flexShrink: 0,
                }}
            >
                <img
                    src={src}
                    alt={logo.alt}
                    style={{
                        width: innerSize,
                        height: innerSize,
                        objectFit: "contain",
                        display: "block",
                        transform: `translateY(${offsetY}px)`,
                    }}
                />
            </Box>
        );
    }

    return (
        <Box
            rounded="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            style={{
                width: size,
                height: size,
                background: connector.color,
                color: connector.textColor,
                flexShrink: 0,
            }}
        >
            <Text
                fontSize="sm"
                fontWeight="600"
                style={{ color: connector.textColor, lineHeight: 1 }}
            >
                {connector.initials}
            </Text>
        </Box>
    );
}
