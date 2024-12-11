'use client';

import { Text, Box, SearchInput , Button } from "@optiaxiom/react";
import {Table, Th, Tr, Td} from "../../components/Table"

const columns = [
  {label: "Source"},
  {label: "ID"},
  {label: "Status"},
  {label: "Last Result"},
  {label: "Last Synced"},
]
const rows = [
    {
      url: "/graph/content-sources/opd/settings", 
      children: [
        {label: "ODP", description: "Some note text"},
        {label: "1234"},
        {label: "Status"},
        {label: "Last Result"}
      ]
    }
]

export default function Home() {
  return (
    <>
      <Box display="flex" justifyContent="space-between" pb="16">
        <SearchInput  />
        <Button size="lg" appearance="primary" >Create Application...</Button>
      </Box>
      <Table>
        <thead>
          <Tr>
            {columns.map(col => <Th key={col.label}>{col.label}</Th>)}
          </Tr>
        </thead>
        <tbody>
          {rows.map(row => <Tr url={row.url} key={row.children[0].label}>
          {row.children.map((col, i) => <Td key={col.label}>
              <Text color="fg.default" fontWeight={i === 0 ? "500" : "400"}>{col.label}</Text>
              {col.description && <Text color="fg.tertiary" fontSize="sm">{col.description}</Text>}
            </Td>)}
          </Tr>)}
        </tbody>
      </Table>
    </>
  );
}
