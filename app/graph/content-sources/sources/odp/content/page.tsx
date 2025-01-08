'use client';

import { Text, Box, SearchInput , Button, Badge } from "@optiaxiom/react";
import {Table, Th, Tr, Td} from "../../../../../components/Table"

const columns = [
  {label: "Name"},
  {label: "ID"},
  {label: "Updated"},
  {label: "Content Items", type: "numeric"},
]
const rows = [
  {
    url: "/graph/content-sources/opd/details", 
    children: [
      {label: "Article", type: "header"},
      {label: "1234"},
      {label: "Jan 11, 2024", description: "15:50:45"},
      {label: "5678", type: "numeric"},
    ]
  },
  {
    url: "/graph/content-sources/opd/details", 
    children: [
      {label: "Article", type: "header"},
      {label: "1234"},
      {label: "Jan 11, 2024", description: "15:50:45"},
      {label: "5678", type: "numeric"},
    ]
  },
  {
    url: "/graph/content-sources/opd/details", 
    children: [
      {label: "Article", type: "header"},
      {label: "1234"},
      {label: "Jan 11, 2024", description: "15:50:45"},
      {label: "5678", type: "numeric"},
    ]
  },
  {
    url: "/graph/content-sources/opd/details", 
    children: [
      {label: "Article", type: "header"},
      {label: "1234"},
      {label: "Jan 11, 2024", description: "15:50:45"},
      {label: "5678", type: "numeric"},
    ]
  },
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
            {columns.map(col => <Th key={col.label} align={col.type === "numeric" ? "right" : "left"}>{col.label}</Th>)}
          </Tr>
        </thead>
        <tbody>
        {rows.map((row, i) => <Tr url={row.url} key={row.children[0].label + i}>
              {row.children.map((col) => 
                <Td type={col.type} key={col.label} description={col.description}>
                  {col.label}
                </Td>
          )}
          </Tr>)}
        </tbody>
      </Table>
    </>
  );
}
