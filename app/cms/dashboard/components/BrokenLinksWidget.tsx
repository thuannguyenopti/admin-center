"use client";

import { Box, Badge, Link } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import {IconEllipsisSolid} from "@/app/lib/axiom-icons";
import { BrokenLink } from "../types";
import PageIcon from "@/app/assets/page-icon.svg";
import BlockIcon from "@/app/assets/block-icon.svg";

interface BrokenLinksWidgetProps {
  items: BrokenLink[];
  lastUpdated?: string;
}

export function BrokenLinksWidget({ items, lastUpdated = "Jan 13, 2024" }: BrokenLinksWidgetProps) {
  return (
    <Box
      bg="bg.default"
      border="1"
      borderColor="border.tertiary"
      p="24"
      style={{ width: "280px", borderRadius: "12px" }}
      display="flex"
      flexDirection="column"
      gap="12"
    >
      {/* Header */}
      <Box>
        <Box display="flex" gap="8" alignItems="center" mb="4">
          <Text fontSize="xl" fontWeight="700" color="fg.default">
            Broken Links
          </Text>
          <Badge intent="warning">{items.length}</Badge>
        </Box>
        <Text fontSize="sm" color="fg.tertiary">
          Last updated: {lastUpdated}
        </Text>
      </Box>

      {/* Table */}
      <Table>
        <thead>
          <Tr>
            <Th>Name</Th>
            <Th />
          </Tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <Tr key={item.id}>
              <Td type="header">
                <Box display="flex" gap="8" alignItems="center">
                  {item.type === "page" ? (
                    <PageIcon width={12} height={16} />
                  ) : (
                    <BlockIcon width={14} height={14} />
                  )}
                  <Text fontSize="md" color="fg.default">
                    {item.name}
                  </Text>
                </Box>
              </Td>
              <Td type="button">
                <Button
                  aria-label="Actions"
                  size="md"
                  icon={<IconEllipsisSolid />}
                  appearance="subtle"
                />
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      {/* View Full Report Link */}
      <Link href="/cms/broken-links" fontSize="md" color="fg.default">
        View Full Report
      </Link>
    </Box>
  );
}