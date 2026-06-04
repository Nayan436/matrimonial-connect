// -- Cloudflare Worker URL -----------------------------------------------------
export const WORKER_URL = 'REPLACE_WITH_YOUR_WORKER_URL';

// -- UPI Payment Details (your business UPI) -----------------------------------
export const UPI_ID      = 'REPLACE_WITH_UPI_ID';   // e.g. matrimonialconnect@ybl
export const UPI_NAME    = 'Matrimonial Connect';    // Name shown in UPI apps
export const UPI_NOTE    = 'Profile Activation';

// -- Pricing -------------------------------------------------------------------
export const PLANS = {
  basic:    { label: 'Standard',  price: 499,  priceDisplay: '?499'  },
  lifetime: { label: 'Lifetime',  price: 999,  priceDisplay: '?999'  },
} as const;

// -- Admin credentials (change before going live) ------------------------------
export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'Matri@2024';

// -- App info ------------------------------------------------------------------
export const APP_NAME = 'Matrimonial Connect';
