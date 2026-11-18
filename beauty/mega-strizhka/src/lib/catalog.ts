import {
  HOURS,
  PHONE_ALT,
  PHONE_ALT_TEL,
  PHONE_DISPLAY,
  PHONE_TEL,
  YCLIENTS,
  branches,
  faqs,
  masters,
  prices,
  promos,
  reviews,
  type Branch,
  type Master,
  type PriceCategory,
  type PriceItem,
  type Review,
} from "@/data/salon";
import type { EditMap, ExtraBranch, ExtraFaq, ExtraPrice, ExtraPromo, SiteInfo } from "@/lib/salon-api";

const emptySite: SiteInfo = { phone: "", phoneAlt: "", hours: "", yclients: "" };

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function num(value: unknown, fallback: number) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function mergeBranches(edits: EditMap, extra: ExtraBranch[], hidden: string[], includeHidden = false): Branch[] {
  const base = branches.map((b) => {
    const edit = edits[b.id] ?? {};
    return {
      ...b,
      title: text(edit.title, b.title),
      address: text(edit.address, b.address),
      district: text(edit.district, b.district),
      note: text(edit.note, b.note),
      map: text(edit.map, b.map),
      rating: num(edit.rating, b.rating),
      marks: num(edit.marks, b.marks),
    };
  });
  const all = [...base, ...extra];
  return includeHidden ? all : all.filter((b) => !hidden.includes(b.id));
}

export function mergePrices(
  edits: EditMap,
  extra: ExtraPrice[],
  overrides: Record<string, string>,
  hidden: string[],
  includeHidden = false,
): PriceItem[] {
  const base = prices.map((item) => {
    const edit = edits[item.id] ?? {};
    const category = text(edit.category, item.category) as PriceCategory;
    return {
      ...item,
      name: text(edit.name, item.name),
      category: ["cut", "color", "complex", "nails"].includes(category) ? category : item.category,
      price: overrides[item.id] || text(edit.price, item.price),
    };
  });
  const added = extra.map((item) => ({
    ...item,
    category: item.category as PriceCategory,
    price: overrides[item.id] || item.price,
  }));
  const all = [...base, ...added];
  return includeHidden ? all : all.filter((item) => !hidden.includes(item.id));
}

export function mergePromos(edits: EditMap, extra: ExtraPromo[], includeHiddenIds: string[] = [], hiddenOff?: Record<string, boolean>) {
  const base = promos.map((item) => {
    const edit = edits[item.id] ?? {};
    return { ...item, title: text(edit.title, item.title), text: text(edit.text, item.text) };
  });
  const all = [...base, ...extra];
  if (!hiddenOff) return all.filter((item) => !includeHiddenIds.includes(item.id));
  return all.filter((item) => hiddenOff[item.id] !== false);
}

export function mergeMasters(edits: EditMap, extra: Master[], hidden: string[], includeHidden = false): Master[] {
  const apply = (m: Master): Master => {
    const edit = edits[m.id] ?? {};
    const branchList = Array.isArray(edit.branches) ? edit.branches.filter((x): x is string => typeof x === "string") : m.branches;
    return {
      ...m,
      name: text(edit.name, m.name),
      role: text(edit.role, m.role),
      note: text(edit.note, m.note),
      branches: branchList.length ? branchList : m.branches,
    };
  };
  const all = [...masters.map(apply), ...extra.map(apply)];
  return includeHidden ? all : all.filter((m) => !hidden.includes(m.id));
}

export function mergeReviews(edits: EditMap): Review[] {
  return reviews.map((r) => {
    const edit = edits[r.id] ?? {};
    return {
      ...r,
      author: text(edit.author, r.author),
      text: text(edit.text, r.text),
      master: text(edit.master, r.master ?? ""),
      source: text(edit.source, r.source),
    };
  });
}

export function mergeFaqs(edits: EditMap, extra: ExtraFaq[], hidden: string[], includeHidden = false) {
  const base = faqs.map((item, i) => {
    const id = `faq-${i}`;
    const edit = edits[id] ?? {};
    return { id, q: text(edit.q, item.q), a: text(edit.a, item.a) };
  });
  const all = [...base, ...extra];
  return includeHidden ? all : all.filter((item) => !hidden.includes(item.id));
}

export function siteContacts(info?: Partial<SiteInfo>) {
  const phone = text(info?.phone, PHONE_DISPLAY);
  const phoneAlt = text(info?.phoneAlt, PHONE_ALT);
  const hours = text(info?.hours, HOURS);
  const yclients = text(info?.yclients, YCLIENTS);
  const tel = (value: string, fallback: string) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10 ? `+${digits}` : fallback;
  };
  return {
    phone,
    phoneAlt,
    hours,
    yclients,
    phoneTel: tel(phone, PHONE_TEL),
    phoneAltTel: tel(phoneAlt, PHONE_ALT_TEL),
  };
}

export { emptySite };
