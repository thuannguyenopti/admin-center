"use client";

import {useState} from "react";
import {Box, Button, Input, Text} from "@optiaxiom/react";
import {IconBan, IconCheck, IconPlus, IconXmark} from "@optiaxiom/icons";
import styles from "./VoiceAudience.module.css";

type ChipVariant = "neutral" | "positive" | "do" | "dont";

export function ChipList({
	items,
	onAdd,
	onRemove,
	variant,
	placeholder,
}: {
	items: string[];
	onAdd: (value: string) => void;
	onRemove: (index: number) => void;
	variant: ChipVariant;
	placeholder: string;
}) {
	const [text, setText] = useState("");

	const submit = () => {
		const trimmed = text.trim();
		if (!trimmed) {
			return;
		}

		onAdd(trimmed);
		setText("");
	};

	return (
		<Box display="flex" flexDirection="column" gap="10">
			<Box className={styles.addRow}>
				<Input
					placeholder={placeholder}
					size="md"
					value={text}
					onChange={(event) => setText(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							submit();
						}
					}}
				/>
				<Button appearance="default" icon={<IconPlus />} onClick={submit} size="md">
					Add
				</Button>
			</Box>

			{items.length === 0 ? (
				<Text color="fg.tertiary" style={{fontSize: 14}}>
					None added
				</Text>
			) : variant === "neutral" || variant === "positive" ? (
				<Box className={styles.pillWrap}>
					{items.map((item, index) => (
						<Box
							key={`${item}-${index}`}
							className={
								variant === "positive"
									? `${styles.neutralChip} ${styles.positiveChip}`
									: styles.neutralChip
							}
						>
							<Text style={{fontSize: 13, fontWeight: 600}}>{item}</Text>
							<button
								aria-label={`Remove ${item}`}
								className={styles.pillDelete}
								type="button"
								onClick={() => onRemove(index)}
							>
								<IconXmark size={11} />
							</button>
						</Box>
					))}
				</Box>
			) : (
				<Box className={styles.cardStack}>
					{items.map((item, index) => (
						<Box
							key={`${item}-${index}`}
							className={`${styles.card} ${variant === "do" ? styles.doCard : styles.dontCard}`}
						>
							<span className={styles.cardIcon}>
								{variant === "do" ? <IconCheck size={15} /> : <IconBan size={15} />}
							</span>
							<Text className={styles.cardText}>{item}</Text>
							<button
								aria-label={`Remove ${item}`}
								className={styles.cardDelete}
								type="button"
								onClick={() => onRemove(index)}
							>
								<IconXmark size={12} />
							</button>
						</Box>
					))}
				</Box>
			)}
		</Box>
	);
}
