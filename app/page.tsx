'use client';

import {
  Box,
  Tabs,
  TabsContent,
  TabsList,
  Sidenav,
  SidenavBody,
  SidenavHeader,
  SidenavItem,
  TabsTrigger,
  Button
} from "@optiaxiom/react";

import { IconPencil, IconTrash, IconBinaryTree, IconFlag2 } from "@tabler/icons-react";
import { useState } from "react";
import RootLayout from "./layout";
  
export default function Home() {
  const [value, setValue] = useState("first");
  return (
    <RootLayout>
      <Box w="full">
        <Sidenav>
          <SidenavBody>
            <SidenavItem aria-label="Projects" icon={<IconBinaryTree />}>
              Projects
            </SidenavItem>
            <SidenavItem active aria-label="Flags" icon={<IconFlag2 />}>
              Flags
            </SidenavItem>
          </SidenavBody>
        </Sidenav>
        <Button appearance="primary" size="lg">
          Button
        </Button>
        <Tabs onValueChange={setValue} value={value}>
          <TabsList>
            <TabsTrigger value="first">First</TabsTrigger>
            <TabsTrigger value="second">Second</TabsTrigger>
            <TabsTrigger value="third">Third</TabsTrigger>
          </TabsList>
  
          <TabsContent py="md" value="first">
            This is first content
          </TabsContent>
  
          <TabsContent py="md" value="second">
            This is second content
          </TabsContent>
  
          <TabsContent py="md" value="third">
            This is third content
          </TabsContent>
        </Tabs>
      </Box>
    </RootLayout>
  );
}
