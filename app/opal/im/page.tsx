"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutASidebar } from "./layouts/LayoutA-Sidebar";
import { LayoutBFullPage } from "./layouts/LayoutB-FullPage";
import { LayoutCPanel } from "./layouts/LayoutC-Panel";
import { type LayoutKey } from "./components/LayoutSwitcher";

function isLayoutKey(value: string | null): value is LayoutKey {
  return value === "A" || value === "B" || value === "C";
}

function IMPageInner() {
  const params = useSearchParams();
  const param = params.get("layout");
  const layout: LayoutKey = isLayoutKey(param) ? param : "A";
<<<<<<< HEAD
=======
  const convParam = params.get("conv") ?? undefined;
>>>>>>> origin/main

  return (
    <>
      {layout === "A" && <LayoutASidebar />}
      {layout === "B" && <LayoutBFullPage />}
      {layout === "C" && <LayoutCPanel />}
    </>
  );
}

export default function IMPage() {
  return (
    <Suspense fallback={null}>
      <IMPageInner />
    </Suspense>
  );
}
