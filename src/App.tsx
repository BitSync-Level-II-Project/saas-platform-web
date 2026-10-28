import { useState } from 'react';
import { ClipboardList, UserCheck } from 'lucide-react';
import './App.css';
import { TaskManagementPage } from './components/TaskManagementPage';
import { TaskAssignmentPage } from './components/TaskAssignmentPage';
import { initialTasks } from './components/taskTypes';
import type { Task } from './components/taskTypes';
import siteTraceLogo from './assets/SiteTrace-logo.svg';

function App() {
  const [page, setPage] = useState<'tasks' | 'assignments'>('tasks');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo"><img src={siteTraceLogo} alt="SiteTrace Logo" /></div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${page === 'tasks' ? 'active' : ''}`} onClick={() => setPage('tasks')}>
            <ClipboardList size={20} /><span>Tasks</span>
          </button>
          <button className={`nav-item ${page === 'assignments' ? 'active' : ''}`} onClick={() => setPage('assignments')}>
            <UserCheck size={20} /><span>Assignments</span>
          </button>
        </nav>
      </aside>

      <main className="main-content">
        {page === 'tasks' ? (
          <TaskManagementPage tasks={tasks} setTasks={setTasks} />
        ) : (
          <TaskAssignmentPage tasks={tasks} setTasks={setTasks} />
        )}
      </main>
    </div>
  );
}

export default App;