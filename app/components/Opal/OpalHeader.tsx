"use client";

import { Box, Button } from "@optiaxiom/react";
import { Text } from "../Text";
import { IconXmark, IconBars, IconCirclePlus } from "@/app/lib/axiom-icons";
import IconDropdown from "@/app/assets/opal/icon-dropdown.svg";
import IconMaximize from "@/app/assets/opal/icon-maximize.svg";
import { opalTypography } from "@/app/styles/opalTypography";
import { useEffect, useRef, useState } from "react";
import { useLoaderDev } from "@/app/opal/components/useLoaderDev";
import type { LoaderSequenceOption } from "@/app/opal/components/useLoaderDev";

type OpalHeaderProps = {
    onClose?: () => void;
    onNewChat?: () => void;
    mode?: 'docked' | 'popped-out';
    isHistoryVisible?: boolean;
    onToggleHistory: () => void;
    onToggleMode?: () => void;
    sticky?: boolean;
};

export function OpalHeader({
    onClose,
    onNewChat,
    onToggleHistory,
    onToggleMode,
    sticky = false,
}: OpalHeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
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

    return (
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

                {onNewChat && (
                    <Button
                        appearance="subtle"
                        size="md"
                        aria-label="New chat"
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
                            Opal
                        </Text>
                        {devMode && (
                            <span style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: '#7C3AED', display: 'inline-block', marginLeft: '-4px',
                            }} />
                        )}
                        <IconDropdown style={{ width: '10px', height: '5px' }} />
                    </Box>

                    {menuOpen && (
                        <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            background: 'white',
                            border: '1px solid #f3f4f6',
                            borderRadius: '10px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            minWidth: '200px',
                            zIndex: 100,
                            overflow: 'hidden',
                            padding: '4px',
                        }}>
                            <MenuItem label="Opal" muted />
                            <MenuItem label="Settings" muted />
                            <div style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }} />

                            <div
                                onClick={() => update({ enabled: !devMode })}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <span style={{ fontSize: '13px', color: '#374151' }}>Loader Dev Mode</span>
                                <div style={{
                                    width: '34px', height: '18px', borderRadius: '9px',
                                    background: devMode ? '#7C3AED' : '#d1d5db',
                                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                                }}>
                                    <div style={{
                                        position: 'absolute', top: '3px',
                                        left: devMode ? '19px' : '3px',
                                        width: '12px', height: '12px', borderRadius: '50%',
                                        background: 'white', transition: 'left 0.2s',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                                    }} />
                                </div>
                            </div>

                            {devMode && (
                                <div style={{ padding: '6px 8px 4px' }}>
                                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                                        Loader stream style
                                    </div>
                                    <select
                                        value={sequence}
                                        onChange={(e) => update({ sequence: e.target.value as LoaderSequenceOption })}
                                        style={{
                                            width: '100%',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            padding: '6px 8px',
                                            fontSize: '12px',
                                            color: '#374151',
                                            background: 'white',
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
                        <IconMaximize style={{ width: '14px', height: '14px' }} />
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
                <Box />
            )}
        </Box>
    );
}

function MenuItem({ label, muted }: { label: string; muted?: boolean }) {
    return (
        <div style={{
            padding: '7px 10px',
            borderRadius: '6px',
            fontSize: '13px',
            color: muted ? '#9ca3af' : '#374151',
            cursor: muted ? 'default' : 'pointer',
        }}>
            {label}
        </div>
    );
}
