import { useState } from "react";
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
import "./TaskModule.css";
import siteTraceLogo from "./assets/SiteTrace-logo.svg";
import { TemplatesModule } from "./components/TemplateModule";
import { CollectedDataPage } from "./components/collected-data/CollectedDataPage";
import { sampleCollectedRecords } from "./components/collected-data/sampleCollectedRecords";
import type { ReviewStatus } from "./components/collected-data/collectedDataTypes";
import "./ModuleCompletion.css";

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

type Page =
  | "overview"
  | "supervisors"
  | "templates"
  | "tasks"
  | "create"
  | "details"
  | "collected";

const menuItems = [
  { label: "Overview", icon: House },
  { label: "Supervisors", icon: UsersRound },
  { label: "Warehouses", icon: Warehouse },
  { label: "Templates", icon: FileText },
  { label: "Tasks", icon: ClipboardList },
  { label: "Collected data", icon: ChartNoAxesColumn },
  { label: "Alerts", icon: Bell },
];

// Menu items that open a page. The others belong to other modules.
const PAGE_OF: Record<string, Page> = {
  Overview: "overview",
  Supervisors: "supervisors",
  Templates: "templates",
  Tasks: "tasks",
  "Collected data": "collected",
};

function App() {
  const [page, setPage] = useState<Page>("templates");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [isTemplateEditing, setIsTemplateEditing] = useState(false);

  // Collected data module (another member)
  const [records, setRecords] = useState(sampleCollectedRecords);

  // Task module (M4)
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
        { at: new Date().toLocaleString(), by: "Dinesh", action, note },
      ],
    }));

  // Approve completes the task; reject sends it back to the worker.
  const reviewSubmission = (
    id: string,
    decision: "Approved" | "Rejected",
    note: string,
  ) => {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;
    const taskStatus: TaskStatus = decision === "Approved" ? "Complete" : "In progress";
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: decision, reviewNote: note } : s)),
    );
    setTasks((prev) =>
      prev.map((t) => (t.code === sub.taskCode ? { ...t, status: taskStatus } : t)),
    );
    addEvent(id, decision, note);
  };

  // Rejected work goes to a worker again.
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

  const current = page === "details" ? tasks.find((t) => t.id === taskId) : undefined;
  const activePage: Page = page === "create" || page === "details" ? "tasks" : page;
  const isM4Page =
    page === "overview" ||
    page === "supervisors" ||
    page === "tasks" ||
    page === "create" ||
    page === "details";

  return (
    <ReviewContext.Provider value={{ history, reassign: reassignSubmission }}>
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
              const target = PAGE_OF[item.label];

              if (target) {
                const isActive = activePage === target;
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`nav-item ${isActive ? "nav-item--active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                    disabled={isTemplateEditing}
                    onClick={() => setPage(target)}
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
            {page === "templates" && (
              <TemplatesModule onEditingChange={setIsTemplateEditing} />
            )}

            {page === "collected" && (
              <CollectedDataPage records={records} onReview={reviewRecord} />
            )}

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
          </main>
        </div>
      </div>
    </ReviewContext.Provider>
  );
}

export default App;