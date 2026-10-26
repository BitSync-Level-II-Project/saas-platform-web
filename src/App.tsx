import {
  Bell,
  ChartNoAxesColumn,
  ClipboardList,
  FileText,
  House,
  LogOut,
  UsersRound,
  Warehouse,
} from "lucide-react";
import "./App.css";
import { TemplateTable } from "./components/TemplateTable";
import type { Template } from "./components/TemplateTable";
import { useState } from "react";
import { CreateTemplatePage } from "./components/CreateTemplatePage";
import siteTraceLogo from "./assets/SiteTrace-logo.svg";
import { loadSavedDrafts } from "./components/templateDraftStorage";

import type { SavedTemplateDraft } from "./components/templateTypes";

const sampleTemplates: Template[] = [
  {
    id: "equipment-inspection",
    name: "Equipment inspection",
    updated: "today",
    warehouse: "Colombo warehouse",
    fields: 6,
    status: "published",
  },
  {
    id: "loading-bay-safety",
    name: "Loading bay safety",
    updated: "yesterday",
    warehouse: "Colombo warehouse",
    fields: 8,
    status: "published",
  },
  {
    id: "stock-condition-check",
    name: "Stock condition check",
    updated: "18 Oct",
    warehouse: "Galle warehouse",
    fields: 5,
    status: "draft",
  },
];

const menuItems = [
  { label: "Overview", icon: House },
  { label: "Supervisors", icon: UsersRound },
  { label: "Warehouses", icon: Warehouse },
  { label: "Templates", icon: FileText },
  { label: "Tasks", icon: ClipboardList },
  { label: "Collected data", icon: ChartNoAxesColumn },
  { label: "Alerts", icon: Bell },
];

function App() {
  const [page, setPage] = useState<"list" | "create">("list");

  const [searchText, setSearchText] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");

  const [drafts, setDrafts] = useState<SavedTemplateDraft[]>(loadSavedDrafts);

  const [selectedDraft, setSelectedDraft] = useState<SavedTemplateDraft | null>(
    null,
  );

  function openNewTemplate() {
    setSelectedDraft(null);
    setPage("create");
  }

  function continueDraft(draftId: string) {
    const draft = drafts.find((item) => item.id === draftId);

    if (!draft) {
      return;
    }

    setSelectedDraft(draft);
    setPage("create");
  }

  function handleDraftSaved() {
    setDrafts(loadSavedDrafts());
    setSelectedDraft(null);
    setPage("list");
  }
  const warehouseLabels: Record<string, string> = {
    all: "All warehouses",
    colombo: "Colombo warehouse",
    galle: "Galle warehouse",
  };

  const draftRows: Template[] = drafts.map((draft) => ({
    id: draft.id,
    name: draft.details.name,
    updated: new Date(draft.savedAt).toLocaleString(),
    warehouse:
      warehouseLabels[draft.details.warehouse] ??
      (draft.details.warehouse || "Not selected"),
    fields: draft.fields.length,
    status: draft.status ?? "draft",
    canContinue: draft.status !== "published",
  }));

  const templates: Template[] = [...draftRows, ...sampleTemplates];

  const normalizedSearch = searchText.trim().toLowerCase();

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(normalizedSearch) ||
      template.warehouse.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "all" || template.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
  return (
    <div className="manager-layout">
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

            return (
              <div
                className={`nav-item ${
                  item.label === "Templates" ? "nav-item--active" : ""
                }`}
                key={item.label}
                aria-current={item.label === "Templates" ? "page" : undefined}
              >
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
          {page === "list" ? (
            <>
              <h1>Templates</h1>
              <p>Reusable forms for your warehouses.</p>

              <div className="template-toolbar">
                <input
                  className="search-input"
                  type="search"
                  placeholder="Search templates"
                  aria-label="Search templates"
                  value={searchText}
                  onChange={(event) => setSearchText(event.currentTarget.value)}
                />

                <select
                  className="status-select"
                  aria-label="Filter by status"
                  value={statusFilter}
                  onChange={(event) => {
                    const value = event.currentTarget.value;

                    if (
                      value === "all" ||
                      value === "published" ||
                      value === "draft"
                    ) {
                      setStatusFilter(value);
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
                >
                  Create template
                </button>
              </div>
              <TemplateTable
                templates={filteredTemplates}
                onContinue={continueDraft}
              />
            </>
          ) : (
            <CreateTemplatePage
              key={selectedDraft?.id ?? "new-template"}
              initialDraft={selectedDraft}
              onBack={() => setPage("list")}
              onSaved={handleDraftSaved}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
