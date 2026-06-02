"use client";

import {
    Alert,
    Button,
    Box,
} from "@optiaxiom/react";
import { IconXmark } from "@optiaxiom/icons";

interface ComparisonBannerProps {
    versionName: string;
    onExitComparison: () => void;
}

export function ComparisonBanner({
    versionName,
    onExitComparison,
}: ComparisonBannerProps) {
    return (
        <Alert intent="information">
            <Box display="flex" alignItems="center" justifyContent="space-between" w="full">
                <Box>
                    You're comparing <strong>{versionName}</strong> (left) with <strong>Current Version</strong> (right)
                </Box>
                <Button
                    appearance="subtle"
                    size="md"
                    icon={<IconXmark size={16} />}
                    onClick={onExitComparison}
                >
                    Exit Comparison
                </Button>
            </Box>
        </Alert>
    );
}
