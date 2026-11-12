import type { Warehouse } from '../types';

interface WarehouseTableProps {
  warehouses: Warehouse[];
  total?: number;
  currentPage?: number;
  totalPages?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  onOpenWarehouse?: (warehouse: Warehouse) => void;
  onDeleteWarehouse?: (warehouse: Warehouse) => void;
}

export default function WarehouseTable({
  warehouses,
  total = warehouses.length,
  currentPage = 1,
  totalPages = 1,
  limit = 10,
  onPageChange,
  onOpenWarehouse,
  onDeleteWarehouse,
}: WarehouseTableProps) {
  const startRecord = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, total);

  return (
    <div className="table-container">
      <table className="warehouse-table">
        <thead>
          <tr>
            <th className="table-th">Warehouse</th>
            <th className="table-th">Locations</th>
            <th className="table-th">Supervisor</th>
            <th className="table-th">Status</th>
            <th className="table-th text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty-state">
                No warehouses found matching your search.
              </td>
            </tr>
          ) : (
            warehouses.map((warehouse) => (
              <tr key={warehouse.id} className="table-row">
                {/* Warehouse Name and City */}
                <td className="table-td">
                  <div className="warehouse-name">{warehouse.name}</div>
                  <div className="warehouse-city">{warehouse.city}</div>
                </td>

                {/* Locations Count */}
                <td className="table-td text-muted">
                  {warehouse.locations}
                </td>

                {/* Supervisor Name */}
                <td className="table-td text-dark">
                  {warehouse.supervisor}
                </td>

                {/* Status Badge */}
                <td className="table-td">
                  <span className="badge-active">
                    {warehouse.status}
                  </span>
                </td>

                {/* Actions: Open & Delete */}
                <td className="table-td text-right">
                  <div className="table-actions">
                    <button
                      className="btn-open"
                      onClick={() => onOpenWarehouse?.(warehouse)}
                      type="button"
                    >
                      Open
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => onDeleteWarehouse?.(warehouse)}
                      type="button"
                      title="Delete warehouse"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Record Counter & Pagination Controls Footer */}
      <div className="table-footer">
        <div className="table-footer-info">
          {total === 0
            ? '0 records'
            : `Showing ${startRecord}–${endRecord} of ${total} records`}
        </div>

        {totalPages > 1 && onPageChange && (
          <nav className="pagination-controls" aria-label="Warehouse pagination">
            <button
              type="button"
              className="pagination-btn"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="pagination-info" aria-current="page">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="pagination-btn"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              aria-label="Next page"
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
