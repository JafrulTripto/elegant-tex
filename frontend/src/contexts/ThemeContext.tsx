import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createTheme, Theme } from '@mui/material/styles';
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
    
    // Set CSS variables for scrollbar colors based on theme
    if (mode === 'dark') {
      document.documentElement.style.setProperty('--scrollbar-track', '#1A2533');
      document.documentElement.style.setProperty('--scrollbar-thumb', '#3FC1C9');
      document.documentElement.style.setProperty('--scrollbar-thumb-hover', '#2D9BA2');
    } else {
      document.documentElement.style.setProperty('--scrollbar-track', '#f1f1f1');
      document.documentElement.style.setProperty('--scrollbar-thumb', '#888');
      document.documentElement.style.setProperty('--scrollbar-thumb-hover', '#555');
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
