'use client';

import { Box, Link } from "@optiaxiom/react";

export default function Home() {
  return (
      <Box w="full" h="full" display="flex" p="xl">
        <Link href="/cms/dashboard">To CMS</Link>
      </Box>
  );
}
