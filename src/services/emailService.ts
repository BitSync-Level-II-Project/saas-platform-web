/**
 * Real Email Dispatch Service for SiteTrace
 * Uses FormSubmit API to deliver real emails to actual Gmail and corporate inboxes
 * without exposing secret server credentials in the frontend.
 */

export interface SendActivationEmailParams {
  toEmail: string;
  managerName: string;
  workspaceCode: string;
  activationUrl: string;
}

export const sendActivationEmail = async ({
  toEmail,
  managerName,
  workspaceCode,
  activationUrl,
}: SendActivationEmailParams): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(toEmail.trim())}`, {
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
        Recipient_Email: toEmail.trim(),
        Activation_Link: activationUrl,
        Instructions:
          'Click the Activation Link above to choose your password and activate your SiteTrace Manager account.',
      }),
    });

    const data = await res.json();
    const isSuccess = data.success === true || data.success === 'true';

    return {
      success: isSuccess,
      message: data.message || (isSuccess ? 'Activation email dispatched successfully.' : 'Email service returned pending confirmation.'),
    };
  } catch {
    return {
      success: false,
      message: 'Failed to connect to email dispatch service. Please check your internet connection.',
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
