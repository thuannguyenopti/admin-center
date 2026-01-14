"use client";

import {
    Box,
    Text,
    Button,
    Avatar,
    Badge,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@optiaxiom/react";
import {
    IconDots,
    IconX,
} from "@tabler/icons-react";
import {
    IconPen,
    IconEye,
    IconClockRotateLeft,
    IconCopy,
    IconEyeSlash,
    IconArrowsLeftRight,
} from "@optimizely/axiom-icons";

interface Version {
    id: string;
    version: string;
    mode: string;
    timestamp: string;
    author: string;
    authorInitials: string;
    isCurrent?: boolean;
}

interface VersionHistoryProps {
    isOpen: boolean;
    onClose: () => void;
    onViewVersion: (versionId: string) => void;
    onRestoreVersion: (versionId: string) => void;
    onDuplicateVersion: (versionId: string) => void;
    onHideVersion: (versionId: string) => void;
    onNameVersion: (versionId: string) => void;
    onCompareVersion: (versionId: string) => void;
    onExitVersionView?: () => void;
}

// Mock data for versions
const mockVersions: Version[] = [
    {
        id: "v6",
        version: "V6",
        mode: "Enforcer",
        timestamp: "Nov 17, 2025, 10:18 PM",
        author: "John Smith",
        authorInitials: "JS",
        isCurrent: true,
    },
    {
        id: "v5",
        version: "V5",
        mode: "Enforcer",
        timestamp: "Nov 17, 2025, 10:08 PM",
        author: "John Smith",
        authorInitials: "JS",
    },
    {
        id: "v4",
        version: "V4",
        mode: "Observer",
        timestamp: "Nov 17, 2025, 9:00 PM",
        author: "John Smith",
        authorInitials: "JS",
    },
    {
        id: "v3",
        version: "V3",
        mode: "Observer",
        timestamp: "Nov 17, 2025, 8:45 PM",
        author: "John Smith",
        authorInitials: "JS",
    },
    {
        id: "v2",
        version: "V2",
        mode: "Learner",
        timestamp: "Nov 17, 2025, 8:30 PM",
        author: "John Smith",
        authorInitials: "JS",
    },
    {
        id: "v1",
        version: "V1",
        mode: "Learner",
        timestamp: "Nov 17, 2025, 8:15 PM",
        author: "John Smith",
        authorInitials: "JS",
    },
];

export function VersionHistory({
    isOpen,
    onClose,
    onViewVersion,
    onRestoreVersion,
    onDuplicateVersion,
    onHideVersion,
    onNameVersion,
    onCompareVersion,
    onExitVersionView,
}: VersionHistoryProps) {
    const currentVersion = mockVersions.find(v => v.isCurrent);
    const previousVersions = mockVersions.filter(v => !v.isCurrent);

    return (
        <Box
            style={{
                width: isOpen ? "360px" : "0px",
                transition: "width 0.3s ease-in-out",
                overflow: "hidden",
                borderLeft: isOpen ? "1px solid var(--ax-colors-border-secondary)" : "none",
                backgroundColor: "var(--ax-colors-bg-default)",
                display: "flex",
                flexDirection: "column",
                flexShrink: 0,
            }}
        >
            {isOpen && (
                <>
                    {/* Header */}
                    <Box
                        px="16"
                        py="12"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        style={{
                            borderBottom: "1px solid var(--ax-colors-border-secondary)",
                        }}
                    >
                        <Text fontWeight="600" fontSize="md">
                            Version History
                        </Text>
                        <Button
                            appearance="subtle"
                            size="sm"
                            icon={<IconX size={16} />}
                            aria-label="Close"
                            onClick={onClose}
                        />
                    </Box>

                    {/* Content */}
                    <Box
                        flex="1"
                        overflowY="auto"
                        px="16"
                        py="16"
                        display="flex"
                        flexDirection="column"
                        gap="24"
                    >
                        {/* Current Version Section */}
                        {currentVersion && (
                            <Box display="flex" flexDirection="column" gap="8">
                                <Text fontSize="sm" fontWeight="600" color="fg.secondary">
                                    Current Version
                                </Text>
                                <VersionCard
                                    version={currentVersion}
                                    onViewVersion={onViewVersion}
                                    onRestoreVersion={onRestoreVersion}
                                    onDuplicateVersion={onDuplicateVersion}
                                    onHideVersion={onHideVersion}
                                    onNameVersion={onNameVersion}
                                    onCompareVersion={onCompareVersion}
                                    onExitVersionView={onExitVersionView}
                                    isCurrent
                                />
                            </Box>
                        )}

                        {/* Previous Versions Section */}
                        {previousVersions.length > 0 && (
                            <Box display="flex" flexDirection="column" gap="8">
                                <Text fontSize="sm" fontWeight="600" color="fg.secondary">
                                    Previous Versions
                                </Text>
                                <Box display="flex" flexDirection="column" gap="12">
                                    {previousVersions.map((version) => (
                                        <VersionCard
                                            key={version.id}
                                            version={version}
                                            onViewVersion={onViewVersion}
                                            onRestoreVersion={onRestoreVersion}
                                            onDuplicateVersion={onDuplicateVersion}
                                            onHideVersion={onHideVersion}
                                            onNameVersion={onNameVersion}
                                            onCompareVersion={onCompareVersion}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </>
            )}
        </Box>
    );
}

interface VersionCardProps {
    version: Version;
    onViewVersion: (versionId: string) => void;
    onRestoreVersion: (versionId: string) => void;
    onDuplicateVersion: (versionId: string) => void;
    onHideVersion: (versionId: string) => void;
    onNameVersion: (versionId: string) => void;
    onCompareVersion: (versionId: string) => void;
    onExitVersionView?: () => void;
    isCurrent?: boolean;
}

function VersionCard({
    version,
    onViewVersion,
    onRestoreVersion,
    onDuplicateVersion,
    onHideVersion,
    onNameVersion,
    onCompareVersion,
    onExitVersionView,
    isCurrent = false,
}: VersionCardProps) {
    return (
        <Box
            p="12"
            display="flex"
            gap="8"
            alignItems="center"
            rounded="sm"
            border={isCurrent ? "2" : "1"}
            borderColor={isCurrent ? "border.accent" : "border.secondary"}
            bg="bg.default"
            style={{
                cursor: "pointer",
            }}
            onClick={() => {
                if (isCurrent && onExitVersionView) {
                    onExitVersionView();
                } else if (!isCurrent) {
                    onViewVersion(version.id);
                }
            }}
        >
            {/* Avatar */}
            <Avatar name={version.author} size="sm" />

            {/* Content */}
            <Box flex="1" display="flex" flexDirection="column" gap="4">
                <Box display="flex" alignItems="center" gap="8">
                    <Text fontWeight="500" fontSize="sm">
                        {version.version}
                    </Text>
                    <Badge variant="subtle">{version.mode}</Badge>
                </Box>
                <Box display="flex" flexDirection="column">
                    <Text fontSize="xs" color="fg.secondary">
                        {version.timestamp}
                    </Text>
                    <Text fontSize="xs" color="fg.secondary">
                        By {version.author}
                    </Text>
                </Box>
            </Box>

            {/* Actions Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        appearance="subtle"
                        size="sm"
                        icon={<IconDots size={16} />}
                        aria-label="More options"
                        onClick={(e) => e.stopPropagation()}
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {!isCurrent && (
                        <DropdownMenuItem
                            onSelect={() => onViewVersion(version.id)}
                        >
                            <Box display="flex" alignItems="center" gap="8">
                                <IconEye size={16} />
                                <Text>View this version</Text>
                            </Box>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onSelect={() => onNameVersion(version.id)}>
                        <Box display="flex" alignItems="center" gap="8">
                            <IconPen size={16} />
                            <Text>Name this version</Text>
                        </Box>
                    </DropdownMenuItem>
                    {!isCurrent && (
                        <DropdownMenuItem
                            onSelect={() => onRestoreVersion(version.id)}
                        >
                            <Box display="flex" alignItems="center" gap="8">
                                <IconClockRotateLeft size={16} />
                                <Text>Restore this version</Text>
                            </Box>
                        </DropdownMenuItem>
                    )}
                    {!isCurrent && (
                        <DropdownMenuItem
                            onSelect={() => onCompareVersion(version.id)}
                        >
                            <Box display="flex" alignItems="center" gap="8">
                                <IconArrowsLeftRight size={16} />
                                <Text>Compare with current</Text>
                            </Box>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                        onSelect={() => onDuplicateVersion(version.id)}
                    >
                        <Box display="flex" alignItems="center" gap="8">
                            <IconCopy size={16} />
                            <Text>Duplicate as a new agent</Text>
                        </Box>
                    </DropdownMenuItem>
                    {!isCurrent && (
                        <DropdownMenuItem
                            onSelect={() => onHideVersion(version.id)}
                        >
                            <Box display="flex" alignItems="center" gap="8" style={{ color: "var(--ax-colors-fg-danger)" }}>
                                <IconEyeSlash size={16} />
                                <Text>Hide this version</Text>
                            </Box>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </Box>
    );
}
