import { SxProps, Theme } from '@mui/material';

/**
 * Spacing utilities for consistent spacing across components
 */
export const spacing = {
  // Container padding (for Paper, Card, etc.)
  container: (theme: Theme): SxProps<Theme> => ({
    p: theme.customSpacing.container,
  }),
  
  // Section margin (between major sections)
  sectionMargin: (theme: Theme): SxProps<Theme> => ({
    mb: theme.customSpacing.section,
  }),
  
  // Element margin (between elements within a section)
  elementMargin: (theme: Theme): SxProps<Theme> => ({
    mb: theme.customSpacing.element,
  }),
  
  // Item margin (between small items)
  itemMargin: (theme: Theme): SxProps<Theme> => ({
    mb: theme.customSpacing.item,
  }),
  
  // Grid spacing (for consistent grid spacing)
  gridSpacing: (theme: Theme): number => theme.customSpacing.element * 4, // Convert to pixels (MUI uses 8px as base)
  
  // Form spacing
  formElementSpacing: (theme: Theme): SxProps<Theme> => ({
    my: theme.customSpacing.element,
  }),
  
  // Content padding for Paper and Card components
  contentPadding: (theme: Theme): SxProps<Theme> => ({
    p: theme.customSpacing.container,
  }),
  
  // Header padding for section headers
  headerPadding: (theme: Theme): SxProps<Theme> => ({
    pb: theme.customSpacing.element,
    mb: theme.customSpacing.element,
  }),
};

/**
 * Shared style utilities for consistent styling across components
 */
export const styleUtils = {
  // Authentication card styling
  authCard: {
    mt: 8,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 2,
    borderTop: (theme: Theme) => `4px solid ${theme.customColors.navyBlue}`,
    borderBottom: (theme: Theme) => `4px solid ${theme.customColors.pink}`,
  } as SxProps<Theme>,
  
  // Logo avatar styling
  logoAvatar: {
    m: 1,
    bgcolor: (theme: Theme) => theme.customColors.teal,
    width: 56,
    height: 56,
  } as SxProps<Theme>,
  
  // Secondary avatar styling (smaller)
  secondaryAvatar: {
    bgcolor: (theme: Theme) => theme.customColors.pink,
    mr: 1,
  } as SxProps<Theme>,
  
  // Gradient button styling
  gradientButton: {
    mt: 3,
    mb: 2,
    background: (theme: Theme) => 
      `linear-gradient(45deg, ${theme.customColors.navyBlue} 30%, ${theme.customColors.pink} 90%)`,
    '&:hover': {
      background: (theme: Theme) => 
        `linear-gradient(45deg, ${theme.customColors.navyBlueDark} 30%, ${theme.customColors.pinkDark} 90%)`,
    },
  } as SxProps<Theme>,
  
  // Logo container styling
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    mb: 3,
  } as SxProps<Theme>,
  
  // Footer styling
  footer: {
    py: 3,
    px: 2,
    mt: 'auto',
    backgroundColor: (theme: Theme) => 
      theme.palette.mode === 'light'
        ? theme.customColors.lightGray
        : '#253547',
    borderTop: (theme: Theme) => 
      `2px solid ${theme.customColors.teal}`,
  } as SxProps<Theme>,
  
  // Footer text styling
  footerText: {
    color: (theme: Theme) => 
      theme.palette.mode === 'light'
        ? theme.customColors.navyBlue
        : theme.customColors.lightGray,
  } as SxProps<Theme>,
  
  // App bar styling
  appBar: (drawerWidth: number): SxProps<Theme> => ({
    width: { sm: `calc(100% - ${drawerWidth}px)` },
    ml: { sm: `${drawerWidth}px` },
    bgcolor: (theme: Theme) => theme.customColors.navyBlue,
  }),
  
  // Accent button styling (teal)
  accentButton: {
    bgcolor: (theme: Theme) => theme.customColors.teal,
    '&:hover': {
      bgcolor: (theme: Theme) => theme.customColors.tealDark,
    },
  } as SxProps<Theme>,
};

/**
 * Layout utilities for common layout patterns
 */
export const layoutUtils = {
  // Centered flex container
  centeredFlex: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  } as SxProps<Theme>,
  
  // Space between flex container
  spaceBetweenFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as SxProps<Theme>,
  
  // End-aligned flex container
  endFlex: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  } as SxProps<Theme>,
  
  // Column flex container
  columnFlex: {
    display: 'flex',
    flexDirection: 'column',
  } as SxProps<Theme>,
};

/**
 * Custom hooks for complex style logic
 */
export const useAuthStyles = (theme: Theme) => {
  return {
    // Dynamic gradient button that handles disabled state
    gradientButton: (isDisabled: boolean) => ({
      mt: 3,
      mb: 2,
      background: isDisabled
        ? theme.palette.action.disabledBackground
        : `linear-gradient(45deg, ${theme.customColors.navyBlue} 30%, ${theme.customColors.pink} 90%)`,
      '&:hover': {
        background: isDisabled
          ? theme.palette.action.disabledBackground
          : `linear-gradient(45deg, ${theme.customColors.navyBlueDark} 30%, ${theme.customColors.pinkDark} 90%)`,
      },
    }),
  };
};
