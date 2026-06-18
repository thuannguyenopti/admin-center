import {ReactNode, isValidElement} from "react";
import {Badge, Box, Avatar, Tooltip} from "@optiaxiom/react";
import {Text} from "./Text";
import {Button} from "./Button";
import {
	IconDots as IconMenu,
	IconInfoCircle,
	IconCaretUp,
	IconCaretDown,
	IconCaretUpDown,
	IconCaretDownFilled,
	IconCaretUpFilled,
	IconCaretUpDownFilled,
} from "@tabler/icons-react";

export const Table = ({
	children,
	style,
	className,
}: {
	children: ReactNode;
	style?: React.CSSProperties;
	className?: string;
}) => {
	return (
		<div
			className={`rounded-[6px] border ${className || ""}`}
			style={{
				borderColor: "var(--ax-colors-border-tertiary)",
				background: "var(--ax-colors-bg-default)",
				...style,
			}}
		>
			<table className="border-collapse w-full">{children}</table>
		</div>
	);
};

import {useRouter} from "next/navigation";
export const Tr = ({
	children,
	url,
	onClick,
	style,
	className,
	...props
}: {
	children: ReactNode;
	url?: string;
	onClick?: () => void;
	style?: React.CSSProperties;
	className?: string;
	[key: string]: any;
}) => {
	const router = useRouter();
	const rowClick = (href: string) => {
		router.push(`${href}`);
	};

	return (
		<tr
			onClick={url ? () => rowClick(url) : onClick ? onClick : undefined}
			className={
				"relative" +
				(url || onClick
					? " cursor-pointer hover:bg-[var(--ax-colors-bg-default-hovered)]"
					: "") +
				(className ? ` ${className}` : "")
			}
			style={style}
			{...props}
		>
			{children}
		</tr>
	);
};
export const Th = ({
	children,
	align,
	style,
	className,
	onClick,
	sortDirection,
	onSort,
	tooltip,
}: {
	children?: ReactNode;
	align?: any;
	style?: React.CSSProperties;
	className?: string;
	onClick?: () => void;
	sortDirection?: "asc" | "desc" | null;
	onSort?: () => void;
	tooltip?: string;
}) => {
	const interactive = !!(onSort || onClick);
	return (
		<th
			className={`text-left px-4 text-xs font-normal py-2 align-middle text-[var(--ax-colors-fg-tertiary)] ${interactive ? "cursor-pointer select-none hover:text-[var(--ax-colors-fg-secondary)]" : ""} ${className || ""}`}
			style={{
				textAlign: align,
				...style,
			}}
			onClick={onSort || onClick}
		>
			<span className="inline-flex items-center gap-1">
				{children}
				{onSort &&
					(sortDirection === "asc" ? (
						<IconCaretUpFilled size={14} aria-hidden />
					) : sortDirection === "desc" ? (
						<IconCaretDownFilled size={14} aria-hidden />
					) : (
						<IconCaretUpDownFilled size={14} aria-hidden />
					))}
				{tooltip && (
					<Tooltip content={tooltip}>
						<span className="inline-flex" onClick={(e) => e.stopPropagation()}>
							<IconInfoCircle size={14} />
						</span>
					</Tooltip>
				)}
			</span>
		</th>
	);
};

export const Td = ({
	children,
	type,
	description,
	data,
	width,
	style,
	className,
}: {
	children?: ReactNode;
	type?: "header" | "badge" | "avatar" | "button" | "numeric" | "raw";
	description?: string;
	data?: any;
	width?: string | number;
	style?: React.CSSProperties;
	className?: string;
}) => {
	return (
		<td
			className={`py-2 px-4 border-t align-middle ${className || ""}`}
			style={{
				width: type === "button" ? "56px" : width,
				borderColor: "var(--ax-colors-border-tertiary)",
				...style,
			}}
		>
			{type === undefined && (
				<>
					{isValidElement(children) && !Array.isArray(children) ? (
						children
					) : (
						<Box color="fg.default">{children}</Box>
					)}
					{description && (
						<Text fontSize="sm" color="fg.secondary">
							{description}
						</Text>
					)}
				</>
			)}
			{type === "header" && (
				<>
					<Text asChild color="fg.default" fontWeight="500">
						<span>{children}</span>
					</Text>
					{description && (
						<Text fontSize="sm" color="fg.tertiary">
							{description}
						</Text>
					)}
				</>
			)}
			{type === "badge" && (
				<Box style={{height: "20px", marginTop: "-4px"}}>
					<Badge intent={data}>{children}</Badge>
				</Box>
			)}
			{type === "avatar" && (
				<Box style={{height: "20px", marginTop: "-6px"}}>
					<Tooltip content={children}>
						<Avatar src={data} size="md" name={children as string} />
					</Tooltip>
				</Box>
			)}
			{type === "button" && (
				<Box
					textAlign="end"
					display="flex"
					alignItems="center"
					justifyContent="end"
					style={{height: "20px"}}
				>
					{children ? (
						children
					) : (
						<Button
							onClick={data}
							aria-label={"Actions"}
							size="md"
							icon={<IconMenu />}
							appearance="subtle"
						/>
					)}
				</Box>
			)}
			{type === "numeric" && (
				<Text color="fg.default" textAlign="end">
					{children}
				</Text>
			)}
			{type === "raw" && children}
		</td>
	);
};
