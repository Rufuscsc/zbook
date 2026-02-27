export const ADMIN_EMAILS = [
  "rufusmfmwellens@gmail.com",
  "ladisea55@gmail.com",
  "successfulcraig13@gmail.com",
  "Abolajibakare4@gmail.com",
  "sysavanemohammed01@gmail.com",
  "pojo497@stu.ui.edu.ng"
];

/**
 * Checks if a given email address belongs to an admin
 */
export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}
