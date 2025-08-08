// Design System Configuration
// This file serves as the single source of truth for all design tokens
import theme from '../../design-system/modulyn-theme.json'

export const colors = {
  // Primary brand colors - Using centralized theme
  primary: theme.functional.primary.default,
  primaryGradient: `linear-gradient(135deg, ${theme.functional.primary.default} 0%, ${theme.functional.interactive.default} 100%)`,
  secondary: theme.functional.secondary.default,
  accent: theme.functional.highlight.default,
  
  // Status colors
  danger: theme.semantic.states.error,
  success: theme.semantic.states.success,
  warning: theme.semantic.states.warning,
  info: theme.semantic.states.info,
  
  // Text colors
  text: {
    primary: theme.semantic.text.heading,
    secondary: theme.semantic.text.body,
    muted: theme.semantic.text.disabled,
    inverse: theme.semantic.text.onDark,
    light: theme.functional.onSurface.soft,
  },
  
  // Background colors
  background: {
    primary: theme.functional.surface.primary,
    secondary: theme.functional.surface.secondary,
    tertiary: theme.functional.surface.secondary,
    dark: theme.personalized.obsidianVeil,
    gradient: `linear-gradient(135deg, ${theme.functional.surface.primary} 0%, ${theme.functional.surface.secondary} 100%)`,
  },
  
  // Border colors
  border: {
    light: theme.semantic.fields.border,
    medium: theme.semantic.fields.border,
    dark: theme.semantic.fields.border,
  },
  
  // Button colors
  button: {
    primary: `linear-gradient(135deg, ${theme.functional.primary.default} 0%, ${theme.functional.interactive.default} 100%)`,
    primaryHover: `linear-gradient(135deg, ${theme.functional.interactive.hover} 0%, ${theme.functional.interactive.default} 100%)`,
    secondary: theme.functional.surface.secondary,
    secondaryHover: theme.functional.surface.primary,
    outline: theme.semantic.fields.border,
    outlineHover: theme.semantic.fields.border,
  },
  
  // Card colors
  card: {
    background: theme.functional.surface.primary,
    border: theme.semantic.fields.border,
    shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  
  // Dark mode variants
  dark: {
    primary: theme.functional.primary.default,
    primaryGradient: `linear-gradient(135deg, ${theme.functional.primary.default} 0%, ${theme.functional.interactive.default} 100%)`,
    secondary: theme.functional.secondary.default,
    accent: theme.functional.highlight.default,
    
    text: {
      primary: theme.semantic.text.onDark,
      secondary: theme.semantic.text.onDark,
      muted: theme.semantic.text.disabled,
      inverse: theme.semantic.text.heading,
    },
    
    background: {
      primary: theme.personalized.obsidianVeil,
      secondary: theme.personalized.charcoalTint,
      tertiary: theme.personalized.charcoalTint,
      dark: theme.personalized.obsidianVeil,
      gradient: `linear-gradient(135deg, ${theme.personalized.obsidianVeil} 0%, ${theme.personalized.charcoalTint} 100%)`,
    },
    
    border: {
      light: theme.semantic.fields.border,
      medium: theme.semantic.fields.border,
      dark: theme.semantic.fields.border,
    },
    
    button: {
      primary: `linear-gradient(135deg, ${theme.functional.primary.default} 0%, ${theme.functional.interactive.default} 100%)`,
      primaryHover: `linear-gradient(135deg, ${theme.functional.interactive.hover} 0%, ${theme.functional.interactive.default} 100%)`,
      secondary: theme.personalized.charcoalTint,
      secondaryHover: theme.personalized.obsidianVeil,
      outline: theme.semantic.fields.border,
      outlineHover: theme.semantic.fields.border,
    },
    
    card: {
      background: theme.personalized.charcoalTint,
      border: theme.semantic.fields.border,
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