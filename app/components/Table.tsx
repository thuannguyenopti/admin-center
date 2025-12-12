import {ReactNode} from "react";
import {Badge, Box, Avatar, Tooltip} from "@optiaxiom/react";
import {Text} from "./Text";
import {Button} from "./Button";
import {IconDots as IconMenu} from "@tabler/icons-react";

export const Table = ({children, style, className}: {children: ReactNode; style?: React.CSSProperties; className?: string}) => {
	return (
		<div 
			className={`rounded-[6px] border ${className || ''}`}
			style={{
				borderColor: 'var(--table-border)',
				background: 'var(--table-bg)',
				...style
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
	hoverable = true,
}: {
	children: ReactNode;
	url?: string;
	onClick?: () => void;
	hoverable?: boolean;
}) => {
	const router = useRouter();
	const rowClick = (href: string) => {
		router.push(`${href}`);
	};
	
	return (
		<tr
			onClick={url ? () => rowClick(url) : onClick ? onClick : undefined}
			className={
				"relative " +
				(url || onClick ? "cursor-pointer " : "")
			}
			style={{
				borderColor: 'var(--table-border)',
				...(hoverable === false ? { pointerEvents: 'none' } : {})
			}}
		>
			{children}
		</tr>
	);
};
export const Th = ({children, align}: {children?: ReactNode; align?: any}) => {
	return (
		<th
			className="text-left p-4 text-xs font-normal py-3 align-top"
			style={{
				textAlign: align,
				color: 'var(--table-header-text)'
			}}
		>
			{children}
		</th>
	);
};

export const Td = ({
	children,
	type,
	description,
	data,
	width,
}: {
	children: ReactNode;
	type?: "header" | "badge" | "avatar" | "button" | "numeric" | "raw";
	description?: string;
	data?: any;
	width?: string | number;
}) => {
	return (
		<td
			className="p-4 border-t align-top"
			style={{
				width: type === "button" ? "56px" : width,
				borderColor: 'var(--table-border)'
			}}
		>
			{type === undefined && (
				<>
					<Text
						color="fg.default"
						fontSize="md"
					>
						{children}
					</Text>
					{description && (
						<Text
							fontSize="sm"
							color="fg.secondary"
						>
							{description}
						</Text>
					)}
				</>
			)}
			{type === "header" && (
				<>
					<Text
						asChild
						color="fg.default"
						fontWeight="500"
					>
						<span>{children}</span>
					</Text>
					{description && (
						<Text
							fontSize="sm"
							color="fg.tertiary"
						>
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
						<Avatar
							src={data}
							size="md"
							name={children as string}
						/>
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
				<Text
					color="fg.default"
					textAlign="end"
				>
					{children}
				</Text>
			)}
			{type === "raw" && children}
		</td>
	);
};
