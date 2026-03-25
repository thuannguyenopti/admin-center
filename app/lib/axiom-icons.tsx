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

function AxiomIconInputText({ size = 16, width, height, style, className, ...rest }: CompatIconProps) {
	const w = width ?? size;
	const h = height ?? size;
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 640 512"
			width={w}
			height={h}
			fill="currentColor"
			style={style}
			className={className}
			{...rest}
		>
			<path d="M176 160C182.5 160 188.4 163.1 190.9 170.1L254.9 330.1C258.1 338.3 254.1 347.6 245.9 350.9C237.7 354.1 228.4 350.1 225.1 341.9L216.4 319.1L216 320H136L135.6 319.1L126.9 341.9C123.6 350.1 114.3 354.1 106.1 350.9C97.85 347.6 93.86 338.3 97.14 330.1L161.1 170.1C163.6 163.1 169.5 160 176 160H176zM148.4 288H203.6L176 219.1L148.4 288zM288 176C288 167.2 295.2 160 304 160H360C390.9 160 416 185.1 416 216C416 228.1 412.2 239.3 405.6 248.5C421.5 258.4 432 275.1 432 296C432 326.9 406.9 352 376 352H304C295.2 352 288 344.8 288 336V176zM320 272V320H376C389.3 320 400 309.3 400 296C400 282.7 389.3 272 376 272H320zM360 240C373.3 240 384 229.3 384 216C384 202.7 373.3 192 360 192H320V240H360zM0 128C0 92.65 28.65 64 64 64H576C611.3 64 640 92.65 640 128V384C640 419.3 611.3 448 576 448H64C28.65 448 0 419.3 0 384V128zM32 128V384C32 401.7 46.33 416 64 416H576C593.7 416 608 401.7 608 384V128C608 110.3 593.7 96 576 96H64C46.33 96 32 110.3 32 128z" />
		</svg>
	);
}

function AxiomIconLightbulb({ size = 16, width, height, style, className, ...rest }: CompatIconProps) {
	const w = width ?? size;
	const h = height ?? size;
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 384 512"
			width={w}
			height={h}
			fill="currentColor"
			style={style}
			className={className}
			{...rest}
		>
			<path d="M255.9 415.1H128.1c-8.846 0-15.98 7.179-15.97 16.03L112.1 454.3c.0098 6.273 1.81 12.47 5.284 17.69l17.14 25.69c5.225 7.855 17.2 14.28 26.64 14.28h61.67c9.418 0 21.39-6.436 26.61-14.28l17.08-25.68c2.953-4.441 5.341-12.37 5.348-17.7l-.0521-22.33C271.8 423.2 264.7 415.1 255.9 415.1zM239.9 454.4l-16.11 24.45c-.4766 .4336-1.686 1.082-.8672 1.117l-60.29 .1172c-.4238-.1055-1.138-.2793-1.423-.2793c-.1406 0-.1348-.2265 0 0l-17.1-25.48l-.0098-6.37h95.94l.0039 5.179C239.9 453.6 239.7 454.4 239.9 454.4C239.9 454.4 239.8 454.5 239.9 454.4zM315.8 51.3c-33.33-33.22-78.22-52.47-124.3-51.28C94.7 .2944 16 79.89 16 177.4c0 42.9 15.47 84.34 43.55 116.6c13.33 15.31 35.84 49.59 43.73 76.02c1.078 8.687 8.844 14.62 17.64 13.72c8.703-.9687 14.98-8.968 14.11-17.65l-.6094-3.312c-10.31-34.97-36-72.84-50.73-89.77C60.67 246.5 48 212.6 48 177.4c0-81.24 63.05-145.1 143.5-145.3H192c38.13 0 74.05 14.87 101.2 41.93C320.8 101.5 336 138.2 336 177.4c0 35.18-12.67 69.15-35.67 95.62c-14.75 16.94-40.44 54.81-50.75 89.77l-.625 3.343c-1.047 8.749 4.938 17.59 13.67 18.69c.7813 .0938 1.531 .1562 2.281 .1562c7.797 0 14.36-5.124 15.36-13.12c8.344-28.25 30.86-62.52 44.2-77.84C352.5 261.7 368 220.3 368 177.4C368 129.7 349.5 84.89 315.8 51.3zM208 80.01c0-8.843-7.156-16-16-16c-61.75 0-112 50.24-112 111.1C80 184.8 87.16 192 96 192s16-7.158 16-16c0-44.1 35.88-79.1 80-79.1C200.8 96.01 208 88.86 208 80.01z" />
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
	// IconInputText uses AxiomIconInputText (custom SVG)
	IconLaptopMobile: ["IconDevices", "IconDeviceLaptop"],
	// IconLightbulb uses AxiomIconLightbulb (custom SVG)
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
export const IconInputText = AxiomIconInputText;
export const IconLaptopMobile = createIcon("IconLaptopMobile");
export const IconLightbulb = AxiomIconLightbulb;
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
