'use client';

import { 
  Box,
  Heading,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent, } from "@optiaxiom/react";

import { useState } from "react";
import { Table } from "@optiaxiom/react/unstable";
import { Tr, Th, Td } from "@/app/components/Table";


export default function Home() {
  const columns = [
    {label: "Comment"},
    {label: "Deployment"},
    {label: "Status"},
    {label: "Date"},
    {label: "User"},
  ]
  const rows = [
    {children: [
      {
        label: "Changed button size again", 
        description: "main",
        type: "header"
      },
      {
        label: "Deployment 2", 
        description: "Production",
      },
      {
        type: "badge",
        badge: "danger"
      },
      {
        label: "Jan 11, 2024", 
        description: "15:50:45",
      },
      {
        label: "Jane", 
      },
    ]},
  ]
      
  const [value, setValue] = useState("first");
  
  return (<>
    
    <Heading level="4">Current Production Deployment</Heading>
    <Box mt="16" borderColor="border.tertiary" border="1" rounded="md" bg="bg.default" p="24">hej</Box>
    <Heading mt="24" level="4">Deployments</Heading>
    <Tabs onValueChange={setValue} value={value}>
      <TabsList>
        <TabsTrigger value="first">All</TabsTrigger>
        <TabsTrigger value="second">Production</TabsTrigger>
        <TabsTrigger value="third">Preview</TabsTrigger>
      </TabsList>
      <TabsContent py="16" value="first">
        <Table>
          <thead>
            <Tr>
              {columns.map(col => <Th key={"col-" + col.label}>{col.label}</Th>)}
            </Tr>
          </thead>
          <tbody>
            {rows.map((row) => <Tr key={"row-" + row.children[0].label}>
                {row.children.map((col, i) => 
                  <Td type={col.type} badge={col.badge} key={"cell-" + col.label} description={col.description}>
                    {col.label}
                  </Td>
            )}
            </Tr>)}
          </tbody>
        </Table>
      </TabsContent>

      <TabsContent py="16" value="second">
        This is second content
      </TabsContent>

      <TabsContent py="16" value="third">
        This is third content
      </TabsContent>
    </Tabs>
    
  </>
  );
}
