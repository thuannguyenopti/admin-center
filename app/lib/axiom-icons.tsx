// Backward-compat shim for code that imports from @/app/lib/axiom-icons.
// New code should import directly from @optimizely/axiom-icons.
// The real @optimizely/axiom-icons package is installed — no webpack alias needed.

export * from "@optimizely/axiom-icons";

// Compatibility aliases for icons renamed/missing in the Axiom package
export { IconHouse as IconHome } from "@optimizely/axiom-icons";
export { IconCircleQuestion as IconHelp } from "@optimizely/axiom-icons";
export { IconSparkles as IconWand } from "@optimizely/axiom-icons";
