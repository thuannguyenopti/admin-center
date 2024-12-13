'use client';

import { Text, Box, SearchInput , Button, Badge, Heading } from "@optiaxiom/react";
import {Table, Th, Tr, Td} from "../../../../../components/Table"

export default function Home() {
  return (
    <>
      <Box display="flex" gap="24" flexDirection="column">
        <Box display="flex" gap="8" flexDirection="column" alignItems="start">
          <Heading color="fg.default" level="4">Rebuild Data Source Index</Heading>
          <Text color="fg.secondary">This will remove all indexed data for this data source and cannot be undone.</Text>
          <Button size="lg" appearance="danger-outline">Clear Data Source Index</Button>
        </Box>
        <Box display="flex" gap="8" flexDirection="column"  alignItems="start">
          <Heading color="fg.default" level="4">Delete Data Source</Heading>
          <Text color="fg.secondary">This will permanently remove this data source and cannot be undone.</Text>
          <Button size="lg" appearance="danger">Delete Data Source</Button>
        </Box>
      </Box>
    </>
  );
}
