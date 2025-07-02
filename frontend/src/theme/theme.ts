import { createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Define custom theme extensions
declare module '@mui/material/styles' {
  interface Theme {
    customColors: {
      magenta: string;
      lightMagenta: string;
      darkMagenta: string;
      pink: string;
      lightPink: string;
      darkPink: string;
      lavender: string;
      cream: string;
      lightGray: string;
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
      magenta?: string;
      lightMagenta?: string;
      darkMagenta?: string;
      pink?: string;
      lightPink?: string;
      darkPink?: string;
      lavender?: string;
      cream?: string;
      lightGray?: string;
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
  magenta: '#B9467E', // Main magenta color
  lightMagenta: '#D76A9E', // Lighter magenta
  darkMagenta: '#9A2D63', // Darker magenta
  pink: '#F48FB1', // Complementary pink
  lightPink: '#F8BBD0', // Lighter pink
  darkPink: '#EC407A', // Darker pink
  lavender: '#E1BEE7', // Light lavender accent
  cream: '#FFF9C4', // Light cream accent
  lightGray: '#F5F5F5',
};

// Common typography settings
const typography = {
  fontFamily: [
    'Poppins',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 500,
    letterSpacing: '-0.01em',
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500,
    letterSpacing: '-0.01em',
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
    letterSpacing: '-0.01em',
  },
  button: {
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
  subtitle1: {
    letterSpacing: '0.01em',
  },
  subtitle2: {
    letterSpacing: '0.01em',
  },
  body1: {
    letterSpacing: '0.01em',
  },
  body2: {
    letterSpacing: '0.01em',
  },
};

// Define standard spacing values - reduced for more compact layouts
const customSpacingValues = {
  container: 2, // Standard padding for containers (Paper, Card) - reduced from 3
  section: 2,   // Standard margin between sections - reduced from 3
  element: 1.5, // Standard margin between elements within a section - reduced from 2
  item: 0.75,   // Standard margin between small items - reduced from 1
};

// Common component overrides
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: 8,
        fontWeight: 500,
        letterSpacing: '0.02em',
        padding: '6px 16px',
      } as any,
      contained: {
        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 4px 8px 0 rgba(0,0,0,0.15)',
        },
      } as any,
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 8, // Reduced from 12 for more compact appearance
        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.05)',
        padding: 0, // Reset padding to use consistent values
        transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 12px 0 rgba(0,0,0,0.1)',
        },
      } as any,
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: 12, // Reduced from 16px for more compact layout
        '&:last-child': {
          paddingBottom: 12,
        },
      } as any,
    },
  },
  MuiCardHeader: {
    styleOverrides: {
      root: {
        padding: '12px 12px 8px 12px', // More compact header padding
      } as any,
      title: {
        fontSize: '1rem', // Slightly smaller title for compact headers
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
        marginBottom: 6, // Reduced from 8px for more compact spacing
      } as any,
      h6: {
        marginBottom: 6, // Reduced from 8px for more compact spacing
        fontSize: '1rem', // Slightly smaller for compact headers
        fontWeight: 500,
      } as any,
      h5: {
        fontSize: '1.15rem', // Slightly smaller for compact headers
        fontWeight: 500,
      } as any,
      h4: {
        fontWeight: 500,
      } as any,
      h3: {
        fontWeight: 600,
      } as any,
      h2: {
        fontWeight: 600,
      } as any,
      h1: {
        fontWeight: 600,
      } as any,
      subtitle1: {
        fontWeight: 500,
      } as any,
      subtitle2: {
        fontWeight: 500,
      } as any,
      body1: {
        lineHeight: 1.6,
      } as any,
      body2: {
        lineHeight: 1.6,
      } as any,
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        marginTop: 6, // Reduced from 8px
        marginBottom: 6, // Reduced from 8px
      } as any,
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        padding: '8px 12px', // More compact table cells
      } as any,
      head: {
        fontWeight: 600, // Make headers more distinct
      } as any,
    },
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        padding: '6px 12px', // More compact list items
      } as any,
    },
  },
};

// Light theme palette
const lightPalette = {
  mode: 'light' as PaletteMode,
  primary: {
    main: '#B9467E', // Magenta
    light: '#D76A9E', // Light magenta
    dark: '#9A2D63', // Dark magenta
  },
  secondary: {
    main: '#F48FB1', // Pink
    light: '#F8BBD0', // Light pink
    dark: '#EC407A', // Dark pink
  },
  error: {
    main: '#F7374F',
  },
  warning: {
    main: '#ed6c02',
  },
  info: {
    main: '#E1BEE7', // Light lavender for info
  },
  success: {
    main: '#36AE7C',
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
    main: '#D76A9E', // Light magenta
    light: '#F48FB1', // Pink
    dark: '#B9467E', // Magenta
  },
  secondary: {
    main: '#B9467E', // Magenta
    light: '#D76A9E', // Light magenta
    dark: '#9A2D63', // Dark magenta
  },
  error: {
    main: '#F7374F',
  },
  warning: {
    main: '#ffa726',
  },
  info: {
    main: '#F8BBD0', // Light pink for info
  },
  success: {
    main: '#36AE7C',
  },
  background: {
    default: '#1B1E2B', // Very dark blue-purple background (Palenight-inspired)
    paper: '#292D3E',   // Slightly lighter blue-purple surface (Palenight-inspired)
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
