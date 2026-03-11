"use client";

import {ReactNode, memo} from "react";
import {AxiomProvider} from "@optiaxiom/react";
import {ThemeControllerProvider} from "@/app/hooks/useTheme";

type ThemeProviderProps = {
	children: ReactNode;
};

function ThemeProviderComponent({children}: ThemeProviderProps) {
	return (
		<ThemeControllerProvider>
			<AxiomProvider>{children}</AxiomProvider>
		</ThemeControllerProvider>
	);
}

export const ThemeProvider = memo(ThemeProviderComponent);
