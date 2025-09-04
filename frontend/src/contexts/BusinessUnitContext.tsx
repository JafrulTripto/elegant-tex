import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BusinessUnit } from '../types/businessUnit';

interface BusinessUnitContextType {
  selectedBusinessUnit: BusinessUnit | null;
  setSelectedBusinessUnit: (businessUnit: BusinessUnit | null) => void;
}

const BusinessUnitContext = createContext<BusinessUnitContextType | undefined>(undefined);

export const useBusinessUnit = () => {
  const context = useContext(BusinessUnitContext);
  if (context === undefined) {
    throw new Error('useBusinessUnit must be used within a BusinessUnitProvider');
  }
  return context;
};

interface BusinessUnitProviderProps {
  children: ReactNode;
}

export const BusinessUnitProvider: React.FC<BusinessUnitProviderProps> = ({ children }) => {
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<BusinessUnit | null>(null);

  const value = {
    selectedBusinessUnit,
    setSelectedBusinessUnit,
  };

  return (
    <BusinessUnitContext.Provider value={value}>
      {children}
    </BusinessUnitContext.Provider>
  );
};
