import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  YCLIENTS,
  branches,
  prices,
  times,
} from "@/data/salon";
import { isBranchOpen, useSalon, visibleMasters, type Booking } from "@/lib/salon-store";
import { postBooking } from "@/lib/salon-api";
import { Button, Field, fieldClass } from "@/components/ui";

const steps = ["Услуга", "Салон", "Время", "Контакты"];

export function BookingDialog() {
  const open = useSalon((s) => s.bookingOpen);
  const close = useSalon((s) => s.closeBooking);
  const presetService = useSalon((s) => s.presetService);
  const presetBranch = useSalon((s) => s.presetBranch);
  const branchOpen = useSalon((s) => s.branchOpen);
  const hiddenPriceIds = useSalon((s) => s.hiddenPriceIds);
  const addBooking = useSalon((s) => s.addBooking);
  const extraMasters = useSalon((s) => s.extraMasters);
  const hiddenMasterIds = useSalon((s) => s.hiddenMasterIds);

  const [step, setStep] = useState(0);
  const [service, setService] = useState(presetService);
  const [branchId, setBranchId] = useState(presetBranch);
  const [master, setMaster] = useState("Любой свободный");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("18:00");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [wish, setWish] = useState("");
  const [done, setDone] = useState<Booking | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setDone(null);
    setError("");
    setService(presetService);
    setBranchId(presetBranch);
  }, [open, presetService, presetBranch]);

  const visiblePrices = useMemo(
    () => prices.filter((p) => !hiddenPriceIds.includes(p.id)),
    [hiddenPriceIds],
  );
  const openBranches = branches.filter((b) => isBranchOpen(branchOpen, b.id));
  const masterOptions = [
    "Любой свободный",
    ...visibleMasters(extraMasters, hiddenMasterIds)
      .filter((m) => m.branches.includes(branchId))
      .map((m) => m.name),
  ];

  function next() {
    setError("");
    if (step === 0 && !service) return setError("Выберите услугу.");
    if (step === 1 && !branchId) return setError("Выберите салон.");
    if (step === 2 && (!date || !time)) return setError("Нужны дата и время.");
    setStep((s) => Math.min(s + 1, 3));
  }

  async function submit() {
    const digits = phone.replace(/\D/g, "");
    if (name.trim().length < 2) return setError("Как к вам обращаться?");
    if (digits.length < 10) return setError("Телефон нужен полностью.");
    try {
      const booking = await postBooking({
        name: name.trim(),
        phone: phone.trim(),
        branchId,
        service,
        master,
        date,
        time,
        wish: wish.trim(),
      });
      addBooking(booking);
      setDone(booking);
      toast("Заявку получили. Администратор подтвердит время.");
    } catch {
      toast("Это заглушка. Заявка остаётся только в этом браузере и не уходит в салон, на почту или в YClients.", {
        duration: 8000,
      });
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[92vh] w-[min(100%-1.5rem,36rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-surface p-5 shadow-none outline-none md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-3xl leading-none">Заявка в салон</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-muted">
                Администратор подтвердит время.
              </Dialog.Description>
            </div>
            <Dialog.Close className="inline-flex size-11 items-center justify-center rounded-full hover:bg-sand" aria-label="Закрыть">
              <X className="size-5" />
            </Dialog.Close>
          </div>

          {done ? (
            <div className="mt-6 rounded-3xl bg-sand p-5">
              <p className="font-display text-2xl">Готово, {done.name.split(" ")[0]}</p>
              <p className="mt-2 text-sm leading-6">
                {done.service}. {branches.find((b) => b.id === done.branchId)?.address}. {done.date} в {done.time}.
                Мастер: {done.master}.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={close}>Хорошо</Button>
                <a href={YCLIENTS} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-5 text-sm font-semibold">
                  Открыть YClients
                </a>
              </div>
            </div>
          ) : (
            <>
              <ol className="mt-5 flex gap-2">
                {steps.map((label, i) => (
                  <li
                    key={label}
                    className={`flex-1 rounded-full px-2 py-2 text-center text-xs ${i === step ? "bg-ink text-surface" : i < step ? "bg-sand text-ink" : "bg-paper text-muted"}`}
                  >
                    {label}
                  </li>
                ))}
              </ol>

              <div className="mt-5 space-y-4">
                {step === 0 && (
                  <Field label="Услуга">
                    <select className={fieldClass} value={service} onChange={(e) => setService(e.target.value)}>
                      {visiblePrices.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
                {step === 1 && (
                  <div className="grid gap-2">
                    {openBranches.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setBranchId(b.id);
                          setMaster("Любой свободный");
                        }}
                        className={`rounded-2xl border px-4 py-3 text-left ${branchId === b.id ? "border-copper bg-sand" : "border-line bg-paper"}`}
                      >
                        <span className="block font-semibold">{b.address}</span>
                        <span className="text-sm text-muted">{b.district}</span>
                      </button>
                    ))}
                    {openBranches.length === 0 && <p className="text-sm">Сейчас все салоны закрыты для записи. Позвоните.</p>}
                  </div>
                )}
                {step === 2 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Дата">
                      <input className={fieldClass} type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
                    </Field>
                    <Field label="Время">
                      <select className={fieldClass} value={time} onChange={(e) => setTime(e.target.value)}>
                        {times.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Мастер">
                        <select className={fieldClass} value={master} onChange={(e) => setMaster(e.target.value)}>
                          {masterOptions.map((m) => (
                            <option key={m}>{m}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="grid gap-3">
                    <Field label="Имя">
                      <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Анна" />
                    </Field>
                    <Field label="Телефон">
                      <input className={fieldClass} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 900 000-00-00" />
                    </Field>
                    <Field label="Как должно выглядеть">
                      <textarea
                        className={`${fieldClass} min-h-24 py-3`}
                        value={wish}
                        onChange={(e) => setWish(e.target.value)}
                        placeholder="Длина, референс, что точно не хотите"
                      />
                    </Field>
                  </div>
                )}
                {error && <p className="text-sm text-copper-deep">{error}</p>}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {step > 0 && (
                  <Button variant="line" onClick={() => setStep((s) => s - 1)}>
                    Назад
                  </Button>
                )}
                {step < 3 ? (
                  <Button onClick={next}>Дальше</Button>
                ) : (
                  <Button onClick={submit}>Отправить заявку</Button>
                )}
                <a href={YCLIENTS} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center px-3 text-sm text-muted hover:text-ink">
                  Уже есть окно в YClients
                </a>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
