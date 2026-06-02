"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutASidebar } from "./layouts/LayoutA-Sidebar";
import { LayoutBErika } from "./layouts/LayoutB-Erika";
import { LayoutCAna } from "./layouts/LayoutC-Ana";
import { type LayoutKey } from "./components/LayoutSwitcher";

function isLayoutKey(value: string | null): value is LayoutKey {
  return value === "A" || value === "B" || value === "C";
}

function IMPageInner() {
  const params = useSearchParams();
  const param = params.get("layout");
  const layout: LayoutKey = isLayoutKey(param) ? param : "A";

  return (
    <>
      {layout === "A" && <LayoutASidebar />}
      {layout === "B" && <LayoutBErika />}
      {layout === "C" && <LayoutCAna />}
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
