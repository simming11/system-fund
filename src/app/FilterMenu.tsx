// FilterMenu.tsx
import React from 'react';

interface FilterMenuProps {
  onFilterChange: (filter: string) => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({ onFilterChange }) => {
  return (
    <div className="flex space-x-4 mb-6">
      <button className="text-gray-700 font-bold" onClick={() => onFilterChange('All')}>
        All
      </button>
      <button className="text-gray-700" onClick={() => onFilterChange('Posts')}>
        Posts
      </button>
      <button className="text-gray-700" onClick={() => onFilterChange('People')}>
        People
      </button>
      <button className="text-gray-700" onClick={() => onFilterChange('Photos')}>
        Photos
      </button>
      <button className="text-gray-700" onClick={() => onFilterChange('Videos')}>
        Videos
      </button>
      <button className="text-gray-700" onClick={() => onFilterChange('Marketplace')}>
        Marketplace
      </button>
      <button className="text-gray-700" onClick={() => onFilterChange('Pages')}>
        Pages
      </button>
      <button className="text-gray-700" onClick={() => onFilterChange('Places')}>
        Places
      </button>
      <button className="text-gray-700" onClick={() => onFilterChange('Groups')}>
        Groups
      </button>
      <button className="text-gray-700" onClick={() => onFilterChange('Events')}>
        Events
      </button>
    </div>
  );
};

export default FilterMenu;
