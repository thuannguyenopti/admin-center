export type PreviewMode = "responsive" | "fixed" | "scale";

export type PreviewSettings = {
    mode: PreviewMode;
    width: number;     // used for fixed/scale (design width)
    maxWidth?: number; // used for responsive clamp
};