import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Bell, Building2, ChartNoAxesColumn, ClipboardList, FileText, History, House, LogOut, User,
} from 'lucide-react';
import './App.css';
import { OverviewPage } from './components/OverviewPage';
import { SupervisorsPage } from './components/SupervisorsPage';
import { TaskManagementPage } from './components/TaskManagementPage';
import { CreateTaskPage } from './components/CreateTaskPage';
import { TaskDetailsPage } from './components/TaskDetailsPage';
import { initialTasks } from './components/taskTypes';
import type { NewTask, Task, TaskStatus } from './components/taskTypes';
import { initialSupervisors } from './components/supervisorTypes';
import type { NewSupervisor, Supervisor } from './components/supervisorTypes';
import { initialSubmissions } from './components/submissionTypes';
import type { Submission } from './components/submissionTypes';
import { ReviewContext } from './components/reviewContext';
import type { ReviewEvent } from './components/reviewContext';
import siteTraceLogo from './assets/SiteTrace-logo.svg';

type Section = 'overview' | 'supervisors' | 'list';
type View = { name: Section } | { name: 'create' } | { name: 'details'; id: string };

// Pages without a section belong to other members' modules.
const NAV: { label: string; icon: LucideIcon; section?: Section }[] = [
  { label: 'Overview', icon: House, section: 'overview' },
  { label: 'Supervisors', icon: User, section: 'supervisors' },
  { label: 'Warehouses', icon: Building2 },
  { label: 'Templates', icon: FileText },
  { label: 'Tasks', icon: ClipboardList, section: 'list' },
  { label: 'Collected data', icon: ChartNoAxesColumn },
  { label: 'Alerts', icon: Bell },
  { label: 'Audit log', icon: History },
];

function App() {
  const [view, setView] = useState<View>({ name: 'overview' });
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [supervisors, setSupervisors] = useState<Supervisor[]>(initialSupervisors);
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [history, setHistory] = useState<Record<string, ReviewEvent[]>>(() =>
    Object.fromEntries(
      initialSubmissions
        .filter((s) => s.status !== 'Pending')
        .map((s) => [
          s.id,
          [{ at: s.submittedAt, by: 'Dinesh', action: s.status as 'Approved' | 'Rejected', note: s.reviewNote }],
        ])
    )
  );
  const [signedOut, setSignedOut] = useState(false);

  const goList = () => setView({ name: 'list' });
  const activeSection: Section =
    view.name === 'create' || view.name === 'details' ? 'list' : view.name;
  const activeSupervisorNames = supervisors.filter((s) => s.status === 'Active').map((s) => s.name);

  const createTask = (data: NewTask) => {
    setTasks((prev) => {
      const last = prev.reduce((max, t) => Math.max(max, Number(t.code.replace('TSK-', ''))), 1000);
      const task: Task = {
        ...data,
        id: crypto.randomUUID(),
        code: `TSK-${last + 1}`,
        status: 'Assigned',
        assigneeType: null,
        assignee: null,
      };
      return [task, ...prev];
    });
    setView({ name: 'list' });
  };

  const updateTask = (id: string, patch: Partial<Task>) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    goList();
  };

  const registerSupervisor = (data: NewSupervisor) =>
    setSupervisors((prev) => [
      ...prev,
      { ...data, id: crypto.randomUUID(), status: 'Pending', activationSent: false },
    ]);

  const sendActivation = (id: string) =>
    setSupervisors((prev) => prev.map((s) => (s.id === id ? { ...s, activationSent: true } : s)));

  const addEvent = (id: string, action: ReviewEvent['action'], note: string) =>
    setHistory((prev) => ({
      ...prev,
      [id]: [...(prev[id] ?? []), { at: new Date().toLocaleString(), by: 'Dinesh', action, note }],
    }));

  // Approve completes the task; reject sends it back to the worker.
  const reviewSubmission = (id: string, decision: 'Approved' | 'Rejected', note: string) => {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;
    const taskStatus: TaskStatus = decision === 'Approved' ? 'Complete' : 'In progress';
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: decision, reviewNote: note } : s))
    );
    setTasks((prev) => prev.map((t) => (t.code === sub.taskCode ? { ...t, status: taskStatus } : t)));
    addEvent(id, decision, note);
  };

  // Rejected work goes to a worker again.
  const reassignSubmission = (id: string, worker: string) => {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.code === sub.taskCode
          ? { ...t, assigneeType: 'Worker', assignee: worker, status: 'Assigned' }
          : t
      )
    );
    addEvent(id, 'Reassigned', `Reassigned to ${worker}`);
  };

  const current = view.name === 'details' ? tasks.find((t) => t.id === view.id) : undefined;

  // Mock sign-out. Real authentication belongs to the identity module.
  if (signedOut) {
    return (
      <div className="signed-out">
        <img src={siteTraceLogo} alt="SiteTrace" />
        <h1>You have signed out</h1>
        <p className="muted">Sign in again to continue.</p>
        <button type="button" className="primary-btn" onClick={() => { setSignedOut(false); setView({ name: 'overview' }); }}>
          Sign in
        </button>
      </div>
    );
  }

  return (
    <ReviewContext.Provider value={{ history, reassign: reassignSubmission }}>
      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <img src={siteTraceLogo} alt="SiteTrace" />
          </div>
          <div className="org-card">
            <strong>Nova Industries</strong>
            <span>Manager</span>
          </div>
          <nav className="sidebar-nav">
            {NAV.map(({ label, icon: Icon, section }) => (
              <button
                key={label}
                type="button"
                className={`nav-item ${section && section === activeSection ? 'active' : ''}`}
                disabled={!section}
                onClick={() => section && setView({ name: section })}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="profile">
              <div className="avatar small">DW</div>
              <div>
                <strong>Dinesh</strong>
                <span>My profile</span>
              </div>
            </div>
            <button type="button" className="nav-item signout" onClick={() => setSignedOut(true)}>
              <LogOut size={20} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        <div className="main-area">
          <header className="topbar">
            <div className="crumb">
              <strong>Nova Industries</strong>
              <span>/ Manager</span>
            </div>
            <div className="topbar-right">
              <span className="bell">
                <Bell size={22} />
                <i className="bell-dot" />
              </span>
              <div className="avatar">DW</div>
            </div>
          </header>

          {view.name === 'overview' && <OverviewPage />}
          {view.name === 'supervisors' && (
            <SupervisorsPage
              supervisors={supervisors}
              onRegister={registerSupervisor}
              onSendActivation={sendActivation}
            />
          )}
          {view.name === 'list' && (
            <TaskManagementPage
              tasks={tasks}
              submissions={submissions}
              onCreate={() => setView({ name: 'create' })}
              onOpen={(id) => setView({ name: 'details', id })}
              onReview={reviewSubmission}
            />
          )}
          {view.name === 'create' && (
            <CreateTaskPage supervisors={activeSupervisorNames} onBack={goList} onCreate={createTask} />
          )}
          {view.name === 'details' && current && (
            <TaskDetailsPage
              task={current}
              supervisors={activeSupervisorNames}
              onBack={goList}
              onUpdate={(patch) => updateTask(current.id, patch)}
              onDelete={() => deleteTask(current.id)}
            />
          )}
        </div>
      </div>
    </ReviewContext.Provider>
  );
}

export default App;