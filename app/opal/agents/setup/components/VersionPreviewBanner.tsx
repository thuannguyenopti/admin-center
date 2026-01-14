"use client";

import {
    Alert,
    Button,
    Box,
    Switch,
} from "@optiaxiom/react";
import {
    IconArrowRotateLeft,
} from "@optimizely/axiom-icons";

interface VersionPreviewBannerProps {
    versionName: string;
    timestamp: string;
    onRestore: () => void;
    showDiffs: boolean;
    onToggleDiffs: (show: boolean) => void;
}

export function VersionPreviewBanner({
    versionName,
    timestamp,
    onRestore,
    showDiffs,
    onToggleDiffs,
}: VersionPreviewBannerProps) {
    return (
        <Alert intent="information">
            <Box display="flex" alignItems="center" justifyContent="space-between" w="full">
                <Box>
                    You are viewing <strong>{versionName}</strong> created on {timestamp}.
                </Box>
                <Box display="flex" alignItems="center" gap="16">
                    <Switch
                        checked={showDiffs}
                        onCheckedChange={onToggleDiffs}
                    >
                        Show diffs
                    </Switch>
                    <Box h="16" style={{ width: "1px", backgroundColor: "var(--ax-colors-border-secondary)" }} />
                    <Button
                        appearance="default"
                        size="md"
                        icon={<IconArrowRotateLeft size={16} />}
                        onClick={onRestore}
                    >
                        Restore
                    </Button>
                </Box>
            </Box>
        </Alert>
    );
}

