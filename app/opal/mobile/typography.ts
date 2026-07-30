export const mobileType = {
  hero:          { fontSize: 34, lineHeight: "41px" },
  title:         { fontSize: 20, lineHeight: "25px" },
  sectionHeader: { fontSize: 17, lineHeight: "22px" },
  primary:       { fontSize: 15, lineHeight: "20px" },
  body:          { fontSize: 14, lineHeight: "20px" },
  secondary:     { fontSize: 13, lineHeight: "18px" },
  meta:          { fontSize: 12, lineHeight: "16px" },
  caps: {
    fontSize: 11,
    lineHeight: "14px",
    letterSpacing: "0.07em",
    textTransform: "uppercase" as const,
  },
  label: {
    fontSize: 11,
    lineHeight: "14px",
  },
} as const;
