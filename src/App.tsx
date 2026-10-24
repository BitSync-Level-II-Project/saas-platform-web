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

const templates: Template[] = [
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
                />

                <select className="status-select" aria-label="Filter by status">
                  <option value="all">All statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>

                <button
                  className="create-button"
                  type="button"
                  onClick={() => setPage("create")}
                >
                  Create template
                </button>
              </div>

              <TemplateTable templates={templates} />
            </>
          ) : (
            <CreateTemplatePage onBack={() => setPage("list")} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
