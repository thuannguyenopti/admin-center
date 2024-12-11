import {
  Box,
  Sidenav,
  SidenavBody,
  SidenavItem,
  Text,
  Heading,
  Link,
} from "@optiaxiom/react";

import { useRouter, usePathname } from 'next/navigation'
import VT from "./VT";
  
export default function Template({children, description, structure}: Readonly<{
      children: React.ReactNode;
      description?: string,
      structure: any,
    }>
  ) {
  const router = useRouter()
  const path = usePathname()

  const menuClick = (url: string) => {
    router.push(`${url}`)
  }
 
  const menuItems = structure

  const highlight1 = menuItems.find((item: any) => path.includes(item.highlight))
  const lvl2 = highlight1?.children?.find((item: any) => (item.url ? path.includes(item.url) : false))
  const lvl3 = lvl2?.children?.children.find((item: any) => item.url === path)

  const heading = lvl3?.label || lvl2?.label

  return (
      <div className="grid grid-cols-[0fr_1fr] grid-rows-[0fr_1fr] h-[100vh]">
        <Box gridColumn="2" bg="bg.accent.subtle" p="16"><Link href="/">DXP</Link></Box>
        <Box display="flex">
          <Sidenav className="h-full z-10 relative">
            <SidenavBody>
              {
                menuItems.map((menuItem: any) => <SidenavItem 
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
          {highlight1?.children && <VT 
            backLink={lvl3 ? lvl2 : undefined} 
            title={lvl3 ? lvl2?.children?.title : undefined} 
            items={lvl3 ? lvl2?.children?.children : highlight1?.children} 
          />}
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
