import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { HOURS, PHONE_DISPLAY, PHONE_TEL, links } from "@/data/salon";
import { useSalon } from "@/lib/salon-store";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";
import { BookingDialog } from "@/components/booking-dialog";

export function Shell({ children }: { children: ReactNode }) {
  const openBooking = useSalon((s) => s.openBooking);
  const hydrate = useSalon((s) => s.hydrate);
  const [open, setOpen] = useState(false);
  const [bar, setBar] = useState(true);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="min-h-screen">
      <header className="site-header sticky top-0 z-40 flex flex-col overflow-hidden border-b border-line/80 bg-paper">
        {bar && (
          <div className="shrink-0 bg-ink text-surface">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-2 text-xs md:px-6 md:text-sm">
              <p className="min-w-0">Пермь · 6 салонов · {HOURS}</p>
              <button
                className="min-h-11 shrink-0 px-2 text-sand"
                onClick={() => setBar(false)}
                aria-label="Скрыть полосу"
              >
                Скрыть
              </button>
            </div>
          </div>
        )}
        <div className="shrink-0">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
          <Link to="/" className="min-w-0 leading-none">
            <span className="font-display text-2xl font-semibold tracking-tight">МЕГАстрижка</span>
            <span className="mt-1 block text-xs text-muted">салоны в Перми</span>
          </Link>
          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            <a href={`${import.meta.env.BASE_URL}#services`} className="rounded-full px-3 py-2 text-sm text-ink hover:bg-sand">
              Услуги
            </a>
            <a href={`${import.meta.env.BASE_URL}#prices`} className="rounded-full px-3 py-2 text-sm text-ink hover:bg-sand">
              Цены
            </a>
            <a href={`${import.meta.env.BASE_URL}#reviews`} className="rounded-full px-3 py-2 text-sm text-ink hover:bg-sand">
              Отзывы
            </a>
            <a href={`${import.meta.env.BASE_URL}#salons`} className="rounded-full px-3 py-2 text-sm text-ink hover:bg-sand">
              Салоны
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <a
              href={`tel:${PHONE_TEL}`}
              className="hidden items-center gap-2 text-sm font-semibold sm:inline-flex"
            >
              <Phone className="size-4 text-copper" />
              {PHONE_DISPLAY}
            </a>
            <Button className="hidden sm:inline-flex" onClick={() => openBooking()}>
              Записаться
            </Button>
            <Link
              to="/admin"
              className="hidden rounded-full border border-line px-3 py-2 text-sm hover:border-copper md:inline-flex"
            >
              Админ
            </Link>
            <button
              className="inline-flex size-11 items-center justify-center rounded-full border border-line lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
          </div>
        </div>
        <div className={cn("min-h-0 overflow-y-auto border-line bg-paper lg:hidden", open ? "flex-1 border-t" : "hidden")}>
          <div className="flex flex-col gap-1 px-4 py-3">
            <a href={`${import.meta.env.BASE_URL}#services`} className="min-h-11 rounded-2xl px-3 py-3" onClick={() => setOpen(false)}>
              Услуги
            </a>
            <a href={`${import.meta.env.BASE_URL}#prices`} className="min-h-11 rounded-2xl px-3 py-3" onClick={() => setOpen(false)}>
              Цены
            </a>
            <a href={`${import.meta.env.BASE_URL}#reviews`} className="min-h-11 rounded-2xl px-3 py-3" onClick={() => setOpen(false)}>
              Отзывы
            </a>
            <a href={`${import.meta.env.BASE_URL}#salons`} className="min-h-11 rounded-2xl px-3 py-3" onClick={() => setOpen(false)}>
              Салоны
            </a>
            <Link to="/admin" className="min-h-11 rounded-2xl px-3 py-3" onClick={() => setOpen(false)}>
              Админ
            </Link>
            <a href={`tel:${PHONE_TEL}`} className="min-h-11 rounded-2xl px-3 py-3 font-semibold">
              {PHONE_DISPLAY}
            </a>
            <Button
              className="w-full"
              onClick={() => {
                setOpen(false);
                openBooking();
              }}
            >
              Записаться
            </Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-8 border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3 md:px-6">
          <div>
            <p className="font-display text-3xl">МЕГАстрижка</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-muted">
              Сеть парикмахерских в Перми. Шесть адресов, ежедневно с 9:00 до 21:00.
            </p>
          </div>
          <div className="text-sm leading-7">
            <a className="block hover:text-copper" href={links.gis} target="_blank" rel="noreferrer">
              Филиалы в 2ГИС
            </a>
            <a className="block hover:text-copper" href={links.yandex} target="_blank" rel="noreferrer">
              Сеть на Яндекс Картах
            </a>
            <a className="block hover:text-copper" href={links.zoon} target="_blank" rel="noreferrer">
              Отзывы на Zoon
            </a>
          </div>
          <p className="text-sm leading-6 text-muted">
            Цены по прайсу салона на Юрша, 9, и не являются офертой. Точную стоимость и время подтвердит
            администратор.
          </p>
        </div>
      </footer>
      <BookingDialog />
    </div>
  );
}
