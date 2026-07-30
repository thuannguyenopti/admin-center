"use client";

import { Box, Text } from "@optiaxiom/react";
import { ImportSkillContent } from "../components/ImportSkillModal";

function ModalCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap="12">
      <Text fontWeight="500" fontSize="sm" color="fg.secondary">{label}</Text>
      <Box
        style={{
          width: 520,
          background: "var(--ax-colors-bg-default)",
          borderRadius: 12,
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default function ImportSkillDemoPage() {
  return (
    <Box
      display="flex"
      gap="48"
      p="40"
      style={{
        minHeight: "100vh",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "var(--ax-colors-bg-secondary)",
      }}
    >
      <ModalCard label="A — Create as above tabs">
        <ImportSkillContent placement="above-tabs" />
      </ModalCard>

      <ModalCard label="B — Create as within tabs">
        <ImportSkillContent placement="within-tabs" />
      </ModalCard>
    </Box>
  );
}
