import type { Master } from "@/data/salon";

export const SALON_API = "https://31.77.134.184.sslip.io/salon-api/v1";
const TOKEN_KEY = "mega-strizhka-admin-token";

export type BookingStatus = "new" | "confirmed" | "cancelled";

export type ApiBooking = {
  id: string;
  name: string;
  phone: string;
  branchId: string;
  service: string;
  master: string;
  date: string;
  time: string;
  wish: string;
  status: BookingStatus;
  createdAt: string;
};

export type ApiReview = {
  id: string;
  author: string;
  text: string;
  branchId: string;
  stars: number;
  status: "pending" | "published" | "hidden";
  createdAt: string;
};

export const BUILTIN_ADMIN_TOKEN = "2b051044f67767aa63d27c8dcb9e162f35cd2d0c4f67173a";

export type SiteInfo = {
  phone: string;
  phoneAlt: string;
  hours: string;
  yclients: string;
};

export type ExtraBranch = {
  id: string;
  title: string;
  address: string;
  district: string;
  note: string;
  rating: number;
  marks: number;
  map: string;
};

export type ExtraPrice = { id: string; name: string; price: string; category: string };
export type ExtraPromo = { id: string; title: string; text: string };
export type ExtraFaq = { id: string; q: string; a: string };
export type EditMap = Record<string, Record<string, string | number | string[]>>;

export type ContentState = {
  priceOverrides: Record<string, string>;
  hiddenPriceIds: string[];
  branchOpen: Record<string, boolean>;
  promosOn: Record<string, boolean>;
  hiddenReviewIds: string[];
  guestReviews: ApiReview[];
  extraMasters: Master[];
  hiddenMasterIds: string[];
  integrationOn: Record<string, boolean>;
  branchEdits: EditMap;
  extraBranches: ExtraBranch[];
  hiddenBranchIds: string[];
  priceEdits: EditMap;
  extraPrices: ExtraPrice[];
  promoEdits: EditMap;
  extraPromos: ExtraPromo[];
  masterEdits: EditMap;
  reviewEdits: EditMap;
  faqEdits: EditMap;
  extraFaqs: ExtraFaq[];
  hiddenFaqIds: string[];
  deletedBranchIds: string[];
  deletedPriceIds: string[];
  deletedPromoIds: string[];
  deletedMasterIds: string[];
  deletedReviewIds: string[];
  deletedFaqIds: string[];
  siteInfo: SiteInfo;
};

export function readAdminToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || BUILTIN_ADMIN_TOKEN;
  } catch {
    return BUILTIN_ADMIN_TOKEN;
  }
}

export function writeAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token.trim());
}

export async function fetchPublicContent(): Promise<ContentState | null> {
  try {
    const res = await fetch(`${SALON_API}/content`);
    if (!res.ok) return null;
    return (await res.json()) as ContentState;
  } catch {
    return null;
  }
}

export async function fetchAdminState(token: string) {
  const res = await fetch(`${SALON_API}/admin`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(String(res.status));
  return (await res.json()) as { content: ContentState; bookings: ApiBooking[] };
}

export async function pushContent(token: string, content: ContentState) {
  const res = await fetch(`${SALON_API}/admin/content`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });
  if (!res.ok) throw new Error(String(res.status));
}

export async function postBooking(booking: {
  name: string;
  phone: string;
  branchId: string;
  service: string;
  master: string;
  date: string;
  time: string;
  wish: string;
}) {
  const res = await fetch(`${SALON_API}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
  });
  if (!res.ok) throw new Error(String(res.status));
  return (await res.json()) as ApiBooking;
}

export async function postReview(review: { author: string; text: string; branchId: string; stars: number }) {
  const res = await fetch(`${SALON_API}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(review),
  });
  if (!res.ok) throw new Error(String(res.status));
  return (await res.json()) as ApiReview;
}

export async function deleteBooking(token: string, id: string) {
  const res = await fetch(`${SALON_API}/admin/bookings/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 404) throw new Error(String(res.status));
}

export async function patchBooking(token: string, id: string, status: BookingStatus) {
  const res = await fetch(`${SALON_API}/admin/bookings/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(String(res.status));
}
