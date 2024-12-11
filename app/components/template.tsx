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
import VT from "./VT";
  
export default function Template({children, description, vt}: Readonly<{
  children: React.ReactNode;
  description?: string, 
  vt?: Array<{label: string, url?: string}>
}>) {
  const router = useRouter()
  const path = usePathname()

  const menuClick = (url: string) => {
    router.push(`${url}`)
  }
 
  const menuItems = [
    {
      label: "Dashboard",
      highlight: "cms/dashboard",
      url: "/cms/dashboard",
      icon: <IconDashboard />
    },
    {
      label: "Edit",
      url: "/cms/edit",
      highlight: "cms/edit",
      icon: <IconPencil />
    },
    {
      label: "Reporting",
      highlight: "cms/reporting",
      url: "/cms/reporting",
      icon: <IconChartBar />
    },
    {
      label: "Settings",
      highlight: "cms/settings",
      url: "/cms/settings/content-types",
      icon: <IconSettings />,
      children: [
        {label: "Configure"},
        {label: "Applications", url: "/cms/settings/applications",
          children: {title: "Mosey Bank", 
            children: [
            {label: "Settings", url: "/cms/settings/applications/mosey-bank/settings"},
            {label: "Advanced"},
            {label: "Hostnames", url: "/cms/settings/applications/mosey-bank/hostnames"},
          ]}
        },  
        {label: "Access Rights", url: "/cms/settings/access-rights"},    
        {label: "API Clients", url: "/cms/settings/api-clients"},    
        {label: "Scheduled Jobs", url: "/cms/settings/scheduled-jobs"},    
        {label: "Content Types", url: "/cms/settings/content-types"},
        {label: "Blueprints", url: "/cms/settings/blueprints"},    
        {label: "Languages", url: "/cms/settings/languages"},
        {label: "Edit Tabs", url: "/cms/settings/edit-tabs"},
        {label: "Tools"},    
        {label: "Import Data", url: "/cms/settings/import-data"},
        {label: "Export Data", url: "/cms/settings/export-data"},    
        {label: "Convert Pages", url: "/cms/settings/convert-pages"},
        {label: "Change Log", url: "/cms/settings/change-log"},
        {label: "Add-ons"},    
        {label: "BVN/GETA 404 Handler", url: "/cms/settings/bvn"},
      ]
    },
  ]

  const highlight1 = menuItems.find(item => path.includes(item.highlight))
  const lvl2 = highlight1?.children?.find(item => (item.url ? path.includes(item.url) : false))
  const lvl3 = lvl2?.children?.children.find(item => item.url === path)

  const heading = lvl3?.label || lvl2?.label

  return (
      <div className="grid grid-cols-[0fr_1fr] grid-rows-[0fr_1fr] h-[100vh]">
        <Box gridColumn="2" bg="bg.accent.subtle" p="16">header</Box>
        <Box display="flex">
          <Sidenav className="h-full z-10 relative">
            <SidenavBody>
              {
                menuItems.map(menuItem => <SidenavItem 
                  onClick={() => menuClick(menuItem.url)} 
                  active={path.includes(menuItem.highlight)} 
                  key={menuItem.label} 
                  aria-label={menuItem.label} 
                  icon={menuItem.icon}>
                    {menuItem.label}
                  </SidenavItem>)
              }
            </SidenavBody>
          </Sidenav>
          {highlight1?.children && <VT backLink={lvl3 ? lvl2 : undefined} title={lvl3 ? lvl2?.children?.title : undefined} items={lvl3 ? lvl2?.children?.children : highlight1?.children} />}
        </Box>
        <Box p="xl" className="appear" bg="bg.page">
          <Heading level="3" color="fg.default">{heading || highlight1?.label}</Heading>
          {description && <Text color="fg.secondary" mt="xs">{description}</Text>}
          <Box mt="md">
            {children}
          </Box>
        </Box>
      </div>
  );
}
