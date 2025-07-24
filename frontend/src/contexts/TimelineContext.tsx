import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface TimelineRange {
  startDate: Date;
  endDate: Date;
  label: string;
  preset: string;
}

export interface TimelineContextType {
  currentRange: TimelineRange;
  setTimelineRange: (range: TimelineRange) => void;
  presets: TimelinePreset[];
}

export interface TimelinePreset {
  key: string;
  label: string;
  getValue: () => TimelineRange;
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

// Helper function to get date ranges
const getDateRange = (days: number, label: string, preset: string): TimelineRange => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  return {
    startDate,
    endDate,
    label,
    preset
  };
};

const getMonthRange = (monthsBack: number, label: string, preset: string): TimelineRange => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - monthsBack);
  
  return {
    startDate,
    endDate,
    label,
    preset
  };
};

const getCurrentMonthRange = (): TimelineRange => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    startDate,
    endDate,
    label: 'This Month',
    preset: 'current-month'
  };
};

const getCurrentYearRange = (): TimelineRange => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), 0, 1);
  const endDate = new Date(now.getFullYear(), 11, 31);
  
  return {
    startDate,
    endDate,
    label: 'This Year',
    preset: 'current-year'
  };
};

const getTodayRange = (): TimelineRange => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  return {
    startDate,
    endDate,
    label: 'Today',
    preset: 'today'
  };
};

// Predefined timeline presets
const timelinePresets: TimelinePreset[] = [
  {
    key: 'today',
    label: 'Today',
    getValue: getTodayRange
  },
  {
    key: 'last-7-days',
    label: 'Last 7 Days',
    getValue: () => getDateRange(7, 'Last 7 Days', 'last-7-days')
  },
  {
    key: 'last-30-days',
    label: 'Last 30 Days',
    getValue: () => getDateRange(30, 'Last 30 Days', 'last-30-days')
  },
  {
    key: 'current-month',
    label: 'This Month',
    getValue: getCurrentMonthRange
  },
  {
    key: 'last-3-months',
    label: 'Last 3 Months',
    getValue: () => getMonthRange(3, 'Last 3 Months', 'last-3-months')
  },
  {
    key: 'last-6-months',
    label: 'Last 6 Months',
    getValue: () => getMonthRange(6, 'Last 6 Months', 'last-6-months')
  },
  {
    key: 'current-year',
    label: 'This Year',
    getValue: getCurrentYearRange
  },
  {
    key: 'custom',
    label: 'Custom Range',
    getValue: () => getDateRange(30, 'Custom Range', 'custom') // Default fallback
  }
];

interface TimelineProviderProps {
  children: ReactNode;
}

export const TimelineProvider: React.FC<TimelineProviderProps> = ({ children }) => {
  // Default to current month
  const [currentRange, setCurrentRange] = useState<TimelineRange>(
    timelinePresets.find(p => p.key === 'current-month')?.getValue() || getDateRange(30, 'Last 30 Days', 'last-30-days')
  );

  const setTimelineRange = (range: TimelineRange) => {
    setCurrentRange(range);
  };

  const value: TimelineContextType = {
    currentRange,
    setTimelineRange,
    presets: timelinePresets
  };

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = (): TimelineContextType => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
};

export default TimelineContext;
