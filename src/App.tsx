import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Bell,
  ChartNoAxesColumn,
  ClipboardList,
  FileText,
  History,
  House,
  LogOut,
  UsersRound,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import "./App.css";
import "./TaskModule.css";
import siteTraceLogo from "./assets/SiteTrace-logo.svg";
import { TemplatesModule } from "./components/TemplateModule";
import { CollectedDataPage } from "./components/collected-data/CollectedDataPage";
import { sampleCollectedRecords } from "./components/collected-data/sampleCollectedRecords";
import type { ReviewStatus } from "./components/collected-data/collectedDataTypes";
import "./ModuleCompletion.css";

// Deemantha's Warehouse Module (Module 2)
import "./WarehouseModule.css";
import WarehouseFilters from "./components/WarehouseFilters";
import WarehouseTable from "./components/WarehouseTable";
import WarehouseDetail from "./components/WarehouseDetail";
import AddWarehouseModal from "./components/AddWarehouseModal";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import { warehouseService } from "./services/warehouseService";
import type { Warehouse } from "./types";

// Task Management Module (Module 4)
import { OverviewPage } from "./components/OverviewPage";
import { SupervisorsPage } from "./components/SupervisorsPage";
import { TaskManagementPage } from "./components/TaskManagementPage";
import { CreateTaskPage } from "./components/CreateTaskPage";
import { TaskDetailsPage } from "./components/TaskDetailsPage";
import { initialTasks } from "./components/taskTypes";
import type { NewTask, Task, TaskStatus } from "./components/taskTypes";
import { initialSupervisors } from "./components/supervisorTypes";
import type { NewSupervisor, Supervisor } from "./components/supervisorTypes";
import { initialSubmissions } from "./components/submissionTypes";
import type { Submission } from "./components/submissionTypes";
import { ReviewContext } from "./components/reviewContext";
import type { ReviewEvent } from "./components/reviewContext";

// Alerts, Notifications & Audit Log Module (Module 5)
import { canViewAudit } from "./components/alerts/lib/permissions";
import type { AlertsTab, Nav } from "./components/alerts/navigation";
import { AlertBanner } from "./components/alerts/parts/AlertBanner";
import { NotificationBell } from "./components/alerts/parts/NotificationBell";
import { Toaster } from "./components/alerts/parts/Toaster";
import { AlertDetailsPage } from "./components/alerts/pages/AlertDetailsPage";
import { AlertsPage } from "./components/alerts/pages/AlertsPage";
import { AuditLogPage } from "./components/alerts/pages/AuditLogPage";
import { NotificationsPage } from "./components/alerts/pages/NotificationsPage";
import { RuleEditorPage } from "./components/alerts/pages/RuleEditorPage";
import { useSessionUser } from "./components/alerts/session";

type Page =
  | "overview"
  | "supervisors"
  | "warehouses"
  | "templates"
  | "tasks"
  | "create"
  | "details"
  | "collected"
  | "alerts"
  | "alert-details"
  | "rule-editor"
  | "audit"
  | "notifications";

const menuItems = [
  { label: "Overview", icon: House },
  { label: "Supervisors", icon: UsersRound },
  { label: "Warehouses", icon: WarehouseIcon },
  { label: "Templates", icon: FileText },
  { label: "Tasks", icon: ClipboardList },
  { label: "Collected data", icon: ChartNoAxesColumn },
  { label: "Alerts", icon: Bell },
  { label: "Audit log", icon: History },
];

const PAGE_OF: Record<string, Page> = {
  Overview: "overview",
  Supervisors: "supervisors",
  Warehouses: "warehouses",
  Templates: "templates",
  Tasks: "tasks",
  "Collected data": "collected",
  Alerts: "alerts",
  "Audit log": "audit",
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

function Shell() {
  const [page, setPage] = useState<Page>("warehouses");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [isTemplateEditing, setIsTemplateEditing] = useState(false);

  // Alerts, Rules, Notifications & Audit Log navigation state
  const sessionUser = useSessionUser();
  const [alertsTab, setAlertsTab] = useState<AlertsTab | undefined>(undefined);
  const [selectedAlertId, setSelectedAlertId] = useState<string>("");
  const [editingRuleId, setEditingRuleId] = useState<string | undefined>(undefined);

  // Collected data module
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
  const [warehouseSearchTerm, setWarehouseSearchTerm] = useState("");
  const [warehouseStatusFilter, setWarehouseStatusFilter] = useState("All");
  const [warehousePage, setWarehousePage] = useState(1);
  const [warehouseLimit] = useState(10);
  const [warehouseTotal, setWarehouseTotal] = useState(0);
  const [warehouseTotalPages, setWarehouseTotalPages] = useState(1);
  const [isAddWarehouseModalOpen, setIsAddWarehouseModalOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(null);
  const [isDeletingWarehouse, setIsDeletingWarehouse] = useState(false);
  const [deleteWarehouseError, setDeleteWarehouseError] = useState<string | null>(null);

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
          if (data.total > 0 && warehousePage > data.totalPages) {
            setWarehousePage(data.totalPages);
            return;
          }
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
              : "Failed to connect to backend API";
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

  const handleDeleteWarehouse = (warehouse: Warehouse) => {
    setDeleteWarehouseError(null);
    setWarehouseToDelete(warehouse);
  };

  const handleConfirmDeleteWarehouse = async () => {
    if (!warehouseToDelete) return;
    setIsDeletingWarehouse(true);
    setDeleteWarehouseError(null);

    try {
      await warehouseService.deleteWarehouse(warehouseToDelete.id);
      if (selectedWarehouse && selectedWarehouse.id === warehouseToDelete.id) {
        setSelectedWarehouse(null);
      }
      setWarehouseToDelete(null);
      if (warehouses.length === 1 && warehousePage > 1) {
        setWarehousePage((prev) => Math.max(1, prev - 1));
      } else {
        triggerRefresh();
      }
    } catch (err: unknown) {
      setDeleteWarehouseError(
        err instanceof Error ? err.message : "Failed to delete warehouse",
      );
    } finally {
      setIsDeletingWarehouse(false);
    }
  };

  // -------------------------------------------------------------
  // Task Module (Module 4) State & Handlers
  // -------------------------------------------------------------
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [supervisors, setSupervisors] = useState<Supervisor[]>(initialSupervisors);
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [history, setHistory] = useState<Record<string, ReviewEvent[]>>(() =>
    Object.fromEntries(
      initialSubmissions
        .filter((s) => s.status !== "Pending")
        .map((s) => [
          s.id,
          [
            {
              at: s.submittedAt,
              by: "Dinesh",
              action: s.status as "Approved" | "Rejected",
              note: s.reviewNote,
            },
          ],
        ]),
    ),
  );

  const goTasks = () => setPage("tasks");
  const activeSupervisorNames = supervisors
    .filter((s) => s.status === "Active")
    .map((s) => s.name);

  const createTask = (data: NewTask) => {
    setTasks((prev) => {
      const last = prev.reduce(
        (max, t) => Math.max(max, Number(t.code.replace("TSK-", ""))),
        1000,
      );
      const task: Task = {
        ...data,
        id: crypto.randomUUID(),
        code: `TSK-${last + 1}`,
        status: "Assigned",
        assigneeType: null,
        assignee: null,
      };
      return [task, ...prev];
    });
    goTasks();
  };

  const updateTask = (id: string, patch: Partial<Task>) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    goTasks();
  };

  const registerSupervisor = (data: NewSupervisor) =>
    setSupervisors((prev) => [
      ...prev,
      { ...data, id: crypto.randomUUID(), status: "Pending", activationSent: false },
    ]);

  const sendActivation = (id: string) =>
    setSupervisors((prev) =>
      prev.map((s) => (s.id === id ? { ...s, activationSent: true } : s)),
    );

  const addEvent = (id: string, action: ReviewEvent["action"], note: string) =>
    setHistory((prev) => ({
      ...prev,
      [id]: [
        ...(prev[id] ?? []),
        {
          at: new Date().toISOString().slice(0, 10),
          by: "Dinesh",
          action,
          note,
        },
      ],
    }));

  const reviewSubmission = (
    id: string,
    decision: "Approved" | "Rejected",
    note: string,
  ) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: decision, reviewNote: note } : s)),
    );
    setTasks((prev) =>
      prev.map((t) => {
        const sub = submissions.find((s) => s.id === id);
        if (sub && t.code === sub.taskCode) {
          const nextStatus: TaskStatus =
            decision === "Approved" ? "Complete" : "In progress";
          return {
            ...t,
            status: nextStatus,
          };
        }
        return t;
      }),
    );
    addEvent(id, decision, note);
  };

  const reassignSubmission = (id: string, worker: string) => {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.code === sub.taskCode
          ? { ...t, assigneeType: "Worker", assignee: worker, status: "Assigned" }
          : t,
      ),
    );
    addEvent(id, "Reassigned", `Reassigned to ${worker}`);
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

  // Alerts module navigation (respects Template editor unsaved-change lock)
  const alertsNav: Nav = {
    openAlerts: (tab) => {
      if (isTemplateEditing) return;
      setAlertsTab(tab);
      setPage("alerts");
      window.scrollTo(0, 0);
    },
    openAlert: (id) => {
      if (isTemplateEditing) return;
      setSelectedAlertId(id);
      setPage("alert-details");
      window.scrollTo(0, 0);
    },
    openRule: (id) => {
      if (isTemplateEditing) return;
      setEditingRuleId(id);
      setPage("rule-editor");
      window.scrollTo(0, 0);
    },
    openAudit: () => {
      if (isTemplateEditing) return;
      setPage("audit");
      window.scrollTo(0, 0);
    },
    openNotifications: () => {
      if (isTemplateEditing) return;
      setPage("notifications");
      window.scrollTo(0, 0);
    },
  };

  const current = page === "details" ? tasks.find((t) => t.id === taskId) : undefined;
  const activePage: Page =
    page === "create" || page === "details"
      ? "tasks"
      : page === "alert-details" || page === "rule-editor" || page === "notifications"
        ? "alerts"
        : page;
  const isM4Page =
    page === "overview" ||
    page === "supervisors" ||
    page === "tasks" ||
    page === "create" ||
    page === "details";
  const isAlertsPage =
    page === "alerts" ||
    page === "alert-details" ||
    page === "rule-editor" ||
    page === "audit" ||
    page === "notifications";

  return (
    <ReviewContext.Provider value={{ history, reassign: reassignSubmission }}>
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
              const target = PAGE_OF[item.label];

              if (target) {
                const isActive = activePage === target;
                const isAuditRestricted =
                  target === "audit" && !canViewAudit(sessionUser.role);
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`nav-item ${isActive ? "nav-item--active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                    disabled={isTemplateEditing || isAuditRestricted}
                    onClick={() => {
                      if (target === "warehouses") {
                        setSelectedWarehouse(null);
                      }
                      if (target === "alerts") {
                        setAlertsTab(undefined);
                      }
                      setPage(target);
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

        {/* Page Content */}
        <div className="page-area">
          <header className="topbar">
            <div className="breadcrumb">
              <strong>Nova Industries</strong>
              <span>/ Manager</span>
            </div>

            <div className="topbar-actions">
              {page === "alerts" && (
                <button
                  type="button"
                  className="al-link-btn"
                  disabled={isTemplateEditing}
                  onClick={alertsNav.openNotifications}
                >
                  Notifications
                </button>
              )}
              <NotificationBell nav={alertsNav} />
              <span className="avatar">DW</span>
            </div>
          </header>

          <AlertBanner nav={alertsNav} />

          <main className="content">
            {/* TAB 1: TEMPLATES (Damith's Encapsulated Module) */}
            {page === "templates" && (
              <TemplatesModule onEditingChange={setIsTemplateEditing} />
            )}

            {/* TAB 2: COLLECTED DATA */}
            {page === "collected" && (
              <CollectedDataPage records={records} onReview={reviewRecord} />
            )}

            {/* TAB 3: WAREHOUSES MODULE (Module 2) */}
            {page === "warehouses" && (
              <>
                {selectedWarehouse ? (
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
                    <header className="page-header">
                      <h1 className="page-title">Warehouses</h1>
                      <p className="page-subtitle">
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
                          backgroundColor: "#FEE2E2",
                          color: "#B91C1C",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          marginBottom: "16px",
                          fontSize: "14px",
                        }}
                      >
                        ⚠️ <strong>Backend Offline:</strong> {warehouseError}.
                        Ensure backend is running (<code>npm run start:dev</code>).
                      </div>
                    )}

                    {isLoadingWarehouses && warehouses.length === 0 ? (
                      <div
                        style={{
                          padding: "40px",
                          textAlign: "center",
                          color: "#6B7280",
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
                )}

                <ConfirmDeleteModal
                  isOpen={warehouseToDelete !== null}
                  title="Delete Warehouse"
                  itemName={warehouseToDelete?.name || ""}
                  itemType="warehouse"
                  isDeleting={isDeletingWarehouse}
                  errorMessage={deleteWarehouseError}
                  onConfirm={handleConfirmDeleteWarehouse}
                  onClose={() => {
                    if (!isDeletingWarehouse) {
                      setWarehouseToDelete(null);
                      setDeleteWarehouseError(null);
                    }
                  }}
                />
              </>
            )}

            {/* TAB 4: TASK MANAGEMENT & SUPERVISORS (Module 4) */}
            {isM4Page && (
              <div className="m4">
                {page === "overview" && <OverviewPage />}
                {page === "supervisors" && (
                  <SupervisorsPage
                    supervisors={supervisors}
                    onRegister={registerSupervisor}
                    onSendActivation={sendActivation}
                  />
                )}
                {page === "tasks" && (
                  <TaskManagementPage
                    tasks={tasks}
                    submissions={submissions}
                    onCreate={() => setPage("create")}
                    onOpen={(id) => {
                      setTaskId(id);
                      setPage("details");
                    }}
                    onReview={reviewSubmission}
                  />
                )}
                {page === "create" && (
                  <CreateTaskPage
                    supervisors={activeSupervisorNames}
                    onBack={goTasks}
                    onCreate={createTask}
                  />
                )}
                {page === "details" && current && (
                  <TaskDetailsPage
                    task={current}
                    supervisors={activeSupervisorNames}
                    onBack={goTasks}
                    onUpdate={(patch) => updateTask(current.id, patch)}
                    onDelete={() => deleteTask(current.id)}
                  />
                )}
              </div>
            )}

            {/* TAB 5: ALERTS, RULES, NOTIFICATIONS & AUDIT LOG (Module 5) */}
            {isAlertsPage && (
              <div className="alerts-module">
                {page === "alerts" && (
                  <AlertsPage
                    key={alertsTab ?? "alerts"}
                    nav={alertsNav}
                    initialTab={alertsTab}
                  />
                )}
                {page === "alert-details" && (
                  <AlertDetailsPage
                    key={selectedAlertId}
                    id={selectedAlertId}
                    nav={alertsNav}
                  />
                )}
                {page === "rule-editor" && (
                  <RuleEditorPage
                    key={editingRuleId ?? "new"}
                    id={editingRuleId}
                    nav={alertsNav}
                  />
                )}
                {page === "audit" && <AuditLogPage nav={alertsNav} />}
                {page === "notifications" && <NotificationsPage nav={alertsNav} />}
              </div>
            )}
          </main>
        </div>
        <Toaster />
      </div>
    </ReviewContext.Provider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Shell />
    </QueryClientProvider>
  );
}