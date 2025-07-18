export const DESIGN = {
  sidebarWidth: 260,
  headerHeight: 64,
  borderRadius: '12px',
  fontSize: {
    base: '14px',
    title: '18px',
  },
  colors: {
    primary: '#BB86FC', // Material purple 200
    accent: '#03DAC6',  // Material teal 200
    background: '#FFFFFF',
    backgroundDark: '#121212', // Material dark bg
    surface: '#F5F5F5',
    surfaceDark: '#1E1E1E',
    card: '#FFFFFF',
    cardDark: '#232323',
    text: '#090004', // Light text
    textDark: 'rgba(255,255,255,0.87)', // High-emphasis
    textSecondary: 'rgba(60,60,60,0.7)',
    textSecondaryDark: 'rgba(255,255,255,0.60)',
    textDisabled: 'rgba(0,0,0,0.38)',
    textDisabledDark: 'rgba(255,255,255,0.38)',
    divider: 'rgba(0,0,0,0.12)',
    dividerDark: 'rgba(255,255,255,0.12)',
  },
  logo: {
    height: 32,
    width: 120,
  },
  signupPage: {
    background: '#FFFFFF',
    leftCol: {
      background: '#EDEADE', // Alabaster
      logoHeight: 'auto',
      logoWidth: 200,
      brandColor: '#630330', // Tyrian Purple
      brandFontSize: '22px',
      textColor: '#090004', // Dark Neon Purple
      contactBlock: {
        labelColor: '#630330',
        valueColor: '#1A1A1A',
        fontSize: '14px',
        spacing: '1.5rem',
      },
      socialIcon: {
        size: 24,
        bg: '#F3F6',
        border: '1px solid #630330',
        color: '#6C2EBE',
        radius: '50%',
        margin: '0 0.5rem',
      },
    },
    rightCol: {
      background: '#630330',
      maxWidth: 520,
      padding: '2rem',
      borderRadius: '16px',
      boxShadow: '0 4px 32px 0 rgba(0, 0, 0, 0.08)',
    },
    header: {
      color: '#EDEADE',
      fontSize: '1.5rem',
      fontWeight: 700,
      marginBottom: '2rem',
      textAlign: 'center',
    },
    input: {
      fontSize: '16px',
      color: '#EDEADE',
      border: 'none',
      borderBottom: '2px solid #E5E7EB',
      borderRadius: 0,
      background: 'transparent',
      padding: '0.75rem 0',
      marginBottom: '2rem',
      focusBorder: '#6C2EBE',
      placeholderColor: '#A0AEC0',
    },
    label: {
      fontSize: '16px',
      color: '#EDEADE',
      fontWeight: 600,
      marginBottom: '0.5rem',
    },
    button: {
      background: '#EDEADE',
      color: '#630330',
      borderRadius: '8px',
      fontSize: '18px',
      fontWeight: 700,
      padding: '0.75rem',
      marginTop: '1.5rem',
      boxShadow: '0 2px 8px 0 rgba(108,46,190,0.10)',
    },
    progress: {
      dotActive: '#090004',
      dotInactive: '#EDEADE',
      size: 12,
      spacing: '0.75rem',
      marginTop: '2.5rem',
    },
    error: {
      color: '#E53E3E',
      fontSize: '13px',
      marginTop: '0.25rem',
    },
  },
  loginPage: {
    background: '#EDEADE',
    leftCol: {
      background: '#090004', // Form area (bold)
      logoHeight: 'auto',
      logoWidth: 200,
      brandColor: '#EDEADE',
      brandFontSize: '22px',
      textColor: '#EDEADE',
      contactBlock: {
        labelColor: '#EDEADE',
        valueColor: '#FFFFFF',
        fontSize: '14px',
        spacing: '1.5rem',
      },
      socialIcon: {
        size: 24,
        bg: '#090004',
        border: '1px solid #EDEADE',
        color: '#EDEADE',
        radius: '50%',
        margin: '0 0.5rem',
      },
    },
    rightCol: {
      background: '#EDEADE', // Branding area (light)
      boxBg: '#090004',
      maxWidth: 520,
      padding: '2rem',
      borderRadius: '16px',
      boxShadow: '0 4px 32px 0 rgba(0, 0, 0, 0.08)',
    },
    header: {
      color: '#090004', // Form header text color (bold)
      fontSize: '1.5rem',
      fontWeight: 700,
      marginBottom: '2rem',
      textAlign: 'center',
    },
    input: {
      fontSize: '16px',
      color: '#090004',
      border: 'none',
      borderBottom: '2px solid #E5E7EB',
      borderRadius: 0,
      background: 'transparent',
      padding: '0.75rem 0',
      marginBottom: '2rem',
      focusBorder: '#6C2EBE',
      placeholderColor: '#A0AEC0',
    },
    label: {
      fontSize: '16px',
      color: '#090004',
      fontWeight: 600,
      marginBottom: '0.5rem',
    },
    button: {
      background: '#090004',
      color: '#EDEADE',
      borderRadius: '8px',
      fontSize: '18px',
      fontWeight: 700,
      padding: '0.75rem',
      marginTop: '1.5rem',
      boxShadow: '0 2px 8px 0 rgba(108,46,190,0.10)',
    },
    error: {
      color: '#E53E3E',
      fontSize: '13px',
      marginTop: '0.25rem',
    },
  },
}; 