// Design System Configuration
// This file serves as the single source of truth for all design tokens

export const colors = {
  // Primary brand colors - Blue gradient theme
  primary: "#3B82F6", // Blue-500
  primaryGradient: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)", // Blue to Indigo
  secondary: "#6366F1", // Indigo-500
  accent: "#8B5CF6", // Violet-500
  
  // Status colors
  danger: "#EF4444", // Red-500
  success: "#10B981", // Emerald-500
  warning: "#F59E0B", // Amber-500
  info: "#3B82F6", // Blue-500
  
  // Text colors
  text: {
    primary: "#1F2937", // Gray-800
    secondary: "#6B7280", // Gray-500
    muted: "#9CA3AF", // Gray-400
    inverse: "#FFFFFF",
    light: "#F9FAFB", // Gray-50
  },
  
  // Background colors
  background: {
    primary: "#FFFFFF",
    secondary: "#F8FAFC", // Slate-50
    tertiary: "#F1F5F9", // Slate-100
    dark: "#0F172A", // Slate-900
    gradient: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)", // Slate gradient
  },
  
  // Border colors
  border: {
    light: "#E2E8F0", // Slate-200
    medium: "#CBD5E1", // Slate-300
    dark: "#94A3B8", // Slate-400
  },
  
  // Button colors
  button: {
    primary: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)",
    primaryHover: "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)",
    secondary: "#F8FAFC",
    secondaryHover: "#F1F5F9",
    outline: "#E2E8F0",
    outlineHover: "#CBD5E1",
  },
  
  // Card colors
  card: {
    background: "#FFFFFF",
    border: "#E2E8F0",
    shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  
  // Dark mode variants
  dark: {
    primary: "#60A5FA", // Blue-400
    primaryGradient: "linear-gradient(135deg, #60A5FA 0%, #818CF8 100%)",
    secondary: "#818CF8", // Indigo-400
    accent: "#A78BFA", // Violet-400
    
    text: {
      primary: "#F9FAFB", // Gray-50
      secondary: "#D1D5DB", // Gray-300
      muted: "#9CA3AF", // Gray-400
      inverse: "#1F2937", // Gray-800
    },
    
    background: {
      primary: "#0F172A", // Slate-900
      secondary: "#1E293B", // Slate-800
      tertiary: "#334155", // Slate-700
      dark: "#020617", // Slate-950
      gradient: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
    },
    
    border: {
      light: "#334155", // Slate-700
      medium: "#475569", // Slate-600
      dark: "#64748B", // Slate-500
    },
    
    button: {
      primary: "linear-gradient(135deg, #60A5FA 0%, #818CF8 100%)",
      primaryHover: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)",
      secondary: "#1E293B",
      secondaryHover: "#334155",
      outline: "#334155",
      outlineHover: "#475569",
    },
    
    card: {
      background: "#1E293B",
      border: "#334155",
      shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
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
    // Button variants
    variants: {
      primary: {
        background: colors.button.primary,
        color: colors.text.inverse,
        border: "none",
        "&:hover": {
          background: colors.button.primaryHover,
        },
      },
      secondary: {
        background: colors.button.secondary,
        color: colors.text.primary,
        border: `1px solid ${colors.border.light}`,
        "&:hover": {
          background: colors.button.secondaryHover,
        },
      },
      outline: {
        background: "transparent",
        color: colors.text.primary,
        border: `1px solid ${colors.button.outline}`,
        "&:hover": {
          background: colors.button.outlineHover,
        },
      },
    },
  },
  input: {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.base,
    borderWidth: "1px",
    borderColor: colors.border.light,
    backgroundColor: colors.background.primary,
    color: colors.text.primary,
    "&:focus": {
      borderColor: colors.primary,
      outline: "none",
      boxShadow: `0 0 0 3px ${colors.primary}20`,
    },
  },
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    shadow: colors.card.shadow,
    backgroundColor: colors.card.background,
    border: `1px solid ${colors.card.border}`,
  },
  table: {
    borderRadius: borderRadius.md,
    headerPadding: `${spacing.md} ${spacing.lg}`,
    cellPadding: `${spacing.sm} ${spacing.lg}`,
    headerBackground: colors.background.secondary,
    borderColor: colors.border.light,
  },
  modal: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    shadow: colors.card.shadow,
    backgroundColor: colors.card.background,
    border: `1px solid ${colors.card.border}`,
  },
  // New components for CRM
  hero: {
    background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)",
    textColor: colors.text.inverse,
    padding: `${spacing.xl} ${spacing.lg}`,
  },
  tabs: {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(8px)",
    border: `1px solid ${colors.border.light}`,
    borderRadius: borderRadius.xl,
    padding: spacing.sm,
    shadow: shadows.sm,
  },
  stats: {
    background: colors.card.background,
    border: `1px solid ${colors.card.border}`,
    borderRadius: borderRadius.lg,
    shadow: colors.card.shadow,
    padding: spacing.md,
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

// Utility functions for easy access to design tokens
export const getButtonStyles = (variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
  return components.button.variants[variant];
};

export const getCardStyles = () => {
  return components.card;
};

export const getInputStyles = () => {
  return components.input;
};

export const getHeroStyles = () => {
  return components.hero;
};

export const getTabsStyles = () => {
  return components.tabs;
};

export const getStatsStyles = () => {
  return components.stats;
};

// CSS-in-JS helpers
export const createStyles = (styles: Record<string, any>) => {
  return styles;
};

export default designTokens; 