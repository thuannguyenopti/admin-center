import { Box, Button } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import {IconChevronDown} from "@/app/lib/axiom-icons";

type PlanViewFooterProps = {
	page: number;
	onPageChange: (page: number) => void;
	pageSize: number;
	totalItems: number;
	totalPages: number;
};

export function PlanViewFooter({ page, onPageChange, pageSize, totalItems, totalPages }: PlanViewFooterProps) {
	return (
		<Box
			px="16"
			py="8"
			borderT="1"
			borderColor="border.tertiary"
			bg="bg.default"
			display="flex"
			alignItems="center"
			justifyContent="space-between"
		>
			<Box display="flex" alignItems="center" gap="8">
				<Text fontSize="sm" color="fg.tertiary">
					{totalItems} items · Page Size
				</Text>
				<Button appearance="subtle" size="sm" addonAfter={<IconChevronDown size={16} />}>
					{pageSize}
				</Button>
			</Box>
			<Box display="flex" alignItems="center" gap="4">
				<Button
					appearance="subtle"
					size="sm"
					disabled={page <= 1}
					onClick={() => onPageChange(page - 1)}
				>
					&lt;
				</Button>
				{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
					<Button
						key={p}
						appearance={p === page ? "primary" : "subtle"}
						size="sm"
						onClick={() => onPageChange(p)}
					>
						{p}
					</Button>
				))}
				<Button
					appearance="subtle"
					size="sm"
					disabled={page >= totalPages}
					onClick={() => onPageChange(page + 1)}
				>
					&gt;
				</Button>
			</Box>
		</Box>
	);
}
