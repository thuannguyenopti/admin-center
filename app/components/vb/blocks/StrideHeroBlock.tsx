"use client";

import React from "react";
import { getProperty } from "./utils";

export const HeroBlock = React.memo(function StrideHeroBlock({
	properties,
	hasBgImage
}: {
	properties: any;
	hasBgImage?: boolean
}) {
	// Get properties from CMS
	const badge = getProperty(properties, "badge", "Badge Text") || "";
	const heading = getProperty(properties, "heading", "Heading") || "Set it. Sweat it. Send it.";
	const subheading = getProperty(properties, "subheading", "Subheading") || "Let the streets, and the world know.";
	const primaryButtonText = getProperty(properties, "primaryButton", "Primary Button") || "GET STARTED";
	const rawSecondaryButton = getProperty(properties, "secondaryButton", "Secondary Button");
	const secondaryButtonText = rawSecondaryButton === "" ? "" : (rawSecondaryButton || "BOOK A DEMO");
	const backgroundImage = getProperty(properties, "backgroundImage", "Background Image") || "/stride-hero/hero.png";
	const backgroundVideo = getProperty(properties, "backgroundVideo", "Background Video") || "";
	const appMockupImage = getProperty(properties, "appMockupImage", "App Mockup Image");
	const showAppMockup = getProperty(properties, "showAppMockup", "Show App Mockup") !== "false";

	// Get display template settings
	const displaySettings = getProperty(properties, "displaySettings", "Display Settings") || [];
	const layout = displaySettings.find((s: any) => s.key === "layout")?.value || "default";

	const isCentered = layout === "centered";

	if (isCentered) {
		// Centered template for Features page
		return (
			<div className="relative w-full overflow-visible bg-gradient-to-b from-[#EFF5FB] to-[#F2F8FC] rounded-lg overflow-x-clip">
				{/* Background video/image with overlay */}
				<div className="absolute inset-0 overflow-hidden rounded-lg">
					{backgroundVideo ? (
						<video
							src={backgroundVideo}
							autoPlay
							loop
							muted
							className="absolute inset-0 w-full h-full object-cover opacity-50 md:opacity-90 rounded-lg"
						/>
					) : (
						<img
							src={backgroundImage}
							alt=""
							className="absolute w-full h-full object-cover opacity-50 md:opacity-90"
							style={{
								objectPosition: 'center',
							}}
						/>
					)}
					{/* Two-layer overlay: uniform wash + gradient */}
					<div
						className="absolute inset-0"
						style={{
							backgroundColor: 'rgba(242, 248, 252, 0.4)',
							backgroundImage: 'linear-gradient(to top, rgb(242, 248, 252) 0%, rgba(0, 0, 0, 0) 50%)',
						}}
					/>
				</div>

				{/* Content container - centered */}
				<div className="relative z-10 w-full max-w-[1000px] mx-auto px-6 pt-[200px] pb-[200px] text-center">
					{badge && (
						<div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-[5px] border border-white/20 mb-6">
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white">
								<path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" fill="currentColor"/>
							</svg>
							<span className="text-white text-xs font-stride-semibold font-stride-sans uppercase tracking-wider">{badge}</span>
						</div>
					)}

					<h1 className="text-7xl font-stride-bold font-stride-sans tracking-tight text-stride-dark mx-auto mb-6">
						{heading}
					</h1>

					<p className="text-xl font-stride-normal font-stride-sans leading-relaxed text-stride-dark mx-auto max-w-[800px]">
						{subheading}
					</p>
				</div>
			</div>
		);
	}

	// Event template — white text on dark background, left-aligned
	if (layout === "event") {
		return (
			<div className="relative w-full overflow-hidden mt-[76px]">
				{/* Background image */}
				<div className="absolute inset-0">
					<img
						src={backgroundImage}
						alt=""
						className="absolute w-full h-full object-cover"
					/>
					<div className="absolute inset-0 bg-black/40" />
				</div>

				{/* Content */}
				<div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 pt-[200px] pb-20">
					{badge && (
						<div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-[5px] border border-white/20 mb-4">
							<span className="text-white text-xs font-stride-semibold font-stride-sans uppercase tracking-wider">{badge}</span>
						</div>
					)}
					<h1 className="text-5xl md:text-7xl font-stride-bold font-stride-sans tracking-tight text-white pb-4 max-w-3xl">
						{heading}
					</h1>
					{subheading && (
						<p className="text-xl md:text-2xl font-stride-sans text-white/80 max-w-2xl mb-8">
							{subheading}
						</p>
					)}
					{primaryButtonText && (
						<div className="flex flex-wrap gap-4">
							<button className="bg-stride-blue text-white px-8 py-3 rounded-[5px] font-stride-semibold font-stride-sans text-sm uppercase tracking-wider hover:bg-stride-blue-dark transition-colors">
								{primaryButtonText}
							</button>
						</div>
					)}
				</div>
			</div>
		);
	}

	// Default template for Homepage
	return (
		<div className="relative w-full overflow-visible bg-gradient-to-b from-[#EFF5FB] to-[#F2F8FC] rounded-lg overflow-x-clip">
			{/* Background video/image */}
			<div className="absolute inset-0 overflow-hidden rounded-lg">
				{backgroundVideo ? (
					<video
						src={backgroundVideo}
						autoPlay
						loop
						muted
						className="absolute inset-0 w-full h-full object-cover opacity-50 md:opacity-90 rounded-lg"
					/>
				) : (
					<img
						src={backgroundImage}
						alt=""
						className="absolute w-full h-full object-cover"
						style={{
							objectPosition: '30% center',
						}}
					/>
				)}
			</div>

			{/* Content container - with top padding to account for header */}
			<div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 pt-[76px] sm:pt-[92px] md:pt-[124px] lg:pt-[300px] pb-16 sm:pb-20 md:pb-24 lg:pb-28">
				<div className="flex gap-12 items-center">
					{/* Left content */}
					<div className="basis-0" style={{ flexGrow: 2 }}>
						{badge && (
							<div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-[5px] border border-white/20 mb-4">
								<span className="text-white text-xs font-stride-semibold font-stride-sans uppercase tracking-wider">{badge}</span>
							</div>
						)}
						<h1 className="text-7xl font-stride-bold font-stride-sans tracking-tight text-stride-dark pb-4">
							{heading}
						</h1>

						<p className="text-2xl font-stride-semibold font-stride-sans text-stride-dark py-4">
							{subheading}
						</p>

						<div className="flex flex-wrap gap-4" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
							{/* Primary button - Figma design system */}
							{primaryButtonText && (
								<button className="bg-[#0980F6] hover:bg-[#0668C4] transition-colors rounded-[5px] px-[24px] py-[14px]">
									<span className="text-white text-xs font-stride-medium font-stride-sans uppercase tracking-wider whitespace-nowrap">
										{primaryButtonText}
									</span>
								</button>
							)}

							{/* Secondary button - Figma design system */}
							{secondaryButtonText && (
								<button className="border-2 border-[#1C1C1C] hover:bg-[#1C1C1C] transition-colors rounded-[5px] stride-button-secondary px-[24px] py-[14px]">
									<span className="text-xs font-stride-medium font-stride-sans uppercase tracking-wider whitespace-nowrap">
										{secondaryButtonText}
									</span>
								</button>
							)}
						</div>
					</div>

					{/* Right content - App mockup */}
					{showAppMockup && (
						<div className="hidden md:block basis-0 grow">
							{appMockupImage ? (
								<div className="w-full relative" style={{ aspectRatio: '1/2.02', marginBottom: '-100%' }}>
									<img
										src={appMockupImage}
										alt="App mockup"
										className="absolute"
										style={{
											left: '-32.9%',
											maxWidth: '166%',
											top: '-10%',
											filter: 'drop-shadow(0px 10px 10px rgba(0, 0, 0, 0.3))',
										}}
										data-lenis-parallax
										data-lenis-speed=".9"
									/>
								</div>
							) : (
								<div
									className="bg-white border border-black/5 rounded-[24px] md:rounded-[48px] overflow-hidden w-full max-w-[280px] md:max-w-[320px] lg:max-w-[362px]"
									style={{
										aspectRatio: '362/733',
										boxShadow: '0px 149.979px 59.992px rgba(0,0,0,0.07), 0px 62.658px 25.063px rgba(0,0,0,0.05), 0px 33.5px 13.4px rgba(0,0,0,0.04), 0px 18.78px 7.512px rgba(0,0,0,0.04), 0px 9.974px 3.989px rgba(0,0,0,0.03), 0px 4.15px 1.66px rgba(0,0,0,0.02)',
									}}
								>
								{/* App content */}
								<div className="h-full flex flex-col bg-gradient-to-b from-white/68 to-white/68" style={{ backgroundColor: '#EFF5FB', mixBlendMode: 'normal' }}>
									{/* Header */}
									<div className="flex items-center justify-between px-6 pt-14 pb-2">
										<button className="w-6 h-6 flex items-center justify-center">
											<svg width="11" height="18" viewBox="0 0 11 18" fill="none">
												<path d="M10 1L2 9L10 17" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
											</svg>
										</button>
										<span className="text-stride-dark font-stride-bold" style={{ fontSize: '16px' }}>
											Recording
										</span>
										<button className="w-6 h-6 flex items-center justify-center">
											<svg width="21" height="21" viewBox="0 0 21 21" fill="none">
												<circle cx="3.5" cy="3.5" r="1.5" fill="#1C1C1C"/>
												<circle cx="3.5" cy="10.5" r="1.5" fill="#1C1C1C"/>
												<circle cx="3.5" cy="17.5" r="1.5" fill="#1C1C1C"/>
												<circle cx="10.5" cy="3.5" r="1.5" fill="#1C1C1C"/>
												<circle cx="10.5" cy="10.5" r="1.5" fill="#1C1C1C"/>
												<circle cx="10.5" cy="17.5" r="1.5" fill="#1C1C1C"/>
												<circle cx="17.5" cy="3.5" r="1.5" fill="#1C1C1C"/>
												<circle cx="17.5" cy="10.5" r="1.5" fill="#1C1C1C"/>
												<circle cx="17.5" cy="17.5" r="1.5" fill="#1C1C1C"/>
											</svg>
										</button>
									</div>

									{/* Map area - centered crosshair */}
									<div className="flex-1 flex items-center justify-center p-2 relative">
										<div className="absolute inset-0 opacity-20" style={{
											backgroundImage: 'repeating-linear-gradient(0deg, #1C1C1C 0px, #1C1C1C 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #1C1C1C 0px, #1C1C1C 1px, transparent 1px, transparent 40px)',
										}}></div>
										<svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="relative z-10">
											<circle cx="12" cy="12" r="11" stroke="#1C1C1C" strokeWidth="2"/>
											<circle cx="12" cy="12" r="3" fill="#1C1C1C"/>
											<line x1="12" y1="1" x2="12" y2="7" stroke="#1C1C1C" strokeWidth="2"/>
											<line x1="12" y1="17" x2="12" y2="23" stroke="#1C1C1C" strokeWidth="2"/>
											<line x1="1" y1="12" x2="7" y2="12" stroke="#1C1C1C" strokeWidth="2"/>
											<line x1="17" y1="12" x2="23" y2="12" stroke="#1C1C1C" strokeWidth="2"/>
										</svg>
									</div>

									{/* Bottom card */}
									<div className="bg-white p-4 flex flex-col gap-2">
										{/* Time and distance cards */}
										<div className="flex gap-2">
											<div className="flex-1 bg-[#F2F8FC] rounded-xl p-2 flex flex-col gap-1">
												<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1C1C1C" strokeWidth="2">
													<circle cx="12" cy="12" r="10"/>
													<polyline points="12 6 12 12 16 14"/>
												</svg>
												<div className="font-stride-bold" style={{ fontSize: '38.517px', lineHeight: '1' }}>
													<span className="text-stride-dark">16:56</span>
													<span className="text-stride-dark" style={{ fontSize: '19.258px' }}>min</span>
												</div>
											</div>
											<div className="flex-1 bg-[#F2F8FC] rounded-xl p-2 flex flex-col gap-1">
												<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1C1C1C" strokeWidth="2">
													<polyline points="13 17 18 12 13 7"/>
													<polyline points="6 17 11 12 6 7"/>
												</svg>
												<div className="font-stride-bold" style={{ fontSize: '38.517px', lineHeight: '1' }}>
													<span className="text-stride-dark">14.56</span>
													<span className="text-stride-dark" style={{ fontSize: '19.258px' }}>km</span>
												</div>
											</div>
										</div>

										{/* Heart rate card */}
										<div className="bg-stride-dark rounded-xl p-2 h-[136px] relative overflow-hidden">
											<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="absolute top-2 left-2">
												<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
											</svg>
											{/* Heart rate line */}
											<svg width="100%" height="80" viewBox="0 0 330 80" fill="none" preserveAspectRatio="none" className="absolute bottom-10 left-0">
												<path d="M0 40 Q 80 40 100 30 L 120 10 L 140 50 L 160 40 Q 240 40 330 40" stroke="white" strokeWidth="3" fill="none" vectorEffect="non-scaling-stroke"/>
											</svg>
											<div className="absolute bottom-2 left-2 font-stride-bold" style={{ fontSize: '38.517px', lineHeight: '1' }}>
												<span className="text-white">132</span>
												<span className="text-white" style={{ fontSize: '19.258px' }}>bpm</span>
											</div>
										</div>

										{/* Action buttons */}
										<div className="flex gap-8 justify-center py-4">
											<button className="bg-[#F2F8FC] rounded-full p-4 hover:bg-[#E8EEF4] transition-colors">
												<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1C1C1C" strokeWidth="2">
													<line x1="18" y1="6" x2="6" y2="18"/>
													<line x1="6" y1="6" x2="18" y2="18"/>
												</svg>
											</button>
											<button className="bg-[#F2F8FC] rounded-full p-4 hover:bg-[#E8EEF4] transition-colors">
												<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1C1C1C" strokeWidth="2">
													<rect x="6" y="4" width="4" height="16"/>
													<rect x="14" y="4" width="4" height="16"/>
												</svg>
											</button>
											<button className="bg-[#F2F8FC] rounded-full p-4 hover:bg-[#E8EEF4] transition-colors">
												<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1C1C1C" strokeWidth="2">
													<polyline points="20 6 9 17 4 12"/>
												</svg>
											</button>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				)}
				</div>
			</div>
		</div>
	);
});
