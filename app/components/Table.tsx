import { ReactNode } from "react";

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
export const Th = ({children}: {children?: ReactNode}) => {
  return (
    <th className={"text-left p-4 text-xs font-normal text-[#66708C] py-3"}>{children}</th>
  );
}

export const Td = ({children}: {children: ReactNode}) => {
  return (
    <td className="p-4 border-t color-[#ccc]">{children}</td>
  );
}
