"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { HITLCard } from "@/app/components/Opal/HITLCard";

const CARD_PROPS = {
  taskType: "Content Checker",
  fileName: "Content Review for Blog Post",
  question: "Does this blog post meet our brand guidelines?",
  notes: "Blog post is for Q3. Please review ASAP in Opal.",
  viewHref: "/opal",
};

function DirectionLabel({ label }: { label: string }) {
  return (
    <Text
      mb="16"
      style={{
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "var(--ax-colors-fg-tertiary)",
        display: "block",
      }}
    >
      {label}
    </Text>
  );
}

export default function HITLPage() {
  return (
    <Box display="flex" flexDirection="column" gap="40">

      <Box>
        <DirectionLabel label="Direction 1 — View icon in header" />
        <Box display="flex" flexDirection="column" gap="16">
          <HITLCard {...CARD_PROPS} viewVariant="icon-button" onViewTask={() => {}} />
          <HITLCard {...CARD_PROPS} viewVariant="icon-button" />
        </Box>
      </Box>

      <Box>
        <DirectionLabel label="Direction 4 — Content preview tile" />
        <Box display="flex" flexDirection="column" gap="16">
          <HITLCard {...CARD_PROPS} viewVariant="preview-tile" onViewTask={() => {}} />
          <HITLCard {...CARD_PROPS} viewVariant="preview-tile" />
        </Box>
      </Box>

    </Box>
  );
}
