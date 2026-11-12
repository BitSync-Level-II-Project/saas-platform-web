import { useEffect, useState } from 'react';
import {
  Bell,
  ChartNoAxesColumn,
  ClipboardList,
  FileText,
  House,
  LogOut,
  UsersRound,
  Warehouse as WarehouseIcon,
} from 'lucide-react';
import './App.css';
import siteTraceLogo from './assets/SiteTrace-logo.svg';
import { TemplatesModule } from './components/TemplateModule';
import { CollectedDataPage } from './components/collected-data/CollectedDataPage';
import { sampleCollectedRecords } from './components/collected-data/sampleCollectedRecords';
import type { ReviewStatus } from './components/collected-data/collectedDataTypes';
import './ModuleCompletion.css';

// Deemantha's Warehouse Module (Module 2)
import WarehouseFilters from './components/WarehouseFilters';
import WarehouseTable from './components/WarehouseTable';
import WarehouseDetail from './components/WarehouseDetail';
import AddWarehouseModal from './components/AddWarehouseModal';
import { warehouseService } from './services/warehouseService';
import type { Warehouse } from './types';

const menuItems = [
  { label: 'Overview', icon: House },
  { label: 'Supervisors', icon: UsersRound },
  { label: 'Warehouses', icon: WarehouseIcon },
  { label: 'Templates', icon: FileText },
  { label: 'Tasks', icon: ClipboardList },
  { label: 'Collected data', icon: ChartNoAxesColumn },
  { label: 'Alerts', icon: Bell },
];

export default function App() {
  const [page, setPage] = useState<'warehouses' | 'templates' | 'collected'>(
    'warehouses',
  );
  const [isTemplateEditing, setIsTemplateEditing] = useState(false);
  const [records, setRecords] = useState(sampleCollectedRecords);

  // -------------------------------------------------------------
  // Deemantha's Warehouse Management State (Live PostgreSQL API)
  // -------------------------------------------------------------
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(true);
  const [warehouseError, setWarehouseError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    null,
  );
  const [warehouseSearchTerm, setWarehouseSearchTerm] = useState('');
  const [warehouseStatusFilter, setWarehouseStatusFilter] = useState('All');
  const [warehousePage, setWarehousePage] = useState(1);
  const [warehouseLimit] = useState(10);
  const [warehouseTotal, setWarehouseTotal] = useState(0);
  const [warehouseTotalPages, setWarehouseTotalPages] = useState(1);
  const [isAddWarehouseModalOpen, setIsAddWarehouseModalOpen] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    warehouseService
      .getWarehouses(
        warehouseSearchTerm,
        warehouseStatusFilter,
        warehousePage,
        warehouseLimit,
      )
      .then((data) => {
        if (!isCancelled) {
          setWarehouses(data.items);
          setWarehouseTotal(data.total);
          setWarehouseTotalPages(data.totalPages);
          setWarehouseError(null);
          setIsLoadingWarehouses(false);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          const msg =
            err instanceof Error
              ? err.message
              : 'Failed to connect to backend API';
          setWarehouseError(msg);
          setWarehouses([]);
          setWarehouseTotal(0);
          setWarehouseTotalPages(1);
          setIsLoadingWarehouses(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [
    warehouseSearchTerm,
    warehouseStatusFilter,
    warehousePage,
    warehouseLimit,
    refreshTrigger,
  ]);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleAddWarehouse = async (newWarehouseData: {
    name: string;
    city: string;
    address?: string;
    supervisor: string;
  }) => {
    await warehouseService.addWarehouse(newWarehouseData);
    triggerRefresh();
  };

  const handleDeleteWarehouse = async (warehouse: Warehouse) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${warehouse.name}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await warehouseService.deleteWarehouse(warehouse.id);
      if (selectedWarehouse && selectedWarehouse.id === warehouse.id) {
        setSelectedWarehouse(null);
      }
      triggerRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete warehouse');
    }
  };

  async function reviewRecord(
    id: string,
    reviewStatus: ReviewStatus,
    reviewNote: string,
  ): Promise<void> {
    const reviewedAt = new Date().toISOString();
    setRecords((current) =>
      current.map((record) =>
        record.id === id
          ? { ...record, reviewStatus, reviewNote, reviewedAt }
          : record,
      ),
    );
  }

  return (
    <div className="manager-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <img className="brand-logo" src={siteTraceLogo} alt="SiteTrace" />
        </div>

        <div className="organization-card">
          <strong>Nova Industries</strong>
          <small>Manager</small>
        </div>

        <nav className="sidebar-nav" aria-label="Manager navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const targetPage =
              item.label === 'Warehouses'
                ? ('warehouses' as const)
                : item.label === 'Templates'
                  ? ('templates' as const)
                  : item.label === 'Collected data'
                    ? ('collected' as const)
                    : null;

            const isActive =
              (item.label === 'Warehouses' && page === 'warehouses') ||
              (item.label === 'Templates' && page === 'templates') ||
              (item.label === 'Collected data' && page === 'collected');

            if (targetPage) {
              return (
                <button
                  key={item.label}
                  type="button"
                  className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  disabled={isTemplateEditing}
                  onClick={() => {
                    setSelectedWarehouse(null);
                    setPage(targetPage);
                  }}
                >
                  <Icon size={17} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <div className="nav-item" key={item.label}>
                <Icon size={17} strokeWidth={1.8} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="profile">
            <span className="avatar avatar--small">DW</span>
            <div>
              <strong>Dinesh</strong>
              <small>My profile</small>
            </div>
          </div>

          <div className="nav-item sign-out">
            <LogOut size={17} strokeWidth={1.8} />
            <span>Sign out</span>
          </div>
        </div>
      </aside>

      <div className="page-area">
        <header className="topbar">
          <div className="breadcrumb">
            <strong>Nova Industries</strong>
            <span>/ Manager</span>
          </div>

          <div className="topbar-actions">
            <Bell size={18} strokeWidth={1.8} aria-label="Notifications" />
            <span className="avatar">DW</span>
          </div>
        </header>

        <main className="content">
          {/* TAB 1: COLLECTED DATA */}
          {page === 'collected' && (
            <CollectedDataPage records={records} onReview={reviewRecord} />
          )}

          {/* TAB 2: TEMPLATES (Damith's Encapsulated Module) */}
          {page === 'templates' && (
            <TemplatesModule onEditingChange={setIsTemplateEditing} />
          )}

          {/* TAB 3: WAREHOUSES MODULE (Module 2) */}
          {page === 'warehouses' &&
            (selectedWarehouse ? (
              <WarehouseDetail
                warehouse={{
                  ...selectedWarehouse,
                  locations: warehouseService.getLocations(selectedWarehouse.id).length,
                }}
                onBack={() => {
                  setSelectedWarehouse(null);
                  triggerRefresh();
                }}
                onLocationAdded={triggerRefresh}
                onWarehouseUpdated={(updated) => {
                  setSelectedWarehouse(updated);
                  triggerRefresh();
                }}
                onDeleteWarehouse={handleDeleteWarehouse}
              />
            ) : (
              <section className="warehouses-section">
                <header
                  className="page-header"
                  style={{ marginBottom: '1.5rem' }}
                >
                  <h1
                    className="page-title"
                    style={{ fontSize: '1.5rem', fontWeight: 700 }}
                  >
                    Warehouses
                  </h1>
                  <p
                    className="page-subtitle"
                    style={{ color: '#64748B', fontSize: '0.875rem' }}
                  >
                    Manage warehouses and their locations.
                  </p>
                </header>

                <WarehouseFilters
                  searchTerm={warehouseSearchTerm}
                  onSearchChange={(term) => {
                    setWarehouseSearchTerm(term);
                    setWarehousePage(1);
                  }}
                  statusFilter={warehouseStatusFilter}
                  onStatusChange={(status) => {
                    setWarehouseStatusFilter(status);
                    setWarehousePage(1);
                  }}
                  onAddClick={() => setIsAddWarehouseModalOpen(true)}
                />

                {warehouseError && (
                  <div
                    style={{
                      backgroundColor: '#FEE2E2',
                      color: '#B91C1C',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      fontSize: '14px',
                    }}
                  >
                    ⚠️ <strong>Backend Offline:</strong> {warehouseError}.
                    Ensure backend is running (<code>npm run start:dev</code>).
                  </div>
                )}

                {isLoadingWarehouses && warehouses.length === 0 ? (
                  <div
                    style={{
                      padding: '40px',
                      textAlign: 'center',
                      color: '#6B7280',
                    }}
                  >
                    Loading warehouses from database...
                  </div>
                ) : (
                  <WarehouseTable
                    warehouses={warehouses}
                    total={warehouseTotal}
                    currentPage={warehousePage}
                    totalPages={warehouseTotalPages}
                    limit={warehouseLimit}
                    onPageChange={(p) => setWarehousePage(p)}
                    onOpenWarehouse={(warehouse) =>
                      setSelectedWarehouse(warehouse)
                    }
                    onDeleteWarehouse={handleDeleteWarehouse}
                  />
                )}

                <AddWarehouseModal
                  isOpen={isAddWarehouseModalOpen}
                  onClose={() => setIsAddWarehouseModalOpen(false)}
                  onAddWarehouse={handleAddWarehouse}
                />
              </section>
            ))}
        </main>
      </div>
    </div>
  );
}
