/**
 * Verifies a Turnstile token server-side. This is the real bot defence in
 * this stack — the WAF rate limit and honeypot only catch crude bots.
 */
export async function verifyTurnstile(
  token: string,
  secretKey: string,
  remoteIp: string | null,
): Promise<boolean> {
  const body = new URLSearchParams({ secret: secretKey, response: token })
  if (remoteIp) body.set('remoteip', remoteIp)

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    if (!res.ok) return false
    const result = (await res.json()) as { success: boolean }
    return result.success === true
  } catch {
    // Turnstile being unreachable should not be indistinguishable from "token
    // valid" — fail closed.
    return false
  }
}
