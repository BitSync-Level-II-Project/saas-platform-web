/**
 * Real Email Dispatch Service for SiteTrace
 * Connects to the NestJS Backend (`saas-platform-api` on http://localhost:3000)
 * to deliver real, production-grade activation emails to ANY recipient email address.
 */

export interface SendActivationEmailParams {
  toEmail: string;
  managerName: string;
  workspaceCode: string;
  activationUrl: string;
}

const BACKEND_API_URL = 'http://localhost:3000/api/v1/auth/invite-manager';

export const sendActivationEmail = async ({
  toEmail,
  managerName,
  workspaceCode,
  activationUrl,
}: SendActivationEmailParams): Promise<{ success: boolean; message: string }> => {
  const cleanEmail = toEmail.trim();

  // 1. Primary: Dispatch via NestJS Backend Email Service
  try {
    const backendRes = await fetch(BACKEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: managerName,
        email: cleanEmail,
        workspaceCode,
        activationUrl,
      }),
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data.success) {
        return {
          success: true,
          message: `Activation email dispatched by backend to ${cleanEmail}`,
        };
      }
    }
  } catch {
    // Backend offline or unreachable, fall back to FormSubmit relay
  }

  // 2. Secondary fallback: FormSubmit Cloud Dispatch
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(cleanEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: `SiteTrace Account Activation · ${workspaceCode}`,
        _template: 'table',
        Organization_Workspace: workspaceCode,
        Manager_Name: managerName,
        Recipient_Email: cleanEmail,
        Activation_Link: activationUrl,
        Instructions:
          'Click the Activation Link above to choose your password and activate your SiteTrace Manager account.',
      }),
    });

    const data = await res.json();
    const isSuccess = data.success === true || data.success === 'true';

    return {
      success: isSuccess,
      message:
        data.message ||
        (isSuccess
          ? `Activation email sent to ${cleanEmail}`
          : 'Pending recipient verification link.'),
    };
  } catch {
    return {
      success: false,
      message: 'Failed to dispatch email. Please ensure backend is running or check internet connectivity.',
    };
  }
};

/**
 * Generates a direct Gmail compose link so the admin can also send the activation directly from their own Gmail.
 */
export const getGmailComposeUrl = ({
  toEmail,
  managerName,
  workspaceCode,
  activationUrl,
}: SendActivationEmailParams): string => {
  const subject = encodeURIComponent(`SiteTrace Account Activation - Workspace ${workspaceCode}`);
  const body = encodeURIComponent(
    `Hello ${managerName},\n\nYou have been invited as a Manager to SiteTrace for workspace ${workspaceCode}.\n\nPlease click the link below to set your password and activate your account:\n${activationUrl}\n\nBest regards,\nSiteTrace Operations Team`
  );
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmail)}&su=${subject}&body=${body}`;
};
