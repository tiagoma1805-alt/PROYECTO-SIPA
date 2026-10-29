// src/modules/shared/hooks/usePagination.js
// Hook para manejar paginación

import { useState, useCallback } from 'react';

export const usePagination = (initialPage = 1, initialPageSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  const goToPage = useCallback((pageNumber) => {
    setPage(Math.max(1, pageNumber));
  }, []);

  const changePageSize = useCallback((newSize) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  const resetPagination = useCallback(() => {
    setPage(1);
    setPageSize(initialPageSize);
  }, [initialPageSize]);

  return {
    page,
    pageSize,
    total,
    setTotal,
    nextPage,
    prevPage,
    goToPage,
    changePageSize,
    resetPagination,
    isFirstPage: page === 1,
    isLastPage: page * pageSize >= total
  };
};

export default usePagination;
