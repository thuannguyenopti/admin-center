import {
  Box,
  Sidenav,
  SidenavBody,
  SidenavItem,
  Text,
  Heading,
} from "@optiaxiom/react";

import { IconChartBar, IconDashboard, IconPencil, IconSettings } from "@tabler/icons-react";

import { useRouter, usePathname } from 'next/navigation'
  
export default function Template({children, heading, description}: Readonly<{
  children: React.ReactNode;
  heading: string,
  description: string
}>) {
  const router = useRouter()
  const path = usePathname()

  const menuClick = (url: string) => {
    router.push(`${url}`)
  }
 
  const menuItems = [
    {
      label: "Dashboard",
      url: "/cms",
      icon: <IconDashboard />
    },
    {
      label: "Edit",
      url: "/cms/edit",
      icon: <IconPencil />
    },
    {
      label: "Reporting",
      url: "/cms/reporting",
      icon: <IconChartBar />
    },
    {
      label: "Settings",
      url: "/cms/settings",
      icon: <IconSettings />
    },
  ]

  return (
      <div className="grid grid-cols-[0fr_1fr] grid-rows-[0fr_1fr] h-[100vh]">
        <Box gridColumn="2" bg="bg.accent.subtle" p="16">header</Box>
        <Sidenav className="h-full">
          <SidenavBody>
            {
              menuItems.map(menuItem => <SidenavItem onClick={() => menuClick(menuItem.url)} active={menuItem.url === path} key={menuItem.label} aria-label={menuItem.label} icon={menuItem.icon}>{menuItem.label}</SidenavItem>)
            }
          </SidenavBody>
        </Sidenav>
        <Box p="xl">
          <Heading color="fg.default">{heading}</Heading>
          {description && <Text color="fg.secondary" mt="xs">{description}</Text>}
          <Box mt="md">
            {children}
          </Box>
        </Box>
      </div>
  );
}
