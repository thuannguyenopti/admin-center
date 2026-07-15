import * as TablerIcons from "@tabler/icons-react";
import Head from "next/head";
import type {ComponentType, SVGProps} from "react";

type CompatIconProps = Omit<SVGProps<SVGSVGElement>, "stroke"> & {
	size?: number | string;
	stroke?: number | string;
};

const fallbackIcon = TablerIcons.IconCircle;

// Custom SVG component matching the real @optimizely/axiom-icons IconAgent
function AxiomIconAgent({
	size = 16,
	width,
	height,
	style,
	className,
	stroke: _stroke,
	...rest
}: CompatIconProps) {
	const w = width ?? size;
	const h = height ?? size;
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 16"
			width={w}
			height={h}
			fill="currentColor"
			style={style}
			className={className}
			{...rest}
		>
			<path d="M9.434 6.727c.15-.043.359-.005.505.051l7.983 2.76a.659.659 0 0 1 .38.414.714.714 0 0 1-.5.896l-3.114 1.127c-.744.238-.766.644-.766.644l-.965 3a.628.628 0 0 1-.424.35c-.393.112-.745-.084-.857-.478l-2.733-7.84c-.111-.393.097-.813.49-.924ZM14.774 0a2.01 2.01 0 0 1 2.016 2.017v3.528c0 .252-.252.504-.504.504a.518.518 0 0 1-.504-.504V2.017c0-.567-.472-1.009-1.008-1.01H3.686a.996.996 0 0 0-1.01 1.01v11.088c0 .536.443 1.008 1.01 1.008h3.528c.252 0 .504.22.504.504 0 .252-.252.504-.504.504H3.686a2.01 2.01 0 0 1-2.017-2.016V2.018C1.669.883 2.551 0 3.686 0h11.088Zm-2.45 14.291.63-1.956c.008-.03.014-.064.025-.098.046-.139.122-.297.242-.457.24-.32.612-.582 1.126-.753l2.344-.85L10.096 7.9l2.228 6.392ZM4.55 8.01l2.15.676c.269.084.43.371.346.64a.518.518 0 0 1-.64.345l-2.151-.676c-.269-.084-.407-.394-.345-.64.085-.27.394-.408.64-.345Zm1.503-3.615a.518.518 0 0 1 .713-.012l1.45 1.401c.18.175.186.53.012.712a.518.518 0 0 1-.713.013l-1.45-1.402a.498.498 0 0 1-.012-.712Zm3.93-2.146a.518.518 0 0 1 .652.323l.749 2.126a.518.518 0 0 1-.322.653.518.518 0 0 1-.653-.324L9.66 2.901c-.07-.243.058-.558.323-.652Z" />
		</svg>
	);
}

const iconMap: Record<string, string[]> = {
	IconAgent: ["IconSparkles"], // fallback only; IconAgent is overridden below
	IconAlignLeft: ["IconAlignLeft"],
	IconAngleDown: ["IconChevronDown"],
	IconArrowLeft: ["IconArrowLeft"],
	IconArrowRotateLeft: ["IconRotate", "IconHistory"],
	IconArrowRotateRight: ["IconRotateClockwise", "IconRefresh"],
	IconArrowUpRightFromSquare: ["IconExternalLink", "IconArrowUpRight"],
	IconArrowsLeftRight: ["IconArrowsLeftRight"],
	IconArrowsMaximize: ["IconArrowsMaximize"],
	IconArrowsMinimize: ["IconArrowsMinimize"],
	IconArrowsRepeat: ["IconRepeat"],
	IconArrowsRotate: ["IconRefresh", "IconRotate"],
	IconArrowUp: ["IconArrowUp"],
	IconBars: ["IconMenu2", "IconMenu"],
	IconBell: ["IconBell"],
	IconBold: ["IconBold"],
	IconBolt: ["IconBolt"],
	IconBook: ["IconBook"],
	IconBracketsCurly: ["IconBraces"],
	IconBracketsSquare: ["IconBrackets"],
	IconBrowser: ["IconBrowser"],
	IconCalendar: ["IconCalendar"],
	IconChartColumn: ["IconChartBar"],
	IconChartLine: ["IconChartLine"],
	IconCheck: ["IconCheck"],
	IconCheckCircleSolid: ["IconCircleCheckFilled", "IconCircleCheck"],
	IconChevronDown: ["IconChevronDown"],
	IconChevronLeft: ["IconChevronLeft"],
	IconChevronRight: ["IconChevronRight"],
	IconCircleCheck: ["IconCircleCheck"],
	IconCircleDot: ["IconCircleDot"],
	IconCircleExclamation: ["IconAlertCircle"],
	IconCircleInfo: ["IconInfoCircle", "IconAlertCircle"],
	IconCirclePause: ["IconPlayerPause"],
	IconCirclePlus: ["IconCirclePlus"],
	IconCircleQuestion: ["IconHelpCircle"],
	IconCircleStop: ["IconPlayerStop", "IconCircleX"],
	IconClock: ["IconClock"],
	IconClockRotateLeft: ["IconHistory"],
	IconCode: ["IconCode"],
	IconCodeBranch: ["IconGitBranch", "IconCodeDots"],
	IconColumns3: ["IconColumns3"],
	IconComments: ["IconMessages"],
	IconCopy: ["IconCopy"],
	IconEllipsisSolid: ["IconDots"],
	IconEllipsisStroke: ["IconDots"],
	IconEnvelope: ["IconMail"],
	IconEye: ["IconEye"],
	IconEyeSlash: ["IconEyeOff"],
	IconFile: ["IconFile"],
	IconFileArrowUp: ["IconFileUpload", "IconUpload"],
	IconFileImage: ["IconPhoto", "IconFileTypeJpg"],
	IconFileImport: ["IconFileImport", "IconFileArrowLeft"],
	IconFileLines: ["IconFileText"],
	IconFilePdf: ["IconFileTypePdf"],
	IconFileSpreadsheet: ["IconFileTypeXls", "IconTable"],
	IconFileWord: ["IconFileTypeDoc"],
	IconFloppyDisk: ["IconDeviceFloppy"],
	IconFolder: ["IconFolder"],
	IconFolderArrowDown: ["IconFolderDown"],
	IconFolderImage: ["IconFolderOpen", "IconFolder"],
	IconFolderOpen: ["IconFolderOpen"],
	IconGear: ["IconSettings"],
	IconGrid: ["IconGrid3x3", "IconLayoutGrid"],
	IconGrid2Plus: ["IconLayoutGridAdd", "IconGridDots"],
	IconGripVertical: ["IconGripVertical"],
	IconHandPointer: ["IconHandFinger", "IconPointer"],
	IconHashtag: ["IconHash"],
	IconHorizontalRule: ["IconSeparatorHorizontal", "IconMinus"],
	IconImage: ["IconPhoto", "IconImageInPicture"],
	IconInboxFull: ["IconInbox"],
	IconInputNumeric: ["Icon123", "IconNumbers"],
	IconInputText: ["IconTypography", "IconLetterT"],
	IconItalic: ["IconItalic"],
	IconLaptopMobile: ["IconDevices", "IconDeviceLaptop"],
	IconLink: ["IconLink"],
	IconList: ["IconList"],
	IconListOl: ["IconListNumbers"],
	IconListUl: ["IconList"],
	IconLocationDot: ["IconMapPin"],
	IconLock: ["IconLock"],
	IconMegaphone: ["IconSpeakerphone"],
	IconPaintRoller: ["IconPaint"],
	IconPaperPlaneTop: ["IconSend"],
	IconPen: ["IconPencil"],
	IconPenLine: ["IconPencil"],
	IconPlay: ["IconPlayerPlay"],
	IconPlus: ["IconPlus"],
	IconPopOut: ["IconExternalLink"],
	IconPresentationScreen: ["IconPresentation"],
	IconQuoteRight: ["IconBlockquote"],
	IconShareNodes: ["IconShare"],
	IconShieldCheck: ["IconShieldCheck"],
	IconSortSolid: ["IconSelector", "IconArrowsUpDown"],
	IconSparkles: ["IconSparkles", "IconSparklesFilled"],
	IconSpinner: ["IconLoader"],
	IconSplit: ["IconLayoutColumns", "IconGitBranch"],
	IconStrikethrough: ["IconStrikethrough"],
	IconTableCells: ["IconTable"],
	IconTag: ["IconTag"],
	IconTerminal: ["IconTerminal2", "IconTerminal"],
	IconText: ["IconLetterT", "IconTypography"],
	IconThumbsDown: ["IconThumbDown"],
	IconThumbsUp: ["IconThumbUp"],
	IconThumbtack: ["IconPin"],
	IconToggleOff: ["IconToggleLeft"],
	IconTrashCan: ["IconTrash"],
	IconTriangleExclamation: ["IconAlertTriangle"],
	IconUser: ["IconUser"],
	IconUserCheck: ["IconUserCheck"],
	IconUserGroup: ["IconUsersGroup", "IconUsers"],
	IconUsers: ["IconUsers"],
	IconXmark: ["IconX"],
};

function resolveIcon(name: string): ComponentType<CompatIconProps> {
	const candidates = iconMap[name] ?? [];

	for (const candidate of candidates) {
		const component = (
			TablerIcons as unknown as Record<string, ComponentType<CompatIconProps> | undefined>
		)[candidate];
		if (component) {
			return component;
		}
	}

	return fallbackIcon as ComponentType<CompatIconProps>;
}

function createIcon(name: string) {
	const CompatIcon = (props: CompatIconProps) => {
		const Component = resolveIcon(name);
		return <Component {...props} />;
	};

	CompatIcon.displayName = name;
	return CompatIcon;
}

export const IconAgent = AxiomIconAgent;
export const IconAlignLeft = createIcon("IconAlignLeft");
export const IconAngleDown = createIcon("IconAngleDown");
export const IconArrowLeft = createIcon("IconArrowLeft");
export const IconArrowRotateLeft = createIcon("IconArrowRotateLeft");
export const IconArrowRotateRight = createIcon("IconArrowRotateRight");
export const IconArrowUpRightFromSquare = createIcon("IconArrowUpRightFromSquare");
export const IconArrowsLeftRight = createIcon("IconArrowsLeftRight");
export const IconArrowsMaximize = createIcon("IconArrowsMaximize");
export const IconArrowsMinimize = createIcon("IconArrowsMinimize");
export const IconArrowsRepeat = createIcon("IconArrowsRepeat");
export const IconArrowsRotate = createIcon("IconArrowsRotate");
export const IconArrowUp = createIcon("IconArrowUp");
export const IconBars = createIcon("IconBars");
export const IconBell = createIcon("IconBell");
export const IconBold = createIcon("IconBold");
export const IconBook = createIcon("IconBook");
export const IconBracketsCurly = createIcon("IconBracketsCurly");
export const IconBracketsSquare = createIcon("IconBracketsSquare");
export const IconBrowser = createIcon("IconBrowser");
export const IconCalendar = createIcon("IconCalendar");
export const IconCaretDown = TablerIcons.IconCaretDown;
export const IconCaretUp = TablerIcons.IconCaretUp;
export const IconCaretUpDown = TablerIcons.IconCaretUpDown;
export const IconChartColumn = createIcon("IconChartColumn");
export const IconChartLine = createIcon("IconChartLine");
export const IconCheck = createIcon("IconCheck");
export const IconCheckCircleSolid = createIcon("IconCheckCircleSolid");
export const IconChevronDown = createIcon("IconChevronDown");
export const IconChevronLeft = createIcon("IconChevronLeft");
export const IconChevronRight = createIcon("IconChevronRight");
export const IconCircleCheck = createIcon("IconCircleCheck");
export const IconCircleDot = createIcon("IconCircleDot");
export const IconCircleExclamation = createIcon("IconCircleExclamation");
export const IconCircleInfo = createIcon("IconCircleInfo");
export const IconCirclePause = createIcon("IconCirclePause");
export const IconCirclePlus = createIcon("IconCirclePlus");
export const IconCircleQuestion = createIcon("IconCircleQuestion");
export const IconCircleStop = createIcon("IconCircleStop");
export const IconClock = createIcon("IconClock");
export const IconClockRotateLeft = createIcon("IconClockRotateLeft");
export const IconCode = createIcon("IconCode");
export const IconCodeBranch = createIcon("IconCodeBranch");
export const IconColumns3 = createIcon("IconColumns3");
export const IconComments = createIcon("IconComments");
export const IconCopy = createIcon("IconCopy");
export const IconEllipsisSolid = createIcon("IconEllipsisSolid");
export const IconEllipsisStroke = createIcon("IconEllipsisStroke");
export const IconEnvelope = createIcon("IconEnvelope");
export const IconEye = createIcon("IconEye");
export const IconEyeSlash = createIcon("IconEyeSlash");
export const IconFile = createIcon("IconFile");
export const IconFileArrowUp = createIcon("IconFileArrowUp");
export const IconFileImage = createIcon("IconFileImage");
export const IconFileImport = createIcon("IconFileImport");
export const IconFileLines = createIcon("IconFileLines");
export const IconFilePdf = createIcon("IconFilePdf");
export const IconFileSpreadsheet = createIcon("IconFileSpreadsheet");
export const IconFileWord = createIcon("IconFileWord");
export const IconFloppyDisk = createIcon("IconFloppyDisk");
export const IconBolt = createIcon("IconBolt");
export const IconFolder = createIcon("IconFolder");
export const IconFolderArrowDown = createIcon("IconFolderArrowDown");
export const IconFolderImage = createIcon("IconFolderImage");
export const IconFolderOpen = createIcon("IconFolderOpen");
export const IconGear = createIcon("IconGear");
export const IconGrid = createIcon("IconGrid");
export const IconGrid2Plus = createIcon("IconGrid2Plus");
export const IconGripVertical = createIcon("IconGripVertical");
export const IconHandPointer = createIcon("IconHandPointer");
export const IconHashtag = createIcon("IconHashtag");
export const IconHorizontalRule = createIcon("IconHorizontalRule");
export const IconImage = createIcon("IconImage");
export const IconInboxFull = createIcon("IconInboxFull");
export const IconInputNumeric = createIcon("IconInputNumeric");
export const IconInputText = createIcon("IconInputText");
export const IconItalic = createIcon("IconItalic");
export const IconLaptopMobile = createIcon("IconLaptopMobile");
export const IconLink = createIcon("IconLink");
export const IconList = createIcon("IconList");
export const IconListOl = createIcon("IconListOl");
export const IconListUl = createIcon("IconListUl");
export const IconLocationDot = createIcon("IconLocationDot");
export const IconLock = createIcon("IconLock");
export const IconMegaphone = createIcon("IconMegaphone");
export const IconPaintRoller = createIcon("IconPaintRoller");
export const IconPaperPlaneTop = createIcon("IconPaperPlaneTop");
export const IconPen = createIcon("IconPen");
export const IconPenLine = createIcon("IconPenLine");
export const IconPlay = createIcon("IconPlay");
export const IconPlus = createIcon("IconPlus");
export const IconPopOut = createIcon("IconPopOut");
export const IconPresentationScreen = createIcon("IconPresentationScreen");
export const IconQuoteRight = createIcon("IconQuoteRight");
export const IconShareNodes = createIcon("IconShareNodes");
export const IconShieldCheck = createIcon("IconShieldCheck");
export const IconSortSolid = createIcon("IconSortSolid");
export const IconSparkles = createIcon("IconSparkles");
export const IconSpinner = createIcon("IconSpinner");
export const IconSplit = createIcon("IconSplit");
export const IconStrikethrough = createIcon("IconStrikethrough");
export const IconTableCells = createIcon("IconTableCells");
export const IconTag = createIcon("IconTag");
export const IconTerminal = createIcon("IconTerminal");
export const IconText = createIcon("IconText");
export const IconThumbsDown = createIcon("IconThumbsDown");
export const IconThumbsUp = createIcon("IconThumbsUp");
export const IconThumbtack = createIcon("IconThumbtack");
export const IconToggleOff = createIcon("IconToggleOff");
export const IconTrashCan = createIcon("IconTrashCan");
export const IconTriangleExclamation = createIcon("IconTriangleExclamation");
export const IconUser = createIcon("IconUser");
export const IconUserCheck = createIcon("IconUserCheck");
export const IconUserGroup = createIcon("IconUserGroup");
export const IconUsers = createIcon("IconUsers");
export const IconXmark = createIcon("IconXmark");

// Icons not yet in Axiom package — Tabler fallbacks
export {IconPlug, IconTicket, IconMicrophone} from "@tabler/icons-react";
export {IconFaceId} from "@tabler/icons-react";

// Additional Axiom icons — Tabler fallback mappings
export {IconUpload, IconDownload, IconSearch, IconChevronUp} from "@tabler/icons-react";
export {IconGrid3x3 as IconGrid2} from "@tabler/icons-react";
export {IconArrowsLeftRight as IconArrowRightArrowLeft} from "@tabler/icons-react";
export {IconCircleCheckFilled as IconCircleCheckSolid} from "@tabler/icons-react";
export {IconTool as IconScrewdriverWrench} from "@tabler/icons-react";
export {IconUser as IconCircleUser} from "@tabler/icons-react";
export {IconFile as IconFileZipper} from "@tabler/icons-react";
export {IconBuilding} from "@tabler/icons-react";
export {IconAt} from "@tabler/icons-react";

// Brand icons — Tabler fallbacks (Axiom package only ships IconGoogle)
export {
	IconBrandFigma,
	IconBrandSlack,
	IconBrandNotion,
	IconBrandAirtable,
	IconBrandGithub,
	IconBrandAsana,
	IconBrandGoogle,
} from "@tabler/icons-react";

// Axiom rename aliases (icon exists under a different name)
export {IconSunBright as IconSunFilled} from "@optimizely/axiom-icons";
export {IconDesktop as IconDeviceDesktop} from "@optimizely/axiom-icons";
export {IconCodeBranch as IconGitBranch} from "@optimizely/axiom-icons";
export {IconTrashCan as IconTrash} from "@optimizely/axiom-icons";
export {IconShareNodes as IconShare} from "@optimizely/axiom-icons";
export {IconEnvelope as IconMail} from "@optimizely/axiom-icons";

// Tabler passthroughs — icons with no curated Axiom mapping yet. Kept under
// Tabler names so callers stay working; map each to an @optimizely/axiom-icons
// equivalent above as the design system catches up.
export {
	IconAbc,
	IconActivity,
	IconAdjustmentsHorizontal,
	IconAnalyze,
	IconApi,
	IconApps,
	IconArchive,
	IconArrowBackUp,
	IconArrowBarBoth,
	IconArrowDown,
	IconArrowForwardUp,
	IconArrowRight,
	IconArrowsExchange,
	IconArrowsSort,
	IconArticle,
	IconBlocks,
	IconBox,
	IconBrain,
	IconBrandFacebook,
	IconBrandProducthunt,
	IconBrandTwitter,
	IconBrandWordpress,
	IconBrandYoutube,
	IconBroadcast,
	IconBulb,
	IconCalendarBolt,
	IconCalendarCheck,
	IconCalendarX,
	IconCategory,
	IconChecklist,
	IconChecks,
	IconCircle,
	IconClipboard,
	IconCloud,
	IconCloudDownload,
	IconCongruentTo,
	IconCursorText,
	IconCut,
	IconEdit,
	IconFileCheck,
	IconFileDownload,
	IconFilePlus,
	IconFileTypeCsv,
	IconFilter,
	IconFlask,
	IconFolderPlus,
	IconForms,
	IconGitFork,
	IconGlobe,
	IconGlobeFilled,
	IconHeading,
	IconHelp,
	IconHome,
	IconKey,
	IconLayout,
	IconLayout2,
	IconLayoutGrid,
	IconLayoutList,
	IconLayoutNavbar,
	IconListDetails,
	IconListTree,
	IconLoader2,
	IconMaximize,
	IconMessage,
	IconMinus,
	IconMoon,
	IconNews,
	IconPackage,
	IconPalette,
	IconPhotoPin,
	IconPilcrow,
	IconPinEnd,
	IconPinInvoke,
	IconPinned,
	IconPlugConnected,
	IconPower,
	IconPuzzle,
	IconQuote,
	IconRectangle,
	IconReport,
	IconReportSearch,
	IconRestore,
	IconRocket,
	IconRowInsertBottom,
	IconRowInsertTop,
	IconSection,
	IconSend2,
	IconSendOff,
	IconServer,
	IconSettingsAutomation,
	IconSettingsSearch,
	IconShare2,
	IconShare3,
	IconShieldOff,
	IconShieldPlus,
	IconShoppingBag,
	IconShoppingCart,
	IconSquare,
	IconStack2,
	IconStar,
	IconTarget,
	IconTemplate,
	IconTrendingDown,
	IconTrendingUp,
	IconUserPlus,
	IconVersions,
	IconVideo,
	IconWand,
	IconWebhook,
	IconWifi,
	IconWifiOff,
	IconWorld,
	IconWorldBolt,
	IconWorldCheck,
	IconWorldOff,
	IconWorldX,
} from "@tabler/icons-react";
