import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/shell";
import {
  categoryMeta,
  externalConcern,
  integrations,
  type Branch,
  type PriceCategory,
} from "@/data/salon";
import { displayPrice, isBranchOpen, useSalon, type BookingStatus } from "@/lib/salon-store";
import { mergeBranches, mergeFaqs, mergeMasters, mergePrices, mergePromos, mergeReviews, mergeServices } from "@/lib/catalog";
import { Button, fieldClass } from "@/components/ui";
import { cn } from "@/lib/cn";

const sections = [
  ["overview", "Обзор"],
  ["bookings", "Заявки"],
  ["reviews", "Отзывы"],
  ["branches", "Филиалы"],
  ["services", "Услуги"],
  ["prices", "Прайс"],
  ["promos", "Акции"],
  ["masters", "Мастера"],
  ["texts", "Тексты"],
  ["integrations", "Интеграции"],
] as const;

type Section = (typeof sections)[number][0];

const statusLabel: Record<BookingStatus, string> = {
  new: "Новая",
  confirmed: "Подтверждена",
  cancelled: "Отменена",
};

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const [section, setSection] = useState<Section>("overview");
  const bookings = useSalon((s) => s.bookings);
  const guestReviews = useSalon((s) => s.guestReviews);
  const setBookingStatus = useSalon((s) => s.setBookingStatus);
  const setGuestReviewStatus = useSalon((s) => s.setGuestReviewStatus);
  const hiddenReviewIds = useSalon((s) => s.hiddenReviewIds);
  const toggleHiddenReview = useSalon((s) => s.toggleHiddenReview);
  const branchOpen = useSalon((s) => s.branchOpen);
  const toggleBranch = useSalon((s) => s.toggleBranch);
  const priceOverrides = useSalon((s) => s.priceOverrides);
  const hiddenPriceIds = useSalon((s) => s.hiddenPriceIds);
  const setPrice = useSalon((s) => s.setPrice);
  const togglePrice = useSalon((s) => s.togglePrice);
  const promosOn = useSalon((s) => s.promosOn);
  const togglePromo = useSalon((s) => s.togglePromo);
  const integrationOn = useSalon((s) => s.integrationOn);
  const toggleIntegration = useSalon((s) => s.toggleIntegration);
  const extraMasters = useSalon((s) => s.extraMasters);
  const hiddenMasterIds = useSalon((s) => s.hiddenMasterIds);
  const addMaster = useSalon((s) => s.addMaster);
  const toggleMaster = useSalon((s) => s.toggleMaster);
  const connectAdmin = useSalon((s) => s.connectAdmin);
  const branchEdits = useSalon((s) => s.branchEdits);
  const extraBranches = useSalon((s) => s.extraBranches);
  const hiddenBranchIds = useSalon((s) => s.hiddenBranchIds);
  const priceEdits = useSalon((s) => s.priceEdits);
  const extraPrices = useSalon((s) => s.extraPrices);
  const promoEdits = useSalon((s) => s.promoEdits);
  const extraPromos = useSalon((s) => s.extraPromos);
  const masterEdits = useSalon((s) => s.masterEdits);
  const reviewEdits = useSalon((s) => s.reviewEdits);
  const faqEdits = useSalon((s) => s.faqEdits);
  const extraFaqs = useSalon((s) => s.extraFaqs);
  const hiddenFaqIds = useSalon((s) => s.hiddenFaqIds);
  const deletedBranchIds = useSalon((s) => s.deletedBranchIds);
  const deletedPriceIds = useSalon((s) => s.deletedPriceIds);
  const deletedPromoIds = useSalon((s) => s.deletedPromoIds);
  const deletedMasterIds = useSalon((s) => s.deletedMasterIds);
  const deletedReviewIds = useSalon((s) => s.deletedReviewIds);
  const deletedFaqIds = useSalon((s) => s.deletedFaqIds);
  const extraServices = useSalon((s) => s.extraServices);
  const serviceEdits = useSalon((s) => s.serviceEdits);
  const hiddenServiceIds = useSalon((s) => s.hiddenServiceIds);
  const deletedServiceIds = useSalon((s) => s.deletedServiceIds);
  const addService = useSalon((s) => s.addService);
  const toggleService = useSalon((s) => s.toggleService);
  const removeCard = useSalon((s) => s.removeCard);
  const siteInfo = useSalon((s) => s.siteInfo);
  const editMap = useSalon((s) => s.editMap);
  const addBranch = useSalon((s) => s.addBranch);
  const toggleBranchHidden = useSalon((s) => s.toggleBranchHidden);
  const addPriceItem = useSalon((s) => s.addPriceItem);
  const addPromoItem = useSalon((s) => s.addPromoItem);
  const addFaqItem = useSalon((s) => s.addFaqItem);
  const toggleFaq = useSalon((s) => s.toggleFaq);
  const setSiteInfo = useSalon((s) => s.setSiteInfo);
  const [masterName, setMasterName] = useState("");
  const [masterRole, setMasterRole] = useState("");
  const [masterNote, setMasterNote] = useState("");
  const [masterBranches, setMasterBranches] = useState<string[]>([]);

  useEffect(() => {
    void connectAdmin();
  }, [connectAdmin]);

  const branchList = mergeBranches(branchEdits, extraBranches, hiddenBranchIds, true, deletedBranchIds);
  const priceList = mergePrices(priceEdits, extraPrices, priceOverrides, hiddenPriceIds, true, deletedPriceIds);
  const serviceList = mergeServices(serviceEdits, extraServices, hiddenServiceIds, true, deletedServiceIds);
  const promoList = mergePromos(promoEdits, extraPromos, [], undefined, deletedPromoIds);
  const masterList = mergeMasters(masterEdits, extraMasters, hiddenMasterIds, true, deletedMasterIds);
  const reviewList = mergeReviews(reviewEdits, deletedReviewIds);
  const faqList = mergeFaqs(faqEdits, extraFaqs, hiddenFaqIds, true, deletedFaqIds);
  const fresh = bookings.filter((b) => b.status === "new").length;
  const pending = guestReviews.filter((r) => r.status === "pending").length;

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <div className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-copper-deep">Для администратора</p>
            <h1 className="mt-1 font-display text-4xl leading-none sm:text-5xl">Админка</h1>
          </div>
          <p className="max-w-xs text-sm leading-6 text-muted">Заявки, отзывы, прайс, филиалы и тексты сети.</p>
        </div>

        <div className="mt-6 grid min-w-0 gap-6 md:grid-cols-[13rem_minmax(0,1fr)]">
          <aside className="min-w-0">
            <nav className="flex flex-wrap gap-2 md:flex-col md:flex-nowrap">
              {sections.map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setSection(id)}
                  className={cn(
                    "min-h-11 rounded-full px-3 text-left text-sm md:w-full md:rounded-2xl",
                    section === id ? "bg-copper text-ink" : "bg-sand text-ink hover:bg-sand/70",
                  )}
                >
                  {label}
                  {id === "bookings" && fresh > 0 ? ` · ${fresh}` : ""}
                  {id === "reviews" && pending > 0 ? ` · ${pending}` : ""}
                </button>
              ))}
            </nav>
          </aside>

          <div className="min-w-0">
          {section === "overview" && (
            <section>
              <h2 className="font-display text-3xl leading-tight sm:text-4xl">Сегодня</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Stat n={String(fresh)} label="новых заявок" />
                <Stat n={String(pending)} label="отзывов на модерации" />
                <Stat
                  n={String(branchList.filter((b) => !hiddenBranchIds.includes(b.id) && isBranchOpen(branchOpen, b.id)).length)}
                  label="салонов принимают запись"
                />
              </div>
              <p className="mt-5 max-w-xl text-sm leading-6 text-muted">
                Новые заявки и отзывы, которые ещё не разобрали.
              </p>
              <div className="mt-6 min-w-0 overflow-hidden rounded-3xl bg-sand p-4 sm:p-5">
                <h3 className="font-semibold">Неделя, схематично</h3>
                <p className="mt-1 text-sm text-muted">Не расписание салона — просто как будет выглядеть загрузка.</p>
                <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs">
                  {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d, i) => (
                    <div key={d} className="min-w-0">
                      <p className="mb-1 text-muted">{d}</p>
                      <div className="flex flex-col gap-1">
                        {[0, 1, 2, 3].map((row) => (
                          <span
                            key={row}
                            className={cn(
                              "h-5 rounded-md sm:h-6",
                              (i + row) % 3 === 0 ? "bg-copper/80" : "bg-surface",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {section === "bookings" && (
            <section>
              <h2 className="font-display text-3xl leading-tight sm:text-4xl">Заявки</h2>
              <ul className="mt-5 space-y-3">
                {bookings.map((b) => (
                  <li key={b.id} className="rounded-3xl border border-line bg-surface p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">
                          {b.name}
                        </p>
                        <p className="text-sm text-muted">
                          {b.phone} · {branchList.find((x) => x.id === b.branchId)?.address}
                        </p>
                      </div>
                      <span className="rounded-full bg-sand px-2 py-1 text-xs">{statusLabel[b.status]}</span>
                    </div>
                    <p className="mt-2 text-sm">
                      {b.service} · {b.date} {b.time} · {b.master}
                    </p>
                    {b.wish && <p className="mt-1 text-sm text-muted">Пожелание: {b.wish}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(["new", "confirmed", "cancelled"] as BookingStatus[]).map((status) => (
                        <button
                          key={status}
                          className={cn(
                            "min-h-11 rounded-full px-3 text-sm",
                            b.status === status ? "bg-copper text-ink" : "border border-line bg-surface",
                          )}
                          onClick={() => setBookingStatus(b.id, status)}
                        >
                          {statusLabel[status]}
                        </button>
                      ))}
                      <RowActions onDelete={() => removeCard("booking", b.id)} />
                    </div>
                  </li>
                ))}
                {bookings.length === 0 && <p className="text-sm text-muted">Заявок пока нет.</p>}
              </ul>
            </section>
          )}

          {section === "reviews" && (
            <section>
              <h2 className="font-display text-3xl leading-tight sm:text-4xl">Отзывы</h2>
              <article className="mt-5 rounded-3xl bg-sand p-5">
                <p className="text-xs font-semibold text-copper-deep">Внешний · нужен ответ · {externalConcern.source}</p>
                <p className="mt-2 text-sm leading-6">{externalConcern.text}</p>
                <Button
                  variant="line"
                  className="mt-3"
                  onClick={() => toast("Заглушка: ответ в 2ГИС отправится, когда подключим карточку")}
                >
                  Набросать ответ
                </Button>
              </article>
              <h3 className="mt-8 font-semibold">С сайта</h3>
              <ul className="mt-3 space-y-3">
                {guestReviews.length === 0 && (
                  <li className="text-sm text-muted">Новых отзывов нет. Форма стоит на главной, в блоке отзывов.</li>
                )}
                {guestReviews.map((r) => (
                  <li key={r.id} className="rounded-3xl border border-line p-4">
                    <p className="font-semibold">
                      {r.author} · {r.stars}/5 · {r.status === "pending" ? "на модерации" : r.status === "published" ? "на сайте" : "скрыт"}
                    </p>
                    <p className="mt-1 text-sm leading-6">{r.text}</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <button className="min-h-11 rounded-full bg-copper px-3 text-sm font-semibold text-ink" onClick={() => setGuestReviewStatus(r.id, "published")}>
                        Опубликовать
                      </button>
                      <RowActions
                        hidden={r.status === "hidden"}
                        onHide={() => setGuestReviewStatus(r.id, r.status === "hidden" ? "pending" : "hidden")}
                        onDelete={() => removeCard("guest", r.id)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <h3 className="mt-8 font-semibold">Отзывы на сайте</h3>
              <ul className="mt-3 space-y-2">
                {reviewList.map((r) => {
                  const hidden = hiddenReviewIds.includes(r.id);
                  return (
                    <li key={r.id} className="grid gap-2 rounded-2xl border border-line px-3 py-3">
                      <DraftRow values={{ author: r.author, text: r.text }} onSave={(d) => editMap("reviewEdits", r.id, d)}>
                        {(draft, setField) => (
                          <>
                            <input className={fieldClass} value={draft.author} onChange={(e) => setField("author", e.target.value)} aria-label="Имя" />
                            <textarea className={`${fieldClass} min-h-20 py-3`} value={draft.text} onChange={(e) => setField("text", e.target.value)} aria-label="Текст" />
                          </>
                        )}
                      </DraftRow>
                      <RowActions hidden={hidden} onHide={() => toggleHiddenReview(r.id)} onDelete={() => removeCard("review", r.id)} />
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {section === "branches" && (
            <section>
              <h2 className="font-display text-3xl leading-tight sm:text-4xl">Филиалы</h2>
              <BranchForm
                onAdd={(draft) =>
                  addBranch({
                    id: `b-${Date.now()}`,
                    rating: 0,
                    marks: 0,
                    map: "",
                    note: "",
                    district: "",
                    ...draft,
                  })
                }
              />
              <ul className="mt-5 space-y-3">
                {branchList.map((b) => {
                  const open = isBranchOpen(branchOpen, b.id);
                  const hidden = hiddenBranchIds.includes(b.id);
                  const save = (patch: Partial<Branch>) => {
                    if (extraBranches.some((x) => x.id === b.id)) addBranch({ ...b, ...patch });
                    else editMap("branchEdits", b.id, patch as Record<string, string | number>);
                  };
                  return (
                    <li key={b.id} className="grid gap-2 rounded-3xl border border-line p-4">
                      <DraftRow
                        values={{ title: b.title, address: b.address, district: b.district, note: b.note, rating: String(b.rating), marks: String(b.marks), map: b.map }}
                        onSave={(d) => save({ title: d.title, address: d.address, district: d.district, note: d.note, rating: Number(d.rating.replace(",", ".")) || 0, marks: Number(d.marks) || 0, map: d.map })}
                      >
                        {(draft, setField) => (
                          <>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <input className={fieldClass} value={draft.title} onChange={(e) => setField("title", e.target.value)} aria-label="Название" />
                              <input className={fieldClass} value={draft.address} onChange={(e) => setField("address", e.target.value)} aria-label="Адрес" />
                              <input className={fieldClass} value={draft.district} onChange={(e) => setField("district", e.target.value)} aria-label="Район" />
                              <input className={fieldClass} value={draft.note} onChange={(e) => setField("note", e.target.value)} aria-label="Пометка" />
                              <input className={fieldClass} value={draft.rating} onChange={(e) => setField("rating", e.target.value)} aria-label="Оценка" />
                              <input className={fieldClass} value={draft.marks} onChange={(e) => setField("marks", e.target.value)} aria-label="Число оценок" />
                            </div>
                            <input className={fieldClass} value={draft.map} onChange={(e) => setField("map", e.target.value)} aria-label="Ссылка на карту" />
                          </>
                        )}
                      </DraftRow>
                      <div className="flex items-center justify-between gap-2">
                        <button className={cn("min-h-11 rounded-full px-4 text-sm font-semibold", open ? "bg-copper text-ink" : "bg-sand")} onClick={() => toggleBranch(b.id)}>
                          {open ? "Запись открыта" : "Запись закрыта"}
                        </button>
                        <RowActions hidden={hidden} onHide={() => toggleBranchHidden(b.id)} onDelete={() => removeCard("branch", b.id)} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {section === "services" && (
            <section>
              <h2 className="font-display text-3xl leading-tight sm:text-4xl">Услуги</h2>
              <p className="mt-2 text-sm text-muted">Общие названия. Под ними в прайсе лежат конкретные позиции.</p>
              <ServiceForm
                onAdd={(draft) => {
                  addService({ id: `s-${Date.now()}`, ...draft });
                  toast("Услуга добавлена");
                }}
              />
              <ul className="mt-5 space-y-3">
                {serviceList.map((item) => {
                  const hidden = hiddenServiceIds.includes(item.id);
                  return (
                    <li key={item.id} className="rounded-2xl border border-line p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-sm text-muted">{hidden ? "Скрыта" : "На сайте"}</p>
                        <RowActions hidden={hidden} onHide={() => toggleService(item.id)} onDelete={() => removeCard("service", item.id)} />
                      </div>
                      <DraftRow values={{ label: item.label, lead: item.lead }} onSave={(d) => editMap("serviceEdits", item.id, d)}>
                        {(draft, setField) => (
                          <div className="grid gap-2">
                            <input className={fieldClass} value={draft.label} onChange={(e) => setField("label", e.target.value)} aria-label="Название услуги" />
                            <input className={fieldClass} value={draft.lead} onChange={(e) => setField("lead", e.target.value)} aria-label="Коротко" />
                          </div>
                        )}
                      </DraftRow>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {section === "prices" && (
            <section>
              <h2 className="font-display text-3xl leading-tight sm:text-4xl">Прайс</h2>
              <p className="mt-2 text-sm text-muted">Название, цена и новая строка сразу видны на сайте.</p>
              <PriceForm
                services={serviceList.filter((s) => !hiddenServiceIds.includes(s.id))}
                onAdd={(draft) =>
                  addPriceItem({ id: `p-${Date.now()}`, ...draft })
                }
              />
              <ul className="mt-5 space-y-2">
                {priceList.map((item) => {
                  const hidden = hiddenPriceIds.includes(item.id);
                  const save = (patch: { name?: string; price?: string; category?: PriceCategory }) => {
                    if (extraPrices.some((x) => x.id === item.id)) addPriceItem({ ...item, ...patch });
                    else {
                      if (patch.price) setPrice(item.id, patch.price);
                      const rest: Record<string, string> = {};
                      if (patch.name) rest.name = patch.name;
                      if (patch.category) rest.category = patch.category;
                      if (Object.keys(rest).length) editMap("priceEdits", item.id, rest);
                    }
                  };
                  return (
                    <li key={item.id} className="grid min-w-0 gap-2 rounded-2xl border border-line p-3">
                      <DraftRow
                        values={{ name: item.name, price: displayPrice(priceOverrides, item.id, item.price), category: item.category }}
                        onSave={(d) => save({ name: d.name, price: d.price, category: d.category })}
                      >
                        {(draft, setField) => (
                          <>
                            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9rem]">
                              <input className={fieldClass} value={draft.name} onChange={(e) => setField("name", e.target.value)} aria-label="Услуга" />
                              <input className={fieldClass} value={draft.price} onChange={(e) => setField("price", e.target.value)} aria-label="Цена" />
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {serviceList.filter((s) => !hiddenServiceIds.includes(s.id)).map((cat) => (
                                <button key={cat.id} type="button" className={cn("min-h-11 rounded-full px-3 text-sm", draft.category === cat.id ? "bg-copper text-ink" : "bg-sand")} onClick={() => setField("category", cat.id)}>
                                  {cat.label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </DraftRow>
                      <RowActions hidden={hidden} onHide={() => togglePrice(item.id)} onDelete={() => removeCard("price", item.id)} />
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {section === "promos" && (
            <section>
              <h2 className="font-display text-3xl leading-tight sm:text-4xl">Акции</h2>
              <PromoForm onAdd={(draft) => addPromoItem({ id: `promo-${Date.now()}`, ...draft })} />
              <ul className="mt-5 space-y-3">
                {promoList.map((p) => {
                  const save = (patch: { title?: string; text?: string }) => {
                    if (extraPromos.some((x) => x.id === p.id)) addPromoItem({ ...p, ...patch });
                    else editMap("promoEdits", p.id, patch);
                  };
                  return (
                  <li key={p.id} className="rounded-3xl border border-line p-4">
                    <div className="mb-2 flex justify-end">
                      <RowActions hidden={promosOn[p.id] === false} onHide={() => togglePromo(p.id)} onDelete={() => removeCard("promo", p.id)} />
                    </div>
                    <DraftRow values={{ title: p.title, text: p.text }} onSave={(d) => save(d)}>
                      {(draft, setField) => (
                        <>
                          <input className={fieldClass} value={draft.title} onChange={(e) => setField("title", e.target.value)} aria-label="Название акции" />
                          <textarea className={`${fieldClass} min-h-20 py-3`} value={draft.text} onChange={(e) => setField("text", e.target.value)} aria-label="Текст акции" />
                        </>
                      )}
                    </DraftRow>
                  </li>
                  );
                })}
              </ul>
            </section>
          )}

          {section === "masters" && (
            <section>
              <h2 className="font-display text-3xl leading-tight sm:text-4xl">Мастера</h2>
              <p className="mt-2 text-sm text-muted">Новый мастер появляется на сайте. Скрытый пропадает из записи.</p>
              <form
                className="mt-5 grid gap-3 rounded-3xl border border-line p-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (masterName.trim().length < 2 || masterRole.trim().length < 2 || masterBranches.length === 0) {
                    toast("Нужны имя, роль и хотя бы один салон");
                    return;
                  }
                  addMaster({
                    id: `m-${Date.now()}`,
                    name: masterName.trim(),
                    role: masterRole.trim(),
                    note: masterNote.trim(),
                    branches: masterBranches,
                  });
                  setMasterName("");
                  setMasterRole("");
                  setMasterNote("");
                  toast("Мастер добавлен");
                }}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={fieldClass} value={masterName} onChange={(e) => setMasterName(e.target.value)} placeholder="Имя" />
                  <input className={fieldClass} value={masterRole} onChange={(e) => setMasterRole(e.target.value)} placeholder="Что делает" />
                </div>
                <textarea className={`${fieldClass} min-h-20 py-3`} value={masterNote} onChange={(e) => setMasterNote(e.target.value)} placeholder="Коротко, как о нём говорят гости" />
                <div className="flex flex-wrap gap-2">
                  {branchList.filter((b) => !hiddenBranchIds.includes(b.id)).map((b) => {
                    const on = masterBranches.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        className={cn("min-h-11 rounded-full px-3 text-sm", on ? "bg-copper text-ink" : "bg-sand")}
                        onClick={() =>
                          setMasterBranches((cur) => (on ? cur.filter((id) => id !== b.id) : [...cur, b.id]))
                        }
                      >
                        {b.title}
                      </button>
                    );
                  })}
                </div>
                <Button type="submit" className="self-start">
                  Добавить мастера
                </Button>
              </form>
              <ul className="mt-5 space-y-3">
                {masterList.map((m) => {
                  const hidden = hiddenMasterIds.includes(m.id);
                  const save = (patch: { name?: string; role?: string; note?: string }) => {
                    if (extraMasters.some((x) => x.id === m.id)) addMaster({ ...m, ...patch });
                    else editMap("masterEdits", m.id, patch);
                  };
                  return (
                    <li key={m.id} className="grid gap-2 rounded-3xl border border-line p-4">
                      <DraftRow values={{ name: m.name, role: m.role, note: m.note }} onSave={(d) => save(d)}>
                        {(draft, setField) => (
                          <>
                            <input className={fieldClass} value={draft.name} onChange={(e) => setField("name", e.target.value)} aria-label="Имя" />
                            <input className={fieldClass} value={draft.role} onChange={(e) => setField("role", e.target.value)} aria-label="Роль" />
                            <textarea className={`${fieldClass} min-h-20 py-3`} value={draft.note} onChange={(e) => setField("note", e.target.value)} aria-label="Заметка" />
                          </>
                        )}
                      </DraftRow>
                      <p className="text-sm text-muted">
                        {m.branches.map((id) => branchList.find((b) => b.id === id)?.address).filter(Boolean).join(" · ")}
                      </p>
                      <RowActions hidden={hidden} onHide={() => toggleMaster(m.id)} onDelete={() => removeCard("master", m.id)} />
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {section === "texts" && (
            <section>
              <h2 className="font-display text-3xl leading-tight sm:text-4xl">Тексты</h2>
              <p className="mt-2 text-sm text-muted">Телефоны, часы, ссылка записи и вопросы.</p>
              <div className="mt-5">
                <DraftRow values={{ phone: siteInfo.phone, phoneAlt: siteInfo.phoneAlt, hours: siteInfo.hours, yclients: siteInfo.yclients }} onSave={(d) => setSiteInfo(d)}>
                  {(draft, setField) => (
                    <div className="grid gap-2">
                      <input className={fieldClass} placeholder="Основной телефон" value={draft.phone} onChange={(e) => setField("phone", e.target.value)} />
                      <input className={fieldClass} placeholder="Второй телефон" value={draft.phoneAlt} onChange={(e) => setField("phoneAlt", e.target.value)} />
                      <input className={fieldClass} placeholder="Часы работы" value={draft.hours} onChange={(e) => setField("hours", e.target.value)} />
                      <input className={fieldClass} placeholder="Ссылка YClients" value={draft.yclients} onChange={(e) => setField("yclients", e.target.value)} />
                    </div>
                  )}
                </DraftRow>
              </div>
              <FaqForm onAdd={(draft) => addFaqItem({ id: `faq-${Date.now()}`, ...draft })} />
              <ul className="mt-5 space-y-3">
                {faqList.map((item) => {
                  const hidden = hiddenFaqIds.includes(item.id);
                  const save = (patch: { q?: string; a?: string }) => {
                    if (extraFaqs.some((x) => x.id === item.id)) addFaqItem({ ...item, ...patch });
                    else editMap("faqEdits", item.id, patch);
                  };
                  return (
                    <li key={item.id} className="grid gap-2 rounded-3xl border border-line p-4">
                      <DraftRow values={{ q: item.q, a: item.a }} onSave={(d) => save(d)}>
                        {(draft, setField) => (
                          <>
                            <input className={fieldClass} value={draft.q} onChange={(e) => setField("q", e.target.value)} aria-label="Вопрос" />
                            <textarea className={`${fieldClass} min-h-20 py-3`} value={draft.a} onChange={(e) => setField("a", e.target.value)} aria-label="Ответ" />
                          </>
                        )}
                      </DraftRow>
                      <RowActions hidden={hidden} onHide={() => toggleFaq(item.id)} onDelete={() => removeCard("faq", item.id)} />
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {section === "integrations" && (
            <section>
              <h2 className="font-display text-3xl leading-tight sm:text-4xl">Интеграции</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                Ключ появится здесь, когда подключение будет готово.
              </p>
              <ul className="mt-5 space-y-3">
                {integrations.map((item) => {
                  const on = Boolean(integrationOn[item.id]);
                  return (
                    <li key={item.id} className="rounded-3xl border border-line p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <h3 className="font-semibold">{item.name}</h3>
                        <button
                          className={cn("min-h-11 shrink-0 rounded-full px-3 text-sm", on ? "bg-copper text-ink" : "bg-sand")}
                          onClick={() => {
                            toggleIntegration(item.id);
                            toast(on ? "Подключение снято с плана" : "Ключ добавим, когда сервис будет подключён");
                          }}
                        >
                          {on ? "Отмечено" : "Подключить"}
                        </button>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
                      {on && (
                        <label className="mt-3 block text-sm">
                          <span className="mb-1 block text-muted">Ключ, когда будет</span>
                          <input className={fieldClass} disabled placeholder="•••• не подключено" />
                        </label>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-3xl bg-sand p-4">
      <p className="font-display text-4xl text-copper">{n}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}


function DraftRow({
  values,
  onSave,
  children,
}: {
  values: Record<string, string>;
  onSave: (next: Record<string, string>) => void;
  children: (draft: Record<string, string>, setField: (key: string, value: string) => void) => ReactNode;
}) {
  const [draft, setDraft] = useState(values);
  const [base, setBase] = useState(values);
  const stamp = JSON.stringify(values);
  useEffect(() => {
    setDraft(values);
    setBase(values);
  }, [stamp]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(base);
  return (
    <div className="grid gap-2">
      {children(draft, (key, value) => setDraft((current) => ({ ...current, [key]: value })))}
      {dirty && (
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => { onSave(draft); setBase(draft); }}>Сохранить</Button>
          <Button type="button" variant="line" onClick={() => setDraft(base)}>Отмена</Button>
        </div>
      )}
    </div>
  );
}

function ServiceForm({ onAdd }: { onAdd: (draft: { label: string; lead: string }) => void }) {
  const [label, setLabel] = useState("");
  const [lead, setLead] = useState("");
  return (
    <form
      className="mt-5 grid gap-2 rounded-3xl border border-line p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (label.trim().length < 2) return;
        onAdd({ label: label.trim(), lead: lead.trim() });
        setLabel("");
        setLead("");
      }}
    >
      <input className={fieldClass} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Название услуги" />
      <input className={fieldClass} value={lead} onChange={(e) => setLead(e.target.value)} placeholder="Коротко, одной фразой" />
      <Button type="submit">Добавить услугу</Button>
    </form>
  );
}

function RowActions({
  hidden,
  onHide,
  onDelete,
}: {
  hidden?: boolean;
  onHide?: () => void;
  onDelete: () => void;
}) {
  const [ask, setAsk] = useState(false);
  return (
    <div className="ml-auto flex shrink-0 items-center justify-end gap-1">
      {onHide && (
        <button
          type="button"
          className={cn("inline-flex size-11 items-center justify-center rounded-full", hidden ? "bg-sand text-ink" : "text-muted")}
          aria-label={hidden ? "Показать" : "Скрыть"}
          onClick={onHide}
        >
          {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      )}
      {ask ? (
        <>
          <button type="button" className="min-h-11 rounded-full bg-ink px-3 text-sm font-semibold text-surface" onClick={onDelete}>
            Да
          </button>
          <button type="button" className="min-h-11 rounded-full px-3 text-sm" onClick={() => setAsk(false)}>
            Нет
          </button>
        </>
      ) : (
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-full text-muted"
          aria-label="Удалить"
          onClick={() => setAsk(true)}
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
}

function BranchForm({ onAdd }: { onAdd: (draft: { title: string; address: string }) => void }) {
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  return (
    <form
      className="mt-5 grid gap-2 rounded-3xl border border-line p-4 sm:grid-cols-[1fr_1fr_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        if (title.trim().length < 2 || address.trim().length < 4) return;
        onAdd({ title: title.trim(), address: address.trim() });
        setTitle("");
        setAddress("");
      }}
    >
      <input className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название филиала" />
      <input className={fieldClass} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Адрес" />
      <Button type="submit">Добавить</Button>
    </form>
  );
}

function PriceForm({ services, onAdd }: { services: { id: string; label: string }[]; onAdd: (draft: { name: string; price: string; category: string }) => void }) {
  const [name, setName] = useState("");
  const [price, setPriceValue] = useState("");
  const [category, setCategory] = useState(services[0]?.id ?? "cut");
  return (
    <form
      className="mt-5 grid gap-2 rounded-3xl border border-line p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim().length < 2 || price.trim().length < 1) return;
        onAdd({ name: name.trim(), price: price.trim(), category });
        setName("");
        setPriceValue("");
      }}
    >
      <div className="grid gap-2 sm:grid-cols-[1fr_8rem_auto]">
        <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Услуга" />
        <input className={fieldClass} value={price} onChange={(e) => setPriceValue(e.target.value)} placeholder="Цена" />
        <Button type="submit">Добавить</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {services.map((cat) => (
          <button key={cat.id} type="button" className={cn("min-h-11 rounded-full px-3 text-sm", category === cat.id ? "bg-copper text-ink" : "bg-sand")} onClick={() => setCategory(cat.id)}>
            {cat.label}
          </button>
        ))}
      </div>
    </form>
  );
}

function PromoForm({ onAdd }: { onAdd: (draft: { title: string; text: string }) => void }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  return (
    <form
      className="mt-5 grid gap-2 rounded-3xl border border-line p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (title.trim().length < 2) return;
        onAdd({ title: title.trim(), text: text.trim() });
        setTitle("");
        setText("");
      }}
    >
      <input className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Новая акция" />
      <textarea className={`${fieldClass} min-h-20 py-3`} value={text} onChange={(e) => setText(e.target.value)} placeholder="Текст" />
      <Button type="submit" className="self-start">Добавить</Button>
    </form>
  );
}

function FaqForm({ onAdd }: { onAdd: (draft: { q: string; a: string }) => void }) {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  return (
    <form
      className="mt-5 grid gap-2 rounded-3xl border border-line p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim().length < 3 || a.trim().length < 3) return;
        onAdd({ q: q.trim(), a: a.trim() });
        setQ("");
        setA("");
      }}
    >
      <input className={fieldClass} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Новый вопрос" />
      <textarea className={`${fieldClass} min-h-20 py-3`} value={a} onChange={(e) => setA(e.target.value)} placeholder="Ответ" />
      <Button type="submit" className="self-start">Добавить вопрос</Button>
    </form>
  );
}
