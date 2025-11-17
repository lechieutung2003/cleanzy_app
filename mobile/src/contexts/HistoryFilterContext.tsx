import React, { createContext, useContext, useState, ReactNode } from 'react';

type FilterType = 'pending' | 'PAID' | 'in-progress' | 'confirmed' | 'completed' | 'rejected' | 'refund';

interface HistoryFilterContextType {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
}

const HistoryFilterContext = createContext<HistoryFilterContextType | undefined>(undefined);

export const HistoryFilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filter, setFilter] = useState<FilterType>('pending');

  return (
    <HistoryFilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </HistoryFilterContext.Provider>
  );
};

export const useHistoryFilter = () => {
  const context = useContext(HistoryFilterContext);
  if (!context) {
    throw new Error('useHistoryFilter must be used within HistoryFilterProvider');
  }
  return context;
};
