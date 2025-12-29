import React from 'react';
import { ArrowUpDown, Filter } from 'lucide-react';

const MobileResultsBar = ({ count, onSortClick, onFilterClick }) => {
  return (
    <div className="md:hidden flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="text-sm font-medium text-[#005D77]">
        <span className="font-bold text-[#005D77]">{count}</span> Matching Tombstones Found
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={onSortClick}
          className="flex items-center gap-1 text-sm font-semibold text-[#005D77] hover:text-[#004a5f] transition-colors"
        >
          Sort
          <ArrowUpDown className="h-4 w-4" />
        </button>
        
        <button 
          onClick={onFilterClick}
          className="flex items-center gap-1 text-sm font-semibold text-[#005D77] hover:text-[#004a5f] transition-colors"
        >
          Filter
          <Filter className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default MobileResultsBar;

