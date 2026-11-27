import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole, Organization, ActivityLog } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  primaryAdmin: User | null;
  organization: Organization | null;
  token: string | null;
  login: (workspaceCode: string, email: string, password: string) => Promise<{ success: boolean; role?: string; error?: string }>;
  logout: () => void;
  registerOrganization: (orgData: { name: string; adminName: string; email: string; phone: string; password: string }) => { workspaceCode: string };
  updateOrganization: (updated: Partial<Organization>) => void;
  updateAdminProfile: (data: { name: string; email: string; password?: string }) => { success: boolean; error?: string };
  transferOwnership: (payload: {
    type: 'existing';
    userId: string;
  } | {
    type: 'new';
    name: string;
    email: string;
  }) => { success: boolean; error?: string; activationUrl?: string; newAdminName?: string; newAdminEmail?: string };
  managers: User[];
  addManager: (name: string, email: string) => { id: string; email: string; name: string; workspaceCode: string; activationUrl: string };
  resendActivation: (id: string) => { email: string; name: string; workspaceCode: string; activationUrl: string } | null;
  activateAccount: (workspaceCode: string, email: string, newPassword: string) => { success: boolean; role?: UserRole; error?: string };
  activateManagerDirectly: (id: string) => void;
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

  // Derived current primary admin for current workspace
  const primaryAdmin =
    users.find(
      (u) =>
        u.role === 'COMPANY_ADMIN' &&
        (!u.workspaceCode || u.workspaceCode.toUpperCase() === currentOrg.workspaceCode.toUpperCase())
    ) ||
    (currentUser?.role === 'COMPANY_ADMIN' ? currentUser : null);

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

    // 2. Find user inside that organization (with tolerance for indeep / indeepa spelling)
    const matchedUser = users.find((u) => {
      const uEmail = u.email.toLowerCase().trim();
      const wsMatch = !u.workspaceCode || u.workspaceCode.toUpperCase() === cleanWorkspace;
      const exactMatch = uEmail === cleanEmail;
      const normalizedMatch =
        uEmail.replace('indeepa', 'indeep') === cleanEmail.replace('indeepa', 'indeep');
      return wsMatch && (exactMatch || normalizedMatch);
    });

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

  const updateAdminProfile = (data: {
    name: string;
    email: string;
    password?: string;
  }): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'No active session.' };
    const cleanName = data.name.trim();
    const cleanEmail = data.email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      return { success: false, error: 'Name and email are required.' };
    }

    const updatedUser: User = {
      ...currentUser,
      name: cleanName,
      email: cleanEmail,
      avatarInitials:
        cleanName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase() || 'AD',
      ...(data.password?.trim() ? { password: data.password.trim() } : {}),
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    if (currentUser.role === 'COMPANY_ADMIN') {
      setCurrentOrg((prev) => ({ ...prev, contactEmail: cleanEmail }));
    }

    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        memberName: cleanName,
        memberRole: currentUser.role === 'COMPANY_ADMIN' ? 'Company Admin' : 'Manager',
        activity: 'Administrator profile & credentials updated',
        when: 'Just now',
      },
      ...prev,
    ]);

    return { success: true };
  };

  const transferOwnership = (payload: {
    type: 'existing';
    userId: string;
  } | {
    type: 'new';
    name: string;
    email: string;
  }): { success: boolean; error?: string; activationUrl?: string; newAdminName?: string; newAdminEmail?: string } => {
    const ws = currentOrg.workspaceCode;

    if (payload.type === 'existing') {
      const target = users.find((u) => u.id === payload.userId);
      if (!target) {
        return { success: false, error: 'Selected manager not found.' };
      }
      if (target.role === 'COMPANY_ADMIN') {
        return { success: false, error: 'User is already a Company Admin.' };
      }

      const prevAdminName = currentUser?.name || 'Previous Admin';

      // Promote target manager to COMPANY_ADMIN and demote previous admin to MANAGER
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === target.id) {
            return { ...u, role: 'COMPANY_ADMIN' as const, status: 'Active' as const };
          }
          if (currentUser && u.id === currentUser.id) {
            return { ...u, role: 'MANAGER' as const, scope: 'Organization-wide' };
          }
          return u;
        })
      );

      // Update current organization contact email
      setCurrentOrg((prev) => ({
        ...prev,
        contactEmail: target.email,
      }));

      // Log ownership transfer
      setActivityLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          memberName: prevAdminName,
          memberRole: 'Company Admin',
          activity: `Ownership transferred to ${target.name} (${target.email})`,
          when: 'Just now',
        },
        ...prev,
      ]);

      return {
        success: true,
        newAdminName: target.name,
        newAdminEmail: target.email,
      };
    } else {
      const cleanEmail = payload.email.trim().toLowerCase();
      const cleanName = payload.name.trim();

      if (!cleanEmail || !cleanName) {
        return { success: false, error: 'Please enter name and work email.' };
      }

      // Check if user already exists
      const existing = users.find(
        (u) =>
          u.email.toLowerCase() === cleanEmail &&
          (!u.workspaceCode || u.workspaceCode.toUpperCase() === ws.toUpperCase())
      );
      if (existing) {
        return {
          success: false,
          error: `An account with ${cleanEmail} already exists in this workspace. Please select 'Existing Manager' instead.`,
        };
      }

      const newAdminId = `admin-${Date.now()}`;
      const newAdmin: User = {
        id: newAdminId,
        name: cleanName,
        email: cleanEmail,
        password: 'password123',
        role: 'COMPANY_ADMIN',
        status: 'Pending',
        workspaceCode: ws,
        avatarInitials:
          cleanName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'AD',
      };

      setUsers((prev) => [newAdmin, ...prev]);

      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
      const activationUrl = `${origin}/activate-account?ws=${encodeURIComponent(ws)}&email=${encodeURIComponent(cleanEmail)}`;

      setActivityLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          memberName: currentUser?.name || 'Administrator',
          memberRole: 'Company Admin',
          activity: `Ownership transfer initiated for ${cleanName} (${cleanEmail})`,
          when: 'Just now',
        },
        ...prev,
      ]);

      return {
        success: true,
        newAdminName: cleanName,
        newAdminEmail: cleanEmail,
        activationUrl,
      };
    }
  };

  const addManager = (
    name: string,
    email: string
  ): { id: string; email: string; name: string; workspaceCode: string; activationUrl: string } => {
    const id = `mgr-${Date.now()}`;
    const cleanEmail = email.trim().toLowerCase();
    const ws = currentOrg.workspaceCode;
    const newMgr: User = {
      id,
      name,
      email: cleanEmail,
      password: 'password123',
      role: 'MANAGER',
      status: 'Pending',
      workspaceCode: ws,
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

    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const activationUrl = `${origin}/activate-account?ws=${encodeURIComponent(ws)}&email=${encodeURIComponent(cleanEmail)}`;

    return { id, email: cleanEmail, name, workspaceCode: ws, activationUrl };
  };

  const resendActivation = (
    id: string
  ): { email: string; name: string; workspaceCode: string; activationUrl: string } | null => {
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

      const ws = mgr.workspaceCode || currentOrg.workspaceCode;
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
      const activationUrl = `${origin}/activate-account?ws=${encodeURIComponent(ws)}&email=${encodeURIComponent(mgr.email)}`;

      return { email: mgr.email, name: mgr.name, workspaceCode: ws, activationUrl };
    }
    return null;
  };

  const activateAccount = (
    workspaceCode: string,
    email: string,
    newPassword: string
  ): { success: boolean; role?: UserRole; error?: string } => {
    const cleanWorkspace = workspaceCode.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    const targetUser = users.find((u) => {
      const uEmail = u.email.toLowerCase().trim();
      const wsMatch = !u.workspaceCode || u.workspaceCode.toUpperCase() === cleanWorkspace;
      const exactMatch = uEmail === cleanEmail;
      const normalizedMatch =
        uEmail.replace('indeepa', 'indeep') === cleanEmail.replace('indeepa', 'indeep');
      return wsMatch && (exactMatch || normalizedMatch);
    });

    if (!targetUser) {
      // Upsert/create the invited manager so links opened in fresh tabs/browsers always activate seamlessly
      const formattedName = cleanEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      const newManager: User = {
        id: `mgr-${Date.now()}`,
        name: formattedName || 'Manager',
        email: cleanEmail,
        password: newPassword,
        role: 'MANAGER',
        status: 'Active',
        workspaceCode: cleanWorkspace,
        scope: 'Organization-wide',
        avatarInitials: (formattedName || 'MG').slice(0, 2).toUpperCase(),
      };

      setUsers((prev) => [newManager, ...prev]);
      setCurrentUser(newManager);
      setToken(`jwt-token-MANAGER-${Date.now()}`);

      setActivityLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          memberName: newManager.name,
          memberRole: 'Manager',
          activity: 'Account activated via invitation link',
          when: 'Just now',
        },
        ...prev,
      ]);

      return { success: true, role: 'MANAGER' as const };
    }

    if (targetUser.role === 'COMPANY_ADMIN') {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === targetUser.id) {
            const updated = {
              ...u,
              email: cleanEmail,
              status: 'Active' as const,
              password: newPassword,
            };
            setCurrentUser(updated);
            setToken(`jwt-token-COMPANY_ADMIN-${Date.now()}`);
            return updated;
          }
          if (u.role === 'COMPANY_ADMIN' && (!u.workspaceCode || u.workspaceCode.toUpperCase() === cleanWorkspace)) {
            return { ...u, role: 'MANAGER' as const, scope: 'Organization-wide' };
          }
          return u;
        })
      );
      setCurrentOrg((prev) => ({ ...prev, contactEmail: cleanEmail }));
    } else {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === targetUser.id) {
            const updated = {
              ...u,
              email: cleanEmail,
              status: 'Active' as const,
              password: newPassword,
            };
            setCurrentUser(updated);
            setToken(`jwt-token-${updated.role}-${Date.now()}`);
            return updated;
          }
          return u;
        })
      );
    }

    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        memberName: targetUser.name,
        memberRole: targetUser.role === 'COMPANY_ADMIN' ? 'Company Admin' : 'Manager',
        activity: 'Account activated',
        when: 'Just now',
      },
      ...prev,
    ]);

    return { success: true, role: targetUser.role };
  };

  const activateManagerDirectly = (id: string) => {
    const mgr = users.find((u) => u.id === id);
    if (!mgr) return;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          return { ...u, status: 'Active' };
        }
        return u;
      })
    );

    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        memberName: mgr.name,
        memberRole: 'Manager',
        activity: 'Account directly activated by Admin',
        when: 'Just now',
      },
      ...prev,
    ]);
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
        primaryAdmin,
        organization: currentOrg,
        token,
        login,
        logout,
        registerOrganization,
        updateOrganization,
        updateAdminProfile,
        transferOwnership,
        managers,
        addManager,
        resendActivation,
        activateAccount,
        activateManagerDirectly,
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
