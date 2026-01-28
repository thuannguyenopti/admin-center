"use client";

import { useFilterPanel } from "../context/FilterPanelContext";
import ContentSubNav from "./ContentSubNav";
import FilterPanel from "./FilterPanel";

export default function ContentManagerSidebar() {
  const { 
    isFilterPanelOpen, 
    setIsFilterPanelOpen,
    filters,
    filterOptions,
    toggleFilter,
  } = useFilterPanel();

  if (isFilterPanelOpen) {
    return (
      <FilterPanel
        filters={filters}
        filterOptions={filterOptions}
        onToggleFilter={toggleFilter}
        onClose={() => setIsFilterPanelOpen(false)}
      />
    );
  }

  return <ContentSubNav />;
}
