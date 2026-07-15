import { useCallback, useRef, useState } from "react";

/**
 * Generic multi-file drag-and-drop upload state. Modeled on the drag/drop event
 * pattern in useFileUpload.ts, generalized for arbitrary file counts/types
 * (that hook is single-file and CSV-specific).
 */
export function useDropZoneUpload() {
	const [files, setFiles] = useState<File[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const addFiles = useCallback((list: FileList | File[]) => {
		setFiles((prev) => [...prev, ...Array.from(list)]);
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
		if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
	}, [addFiles]);

	const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.length) addFiles(e.target.files);
	}, [addFiles]);

	const removeFile = useCallback((index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const triggerFileInput = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const reset = useCallback(() => {
		setFiles([]);
		setIsDragging(false);
		if (fileInputRef.current) fileInputRef.current.value = "";
	}, []);

	return {
		files,
		isDragging,
		fileInputRef,
		addFiles,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		handleFileSelect,
		removeFile,
		triggerFileInput,
		reset,
	};
}
