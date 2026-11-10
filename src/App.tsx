import { useEffect, useRef, useState } from 'react';
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
import siteTraceLogo from './assets/SiteTrace-logo.svg';
import './App.css';

// Deemantha's Warehouse Module (Module 2)
import WarehouseFilters from './components/WarehouseFilters';
import WarehouseTable from './components/WarehouseTable';
import WarehouseDetail from './components/WarehouseDetail';
import AddWarehouseModal from './components/AddWarehouseModal';
import { warehouseService } from './services/warehouseService';
import type { Warehouse } from './types';

// Damith's Template & Collected Data Modules
import { TemplateTable } from './components/TemplateTable';
import type { Template } from './components/TemplateTable';
import {
  CreateTemplatePage,
  type CreateTemplatePageHandle,
} from './components/CreateTemplatePage';
import { TemplatePreviewModal } from './components/TemplatePreviewModal';
import { CollectedDataPage } from './components/collected-data/CollectedDataPage';
import { sampleCollectedRecords } from './components/collected-data/sampleCollectedRecords';
import { loadSavedDrafts } from './components/templateDraftStorage';
import type { SavedTemplateDraft } from './components/templateTypes';

const sampleTemplates: Template[] = [
  {
    id: 'equipment-inspection',
    name: 'Equipment inspection',
    updated: 'today',
    warehouse: 'Colombo warehouse',
    fields: 6,
    status: 'published',
  },
  {
    id: 'loading-bay-safety',
    name: 'Loading bay safety',
    updated: 'yesterday',
    warehouse: 'Colombo warehouse',
    fields: 8,
    status: 'published',
  },
  {
    id: 'stock-condition-check',
    name: 'Stock condition check',
    updated: '18 Oct',
    warehouse: 'Galle warehouse',
    fields: 5,
    status: 'draft',
  },
];

const menuItems = [
  { label: 'Overview', icon: House, page: null },
  { label: 'Supervisors', icon: UsersRound, page: null },
  { label: 'Warehouses', icon: WarehouseIcon, page: 'warehouses' as const },
  { label: 'Templates', icon: FileText, page: 'templates' as const },
  { label: 'Tasks', icon: ClipboardList, page: null },
  {
    label: 'Collected data',
    icon: ChartNoAxesColumn,
    page: 'collected' as const,
  },
  { label: 'Alerts', icon: Bell, page: null },
];

export default function App() {
  const createTemplatePageRef = useRef<CreateTemplatePageHandle>(null);

  // Navigation: "warehouses" | "templates" | "create-template" | "collected"
  const [activeTab, setActiveTab] = useState<
    'warehouses' | 'templates' | 'create-template' | 'collected'
  >('warehouses');

  const handleNavigate = (
    target: 'warehouses' | 'templates' | 'create-template' | 'collected',
  ) => {
    if (
      activeTab === 'create-template' &&
      target !== 'create-template' &&
      createTemplatePageRef.current
    ) {
      createTemplatePageRef.current.requestLeave(() => {
        setSelectedWarehouse(null);
        setActiveTab(target);
      });
      return;
    }

    setSelectedWarehouse(null);
    setActiveTab(target);
  };

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
  const [isAddWarehouseModalOpen, setIsAddWarehouseModalOpen] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    warehouseService
      .getWarehouses(warehouseSearchTerm, warehouseStatusFilter)
      .then((data) => {
        if (!isCancelled) {
          setWarehouses(data);
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
          setIsLoadingWarehouses(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [warehouseSearchTerm, warehouseStatusFilter, refreshTrigger]);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleAddWarehouse = async (newWarehouseData: {
    name: string;
    city: string;
    address?: string;
    supervisor: string;
  }) => {
    try {
      await warehouseService.addWarehouse(newWarehouseData);
      triggerRefresh();
      setIsAddWarehouseModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create warehouse');
    }
  };

  const handleDeleteWarehouse = async (warehouse: Warehouse) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${warehouse.name}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await warehouseService.deleteWarehouse(warehouse.id);
      setSelectedWarehouse(null);
      triggerRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete warehouse');
    }
  };

  // -------------------------------------------------------------
  // Damith's Template Management State
  // -------------------------------------------------------------
  const [templateSearchText, setTemplateSearchText] = useState('');
  const [templateStatusFilter, setTemplateStatusFilter] = useState<
    'all' | 'published' | 'draft'
  >('all');
  const [draftLoadResult, setDraftLoadResult] = useState(loadSavedDrafts);
  const [selectedDraft, setSelectedDraft] = useState<SavedTemplateDraft | null>(
    null,
  );
  const [viewedTemplate, setViewedTemplate] =
    useState<SavedTemplateDraft | null>(null);

  const drafts =
    draftLoadResult.status === 'success' ? draftLoadResult.drafts : [];
  const hasDraftLoadError = draftLoadResult.status === 'error';

  function retryDraftLoad() {
    setDraftLoadResult(loadSavedDrafts());
  }

  function openNewTemplate() {
    if (hasDraftLoadError) return;
    setSelectedDraft(null);
    setActiveTab('create-template');
  }

  function continueDraft(draftId: string) {
    const draft = drafts.find((item) => item.id === draftId);
    if (!draft) return;
    setSelectedDraft(draft);
    setActiveTab('create-template');
  }

  function viewPublishedTemplate(templateId: string) {
    const template = drafts.find(
      (item) => item.id === templateId && item.status === 'published',
    );
    if (!template) return;
    setViewedTemplate(template);
  }

  function handleDraftSaved() {
    setDraftLoadResult(loadSavedDrafts());
    setSelectedDraft(null);
    setActiveTab('templates');
  }

  const warehouseLabels: Record<string, string> = {
    all: 'All warehouses',
    colombo: 'Colombo warehouse',
    galle: 'Galle warehouse',
  };

  const draftRows: Template[] = drafts.map((draft) => ({
    id: draft.id,
    name: draft.details.name,
    updated: new Date(draft.savedAt).toLocaleString(),
    warehouse:
      warehouseLabels[draft.details.warehouse] ??
      (draft.details.warehouse || 'Not selected'),
    fields: draft.fields.length,
    status: draft.status ?? 'draft',
    canContinue: draft.status !== 'published',
    canView: draft.status === 'published',
  }));

  const allTemplates: Template[] = [...draftRows, ...sampleTemplates];
  const normalizedTemplateSearch = templateSearchText.trim().toLowerCase();
  const filteredTemplates = allTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(normalizedTemplateSearch) ||
      template.warehouse.toLowerCase().includes(normalizedTemplateSearch);
    const matchesStatus =
      templateStatusFilter === 'all' ||
      template.status === templateStatusFilter;
    return matchesSearch && matchesStatus;
  });

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
            const isClickable = item.page !== null;
            const isActive =
              (item.page === 'warehouses' && activeTab === 'warehouses') ||
              (item.page === 'templates' &&
                (activeTab === 'templates' ||
                  activeTab === 'create-template')) ||
              (item.page === 'collected' && activeTab === 'collected');

            if (isClickable && item.page) {
              const target = item.page;
              return (
                <button
                  key={item.label}
                  type="button"
                  className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => handleNavigate(target)}
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

      {/* Main Content Area */}
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
          {/* TAB 1: WAREHOUSES MODULE (Module 2) */}
          {activeTab === 'warehouses' &&
            (selectedWarehouse ? (
              <WarehouseDetail
                warehouse={selectedWarehouse}
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
                <header className="page-header" style={{ marginBottom: '1.5rem' }}>
                  <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    Warehouses
                  </h1>
                  <p className="page-subtitle" style={{ color: '#64748B', fontSize: '0.875rem' }}>
                    Manage warehouses and their locations.
                  </p>
                </header>

                <WarehouseFilters
                  searchTerm={warehouseSearchTerm}
                  onSearchChange={setWarehouseSearchTerm}
                  statusFilter={warehouseStatusFilter}
                  onStatusChange={setWarehouseStatusFilter}
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
                    ⚠️ <strong>Backend Offline:</strong> {warehouseError}. Ensure backend is running (<code>npm run start:dev</code>).
                  </div>
                )}

                {isLoadingWarehouses && warehouses.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                    Loading warehouses from database...
                  </div>
                ) : (
                  <WarehouseTable
                    warehouses={warehouses}
                    onOpenWarehouse={(warehouse) => setSelectedWarehouse(warehouse)}
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

          {/* TAB 2: TEMPLATES LIST */}
          {activeTab === 'templates' && (
            <section className="templates-page" aria-labelledby="templates-title">
              <h1 id="templates-title">Templates</h1>
              <p>Reusable forms for your warehouses.</p>

              <div className="template-toolbar">
                <input
                  className="search-input"
                  type="search"
                  placeholder="Search templates"
                  aria-label="Search templates"
                  value={templateSearchText}
                  onChange={(event) => setTemplateSearchText(event.currentTarget.value)}
                />

                <select
                  className="status-select"
                  aria-label="Filter by status"
                  value={templateStatusFilter}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    if (value === 'all' || value === 'published' || value === 'draft') {
                      setTemplateStatusFilter(value);
                    }
                  }}
                >
                  <option value="all">All statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>

                <button
                  className="create-button"
                  type="button"
                  onClick={openNewTemplate}
                  disabled={hasDraftLoadError}
                >
                  Create template
                </button>
              </div>

              {draftLoadResult.status === 'error' ? (
                <section className="templates-page__storage-error" aria-labelledby="draft-load-error-title">
                  <div role="alert">
                    <h2 id="draft-load-error-title">Saved templates could not be loaded</h2>
                    <p>{draftLoadResult.message}</p>
                    <p>Saving and publishing are blocked until the saved collection can be read.</p>
                  </div>
                  <button type="button" onClick={retryDraftLoad}>
                    Retry
                  </button>
                </section>
              ) : (
                <>
                  {draftLoadResult.drafts.length === 0 && (
                    <p className="templates-page__no-saved" role="status">
                      No saved templates yet. The rows below are sample records.
                    </p>
                  )}
                  <TemplateTable
                    templates={filteredTemplates}
                    onContinue={continueDraft}
                    onView={viewPublishedTemplate}
                  />
                </>
              )}
            </section>
          )}

          {/* TAB 3: CREATE TEMPLATE PAGE */}
          {activeTab === 'create-template' && (
            <CreateTemplatePage
              ref={createTemplatePageRef}
              key={selectedDraft?.id ?? 'new-template'}
              initialDraft={selectedDraft}
              onBack={() => setActiveTab('templates')}
              onSaved={handleDraftSaved}
            />
          )}

          {/* TAB 4: COLLECTED DATA PAGE */}
          {activeTab === 'collected' && (
            <CollectedDataPage records={sampleCollectedRecords} />
          )}

          {/* Template Preview Modal */}
          {viewedTemplate && (
            <TemplatePreviewModal
              key={viewedTemplate.id}
              title={viewedTemplate.details.name}
              description={viewedTemplate.details.description}
              fields={viewedTemplate.fields}
              readOnly
              onClose={() => setViewedTemplate(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
