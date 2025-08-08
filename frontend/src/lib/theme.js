// Theme configuration - centralized design tokens
export const theme = {
  personalized: {
    modulynFlame: "#ff0141",
    snowfield: "#ffffff",
    obsidianVeil: "#0e0e11",
    mistGrey: "#f4f4f6",
    charcoalTint: "#1a1a20",
    lumenPink: "#ff80a0",
    skylineBlue: "#3a86ff",
    infernoRed: "#e63946",
    amberPulse: "#ffb703",
    emeraldRise: "#06d6a0"
  },
  functional: {
    surface: {
      primary: "#ffffff",
      secondary: "#f4f4f6"
    },
    onSurface: {
      strong: "#0e0e11",
      soft: "#4a4a4f"
    },
    primary: {
      default: "#ff0141",
      onPrimary: "#ffffff"
    },
    secondary: {
      default: "#1a1a20",
      onSecondary: "#ffffff"
    },
    interactive: {
      default: "#ff3366",
      hover: "#e6003c",
      disabled: "#d1d1d6"
    },
    critical: {
      default: "#e63946",
      onCritical: "#ffffff"
    },
    warning: {
      default: "#ffb703",
      onWarning: "#0e0e11"
    },
    success: {
      default: "#06d6a0",
      onSuccess: "#0e0e11"
    },
    highlight: {
      default: "#ff80a0"
    },
    decorative: {
      default: "#3a86ff"
    }
  },
  semantic: {
    text: {
      heading: "#0e0e11",
      body: "#4a4a4f",
      link: "#ff0141",
      linkHover: "#e6003c",
      disabled: "#d1d1d6",
      onDark: "#ffffff"
    },
    buttons: {
      primary: {
        background: "#ff0141",
        text: "#ffffff",
        hover: "#e6003c",
        disabled: "#d1d1d6"
      },
      secondary: {
        background: "#1a1a20",
        text: "#ffffff",
        hover: "#33333a",
        disabled: "#d1d1d6"
      },
      ghost: {
        background: "transparent",
        text: "#ff0141",
        hover: "#ff3366"
      }
    },
    fields: {
      background: "#ffffff",
      border: "#d1d1d6",
      placeholder: "#4a4a4f",
      text: "#0e0e11",
      focusBorder: "#ff0141"
    },
    states: {
      error: "#e63946",
      warning: "#ffb703",
      success: "#06d6a0",
      info: "#3a86ff"
    }
  },
  typography: {
    fontFamily: {
      heading: "'Inter', 'Mona Sans', system-ui, Avenir, Helvetica, Arial, sans-serif",
      body: "'Inter', 'Mona Sans', system-ui, Avenir, Helvetica, Arial, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', Monaco, Cascadia Code, monospace"
    },
    fontSize: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "30px",
      "4xl": "36px"
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
    "3xl": "64px"
  },
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)"
  }
};

export default theme; 