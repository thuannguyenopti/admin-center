"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { Box } from "@optiaxiom/react";
import { ChatWindow } from "../components/chat/ChatWindow";

interface GlobalChatContextType {
    isOpen: boolean;
    openChat: () => void;
    closeChat: () => void;
    toggleChat: () => void;
}

const GlobalChatContext = createContext<GlobalChatContextType | undefined>(undefined);

export function GlobalChatProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPoppedOut, setIsPoppedOut] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [width, setWidth] = useState(400);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const startResizing = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((mouseMoveEvent: MouseEvent) => {
        if (isResizing) {
            const newWidth = window.innerWidth - mouseMoveEvent.clientX;
            if (newWidth > 320 && newWidth < 1200) {
                setWidth(newWidth);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        if (!mounted) return;
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing, mounted]);

    const openChat = () => setIsOpen(true);
    const closeChat = () => setIsOpen(false);
    const toggleChat = () => setIsOpen(prev => !prev);

    const handlePopOut = () => {
        if (!isPoppedOut) {
            setWidth(800);
            setIsPoppedOut(true);
        } else {
            setWidth(400);
            setIsPoppedOut(false);
        }
    };

    return (
        <GlobalChatContext.Provider value={{ isOpen, openChat, closeChat, toggleChat }}>
            {children}
            {mounted && isOpen && (
                <Box
                    style={{
                        position: 'fixed',
                        top: '60px',
                        right: '0',
                        bottom: '0',
                        width: `${width}px`,
                        zIndex: 1000,
                        backgroundColor: 'white',
                        borderLeft: '1px solid #E5E7EB',
                        transition: isResizing ? 'none' : 'width 0.2s ease-in-out',
                        boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
                        display: 'flex'
                    }}
                >
                    {/* Resize Handle */}
                    <div
                        onMouseDown={startResizing}
                        style={{
                            width: '8px',
                            cursor: 'ew-resize',
                            position: 'absolute',
                            left: -4,
                            top: 0,
                            bottom: 0,
                            zIndex: 1001,
                            backgroundColor: 'transparent'
                        }}
                    />

                    <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
                        <ChatWindow
                            onClose={closeChat}
                            isPoppedOut={isPoppedOut}
                            onPopOut={handlePopOut}
                        />
                    </Box>
                </Box>
            )}
        </GlobalChatContext.Provider>
    );
}

export function useGlobalChat() {
    const context = useContext(GlobalChatContext);
    if (context === undefined) {
        throw new Error("useGlobalChat must be used within a GlobalChatProvider");
    }
    return context;
}
