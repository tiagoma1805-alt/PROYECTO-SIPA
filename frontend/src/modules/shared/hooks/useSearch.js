// src/modules/shared/hooks/useSearch.js
// Hook para manejar búsqueda

import { useState, useCallback, useMemo } from 'react';

export const useSearch = (initialTerm = '') => {
  const [searchTerm, setSearchTerm] = useState(initialTerm);
  const [searchQuery, setSearchQuery] = useState(initialTerm);

  const handleSearch = useCallback(() => {
    setSearchQuery(searchTerm);
  }, [searchTerm]);

  const handleClear = useCallback(() => {
    setSearchTerm('');
    setSearchQuery('');
  }, []);

  const handleChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const results = useMemo(() => {
    return {
      term: searchTerm,
      query: searchQuery,
      isActive: searchQuery !== ''
    };
  }, [searchTerm, searchQuery]);

  return {
    searchTerm,
    searchQuery,
    setSearchTerm,
    setSearchQuery,
    handleSearch,
    handleClear,
    handleChange,
    results
  };
};

export default useSearch;
