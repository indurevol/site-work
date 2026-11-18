import { useMemo, useRef, useState, type ReactNode } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, ChevronLeft, ChevronRight, MapPin, Phone, Star } from "lucide-react";
import { toast } from "sonner";
import {
  alsoInNetwork,
  categoryMeta,
  formatMarks,
  type PriceCategory,
} from "@/data/salon";
import { displayPrice, isBranchOpen, useSalon } from "@/lib/salon-store";
import { postReview } from "@/lib/salon-api";
import { mergeBranches, mergeFaqs, mergeMasters, mergePrices, mergePromos, mergeReviews, siteContacts } from "@/lib/catalog";
import { Button, Field, Rise, Stars, fieldClass } from "@/components/ui";
import { asset, cn } from "@/lib/cn";

const cats: PriceCategory[] = ["cut", "color", "complex", "nails"];

export function HomePage() {
  const openBooking = useSalon((s) => s.openBooking);
  const hiddenPriceIds = useSalon((s) => s.hiddenPriceIds);
  const priceOverrides = useSalon((s) => s.priceOverrides);
  const hiddenReviewIds = useSalon((s) => s.hiddenReviewIds);
  const guestReviews = useSalon((s) => s.guestReviews);
  const addGuestReview = useSalon((s) => s.addGuestReview);
  const branchOpen = useSalon((s) => s.branchOpen);
  const extraMasters = useSalon((s) => s.extraMasters);
  const hiddenMasterIds = useSalon((s) => s.hiddenMasterIds);
  const masterEdits = useSalon((s) => s.masterEdits);
  const branchEdits = useSalon((s) => s.branchEdits);
  const extraBranches = useSalon((s) => s.extraBranches);
  const hiddenBranchIds = useSalon((s) => s.hiddenBranchIds);
  const priceEdits = useSalon((s) => s.priceEdits);
  const extraPrices = useSalon((s) => s.extraPrices);
  const promoEdits = useSalon((s) => s.promoEdits);
  const extraPromos = useSalon((s) => s.extraPromos);
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
  const siteInfo = useSalon((s) => s.siteInfo);
  const promosOn = useSalon((s) => s.promosOn);
  const contacts = siteContacts(siteInfo);
  const shownBranches = mergeBranches(branchEdits, extraBranches, hiddenBranchIds, false, deletedBranchIds);
  const shownMasters = mergeMasters(masterEdits, extraMasters, hiddenMasterIds, false, deletedMasterIds);
  const shownReviews = mergeReviews(reviewEdits, deletedReviewIds);
  const shownFaqs = mergeFaqs(faqEdits, extraFaqs, hiddenFaqIds, false, deletedFaqIds);
  const priceList = mergePrices(priceEdits, extraPrices, priceOverrides, hiddenPriceIds, false, deletedPriceIds);
  const activePromos = mergePromos(promoEdits, extraPromos, [], promosOn, deletedPromoIds);
  const marksTotal = shownBranches.reduce((sum, b) => sum + b.marks, 0);

  const [cat, setCat] = useState<PriceCategory>("cut");
  const [query, setQuery] = useState("");
  const reviewsRef = useRef<HTMLDivElement>(null);
  const [branchFilter, setBranchFilter] = useState("all");
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [reviewBranch, setReviewBranch] = useState(shownBranches[0]?.id ?? "krupskoy");
  const [stars, setStars] = useState(5);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return priceList.filter((item) => {
      if (item.category !== cat) return false;
      if (!q) return true;
      return item.name.toLowerCase().includes(q);
    });
  }, [cat, query, priceList]);

  const visibleReviews = shownReviews.filter((r) => {
    if (hiddenReviewIds.includes(r.id)) return false;
    if (branchFilter !== "all" && r.branchId !== branchFilter) return false;
    return true;
  });
  const publishedGuest = guestReviews.filter(
    (r) => r.status === "published" && (branchFilter === "all" || r.branchId === branchFilter),
  );

  async function sendReview() {
    if (author.trim().length < 2 || text.trim().length < 8) {
      toast("Нужны имя и пара предложений");
      return;
    }
    try {
      const review = await postReview({
        author: author.trim(),
        text: text.trim(),
        branchId: reviewBranch,
        stars,
      });
      addGuestReview(review);
      setAuthor("");
      setText("");
      toast("Спасибо. Отзыв прочитаем перед публикацией");
    } catch {
      toast("Не удалось отправить отзыв. Попробуйте ещё раз");
    }
  }

  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-12 md:px-6 md:py-16">
        <div className="soft-in md:col-span-6">
          <p className="text-sm font-semibold tracking-wide text-copper-deep">Сеть из {shownBranches.length} салонов</p>
          <h1 className="mt-4 font-brand text-[2.15rem] leading-[1.05] font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Стрижка и цвет
            <span className="mt-2 block text-[1.35rem] leading-tight font-bold text-copper sm:text-3xl">Просто профессионально</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-muted">
            Ежедневно {contacts.hours.replace("Ежедневно ", "")}. Короткая стрижка от 300 ₽.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button className="cta-pop min-h-12 px-6 text-base" onClick={() => openBooking()}>
              Записаться
            </Button>
            <a href="#prices" className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-5 text-sm font-semibold">
              Смотреть цены
            </a>
          </div>
          <p className="mt-4 text-sm text-muted">
            Или сразу{" "}
            <a className="underline decoration-line underline-offset-4 hover:text-ink" href={contacts.yclients} target="_blank" rel="noreferrer">
              записаться в YClients
            </a>
          </p>
        </div>
        <div className="soft-in md:col-span-6" style={{ animationDelay: "120ms" }}>
          <div className="relative">
            <img
              src={asset("/photos/salon.jpg")}
              alt="Мужчина и женщина после стрижки в зале с оранжевой стеной"
              className="aspect-[3/2] w-full rounded-3xl object-cover"
            />
            <div className="absolute right-4 bottom-4 left-4 rounded-2xl bg-surface/95 p-4 md:right-auto md:w-64">
              <p className="font-display text-4xl leading-none">4,8</p>
              <p className="mt-1 text-sm text-muted">{formatMarks(marksTotal)} оценок по карточкам 2ГИС</p>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <Rise>
          <h2 className="font-display text-4xl md:text-5xl">Четыре повода зайти</h2>
          <p className="mt-3 max-w-xl text-muted">Стрижка, цвет, сложное окрашивание и маникюр.</p>
        </Rise>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            { cat: "cut" as const, img: asset("/photos/cut.jpg"), alt: "Ножницы, расчёска и тарелка" },
            { cat: "color" as const, img: asset("/photos/color.jpg"), alt: "Пряди пшеничного, медового и каштанового цвета" },
            { cat: "complex" as const, img: asset("/photos/complex.jpg"), alt: "Локон с переходом от тёмного корня к медовым концам" },
            { cat: "nails" as const, img: asset("/photos/nails.jpg"), alt: "Два флакона лака и апельсиновая палочка на тарелке" },
          ].map((card, i) => (
            <Rise key={card.cat + i} delay={i * 80} className="overflow-hidden rounded-3xl border border-line bg-surface">
              <a href="#prices" onClick={() => setCat(card.cat)} className="grid sm:grid-cols-5">
                <img src={card.img} alt={card.alt} className="aspect-[4/3] h-full w-full object-cover sm:col-span-2" />
                <div className="p-5 sm:col-span-3">
                  <h3 className="font-display text-3xl">{categoryMeta[card.cat].label}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{categoryMeta[card.cat].lead}</p>
                  <p className="mt-4 text-sm font-semibold text-copper-deep">К ценам</p>
                </div>
              </a>
            </Rise>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-2 md:px-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            [String(shownBranches.length), "салонов в Перми"],
            [formatMarks(marksTotal), "оценок в 2ГИС"],
            ["09–21", "без выходных"],
            ["300 ₽", "стрижка от"],
          ].map(([n, label]) => (
            <div key={label} className="rounded-2xl border border-line bg-surface px-3 py-3 text-center">
              <p className="font-brand text-xl leading-none font-bold text-copper">{n}</p>
              <p className="mt-1 text-xs leading-4 text-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="prices" className="scroll-mt-24 bg-sand/60">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="font-display text-4xl md:text-5xl">Цены</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
                По прайсу салона на Юрша, 9. Точную стоимость подтвердит администратор. Не оферта.
              </p>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти услугу"
              className={`${fieldClass} md:max-w-xs`}
              aria-label="Поиск по прайсу"
            />
          </div>
          <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
            {cats.map((id) => (
              <button
                key={id}
                onClick={() => setCat(id)}
                className={cn(
                  "min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold",
                  cat === id ? "bg-ink text-surface" : "bg-surface text-ink",
                )}
              >
                {categoryMeta[id].label}
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">{categoryMeta[cat].lead}</p>
          <ul className="mt-4 divide-y divide-line rounded-3xl border border-line bg-surface">
            {list.map((item) => (
              <li key={item.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span>{item.name}</span>
                <span className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className="font-semibold">{displayPrice(priceOverrides, item.id, item.price)}</span>
                  <button
                    className="text-sm font-semibold text-copper-deep"
                    onClick={() => openBooking({ service: item.name })}
                  >
                    Записаться
                  </button>
                </span>
              </li>
            ))}
            {list.length === 0 && <li className="px-4 py-8 text-sm text-muted">Ничего не нашлось. Сбросьте поиск или смените вкладку.</li>}
          </ul>
          <p className="mt-4 text-sm text-muted">
            Также в сети, цену называет салон: {alsoInNetwork.join(", ")}.
          </p>
        </div>
      </section>

      {activePromos.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <h2 className="font-display text-4xl">Что обещаем вслух</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {activePromos.map((p) => (
              <article key={p.id} className="rounded-3xl border border-line bg-surface p-5">
                <h3 className="font-display text-2xl">{p.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{p.text}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-4 md:px-6">
        <h2 className="font-display text-4xl md:text-5xl">Мастера, которых зовут по имени</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          Имена взяты из открытых отзывов. Стаж и портреты не выдуманы — фото работ подключим отдельно.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {shownMasters.map((m) => (
            <article key={m.id} className="rounded-3xl bg-surface p-5 ring-1 ring-line">
              <div className="flex size-14 items-center justify-center rounded-full bg-sand font-display text-2xl">
                {m.name.slice(0, 1)}
              </div>
              <h3 className="mt-4 font-display text-3xl">{m.name}</h3>
              <p className="text-sm font-semibold text-copper-deep">{m.role}</p>
              <p className="mt-2 text-sm text-muted">
                {m.branches.map((id) => shownBranches.find((b) => b.id === id)?.title).join(" · ")}
              </p>
              <p className="mt-3 text-sm leading-6">{m.note}</p>
              <button className="mt-4 text-sm font-semibold" onClick={() => openBooking({ branchId: m.branches[0] })}>
                Заявка к этому салону
              </button>
            </article>
          ))}
        </div>
      </section>

      <section id="reviews" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h2 className="font-display text-4xl md:text-5xl">Отзывы гостей</h2>
          <div className="flex gap-2 overflow-x-auto">
            <FilterChip active={branchFilter === "all"} onClick={() => setBranchFilter("all")}>
              Все
            </FilterChip>
            {shownBranches.map((b) => (
              <FilterChip key={b.id} active={branchFilter === b.id} onClick={() => setBranchFilter(b.id)}>
                {b.title}
              </FilterChip>
            ))}
          </div>
        </div>
        <div className="relative mt-5">
          <button
            type="button"
            aria-label="Предыдущие отзывы"
            className="absolute top-1/2 left-0 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface shadow-sm"
            onClick={() => reviewsRef.current?.scrollBy({ left: -reviewsRef.current.clientWidth * 0.8, behavior: "smooth" })}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Следующие отзывы"
            className="absolute top-1/2 right-0 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface shadow-sm"
            onClick={() => reviewsRef.current?.scrollBy({ left: reviewsRef.current.clientWidth * 0.8, behavior: "smooth" })}
          >
            <ChevronRight className="size-5" />
          </button>
          <div
            ref={reviewsRef}
            className="flex h-40 snap-x snap-mandatory gap-3 overflow-x-auto px-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {visibleReviews.map((r) => (
              <figure key={r.id} className="flex h-40 w-72 shrink-0 snap-start flex-col rounded-2xl border border-line bg-surface px-4 py-3 sm:w-80">
                <Stars />
                <blockquote className="mt-2 line-clamp-3 text-sm leading-5">{r.text}</blockquote>
                <figcaption className="mt-auto truncate text-xs text-muted">
                  {r.author}
                  {r.master ? ` · ${r.master}` : ""} · {r.source}
                </figcaption>
              </figure>
            ))}
            {publishedGuest.map((r) => (
              <figure key={r.id} className="flex h-40 w-72 shrink-0 snap-start flex-col rounded-2xl border border-line bg-surface px-4 py-3 sm:w-80">
                <Stars value={r.stars} />
                <blockquote className="mt-2 line-clamp-3 text-sm leading-5">{r.text}</blockquote>
                <figcaption className="mt-auto truncate text-xs text-muted">{r.author} · с сайта</figcaption>
              </figure>
            ))}
            {visibleReviews.length + publishedGuest.length === 0 && (
              <p className="self-center text-sm text-muted">По этому салону отзывов пока нет. Посмотрите «Все» или карточку в 2ГИС.</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-3xl bg-copper px-5 py-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-2xl text-ink">Понравилось — записывайтесь</p>
            <p className="mt-1 text-sm text-ink/80">Салон, услуга и мастер. Ответим и подтвердим время.</p>
          </div>
          <Button className="bg-ink text-surface hover:bg-ink/90" onClick={() => openBooking()}>
            Записаться
          </Button>
        </div>

        <form
          className="mt-8 grid gap-3 rounded-3xl bg-sand p-5 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            sendReview();
          }}
        >
          <div className="md:col-span-2">
            <h3 className="font-display text-3xl">Оставить отзыв</h3>
            <p className="mt-1 text-sm text-muted">Опубликуем после проверки.</p>
          </div>
          <Field label="Имя">
            <input className={fieldClass} value={author} onChange={(e) => setAuthor(e.target.value)} />
          </Field>
          <Field label="Салон">
            <select className={fieldClass} value={reviewBranch} onChange={(e) => setReviewBranch(e.target.value)}>
              {shownBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.address}
                </option>
              ))}
            </select>
          </Field>
          <div className="md:col-span-2">
            <span className="mb-1.5 block text-sm text-muted">Оценка</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" className="inline-flex size-11 items-center justify-center" onClick={() => setStars(n)} aria-label={`${n} из 5`}>
                  <Star className={cn("size-5", n <= stars ? "fill-copper text-copper" : "text-line")} />
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <Field label="Как прошло">
              <textarea className={`${fieldClass} min-h-24 py-3`} value={text} onChange={(e) => setText(e.target.value)} />
            </Field>
          </div>
          <Button type="submit">Отправить на модерацию</Button>
        </form>
      </section>

      <section id="salons" className="scroll-mt-24 bg-ink text-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <h2 className="font-display text-4xl text-surface md:text-5xl">Шесть адресов, один телефон</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-sand">
            {contacts.phone}. Дополнительный номер с карточки: {contacts.phoneAlt}. {contacts.hours}.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {shownBranches.map((b) => {
              const open = isBranchOpen(branchOpen, b.id);
              return (
                <article key={b.id} className="rounded-3xl bg-ink p-5 ring-1 ring-sand/30">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-3xl text-surface">{b.address}</h3>
                    <p className="text-sm text-sand">
                      {b.rating.toString().replace(".", ",")} · {formatMarks(b.marks)}
                    </p>
                  </div>
                  <p className="mt-1 flex items-center gap-2 text-sm text-sand">
                    <MapPin className="size-4" />
                    {b.district}. {b.note}
                  </p>
                  <p className="mt-3 text-sm text-sand">{open ? "Запись на сайте открыта" : "Запись на сайте закрыта — позвоните"}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      className="min-h-11 rounded-full bg-copper px-4 text-sm font-semibold text-ink disabled:opacity-50"
                      disabled={!open}
                      onClick={() => openBooking({ branchId: b.id })}
                    >
                      Заявка сюда
                    </button>
                    <a className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm font-semibold text-ink" href={b.map} target="_blank" rel="noreferrer">
                      Маршрут
                    </a>
                    <a className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-sand" href={`tel:${contacts.phoneTel}`}>
                      <Phone className="size-4" />
                      Позвонить
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
          <a className="mt-6 inline-flex text-sm text-sand underline underline-offset-4" href={`tel:${contacts.phoneAltTel}`}>
            Второй телефон: {contacts.phoneAlt}
          </a>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="font-display text-4xl">Коротко о главном</h2>
        <Accordion.Root type="single" collapsible className="mt-6 divide-y divide-line border-y border-line">
          {shownFaqs.map((item) => (
            <Accordion.Item key={item.id} value={item.id}>
              <Accordion.Header>
                <Accordion.Trigger className="group flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left text-base font-semibold">
                  {item.q}
                  <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="pb-4 text-sm leading-6 text-muted">{item.a}</Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </section>
    </div>
  );
}

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "min-h-11 shrink-0 rounded-full px-3 text-sm",
        active ? "bg-ink text-surface" : "bg-sand text-ink",
      )}
    >
      {children}
    </button>
  );
}
