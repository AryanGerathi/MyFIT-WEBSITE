// ─── Config ───────────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || "https://myfit-backend-lxj3.onrender.com";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  phone: { countryCode: string; number: string };
  role: "user" | "creator" | "admin";
  isVerified: boolean;
  profileImage: { url: string; publicId: string };
  creatorProfile: {
    bio: string;
    specialization: string;
    verified: boolean;
    dailyPrice?: number;
    monthlyPrice?: number;
    monthlySessions?: number;
    timeSlots?: string[];
  };
  createdAt: string;
}

export interface Pricing {
  dailyPrice:      number;
  monthlyPrice:    number;
  monthlySessions: number;
}

// ─── Public creator type ──────────────────────────────────────────────────────
export interface PublicCreator {
  _id: string;
  name: string;
  email: string;
  profileImage: { url: string; publicId: string };
  creatorProfile: {
    bio: string;
    specialization: string;
    verified: true;
    dailyPrice?: number;
    monthlyPrice?: number;
    monthlySessions?: number;
    rating?: number;
    reviews?: number;
    timeSlots?: string[];
  };
  createdAt: string;
}

// ─── Admin types ──────────────────────────────────────────────────────────────
export interface AdminCreator {
  _id: string;
  name: string;
  email: string;
  phone: { countryCode: string; number: string };
  isVerified: boolean;
  createdAt: string;
  creatorProfile: {
    bio: string;
    specialization: string;
    verified: boolean;
    dailyPrice: number;
    monthlyPrice: number;
    monthlySessions: number;
  };
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone: { countryCode: string; number: string };
  isVerified: boolean;
  createdAt: string;
}

export interface AdminPayment {
  _id:               string;
  userId:            { name: string; email: string };
  creatorId:         { name: string; email: string };
  razorpayPaymentId: string;
  amount:            number;
  commission:        number;
  sessionType:       string;
  status:            string;
  createdAt:         string;
}

export interface UserBooking {
  _id:         string;
  creatorId:   { name: string; email: string } | null;
  userId:      { name: string; email: string } | null;
  amount:      number;
  commission:  number;
  sessionType: string;
  date?:       string | null;
  time?:       string | null;
  status:      string;
  jitsiRoomId?: string | null;    // ← add this
  createdAt:   string;
}

export interface SignupPayload {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  role: "user" | "creator";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOTPPayload {
  userId: string;
  otp: string;
  purpose: "signup" | "login";
}

export interface ResendOTPPayload {
  userId: string;
  purpose: "signup" | "login";
}

export interface UpdateProfilePayload {
  name: string;
  phone: string;
  countryCode: string;
  specialization: string;
  bio: string;
}

// ─── Payment types ────────────────────────────────────────────────────────────

export interface CreateOrderResponse {
  success: true;
  order: {
    id: string;
    amount: number;
    currency: string;
  };
}

export interface VerifyPaymentPayload {
  razorpay_order_id:   string;
  razorpay_payment_id: string;
  razorpay_signature:  string;
  // booking metadata
  creatorId:   string;
  amount:      number;
  commission:  number;
  sessionType: string;
  date?:       string | null;
  time?:       string | null;
}

export interface VerifyPaymentResponse {
  success: true;
  message: string;
  paymentId: string;
  jitsiRoomUrl: string;           // ← add this
  booking:      UserBooking;  
}

// ─── API Response shapes ──────────────────────────────────────────────────────

interface OTPStepResponse {
  success: true;
  message: string;
  userId: string;
}

interface TokenResponse {
  success: true;
  token: string;
  user: AuthUser;
}

interface SuccessResponse {
  success: true;
  message: string;
}

interface ImageUploadResponse {
  success: true;
  message: string;
  imageUrl: string;
  user: AuthUser;
}

interface PricingResponse {
  success: true;
  pricing: Pricing;
}

interface SlotsResponse {
  success: true;
  timeSlots: string[];
}

interface UpdateProfileResponse {
  success: true;
  user: AuthUser;
}

interface AdminCreatorsResponse {
  success: true;
  creators: AdminCreator[];
}

interface PublicCreatorsResponse {
  success: true;
  creators: PublicCreator[];
}

interface AdminUsersResponse {
  success: true;
  users: AdminUser[];
}

interface AdminPaymentsResponse {
  success: true;
  payments: AdminPayment[];
}

interface UserBookingsResponse {
  success: true;
  bookings: UserBooking[];
}

interface VerifyCreatorResponse {
  success: true;
  message: string;
  user: AdminCreator;
}

// ─── Custom error class ───────────────────────────────────────────────────────

export class APIError extends Error {
  status: number;
  fieldErrors: { field: string; message: string }[];

  constructor(
    message: string,
    status: number,
    fieldErrors: { field: string; message: string }[] = []
  ) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// ─── Base fetch helper ────────────────────────────────────────────────────────

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("myfit_token");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    clearTimeout(timer);
    const isTimeout = (err as Error).name === "AbortError";
    throw new APIError(
      isTimeout
        ? "Request timed out. The server may be waking up — please retry in a moment."
        : "Could not reach the server. Check your connection or try again shortly.",
      0
    );
  }

  clearTimeout(timer);

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new APIError(
      `Server returned non-JSON response (${res.status}). Check that the backend is running.`,
      res.status
    );
  }

  const data = await res.json();

  if (!res.ok) {
    throw new APIError(
      data.message || "Something went wrong.",
      res.status,
      data.errors || []
    );
  }

  return data as T;
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  signup: (payload: SignupPayload) =>
    apiFetch<OTPStepResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    apiFetch<OTPStepResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyOTP: (payload: VerifyOTPPayload) =>
    apiFetch<TokenResponse>("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resendOTP: (payload: ResendOTPPayload) =>
    apiFetch<SuccessResponse>("/api/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMe: () =>
    apiFetch<{ success: true; user: AuthUser }>("/api/auth/me"),

  updateProfile: (payload: UpdateProfilePayload) =>
    apiFetch<UpdateProfileResponse>("/api/auth/update-profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // ── Image upload (multipart — NOT JSON) ──────────────────────────────────
  uploadProfileImage: async (file: File): Promise<ImageUploadResponse> => {
    const token = localStorage.getItem("myfit_token");
    const formData = new FormData();
    formData.append("image", file);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    let res: Response;
    try {
      res = await fetch(`${API_URL}/api/upload/profile-image`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
    } catch (err) {
      clearTimeout(timer);
      const isTimeout = (err as Error).name === "AbortError";
      throw new APIError(
        isTimeout ? "Upload timed out. Please try again." : "Upload failed. Check your connection.",
        0
      );
    }

    clearTimeout(timer);
    const data = await res.json();
    if (!res.ok) throw new APIError(data.message || "Upload failed.", res.status);
    return data as ImageUploadResponse;
  },

  deleteProfileImage: () =>
    apiFetch<{ success: true; message: string; user: AuthUser }>(
      "/api/upload/profile-image",
      { method: "DELETE" }
    ),

  // ── Pricing ───────────────────────────────────────────────────────────────
  getPricing: () =>
    apiFetch<PricingResponse>("/api/creator/pricing"),

  savePricing: (payload: Pricing) =>
    apiFetch<PricingResponse>("/api/creator/pricing", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // ── Time Slots ────────────────────────────────────────────────────────────
  getSlots: () =>
    apiFetch<SlotsResponse>("/api/creator/slots"),

  saveSlots: (timeSlots: string[]) =>
    apiFetch<SlotsResponse>("/api/creator/slots", {
      method: "PUT",
      body: JSON.stringify({ timeSlots }),
    }),

  // ── Session helpers ───────────────────────────────────────────────────────
  saveSession: (token: string, user: AuthUser) => {
    localStorage.setItem("myfit_token", token);
    localStorage.setItem("myfit_user", JSON.stringify(user));
  },

  clearSession: () => {
    localStorage.removeItem("myfit_token");
    localStorage.removeItem("myfit_user");
  },

  getStoredUser: (): AuthUser | null => {
    const raw = localStorage.getItem("myfit_user");
    if (!raw) return null;
    try { return JSON.parse(raw) as AuthUser; } catch { return null; }
  },

  updateStoredUser: (user: AuthUser) => {
    localStorage.setItem("myfit_user", JSON.stringify(user));
  },

  isLoggedIn: (): boolean => !!localStorage.getItem("myfit_token"),
};

// ─── Admin Service ────────────────────────────────────────────────────────────

export const adminService = {
  getCreators: () =>
    apiFetch<AdminCreatorsResponse>("/api/admin/creators"),

  verifyCreator: (id: string, verified: boolean) =>
    apiFetch<VerifyCreatorResponse>(`/api/admin/creators/${id}/verify`, {
      method: "PUT",
      body: JSON.stringify({ verified }),
    }),

  getUsers: () =>
    apiFetch<AdminUsersResponse>("/api/admin/users"),

  getPayments: () =>
    apiFetch<AdminPaymentsResponse>("/api/admin/payments"),
};

// ─── Creator Service (public endpoints — no auth required) ───────────────────

export const creatorService = {
  getVerifiedCreators: () =>
    apiFetch<PublicCreatorsResponse>("/api/creator/public"),
};

// ─── Payment Service ──────────────────────────────────────────────────────────

export const paymentService = {
  createOrder: (amount: number) =>
    apiFetch<CreateOrderResponse>("/api/payment/create-order", {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),

  verifyPayment: (payload: VerifyPaymentPayload) =>
    apiFetch<VerifyPaymentResponse>("/api/payment/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    
    getRoomUrl: (bookingId: string) =>
      apiFetch<{ success: true; roomId: string; roomUrl: string }>(
        `/api/payment/booking/${bookingId}/room`
      ),

    getMyCreatorBookings: () =>
      apiFetch<{ success: true; bookings: (UserBooking & { userId: { name: string; email: string } | null })[] }>(
        "/api/payment/my-creator-bookings"
      ),

  getMyBookings: () =>                                        // ✅ added
    apiFetch<UserBookingsResponse>("/api/payment/my-bookings"),
};