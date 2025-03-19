import { createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Define custom theme extensions
declare module '@mui/material/styles' {
  interface Theme {
    customColors: {
      navyBlue: string;
      teal: string;
      lightGray: string;
      pink: string;
      navyBlueDark: string;
      tealDark: string;
      pinkDark: string;
    };
    customSpacing: {
      container: number;
      section: number;
      element: number;
      item: number;
    };
  }
  interface ThemeOptions {
    customColors?: {
      navyBlue?: string;
      teal?: string;
      lightGray?: string;
      pink?: string;
      navyBlueDark?: string;
      tealDark?: string;
      pinkDark?: string;
    };
    customSpacing?: {
      container?: number;
      section?: number;
      element?: number;
      item?: number;
    };
  }
}

// Define custom colors
const customColors = {
  navyBlue: '#364F6B',
  teal: '#3FC1C9',
  lightGray: '#F5F5F5',
  pink: '#FC5185',
  navyBlueDark: '#283A50',
  tealDark: '#2D9BA2',
  pinkDark: '#E03A6C',
};

// Common typography settings
const typography = {
  fontFamily: [
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    fontWeight: 500,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 500,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 500,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 500,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
  },
};

// Define standard spacing values
const customSpacingValues = {
  container: 3, // Standard padding for containers (Paper, Card)
  section: 3,   // Standard margin between sections
  element: 2,   // Standard margin between elements within a section
  item: 1,      // Standard margin between small items
};

// Common component overrides
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: 8,
      } as any,
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
        padding: 0, // Reset padding to use consistent values
      } as any,
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: 16, // 3 * 8px = 24px (MUI's spacing unit is 8px)
        '&:last-child': {
          paddingBottom: 16,
        },
      } as any,
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        padding: 0, // Reset padding to use consistent values
      } as any,
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        marginTop: 8, // 2 * 8px = 16px
        marginBottom: 8,
      } as any,
    },
  },
  MuiFormControl: {
    styleOverrides: {
      root: {
        marginTop: 8,
        marginBottom: 8,
      } as any,
    },
  },
  MuiGrid: {
    styleOverrides: {
      container: {
        // Default grid spacing will be handled by the spacing prop
      } as any,
    },
  },
  MuiTypography: {
    styleOverrides: {
      gutterBottom: {
        marginBottom: 8, // Consistent gutterBottom margin
      } as any,
      h6: {
        marginBottom: 8, // Consistent heading margin
      } as any,
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        marginTop: 8,
        marginBottom: 8,
      } as any,
    },
  },
};

// Light theme palette
const lightPalette = {
  mode: 'light' as PaletteMode,
  primary: {
    main: '#364F6B',
    light: '#4A6583',
    dark: '#283A50',
  },
  secondary: {
    main: '#FC5185',
    light: '#FD739D',
    dark: '#E03A6C',
  },
  error: {
    main: '#d32f2f',
  },
  warning: {
    main: '#ed6c02',
  },
  info: {
    main: '#3FC1C9',
  },
  success: {
    main: '#2e7d32',
  },
  background: {
    default: '#F5F5F5',
    paper: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
  },
};

// Dark theme palette
const darkPalette = {
  mode: 'dark' as PaletteMode,
  primary: {
    main: '#3FC1C9',
    light: '#65CDD3',
    dark: '#2D9BA2',
  },
  secondary: {
    main: '#FC5185',
    light: '#FD739D',
    dark: '#E03A6C',
  },
  error: {
    main: '#f44336',
  },
  warning: {
    main: '#ffa726',
  },
  info: {
    main: '#64B5F6',
  },
  success: {
    main: '#66bb6a',
  },
  background: {
    default: '#1A2533', // Darker version of #364F6B
    paper: '#253547',   // Slightly lighter than background
  },
  text: {
    primary: '#F5F5F5',
    secondary: 'rgba(245, 245, 245, 0.7)',
  },
};

// Create light theme
export const lightTheme = createTheme({
  palette: lightPalette,
  typography,
  components,
  customColors,
  customSpacing: customSpacingValues,
});

// Create dark theme
export const darkTheme = createTheme({
  palette: darkPalette,
  typography,
  components,
  customColors,
  customSpacing: customSpacingValues,
});

// Default theme (for backward compatibility)
const theme = lightTheme;

export default theme;
