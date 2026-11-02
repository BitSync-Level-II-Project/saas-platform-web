import { useState } from 'react';
import {
  Bell, Building2, ChartNoAxesColumn, ClipboardList, FileText, History, House, User,
} from 'lucide-react';
import './App.css';
import { TaskManagementPage } from './components/TaskManagementPage';
import { CreateTaskPage } from './components/CreateTaskPage';
import { TaskDetailsPage } from './components/TaskDetailsPage';
import { initialTasks } from './components/taskTypes';
import type { NewTask, Task } from './components/taskTypes';
import siteTraceLogo from './assets/SiteTrace-logo.svg';

type View = { name: 'list' } | { name: 'create' } | { name: 'details'; id: string };

// Only Tasks is implemented in this module; the rest belong to other members.
const NAV = [
  { label: 'Overview', icon: House },
  { label: 'Supervisors', icon: User },
  { label: 'Warehouses', icon: Building2 },
  { label: 'Templates', icon: FileText },
  { label: 'Tasks', icon: ClipboardList },
  { label: 'Collected data', icon: ChartNoAxesColumn },
  { label: 'Alerts', icon: Bell },
  { label: 'Audit log', icon: History },
];

function App() {
  const [view, setView] = useState<View>({ name: 'list' });
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const goList = () => setView({ name: 'list' });

  const createTask = (data: NewTask) => {
    setTasks((prev) => {
      const last = prev.reduce((max, t) => Math.max(max, Number(t.code.replace('TSK-', ''))), 1000);
      const task: Task = {
        ...data,
        id: crypto.randomUUID(),
        code: `TSK-${last + 1}`,
        status: 'Assigned',
      };
      return [task, ...prev];
    });
    goList();
  };

  const updateTask = (id: string, patch: Partial<Task>) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    goList();
  };

  const current = view.name === 'details' ? tasks.find((t) => t.id === view.id) : undefined;

  return (
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
          {NAV.map(({ label, icon: Icon }) => {
            const isTasks = label === 'Tasks';
            return (
              <button
                key={label}
                type="button"
                className={`nav-item ${isTasks ? 'active' : ''}`}
                disabled={!isTasks}
                onClick={goList}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
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

        {view.name === 'list' && (
          <TaskManagementPage
            tasks={tasks}
            onCreate={() => setView({ name: 'create' })}
            onOpen={(id) => setView({ name: 'details', id })}
          />
        )}
        {view.name === 'create' && <CreateTaskPage onBack={goList} onCreate={createTask} />}
        {view.name === 'details' && current && (
          <TaskDetailsPage
            task={current}
            onBack={goList}
            onUpdate={(patch) => updateTask(current.id, patch)}
            onDelete={() => deleteTask(current.id)}
          />
        )}
      </div>
    </div>
  );
}

export default App;