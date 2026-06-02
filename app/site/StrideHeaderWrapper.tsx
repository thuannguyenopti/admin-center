"use client";

import React, {useState, useEffect} from "react";

type StrideHeaderWrapperProps = {
	children: React.ReactNode;
	/** Positioning strategy: fixed (stays on scroll), absolute (overlays hero), sticky, or relative */
	positioning?: "fixed" | "absolute" | "sticky" | "relative";
	/** Whether to enable scroll-based glass effect (default: true for absolute/sticky). Set to false for always-on background. */
	enableScrollEffect?: boolean;
	/** Whether to use max-width container (default: true). Set to false for previews to fit viewport. */
	useMaxWidth?: boolean;
};

/**
 * Shared wrapper for the Stride header across all contexts.
 * Provides consistent styling and positioning behavior.
 * Applies glass effect when scrolled down.
 */
export default function StrideHeaderWrapper({
	children,
	positioning = "fixed",
	enableScrollEffect = positioning !== "relative",
	useMaxWidth = true,
}: StrideHeaderWrapperProps) {
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		if (!enableScrollEffect) return;

		const handleScroll = () => {
			const scrolled = window.pageYOffset > 200 || document.documentElement.scrollTop > 200;
			setIsScrolled(scrolled);
		};

		// Set initial value
		handleScroll();

		window.addEventListener("scroll", handleScroll, {passive: true});
		return () => window.removeEventListener("scroll", handleScroll);
	}, [enableScrollEffect]);

	// For previews (useMaxWidth=false), use w-full instead of left-0 right-0 to stay within container
	const positionClasses = (() => {
		if (positioning === "fixed") {
			return useMaxWidth ? "fixed top-0 left-0 right-0 z-50" : "fixed top-0 w-full z-50";
		}
		if (positioning === "absolute") {
			return useMaxWidth ? "absolute top-0 left-0 right-0 z-50" : "absolute top-0 w-full z-50";
		}
		if (positioning === "sticky") {
			return "sticky top-0 z-50";
		}
		return "relative";
	})();

	// Apply same glass effect behavior for both absolute and sticky positioning
	const backgroundClasses = isScrolled && enableScrollEffect
		? "bg-white/90 backdrop-blur"
		: "bg-transparent";

	const containerClasses = useMaxWidth
		? "max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between"
		: "w-full px-6 py-6 flex items-center justify-between";

	return (
		<div className={positionClasses}>
			<header
				className={`w-full font-stride-sans transition-all duration-300 ease-in-out ${backgroundClasses}`}
				style={{
					transitionProperty: 'background-color, backdrop-filter, box-shadow, border-color',
				}}
			>
				<div className={containerClasses}>
					{children}
				</div>
			</header>
		</div>
	);
}
