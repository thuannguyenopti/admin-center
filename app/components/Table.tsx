import { ReactNode } from "react"
import {Badge, Button, Text, Box} from "@optiaxiom/react"
import { 
  IconDots as IconMenu
 } from "@tabler/icons-react";

export const Table = ({children}: {children: ReactNode}) => {
  return (
    <div className="rounded-[6px] border color-[#ccc] bg-white"><table className="border-collapse w-full">{children}</table></div>
  );
}

import { useRouter } from 'next/navigation'
export const Tr = ({children, url}: {children: ReactNode, url?: string}) => {
  
  const router = useRouter()
  const rowClick = (href: string) => {
    router.push(`${href}`)
  }
  return (
    <tr onClick={url ? () => rowClick(url) : undefined} className={"relative color-[#ccc] " + (url && "cursor-pointer hover:bg-[#fafafa] ")}>{children}</tr>
  );
}
export const Th = ({children, align}: {children?: ReactNode, align?: any}) => {
  return (
    <th className={"text-left p-4 text-xs font-normal text-[#66708C] py-3 align-top"} style={{textAlign: align}}>{children}</th>
  );
}

export const Td = ({
  children, 
  type, 
  description,
  badge
}: {
  children: ReactNode, 
  type?: string, 
  description?: string,
  badge?: any,
}) => {
  return (
    <td className={`p-4 border-t color-[#ccc] align-top`}>
      {type === undefined && <>
          <Text leading="normal" color="fg.default">{children}</Text>
          {description && <Text fontSize="sm" color="fg.secondary">{description}</Text>}
        </>
      }
      {type === "header" && <>
          <Text leading="normal" color="fg.default" fontWeight="500">{children}</Text>
          {description && <Text fontSize="sm" color="fg.tertiary">{description}</Text>}
        </>
      }
      {type === "badge" && <Badge intent={badge}>{children}</Badge>}  
      {type === "button" && <Box textAlign="end"><Button aria-label={"Actions"} size="sm" icon={<IconMenu />} appearance="subtle" /></Box>}  
      {type === "numeric" && 
          <Text color="fg.default" textAlign="end">{children}</Text>}      
      </td>
  );
}
