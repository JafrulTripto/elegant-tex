import React, { createContext, useContext, useState, ReactNode } from 'react';

export type OrderType = 'marketplace' | 'merchant' | 'all';

export interface OrderTypeContextType {
  currentOrderType: OrderType;
  setOrderType: (type: OrderType) => void;
  toggleOrderType: () => void;
}

const OrderTypeContext = createContext<OrderTypeContextType | undefined>(undefined);

interface OrderTypeProviderProps {
  children: ReactNode;
}

export const OrderTypeProvider: React.FC<OrderTypeProviderProps> = ({ children }) => {
  // Default to all orders to show comprehensive overview
  const [currentOrderType, setCurrentOrderType] = useState<OrderType>('all');

  const setOrderType = (type: OrderType) => {
    setCurrentOrderType(type);
  };

  const toggleOrderType = () => {
    setCurrentOrderType(prev => {
      if (prev === 'marketplace') return 'merchant';
      if (prev === 'merchant') return 'all';
      return 'marketplace';
    });
  };

  const value: OrderTypeContextType = {
    currentOrderType,
    setOrderType,
    toggleOrderType
  };

  return (
    <OrderTypeContext.Provider value={value}>
      {children}
    </OrderTypeContext.Provider>
  );
};

export const useOrderType = (): OrderTypeContextType => {
  const context = useContext(OrderTypeContext);
  if (!context) {
    throw new Error('useOrderType must be used within an OrderTypeProvider');
  }
  return context;
};

export default OrderTypeContext;
