import * as TablerIcons from "@tabler/icons-react";
import type { ComponentType, SVGProps } from "react";

type CompatIconProps = SVGProps<SVGSVGElement> & {
	size?: number | string;
	stroke?: number | string;
};

const fallbackIcon = TablerIcons.IconCircle;

const iconMap: Record<string, string[]> = {
	IconAgent: ["IconSparkles"],
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

export const IconAgent = createIcon("IconAgent");
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
