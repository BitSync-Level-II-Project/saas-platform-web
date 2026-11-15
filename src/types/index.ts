export type UserRole = 'COMPANY_ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'WORKER';

export type UserStatus = 'Active' | 'Pending' | 'Deactivated';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  scope?: string;
  avatarInitials?: string;
  workspaceCode?: string;
  password?: string;
}

export interface Organization {
  id: string;
  name: string;
  workspaceCode: string;
  contactEmail: string;
  phoneNumber: string;
}

export interface ActivityLog {
  id: string;
  memberName: string;
  memberRole: string;
  activity: string;
  when: string;
}
