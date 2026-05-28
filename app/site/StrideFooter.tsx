"use client";

import React from "react";

export default function StrideFooter() {
	return (
		<footer className="w-full font-stride-sans" style={{ background: "white" }}>
			{/* CTA Section */}
			<div className="w-full px-6 py-16" style={{ background: "white" }}>
				<div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
					<h2
						className="text-stride-dark text-3xl md:text-4xl"
						style={{
							fontWeight: "600",
							lineHeight: "1.2",
							fontFamily: "'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
						}}
					>
						Ready to meet better?
					</h2>
					<div className="flex gap-4">
						<button
							className="bg-[#0980F6] hover:bg-[#0668C4] transition-colors rounded-[5px] px-6 py-3.5"
						>
							<span
								className="text-white uppercase whitespace-nowrap"
								style={{
									fontFamily: "'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
									fontSize: '12px',
									fontWeight: '500',
									lineHeight: '1',
									letterSpacing: '0.6px',
									fontVariationSettings: "'wdth' 100",
								}}
							>
								GET STARTED
							</span>
						</button>
						<button
							className="border-2 border-[#1C1C1C] hover:bg-[#1C1C1C] transition-colors rounded-[55px] stride-button-secondary px-6 py-3.5"
						>
							<span
								className="uppercase whitespace-nowrap"
								style={{
									fontFamily: "'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
									fontSize: '12px',
									fontWeight: '500',
									lineHeight: '1',
									letterSpacing: '0.6px',
									fontVariationSettings: "'wdth' 100",
								}}
							>
								BOOK A DEMO
							</span>
						</button>
					</div>
				</div>
			</div>

			{/* Footer Links Section */}
			<div className="w-full px-6 py-16">
				<div className="max-w-[1200px] mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
						{/* Logo & ALLOY Column */}
						<div className="lg:col-span-2">
							<div className="mb-8">
								<img
									src="/stride-wordmark.svg"
									alt="Stride"
									width="120"
									height="32"
									className="h-8 w-auto"
								/>
							</div>
							<div className="space-y-4">
								<h3
									className="text-stride-dark uppercase"
									style={{
										fontSize: '14px',
										fontWeight: '600',
										letterSpacing: '0.05em',
										fontFamily: "'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
									}}
								>
									ALLOY
								</h3>
								<div
									className="text-stride-dark space-y-1"
									style={{
										fontSize: '14px',
										fontWeight: '400',
										lineHeight: '1.6',
										fontFamily: "'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
									}}
								>
									<p>119 5th Ave 7th floor</p>
									<p>New York, NY 10003, USA</p>
									<p className="pt-2">
										<a href="#" className="hover:text-[#0980F6] transition-colors">
											Contact us
										</a>
									</p>
									<p>Phone: +1 603 594 0249</p>
								</div>
							</div>
						</div>

						{/* PRODUCTS Column */}
						<div>
							<h3
								className="text-stride-dark uppercase mb-4"
								style={{
									fontSize: '14px',
									fontWeight: '600',
									letterSpacing: '0.05em',
									fontFamily: "'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
								}}
							>
								PRODUCTS
							</h3>
							<ul className="space-y-2">
								{["Plan", "Meet", "Track"].map((item) => (
									<li key={item}>
										<a
											href="#"
											className="text-stride-dark hover:text-[#0980F6] transition-colors"
											style={{
												fontSize: '14px',
												fontWeight: '400',
												fontFamily: "'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
											}}
										>
											{item}
										</a>
									</li>
								))}
							</ul>
						</div>

						{/* RESOURCES Column */}
						<div>
							<h3
								className="text-stride-dark uppercase mb-4"
								style={{
									fontSize: '14px',
									fontWeight: '600',
									letterSpacing: '0.05em',
									fontFamily: "'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
								}}
							>
								RESOURCES
							</h3>
							<ul className="space-y-2">
								{["News", "Events"].map((item) => (
									<li key={item}>
										<a
											href="#"
											className="text-stride-dark hover:text-[#0980F6] transition-colors"
											style={{
												fontSize: '14px',
												fontWeight: '400',
												fontFamily: "'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
											}}
										>
											{item}
										</a>
									</li>
								))}
							</ul>
						</div>

						{/* COMPANY Column */}
						<div>
							<h3
								className="text-stride-dark uppercase mb-4"
								style={{
									fontSize: '14px',
									fontWeight: '600',
									letterSpacing: '0.05em',
									fontFamily: "'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
								}}
							>
								COMPANY
							</h3>
							<ul className="space-y-2">
								{["About us", "Book a demo", "Contact"].map((item) => (
									<li key={item}>
										<a
											href="#"
											className="text-stride-dark hover:text-[#0980F6] transition-colors"
											style={{
												fontSize: '14px',
												fontWeight: '400',
												fontFamily: "'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
											}}
										>
											{item}
										</a>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
