"use client";

import {Aside} from "@/app/context/LayoutContext";
import RightToolbar from "@/app/components/RightToolbar";

export default function ContentPage() {
	return (
		<>
			<div>
				<p>Content management page</p>
			</div>
			<Aside>
				<RightToolbar />
			</Aside>
		</>
	);
}