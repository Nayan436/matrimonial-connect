// -- Cloudflare Worker URL (deploy worker first, then paste URL here) ----------
export const WORKER_URL = 'REPLACE_WITH_YOUR_WORKER_URL';
// e.g. 'https://matrimonial-worker.YOUR_SUBDOMAIN.workers.dev'

// -- Razorpay Key ID (public key — safe to expose in frontend) -----------------
export const RAZORPAY_KEY_ID = 'REPLACE_WITH_RAZORPAY_KEY_ID';
// e.g. 'rzp_live_xxxxxxxxxxxx'

// -- Pricing --------------------------------------------------------------------
export const PLANS = {
  basic:    { label: 'Standard',  price: 499,  priceDisplay: '?499'  },
  lifetime: { label: 'Lifetime',  price: 999,  priceDisplay: '?999'  },
} as const;

// -- App info -------------------------------------------------------------------
export const APP_NAME = 'Matrimonial Connect';
