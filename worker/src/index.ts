import { handleOptions, json } from './utils/cors';
import { handleSendOtp, handleVerifyOtp } from './routes/otp';
import { handleCreateOrder, handleVerifyPayment } from './routes/payment';
import { handleSendApprovalEmail, handleWhatsAppAlert, sendWhatsAppAlert } from './routes/notify';

export interface Env {
  FAST2SMS_API_KEY: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
  CALLMEBOT_API_KEY: string;
  ADMIN_WHATSAPP: string;
  RESEND_API_KEY: string;
  APP_FROM_EMAIL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return handleOptions();

    const url  = new URL(request.url);
    const path = url.pathname;

    try {
      // OTP
      if (path === '/api/otp/send'   && request.method === 'POST') return handleSendOtp(request, env);
      if (path === '/api/otp/verify' && request.method === 'POST') return handleVerifyOtp(request, env);

      // Payment (Razorpay removed — UPI manual flow)
      if (path === '/api/payment/create-order' && request.method === 'POST') return handleCreateOrder(request, env);
      if (path === '/api/payment/verify'        && request.method === 'POST') return handleVerifyPayment(request, env);

      // Notifications
      if (path === '/api/notify/approval-email' && request.method === 'POST') return handleSendApprovalEmail(request, env);
      if (path === '/api/notify/whatsapp'        && request.method === 'POST') return handleWhatsAppAlert(request, env);

      // Payment submission alert (called from frontend after Firestore write)
      if (path === '/api/notify/new-payment' && request.method === 'POST') {
        const { payerName, mobile, plan, amount, transactionId } =
          await request.json() as { payerName: string; mobile: string; plan: string; amount: number; transactionId: string };
        const msg = `?? New Payment Submitted!\n\nName: ${payerName}\nMobile: +91${mobile}\nPlan: ${plan} (?${amount})\nUTR: ${transactionId}\n\nLogin to admin panel to verify.`;
        await sendWhatsAppAlert(msg, env);
        return json({ success: true });
      }

      // Verification submission alert
      if (path === '/api/notify/new-verification' && request.method === 'POST') {
        const { name, mobile } = await request.json() as { name: string; mobile: string };
        const msg = `?? New ID Verification Request!\n\nName: ${name}\nMobile: +91${mobile}\n\nLogin to admin panel to review.`;
        await sendWhatsAppAlert(msg, env);
        return json({ success: true });
      }

      if (path === '/api/health') return json({ status: 'ok' });
      return json({ error: 'Not found' }, 404);
    } catch (err) {
      console.error(err);
      return json({ error: 'Internal server error' }, 500);
    }
  },
};
