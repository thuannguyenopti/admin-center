"use client";

import { Suspense } from "react";
import { Box } from "@optiaxiom/react";
import { ReactFlowProvider } from "@xyflow/react";
import { FormBuilder } from "./FormBuilder";

export default function FormBuilderPage() {
	return (
		<ReactFlowProvider>
			<Suspense fallback={<Box p="24">Loading form builder...</Box>}>
				<FormBuilder />
			</Suspense>
		</ReactFlowProvider>
	);
}
