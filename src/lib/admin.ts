// Admin allowlist. Anyone whose verified email matches one of these gets
// admin privileges in the UI (delete any community post, badge, etc).
export const ADMIN_EMAILS = ['snusmh@gmail.com'];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
