'use client';

import { Text, Box, SearchInput , Button } from "@optiaxiom/react";
import {Table, Th, Tr, Td} from "../../../../../components/Table"

const rows = [
  {
    children: [
      {label: "host-en"},
      {label: "en"},
      {label: "https"},
      {label: "...", type: "button"}
    ]
  }, 
  {
    children: [
      {label: "host-de"},
      {label: "de"},
      {label: "https"},
      {label: "...", type: "button"}
    ]
  }, 
  {
    children: [
      {label: "host-na"},
      {label: "na"},
      {label: "https"},
      {label: "...", type: "button"}
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
        <tbody>
          {rows.map(row => <Tr key={row.children[0].label}>
          {row.children.map((col, i) => <Td type={col.type} key={col.label}>{col.label}</Td>)}
          </Tr>)}
        </tbody>
      </Table>
    </>
  );
}
