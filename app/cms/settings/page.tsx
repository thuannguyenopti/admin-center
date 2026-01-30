"use client";

import { Box, Heading } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconSettings } from "@tabler/icons-react";

export default function SettingsPage() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap="16"
      style={{
        minHeight: "60vh",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="bg.accent.subtle"
        color="fg.secondary"
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
        }}
      >
        <IconSettings size={40} stroke={1.5} />
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap="16"
        textAlign="center"
        style={{ maxWidth: "552px" }}
      >
        <Heading
          level="3"
          fontSize="2xl"
          fontWeight="500"
          style={{
            letterSpacing: "-0.60px",
          }}
        >
          Select a Setting
        </Heading>

        <Text
          fontSize="md"
          color="fg.secondary"
          style={{
            letterSpacing: "-0.20px",
            lineHeight: "24px",
          }}
        >
          Choose a setting from the navigation menu to configure your CMS. Use the sidebar to
          access content types, applications, access rights, and more.
        </Text>
      </Box>
    </Box>
  );
}
