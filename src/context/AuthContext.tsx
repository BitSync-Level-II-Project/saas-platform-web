import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Organization, ActivityLog } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  organization: Organization | null;
  token: string | null;
  login: (workspaceCode: string, email: string, password: string) => Promise<{ success: boolean; role?: string; error?: string }>;
  logout: () => void;
  updateOrganization: (updated: Partial<Organization>) => void;
  managers: User[];
  addManager: (name: string, email: string) => void;
  resendActivation: (id: string) => void;
  toggleManagerStatus: (id: string) => void;
  activityLogs: ActivityLog[];
}

const defaultOrganization: Organization = {
  id: 'org-nova',
  name: 'Nova Industries',
  workspaceCode: 'NOVA-7K3P',
  contactEmail: 'admin@nova.example',
  phoneNumber: '+94 11 234 5678',
};

// Seed accounts for role-based testing
const seededUsers: Record<string, User> = {
  'admin@nova.example': {
    id: 'usr-admin',
    name: 'Nova Admin',
    email: 'admin@nova.example',
    role: 'COMPANY_ADMIN',
    status: 'Active',
    avatarInitials: 'NP',
  },
  'dinesh@nova.example': {
    id: 'usr-mgr-1',
    name: 'Dinesh Wijesinghe',
    email: 'dinesh@nova.example',
    role: 'MANAGER',
    status: 'Active',
    avatarInitials: 'DW',
  },
};

const initialManagers: User[] = [
  {
    id: 'mgr-1',
    name: 'Dinesh Wijesinghe',
    email: 'dinesh@nova.example',
    role: 'MANAGER',
    status: 'Active',
    avatarInitials: 'DW',
  },
  {
    id: 'mgr-2',
    name: 'Amali Gunasekara',
    email: 'amali@nova.example',
    role: 'MANAGER',
    status: 'Pending',
    avatarInitials: 'AG',
  },
  {
    id: 'mgr-3',
    name: 'Sajith Perera',
    email: 'sajith@nova.example',
    role: 'MANAGER',
    status: 'Deactivated',
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
  const [organization, setOrganization] = useState<Organization>(() => {
    const saved = localStorage.getItem('bitsync_org');
    return saved ? JSON.parse(saved) : defaultOrganization;
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bitsync_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('bitsync_token');
  });

  const [managers, setManagers] = useState<User[]>(() => {
    const saved = localStorage.getItem('bitsync_managers');
    return saved ? JSON.parse(saved) : initialManagers;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('bitsync_logs');
    return saved ? JSON.parse(saved) : initialLogs;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('bitsync_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bitsync_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('bitsync_token', token);
    } else {
      localStorage.removeItem('bitsync_token');
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem('bitsync_org', JSON.stringify(organization));
  }, [organization]);

  useEffect(() => {
    localStorage.setItem('bitsync_managers', JSON.stringify(managers));
  }, [managers]);

  useEffect(() => {
    localStorage.setItem('bitsync_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  const login = async (
    workspaceCode: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; role?: string; error?: string }> => {
    const cleanWorkspace = workspaceCode.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    // Verify workspace matches
    if (cleanWorkspace !== organization.workspaceCode.toUpperCase()) {
      return { success: false, error: 'Invalid workspace code for this organization.' };
    }

    if (!cleanEmail || !password.trim()) {
      return { success: false, error: 'Please enter both work email and password.' };
    }

    // Determine user account and role
    const matchedUser = seededUsers[cleanEmail] || {
      id: `usr-${Date.now()}`,
      name: cleanEmail.split('@')[0].toUpperCase(),
      email: cleanEmail,
      role: cleanEmail.includes('admin') ? 'COMPANY_ADMIN' : 'MANAGER',
      status: 'Active',
      avatarInitials: cleanEmail.slice(0, 2).toUpperCase(),
    };

    if (matchedUser.status === 'Deactivated') {
      return { success: false, error: 'This account has been deactivated. Contact your administrator.' };
    }

    setUser(matchedUser);
    setToken(`jwt-token-${matchedUser.role}-${Date.now()}`);

    // Prepend login activity
    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        memberName: matchedUser.name,
        memberRole: matchedUser.role === 'COMPANY_ADMIN' ? 'Company Admin' : 'Manager',
        activity: 'Signed in to workspace',
        when: 'Just now',
      },
      ...prev,
    ]);

    return { success: true, role: matchedUser.role };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bitsync_user');
    localStorage.removeItem('bitsync_token');
  };

  const updateOrganization = (updated: Partial<Organization>) => {
    setOrganization((prev) => ({ ...prev, ...updated }));
  };

  const addManager = (name: string, email: string) => {
    const newMgr: User = {
      id: `mgr-${Date.now()}`,
      name,
      email,
      role: 'MANAGER',
      status: 'Pending',
      avatarInitials: name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    };
    setManagers((prev) => [newMgr, ...prev]);

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
    const mgr = managers.find((m) => m.id === id);
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
    setManagers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextStatus = m.status === 'Active' ? 'Deactivated' : 'Active';
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user && !!token,
        user,
        organization,
        token,
        login,
        logout,
        updateOrganization,
        managers,
        addManager,
        resendActivation,
        toggleManagerStatus,
        activityLogs,
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
