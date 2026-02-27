export const ADMIN_EMAILS = [
  "rufusmfmwellens@gmail.com",
];

/**
 * Checks if a given email address belongs to an admin
 */
export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}
