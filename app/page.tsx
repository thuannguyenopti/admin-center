'use client';

import { Box, Button } from "@optiaxiom/react";
import Link from "next/link";

export default function Home() {
  return (
      <Box 
        w="full" 
        h="full" 
        display="flex" 
        p="24" 
        gap="12" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center"
      >
        <Link href="/cms/dashboard"><Button size="lg">To CMS</Button></Link>
        <Link href="/graph/dashboard"><Button size="lg">To Graph</Button></Link>
        <Link href="/fe-hosting/applications/apps"><Button size="lg">To FE Hosting</Button></Link>
      </Box>
  );
}
