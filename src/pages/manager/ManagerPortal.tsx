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
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { sendActivationEmail } from "../../services/emailService";
import "../../App.css";
import "../../TaskModule.css";
import siteTraceLogo from "../../assets/SiteTrace-logo.svg";
import { TemplatesModule } from "../../components/TemplateModule";
import { CollectedDataPage } from "../../components/collected-data/CollectedDataPage";
import { sampleCollectedRecords } from "../../components/collected-data/sampleCollectedRecords";
import type { ReviewDecision } from "../../components/collected-data/collectedDataTypes";
import "../../ModuleCompletion.css";

// Deemantha's Warehouse Module (Module 2)
import "../../WarehouseModule.css";
import WarehouseFilters from "../../components/WarehouseFilters";
import WarehouseTable from "../../components/WarehouseTable";
import WarehouseDetail from "../../components/WarehouseDetail";
import AddWarehouseModal from "../../components/AddWarehouseModal";
import { warehouseService } from "../../services/warehouseService";
import type { Warehouse } from "../../types";

// Task Management Module (Module 4)
import { OverviewPage } from "../../components/OverviewPage";
import { SupervisorsPage } from "../../components/SupervisorsPage";
import { TaskManagementPage } from "../../components/TaskManagementPage";
import { CreateTaskPage } from "../../components/CreateTaskPage";
import { TaskDetailsPage } from "../../components/TaskDetailsPage";
import { initialTasks } from "../../components/taskTypes";
import type { NewTask, Task } from "../../components/taskTypes";
import { initialSupervisors } from "../../components/supervisorTypes";
import type { NewSupervisor, Supervisor } from "../../components/supervisorTypes";
import { initialSubmissions } from "../../components/submissionTypes";
import type { Submission } from "../../components/submissionTypes";
import { ReviewContext } from "../../components/reviewContext";
import type { ReviewEvent } from "../../components/reviewContext";

// Alerts, Notifications & Audit Log Module (Module 5)
import { canViewAudit } from "../../components/alerts/lib/permissions";
import type { AlertsTab, Nav } from "../../components/alerts/navigation";
import { AlertBanner } from "../../components/alerts/parts/AlertBanner";
import { NotificationBell } from "../../components/alerts/parts/NotificationBell";
import { Toaster } from "../../components/alerts/parts/Toaster";
import { AlertDetailsPage } from "../../components/alerts/pages/AlertDetailsPage";
import { AlertsPage } from "../../components/alerts/pages/AlertsPage";
import { AuditLogPage } from "../../components/alerts/pages/AuditLogPage";
import { NotificationsPage } from "../../components/alerts/pages/NotificationsPage";
import { RuleEditorPage } from "../../components/alerts/pages/RuleEditorPage";
import { useSessionUser } from "../../components/alerts/session";

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

function ManagerShell() {
  const navigate = useNavigate();
  const { user, organization, logout } = useAuth();

  const [page, setPage] = useState<Page>("overview");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [isTemplateEditing, setIsTemplateEditing] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

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

  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [warehouseSearchTerm, setWarehouseSearchTerm] = useState("");
  const [warehouseStatusFilter, setWarehouseStatusFilter] = useState<string>("All");
  const [warehousePage, setWarehousePage] = useState(1);
  const [warehouseLimit] = useState(10);
  const [warehouseTotal, setWarehouseTotal] = useState(0);
  const [warehouseTotalPages, setWarehouseTotalPages] = useState(1);
  const [isAddWarehouseModalOpen, setIsAddWarehouseModalOpen] = useState(false);

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    let isMounted = true;
    const fetchWarehouses = async () => {
      try {
        setIsLoadingWarehouses(true);
        setWarehouseError(null);
        const data = await warehouseService.getWarehouses(
          warehouseSearchTerm,
          warehouseStatusFilter,
          warehousePage,
          warehouseLimit
        );
        if (isMounted) {
          setWarehouses(data.items);
          setWarehouseTotal(data.total);
          setWarehouseTotalPages(data.totalPages);
        }
      } catch (err: any) {
        if (isMounted) {
          setWarehouseError(err.message || "Failed to load warehouses");
        }
      } finally {
        if (isMounted) {
          setIsLoadingWarehouses(false);
        }
      }
    };

    fetchWarehouses();

    return () => {
      isMounted = false;
    };
  }, [
    refreshTrigger,
    warehouseSearchTerm,
    warehouseStatusFilter,
    warehousePage,
    warehouseLimit,
  ]);

  const handleAddWarehouse = async (data: {
    name: string;
    city: string;
    address?: string;
    supervisor: string;
  }) => {
    try {
      await warehouseService.addWarehouse(data);
      setIsAddWarehouseModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      alert(`Error creating warehouse: ${err.message}`);
    }
  };

  const handleDeleteWarehouse = async (warehouse: Warehouse) => {
    if (confirm(`Are you sure you want to delete ${warehouse.name}?`)) {
      try {
        await warehouseService.deleteWarehouse(warehouse.id);
        setSelectedWarehouse(null);
        triggerRefresh();
      } catch (err: any) {
        alert(`Error deleting warehouse: ${err.message}`);
      }
    }
  };

  // -------------------------------------------------------------
  // Task Management State
  // -------------------------------------------------------------
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("app_tasks");
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [supervisors, setSupervisors] = useState<Supervisor[]>(() => {
    const saved = localStorage.getItem("app_supervisors");
    return saved ? JSON.parse(saved) : initialSupervisors;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem("app_submissions");
    return saved ? JSON.parse(saved) : initialSubmissions;
  });

  const [reviewHistory, setReviewHistory] = useState<Record<string, ReviewEvent[]>>({});

  useEffect(() => {
    localStorage.setItem("app_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("app_supervisors", JSON.stringify(supervisors));
  }, [supervisors]);

  useEffect(() => {
    localStorage.setItem("app_submissions", JSON.stringify(submissions));
  }, [submissions]);

  const activeSupervisorNames = supervisors
    .filter((s) => s.status === "Active")
    .map((s) => s.name);

  const createTask = (payload: NewTask) => {
    const newTask: Task = {
      ...payload,
      id: String(Date.now()),
      code: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "Assigned",
      assigneeType: null,
      assignee: null,
    };
    setTasks((prev) => [newTask, ...prev]);
    setPage("tasks");
  };

  const updateTask = (id: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setPage("tasks");
  };

  const registerSupervisor = (data: NewSupervisor) => {
    const s: Supervisor = {
      ...data,
      id: `s${Date.now()}`,
      status: "Pending",
      activationSent: false,
    };
    setSupervisors((prev) => [...prev, s]);
  };

  const sendActivation = async (id: string) => {
    const supervisor = supervisors.find((s) => s.id === id);
    setSupervisors((prev) =>
      prev.map((s) => (s.id === id ? { ...s, activationSent: true } : s))
    );
    if (supervisor) {
      try {
        const ws = organization?.workspaceCode || "NOVA-7K3P";
        const origin = window.location.origin || "http://localhost:5173";
        await sendActivationEmail({
          toEmail: supervisor.email,
          managerName: supervisor.name,
          workspaceCode: ws,
          activationUrl: `${origin}/activate-account?ws=${encodeURIComponent(ws)}&email=${encodeURIComponent(supervisor.email)}`,
        });
      } catch (err) {
        console.warn("Real email dispatch fallback:", err);
      }
    }
  };

  const reviewSubmission = (
    id: string,
    decision: "Approved" | "Rejected",
    note: string
  ) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: decision, reviewNote: note } : s
      )
    );
    const event: ReviewEvent = {
      at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      by: "Manager",
      action: decision,
      note,
    };
    setReviewHistory((prev) => ({
      ...prev,
      [id]: [...(prev[id] ?? []), event],
    }));
  };

  const reassign = (submissionId: string, worker: string) => {
    const s = submissions.find((x) => x.id === submissionId);
    if (!s) return;
    const task = tasks.find((t) => t.code === s.taskCode);
    if (task) {
      updateTask(task.id, { assignee: worker, status: "In progress" });
    }
  };

  const handleReviewRecord = async (
    id: string,
    status: ReviewDecision,
    note: string
  ) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              reviewStatus: status,
              reviewNote: note,
              reviewedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const current = tasks.find((t) => t.id === taskId);
  const goTasks = () => setPage("tasks");

  const alertsNav: Nav = {
    openAlerts: (tab) => {
      setAlertsTab(tab);
      setPage("alerts");
    },
    openAlert: (id: string) => {
      setSelectedAlertId(id);
      setPage("alert-details");
    },
    openRule: (id?: string) => {
      setEditingRuleId(id);
      setPage("rule-editor");
    },
    openAudit: () => setPage("audit"),
    openNotifications: () => setPage("notifications"),
  };

  const isAlertsPage =
    page === "alerts" ||
    page === "alert-details" ||
    page === "rule-editor" ||
    page === "audit" ||
    page === "notifications";

  const isM4Page =
    page === "overview" ||
    page === "supervisors" ||
    page === "tasks" ||
    page === "create" ||
    page === "details";

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <ReviewContext.Provider
      value={{
        history: reviewHistory,
        reassign,
      }}
    >
      <div className="manager-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="brand">
            <img className="brand-logo" src={siteTraceLogo} alt="SiteTrace Logo" />
          </div>

          <div className="organization-card">
            <strong>{organization?.name || "Nova Industries"}</strong>
            <small>Manager</small>
          </div>

          <nav className="sidebar-nav" aria-label="Manager navigation">
            {menuItems.map((item) => {
              if (item.label === "Audit log" && !canViewAudit(sessionUser.role)) {
                return null;
              }

              const target = PAGE_OF[item.label];
              const Icon = item.icon;
              const isActive =
                item.label === "Alerts"
                  ? isAlertsPage && page !== "audit"
                  : item.label === "Audit log"
                  ? page === "audit"
                  : page === target ||
                    (item.label === "Tasks" && (page === "create" || page === "details"));

              if (target) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    disabled={isTemplateEditing}
                    className={`nav-item ${isActive ? "nav-item--active" : ""}`}
                    onClick={() => {
                      if (target === "warehouses") {
                        setSelectedWarehouse(null);
                      }
                      if (target === "alerts") {
                        alertsNav.openAlerts();
                        return;
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
                <div className={`nav-item ${isActive ? "nav-item--active" : ""}`} key={item.label}>
                  <Icon size={17} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <div className="profile">
              <span className="avatar avatar--small">
                {user?.avatarInitials || "MG"}
              </span>
              <div>
                <strong>{user?.name || "Manager"}</strong>
                <small>{user?.role === "MANAGER" ? "Manager" : "Team Member"}</small>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSignOutModalOpen(true)}
              className="nav-item sign-out cursor-pointer text-left w-full border-none bg-transparent hover:bg-slate-100/50"
              title="Sign Out"
            >
              <LogOut size={17} strokeWidth={1.8} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* Page Content */}
        <div className="page-area">
          <header className="topbar">
            <div className="breadcrumb">
              <strong>{organization?.name || "Nova Industries"}</strong>
              <span>/ Manager</span>
            </div>

            <div className="topbar-actions">
              <button
                type="button"
                className="al-link-btn cursor-pointer"
                disabled={isTemplateEditing}
                onClick={alertsNav.openNotifications}
              >
                Notifications
              </button>
              <NotificationBell nav={alertsNav} />
              <span className="avatar">
                {user?.avatarInitials || "DW"}
              </span>
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
              <CollectedDataPage records={records} onReview={handleReviewRecord} />
            )}

            {/* TAB 3: WAREHOUSES MODULE (Module 2) */}
            {page === "warehouses" &&
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
                    style={{ marginBottom: "1.5rem" }}
                  >
                    <h1
                      className="page-title"
                      style={{ fontSize: "1.5rem", fontWeight: 700 }}
                    >
                      Warehouses
                    </h1>
                    <p
                      className="page-subtitle"
                      style={{ color: "#64748B", fontSize: "0.875rem" }}
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
                        backgroundColor: "#FEE2E2",
                        color: "#B91C1C",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        marginBottom: "1rem",
                      }}
                    >
                      {warehouseError}
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
              ))}

            {/* TAB 4: TASK MANAGEMENT & SUPERVISORS (Module 4) */}
            {isM4Page && (
              <div className="m4">
                {page === "overview" && (
                  <OverviewPage
                    onViewAlert={() => alertsNav.openAlerts()}
                    onNavigateWarehouses={() => setPage("warehouses")}
                  />
                )}
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

            {/* TAB 7: ALERTS, RULES, NOTIFICATIONS & AUDIT LOG (Module 5) */}
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

      {/* Figma Screen #3: Sign Out Confirmation Modal */}
      {isSignOutModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsSignOutModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <LogOut className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Sign out of SiteTrace?</h3>
                  <p className="text-xs text-slate-500">Your current web session will end.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSignOutModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Identity Box */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ede9fe] text-[#5542f6] flex items-center justify-center font-bold text-sm border border-purple-200">
                  {user?.avatarInitials || "DW"}
                </div>
                <div>
                  <span className="font-semibold text-slate-900 text-sm block">
                    {user?.name || "Dinesh Wijesinghe"}
                  </span>
                  <span className="text-xs text-slate-500">
                    Manager · {organization?.name || "Nova Industries"}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-mono">
                Workspace: <span className="font-semibold text-slate-700">{organization?.workspaceCode || "NOVA-7K3P"}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSignOutModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Stay signed in
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </ReviewContext.Provider>
  );
}

export const ManagerPortal = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ManagerShell />
    </QueryClientProvider>
  );
};
