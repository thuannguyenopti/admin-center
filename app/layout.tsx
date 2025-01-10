'use client'
import Template from "./components/template";
import "./globals.css";
import { AxiomProvider } from "@optiaxiom/react";
import { usePathname } from 'next/navigation'
import { useState } from "react";
import { 
  IconChartBar, 
  IconDashboard, 
  IconPencil, 
  IconPlayerPlay,
  IconHierarchy3,
  IconLogs,
  IconSettings,
  IconSearch,
  IconList
 } from "@tabler/icons-react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const path = usePathname()
  const structure = {
    "cms": [
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
            children: {
              title: "Mosey Bank", 
              children: [
                {label: "Settings", url: "/cms/settings/applications/mosey-bank/settings"},
                {label: "Advanced"},
                {label: "Hostnames", url: "/cms/settings/applications/mosey-bank/hostnames"},
              ]
            }
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
    ], 
    "graph": [
      {
        label: "Dashboard",
        url: "/graph/dashboard",
        highlight: "/graph/dashboard",
        icon: <IconDashboard />
      },
      {
        label: "API Playground",
        url: "/graph/api-playground",
        highlight: "/graph/api-playground",
        icon: <IconPlayerPlay />
      },
      {
        label: "Content Sources",
        url: "/graph/content-sources/sources",
        highlight: "/graph/content-sources",
        icon: <IconHierarchy3 />,
        children: [
          {
            label: "Content Sources", url: "/graph/content-sources/sources",
            children: {
              title: "ODP (Integration)",
              children: [
                {label: "Details",  url: "/graph/content-sources/sources/odp/details"},
                {label: "Content",  url: "/graph/content-sources/sources/odp/content"},
                {label: "Schema",   url: "/graph/content-sources/sources/odp/schema"},
                {label: "Settings", url: "/graph/content-sources/sources/odp/settings"},
              ]
            }
          },
        ]
      },
      {
        label: "Sync Log",
        url: "/graph/sync-log",
        highlight: "/graph/sync-log",
        icon: <IconLogs />
      },
      {
        label: "Settings",
        url: "/graph/settings",
        highlight: "/graph/settings",
        icon: <IconSettings />
      },
      {
        label: "Optimize Search",
        url: "/graph/optimize-search",
        highlight: "/graph/optimize-search",
        icon: <IconSearch />
      },
    ],
    "fe-hosting": [
      {
        label: "Applications",
        url: "/fe-hosting/applications/apps",
        highlight: "/fe-hosting/applications",
        icon: <IconList />,
        children: [
          {
            label: "Applications", 
            url: "/fe-hosting/applications/apps",
            children: {
              title: "Mosey Bank",
              children: [
                {
                  label: "Application Overview",  url: "/fe-hosting/applications/apps/mosey-bank/overview",
                  children: {
                    title: "Deployment 5",
                    children: [
                      {
                        label: "Deployment Overview",  url: "/fe-hosting/applications/apps/mosey-bank/overview/deploy-5",
                      },
                    ]
                  }
                },
                {label: "Settings",  url: "/fe-hosting/applications/apps/mosey-bank/settings"},
              ]
            }
          },
        ]
      },
    ]
  }
  const key: string = path.split("/")[1]
  const menu = structure[key as keyof typeof structure]

  const [feHostingState, setFeHostingState] = useState({});

  return (
    <html lang="en">
      <body>
        <AxiomProvider>
        {menu ? 
          <Template structure={menu}>
            {children}
          </Template>
          : children
          }
        </AxiomProvider>
      </body>
    </html>
  );
}
