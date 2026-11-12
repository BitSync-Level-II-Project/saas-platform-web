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
import { useState } from "react";
import siteTraceLogo from "./assets/SiteTrace-logo.svg";
import { TemplatesModule } from "./components/TemplateModule";
import { CollectedDataPage } from "./components/collected-data/CollectedDataPage";
import { sampleCollectedRecords } from "./components/collected-data/sampleCollectedRecords";
import type { ReviewStatus } from "./components/collected-data/collectedDataTypes";
import "./ModuleCompletion.css";

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
  const [page, setPage] = useState<"list" | "collected">("list");
  const [isTemplateEditing, setIsTemplateEditing] = useState(false);
  const [records, setRecords] = useState(sampleCollectedRecords);

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
              item.label === "Templates"
                ? "list"
                : item.label === "Collected data"
                  ? "collected"
                  : null;

            const isActive =
              item.label === "Templates"
                ? page !== "collected"
                : item.label === "Collected data" && page === "collected";

            if (targetPage) {
              return (
                <button
                  key={item.label}
                  type="button"
                  className={`nav-item ${isActive ? "nav-item--active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  disabled={isTemplateEditing}
                  onClick={() => setPage(targetPage)}
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
          {page === "collected" ? (
            <CollectedDataPage records={records} onReview={reviewRecord} />
          ) : (
            <TemplatesModule onEditingChange={setIsTemplateEditing} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
