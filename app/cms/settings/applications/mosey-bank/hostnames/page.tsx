'use client';

import { Text, Box, SearchInput , Button } from "@optiaxiom/react";
import {Table, Th, Tr, Td} from "../../../../../components/Table"

const rows = [
  {
    children: [
      {label: "host-en"},
      {label: "en"},
      {label: "https"},
      {label: "..."}
    ]
  }, 
  {
    children: [
      {label: "host-de"},
      {label: "de"},
      {label: "https"},
      {label: "..."}
    ]
  }, 
  {
    children: [
      {label: "host-na"},
      {label: "na"},
      {label: "https"},
      {label: "..."}
    ]
  }
]

export default function Home() {
  return (
    <>
      <Box display="flex" justifyContent="space-between" pb="16">
        <SearchInput  />
        <Button size="lg" appearance="primary" >Create Hostname...</Button>
      </Box>
      <Table>
        <thead>
          <Tr>
            <Th>
              Hostname
            </Th>
            <Th>
              Locale
            </Th>
            <Th>
              Protocol
            </Th>
            <Th />
          </Tr>
        </thead>
        <tbody>
          {rows.map(row => <Tr key={row.children[0].label}>
          {row.children.map((col, i) => <Td key={col.label}><Text leading="loose" color="fg.default" fontWeight={i === 0 ? "500" : "400"}>{col.label}</Text></Td>)}
          </Tr>)}
        </tbody>
      </Table>
    </>
  );
}
