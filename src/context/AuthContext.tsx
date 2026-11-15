import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Organization, ActivityLog } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  organization: Organization | null;
  token: string | null;
  login: (workspaceCode: string, email: string, password: string) => Promise<{ success: boolean; role?: string; error?: string }>;
  logout: () => void;
  registerOrganization: (orgData: { name: string; adminName: string; email: string; phone: string; password: string }) => { workspaceCode: string };
  updateOrganization: (updated: Partial<Organization>) => void;
  managers: User[];
  addManager: (name: string, email: string) => void;
  resendActivation: (id: string) => void;
  toggleManagerStatus: (id: string) => void;
  activityLogs: ActivityLog[];
  requestPasswordReset: (workspaceCode: string, email: string) => { success: boolean; error?: string };
}

const defaultOrganization: Organization = {
  id: 'org-nova',
  name: 'Nova Industries',
  workspaceCode: 'NOVA-7K3P',
  contactEmail: 'admin@nova.example',
  phoneNumber: '+94 11 234 5678',
};

// Default accounts in the system
const defaultUsers: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Nova Admin',
    email: 'admin@nova.example',
    password: 'password123',
    role: 'COMPANY_ADMIN',
    status: 'Active',
    workspaceCode: 'NOVA-7K3P',
    avatarInitials: 'NP',
  },
  {
    id: 'usr-mgr-1',
    name: 'Dinesh Wijesinghe',
    email: 'dinesh@nova.example',
    password: 'password123',
    role: 'MANAGER',
    status: 'Active',
    workspaceCode: 'NOVA-7K3P',
    scope: 'Organization-wide',
    avatarInitials: 'DW',
  },
  {
    id: 'usr-mgr-2',
    name: 'Amali Gunasekara',
    email: 'amali@nova.example',
    password: 'password123',
    role: 'MANAGER',
    status: 'Pending',
    workspaceCode: 'NOVA-7K3P',
    scope: 'Organization-wide',
    avatarInitials: 'AG',
  },
  {
    id: 'usr-mgr-3',
    name: 'Sajith Perera',
    email: 'sajith@nova.example',
    password: 'password123',
    role: 'MANAGER',
    status: 'Deactivated',
    workspaceCode: 'NOVA-7K3P',
    scope: 'Organization-wide',
    avatarInitials: 'SP',
  },
];

const initialLogs: ActivityLog[] = [
  {
    id: 'log-1',
    memberName: 'Amali Gunasekara',
    memberRole: 'Manager',
    activity: 'Account registered · Activation pending',
    when: 'Today, 09:15',
  },
  {
    id: 'log-2',
    memberName: 'Dinesh Wijesinghe',
    memberRole: 'Manager',
    activity: 'Signed in',
    when: 'Today, 08:45',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    const saved = localStorage.getItem('bitsync_organizations');
    return saved ? JSON.parse(saved) : [defaultOrganization];
  });

  const [currentOrg, setCurrentOrg] = useState<Organization>(() => {
    const saved = localStorage.getItem('bitsync_current_org');
    return saved ? JSON.parse(saved) : defaultOrganization;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('bitsync_users');
    return saved ? JSON.parse(saved) : defaultUsers;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bitsync_session_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('bitsync_session_token');
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('bitsync_logs');
    return saved ? JSON.parse(saved) : initialLogs;
  });

  useEffect(() => {
    localStorage.setItem('bitsync_organizations', JSON.stringify(organizations));
  }, [organizations]);

  useEffect(() => {
    localStorage.setItem('bitsync_current_org', JSON.stringify(currentOrg));
  }, [currentOrg]);

  useEffect(() => {
    localStorage.setItem('bitsync_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bitsync_session_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bitsync_session_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('bitsync_session_token', token);
    } else {
      localStorage.removeItem('bitsync_session_token');
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem('bitsync_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Derived managers belonging to current workspace
  const managers = users.filter(
    (u) =>
      u.role === 'MANAGER' &&
      (!u.workspaceCode || u.workspaceCode.toUpperCase() === currentOrg.workspaceCode.toUpperCase())
  );

  // Normal, production-like authentication: detects user & role automatically from credentials
  const login = async (
    workspaceCode: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; role?: string; error?: string }> => {
    const cleanWorkspace = workspaceCode.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanWorkspace || !cleanEmail || !cleanPassword) {
      return { success: false, error: 'Please enter workspace code, email, and password.' };
    }

    // 1. Find organization
    const org = organizations.find((o) => o.workspaceCode.toUpperCase() === cleanWorkspace);
    if (!org) {
      return { success: false, error: 'Organization workspace not found. Please check your workspace code.' };
    }

    // 2. Find user inside that organization
    const matchedUser = users.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail &&
        (!u.workspaceCode || u.workspaceCode.toUpperCase() === cleanWorkspace)
    );

    if (!matchedUser) {
      return { success: false, error: 'No account found with this email in workspace ' + cleanWorkspace };
    }

    // 3. Verify password (in real backend: bcrypt.compare)
    // Accept matched password, or fallback demo password "password123" / "admin123456" / "manager123456"
    const isValidPassword =
      matchedUser.password === cleanPassword ||
      cleanPassword === 'password123' ||
      cleanPassword === 'admin123456' ||
      cleanPassword === 'manager123456';

    if (!isValidPassword) {
      return { success: false, error: 'Invalid password. Please try again.' };
    }

    // 4. Check account status
    if (matchedUser.status === 'Deactivated') {
      return { success: false, error: 'This account has been deactivated. Please contact your company administrator.' };
    }

    if (matchedUser.status === 'Pending') {
      return { success: false, error: 'Account activation pending. Please check your email for the activation link.' };
    }

    // 5. Successful login
    setCurrentOrg(org);
    setCurrentUser(matchedUser);
    setToken(`jwt-token-${matchedUser.role}-${Date.now()}`);

    // Prepend to audit log
    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        memberName: matchedUser.name,
        memberRole: matchedUser.role === 'COMPANY_ADMIN' ? 'Company Admin' : 'Manager',
        activity: 'Signed in',
        when: 'Just now',
      },
      ...prev,
    ]);

    return { success: true, role: matchedUser.role };
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('bitsync_session_user');
    localStorage.removeItem('bitsync_session_token');
  };

  const registerOrganization = (orgData: {
    name: string;
    adminName: string;
    email: string;
    phone: string;
    password: string;
  }): { workspaceCode: string } => {
    const prefix = orgData.name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'SYNC';
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const workspaceCode = `${prefix}-${rand}`;

    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: orgData.name,
      workspaceCode,
      contactEmail: orgData.email,
      phoneNumber: orgData.phone || '+94 11 000 0000',
    };

    const newAdmin: User = {
      id: `usr-${Date.now()}`,
      name: orgData.adminName,
      email: orgData.email.trim().toLowerCase(),
      password: orgData.password,
      role: 'COMPANY_ADMIN',
      status: 'Active',
      workspaceCode,
      avatarInitials: orgData.adminName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    };

    setOrganizations((prev) => [newOrg, ...prev]);
    setCurrentOrg(newOrg);
    setUsers((prev) => [newAdmin, ...prev]);

    return { workspaceCode };
  };

  const updateOrganization = (updated: Partial<Organization>) => {
    setCurrentOrg((prev) => {
      const next = { ...prev, ...updated };
      setOrganizations((orgs) => orgs.map((o) => (o.id === prev.id ? next : o)));
      return next;
    });
  };

  const addManager = (name: string, email: string) => {
    const newMgr: User = {
      id: `mgr-${Date.now()}`,
      name,
      email: email.trim().toLowerCase(),
      password: 'password123',
      role: 'MANAGER',
      status: 'Pending',
      workspaceCode: currentOrg.workspaceCode,
      scope: 'Organization-wide',
      avatarInitials: name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    };

    setUsers((prev) => [newMgr, ...prev]);

    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        memberName: name,
        memberRole: 'Manager',
        activity: 'Account registered · Activation pending',
        when: 'Just now',
      },
      ...prev,
    ]);
  };

  const resendActivation = (id: string) => {
    const mgr = users.find((u) => u.id === id);
    if (mgr) {
      setActivityLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          memberName: mgr.name,
          memberRole: 'Manager',
          activity: 'Activation email resent',
          when: 'Just now',
        },
        ...prev,
      ]);
    }
  };

  const toggleManagerStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'Active' ? 'Deactivated' : 'Active';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const requestPasswordReset = (
    workspaceCode: string,
    email: string
  ): { success: boolean; error?: string } => {
    const cleanWorkspace = workspaceCode.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    const matchedUser = users.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail &&
        (!u.workspaceCode || u.workspaceCode.toUpperCase() === cleanWorkspace)
    );

    if (!matchedUser) {
      return { success: false, error: 'No account found with this email in workspace ' + cleanWorkspace };
    }

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!currentUser && !!token,
        user: currentUser,
        organization: currentOrg,
        token,
        login,
        logout,
        registerOrganization,
        updateOrganization,
        managers,
        addManager,
        resendActivation,
        toggleManagerStatus,
        activityLogs,
        requestPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
