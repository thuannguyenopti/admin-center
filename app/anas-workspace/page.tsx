"use client";

import { Flex } from "@/app/components/Flex";
import { Text } from "@/app/components/Text";
import { Heading } from "@optiaxiom/react";

export default function AnasWorkspace() {
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      style={{ height: "100vh" }}
      gap="8"
    >
      <Heading level="2">Ana's Workspace</Heading>
      <Text color="fg.secondary">Add your experiments here.</Text>
    </Flex>
  );
}
