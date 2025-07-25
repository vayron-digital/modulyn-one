import { useState, useEffect, useCallback, useMemo } from 'react';
import debounce from 'lodash.debounce';

interface UseDebouncedSearchOptions {
  delay?: number;
  minLength?: number;
  initialValue?: string;
}

export const useDebouncedSearch = (options: UseDebouncedSearchOptions = {}) => {
  const {
    delay = 300,
    minLength = 2,
    initialValue = ''
  } = options;

  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced function to update the debounced search term
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
      setIsSearching(false);
    }, delay),
    [delay]
  );

  // Handle search input changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setIsSearching(true);
    
    // Clear the debounced search if the value is too short
    if (value.length < minLength) {
      setDebouncedSearchTerm('');
      setIsSearching(false);
      debouncedSetSearch.cancel();
    } else {
      debouncedSetSearch(value);
    }
  }, [minLength, debouncedSetSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setIsSearching(false);
    debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  return {
    searchTerm,
    debouncedSearchTerm,
    isSearching,
    handleSearchChange,
    clearSearch,
    isValidSearch: debouncedSearchTerm.length >= minLength
  };
};

// Specialized hook for API search with loading states
export const useApiSearch = <T>(
  searchFunction: (query: string) => Promise<T[]>,
  options: UseDebouncedSearchOptions = {}
) => {
  const {
    delay = 300,
    minLength = 2,
    initialValue = ''
  } = options;

  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    searchTerm,
    debouncedSearchTerm,
    isSearching,
    handleSearchChange,
    clearSearch,
    isValidSearch
  } = useDebouncedSearch({ delay, minLength, initialValue });

  // Perform search when debounced term changes
  useEffect(() => {
    if (!isValidSearch) {
      setResults([]);
      setError(null);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const searchResults = await searchFunction(debouncedSearchTerm);
        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, isValidSearch, searchFunction]);

  return {
    searchTerm,
    debouncedSearchTerm,
    isSearching,
    loading,
    error,
    results,
    handleSearchChange,
    clearSearch,
    isValidSearch
  };
};

// Hook for filtering local data with debounced search
export const useLocalSearch = <T>(
  data: T[],
  searchFields: (keyof T)[],
  options: UseDebouncedSearchOptions = {}
) => {
  const {
    searchTerm,
    debouncedSearchTerm,
    isSearching,
    handleSearchChange,
    clearSearch,
    isValidSearch
  } = useDebouncedSearch(options);

  const filteredResults = useMemo(() => {
    if (!isValidSearch) return data;

    const searchLower = debouncedSearchTerm.toLowerCase();
    
    return data.filter(item => 
      searchFields.some(field => {
        const value = item[field];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchLower);
      })
    );
  }, [data, searchFields, debouncedSearchTerm, isValidSearch]);

  return {
    searchTerm,
    debouncedSearchTerm,
    isSearching,
    filteredResults,
    handleSearchChange,
    clearSearch,
    isValidSearch
  };
}; 