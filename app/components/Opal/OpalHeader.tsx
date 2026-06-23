"use client";

import { Box, Button, Tabs, TabsList, TabsTrigger } from "@optiaxiom/react";
import type { ReactNode } from "react";
import { Text } from "../Text";
import { InitialsAvatar, initialsFromName } from "@/app/opal/components/InitialsAvatar";
import {
    IconXmark,
    IconBars,
    IconCirclePlus,
    IconChevronDown,
    IconArrowsMaximize,
    IconSparkles,
    IconArrowUpRightFromSquare,
} from "@/app/lib/axiom-icons";
import { opalTypography } from "@/app/styles/opalTypography";
import { useEffect, useRef, useState } from "react";
import { useLoaderDev } from "@/app/opal/components/useLoaderDev";
import type { LoaderSequenceOption } from "@/app/opal/components/useLoaderDev";

type OpalHeaderProps = {
    onClose?: () => void;
    /** When set, renders an X button at the very start of the left group for quick-close (e.g. dismiss the chat panel in canvas mode). */
    onCloseLeft?: () => void;
    onNewChat?: () => void;
    mode?: 'docked' | 'popped-out';
    isHistoryVisible?: boolean;
    onToggleHistory: () => void;
    onToggleMode?: () => void;
    sticky?: boolean;
    imMode?: boolean;
    onToggleImMode?: () => void;
    rightActions?: ReactNode;
    /** IM mode: the active conversation/thread name to show in the header */
    imThreadName?: string;
    /** IM mode: whether the active conversation is with a VAU (adds Activities tab) */
    imIsVAU?: boolean;
    /** IM mode: whether the active conversation is a channel (rounded-square avatar) */
    imIsChannel?: boolean;
    /** IM mode: avatar URL for the active thread */
    imThreadAvatar?: string;
    /** IM mode: VAU template name shown below the thread name (e.g. "GEO Content Strategist") */
    imTemplateName?: string;
    /** IM mode: when set, clicking the avatar+name navigates (e.g. artifact → /opal/im) */
    onImThreadNameClick?: () => void;
    /** IM mode: simplified header — hamburger becomes X (calls onCloseLeft), tabs hidden */
    imSimplified?: boolean;
    /** IM mode: controlled active tab value */
    imActiveTab?: 'messages' | 'files' | 'activities';
    /** IM mode: callback when the user switches tabs */
    onImTabChange?: (tab: 'messages' | 'files' | 'activities') => void;
};

export function OpalHeader({
    onClose,
    onCloseLeft,
    onNewChat,
    onToggleHistory,
    onToggleMode,
    sticky = false,
    imMode = false,
    isHistoryVisible = false,
    onToggleImMode,
    rightActions,
    imThreadName,
    imIsVAU = false,
    imIsChannel = false,
    imThreadAvatar,
    imTemplateName,
    onImThreadNameClick,
    imSimplified = false,
    imActiveTab: imActiveTabProp,
    onImTabChange,
}: OpalHeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [imActiveTabLocal, setImActiveTabLocal] = useState<'messages' | 'files' | 'activities'>('messages');
    const imActiveTab = imActiveTabProp ?? imActiveTabLocal;
    const setImActiveTab = (tab: 'messages' | 'files' | 'activities') => {
        setImActiveTabLocal(tab);
        onImTabChange?.(tab);
    };
    const menuRef = useRef<HTMLDivElement>(null);
    const { enabled: devMode, sequence, update } = useLoaderDev();

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const showWindowControls = typeof onClose === "function";

    const imTabs = imIsVAU
        ? ['messages', 'files', 'activities'] as const
        : ['messages', 'files'] as const;

    const tabLabels: Record<string, string> = {
        messages: 'Messages',
        files: 'Files',
        activities: 'Activities',
    };

    const [hoverThreadTitle, setHoverThreadTitle] = useState(false);

    // ── IM mode: single row — hamburger · avatar · title [+ template name] · [64px] · tabs · spacer · right actions ──
    if (imMode && imThreadName) {
        return (
            <Box
                display="flex"
                alignItems="stretch"
                style={{
                    padding: '0 16px 0 8px',
                    width: '100%',
                    height: imSimplified ? '48px' : '56px',
                    flexShrink: 0,
                    zIndex: 10,
                    position: sticky ? 'sticky' : 'relative',
                    top: sticky ? 0 : undefined,
                    borderBottom: '1px solid var(--ax-colors-border-secondary)',
                }}
            >
                {/* Hamburger (or X in simplified/artifact mode) */}
                <Box display="flex" alignItems="center" style={{ flexShrink: 0, marginRight: '6px' }}>
                    <Button
                        appearance="subtle"
                        size="sm"
                        aria-label={imSimplified ? "Close" : "Toggle history"}
                        onClick={imSimplified ? onCloseLeft : onToggleHistory}
                        style={{ flexShrink: 0, padding: 0, minWidth: 'auto', width: '32px', height: '32px' }}
                    >
                        {imSimplified ? <IconXmark size={20} /> : <IconBars size={16} />}
                    </Button>
                </Box>

                {/* Avatar + title — optionally clickable (e.g. from artifact view → /opal/im) */}
                <Box
                    display="flex"
                    alignItems="center"
                    style={{
                        minWidth: 0,
                        overflow: 'hidden',
                        flexShrink: 1,
                        gap: '8px',
                        alignItems: 'center',
                        ...(onImThreadNameClick ? { cursor: 'pointer' } : {}),
                    }}
                    onClick={onImThreadNameClick}
                >
                    {/* Avatar — rounded-square for channels, circular img for DMs, initials fallback */}
                    <Box display="flex" alignItems="center" style={{ flexShrink: 0 }}>
                        {imIsChannel ? (() => {
                            const chanName = (imThreadName ?? '').replace(/^[#🔒⚠️]\s*/, '').trim();
                            const CHANNEL_COLORS = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#7c3aed'];
                            let h = 0;
                            for (const c of chanName) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
                            const bg = CHANNEL_COLORS[Math.abs(h) % CHANNEL_COLORS.length];
                            return (
                                <div style={{
                                    width: imSimplified ? 22 : 28, height: imSimplified ? 22 : 28, borderRadius: imSimplified ? 5 : 7, flexShrink: 0,
                                    background: bg, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700,
                                    letterSpacing: '-0.3px',
                                }}>
                                    {chanName.slice(0, 2).toUpperCase()}
                                </div>
                            );
                        })() : imThreadAvatar ? (
                            <img
                                src={imThreadAvatar}
                                alt={imThreadName}
                                width={imSimplified ? 22 : 28}
                                height={imSimplified ? 22 : 28}
                                style={{ width: imSimplified ? 22 : 28, height: imSimplified ? 22 : 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                            />
                        ) : (
                            <InitialsAvatar initials={initialsFromName(imThreadName ?? '')} size={imSimplified ? 22 : 28} withBorder={false} />
                        )}
                    </Box>

                    {/* Title + optional template name stacked */}
                    <Box
                        display="flex"
                        style={{ flexDirection: 'column', minWidth: 0, overflow: 'hidden', gap: '1px' }}
                        onMouseEnter={() => setHoverThreadTitle(true)}
                        onMouseLeave={() => setHoverThreadTitle(false)}
                    >
                        <Box display="flex" alignItems="center" style={{ gap: '6px', minWidth: 0 }}>
                            <Text
                                style={{
                                    fontSize: imSimplified ? '14px' : '18px',
                                    fontWeight: 600,
                                    lineHeight: imSimplified ? '20px' : '20px',
                                    color: 'var(--ax-colors-fg-default)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    minWidth: 0,
                                }}
                            >
                                {imThreadName}
                            </Text>
                            {imIsVAU && <IconSparkles size={14} style={{ color: '#7c5cff', flexShrink: 0 }} />}
                            {imSimplified && hoverThreadTitle && (
                                <IconArrowUpRightFromSquare size={18} style={{ color: 'var(--ax-colors-fg-tertiary)', flexShrink: 0 }} />
                            )}
                        </Box>
                        {imTemplateName && (
                            <Text
                                style={{
                                    fontSize: '11px',
                                    lineHeight: '14px',
                                    color: 'var(--ax-colors-fg-tertiary)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {imTemplateName}
                            </Text>
                        )}
                    </Box>
                </Box>

                {/* Tabs — hidden in simplified/artifact mode */}
                {!imSimplified && <Box display="flex" alignItems="stretch" style={{ flexShrink: 1, marginLeft: 'clamp(8px, 4%, 64px)' }}>
                    <Tabs value={imActiveTab} onValueChange={(v) => setImActiveTab(v as typeof imActiveTab)} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <TabsList style={{ border: 'none', height: '100%', alignSelf: 'stretch', flex: 1, alignItems: 'stretch' }}>
                            {imTabs.map(tab => (
                                <TabsTrigger key={tab} value={tab}>
                                    {tabLabels[tab]}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </Box>}

                {/* Spacer + right actions */}
                <Box display="flex" alignItems="center" gap="4" style={{ flex: '1 1 0', justifyContent: 'flex-end' }}>
                    {showWindowControls ? (
                        <>
                            <Button appearance="subtle" size="sm" aria-label="Maximize" onClick={onToggleMode}
                                style={{ padding: 0, minWidth: 'auto', width: '32px', height: '32px' }}>
                                <IconArrowsMaximize size={14} />
                            </Button>
                            <Button appearance="subtle" size="sm" aria-label="Close" onClick={onClose}
                                style={{ padding: 0, minWidth: 'auto', width: '32px', height: '32px' }}>
                                <IconXmark size={16} />
                            </Button>
                        </>
                    ) : rightActions}
                </Box>
            </Box>
        );
    }

    return (
        <>
        <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            style={{
                padding: '0 24px',
                width: '100%',
                gap: '12px',
                height: '64px',
                zIndex: 10,
                position: sticky ? 'sticky' : 'relative',
                top: sticky ? 0 : undefined,
            }}
        >
            <Box display="flex" alignItems="center" gap="12">
                {onCloseLeft && (
                    <Button
                        appearance="subtle"
                        size="md"
                        aria-label="Close chat panel"
                        onClick={onCloseLeft}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '6px',
                            padding: 0,
                            minWidth: 'auto',
                            marginLeft: '-8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <IconXmark size={20} />
                    </Button>
                )}
                <Button
                    appearance="subtle"
                    size="md"
                    aria-label="Toggle history"
                    onClick={onToggleHistory}
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
                    <IconBars size={20} />
                </Button>

                {onNewChat && !isHistoryVisible && (
                    <Button
                        appearance="subtle"
                        size="md"
                        aria-label={imMode ? "New thread" : "New chat"}
                        onClick={onNewChat}
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
                )}

                {false ? null : (
                <div ref={menuRef} style={{ position: 'relative' }}>
                    <Box
                        display="flex"
                        alignItems="center"
                        gap="8"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setMenuOpen(v => !v)}
                    >
                        <Text
                            style={{
                                ...opalTypography.title,
                                margin: 0,
                                color: 'var(--opal-text-primary)',
                            }}
                        >
                            {imMode ? "Threads" : "Opal"}
                        </Text>
                        {devMode && (
                            <span style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: 'var(--ax-colors-bg-accent, #7C3AED)', display: 'inline-block', marginLeft: '-4px',
                            }} />
                        )}
                        <IconChevronDown size={12} />
                    </Box>

                    {menuOpen && (
                        <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            background: 'var(--ax-colors-bg-default, white)',
                            border: '1px solid var(--ax-colors-border-secondary, #f3f4f6)',
                            borderRadius: '10px',
                            boxShadow: '0 4px 20px var(--ax-colors-bg-shadow, rgba(0,0,0,0.08))',
                            minWidth: '200px',
                            zIndex: 100,
                            overflow: 'hidden',
                            padding: '4px',
                        }}>
                            <MenuItem label="Opal" muted />
                            <MenuItem label="Settings" muted />
                            <div style={{ height: '1px', background: 'var(--ax-colors-border-secondary, #f3f4f6)', margin: '4px 0' }} />

                            {onToggleImMode && (
                                <div
                                    onClick={onToggleImMode}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--ax-colors-bg-default-hovered, #f9fafb)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <span style={{ fontSize: '13px', color: 'var(--ax-colors-fg-default, #374151)' }}>IM Mode</span>
                                    <div style={{
                                        width: '34px', height: '18px', borderRadius: '9px',
                                        background: imMode ? 'var(--ax-colors-bg-accent, #7C3AED)' : 'var(--ax-colors-bg-disabled, #d1d5db)',
                                        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                                    }}>
                                        <div style={{
                                            position: 'absolute', top: '3px',
                                            left: imMode ? '19px' : '3px',
                                            width: '12px', height: '12px', borderRadius: '50%',
                                            background: 'var(--ax-colors-bg-default, white)', transition: 'left 0.2s',
                                            boxShadow: '0 1px 2px var(--ax-colors-bg-shadow, rgba(0,0,0,0.15))',
                                        }} />
                                    </div>
                                </div>
                            )}

                            <div
                                onClick={() => update({ enabled: !devMode })}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--ax-colors-bg-default-hovered, #f9fafb)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <span style={{ fontSize: '13px', color: 'var(--ax-colors-fg-default, #374151)' }}>Loader Dev Mode</span>
                                <div style={{
                                    width: '34px', height: '18px', borderRadius: '9px',
                                    background: devMode ? 'var(--ax-colors-bg-accent, #7C3AED)' : 'var(--ax-colors-bg-disabled, #d1d5db)',
                                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                                }}>
                                    <div style={{
                                        position: 'absolute', top: '3px',
                                        left: devMode ? '19px' : '3px',
                                        width: '12px', height: '12px', borderRadius: '50%',
                                        background: 'var(--ax-colors-bg-default, white)', transition: 'left 0.2s',
                                        boxShadow: '0 1px 2px var(--ax-colors-bg-shadow, rgba(0,0,0,0.15))',
                                    }} />
                                </div>
                            </div>

                            {devMode && (
                                <div style={{ padding: '6px 8px 4px' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--ax-colors-fg-tertiary, #9ca3af)', marginBottom: '4px' }}>
                                        Loader stream style
                                    </div>
                                    <select
                                        value={sequence}
                                        onChange={(e) => update({ sequence: e.target.value as LoaderSequenceOption })}
                                        style={{
                                            width: '100%',
                                            border: '1px solid var(--ax-colors-border-default, #e5e7eb)',
                                            borderRadius: '8px',
                                            padding: '6px 8px',
                                            fontSize: '12px',
                                            color: 'var(--ax-colors-fg-default, #374151)',
                                            background: 'var(--ax-colors-bg-default, white)',
                                        }}
                                    >
                                        <option value="V1_TO_V2">v1 to v2</option>
                                        <option value="V2_TO_V3">v2 to v3</option>
                                        <option value="V4">v4</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                )}
            </Box>
            {showWindowControls ? (
                <Box display="flex" alignItems="center" gap="8">
                    <Button
                        appearance="subtle"
                        size="md"
                        aria-label="Maximize"
                        onClick={onToggleMode}
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
                        <IconArrowsMaximize size={14} />
                    </Button>
                    <Button
                        appearance="subtle"
                        size="md"
                        aria-label="Close"
                        onClick={onClose}
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
                        <IconXmark size={20} />
                    </Button>
                </Box>
            ) : (
                <Box display="flex" alignItems="center" gap="8">
                    {rightActions}
                </Box>
            )}
        </Box>
        </>
    );
}

function MenuItem({ label, muted }: { label: string; muted?: boolean }) {
    return (
        <div style={{
            padding: '7px 10px',
            borderRadius: '6px',
            fontSize: '13px',
            color: muted ? 'var(--ax-colors-fg-tertiary, #9ca3af)' : 'var(--ax-colors-fg-default, #374151)',
            cursor: muted ? 'default' : 'pointer',
        }}>
            {label}
        </div>
    );
}
