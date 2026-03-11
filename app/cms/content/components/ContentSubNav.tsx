"use client";

import {
  Box,
  Nav,
  NavBody,
  NavFooter,
  NavItem,
  NavList,
  Sidebar,
} from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { IconChevronDown, IconChevronLeft, IconChevronRight, IconPin, IconPinned } from "@tabler/icons-react";
import { Text } from "@/app/components/Text";
import { contentSubNavData, SubNavSection } from "../subNavData";
import { usePathname, useRouter } from "next/navigation";
import { useContentManagerLayout } from "../context/ContentManagerLayoutContext";

const iconColor = "var(--ax-colors-fg-secondary)";

export default function ContentSubNav() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    contentSubNavExpanded: isExpanded,
    setContentSubNavExpanded,
    contentSubNavPinned,
    setContentSubNavPinned,
  } = useContentManagerLayout();

  const handleNavClick = (url: string) => {
    router.push(url);
  };

  return (
    <Sidebar className="h-full" expanded={isExpanded}>
      <Nav>
        <NavBody>
          {contentSubNavData.map((section: SubNavSection, sectionIndex: number) => (
            <Box key={sectionIndex}>
              {section.title && isExpanded && (
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
                  onClick={() => item.url && handleNavClick(item.url)}
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
        <NavFooter>
          <NavList>
            <Box
              display="flex"
              alignItems="center"
              justifyContent={isExpanded ? "space-between" : "flex-start"}
              w="full"
            >
              <Button
                aria-label={!isExpanded ? "Expand sidebar" : "Collapse sidebar"}
                icon={
                  !isExpanded ? (
                    <IconChevronRight size={16} color={iconColor} />
                  ) : (
                    <IconChevronLeft size={16} color={iconColor} />
                  )
                }
                onClick={() => setContentSubNavExpanded((prev) => !prev)}
                appearance="subtle"
              />
              {isExpanded && (
                <Button
                  aria-label={contentSubNavPinned ? "Unpin sub-navigation" : "Pin sub-navigation"}
                  icon={
                    contentSubNavPinned ? (
                      <IconPinned size={16} color={iconColor} />
                    ) : (
                      <IconPin size={16} color={iconColor} />
                    )
                  }
                  onClick={() => setContentSubNavPinned((prev) => !prev)}
                  appearance="subtle"
                />
              )}
            </Box>
          </NavList>
        </NavFooter>
      </Nav>
    </Sidebar>
  );
}