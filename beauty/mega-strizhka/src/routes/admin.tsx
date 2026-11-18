import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
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
import { mergeBranches, mergeFaqs, mergeMasters, mergePrices, mergePromos, mergeReviews } from "@/lib/catalog";
import { Button, fieldClass } from "@/components/ui";
import { cn } from "@/lib/cn";

const sections = [
  ["overview", "Обзор"],
  ["bookings", "Заявки"],
  ["reviews", "Отзывы"],
  ["branches", "Филиалы"],
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

  const branchList = mergeBranches(branchEdits, extraBranches, hiddenBranchIds, true);
  const priceList = mergePrices(priceEdits, extraPrices, priceOverrides, hiddenPriceIds, true);
  const promoList = mergePromos(promoEdits, extraPromos);
  const masterList = mergeMasters(masterEdits, extraMasters, hiddenMasterIds, true);
  const reviewList = mergeReviews(reviewEdits);
  const faqList = mergeFaqs(faqEdits, extraFaqs, hiddenFaqIds, true);
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
                    section === id ? "bg-copper text-surface" : "bg-sand text-ink hover:bg-sand/70",
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
                            b.status === status ? "bg-copper text-surface" : "border border-line bg-surface",
                          )}
                          onClick={() => setBookingStatus(b.id, status)}
                        >
                          {statusLabel[status]}
                        </button>
                      ))}
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
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button className="min-h-11 rounded-full bg-copper px-3 text-sm font-semibold text-surface" onClick={() => setGuestReviewStatus(r.id, "published")}>
                        Опубликовать
                      </button>
                      <button className="min-h-11 rounded-full border border-line px-3 text-sm" onClick={() => setGuestReviewStatus(r.id, "hidden")}>
                        Скрыть
                      </button>
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
                      <input className={fieldClass} defaultValue={r.author} key={`${r.id}-author-${r.author}`} onBlur={(e) => editMap("reviewEdits", r.id, { author: e.target.value })} />
                      <textarea className={`${fieldClass} min-h-20 py-3`} defaultValue={r.text} key={`${r.id}-text-${r.text}`} onBlur={(e) => editMap("reviewEdits", r.id, { text: e.target.value })} />
                      <button className="min-h-11 self-start text-sm font-semibold text-copper-deep" onClick={() => toggleHiddenReview(r.id)}>
                        {hidden ? "Вернуть" : "Скрыть"}
                      </button>
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
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input className={fieldClass} defaultValue={b.title} key={`${b.id}-title`} onBlur={(e) => save({ title: e.target.value })} aria-label="Название" />
                        <input className={fieldClass} defaultValue={b.address} key={`${b.id}-address`} onBlur={(e) => save({ address: e.target.value })} aria-label="Адрес" />
                        <input className={fieldClass} defaultValue={b.district} key={`${b.id}-district`} onBlur={(e) => save({ district: e.target.value })} aria-label="Район" />
                        <input className={fieldClass} defaultValue={b.note} key={`${b.id}-note`} onBlur={(e) => save({ note: e.target.value })} aria-label="Пометка" />
                        <input className={fieldClass} defaultValue={String(b.rating)} key={`${b.id}-rating`} onBlur={(e) => save({ rating: Number(e.target.value.replace(",", ".")) || 0 })} aria-label="Оценка" />
                        <input className={fieldClass} defaultValue={String(b.marks)} key={`${b.id}-marks`} onBlur={(e) => save({ marks: Number(e.target.value) || 0 })} aria-label="Число оценок" />
                      </div>
                      <input className={fieldClass} defaultValue={b.map} key={`${b.id}-map`} onBlur={(e) => save({ map: e.target.value })} aria-label="Ссылка на карту" />
                      <div className="flex flex-wrap gap-2">
                        <button className={cn("min-h-11 rounded-full px-4 text-sm font-semibold", open ? "bg-copper text-surface" : "bg-sand")} onClick={() => toggleBranch(b.id)}>
                          {open ? "Запись открыта" : "Запись закрыта"}
                        </button>
                        <button className="min-h-11 rounded-full bg-sand px-4 text-sm font-semibold" onClick={() => toggleBranchHidden(b.id)}>
                          {hidden ? "Скрыт с сайта" : "На сайте"}
                        </button>
                      </div>
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
                      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9rem]">
                        <input className={fieldClass} defaultValue={item.name} key={`${item.id}-name`} onBlur={(e) => save({ name: e.target.value })} aria-label="Услуга" />
                        <input
                          className={fieldClass}
                          defaultValue={displayPrice(priceOverrides, item.id, item.price)}
                          key={`${item.id}-price`}
                          onBlur={(e) => save({ price: e.target.value })}
                          aria-label="Цена"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(categoryMeta) as PriceCategory[]).map((cat) => (
                          <button key={cat} className={cn("min-h-11 rounded-full px-3 text-sm", item.category === cat ? "bg-copper text-surface" : "bg-sand")} onClick={() => save({ category: cat })}>
                            {categoryMeta[cat].label}
                          </button>
                        ))}
                        <button className="min-h-11 text-sm font-semibold text-copper-deep" onClick={() => togglePrice(item.id)}>
                          {hidden ? "Показать" : "Скрыть"}
                        </button>
                      </div>
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
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <input className={fieldClass} defaultValue={p.title} key={`${p.id}-title`} onBlur={(e) => save({ title: e.target.value })} aria-label="Название акции" />
                      <button
                        className={cn("min-h-11 shrink-0 self-start rounded-full px-3 text-sm", promosOn[p.id] !== false ? "bg-copper text-surface" : "bg-sand")}
                        onClick={() => togglePromo(p.id)}
                      >
                        {promosOn[p.id] !== false ? "На сайте" : "Скрыта"}
                      </button>
                    </div>
                    <textarea className={`${fieldClass} mt-2 min-h-20 py-3`} defaultValue={p.text} key={`${p.id}-text`} onBlur={(e) => save({ text: e.target.value })} aria-label="Текст акции" />
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
                        className={cn("min-h-11 rounded-full px-3 text-sm", on ? "bg-copper text-surface" : "bg-sand")}
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
                      <input className={fieldClass} defaultValue={m.name} key={`${m.id}-name`} onBlur={(e) => save({ name: e.target.value })} aria-label="Имя" />
                      <input className={fieldClass} defaultValue={m.role} key={`${m.id}-role`} onBlur={(e) => save({ role: e.target.value })} aria-label="Роль" />
                      <textarea className={`${fieldClass} min-h-20 py-3`} defaultValue={m.note} key={`${m.id}-note`} onBlur={(e) => save({ note: e.target.value })} aria-label="Заметка" />
                      <p className="text-sm text-muted">
                        {m.branches.map((id) => branchList.find((b) => b.id === id)?.address).filter(Boolean).join(" · ")}
                      </p>
                      <button
                        className={cn("min-h-11 self-start rounded-full px-3 text-sm", hidden ? "bg-sand" : "bg-copper text-surface")}
                        onClick={() => toggleMaster(m.id)}
                      >
                        {hidden ? "Скрыт" : "На сайте"}
                      </button>
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
              <div className="mt-5 grid gap-2">
                <input className={fieldClass} placeholder="Основной телефон" defaultValue={siteInfo.phone} onBlur={(e) => setSiteInfo({ phone: e.target.value })} />
                <input className={fieldClass} placeholder="Второй телефон" defaultValue={siteInfo.phoneAlt} onBlur={(e) => setSiteInfo({ phoneAlt: e.target.value })} />
                <input className={fieldClass} placeholder="Часы работы" defaultValue={siteInfo.hours} onBlur={(e) => setSiteInfo({ hours: e.target.value })} />
                <input className={fieldClass} placeholder="Ссылка YClients" defaultValue={siteInfo.yclients} onBlur={(e) => setSiteInfo({ yclients: e.target.value })} />
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
                      <input className={fieldClass} defaultValue={item.q} key={`${item.id}-q`} onBlur={(e) => save({ q: e.target.value })} aria-label="Вопрос" />
                      <textarea className={`${fieldClass} min-h-20 py-3`} defaultValue={item.a} key={`${item.id}-a`} onBlur={(e) => save({ a: e.target.value })} aria-label="Ответ" />
                      <button className="min-h-11 self-start text-sm font-semibold text-copper-deep" onClick={() => toggleFaq(item.id)}>
                        {hidden ? "Скрыт" : "На сайте"}
                      </button>
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
                          className={cn("min-h-11 shrink-0 rounded-full px-3 text-sm", on ? "bg-copper text-surface" : "bg-sand")}
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

function PriceForm({ onAdd }: { onAdd: (draft: { name: string; price: string; category: PriceCategory }) => void }) {
  const [name, setName] = useState("");
  const [price, setPriceValue] = useState("");
  const [category, setCategory] = useState<PriceCategory>("cut");
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
        {(Object.keys(categoryMeta) as PriceCategory[]).map((cat) => (
          <button key={cat} type="button" className={cn("min-h-11 rounded-full px-3 text-sm", category === cat ? "bg-copper text-surface" : "bg-sand")} onClick={() => setCategory(cat)}>
            {categoryMeta[cat].label}
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
