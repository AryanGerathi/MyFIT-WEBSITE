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
    bankDetails?: BankDetails;
  };
  createdAt: string;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber:     string;
  ifscCode:          string;
  bankName:          string;
  accountType:       "savings" | "current";
  upiId?:            string;
}

export interface Pricing {
  dailyPrice:      number;
  monthlyPrice:    number;
  monthlySessions: number;
}

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

export interface AdminCreator {
  _id: string;
  name: string;
  email: string;
  phone?: { countryCode?: string; number?: string };
  createdAt: string;
  creatorProfile: {
    bio: string;
    specialization: string;
    verified: boolean;
    dailyPrice: number;
    monthlyPrice: number;
    monthlySessions: number;
    timeSlots?: string[];
    bankDetails?: BankDetails;
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

export interface AdminWithdrawal {
  _id:       string;
  creatorId: { name: string; email: string } | null;
  amount:    number;
  status:    "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface MyWithdrawal {
  _id:       string;
  amount:    number;
  status:    "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface UserBooking {
  _id:         string;
  creatorId:   { _id: string; name: string; email: string } | null;
  userId:      { _id: string; name: string; email: string } | null;
  amount:      number;
  commission:  number;
  sessionType: string;
  date?:       string | null;
  time?:       string | null;
  status:      string;
  jitsiRoomId?: string | null;
  createdAt:   string;
}

export interface Review {
  _id:       string;
  userId:    { _id: string; name: string; profileImage?: { url: string } };
  creatorId: string;
  bookingId: string;
  rating:    number;
  comment:   string;
  createdAt: string;
}

export interface SubmitReviewPayload {
  bookingId: string;
  creatorId: string;
  rating:    number;
  comment:   string;
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
  purpose: "signup" | "login" | "forgot-password";
}

export interface ResendOTPPayload {
  userId: string;
  purpose: "signup" | "login" | "forgot-password";
}

// ─── Forgot Password payloads ─────────────────────────────────────────────────

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  userId: string;
  otp: string;
  newPassword: string;
}

// ─────────────────────────────────────────────────────────────────────────────

export interface UpdateProfilePayload {
  name: string;
  phone: string;
  countryCode: string;
  specialization: string;
  bio: string;
}

export interface CreateOrderResponse {
  success: true;
  order: { id: string; amount: number; currency: string };
}

export interface VerifyPaymentPayload {
  razorpay_order_id:   string;
  razorpay_payment_id: string;
  razorpay_signature:  string;
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
  jitsiRoomUrl: string;
  booking:      UserBooking;
}

// ─── API Response shapes ──────────────────────────────────────────────────────

interface OTPStepResponse           { success: true; message: string; userId: string; }
interface TokenResponse             { success: true; token: string; user: AuthUser; }
interface SuccessResponse           { success: true; message: string; }
interface ImageUploadResponse       { success: true; message: string; imageUrl: string; user: AuthUser; }
interface PricingResponse           { success: true; pricing: Pricing; }
interface SlotsResponse             { success: true; timeSlots: string[]; }
interface UpdateProfileResponse     { success: true; user: AuthUser; }
interface AdminCreatorsResponse     { success: true; creators: AdminCreator[]; }
interface PublicCreatorsResponse    { success: true; creators: PublicCreator[]; }
interface AdminUsersResponse        { success: true; users: AdminUser[]; }
interface AdminPaymentsResponse     { success: true; payments: AdminPayment[]; }
interface AdminWithdrawalsResponse  { success: true; withdrawals: AdminWithdrawal[]; }
interface MyWithdrawalsResponse     { success: true; withdrawals: MyWithdrawal[]; }
interface WithdrawalActionResponse  { success: true; message: string; withdrawal: AdminWithdrawal; }
interface WithdrawalRequestResponse { success: true; message: string; }
interface UserBookingsResponse      { success: true; bookings: UserBooking[]; }
interface VerifyCreatorResponse     { success: true; message: string; user: AdminCreator; }
interface BankDetailsResponse       { success: true; message?: string; bankDetails: BankDetails | null; }
interface SubmitReviewResponse      { success: true; message: string; review: Review; }
interface GetReviewsResponse        { success: true; reviews: Review[]; averageRating: number; totalReviews: number; }
interface GetMyReviewResponse       { success: true; review: Review | null; }
interface BookedSlotsResponse       { success: true; bookedSlots: string[]; }

// ─── Custom error class ───────────────────────────────────────────────────────

export class APIError extends Error {
  status: number;
  fieldErrors: { field: string; message: string }[];

  constructor(message: string, status: number, fieldErrors: { field: string; message: string }[] = []) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// ─── Internal helper: get stored role safely ──────────────────────────────────

function getStoredRole(): string | null {
  try {
    const raw = localStorage.getItem("myfit_user");
    return raw ? JSON.parse(raw)?.role ?? null : null;
  } catch {
    return null;
  }
}

// ─── Base fetch helper ────────────────────────────────────────────────────────

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // ✅ FIX: Never send an admin token on non-admin requests.
  // AdminPasswordGate stores a synthetic admin user in myfit_user with role="admin".
  // That token is not valid for user/creator routes and causes "Admins cannot create orders."
  // Guard: skip the token entirely when the stored role is admin.
  const storedRole = getStoredRole();
  const token = storedRole === "admin" ? null : localStorage.getItem("myfit_token");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

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
    if (res.status === 401) {
      authService.clearSession();
      window.location.href = "/login";
    }
    throw new APIError(data.message || "Something went wrong.", res.status, data.errors || []);
  }

  return data as T;
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  signup: (payload: SignupPayload) =>
    apiFetch<OTPStepResponse>("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) }),

  login: (payload: LoginPayload) =>
    apiFetch<OTPStepResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),

  verifyOTP: (payload: VerifyOTPPayload) =>
    apiFetch<TokenResponse>("/api/auth/verify-otp", { method: "POST", body: JSON.stringify(payload) }),

  resendOTP: (payload: ResendOTPPayload) =>
    apiFetch<SuccessResponse>("/api/auth/resend-otp", { method: "POST", body: JSON.stringify(payload) }),

  /**
   * Step 1 — Send a password-reset OTP to the given email.
   * Backend route: POST /api/auth/forgot-password
   */
  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiFetch<OTPStepResponse>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /**
   * Step 2 — Verify the OTP + set a new password atomically.
   * Backend route: POST /api/auth/reset-password
   */
  resetPassword: (payload: ResetPasswordPayload) =>
    apiFetch<SuccessResponse>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMe: () =>
    apiFetch<{ success: true; user: AuthUser }>("/api/auth/me"),

  updateProfile: (payload: UpdateProfilePayload) =>
    apiFetch<UpdateProfileResponse>("/api/auth/update-profile", { method: "PUT", body: JSON.stringify(payload) }),

  uploadProfileImage: async (file: File): Promise<ImageUploadResponse> => {
    // ✅ Same admin-role guard for the raw fetch upload path
    const storedRole = getStoredRole();
    const token      = storedRole === "admin" ? null : localStorage.getItem("myfit_token");

    const formData = new FormData();
    formData.append("image", file);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    let res: Response;
    try {
      res = await fetch(`${API_URL}/api/upload/profile-image`, {
        method: "POST",
        signal: controller.signal,
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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
    apiFetch<{ success: true; message: string; user: AuthUser }>("/api/upload/profile-image", { method: "DELETE" }),

  getPricing: () =>
    apiFetch<PricingResponse>("/api/creator/pricing"),

  savePricing: (payload: Pricing) =>
    apiFetch<PricingResponse>("/api/creator/pricing", { method: "PUT", body: JSON.stringify(payload) }),

  getSlots: () =>
    apiFetch<SlotsResponse>("/api/creator/slots"),

  saveSlots: (timeSlots: string[]) =>
    apiFetch<SlotsResponse>("/api/creator/slots", { method: "PUT", body: JSON.stringify({ timeSlots }) }),

  getBankDetails: () =>
    apiFetch<BankDetailsResponse>("/api/creator/bank-details"),

  saveBankDetails: (payload: BankDetails) =>
    apiFetch<BankDetailsResponse>("/api/creator/bank-details", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

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

  isLoggedIn: (): boolean => {
    // ✅ FIX: Admin sessions must NOT be treated as a valid user/creator login.
    // Without this, ProtectedRoute would redirect an admin to /dashboard,
    // and users on the same device with a stale admin session couldn't access their dashboard.
    const role = getStoredRole();
    if (role === "admin") return false;
    return !!localStorage.getItem("myfit_token");
  },
};

// ─── Help Request Types ───────────────────────────────────────────────────────

export interface HelpRequest {
  _id:       string;
  userId:    string;
  userName:  string;
  userEmail: string;
  category:  string;
  subject:   string;
  message:   string;
  status:    "open" | "in-progress" | "resolved";
  createdAt: string;
}

interface HelpRequestResponse      { success: true; request:  HelpRequest; }
interface HelpRequestsResponse     { success: true; requests: HelpRequest[]; }
interface HelpStatusUpdateResponse { success: true; request:  HelpRequest; }

// ─── Help Service ─────────────────────────────────────────────────────────────

export const helpService = {
  submit: (payload: { category: string; subject: string; message: string }) =>
    apiFetch<HelpRequestResponse>("/api/help", {
      method: "POST",
      body:   JSON.stringify(payload),
    }),

  getMine: () =>
    apiFetch<HelpRequestsResponse>("/api/help/mine"),

  getAll: () =>
    apiFetch<HelpRequestsResponse>("/api/help"),

  updateStatus: (id: string, status: HelpRequest["status"]) =>
    apiFetch<HelpStatusUpdateResponse>(`/api/help/${id}/status`, {
      method: "PATCH",
      body:   JSON.stringify({ status }),
    }),
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

  getWithdrawals: () =>
    apiFetch<AdminWithdrawalsResponse>("/api/admin/withdrawals"),

  updateWithdrawal: (id: string, action: "approve" | "reject") =>
    apiFetch<WithdrawalActionResponse>(`/api/admin/withdrawals/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action }),
    }),
};

// ─── Creator Service ──────────────────────────────────────────────────────────

export const creatorService = {
  getVerifiedCreators: () =>
    apiFetch<PublicCreatorsResponse>("/api/creator/public"),

  getBookedSlots: (creatorId: string, date: Date): Promise<string[]> => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    return apiFetch<BookedSlotsResponse>(
      `/api/creator/${creatorId}/booked-slots?date=${dateStr}`
    )
      .then((res) => res.bookedSlots)
      .catch(() => []);
  },
};

// ─── Review Service ───────────────────────────────────────────────────────────

export const reviewService = {
  submitReview: (payload: SubmitReviewPayload) =>
    apiFetch<SubmitReviewResponse>("/api/reviews", {
      method: "POST",
      body:   JSON.stringify(payload),
    }),

  getCreatorReviews: (creatorId: string) =>
    apiFetch<GetReviewsResponse>(`/api/reviews/creator/${creatorId}`),

  getMyReviewForBooking: (bookingId: string) =>
    apiFetch<GetMyReviewResponse>(`/api/reviews/booking/${bookingId}`),
};

// ─── Chat Types ───────────────────────────────────────────────────────────────

export interface ChatMessage {
  _id:            string;
  conversationId: string;
  senderId:       string;
  text:           string;
  readAt:         string | null;
  createdAt:      string;
}

export interface Conversation {
  _id:         string;
  bookingId:   { _id: string; date?: string; sessionType: string; status: string } | null;
  userId:      { _id: string; name: string; profileImage?: { url: string } };
  creatorId:   { _id: string; name: string; profileImage?: { url: string } };
  lastMessage: string;
  lastAt:      string;
}

interface ConversationResponse  { success: true; conversation: Conversation; }
interface MessagesResponse      { success: true; messages: ChatMessage[]; }
interface SendMessageResponse   { success: true; message: ChatMessage; }
interface ConversationsResponse { success: true; conversations: Conversation[]; }

// ─── Chat Service ─────────────────────────────────────────────────────────────

export const chatService = {
  getOrCreateConversation: (bookingId: string) =>
    apiFetch<ConversationResponse>(`/api/chat/booking/${bookingId}`),

  getMessages: (conversationId: string) =>
    apiFetch<MessagesResponse>(`/api/chat/${conversationId}/messages`),

  sendMessage: (conversationId: string, text: string) =>
    apiFetch<SendMessageResponse>(`/api/chat/${conversationId}/send`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  getMyConversations: () =>
    apiFetch<ConversationsResponse>("/api/chat/my-conversations"),

  uploadChatImage: async (file: File): Promise<{ imageUrl: string }> => {
    const token = localStorage.getItem("myfit_token");
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${API_URL}/api/upload/chat-image`, {
      method: "POST",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new APIError(data.message || "Upload failed.", res.status);
    return { imageUrl: data.imageUrl };
  },
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
    apiFetch<{ success: true; roomId: string; roomUrl: string }>(`/api/payment/booking/${bookingId}/room`),

  requestWithdrawal: (amount: number) =>
    apiFetch<WithdrawalRequestResponse>("/api/payment/withdrawal/request", {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),

  getMyWithdrawals: () =>
    apiFetch<MyWithdrawalsResponse>("/api/payment/my-withdrawals"),

  getMyCreatorBookings: () =>
    apiFetch<{ success: true; bookings: (UserBooking & { userId: { _id: string; name: string; email: string } | null })[] }>(
      "/api/payment/my-creator-bookings"
    ),

  getMyBookings: () =>
    apiFetch<UserBookingsResponse>("/api/payment/my-bookings"),
};

// ─── Keep-alive ping ──────────────────────────────────────────────────────────
export const pingServer = () =>
  fetch(`${API_URL}/api/health`).catch(() => {});