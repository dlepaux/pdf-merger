/** Turn a raw pdf-lib error message into a short, user-facing skip reason. */
export function friendlyReason(raw: string): string {
  if (/encrypt|password/i.test(raw)) return 'password-locked'
  return 'could not be read'
}
