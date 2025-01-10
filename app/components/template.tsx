import {
  Box,
  Sidenav,
  SidenavBody,
  SidenavItem,
  Text,
  Heading,
} from "@optiaxiom/react";
import Link from "next/link";

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
  const lvl3 = lvl2?.children?.children.find((item: any) => (item.url ? path.includes(item.url) : false))
  const lvl4 = lvl3?.children?.children.find((item: any) => (item.url ? path.includes(item.url) : false))

  const heading = lvl4?.label || lvl3?.label || lvl2?.label
  console.log(lvl4)

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
          {((highlight1?.children?.length > 1) || lvl3 || lvl4) && <VT 
            backLink={lvl4 ? lvl3 : (lvl3 ? lvl2 : undefined)} 
            title={lvl4 ? lvl3.children.title : (lvl3 ? lvl2?.children?.title : undefined)} 
            items={lvl4 ? lvl3.children.children : (lvl3 ? lvl2?.children?.children : highlight1?.children)} 
          />}
        </Box>
        <Box p="24" className="appear" bg="bg.page" color="fg.default" overflow="auto">
          <Heading level="3">{heading || highlight1?.label}</Heading>
          {description && <Text color="fg.secondary" mt="16">{description}</Text>}
          <Box mt="16">
            {children}
          </Box>
        </Box>
      </div>
  );
}
