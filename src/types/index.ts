export interface Organization {
  id: string;
  name: string;
  workspaceCode: string;
  contactEmail: string;
  phoneNumber: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'COMPANY_ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'WORKER';
  status: 'Active' | 'Pending' | 'Deactivated';
  avatarInitials?: string;
}

export interface ActivityLog {
  id: string;
  memberName: string;
  memberRole: string;
  activity: string;
  when: string;
}