/**
 * Submission id for the in-flight form attempt. Reused as both the
 * `lead_submissions.id` primary key and the Meta CAPI event_id, so a retry of
 * the same attempt (e.g. after a network error) can't create a duplicate row,
 * and a browser Pixel firing the same event_id lets Meta dedupe against CAPI.
 *
 * Cleared on success so the *next* distinct submission — including the other
 * form on the same page — gets a fresh id rather than colliding on the
 * `lead_submissions` primary key.
 */
const STORAGE_KEY = 'sarvam_submission_id'

export function getSubmissionId(): string {
  try {
    const pending = sessionStorage.getItem(STORAGE_KEY)
    if (pending) return pending
  } catch {
    // Private browsing or a full quota — fall through to an unpersisted id.
  }

  const id = crypto.randomUUID()
  try {
    sessionStorage.setItem(STORAGE_KEY, id)
  } catch {
    // Best-effort only.
  }
  return id
}

export function clearSubmissionId(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to do if storage isn't available.
  }
}
