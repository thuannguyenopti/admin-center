'use client';

import { Text, Box, SearchInput , Button, Badge, Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow, } from "@optiaxiom/react";

export default function Home() {
  return (
    <>
      <Box display="flex" justifyContent="space-between" pb="16">
        <SearchInput  />
        <Button size="lg" appearance="primary" >Create Application...</Button>
      </Box>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell />
          </TableRow>
        </TableHeader>
    
        <TableBody>
          <TableRow>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
}
