"use client";

import { Box, Sidebar, Nav, NavBody, NavItem } from "@optiaxiom/react";
import { IconChevronDown } from "@tabler/icons-react";
import { Text } from "@/app/components/Text";
import { contentSubNavData, SubNavSection } from "../subNavData";
import { usePathname } from "next/navigation";

export default function ContentSubNav() {
  const pathname = usePathname();

  return (
    <Sidebar className="h-full" expanded={true}>
      <Nav>
        <NavBody>
          {contentSubNavData.map((section: SubNavSection, sectionIndex: number) => (
            <Box key={sectionIndex}>
              {section.title && (
                <Box px="12" py="8" display="flex" alignItems="center" gap="10">
                  <Text fontSize="xs" color="fg.tertiary" style={{ letterSpacing: "0.01px" }}>
                    {section.title}
                  </Text>
                  <IconChevronDown size={11} color="#66708c" />
                </Box>
              )}
              {section.items.map((item) => (
                <NavItem
                  key={item.label}
                  onClick={() => item.url && (window.location.href = item.url)}
                  active={pathname === item.url}
                  aria-label={item.label}
                  icon={item.icon}
                >
                  {item.label}
                </NavItem>
              ))}
            </Box>
          ))}
        </NavBody>
      </Nav>
    </Sidebar>
  );
}