"use client";

import React, {useState, useEffect} from "react";
import StrideHeaderContent from "./StrideHeaderContent";
import StrideHeaderWrapper from "./StrideHeaderWrapper";

const MOBILE_BREAKPOINT = 1024;
const HIDE_AUTH_BREAKPOINT = 1200;

/**
 * The Stride website header for real pages (uses window resize detection).
 */
export default function StrideHeader({editPageId, isMobile: isMobileProp}: {editPageId?: string; isMobile?: boolean}) {
	const [isMobileState, setIsMobileState] = useState(false);
	const [hideAuth, setHideAuth] = useState(false);

	useEffect(() => {
		// Skip window resize detection if isMobile is provided as a prop
		if (isMobileProp !== undefined) return;

		const handleResize = () => {
			setIsMobileState(window.innerWidth <= MOBILE_BREAKPOINT);
			setHideAuth(window.innerWidth <= HIDE_AUTH_BREAKPOINT);
		};

		// Set initial value
		handleResize();

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [isMobileProp]);

	// Use prop if provided, otherwise use state
	const isMobile = isMobileProp !== undefined ? isMobileProp : isMobileState;

	return (
		<StrideHeaderWrapper positioning="fixed">
			<StrideHeaderContent isMobile={isMobile} hideAuth={hideAuth} editPageId={editPageId} />
		</StrideHeaderWrapper>
	);
}
