"use client";

import {
    Alert,
    Button,
    Box,
} from "@optiaxiom/react";
import { IconXmark } from "@optimizely/axiom-icons";

interface ComparisonBannerProps {
    versionName: string;
    onExitComparison: () => void;
    onRestore: () => void;
}

export function ComparisonBanner({
    versionName,
    onExitComparison,
    onRestore,
}: ComparisonBannerProps) {
    return (
        <Alert intent="information">
            <Box display="flex" alignItems="center" justifyContent="space-between" w="full">
                <Box>
                    You're comparing <strong>{versionName}</strong> (left) with <strong>Current Version</strong> (right)
                </Box>
                <Box display="flex" alignItems="center" gap="16">
                    <Button
                        appearance="default"
                        size="md"
                        onClick={onRestore}
                    >
                        Restore {versionName}
                    </Button>
                    <Box h="16" style={{ width: "1px", backgroundColor: "var(--ax-colors-border-secondary)" }} />
                    <Button
                        appearance="subtle"
                        size="md"
                        icon={<IconXmark size={16} />}
                        onClick={onExitComparison}
                    >
                        Exit Comparison
                    </Button>
                </Box>
            </Box>
        </Alert>
    );
}
