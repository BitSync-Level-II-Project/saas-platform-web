import { Search } from 'lucide-react';

interface WarehouseFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  onAddClick: () => void;
}

export default function WarehouseFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onAddClick,
}: WarehouseFiltersProps) {
  return (
    <div className="filter-bar">
      {/* Left side: Search input and Status dropdown */}
      <div className="filter-left">
        {/* Search Input */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search warehouses"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Status Dropdown */}
        <select
          className="status-select"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Right side: Add warehouse button */}
      <button className="btn-primary" onClick={onAddClick}>
        Add warehouse
      </button>
    </div>
  );
}