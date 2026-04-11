import { useState, useMemo } from 'react';

/**
 * Hook for managing pagination state
 */
export function usePagination<T>(data: T[], itemsPerPage: number = 5) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Get current page data
  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  // Reset to page 1 when data changes significantly
  const resetPagination = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    currentPageData,
    itemsPerPage,
    resetPagination,
  };
}
