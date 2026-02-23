"use client";

import React, {useState, useEffect} from "react";
import StrideHeaderContent from "./StrideHeaderContent";

const MOBILE_BREAKPOINT = 1024;
const HIDE_AUTH_BREAKPOINT = 1200;

/**
 * The Stride website header for real pages (uses window resize detection).
 */
export default function StrideHeader({editPageId}: {editPageId?: string}) {
	const [isMobile, setIsMobile] = useState(false);
	const [hideAuth, setHideAuth] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
			setHideAuth(window.innerWidth <= HIDE_AUTH_BREAKPOINT);
		};

		// Set initial value
		handleResize();

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<header className="w-full bg-white px-4 md:px-8 py-4 md:py-5 flex items-center justify-between border-b border-gray-100 shrink-0 sticky top-0 z-50 shadow-sm">
			<StrideHeaderContent isMobile={isMobile} hideAuth={hideAuth} editPageId={editPageId} />
		</header>
	);
}
