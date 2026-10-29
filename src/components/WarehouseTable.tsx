import type { Warehouse } from '../types';

interface WarehouseTableProps {
  warehouses: Warehouse[];
  onOpenWarehouse?: (warehouse: Warehouse) => void;
}

export default function WarehouseTable({
  warehouses,
  onOpenWarehouse,
}: WarehouseTableProps) {
  return (
    <div className="table-container">
      <table className="warehouse-table">
        <thead>
          <tr>
            <th className="table-th">Warehouse</th>
            <th className="table-th">Locations</th>
            <th className="table-th">Supervisor</th>
            <th className="table-th">Status</th>
            <th className="table-th text-right"></th>
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

                {/* Open Action */}
                <td className="table-td text-right">
                  <button
                    className="btn-open"
                    onClick={() => onOpenWarehouse?.(warehouse)}
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Record Counter Footer */}
      <div className="table-footer">
        {warehouses.length} {warehouses.length === 1 ? 'record' : 'records'}
      </div>
    </div>
  );
}
