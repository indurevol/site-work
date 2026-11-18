import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Shell } from "@/components/shell";
import {
  branches,
  externalConcern,
  integrations,
  masters,
  prices,
  promos,
  reviews,
  categoryMeta,
} from "@/data/salon";
import { displayPrice, isBranchOpen, useSalon, type BookingStatus } from "@/lib/salon-store";
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
          <p className="max-w-xs text-sm leading-6 text-muted">Заявки, отзывы, прайс и филиалы сети.</p>
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
                  n={String(branches.filter((b) => isBranchOpen(branchOpen, b.id)).length)}
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
                          {b.phone} · {branches.find((x) => x.id === b.branchId)?.address}
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
                {reviews.map((r) => {
                  const hidden = hiddenReviewIds.includes(r.id);
                  return (
                    <li key={r.id} className="flex flex-col gap-2 rounded-2xl border border-line px-3 py-3 sm:flex-row sm:items-start sm:justify-between">
                      <p className={cn("min-w-0 text-sm", hidden && "text-muted line-through")}>
                        {r.author}: {r.text}
                      </p>
                      <button className="min-h-11 shrink-0 self-start text-sm font-semibold text-copper-deep" onClick={() => toggleHiddenReview(r.id)}>
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
              <ul className="mt-5 space-y-3">
                {branches.map((b) => {
                  const open = isBranchOpen(branchOpen, b.id);
                  return (
                    <li key={b.id} className="flex flex-col gap-3 rounded-3xl border border-line p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">{b.address}</p>
                        <p className="text-sm text-muted">
                          {b.district} · {b.rating.toString().replace(".", ",")} · {b.marks} оценок
                        </p>
                      </div>
                      <button
                        className={cn("min-h-11 rounded-full px-4 text-sm font-semibold", open ? "bg-copper text-surface" : "bg-sand")}
                        onClick={() => toggleBranch(b.id)}
                      >
                        {open ? "Запись открыта" : "Запись закрыта"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {section === "prices" && (
            <section>
              <h2 className="font-display text-3xl leading-tight sm:text-4xl">Прайс</h2>
              <p className="mt-2 text-sm text-muted">Изменение сразу видно в прайсе на сайте.</p>
              <ul className="mt-5 space-y-2">
                {prices.map((item) => {
                  const hidden = hiddenPriceIds.includes(item.id);
                  return (
                    <li key={item.id} className="grid min-w-0 gap-2 rounded-2xl border border-line p-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-center">
                      <div className="min-w-0">
                        <p className={cn("text-sm", hidden && "text-muted line-through")}>{item.name}</p>
                        <p className="text-xs text-muted">{categoryMeta[item.category].label}</p>
                      </div>
                      <input
                        className={fieldClass}
                        defaultValue={displayPrice(priceOverrides, item.id, item.price)}
                        key={displayPrice(priceOverrides, item.id, item.price)}
                        onBlur={(e) => setPrice(item.id, e.target.value)}
                        aria-label={`Цена: ${item.name}`}
                      />
                      <button className="min-h-11 text-left text-sm font-semibold text-copper-deep sm:text-center" onClick={() => togglePrice(item.id)}>
                        {hidden ? "Показать" : "Скрыть"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {section === "promos" && (
            <section>
              <h2 className="font-display text-3xl leading-tight sm:text-4xl">Акции</h2>
              <ul className="mt-5 space-y-3">
                {promos.map((p) => (
                  <li key={p.id} className="rounded-3xl border border-line p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="font-semibold">{p.title}</h3>
                      <button
                        className={cn("min-h-11 shrink-0 self-start rounded-full px-3 text-sm", promosOn[p.id] !== false ? "bg-copper text-surface" : "bg-sand")}
                        onClick={() => togglePromo(p.id)}
                      >
                        {promosOn[p.id] !== false ? "На сайте" : "Скрыта"}
                      </button>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">{p.text}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {section === "masters" && (
            <section>
              <h2 className="font-display text-3xl leading-tight sm:text-4xl">Мастера</h2>
              <p className="mt-2 text-sm text-muted">Среда — выходной, остальные дни с 10:00 до 20:00.</p>
              <ul className="mt-5 space-y-3">
                {masters.map((m) => (
                  <li key={m.id} className="rounded-3xl border border-line p-4">
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-sm text-copper-deep">{m.role}</p>
                    <p className="mt-1 text-sm text-muted">
                      {m.branches.map((id) => branches.find((b) => b.id === id)?.address).join(" · ")}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["Пн", "Вт", "Ср", "Чт", "Пт"].map((d, i) => (
                        <span
                          key={d}
                          className={cn(
                            "rounded-full px-3 py-2 text-xs",
                            i === 2 ? "bg-sand text-muted" : "bg-paper text-ink",
                          )}
                        >
                          {d} · {i === 2 ? "выходной" : "10–20"}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
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
