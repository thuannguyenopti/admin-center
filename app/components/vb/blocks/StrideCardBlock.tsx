"use client";

import React from "react";
import { getProperty } from "./utils";

export const CardBlock = React.memo(function StrideCardBlock({
	properties,
}: {
	properties: any;
}) {
	// Get properties from CMS
	const icon = getProperty(properties, "icon", "Icon") || "/stride-icons/sticky-note.svg";
	const label = getProperty(properties, "label", "Label") || "CHALLENGES";
	const description = getProperty(properties, "description", "Description") || "Plan work without the back-and-forth";
	const backgroundImage = getProperty(properties, "backgroundImage", "Background Image");

	// Get display template settings
	const displaySettings = getProperty(properties, "displaySettings", "Display Settings") || [];
	const style = displaySettings.find((s: any) => s.key === "style")?.value || "complex";

	// Check if icon is an SVG path or emoji
	const isIconSvg = icon.includes('.svg') || icon.includes('/');

	// Parse background image (might be string or empty)
	const backgroundImageUrl = typeof backgroundImage === "string" ? backgroundImage.trim() : backgroundImage;

	const isSimple = style === "simple";
	const isProduct = style === "product";

	// Product style: matches stride-web ProductCard — image top with mask, content bottom, hover animations
	if (isProduct) {
		const productType = getProperty(properties, "productType", "Product Type") || "features";
		const title = getProperty(properties, "title", "Title") || label;
		const href = getProperty(properties, "href", "Href") || "#";

		const productConfig: Record<string, { name: string; icon: string }> = {
			features: { name: "Stride Platform", icon: "/stride-icons/sparkles.svg" },
			challenges: { name: "Stride Challenges", icon: "/stride-icons/flag.svg" },
			subscriptions: { name: "Stride Subscriptions", icon: "/stride-icons/wallet.svg" },
		};
		const product = productConfig[productType] || productConfig.features;

		return (
			<a
				href={href}
				className="grow basis-0 group relative flex justify-between flex-col rounded-2xl transition-all border border-black/5 hover:border-black/10"
				style={{
					backdropFilter: 'blur(3px)',
					backgroundColor: 'rgba(0, 0, 0, 0.02)',
				}}
			>
				<div
					className="relative w-full rounded-3xl overflow-hidden"
					style={{
						aspectRatio: '664/635',
						marginTop: '-3rem',
						marginBottom: '-10rem',
						WebkitMaskImage: 'linear-gradient(#000 50%, transparent 80%)',
						maskImage: 'linear-gradient(#000 50%, transparent 80%)',
					}}
				>
					{backgroundImageUrl && (
						<img
							src={backgroundImageUrl}
							alt={title}
							className="w-full h-full object-cover object-top scale-[1.15] mt-24 transition-transform duration-300 group-hover:-translate-y-6 group-hover:scale-[1.20]"
						/>
					)}
				</div>

				<div className="p-8 flex flex-col justify-end z-10" style={{ minHeight: '13.75rem' }}>
					<div className="flex gap-2 items-center">
						<img src={product.icon} alt="" width="16" height="16" />
						<p
							className="text-stride-dark uppercase"
							style={{
								fontFamily: "'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
								fontSize: '12px',
								fontWeight: '500',
								letterSpacing: '0.6px',
							}}
						>
							{product.name}
						</p>
					</div>
					<div className="flex flex-col mt-0">
						<h3
							className="text-stride-dark"
							style={{
								fontFamily: "'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
								fontSize: '18px',
								fontWeight: '500',
								lineHeight: '1.55',
							}}
						>
							{title}
						</h3>
						<span
							className="absolute right-6 bottom-6 flex items-center justify-center p-3 rounded-full transition-all border border-black/5 text-black/50 group-hover:text-stride-dark group-hover:bg-white"
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M5 12h14M12 5l7 7-7 7" />
							</svg>
						</span>
					</div>
				</div>
			</a>
		);
	}

	if (isSimple) {
		// Simple template: image on top, title and description below, no container background
		return (
			<a
				href="#"
				className="flex flex-col w-full group"
			>
				{/* Image at top with rounded corners */}
				{backgroundImageUrl && (
					<div className="relative w-full overflow-hidden rounded-lg mb-4 aspect-video">
						<img
							src={backgroundImageUrl}
							alt=""
							className="w-full h-full object-cover transition-transform group-hover:scale-105"
						/>
					</div>
				)}

				{/* Content below image - no background */}
				<h3
					className="font-stride-sans text-stride-dark mb-2"
					style={{
						fontSize: '18px',
						fontWeight: '500',
						lineHeight: '1.4',
					}}
				>
					{label}
				</h3>
				<p
					className="font-stride-sans text-stride-dark/60"
					style={{
						fontSize: '14px',
						lineHeight: '1.55',
					}}
				>
					{description}
				</p>
			</a>
		);
	}

	// Default template: complex styling with backdrop blur, gradient, arrow
	return (
		<a
			href="#"
			className="relative flex flex-col items-start overflow-hidden rounded-[24px] h-[320px] px-6 pt-[208px] pb-6 gap-2 w-full"
			style={{
				backdropFilter: 'blur(2px)',
				backgroundColor: 'rgba(0, 0, 0, 0.02)',
				border: '1px solid rgba(0, 0, 0, 0.03)',
			}}
		>
			{/* Background image (if provided) */}
			{backgroundImageUrl && (
				<>
					<div
						className="absolute inset-0 z-0"
						style={{
							backgroundImage: `url(${backgroundImageUrl})`,
							backgroundSize: '75%',
							backgroundPosition: '50% -20%',
							backgroundRepeat: 'no-repeat',
						}}
					/>
					<div
						className="absolute inset-0 z-[1]"
						style={{
							background: 'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 1.0) 65%)',
						}}
					/>
				</>
			)}

			{/* Label section (icon + text) */}
			<div className="flex items-center gap-2 w-full relative z-10">
				{isIconSvg ? (
					<img src={icon} alt="" width="24" height="24" style={{ color: '#1C1C1C' }} />
				) : (
					<span className="text-2xl">{icon}</span>
				)}
				<p
					className="flex-1 text-stride-dark uppercase"
					style={{
						fontFamily: "'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
						fontSize: '12px',
						fontWeight: '500',
						lineHeight: 'normal',
						letterSpacing: '0.6px',
						fontVariationSettings: "'wdth' 100",
					}}
				>
					{label}
				</p>
			</div>

			{/* Description */}
			<div className="w-full max-w-[275px] relative z-10">
				<p
					className="text-stride-dark"
					style={{
						fontFamily: "'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
						fontSize: '18px',
						fontWeight: '500',
						lineHeight: '1.55',
						fontVariationSettings: "'wdth' 100",
					}}
				>
					{description}
				</p>
			</div>

			{/* Arrow button (bottom right) */}
			<div
				className="absolute bottom-[15px] right-[15px] flex items-center justify-center p-3 rounded-full z-10"
				style={{
					backgroundColor: 'rgba(255, 255, 255, 0.5)',
				}}
			>
				<svg
					width="12"
					height="12"
					viewBox="0 0 12 12"
					fill="none"
					style={{ opacity: 0.6 }}
				>
					<path
						d="M2 6H10M10 6L6 2M10 6L6 10"
						stroke="#1C1C1C"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</div>
		</a>
	);
});
