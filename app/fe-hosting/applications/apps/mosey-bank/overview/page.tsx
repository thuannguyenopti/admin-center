'use client';

import { 
  Box,
  Heading,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
  TabsContent,
  Badge,
  Table,
  Link, } from "@optiaxiom/react";

import { useState } from "react";
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
        label: "Fail",
        type: "badge",
        data: "danger"
      },
      {
        label: "Jan 11, 2024", 
        description: "15:50:45",
      },
      {
        label: "Jane",
        type: "avatar",
        data: "https://i.pravatar.cc/150?img=5"
      },
    ]},
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
        label: "Fail",
        type: "badge",
        badge: "danger"
      },
      {
        label: "Jan 11, 2024", 
        description: "15:50:45",
      },
      {
        label: "Jane",
        type: "avatar",
        data: "https://i.pravatar.cc/300?u=jane@doe.example"
      },
    ]},
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
        label: "Fail",
        type: "badge",
        data: "danger"
      },
      {
        label: "Jan 11, 2024", 
        description: "15:50:45",
      },
      {
        label: "Jane",
        type: "avatar",
        data: "https://i.pravatar.cc/300?u=jane@doe.example"
      },
    ]},
  ]
      
  const [value, setValue] = useState("first");
  
  return (<>
    
    <Heading level="4">Current Production Deployment</Heading>
    <Box mt="16" borderColor="border.tertiary" border="1" rounded="md" bg="bg.default" p="16" style={{maxWidth: "1280px"}}>
      <Box>
        <Text color="fg.tertiary" fontSize="sm">Deployment</Text>
        <Text color="fg.default" fontSize="md">mosey-390dr12sm-john-doe-projects-533e8c04.dploy.app</Text>
      </Box>
      <Box mt="16" display="flex" justifyContent="space-between">
        <Box>
          <Text color="fg.tertiary" fontSize="sm">Domains</Text>
          <Link fontSize="md" external>mosey.com</Link>
        </Box>
        <Box>
          <Text color="fg.tertiary" fontSize="sm">Status</Text>
          <Badge intent="information">Published</Badge>
        </Box>
        <Box>
          <Text color="fg.tertiary" fontSize="sm">Source Branch</Text>
          <Text color="fg.default">main/d1517b8 video</Text>
        </Box>
        <Box>
          <Text color="fg.tertiary" fontSize="sm">Commit</Text>
          <Text color="fg.default">“added video section”<br />d1517b8</Text>
        </Box>
      </Box>
    </Box>
    <Heading mt="24" mb="16" level="4">Deployments</Heading>
    <Box style={{maxWidth: "1280px"}}>
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
              {rows.map((row, i) => <Tr url="overview/deploy-5" key={"row-" + i + row.children[0].label}>
                  {row.children.map((col, i) => 
                    <Td type={col.type} data={col.data} key={"cell-" + i + col.label} description={col.description}>
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
    </Box>
    
  </>
  );
}
