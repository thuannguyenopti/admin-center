// Backward-compat shim for code that imports from @/app/lib/axiom-icons.
// New code should import directly from @optimizely/axiom-icons.
// The real @optimizely/axiom-icons package is installed — no webpack alias needed.

export * from "@optimizely/axiom-icons";

// Compatibility aliases for icons renamed/missing in the Axiom package
export { IconHouse as IconHome } from "@optimizely/axiom-icons";
export { IconCircleQuestion as IconHelp } from "@optimizely/axiom-icons";
export { IconSparkles as IconWand } from "@optimizely/axiom-icons";
export { IconArrowsLeftRight as IconArrowRightArrowLeft } from "@optimizely/axiom-icons";

// Sort caret icons — not in Axiom package, Tabler fallbacks
export { IconCaretUp, IconCaretDown, IconCaretUpDown } from "@tabler/icons-react";

// Notification icons — aliases to Axiom equivalents
export { IconXmark as IconX } from "@optimizely/axiom-icons";
export { IconCheckDouble as IconChecks } from "@optimizely/axiom-icons";
export { IconBullhorn as IconSpeakerphone } from "@optimizely/axiom-icons";
export { IconSpinner as IconLoader2 } from "@optimizely/axiom-icons";

// Icons not yet in Axiom package — Tabler fallbacks
export { IconPlug, IconTicket, IconMicrophone, IconBuilding, IconMoon, IconApps, IconTarget, IconTemplate, IconFileDownload, IconActivity, IconCloud, IconWebhook, IconFileText, IconTools } from "@tabler/icons-react";

// Brand icons — Tabler fallbacks (Axiom package only ships IconGoogle)
export {
	IconBrandFigma,
	IconBrandSlack,
	IconBrandNotion,
	IconBrandAirtable,
	IconBrandGithub,
	IconBrandAsana,
	IconBrandGoogle,
	IconBrandTeams,
} from "@tabler/icons-react";

// Axiom rename aliases (icon exists under a different name)
export { IconSunBright as IconSunFilled } from "@optimizely/axiom-icons";
export { IconDesktop as IconDeviceDesktop } from "@optimizely/axiom-icons";
export { IconCodeBranch as IconGitBranch } from "@optimizely/axiom-icons";
export { IconTrashCan as IconTrash } from "@optimizely/axiom-icons";
export { IconShareNodes as IconShare } from "@optimizely/axiom-icons";
export { IconEnvelope as IconMail } from "@optimizely/axiom-icons";

// Custom inline icons (not in Axiom or Tabler)
export function IconTeamsCustom({ size = 18, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
	const w = size;
	const h = Math.round((size * 16) / 20);
	return (
		<svg width={w} height={h} viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path d="M5.33089 5.375C4.55939 5.375 3.86771 4.96484 3.46865 4.28125C3.09621 3.625 3.09621 2.77734 3.46865 2.09375C3.86771 1.4375 4.55939 1 5.33089 1C6.07579 1 6.76748 1.4375 7.16653 2.09375C7.53898 2.77734 7.53898 3.625 7.16653 4.28125C6.76748 4.96484 6.07579 5.375 5.33089 5.375ZM15.121 5.375C14.3495 5.375 13.6578 4.96484 13.2587 4.28125C12.8863 3.625 12.8863 2.77734 13.2587 2.09375C13.6578 1.4375 14.3495 1 15.121 1C15.8659 1 16.5575 1.4375 16.9566 2.09375C17.329 2.77734 17.329 3.625 16.9566 4.28125C16.5575 4.96484 15.8659 5.375 15.121 5.375ZM1.5 9.17578C1.5 7.5625 2.75036 6.25 4.31996 6.25H5.46391C5.88957 6.25 6.28862 6.35938 6.63446 6.52344C6.60786 6.71484 6.60786 6.93359 6.60786 7.125C6.60786 8.19141 7.03351 9.12109 7.75181 9.75H2.05867C1.73943 9.75 1.5 9.50391 1.5 9.17578ZM12.2478 9.75C12.9661 9.12109 13.3917 8.19141 13.3917 7.125C13.3917 6.93359 13.3917 6.71484 13.3651 6.52344C13.711 6.35938 14.11 6.25 14.5357 6.25H15.6796C17.2492 6.25 18.5262 7.5625 18.4996 9.17578C18.4996 9.50391 18.2602 9.75 17.9409 9.75H12.2478ZM10.0131 5.8125C9.53424 5.8125 9.13518 6.08594 8.89575 6.46875C8.65632 6.87891 8.65632 7.39844 8.89575 7.78125C9.13518 8.19141 9.53424 8.4375 10.0131 8.4375C10.4654 8.4375 10.8644 8.19141 11.1038 7.78125C11.3433 7.39844 11.3433 6.87891 11.1038 6.46875C10.8644 6.08594 10.4654 5.8125 10.0131 5.8125ZM10.0131 9.75C9.08198 9.75 8.25727 9.25781 7.77841 8.4375C7.32615 7.64453 7.32615 6.63281 7.77841 5.8125C8.25727 5.01953 9.08198 4.5 10.0131 4.5C10.9176 4.5 11.7423 5.01953 12.2212 5.8125C12.6734 6.63281 12.6734 7.64453 12.2212 8.4375C11.7423 9.25781 10.9176 9.75 10.0131 9.75ZM8.4435 11.9375C7.37936 11.9375 6.50144 12.7031 6.23541 13.6875H13.7642C13.4981 12.7031 12.6202 11.9375 11.5561 11.9375H8.4435ZM8.4435 10.625H11.5561C13.5248 10.625 15.121 12.2656 15.121 14.2891C15.121 14.6992 14.8017 15 14.4027 15H5.59693C5.19788 15 4.90524 14.6719 4.90524 14.2891C4.90524 12.2656 6.47484 10.625 8.4435 10.625Z" fill="currentColor"/>
		</svg>
	);
}
