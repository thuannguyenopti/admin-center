import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

// Combines clsx with tailwind-merge so Tailwind utilities resolve predictably.
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
