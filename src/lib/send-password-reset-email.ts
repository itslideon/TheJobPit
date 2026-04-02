import { getAppBaseUrl } from "@/lib/app-url";

type SendOpts = {
  to: string;
  /** Raw secret token (only used in dev console fallback). */
  rawToken: string;
};

export async function sendPasswordResetEmail({ to, rawToken }: SendOpts): Promise<void> {
  const base = getAppBaseUrl();
  const resetUrl = `${base}/reset-password?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(to.toLowerCase())}`;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "The Job Pit <onboarding@resend.dev>";

  if (apiKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Reset your The Job Pit password",
        html: `<p>We received a request to reset your password.</p>
<p><a href="${resetUrl}">Reset your password</a> (link expires in 1 hour).</p>
<p>If you did not ask for this, you can ignore this email.</p>`
      })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Email failed: ${res.status} ${text}`);
    }
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.info(
      "[The Job Pit] Password reset (no RESEND_API_KEY). Open this link in the browser:\n",
      resetUrl
    );
    return;
  }

  throw new Error("RESEND_API_KEY is not set; cannot send password reset email in production.");
}
