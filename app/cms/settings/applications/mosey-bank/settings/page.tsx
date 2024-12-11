'use client';

import { Box, Input, Field } from "@optiaxiom/react";

export default function Home() {
  return (
    <Box gap="16" display="flex" flexDirection="column">
      <Field
        label="Application Name"
        required
      >
        <Input defaultValue="Mosey Bank" size="lg" />
      </Field>
      <Field
          label="APP ID"
          required
      >
        <Input defaultValue="moseybank" size="lg" />
      </Field>
      <Field
          label="Start Page"
          required
      >
        <Input placeholder="Enter text..." size="lg" />
      </Field>
    </Box>
  );
}
