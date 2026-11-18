import { create } from "zustand";
import { prices, promos } from "@/data/salon";

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
  integrationOn: Record<string, boolean>;
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
    integrationOn: {},
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
      integrationOn: data.integrationOn ?? {},
    };
  } catch {
    return null;
  }
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
    integrationOn: state.integrationOn,
  };
  localStorage.setItem(KEY, JSON.stringify(slice));
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
}));

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
