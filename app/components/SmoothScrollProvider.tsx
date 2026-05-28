"use client";

import {useEffect} from "react";
import Lenis from "lenis";

/**
 * Hooks Lenis into the requestAnimationFrame loop to enable smooth scrolling globally.
 */
export default function SmoothScrollProvider() {
	useEffect(() => {
		const root = document.documentElement;
		root.classList.add("lenis");
		const lenis = new Lenis({
			duration: 0,
			easing: (t) => t, // Linear easing for native scroll feel
			smoothWheel: false,
		});

		const syncParallax = (scrollValue: number) => {
			document.querySelectorAll<HTMLElement>("[data-lenis-parallax]").forEach((el) => {
				const speed = Number(el.dataset.lenisSpeed ?? "1");
				const offset = scrollValue * (speed - 1);
				el.style.setProperty("--lenis-parallax", offset.toFixed(2));
			});
		};

		const handleScroll = ({scroll}: {scroll: number}) => {
			syncParallax(scroll);
		};

		lenis.on("scroll", handleScroll);
		// Ensure initial positions line up with initial scroll state.
		syncParallax(window.scrollY || 0);

		let rafId = requestAnimationFrame(animate);

		function animate(time: number) {
			lenis.raf(time);
			rafId = requestAnimationFrame(animate);
		}

		return () => {
			cancelAnimationFrame(rafId);
			lenis.off("scroll", handleScroll);
			lenis.destroy();
			root.classList.remove("lenis");
		};
	}, []);

	return null;
}
