import * as TablerIcons from "@tabler/icons-react";
import type { ComponentType, SVGProps } from "react";

type CompatIconProps = SVGProps<SVGSVGElement> & {
	size?: number | string;
	stroke?: number | string;
};

const fallbackIcon = TablerIcons.IconCircle;

// Custom SVG components matching the real @optimizely/axiom-icons (FontAwesome Pro Light)

function AxiomIconBook({ size = 16, width, height, style, className, ...rest }: CompatIconProps) {
	const w = width ?? size;
	const h = height ?? size;
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 448 512"
			width={w}
			height={h}
			fill="currentColor"
			style={style}
			className={className}
			{...rest}
		>
			<path d="M448 368v-320C448 21.49 426.5 0 400 0h-320C35.82 0 0 35.82 0 80V448c0 35.35 28.65 64 64 64h368c8.844 0 16-7.156 16-16S440.8 480 432 480H416v-66.95C434.6 406.4 448 388.8 448 368zM32 80C32 53.49 53.49 32 80 32H96v352H64c-11.71 0-22.55 3.389-32 8.9V80zM384 480H64c-17.64 0-32-14.36-32-32s14.36-32 32-32h320V480zM400 384H128V32h272C408.8 32 416 39.17 416 48v320C416 376.8 408.8 384 400 384zM352 128H192C183.2 128 176 135.2 176 144S183.2 160 192 160h160c8.844 0 16-7.156 16-16S360.8 128 352 128zM352 224H192C183.2 224 176 231.2 176 240S183.2 256 192 256h160c8.844 0 16-7.156 16-16S360.8 224 352 224z" />
		</svg>
	);
}

function AxiomIconClockRotateLeft({ size = 16, width, height, style, className, ...rest }: CompatIconProps) {
	const w = width ?? size;
	const h = height ?? size;
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 512 512"
			width={w}
			height={h}
			fill="currentColor"
			style={style}
			className={className}
			{...rest}
		>
			<path d="M256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512C172.2 512 97.87 471.8 51.19 409.6C45.88 402.5 47.31 392.5 54.37 387.2C61.44 381.9 71.47 383.3 76.78 390.4C117.7 444.8 182.7 480 256 480C379.7 480 480 379.7 480 256C480 132.3 379.7 32 256 32C166.7 32 89.51 84.3 53.55 160H144C152.8 160 160 167.2 160 176C160 184.8 152.8 192 144 192H16C7.164 192 0 184.8 0 176V48C0 39.16 7.164 32 16 32C24.84 32 32 39.16 32 48V131.1C75.66 53.29 159.6 0 256 0zM256 128C264.8 128 272 135.2 272 144V249.4L347.3 324.7C353.6 330.9 353.6 341.1 347.3 347.3C341.1 353.6 330.9 353.6 324.7 347.3L244.7 267.3C241.7 264.3 239.1 260.2 239.1 256V144C239.1 135.2 247.2 128 255.1 128H256z" />
		</svg>
	);
}

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
	// IconBook uses AxiomIconBook (custom SVG)
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
	// IconClockRotateLeft uses AxiomIconClockRotateLeft (custom SVG)
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
	IconInputText: ["IconLetterT", "IconTypography"],
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
export const IconBook = AxiomIconBook;
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
export const IconClockRotateLeft = AxiomIconClockRotateLeft;
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
