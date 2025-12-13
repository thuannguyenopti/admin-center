"use client";

import { Heading, SearchInput, Box } from "@optiaxiom/react";
import { IconSearch, IconChevronDown } from "@tabler/icons-react";
import { Button } from "@/app/components/Button";
import { Flex } from "@/app/components/Flex";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { mockAudiences, Audience } from "./mockData";
import { Text } from "@/app/components/Text";

export default function AudiencesPage() {
  return (
    <>
      <Flex mb="24" gap="24" alignItems="center" justifyContent="space-between">
        {/* Filter by name input */}
        <Box flex="1" style={{ maxWidth: "266px" }}>
          <SearchInput 
            size="lg"
            placeholder="Filter by name"
            icon={<IconSearch size={16} />}
            style={{ borderRadius: "6px" }}
          />
        </Box>

        {/* New Audience Button */}
        <Button 
          appearance="primary" 
          style={{ 
            backgroundColor: "#0037ff", 
            color: "#ffffff", 
            borderRadius: "6px",
            minWidth: "128px",
            padding: "0 16px",
            height: "40px"
          }}
        >
          New Audience
        </Button>
      </Flex>
      
      {/* Audience List/Table */}
      <Table>
        <thead>
          <Tr>
            <Th style={{ width: "95%" }}>
              <Flex gap="4" alignItems="center">
                <Text fontSize="md" color="fg.secondary" style={{ letterSpacing: "0.01px" }}>
                  Name
                </Text>
                <IconChevronDown size={8} color="#66708c" />
              </Flex>
            </Th>
            <Th style={{ width: "56px" }}></Th> {/* For the action button */}
          </Tr>
        </thead>
        <tbody>
          {mockAudiences.map((audience: Audience) => (
            <Tr key={audience.id}>
              <Td 
                type="header" 
                description={audience.description} 
                style={{ borderRight: "none" }}
              >
                {audience.name}
              </Td>
              {/* Action menu button */}
              <Td 
                type="button" 
                style={{ borderLeft: "none" }}
              />
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}