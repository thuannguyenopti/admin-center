'use client';

import { Box, Link, Button } from "@optiaxiom/react";

export default function Home() {
  return (
      <Box 
        w="full" 
        h="full" 
        display="flex" 
        p="xl" 
        gap="12" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center"
      >
        <Link href="/cms/dashboard"><Button size="lg">To CMS</Button></Link>
        <Link href="/graph/dashboard"><Button size="lg">To Graph</Button></Link>
      </Box>
  );
}
