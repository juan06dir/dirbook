const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Error desconocido" }));
    throw new Error(err.detail || "Error del servidor");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface UserOut {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserOut;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: form,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

// ── Locals ────────────────────────────────────────────────────────────────────

export interface LocalOut {
  id: string;
  name: string;
  description: string | null;
  category: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  website: string | null;
  logo: string | null;
  cover_image: string | null;
  owner_id: string;
  created_at: string;
  followers_count: number;
  avg_rating: number | null;
  ratings_count: number;
}

export interface LocalCreate {
  name: string;
  description?: string;
  category: string;
  address?: string;
  city?: string;
  phone?: string;
  website?: string;
  logo?: string;
  cover_image?: string;
}

export interface LocalsFilter {
  search?: string;
  category?: string;
  city?: string;
  skip?: number;
  limit?: number;
}

export async function getLocals(filters: LocalsFilter = {}): Promise<LocalOut[]> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.city) params.set("city", filters.city);
  if (filters.skip !== undefined) params.set("skip", String(filters.skip));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return request<LocalOut[]>(`/locals${qs ? `?${qs}` : ""}`);
}

export async function getLocal(id: string): Promise<LocalOut> {
  return request<LocalOut>(`/locals/${id}`);
}

export async function getMyLocals(): Promise<LocalOut[]> {
  return request<LocalOut[]>("/locals/mine");
}

export async function createLocal(data: LocalCreate): Promise<LocalOut> {
  return request<LocalOut>("/locals", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateLocal(
  id: string,
  data: Partial<LocalCreate>
): Promise<LocalOut> {
  return request<LocalOut>(`/locals/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteLocal(id: string): Promise<void> {
  return request<void>(`/locals/${id}`, { method: "DELETE" });
}

// ── Posts ─────────────────────────────────────────────────────────────────────

export type PostType = "post" | "event" | "discount";

export interface PostOut {
  id: string;
  post_type: PostType;
  title: string | null;
  content: string;
  image_url: string | null;
  local_id: string | null;
  professional_id: string | null;
  event_start: string | null;
  event_end: string | null;
  discount_pct: number | null;
  created_at: string;
}

export interface PostCreate {
  post_type?: PostType;
  title?: string;
  content: string;
  image_url?: string;
  local_id?: string;
  professional_id?: string;
  event_start?: string;
  event_end?: string;
  discount_pct?: number;
}

export async function createPost(data: PostCreate): Promise<PostOut> {
  return request<PostOut>("/posts", { method: "POST", body: JSON.stringify(data) });
}

export async function getFeed(params?: { skip?: number; limit?: number; post_type?: PostType }): Promise<PostOut[]> {
  const qs = new URLSearchParams();
  if (params?.skip !== undefined)  qs.set("skip",  String(params.skip));
  if (params?.limit !== undefined) qs.set("limit", String(params.limit));
  if (params?.post_type)           qs.set("post_type", params.post_type);
  return request<PostOut[]>(`/posts/feed?${qs}`);
}

export async function getActiveDiscounts(): Promise<PostOut[]> {
  return request<PostOut[]>("/posts/active-discounts");
}

export async function getLocalPosts(localId: string, post_type?: PostType): Promise<PostOut[]> {
  const qs = post_type ? `?post_type=${post_type}` : "";
  return request<PostOut[]>(`/posts/local/${localId}${qs}`);
}

export async function deletePost(id: string): Promise<void> {
  return request<void>(`/posts/${id}`, { method: "DELETE" });
}

// ── Follows ───────────────────────────────────────────────────────────────────

export interface FollowStatus {
  following: boolean;
  followers_count: number;
}

export async function followLocal(localId: string): Promise<FollowStatus> {
  return request<FollowStatus>(`/follows/${localId}`, { method: "POST" });
}

export async function unfollowLocal(localId: string): Promise<FollowStatus> {
  return request<FollowStatus>(`/follows/${localId}`, { method: "DELETE" });
}

export async function getFollowStatus(localId: string): Promise<FollowStatus> {
  return request<FollowStatus>(`/follows/${localId}/status`);
}

// ── Ratings ───────────────────────────────────────────────────────────────────

export interface RatingSummary {
  avg: number | null;
  count: number;
  my_score: number | null;
}

export async function rateLocal(localId: string, score: number, comment?: string): Promise<RatingSummary> {
  return request<RatingSummary>(`/ratings/${localId}`, {
    method: "POST",
    body: JSON.stringify({ score, comment }),
  });
}

export async function getRatingSummary(localId: string): Promise<RatingSummary> {
  return request<RatingSummary>(`/ratings/${localId}`);
}

// ── Professionals ─────────────────────────────────────────────────────────────

export interface ProfessionalOut {
  id: string;
  name: string;
  profession: string;
  bio: string | null;
  phone: string | null;
  website: string | null;
  avatar: string | null;
  cover_image: string | null;
  owner_id: string;
  created_at: string;
}

export interface ProfessionalCreate {
  name: string;
  profession: string;
  bio?: string;
  phone?: string;
  website?: string;
}

export interface ProfessionalsFilter {
  search?: string;
  profession?: string;
  skip?: number;
  limit?: number;
}

export async function getProfessionals(filters: ProfessionalsFilter = {}): Promise<ProfessionalOut[]> {
  const params = new URLSearchParams();
  if (filters.search)    params.set("search",     filters.search);
  if (filters.profession) params.set("profession", filters.profession);
  if (filters.skip  !== undefined) params.set("skip",  String(filters.skip));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return request<ProfessionalOut[]>(`/professionals${qs ? `?${qs}` : ""}`);
}

export async function getProfessional(id: string): Promise<ProfessionalOut> {
  return request<ProfessionalOut>(`/professionals/${id}`);
}

export async function getMyProfessionals(): Promise<ProfessionalOut[]> {
  return request<ProfessionalOut[]>("/professionals/mine");
}

export async function createProfessional(data: ProfessionalCreate): Promise<ProfessionalOut> {
  return request<ProfessionalOut>("/professionals", { method: "POST", body: JSON.stringify(data) });
}

export async function updateProfessional(id: string, data: Partial<ProfessionalCreate>): Promise<ProfessionalOut> {
  return request<ProfessionalOut>(`/professionals/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteProfessional(id: string): Promise<void> {
  return request<void>(`/professionals/${id}`, { method: "DELETE" });
}

export async function getProfessionalPosts(profId: string, post_type?: PostType): Promise<PostOut[]> {
  const qs = post_type ? `?post_type=${post_type}` : "";
  return request<PostOut[]>(`/posts/professional/${profId}${qs}`);
}

// ── Upload ────────────────────────────────────────────────────────────────────

export async function uploadImage(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  return request<{ url: string }>("/upload", {
    method: "POST",
    body: form,
  });
}
