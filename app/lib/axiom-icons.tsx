import * as TablerIcons from "@tabler/icons-react";
import type { ComponentType, SVGProps } from "react";

type CompatIconProps = SVGProps<SVGSVGElement> & {
	size?: number | string;
	stroke?: number | string;
};

const fallbackIcon = TablerIcons.IconCircle;

// Custom SVG component matching the real @optimizely/axiom-icons IconAgent
function AxiomIconAgent({ size = 16, width, height, style, className, ...rest }: CompatIconProps) {
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
	IconArrowLeft: ["IconArrowLeft"],
	IconArrowRotateLeft: ["IconRotate", "IconHistory"],
	IconArrowsLeftRight: ["IconArrowsLeftRight"],
	IconArrowsRepeat: ["IconRepeat"],
	IconArrowsRotate: ["IconRefresh", "IconRotate"],
	IconArrowUp: ["IconArrowUp"],
	IconBars: ["IconMenu2", "IconMenu"],
	IconBook: ["IconBook"],
	IconBracketsCurly: ["IconBraces"],
	IconBracketsSquare: ["IconBrackets"],
	IconBrowser: ["IconBrowser"],
	IconCalendar: ["IconCalendar"],
	IconChartLine: ["IconChartLine"],
	IconCheckCircleSolid: ["IconCircleCheckFilled", "IconCircleCheck"],
	IconChevronLeft: ["IconChevronLeft"],
	IconChevronRight: ["IconChevronRight"],
	IconCircleCheck: ["IconCircleCheck"],
	IconCircleExclamation: ["IconAlertCircle"],
	IconCircleInfo: ["IconInfoCircle", "IconAlertCircle"],
	IconCirclePause: ["IconPlayerPause"],
	IconCirclePlus: ["IconCirclePlus"],
	IconCircleQuestion: ["IconHelpCircle"],
	IconCircleStop: ["IconPlayerStop", "IconCircleX"],
	IconClock: ["IconClock"],
	IconClockRotateLeft: ["IconHistory"],
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
	IconFileImport: ["IconFileImport", "IconFileArrowLeft"],
	IconGripVertical: ["IconGripVertical"],
	IconHandPointer: ["IconHandFinger", "IconPointer"],
	IconImage: ["IconPhoto", "IconImageInPicture"],
	IconInputNumeric: ["Icon123", "IconNumbers"],
	IconInputText: ["IconTypography", "IconLetterT"],
	IconLaptopMobile: ["IconDevices", "IconDeviceLaptop"],
	IconLink: ["IconLink"],
	IconList: ["IconList"],
	IconPaperPlaneTop: ["IconSend"],
	IconPen: ["IconPencil"],
	IconPlay: ["IconPlayerPlay"],
	IconPlus: ["IconPlus"],
	IconPopOut: ["IconExternalLink"],
	IconShieldCheck: ["IconShieldCheck"],
	IconSparkles: ["IconSparkles", "IconSparklesFilled"],
	IconSplit: ["IconLayoutColumns", "IconGitBranch"],
	IconTableCells: ["IconTable"],
	IconTag: ["IconTag"],
	IconTerminal: ["IconTerminal2", "IconTerminal"],
	IconThumbsDown: ["IconThumbDown"],
	IconThumbsUp: ["IconThumbUp"],
	IconToggleOff: ["IconToggleLeft"],
	IconTrashCan: ["IconTrash"],
	IconTriangleExclamation: ["IconAlertTriangle"],
	IconUserCheck: ["IconUserCheck"],
	IconUserGroup: ["IconUsersGroup", "IconUsers"],
	IconXmark: ["IconX"],
};

function resolveIcon(name: string): ComponentType<CompatIconProps> {
	const candidates = iconMap[name] ?? [];

	for (const candidate of candidates) {
		const component = (TablerIcons as unknown as Record<string, ComponentType<CompatIconProps> | undefined>)[
			candidate
		];
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
export const IconArrowLeft = createIcon("IconArrowLeft");
export const IconArrowRotateLeft = createIcon("IconArrowRotateLeft");
export const IconArrowsLeftRight = createIcon("IconArrowsLeftRight");
export const IconArrowsRepeat = createIcon("IconArrowsRepeat");
export const IconArrowsRotate = createIcon("IconArrowsRotate");
export const IconArrowUp = createIcon("IconArrowUp");
export const IconBars = createIcon("IconBars");
export const IconBook = createIcon("IconBook");
export const IconBracketsCurly = createIcon("IconBracketsCurly");
export const IconBracketsSquare = createIcon("IconBracketsSquare");
export const IconBrowser = createIcon("IconBrowser");
export const IconCalendar = createIcon("IconCalendar");
export const IconChartLine = createIcon("IconChartLine");
export const IconCheckCircleSolid = createIcon("IconCheckCircleSolid");
export const IconChevronLeft = createIcon("IconChevronLeft");
export const IconChevronRight = createIcon("IconChevronRight");
export const IconCircleCheck = createIcon("IconCircleCheck");
export const IconCircleExclamation = createIcon("IconCircleExclamation");
export const IconCircleInfo = createIcon("IconCircleInfo");
export const IconCirclePause = createIcon("IconCirclePause");
export const IconCirclePlus = createIcon("IconCirclePlus");
export const IconCircleQuestion = createIcon("IconCircleQuestion");
export const IconCircleStop = createIcon("IconCircleStop");
export const IconClock = createIcon("IconClock");
export const IconClockRotateLeft = createIcon("IconClockRotateLeft");
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
export const IconFileImport = createIcon("IconFileImport");
export const IconGripVertical = createIcon("IconGripVertical");
export const IconHandPointer = createIcon("IconHandPointer");
export const IconImage = createIcon("IconImage");
export const IconInputNumeric = createIcon("IconInputNumeric");
export const IconInputText = createIcon("IconInputText");
export const IconLaptopMobile = createIcon("IconLaptopMobile");
export const IconLink = createIcon("IconLink");
export const IconList = createIcon("IconList");
export const IconPaperPlaneTop = createIcon("IconPaperPlaneTop");
export const IconPen = createIcon("IconPen");
export const IconPlay = createIcon("IconPlay");
export const IconPlus = createIcon("IconPlus");
export const IconPopOut = createIcon("IconPopOut");
export const IconShieldCheck = createIcon("IconShieldCheck");
export const IconSparkles = createIcon("IconSparkles");
export const IconSplit = createIcon("IconSplit");
export const IconTableCells = createIcon("IconTableCells");
export const IconTag = createIcon("IconTag");
export const IconTerminal = createIcon("IconTerminal");
export const IconThumbsDown = createIcon("IconThumbsDown");
export const IconThumbsUp = createIcon("IconThumbsUp");
export const IconToggleOff = createIcon("IconToggleOff");
export const IconTrashCan = createIcon("IconTrashCan");
export const IconTriangleExclamation = createIcon("IconTriangleExclamation");
export const IconUserCheck = createIcon("IconUserCheck");
export const IconUserGroup = createIcon("IconUserGroup");
export const IconXmark = createIcon("IconXmark");
