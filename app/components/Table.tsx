import {ReactNode, isValidElement} from "react";
import {Badge, Box, Avatar, Tooltip, TableRow, TableHeaderCell} from "@optiaxiom/react";
import {Text} from "./Text";
import {Button} from "./Button";
import {
	IconEllipsisSolid as IconMenu,
	IconCircleInfo as IconInfoCircle,
	IconCaretDownSolid as IconCaretDownFilled,
	IconCaretUpSolid as IconCaretUpFilled,
	IconAnglesUpDown as IconCaretUpDownFilled,
} from "@optimizely/axiom-icons";
import { IconCaretUp, IconCaretDown, IconCaretUpDown } from "../lib/axiom-icons";

export const Table = ({
	children,
	style,
	className,
	tableStyle,
}: {
	children: ReactNode;
	style?: React.CSSProperties;
	className?: string;
	tableStyle?: React.CSSProperties;
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
			<table className="border-collapse w-full" style={tableStyle}>{children}</table>
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
	suppressActiveStyle: _suppressActiveStyle,
	...props
}: {
	children: ReactNode;
	url?: string;
	onClick?: () => void;
	style?: React.CSSProperties;
	className?: string;
	suppressActiveStyle?: boolean;
	[key: string]: any;
}) => {
	const router = useRouter();
	const rowClick = (href: string) => {
		router.push(`${href}`);
	};

	return (
		<TableRow
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
		</TableRow>
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
		<TableHeaderCell
			className={`[&>div]:bg-transparent ${interactive ? "cursor-pointer select-none" : ""} ${className || ""}`}
			style={{
				textAlign: align,
				...style,
			}}
			onClick={onSort || onClick}
		>
			<span className="inline-flex items-center gap-1 min-h-[14px]">
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
		</TableHeaderCell>
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
	colSpan,
}: {
	children?: ReactNode;
	type?: "header" | "badge" | "avatar" | "button" | "numeric" | "raw";
	description?: string;
	data?: any;
	width?: string | number;
	style?: React.CSSProperties;
	className?: string;
	colSpan?: number;
}) => {
	return (
		<td
			className={`p-4 border-t align-top ${className || ""}`}
			colSpan={colSpan}
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
