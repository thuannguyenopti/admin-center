<<<<<<< HEAD
"use client";

import { BrandPacksOverview } from "./components/BrandPacksOverview";

export default function BrandPacksPage() {
	return <BrandPacksOverview />;
}
=======
import { redirect } from "next/navigation";

export default function BrandPacksPage() {
	redirect("/opal/context?tab=brand");
}
>>>>>>> origin/main
