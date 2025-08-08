declare module '*.json' {
  const value: any;
  export default value;
}

declare module '../../../../design-system/modulyn-theme.json' {
  const theme: {
    personalized: {
      modulynFlame: string;
      snowfield: string;
      obsidianVeil: string;
      mistGrey: string;
      charcoalTint: string;
      lumenPink: string;
      skylineBlue: string;
      infernoRed: string;
      amberPulse: string;
      emeraldRise: string;
    };
    functional: {
      surface: {
        primary: string;
        secondary: string;
      };
      onSurface: {
        strong: string;
        soft: string;
      };
      primary: {
        default: string;
        onPrimary: string;
      };
      secondary: {
        default: string;
        onSecondary: string;
      };
      interactive: {
        default: string;
        hover: string;
        disabled: string;
      };
      critical: {
        default: string;
        onCritical: string;
      };
      warning: {
        default: string;
        onWarning: string;
      };
      success: {
        default: string;
        onSuccess: string;
      };
      highlight: {
        default: string;
      };
      decorative: {
        default: string;
      };
    };
    semantic: {
      text: {
        heading: string;
        body: string;
        link: string;
        linkHover: string;
        disabled: string;
        onDark: string;
      };
      buttons: {
        primary: {
          background: string;
          text: string;
          hover: string;
          disabled: string;
        };
        secondary: {
          background: string;
          text: string;
          hover: string;
          disabled: string;
        };
        ghost: {
          background: string;
          text: string;
          hover: string;
        };
      };
      fields: {
        background: string;
        border: string;
        placeholder: string;
        text: string;
        focusBorder: string;
      };
      states: {
        error: string;
        warning: string;
        success: string;
        info: string;
      };
    };
    typography: {
      fontFamily: {
        heading: string;
        body: string;
        mono: string;
      };
      fontSize: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
        '4xl': string;
      };
      fontWeight: {
        light: number;
        regular: number;
        medium: number;
        semibold: number;
        bold: number;
        extrabold: number;
      };
      lineHeight: {
        tight: number;
        normal: number;
        relaxed: number;
      };
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    shadows: {
      none: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      inner: string;
    };
    tailwind: {
      colors: {
        'modulyn-flame': string;
        'snowfield': string;
        'obsidian-veil': string;
        'mist-grey': string;
        'charcoal-tint': string;
        'lumen-pink': string;
        'skyline-blue': string;
        'inferno-red': string;
        'amber-pulse': string;
        'emerald-rise': string;
        interactive: {
          default: string;
          hover: string;
          disabled: string;
        };
      };
    };
  };
  export default theme;
} 