'use client';

import { Text, Box, SearchInput , Button, Link } from "@optiaxiom/react";
import {Table, Th, Tr, Td} from "../../../components/Table"

const rows = [
    {
      url: "/cms/settings/applications/mosey-bank/settings", 
      children: [
        {label: "Mosey Bank"},
        {label: "1234"},
        {label: "www"},
        {label: "..."}
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
            <Th>
              Name
            </Th>
            <Th>
              App ID
            </Th>
            <Th>
              URL
            </Th>
            <Th />
          </Tr>
        </thead>
        <tbody>
          {rows.map(row => <Tr url={row.url} key={row.children[0].label}>
          {row.children.map((col, i) => <Td key={col.label}><Text color="fg.default" fontWeight={i === 0 ? "500" : "400"}>{col.label}</Text></Td>)}
          </Tr>)}
        </tbody>
      </Table>
    </>
  );
}
