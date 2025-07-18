// Design System Configuration
// This file serves as the single source of truth for all design tokens

export const colors = {
  primary: "#000000",
  secondary: "#FFFFFF",
  accent: "#F0F0F0",
  danger: "#FF4D4F",
  success: "#52C41A",
  warning: "#FAAD14",
  info: "#1890FF",
  text: {
    primary: "#111111",
    secondary: "#666666",
    muted: "#999999",
    inverse: "#FFFFFF",
  },
  background: {
    primary: "#FFFFFF",
    secondary: "#F5F5F5",
    dark: "#111111",
  },
  border: {
    light: "#E5E5E5",
    medium: "#CCCCCC",
    dark: "#999999",
  },
  // Dark mode variants
  dark: {
    primary: "#FFFFFF",
    secondary: "#000000",
    accent: "#1A1A1A",
    text: {
      primary: "#FFFFFF",
      secondary: "#CCCCCC",
      muted: "#999999",
      inverse: "#000000",
    },
    background: {
      primary: "#000000",
      secondary: "#111111",
      dark: "#000000",
    },
    border: {
      light: "#333333",
      medium: "#555555",
      dark: "#777777",
    },
  },
};

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px",
};

export const typography = {
  fontFamily: {
    sans: "'Inter', 'Mona Sans', system-ui, Avenir, Helvetica, Arial, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Cascadia Code', monospace",
  },
  fontSize: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "30px",
    "4xl": "36px",
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const borderRadius = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "24px",
  full: "9999px",
};

export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
};

export const transitions = {
  fast: "150ms ease-in-out",
  normal: "250ms ease-in-out",
  slow: "350ms ease-in-out",
};

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

// Component-specific design tokens
export const components = {
  button: {
    padding: {
      sm: `${spacing.sm} ${spacing.md}`,
      md: `${spacing.md} ${spacing.lg}`,
      lg: `${spacing.lg} ${spacing.xl}`,
    },
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  input: {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.base,
    borderWidth: "1px",
  },
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    shadow: shadows.md,
  },
  table: {
    borderRadius: borderRadius.md,
    headerPadding: `${spacing.md} ${spacing.lg}`,
    cellPadding: `${spacing.sm} ${spacing.lg}`,
  },
  modal: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    shadow: shadows.xl,
  },
};

// Export all design tokens as a single object for easy access
export const designTokens = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  components,
};

export default designTokens; 