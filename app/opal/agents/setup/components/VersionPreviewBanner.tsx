"use client";

import {
    Alert,
    Button,
    Box,
} from "@optiaxiom/react";
import {
    IconArrowRotateLeft,
} from "@optimizely/axiom-icons";

interface VersionPreviewBannerProps {
    versionName: string;
    timestamp: string;
    onRestore: () => void;
}

export function VersionPreviewBanner({
    versionName,
    timestamp,
    onRestore,
}: VersionPreviewBannerProps) {
    return (
        <Alert intent="information">
            <Box display="flex" alignItems="center" justifyContent="space-between" w="full">
                <Box>
                    You are viewing <strong>{versionName}</strong> created on {timestamp}.
                </Box>
                <Button
                    appearance="default"
                    size="md"
                    icon={<IconArrowRotateLeft size={16} />}
                    onClick={onRestore}
                >
                    Restore
                </Button>
            </Box>
        </Alert>
    );
}

