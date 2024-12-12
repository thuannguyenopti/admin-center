'use client';

import { Text, Box, SearchInput , Button, Badge, Link } from "@optiaxiom/react";
import {Table, Th, Tr, Td} from "../../../../../components/Table"

const columns = [
  {label: "Languages"},
]
const rows = [
  {
    children: [
      {label: "Arabic"}
    ]
  },
  {
    children: [
      {label: "English"}
    ]
  },
  {
    children: [
      {label: "Dutch"}
    ]
  },
  {
    children: [
      {label: "Greek"}
    ]
  }
]

export default function Home() {
  return (
    <>
      <Box display="flex" flexDirection="column" gap="8" justifyContent="space-between" pb="24">
        <Box>
          <Text color="fg.tertiary" fontSize="sm">ID</Text>
          <Text leading="loose" color="fg.default" fontSize="md">00aa1a8a-7de7-4d82-9f8a-09941d84a23d</Text>
        </Box>
        <Box>
          <Text color="fg.tertiary" fontSize="sm">Name</Text>
          <Text leading="loose" color="fg.default">CMS (Integration) <Link>Edit...</Link></Text>
        </Box>
        <Box>
          <Text color="fg.tertiary" fontSize="sm">Description</Text>
          <Text leading="loose" color="fg.default">Builds and resets the full eSales index, use this if you need to refresh available products. <Link>Edit...</Link></Text>
        </Box>
        <Box>
          <Text color="fg.tertiary" fontSize="sm">Last Sync</Text>
          <Text leading="loose" color="fg.default"><Badge intent="danger" mr="4">Failed</Badge>No connection with database.</Text>
        </Box>
      </Box>
      <Table>
        <thead>
          <Tr>
            {columns.map(col => <Th key={col.label}>{col.label}</Th>)}
          </Tr>
        </thead>
        <tbody>
          {rows.map(row => <Tr key={row.children[0].label}>
            {row.children.map((col, i) => <Td key={col.label}>
              <Text color="fg.default" leading="loose" fontWeight={i === 0 ? "500" : "400"}>{col.label}</Text>
            </Td>)}
          </Tr>)}
        </tbody>
      </Table>
    </>
  );
}
