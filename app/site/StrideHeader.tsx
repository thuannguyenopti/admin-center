"use client";

import React from "react";
import {siteConfig} from "@/app/db/initialData";
import Link from "next/link";

/**
 * The Stride website header — raw HTML + Tailwind (customer website, not CMS UI).
 * Renders the logo, nav links, and auth buttons.
 * Nav links point to /site/... so they work within the published site.
 */
export default function StrideHeader({editPageId}: {editPageId?: string}) {
	return (
		<header className="w-full bg-white px-4 md:px-8 py-4 md:py-5 flex items-center justify-between border-b border-gray-100 shrink-0 sticky top-0 z-50 shadow-sm">
			<div className="flex items-center gap-4 md:gap-12">
				<Link href="/site" className="select-none no-underline">
					<svg
						width="128"
						height="32"
						viewBox="0 0 128 32"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<g clipPath="url(#clip0_stride_header)">
							<path
								d="M6.77799 2.59403C5.32643 4.22489 4.30713 6.51892 3.8335 9.12422C3.66336 10.0581 3.57752 10.9627 3.57752 11.8266C3.57752 12.8507 3.70015 13.8183 3.94999 14.6935C4.13699 15.3499 4.39756 15.9522 4.72251 16.4755C5.20994 17.265 5.84452 17.8763 6.58945 18.2823C7.3344 18.6883 8.18969 18.8958 9.1446 18.8958H18.4578C18.8011 18.8958 19.0894 18.9455 19.3162 19.0289C19.4863 19.0921 19.6227 19.1733 19.727 19.2613C19.8833 19.3966 19.9722 19.5342 20.0381 19.7079C20.1025 19.8838 20.1485 20.1184 20.1485 20.4635C20.1485 20.7365 20.1178 21.0771 20.0458 21.4741C19.868 22.4418 19.517 23.2042 19.0204 23.7478C18.5222 24.2892 17.8677 24.6185 17.0461 24.6208H1.31819L0 31.866H16.0973C18.3536 31.8683 20.268 30.8623 21.7226 29.1525C23.1788 27.4448 24.1705 25.0606 24.658 22.3741C24.874 21.1831 24.9875 20.0846 24.9875 19.0695C24.9875 18.0207 24.8649 17.0552 24.6028 16.2025C24.4066 15.5642 24.1322 14.9935 23.7904 14.513C23.2769 13.7913 22.6209 13.2815 21.8637 12.9543C21.1034 12.6273 20.2358 12.4762 19.2579 12.4762H9.97229C9.70865 12.4762 9.49099 12.4288 9.3224 12.3544C9.19519 12.298 9.09401 12.228 9.01587 12.1491C8.89782 12.0318 8.82424 11.9055 8.766 11.7363C8.70928 11.5671 8.671 11.3438 8.66942 11.0348C8.66942 10.7867 8.69551 10.4867 8.75835 10.1415C8.93155 9.20091 9.25191 8.49489 9.6765 8.00992C10.1041 7.52495 10.6467 7.24525 11.3227 7.24299H26.4084L27.7266 0H12.2715C10.1118 0 8.22955 0.960923 6.77951 2.59403H6.77799Z"
								fill="#194BFF"
							/>
							<path
								d="M49.5055 0H29.1424L27.8242 7.24299H35.5204L31.037 31.866H36.0063L40.4897 7.24299H48.1873L49.5055 0Z"
								fill="#194BFF"
							/>
							<path
								d="M76.297 0L70.5522 31.5502L65.9781 22.241C67.1841 21.4312 68.2603 20.2718 69.1539 18.8101C70.2531 17.0124 71.0775 14.7611 71.5513 12.1559C71.7982 10.7957 71.9238 9.51442 71.9256 8.31444C71.9256 7.0693 71.7891 5.91214 71.5052 4.87452C71.2923 4.09857 70.998 3.39254 70.6238 2.779C70.0644 1.85868 69.3334 1.15491 68.4732 0.692494C67.6118 0.230079 66.6188 0 65.5044 0H50.4188L44.6172 31.866H49.5589L54.0423 7.24299H64.5556C64.9924 7.24299 65.3648 7.31291 65.6669 7.43472C65.8938 7.5272 66.0795 7.64676 66.2311 7.78661C66.458 7.99865 66.6097 8.24452 66.7213 8.57158C66.8335 8.90092 66.9039 9.32946 66.9039 9.89797C66.9039 10.4009 66.8475 11.0077 66.7182 11.7093C66.5575 12.5957 66.3397 13.3649 66.0764 14.0168C65.6791 14.9936 65.1841 15.7085 64.5865 16.1957C63.9872 16.683 63.2726 16.9469 62.4172 16.9492H53.4384L52.2321 23.5764H60.339L63.9611 31.866H75.4629L81.2678 0H76.297Z"
								fill="#194BFF"
							/>
							<path
								d="M104.132 11.3145C104.132 9.63401 103.936 8.07308 103.552 6.68133C103.266 5.63695 102.872 4.68956 102.385 3.85947C101.652 2.61434 100.706 1.64214 99.5977 0.990245C98.4882 0.338353 97.2173 0 95.8178 0H83.548L77.7461 31.866H90.3859C91.905 31.866 93.3949 31.4307 94.7986 30.6366C96.903 29.448 98.8145 27.4607 100.358 24.9253C101.9 22.3877 103.076 19.2974 103.697 15.889C103.988 14.2875 104.132 12.7558 104.132 11.3168V11.3145ZM95.9391 22.0786C94.6057 23.6869 92.9823 24.6253 91.3359 24.623H84.0078L87.1732 7.24073H94.8708C95.5496 7.24073 96.1472 7.39412 96.6579 7.66706C97.4241 8.07984 97.9974 8.74753 98.399 9.63401C98.7975 10.5228 99.0263 11.6528 99.0275 13.0153C99.0275 13.807 98.9492 14.6755 98.7793 15.607C98.3074 18.2033 97.2725 20.4703 95.9403 22.0763L95.9391 22.0786Z"
								fill="#194BFF"
							/>
							<path
								d="M110.727 18.8985H123.394L124.563 12.4766H111.896L110.727 18.8985Z"
								fill="#194BFF"
							/>
							<path
								d="M108.061 0L102.258 31.866H121.813L123.132 24.623H108.52L111.685 7.24299H126.269L127.587 0H108.061Z"
								fill="#194BFF"
							/>
						</g>
						<defs>
							<clipPath id="clip0_stride_header">
								<rect width="128" height="32" fill="white" />
							</clipPath>
						</defs>
					</svg>
				</Link>
				<nav className="hidden md:flex items-center gap-8">
					{siteConfig.header.links.map((link) => (
						<Link
							key={link.label}
							href={`/site${link.href}`}
							className="text-gray-600 hover:text-black text-[15px] font-medium no-underline transition-colors"
						>
							{link.label}
						</Link>
					))}
				</nav>
			</div>
			<div className="flex items-center gap-3 md:gap-6">
				<a
					href="#"
					className="hidden md:inline text-gray-900 font-semibold text-[15px] no-underline hover:text-black transition-colors"
					onClick={(e) => e.preventDefault()}
				>
					{siteConfig.header.auth.signIn}
				</a>
				<button className="bg-[#05051F] text-white px-5 py-2.5 rounded-[10px] text-[15px] font-semibold hover:bg-black transition-colors">
					{siteConfig.header.auth.cta}
				</button>

				{/* Floating Edit button — part of the header for clean positioning */}
				{editPageId && (
					<Link
						href={`/cms/edit/${editPageId}`}
						className="ml-2 flex items-center gap-2 bg-[#194BFF] text-white px-4 py-2 rounded-lg text-sm font-semibold no-underline hover:bg-[#0037DD] transition-colors shadow-lg"
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
							<path d="m15 5 4 4" />
						</svg>
						Edit
					</Link>
				)}
			</div>
		</header>
	);
}
