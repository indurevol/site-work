import { create } from "zustand";
import { masters, prices, promos, type Master } from "@/data/salon";
import {
  fetchAdminState,
  fetchPublicContent,
  patchBooking,
  deleteBooking,
  pushContent,
  readAdminToken,
  type ContentState,
  type ExtraBranch,
  type ExtraFaq,
  type ExtraPrice,
  type ExtraPromo,
  type SiteInfo,
} from "@/lib/salon-api";

export type BookingStatus = "new" | "confirmed" | "cancelled";

export type Booking = {
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
  example?: boolean;
  createdAt: string;
};

export type GuestReview = {
  id: string;
  author: string;
  text: string;
  branchId: string;
  stars: number;
  status: "pending" | "published" | "hidden";
  createdAt: string;
};

type Persisted = {
  bookings: Booking[];
  guestReviews: GuestReview[];
  hiddenReviewIds: string[];
  priceOverrides: Record<string, string>;
  hiddenPriceIds: string[];
  branchOpen: Record<string, boolean>;
  promosOn: Record<string, boolean>;
  hiddenMasterIds: string[];
  extraMasters: Master[];
  integrationOn: Record<string, boolean>;
  branchEdits: ContentState["branchEdits"];
  extraBranches: ExtraBranch[];
  hiddenBranchIds: string[];
  priceEdits: ContentState["priceEdits"];
  extraPrices: ExtraPrice[];
  promoEdits: ContentState["promoEdits"];
  extraPromos: ExtraPromo[];
  masterEdits: ContentState["masterEdits"];
  reviewEdits: ContentState["reviewEdits"];
  faqEdits: ContentState["faqEdits"];
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

type State = Persisted & {
  hydrated: boolean;
  bookingOpen: boolean;
  presetService: string;
  presetBranch: string;
  hydrate: () => void;
  openBooking: (partial?: { service?: string; branchId?: string }) => void;
  closeBooking: () => void;
  addBooking: (booking: Booking) => void;
  setBookingStatus: (id: string, status: BookingStatus) => void;
  addGuestReview: (review: GuestReview) => void;
  setGuestReviewStatus: (id: string, status: GuestReview["status"]) => void;
  toggleHiddenReview: (id: string) => void;
  setPrice: (id: string, value: string) => void;
  togglePrice: (id: string) => void;
  toggleBranch: (id: string) => void;
  togglePromo: (id: string) => void;
  toggleIntegration: (id: string) => void;
  addMaster: (master: Master) => void;
  toggleMaster: (id: string) => void;
  connectAdmin: () => Promise<boolean>;
  editMap: (key: "branchEdits" | "priceEdits" | "promoEdits" | "masterEdits" | "reviewEdits" | "faqEdits", id: string, patch: Record<string, string | number | string[]>) => void;
  addBranch: (branch: ExtraBranch) => void;
  toggleBranchHidden: (id: string) => void;
  addPriceItem: (item: ExtraPrice) => void;
  addPromoItem: (item: ExtraPromo) => void;
  addFaqItem: (item: ExtraFaq) => void;
  toggleFaq: (id: string) => void;
  setSiteInfo: (patch: Partial<SiteInfo>) => void;
  removeCard: (kind: "branch" | "price" | "promo" | "master" | "review" | "faq" | "guest" | "booking", id: string) => void;
};

const KEY = "mega-strizhka-demo";

const exampleBookings: Booking[] = [
  {
    id: "ex-1",
    name: "Мария",
    phone: "+7 900 000-00-01",
    branchId: "yursha",
    service: "Женская модельная с мытьём",
    master: "Анастасия",
    date: "2026-11-20",
    time: "18:00",
    wish: "Короткий каре, референс пришлю в салон",
    status: "new",
    example: true,
    createdAt: "2026-11-18T08:00:00.000Z",
  },
  {
    id: "ex-2",
    name: "Игорь",
    phone: "+7 900 000-00-02",
    branchId: "mira",
    service: "Мужская модельная",
    master: "Любой свободный",
    date: "2026-11-19",
    time: "12:30",
    wish: "",
    status: "confirmed",
    example: true,
    createdAt: "2026-11-18T07:00:00.000Z",
  },
];

function initialPersisted(): Persisted {
  return {
    bookings: exampleBookings,
    guestReviews: [],
    hiddenReviewIds: [],
    priceOverrides: {},
    hiddenPriceIds: [],
    branchOpen: {},
    promosOn: Object.fromEntries(promos.map((p) => [p.id, true])),
    extraMasters: [],
    hiddenMasterIds: [],
    integrationOn: {},
    branchEdits: {},
    extraBranches: [],
    hiddenBranchIds: [],
    priceEdits: {},
    extraPrices: [],
    promoEdits: {},
    extraPromos: [],
    masterEdits: {},
    reviewEdits: {},
    faqEdits: {},
    extraFaqs: [],
    hiddenFaqIds: [],
    deletedBranchIds: [],
    deletedPriceIds: [],
    deletedPromoIds: [],
    deletedMasterIds: [],
    deletedReviewIds: [],
    deletedFaqIds: [],
    siteInfo: { phone: "", phoneAlt: "", hours: "", yclients: "" },
  };
}

function readPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Persisted>;
    const base = initialPersisted();
    return {
      ...base,
      ...data,
      bookings: Array.isArray(data.bookings) ? data.bookings : base.bookings,
      guestReviews: Array.isArray(data.guestReviews) ? data.guestReviews : [],
      hiddenReviewIds: Array.isArray(data.hiddenReviewIds) ? data.hiddenReviewIds : [],
      priceOverrides: data.priceOverrides ?? {},
      hiddenPriceIds: Array.isArray(data.hiddenPriceIds) ? data.hiddenPriceIds : [],
      branchOpen: data.branchOpen ?? {},
      promosOn: { ...base.promosOn, ...data.promosOn },
      extraMasters: Array.isArray(data.extraMasters) ? data.extraMasters : [],
      hiddenMasterIds: Array.isArray(data.hiddenMasterIds) ? data.hiddenMasterIds : [],
      integrationOn: data.integrationOn ?? {},
      branchEdits: data.branchEdits ?? {},
      extraBranches: Array.isArray(data.extraBranches) ? data.extraBranches : [],
      hiddenBranchIds: Array.isArray(data.hiddenBranchIds) ? data.hiddenBranchIds : [],
      priceEdits: data.priceEdits ?? {},
      extraPrices: Array.isArray(data.extraPrices) ? data.extraPrices : [],
      promoEdits: data.promoEdits ?? {},
      extraPromos: Array.isArray(data.extraPromos) ? data.extraPromos : [],
      masterEdits: data.masterEdits ?? {},
      reviewEdits: data.reviewEdits ?? {},
      faqEdits: data.faqEdits ?? {},
      extraFaqs: Array.isArray(data.extraFaqs) ? data.extraFaqs : [],
      hiddenFaqIds: Array.isArray(data.hiddenFaqIds) ? data.hiddenFaqIds : [],
      deletedBranchIds: Array.isArray(data.deletedBranchIds) ? data.deletedBranchIds : [],
      deletedPriceIds: Array.isArray(data.deletedPriceIds) ? data.deletedPriceIds : [],
      deletedPromoIds: Array.isArray(data.deletedPromoIds) ? data.deletedPromoIds : [],
      deletedMasterIds: Array.isArray(data.deletedMasterIds) ? data.deletedMasterIds : [],
      deletedReviewIds: Array.isArray(data.deletedReviewIds) ? data.deletedReviewIds : [],
      deletedFaqIds: Array.isArray(data.deletedFaqIds) ? data.deletedFaqIds : [],
      siteInfo: { ...base.siteInfo, ...data.siteInfo },
    };
  } catch {
    return null;
  }
}

function contentOf(state: State): ContentState {
  return {
    priceOverrides: state.priceOverrides,
    hiddenPriceIds: state.hiddenPriceIds,
    branchOpen: state.branchOpen,
    promosOn: state.promosOn,
    hiddenReviewIds: state.hiddenReviewIds,
    guestReviews: state.guestReviews,
    extraMasters: state.extraMasters,
    hiddenMasterIds: state.hiddenMasterIds,
    integrationOn: state.integrationOn,
    branchEdits: state.branchEdits,
    extraBranches: state.extraBranches,
    hiddenBranchIds: state.hiddenBranchIds,
    priceEdits: state.priceEdits,
    extraPrices: state.extraPrices,
    promoEdits: state.promoEdits,
    extraPromos: state.extraPromos,
    masterEdits: state.masterEdits,
    reviewEdits: state.reviewEdits,
    faqEdits: state.faqEdits,
    extraFaqs: state.extraFaqs,
    hiddenFaqIds: state.hiddenFaqIds,
    deletedBranchIds: state.deletedBranchIds,
    deletedPriceIds: state.deletedPriceIds,
    deletedPromoIds: state.deletedPromoIds,
    deletedMasterIds: state.deletedMasterIds,
    deletedReviewIds: state.deletedReviewIds,
    deletedFaqIds: state.deletedFaqIds,
    siteInfo: state.siteInfo,
  };
}

function save(state: State) {
  const slice: Persisted = {
    bookings: state.bookings,
    guestReviews: state.guestReviews,
    hiddenReviewIds: state.hiddenReviewIds,
    priceOverrides: state.priceOverrides,
    hiddenPriceIds: state.hiddenPriceIds,
    branchOpen: state.branchOpen,
    promosOn: state.promosOn,
    extraMasters: state.extraMasters,
    hiddenMasterIds: state.hiddenMasterIds,
    integrationOn: state.integrationOn,
    branchEdits: state.branchEdits,
    extraBranches: state.extraBranches,
    hiddenBranchIds: state.hiddenBranchIds,
    priceEdits: state.priceEdits,
    extraPrices: state.extraPrices,
    promoEdits: state.promoEdits,
    extraPromos: state.extraPromos,
    masterEdits: state.masterEdits,
    reviewEdits: state.reviewEdits,
    faqEdits: state.faqEdits,
    extraFaqs: state.extraFaqs,
    hiddenFaqIds: state.hiddenFaqIds,
    deletedBranchIds: state.deletedBranchIds,
    deletedPriceIds: state.deletedPriceIds,
    deletedPromoIds: state.deletedPromoIds,
    deletedMasterIds: state.deletedMasterIds,
    deletedReviewIds: state.deletedReviewIds,
    deletedFaqIds: state.deletedFaqIds,
    siteInfo: state.siteInfo,
  };
  localStorage.setItem(KEY, JSON.stringify(slice));
  const token = readAdminToken();
  if (!token) return;
  void pushContent(token, contentOf(state)).catch(() => undefined);
}

export const useSalon = create<State>((set, get) => ({
  ...initialPersisted(),
  hydrated: false,
  bookingOpen: false,
  presetService: prices[5]?.name ?? "",
  presetBranch: "krupskoy",
  hydrate: () => {
    if (get().hydrated) return;
    const data = readPersisted();
    set(data ? { ...data, hydrated: true } : { hydrated: true });
    void fetchAdminState(readAdminToken())
      .then((admin) => set({ ...admin.content, bookings: admin.bookings }))
      .catch(() => {
        void fetchPublicContent().then((content) => {
          if (content) set(content);
        });
      });
  },
  openBooking: (partial) =>
    set({
      bookingOpen: true,
      presetService: partial?.service ?? get().presetService,
      presetBranch: partial?.branchId ?? get().presetBranch,
    }),
  closeBooking: () => set({ bookingOpen: false }),
  addBooking: (booking) => {
    set({ bookings: [booking, ...get().bookings] });
    save(get());
  },
  setBookingStatus: (id, status) => {
    set({
      bookings: get().bookings.map((b) => (b.id === id ? { ...b, status } : b)),
    });
    save(get());
    const token = readAdminToken();
    if (token) void patchBooking(token, id, status).catch(() => undefined);
  },
  addGuestReview: (review) => {
    set({ guestReviews: [review, ...get().guestReviews] });
    save(get());
  },
  setGuestReviewStatus: (id, status) => {
    set({
      guestReviews: get().guestReviews.map((r) => (r.id === id ? { ...r, status } : r)),
    });
    save(get());
  },
  toggleHiddenReview: (id) => {
    const has = get().hiddenReviewIds.includes(id);
    set({
      hiddenReviewIds: has
        ? get().hiddenReviewIds.filter((x) => x !== id)
        : [...get().hiddenReviewIds, id],
    });
    save(get());
  },
  setPrice: (id, value) => {
    set({ priceOverrides: { ...get().priceOverrides, [id]: value } });
    save(get());
  },
  togglePrice: (id) => {
    const has = get().hiddenPriceIds.includes(id);
    set({
      hiddenPriceIds: has
        ? get().hiddenPriceIds.filter((x) => x !== id)
        : [...get().hiddenPriceIds, id],
    });
    save(get());
  },
  toggleBranch: (id) => {
    const open = get().branchOpen[id] !== false;
    set({ branchOpen: { ...get().branchOpen, [id]: !open } });
    save(get());
  },
  togglePromo: (id) => {
    set({ promosOn: { ...get().promosOn, [id]: !get().promosOn[id] } });
    save(get());
  },
  toggleIntegration: (id) => {
    set({
      integrationOn: { ...get().integrationOn, [id]: !get().integrationOn[id] },
    });
    save(get());
  },
  addMaster: (master) => {
    set({ extraMasters: [master, ...get().extraMasters.filter((m) => m.id !== master.id)] });
    save(get());
  },
  toggleMaster: (id) => {
    const has = get().hiddenMasterIds.includes(id);
    set({
      hiddenMasterIds: has
        ? get().hiddenMasterIds.filter((x) => x !== id)
        : [...get().hiddenMasterIds, id],
    });
    save(get());
  },
  connectAdmin: async () => {
    const token = readAdminToken();
    if (!token) return false;
    try {
      const admin = await fetchAdminState(token);
      set({ ...admin.content, bookings: admin.bookings });
      save(get());
      return true;
    } catch {
      return false;
    }
  },
  editMap: (key, id, patch) => {
    const current = get()[key][id] ?? {};
    set({ [key]: { ...get()[key], [id]: { ...current, ...patch } } });
    save(get());
  },
  addBranch: (branch) => {
    set({ extraBranches: [branch, ...get().extraBranches.filter((b) => b.id !== branch.id)] });
    save(get());
  },
  toggleBranchHidden: (id) => {
    const has = get().hiddenBranchIds.includes(id);
    set({
      hiddenBranchIds: has ? get().hiddenBranchIds.filter((x) => x !== id) : [...get().hiddenBranchIds, id],
    });
    save(get());
  },
  addPriceItem: (item) => {
    set({ extraPrices: [item, ...get().extraPrices.filter((p) => p.id !== item.id)] });
    save(get());
  },
  addPromoItem: (item) => {
    set({
      extraPromos: [item, ...get().extraPromos.filter((p) => p.id !== item.id)],
      promosOn: { ...get().promosOn, [item.id]: get().promosOn[item.id] !== false },
    });
    save(get());
  },
  addFaqItem: (item) => {
    set({ extraFaqs: [item, ...get().extraFaqs.filter((f) => f.id !== item.id)] });
    save(get());
  },
  toggleFaq: (id) => {
    const has = get().hiddenFaqIds.includes(id);
    set({ hiddenFaqIds: has ? get().hiddenFaqIds.filter((x) => x !== id) : [...get().hiddenFaqIds, id] });
    save(get());
  },
  setSiteInfo: (patch) => {
    set({ siteInfo: { ...get().siteInfo, ...patch } });
    save(get());
  },
  removeCard: (kind, id) => {
    const add = (list: string[]) => (list.includes(id) ? list : [...list, id]);
    if (kind === "branch") {
      set({
        extraBranches: get().extraBranches.filter((b) => b.id !== id),
        deletedBranchIds: add(get().deletedBranchIds),
      });
    } else if (kind === "price") {
      set({
        extraPrices: get().extraPrices.filter((p) => p.id !== id),
        deletedPriceIds: add(get().deletedPriceIds),
      });
    } else if (kind === "promo") {
      set({
        extraPromos: get().extraPromos.filter((p) => p.id !== id),
        deletedPromoIds: add(get().deletedPromoIds),
      });
    } else if (kind === "master") {
      set({
        extraMasters: get().extraMasters.filter((m) => m.id !== id),
        deletedMasterIds: add(get().deletedMasterIds),
      });
    } else if (kind === "review") {
      set({ deletedReviewIds: add(get().deletedReviewIds) });
    } else if (kind === "faq") {
      set({
        extraFaqs: get().extraFaqs.filter((f) => f.id !== id),
        deletedFaqIds: add(get().deletedFaqIds),
      });
    } else if (kind === "guest") {
      set({ guestReviews: get().guestReviews.filter((r) => r.id !== id) });
    } else {
      set({ bookings: get().bookings.filter((b) => b.id !== id) });
      void deleteBooking(readAdminToken(), id).catch(() => undefined);
    }
    save(get());
  },
}));

export function visibleMasters(extraMasters: Master[], hiddenMasterIds: string[]) {
  return [...masters, ...extraMasters].filter((m) => !hiddenMasterIds.includes(m.id));
}

export function isBranchOpen(branchOpen: Record<string, boolean>, id: string) {
  return branchOpen[id] !== false;
}

export function displayPrice(
  overrides: Record<string, string>,
  id: string,
  fallback: string,
) {
  const next = overrides[id]?.trim();
  return next ? next : fallback;
}
