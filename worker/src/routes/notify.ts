import { json } from '../utils/cors';

interface Env {
  CALLMEBOT_API_KEY: string;
  ADMIN_WHATSAPP: string;   // e.g. 919876543210 (country code + number, no +)
  RESEND_API_KEY: string;
  APP_FROM_EMAIL: string;   // e.g. noreply@yourmatrimonialdomain.in
}

// -- WhatsApp ping to admin via CallMeBot (free) -------------------------------
export async function sendWhatsAppAlert(message: string, env: Env): Promise<void> {
  const encoded = encodeURIComponent(message);
  await fetch(
    `https://api.callmebot.com/whatsapp.php?phone=${env.ADMIN_WHATSAPP}&text=${encoded}&apikey=${env.CALLMEBOT_API_KEY}`
  );
  // Fire-and-forget — don't block the main response
}

// -- Approval email to user via Resend (free 3K/mo) ---------------------------
export async function handleSendApprovalEmail(request: Request, env: Env): Promise<Response> {
  const { toEmail, toName, plan, amount, transactionId } =
    await request.json() as { toEmail: string; toName: string; plan: string; amount: number; transactionId: string };

  if (!toEmail) return json({ success: false, error: 'No email provided' }, 400);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.APP_FROM_EMAIL,
      to: toEmail,
      subject: 'Your Matrimonial Connect profile is now active!',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#C2185B,#7B1FA2);padding:32px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">Profile Activated! ??</h1>
          </div>
          <div style="background:#fff;padding:32px;border:1px solid #eee;border-radius:0 0 12px 12px;">
            <p style="color:#333;">Hi <strong>${toName}</strong>,</p>
            <p style="color:#555;">Your payment has been verified and your <strong>${plan}</strong> plan is now active. You can now send interests, chat with matches, and view complete profiles.</p>
            <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:20px 0;">
              <p style="margin:4px 0;color:#555;font-size:14px;"><strong>Plan:</strong> ${plan}</p>
              <p style="margin:4px 0;color:#555;font-size:14px;"><strong>Amount paid:</strong> ?${amount}</p>
              <p style="margin:4px 0;color:#555;font-size:14px;"><strong>Transaction ID:</strong> ${transactionId}</p>
            </div>
            <p style="color:#555;">Start browsing and find your perfect match today!</p>
            <p style="color:#999;font-size:12px;margin-top:24px;">This is an automated message from Matrimonial Connect.</p>
          </div>
        </div>
      `,
    }),
  });

  const data = await res.json();
  return json({ success: res.ok, data });
}

// -- WhatsApp alert endpoint (called internally by other routes) ---------------
export async function handleWhatsAppAlert(request: Request, env: Env): Promise<Response> {
  const { message } = await request.json() as { message: string };
  await sendWhatsAppAlert(message, env);
  return json({ success: true });
}
