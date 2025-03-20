import React, { createContext, useContext, ReactNode } from 'react';
import { SnackbarProvider, useSnackbar, VariantType, ProviderContext } from 'notistack';

// Define the context type
interface ToastContextType {
  showToast: (message: string, variant?: VariantType) => void;
}

// Create the context with a default value
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Provider props
interface ToastProviderProps {
  children: ReactNode;
}

// Maximum number of notifications to display at once
const MAX_SNACK = 3;

// Toast Provider component that wraps the application
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <SnackbarProvider 
      maxSnack={MAX_SNACK}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      autoHideDuration={3000}
    >
      <ToastProviderContent>
        {children}
      </ToastProviderContent>
    </SnackbarProvider>
  );
};

// Inner provider that has access to the snackbar context
const ToastProviderContent: React.FC<ToastProviderProps> = ({ children }) => {
  const snackbar = useSnackbar();
  
  // Function to show a toast notification
  const showToast = (message: string, variant: VariantType = 'default') => {
    snackbar.enqueueSnackbar(message, { variant });
  };
  
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};
