<<<<<<< HEAD
"use client";

import { useRef, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    Text,
    Textarea,
} from "@optiaxiom/react";
import {
    IconCircleCheckSolid,
    IconFileZipper,
    IconUpload,
    IconXmark,
} from "@optiaxiom/icons";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImportAgentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport?: (agentData: Record<string, unknown>) => void;
}

// ─── Mock package contents ────────────────────────────────────────────────────

const MOCK_PACKAGE_CONTENTS = [
    { name: "agent.json", label: "Agent configuration", type: "badge" as const },
    { name: "Brand-Voice-Guidelines-2026.pdf", label: "2.4 MB", type: "size" as const },
    { name: "Approved-Terminology.csv", label: "148 KB", type: "size" as const },
    { name: "Logo-Usage-Rules.docx", label: "512 KB", type: "size" as const },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ImportAgentDialog({ open, onOpenChange, onImport }: ImportAgentDialogProps) {
    const [jsonText, setJsonText] = useState("");
    const [droppedFile, setDroppedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const clearFile = () => {
        setDroppedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileSelect = (file: File) => {
        setDroppedFile(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleImport = () => {
        if (jsonText.trim()) {
            try {
                const parsed = JSON.parse(jsonText.trim());
                onImport?.(parsed as Record<string, unknown>);
            } catch {
                // For prototype, silently swallow parse errors
                onImport?.({});
            }
        } else if (droppedFile) {
            onImport?.({ filename: droppedFile.name });
        }
        onOpenChange(false);
    };

    const fileSizeMB = droppedFile
        ? droppedFile.size > 0
            ? (droppedFile.size / (1024 * 1024)).toFixed(1) + " MB"
            : "—"
        : "";

    const isImportEnabled = droppedFile !== null || jsonText.trim().length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="md">
                <DialogHeader>Upload Agent</DialogHeader>

                <DialogBody>
                    {/* Textarea */}
                    <Textarea
                        placeholder="Paste your agent JSON data here..."
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        style={{ minHeight: 120, width: "100%", resize: "vertical" }}
                    />

                    {/* "or" divider */}
                    <Box display="flex" alignItems="center" gap="12" my="16">
                        <Box style={{ flex: 1, height: 1, background: "var(--ax-colors-border-default)" }} />
                        <Text fontSize="sm" color="fg.secondary">or</Text>
                        <Box style={{ flex: 1, height: 1, background: "var(--ax-colors-border-default)" }} />
                    </Box>

                    {/* Drop zone / File card */}
                    {droppedFile === null ? (
                        /* Drop zone */
                        <Box
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            gap="8"
                            p="24"
                            rounded="md"
                            style={{
                                border: `2px dashed ${isDragging ? "var(--ax-colors-border-focus)" : "var(--ax-colors-border-default)"}`,
                                background: isDragging ? "var(--ax-colors-bg-secondary)" : "transparent",
                                transition: "border-color 0.15s, background 0.15s",
                                cursor: "default",
                            }}
                        >
                            <IconUpload size={24} color="var(--ax-colors-fg-secondary)" />
                            <Text fontWeight="500" color="fg.default">
                                Drag and drop a .json or .zip file here
                            </Text>
                            <Text
                                fontSize="sm"
                                style={{ color: "var(--ax-colors-fg-link-default)", cursor: "pointer" }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Browse files
                            </Text>
                            <Text fontSize="sm" color="fg.secondary">
                                Use a ZIP file to import an agent with its attached files.
                            </Text>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json,.zip"
                                style={{ display: "none" }}
                                onChange={handleFileInputChange}
                            />
                        </Box>
                    ) : (
                        /* File card */
                        <Box
                            rounded="md"
                            p="12"
                            style={{
                                border: "1px solid var(--ax-colors-border-default)",
                            }}
                        >
                            {/* File row */}
                            <Box display="flex" alignItems="center" gap="12">
                                <IconFileZipper size={20} color="var(--ax-colors-fg-secondary)" />
                                <Box style={{ flex: 1, minWidth: 0 }}>
                                    <Text fontWeight="500" color="fg.default" style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {droppedFile.name}
                                    </Text>
                                    <Text fontSize="sm" color="fg.secondary">
                                        ZIP archive{fileSizeMB ? ` · ${fileSizeMB}` : ""}
                                    </Text>
                                </Box>
                                <Button
                                    appearance="subtle"
                                    size="sm"
                                    icon={<IconXmark />}
                                    onClick={clearFile}
                                    aria-label="Remove file"
                                />
                            </Box>

                            {/* Package contents */}
                            <Box mt="16">
                                <Text
                                    fontSize="xs"
                                    fontWeight="500"
                                    color="fg.tertiary"
                                    style={{ letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 8 }}
                                >
                                    Package Contents
                                </Text>

                                {MOCK_PACKAGE_CONTENTS.map((item, index) => (
                                    <Box
                                        key={item.name}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        py="8"
                                        style={{
                                            borderBottom: index < MOCK_PACKAGE_CONTENTS.length - 1
                                                ? "1px solid var(--ax-colors-border-default)"
                                                : "none",
                                        }}
                                    >
                                        <Text fontSize="sm" color="fg.default">{item.name}</Text>
                                        {item.type === "badge" ? (
                                            <Badge intent="information">{item.label}</Badge>
                                        ) : (
                                            <Text fontSize="sm" color="fg.secondary">{item.label}</Text>
                                        )}
                                    </Box>
                                ))}
                            </Box>

                            {/* Success banner */}
                            <Box
                                display="flex"
                                alignItems="center"
                                gap="8"
                                p="12"
                                rounded="md"
                                mt="12"
                                style={{
                                    background: "var(--ax-colors-bg-success-subtle)",
                                    border: "1px solid var(--ax-colors-border-success-subtle)",
                                }}
                            >
                                <IconCircleCheckSolid size={16} color="var(--ax-colors-fg-success-default)" style={{ flexShrink: 0 }} />
                                <Text fontSize="sm" style={{ color: "var(--ax-colors-fg-success-default)" }}>
                                    Agent configuration and 3 files will be imported together.
                                </Text>
                            </Box>
                        </Box>
                    )}
                </DialogBody>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button appearance="subtle">Cancel</Button>
                    </DialogClose>
                    <Button
                        appearance="primary"
                        disabled={!isImportEnabled}
                        onClick={handleImport}
                    >
                        Next
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
=======
"use client";

import { useRef, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    Text,
    Textarea,
} from "@optiaxiom/react";
import {
    IconCircleCheckSolid,
    IconFileZipper,
    IconUpload,
    IconXmark,
} from "@optiaxiom/icons";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImportAgentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport?: (agentData: Record<string, unknown>) => void;
}

// ─── Mock package contents ────────────────────────────────────────────────────

const MOCK_PACKAGE_CONTENTS = [
    { name: "agent.json", label: "Agent configuration", type: "badge" as const },
    { name: "Brand-Voice-Guidelines-2026.pdf", label: "2.4 MB", type: "size" as const },
    { name: "Approved-Terminology.csv", label: "148 KB", type: "size" as const },
    { name: "Logo-Usage-Rules.docx", label: "512 KB", type: "size" as const },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ImportAgentDialog({ open, onOpenChange, onImport }: ImportAgentDialogProps) {
    const [jsonText, setJsonText] = useState("");
    const [droppedFile, setDroppedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const clearFile = () => {
        setDroppedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileSelect = (file: File) => {
        setDroppedFile(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleImport = () => {
        if (jsonText.trim()) {
            try {
                const parsed = JSON.parse(jsonText.trim());
                onImport?.(parsed as Record<string, unknown>);
            } catch {
                // For prototype, silently swallow parse errors
                onImport?.({});
            }
        } else if (droppedFile) {
            onImport?.({ filename: droppedFile.name });
        }
        onOpenChange(false);
    };

    const fileSizeMB = droppedFile
        ? droppedFile.size > 0
            ? (droppedFile.size / (1024 * 1024)).toFixed(1) + " MB"
            : "—"
        : "";

    const isImportEnabled = droppedFile !== null || jsonText.trim().length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="md">
                <DialogHeader>Upload Agent</DialogHeader>

                <DialogBody>
                    {/* Textarea */}
                    <Textarea
                        placeholder="Paste your agent JSON data here..."
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        style={{ minHeight: 120, width: "100%", resize: "vertical" }}
                    />

                    {/* "or" divider */}
                    <Box display="flex" alignItems="center" gap="12" my="16">
                        <Box style={{ flex: 1, height: 1, background: "var(--ax-colors-border-default)" }} />
                        <Text fontSize="sm" color="fg.secondary">or</Text>
                        <Box style={{ flex: 1, height: 1, background: "var(--ax-colors-border-default)" }} />
                    </Box>

                    {/* Drop zone / File card */}
                    {droppedFile === null ? (
                        /* Drop zone */
                        <Box
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            gap="8"
                            p="24"
                            rounded="md"
                            style={{
                                border: `2px dashed ${isDragging ? "var(--ax-colors-border-focus)" : "var(--ax-colors-border-default)"}`,
                                background: isDragging ? "var(--ax-colors-bg-secondary)" : "transparent",
                                transition: "border-color 0.15s, background 0.15s",
                                cursor: "default",
                            }}
                        >
                            <IconUpload size={24} color="var(--ax-colors-fg-secondary)" />
                            <Text fontWeight="500" color="fg.default">
                                Drag and drop a .json or .zip file here
                            </Text>
                            <Text
                                fontSize="sm"
                                style={{ color: "var(--ax-colors-fg-link-default)", cursor: "pointer" }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Browse files
                            </Text>
                            <Text fontSize="sm" color="fg.secondary">
                                Use a ZIP file to import an agent with its attached files.
                            </Text>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json,.zip"
                                style={{ display: "none" }}
                                onChange={handleFileInputChange}
                            />
                        </Box>
                    ) : (
                        /* File card */
                        <Box
                            rounded="md"
                            p="12"
                            style={{
                                border: "1px solid var(--ax-colors-border-default)",
                            }}
                        >
                            {/* File row */}
                            <Box display="flex" alignItems="center" gap="12">
                                <IconFileZipper size={20} color="var(--ax-colors-fg-secondary)" />
                                <Box style={{ flex: 1, minWidth: 0 }}>
                                    <Text fontWeight="500" color="fg.default" style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {droppedFile.name}
                                    </Text>
                                    <Text fontSize="sm" color="fg.secondary">
                                        ZIP archive{fileSizeMB ? ` · ${fileSizeMB}` : ""}
                                    </Text>
                                </Box>
                                <Button
                                    appearance="subtle"
                                    size="sm"
                                    icon={<IconXmark />}
                                    onClick={clearFile}
                                    aria-label="Remove file"
                                />
                            </Box>

                            {/* Package contents */}
                            <Box mt="16">
                                <Text
                                    fontSize="xs"
                                    fontWeight="500"
                                    color="fg.tertiary"
                                    style={{ letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 8 }}
                                >
                                    Package Contents
                                </Text>

                                {MOCK_PACKAGE_CONTENTS.map((item, index) => (
                                    <Box
                                        key={item.name}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        py="8"
                                        style={{
                                            borderBottom: index < MOCK_PACKAGE_CONTENTS.length - 1
                                                ? "1px solid var(--ax-colors-border-default)"
                                                : "none",
                                        }}
                                    >
                                        <Text fontSize="sm" color="fg.default">{item.name}</Text>
                                        {item.type === "badge" ? (
                                            <Badge intent="information">{item.label}</Badge>
                                        ) : (
                                            <Text fontSize="sm" color="fg.secondary">{item.label}</Text>
                                        )}
                                    </Box>
                                ))}
                            </Box>

                            {/* Success banner */}
                            <Box
                                display="flex"
                                alignItems="center"
                                gap="8"
                                p="12"
                                rounded="md"
                                mt="12"
                                style={{
                                    background: "var(--ax-colors-bg-success-subtle)",
                                    border: "1px solid var(--ax-colors-border-success-subtle)",
                                }}
                            >
                                <IconCircleCheckSolid size={16} color="var(--ax-colors-fg-success-default)" style={{ flexShrink: 0 }} />
                                <Text fontSize="sm" style={{ color: "var(--ax-colors-fg-success-default)" }}>
                                    Agent configuration and 3 files will be imported together.
                                </Text>
                            </Box>
                        </Box>
                    )}
                </DialogBody>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button appearance="subtle">Cancel</Button>
                    </DialogClose>
                    <Button
                        appearance="primary"
                        disabled={!isImportEnabled}
                        onClick={handleImport}
                    >
                        Next
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
>>>>>>> origin/main
