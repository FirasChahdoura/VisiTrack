import { createContext, useContext, useState } from 'react';

const SearchContext = createContext(null);

const DEFAULT_FILTERS = {
  name: '', day: '', fromTime: '', toTime: '', rank: '', notInspectedInMonths: '24', schoolId: '',
};

export function SearchProvider({ children }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [results, setResults] = useState([]);
  const [count, setCount] = useState(null);

  return (
    <SearchContext.Provider value={{ filters, setFilters, results, setResults, count, setCount }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}
