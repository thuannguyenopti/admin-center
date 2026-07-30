"use client";

import {Suspense} from "react";
import {FilesPage} from "./FilesPage";

export default function Page() {
	return (
		<Suspense>
			<FilesPage />
		</Suspense>
	);
}
