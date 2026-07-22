import type {ReactNode} from "react";
import styles from "./PrimaryCtaIcon.module.css";

export function PrimaryCtaIcon({children}: {children: ReactNode}) {
	return <span className={styles.primaryCtaIcon}>{children}</span>;
}
