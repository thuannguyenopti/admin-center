"use client";
import Template from "./components/template";
import "./globals.css";
import {ThemeProvider} from "@/app/providers/ThemeProvider";
import {ProofreadingProvider} from "@/app/components/ai/ProofreadingProvider";
import {OpalGenerationProvider} from "@/app/context/OpalGenerationContext";
import {ExperimentResultsProvider} from "@/app/context/ExperimentResultsContext";
import {usePathname} from "next/navigation";
import {useSecretCode} from "@/app/hooks/useSecretCode";
import {SnowEffect} from "@/app/components/effects/SnowEffect";
import {NewYearEffect} from "@/app/components/effects/NewYearEffect";
import {HydrationErrorSuppressor} from "@/app/components/HydrationErrorSuppressor";
import {MigrationRunner} from "@/app/components/MigrationRunner";
import {useCmsNav} from "@/app/cms/navigation";
import {cmpNav} from "@/app/cmp/navigation";
import {useOpalNav} from "@/app/opal/navigation";
import {connectPlatformNav} from "@/app/connect-platform/navigation";
import {feHostingNav} from "@/app/fe-hosting/navigation";
import {webExperimentationNav} from "@/app/web-experimentation/navigation";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const path = usePathname() ?? "";
	const cmsNav = useCmsNav();
	const opalNav = useOpalNav();
	const brand = path.startsWith("/site") ? undefined : "v3";

	const structure = {
		cms: cmsNav,
		"connect-platform": connectPlatformNav,
		"fe-hosting": feHostingNav,
		opal: opalNav,
		cmp: cmpNav,
		"web-experimentation": webExperimentationNav,
	};

	const key: string = path.split("/")[1] ?? "";
	const menu = key ? structure[key as keyof typeof structure] : undefined;
	const {activeEffect} = useSecretCode();

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link
					href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap"
					rel="stylesheet"
				/>
				{/* figma-capture: remove after capture */}
				<script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
			</head>
			<body suppressHydrationWarning data-brand={brand}>
				<ThemeProvider>
					<ProofreadingProvider>
						<OpalGenerationProvider>
							<ExperimentResultsProvider>
								<HydrationErrorSuppressor />
								<MigrationRunner />
								<div data-brand={brand} style={{display: "contents"}}>
									{menu ? (
										<Template structure={menu}>{children}</Template>
									) : (
										children
									)}
								</div>
								{activeEffect === "snow" && <SnowEffect />}
								{activeEffect === "newyear" && <NewYearEffect />}
							</ExperimentResultsProvider>
						</OpalGenerationProvider>
					</ProofreadingProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
