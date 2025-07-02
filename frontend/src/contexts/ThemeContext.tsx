import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';
import { lightTheme, darkTheme } from '../theme/theme';

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  theme: Theme;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get the initial theme mode from localStorage or default to 'light'
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as ThemeMode) || 'light';
  });

  // Create the theme based on the current mode
  const theme = mode === 'light' ? lightTheme : darkTheme;

  // Toggle between light and dark modes
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // Update localStorage and set CSS variables when the mode changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    
    // Set CSS variables for scrollbar colors based on theme - frosted glass effect
    if (mode === 'dark') {
      document.documentElement.style.setProperty('--scrollbar-track', 'rgba(255, 255, 255, 0.03)'); // Very subtle track
      document.documentElement.style.setProperty('--scrollbar-thumb', 'rgba(255, 255, 255, 0.15)'); // Frosted glass effect
      document.documentElement.style.setProperty('--scrollbar-thumb-hover', 'rgba(255, 255, 255, 0.25)'); // More visible on hover
    } else {
      document.documentElement.style.setProperty('--scrollbar-track', 'rgba(0, 0, 0, 0.03)'); // Very subtle track
      document.documentElement.style.setProperty('--scrollbar-thumb', 'rgba(0, 0, 0, 0.15)'); // Frosted glass effect
      document.documentElement.style.setProperty('--scrollbar-thumb-hover', 'rgba(0, 0, 0, 0.25)'); // More visible on hover
    }
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
