import { handleOptions, json } from './utils/cors';
import { handleSendOtp, handleVerifyOtp } from './routes/otp';
import { handleCreateOrder, handleVerifyPayment } from './routes/payment';

export interface Env {
  FAST2SMS_API_KEY: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return handleOptions();

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/api/otp/send'          && request.method === 'POST') return handleSendOtp(request, env);
      if (path === '/api/otp/verify'         && request.method === 'POST') return handleVerifyOtp(request, env);
      if (path === '/api/payment/create-order' && request.method === 'POST') return handleCreateOrder(request, env);
      if (path === '/api/payment/verify'     && request.method === 'POST') return handleVerifyPayment(request, env);
      if (path === '/api/health')             return json({ status: 'ok' });

      return json({ error: 'Not found' }, 404);
    } catch (err) {
      console.error(err);
      return json({ error: 'Internal server error' }, 500);
    }
  },
};
