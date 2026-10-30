"use client";

import { commercialRequest } from "@/lib/commercial/request";
import { copyCommercialText } from "@/lib/commercial/clipboard";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bus,
  CalendarDays,
  Check,
  Copy,
  ExternalLink,
  FileText,
  Hotel,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  Users,
  X,
} from "lucide-react";
import BrandLogo from "@/components/commercial/brand-logo";
import {
  filterNiltze,
  type NiltzeBlock,
  type NiltzeIndex,
  type NiltzeItem,
} from "@/lib/niltze/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = [
  "Programas",
  "Tours",
  "Traslados",
  "Entradas",
  "Hoteles",
  "Flota",
  "Condiciones",
  "Histórico",
];

const icon = (category: string, size = 21) =>
  category === "Traslados" || category === "Flota" ? (
    <Bus size={size} />
  ) : category === "Tours" ? (
    <MapPin size={size} />
  ) : category === "Entradas" ? (
    <Ticket size={size} />
  ) : category === "Hoteles" ? (
    <Hotel size={size} />
  ) : category === "Condiciones" ? (
    <ShieldCheck size={size} />
  ) : (
    <Package size={size} />
  );

/** Color del bloque art según categoría */
const categoryArtClass = (category: string) => {
  const c = category
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (c === "tours" || c === "entradas")
    return "bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 dark:from-emerald-900/30 dark:to-emerald-900/10 dark:text-emerald-300";
  if (c === "traslados" || c === "flota")
    return "bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700 dark:from-amber-900/30 dark:to-amber-900/10 dark:text-amber-300";
  if (c === "condiciones" || c === "historico")
    return "bg-muted text-muted-foreground";
  return "bg-gradient-to-br from-sky-100 to-sky-50 text-sky-700 dark:from-sky-900/30 dark:to-sky-900/10 dark:text-sky-300";
};

function SourceBlocks({ blocks }: { blocks: NiltzeBlock[] }) {
  return (
    <div className="space-y-4 text-sm">
      {blocks.map((b, i) =>
        b.type === "text" ? (
          <p key={i} className="whitespace-pre-wrap leading-relaxed">
            {b.text}
          </p>
        ) : (
          <div
            key={i}
            tabIndex={0}
            aria-label="Tabla del documento del operador. Desplaza para ver todas las columnas."
            className="overflow-auto rounded-lg border border-border bg-card"
          >
            <table className="min-w-full border-collapse text-xs">
              <caption className="border-b border-border bg-muted/40 px-3 py-2 text-left font-medium text-muted-foreground">
                Tabla{" "}
                {blocks.filter((x, j) => j <= i && x.type === "table").length}{" "}
                · Texto y valores del operador
              </caption>
              <tbody>
                {b.rows.map((r, j) => (
                  <tr key={j} className="even:bg-muted/20">
                    {r.map((c, k) => (
                      <td
                        key={k}
                        colSpan={c.colSpan}
                        rowSpan={c.rowSpan}
                        className={`border border-border p-2 align-top ${
                          j === 0
                            ? "bg-primary/10 font-semibold text-foreground"
                            : ""
                        }`}
                      >
                        {c.text}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      )}
    </div>
  );
}

function itemCopy(i: NiltzeItem) {
  return [
    i.title,
    i.days ? `${i.days} días${i.nights ? ` / ${i.nights} noches` : ""}` : "",
    i.modality,
    i.itinerary.length ? "ITINERARIO\n" + i.itinerary.join("\n\n") : "",
    i.includes.length ? "INCLUYE\n" + i.includes.join("\n") : "",
    i.warnings.join("\n"),
    "Fuente: " + i.source,
    "Tarifas y disponibilidad sujetas a validación con Niltze.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function Detail({
  item,
  onClose,
}: {
  item: NiltzeItem;
  onClose: () => void;
}) {
  const [tab, setTab] = useState("resumen");
  const [notice, setNotice] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const hasRates = item.blocks.some((b) => b.type === "table");

  useEffect(() => {
    const d = dialog.current;
    d?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      d?.close();
    };
  }, []);

  async function copy() {
    try {
      await copyCommercialText(itemCopy(item));
      setNotice("Resumen copiado.");
    } catch {
      setNotice("No fue posible copiar. Selecciona el texto de la ficha.");
    }
  }

  const tabs: Array<[string, string]> = [
    ["resumen", "Resumen"],
    ...(item.itinerary.length
      ? ([["itinerario", "Día a día"]] as Array<[string, string]>)
      : []),
    ...(hasRates
      ? ([["tarifas", "Tarifas y condiciones"]] as Array<[string, string]>)
      : []),
    ["fuente", "Documento leído"],
  ];

  return (
    <dialog
      ref={dialog}
      aria-labelledby="nm-detail-title"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[min(1140px,94vw)] max-h-[92dvh] rounded-2xl border-0 bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm open:flex open:flex-col"
    >
      <div className="flex items-start justify-between gap-5 border-b border-border bg-muted/30 p-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {item.category} / {item.theme}
          </span>
          <h2
            id="nm-detail-title"
            className="mt-2 text-2xl font-semibold leading-tight"
          >
            {item.title}
          </h2>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {item.days && (
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} />
                {item.days} días
                {item.nights ? ` / ${item.nights} noches` : ""}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users size={14} />
              {item.modality}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Cerrar ficha"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-border px-5 py-2">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
              tab === id
                ? "bg-primary/10 font-semibold text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="min-h-[150px] flex-1 overflow-auto p-6">
        {item.warnings.map((w) => (
          <p
            key={w}
            className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
          >
            {w}
          </p>
        ))}

        {tab === "resumen" && (
          <>
            <div className="grid grid-cols-2 gap-4 border-b border-border pb-5">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">
                  Tipo de servicio
                </span>
                <strong className="text-sm">{item.category}</strong>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">Modalidad</span>
                <strong className="text-sm">{item.modality}</strong>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">
                  Edición del material
                </span>
                <strong className="text-sm">2026 · confirmar fechas</strong>
              </div>
              {item.adultPrice !== null && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    {item.priceBasis}
                  </span>
                  <strong className="text-sm">
                    USD {item.adultPrice.toLocaleString("es-CO")}
                  </strong>
                </div>
              )}
              {item.priceBasis && item.adultPrice === null && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    Base de tarifa
                  </span>
                  <strong className="text-sm">{item.priceBasis}</strong>
                </div>
              )}
            </div>

            {item.includes.length > 0 ? (
              <section>
                <h3 className="mt-6 mb-3 text-lg font-semibold">
                  Qué incluye
                </h3>
                <ul className="space-y-3">
                  {item.includes.map((s, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-3 text-sm leading-relaxed"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <>
                <h3 className="mt-6 mb-3 text-lg font-semibold">
                  Información del servicio
                </h3>
                <SourceBlocks blocks={item.blocks} />
              </>
            )}

            {item.itinerary.length > 0 && (
              <Button
                variant="outline"
                className="mt-3 mr-2"
                onClick={() => setTab("itinerario")}
              >
                Explorar el itinerario de {item.days || item.itinerary.length}{" "}
                días <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
            {hasRates && (
              <Button
                className="mt-3 mr-2"
                onClick={() => setTab("tarifas")}
              >
                Consultar tarifas y restricciones{" "}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              Las inclusiones corresponden al documento. Revisa suplementos,
              exclusiones y condiciones antes de cotizar.
            </p>
          </>
        )}

        {tab === "itinerario" && (
          <ol className="space-y-5">
            {item.itinerary.map((s, j) => (
              <li key={j} className="flex items-start gap-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {j + 1}
                </span>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                  {s}
                </p>
              </li>
            ))}
          </ol>
        )}

        {tab === "tarifas" && (
          <>
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              Tarifas del operador, edición 2026. Consulta la moneda, ocupación,
              hotel, suplementos y fechas de cada tabla. No constituyen una
              cotización final ni confirman disponibilidad.
            </p>
            <SourceBlocks
              blocks={item.blocks.filter((b) => b.type === "table")}
            />
          </>
        )}

        {tab === "fuente" && (
          <>
            <p className="mb-4 text-xs text-muted-foreground">
              Transcripción del contenido del documento. Las tablas conservan
              sus celdas combinadas; las fotografías y elementos decorativos no
              se reproducen.
            </p>
            <SourceBlocks blocks={item.blocks} />
          </>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-muted/30 px-6 py-4">
        <div className="flex max-w-[75%] items-start gap-2 text-xs text-muted-foreground">
          <FileText className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="break-words">
            {item.source}
            {item.sourceSection && (
              <small className="mt-1 block text-xs">
                {item.sourceSection}
              </small>
            )}
          </span>
        </div>
        <Button variant="outline" onClick={() => void copy()}>
          <Copy className="mr-2 h-4 w-4" />
          Copiar resumen
        </Button>
        {notice && (
          <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">
            {notice}
          </p>
        )}
      </footer>
    </dialog>
  );
}

export default function NiltzeCatalog() {
  const returnPath = "/comercial";
  const areaLabel = "Comercial";

  const [data, setData] = useState<NiltzeIndex | null>(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [theme, setTheme] = useState("");
  const [nights, setNights] = useState("");
  const [modality, setModality] = useState("");
  const [history, setHistory] = useState(false);
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<NiltzeItem | null>(null);
  const [opening, setOpening] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const [comparison, setComparison] = useState<NiltzeItem[]>([]);
  const [compareBusy, setCompareBusy] = useState(false);

  const request = useRef<AbortController | null>(null);
  const compareDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const c = new AbortController();
    setError("");
    commercialRequest("/api/commercial/niltze", {
      cache: "no-store",
      signal: c.signal,
    })
      .then(async (r) => {
        const d = (await r.json()) as NiltzeIndex & { error?: string };
        if (!r.ok) throw Error(d.error || "No se pudo cargar el catálogo.");
        setData(d);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => c.abort();
  }, [reload]);

  useEffect(() => () => request.current?.abort(), []);

  useEffect(() => {
    setPage(1);
  }, [query, category, theme, nights, modality, history, sort]);

  useEffect(() => {
    if (comparison.length) compareDialog.current?.showModal();
  }, [comparison]);

  const items = data?.items || [];
  const filtered = useMemo(
    () =>
      filterNiltze(items, {
        query,
        category,
        theme,
        nights,
        modality,
        history,
      }).sort((a, b) =>
        sort === "nights"
          ? (a.nights ?? 999) - (b.nights ?? 999) ||
            a.title.localeCompare(b.title, "es")
          : a.title.localeCompare(b.title, "es"),
      ),
    [items, query, category, theme, nights, modality, history, sort],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / 18));
  const shownPage = Math.min(page, pageCount);
  const visible = filtered.slice((shownPage - 1) * 18, shownPage * 18);

  function clear() {
    setQuery("");
    setCategory("");
    setTheme("");
    setNights("");
    setModality("");
    setHistory(false);
    setSort("name");
  }

  async function open(id: string) {
    request.current?.abort();
    const c = new AbortController();
    request.current = c;
    setOpening(id);
    setError("");
    try {
      const r = await commercialRequest(
          "/api/commercial/niltze?id=" + encodeURIComponent(id),
          { cache: "no-store", signal: c.signal },
        ),
        d = (await r.json()) as { item: NiltzeItem; error?: string };
      if (!r.ok) throw Error(d.error || "No se pudo abrir la ficha.");
      setDetail(d.item);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message);
    } finally {
      if (!c.signal.aborted) setOpening("");
    }
  }

  async function compare() {
    setCompareBusy(true);
    setError("");
    try {
      const result = await Promise.all(
        chosen.map(async (id) => {
          const r = await commercialRequest("/api/commercial/niltze?id=" + id, {
              cache: "no-store",
            }),
            d = (await r.json()) as { item: NiltzeItem; error?: string };
          if (!r.ok)
            throw Error(d.error || "No se pudo preparar la comparación.");
          return d.item as NiltzeItem;
        }),
      );
      setComparison(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCompareBusy(false);
    }
  }

  const themeOptions = useMemo(() => {
    return [
      ...new Set(
        items
          .filter(
            (i) =>
              (!category || i.category === category) &&
              (history || !i.historical),
          )
          .map((i) => i.theme),
      ),
    ].sort((a, b) => a.localeCompare(b, "es"));
  }, [items, category, history]);

  const nightsOptions = useMemo(() => {
    return [
      ...new Set(
        items
          .map((i) => i.nights)
          .filter((n): n is number => n !== null),
      ),
    ].sort((a, b) => a - b);
  }, [items]);

  const modalityOptions = useMemo(() => {
    return [...new Set(items.map((i) => i.modality))].sort();
  }, [items]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Topbar */}
      {/* <header className="sticky top-0 z-10 flex h-20 items-center justify-between gap-6 border-b border-border bg-background/95 px-6 backdrop-blur">
        <a href={returnPath} aria-label={`Volver a ${areaLabel}`}>
          <BrandLogo />
        </a>
        <a
          href={returnPath}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft size={16} />
          Volver a {areaLabel}
        </a>
      </header> */}

      <main className="mx-auto max-w-[1440px] px-7 pb-0 pt-7">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-sky-600 p-11 text-primary-foreground">
          <div className="grid gap-9 md:grid-cols-[1.7fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-2 text-[11px] font-bold uppercase tracking-widest">
                <MapPin size={15} /> México · Niltze México Travel
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
                Todo México,
                <br />
                <em className="not-italic text-amber-200">
                  más fácil de encontrar.
                </em>
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-primary-foreground/90">
                Planes, experiencias y traslados del operador en un solo lugar.
                Encuentra la opción, revisa los detalles y prepara tu propuesta.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-5">
                <a
                  href="#nm-search"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-bold text-primary shadow-sm hover:bg-white/95"
                >
                  <Search size={17} />
                  Explorar catálogo
                </a>
                {data && (
                  <a
                    href={data.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary-foreground/90 hover:text-primary-foreground"
                  >
                    Carpeta del operador <ExternalLink size={15} />
                  </a>
                )}
              </div>
            </div>
            <div className="hidden self-center border-l border-white/30 pl-10 md:flex md:flex-col md:gap-2.5">
              <span className="grid h-[70px] w-[70px] place-items-center rounded-2xl border border-white/30 bg-white/10 text-amber-200">
                <MapPin size={44} />
              </span>
              <p className="mt-2 text-[11px] leading-relaxed tracking-widest">
                DE LA CARPETA
                <br />A LA CONVERSACIÓN
              </p>
              <strong className="text-lg">Encuentra. Revisa. Asesora.</strong>
              <span className="text-xs text-primary-foreground/80">
                Material del operador · Edición 2026
              </span>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-y-5 rounded-2xl border border-border bg-card p-5 md:grid-cols-4 md:gap-0 md:py-5">
          {[
            {
              icon: <BookOpen className="h-5 w-5 text-primary" />,
              value: data ? data.sourceCount : "—",
              label: "documentos leídos",
            },
            {
              icon: <Package className="h-5 w-5 text-primary" />,
              value: data
                ? items.filter((i) => i.category === "Programas").length
                : "—",
              label: "programas para explorar",
            },
            {
              icon: <Ticket className="h-5 w-5 text-primary" />,
              value: data
                ? items.filter(
                    (i) => i.category === "Tours" || i.category === "Entradas",
                  ).length
                : "—",
              label: "tours y entradas",
            },
            {
              icon: <Bus className="h-5 w-5 text-primary" />,
              value: "Compartido / privado",
              label: "Traslados y fichas de vehículos",
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 md:border-r md:border-border md:last:border-0`}
            >
              {s.icon}
              <div>
                <strong className="block text-xl font-bold leading-tight">
                  {s.value}
                </strong>
                <span className="text-xs text-muted-foreground">
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Edition note */}
        <p className="mt-5 mb-7 flex items-start gap-3 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
          <CalendarDays size={18} className="mt-0.5 shrink-0" />
          <span>
            <strong>Tarifario 2026 · consulta de referencia.</strong> Importado
            el{" "}
            {data
              ? data.importedAt.split("-").reverse().join("/")
              : "23/10/2026"}
            . Verifica fechas excluidas, suplementos y disponibilidad con Niltze
            antes de cotizar. Esta copia no se actualiza automáticamente desde
            Dropbox.
          </span>
        </p>

        {/* Workspace */}
        <section
          id="nm-search"
          className="grid gap-7 md:grid-cols-[220px_minmax(0,1fr)]"
        >
          {/* Sidebar */}
          <aside>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              ¿Qué necesitas?
            </p>

            <nav
              aria-label="Tipos de servicio"
              className="mt-4 flex flex-col gap-1 md:mt-4"
            >
              <button
                className={`flex items-center gap-2.5 rounded-lg px-3 py-3 text-left text-sm font-semibold transition-colors ${
                  !category
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => {
                  setCategory("");
                  setTheme("");
                }}
              >
                <Sparkles size={20} />
                <span>Todo el catálogo</span>
                <small className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                  {items.filter((i) => history || !i.historical).length}
                </small>
              </button>
              {categories
                .filter((c) => history || c !== "Histórico")
                .map((c) => (
                  <button
                    key={c}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-3 text-left text-sm font-semibold transition-colors ${
                      category === c
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => {
                      setCategory(c);
                      setTheme("");
                    }}
                  >
                    {icon(c)}
                    <span>{c}</span>
                    <small className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                      {items.filter((i) => i.category === c).length}
                    </small>
                  </button>
                ))}
            </nav>

            <div className="mt-6 rounded-xl bg-muted/60 p-5">
              <ShieldCheck className="mb-3 h-6 w-6 text-primary" />
              <strong className="block text-sm">
                Para asesorar con claridad
              </strong>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Consulta el día a día y las condiciones de cada servicio. Las
                tarifas netas del operador se muestran en su ficha.
              </p>
            </div>

            <label className="mb-4 flex items-start gap-2 text-xs leading-snug">
              <input
                type="checkbox"
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-primary"
                checked={history}
                onChange={(e) => {
                  setHistory(e.target.checked);
                  if (!e.target.checked && category === "Histórico")
                    setCategory("");
                }}
              />
              Incluir histórico Mundial 2026
            </label>

            {data?.emptyFolders.length ? (
              <p className="text-xs text-muted-foreground">
                Carpeta sin documentos: {data.emptyFolders.join(", ")}.
              </p>
            ) : null}
          </aside>

          {/* Results */}
          <div>
            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="niltze-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca un plan, destino, hotel o experiencia…"
                className="h-12 pl-10 pr-10"
              />
              {query && (
                <button
                  aria-label="Borrar búsqueda"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="mt-3 flex flex-wrap items-end gap-2.5">
              <label className="min-w-[125px] flex-1">
                <span className="mb-1.5 block text-[10px] font-semibold text-muted-foreground">
                  Experiencia / región
                </span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full cursor-pointer rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Todas las experiencias</option>
                  {themeOptions.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="min-w-[125px] flex-1">
                <span className="mb-1.5 block text-[10px] font-semibold text-muted-foreground">
                  Noches
                </span>
                <select
                  value={nights}
                  onChange={(e) => setNights(e.target.value)}
                  className="w-full cursor-pointer rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Cualquier duración</option>
                  {nightsOptions.map((n) => (
                    <option key={n} value={n}>
                      {n} noches
                    </option>
                  ))}
                </select>
              </label>
              <label className="min-w-[125px] flex-1">
                <span className="mb-1.5 block text-[10px] font-semibold text-muted-foreground">
                  Modalidad
                </span>
                <select
                  value={modality}
                  onChange={(e) => setModality(e.target.value)}
                  className="w-full cursor-pointer rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Todas las modalidades</option>
                  {modalityOptions.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </label>
              <button
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted"
                onClick={clear}
              >
                <SlidersHorizontal size={15} />
                Limpiar filtros
              </button>
            </div>

            {/* Result heading */}
            <div className="mt-7 mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  {category || "Explora la oferta de México"}
                </h2>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {data
                    ? `${filtered.length} fichas encontradas`
                    : "Cargando catálogo…"}
                  {theme && ` · ${theme}`}
                </p>
              </div>
              <label className="shrink-0">
                <span className="mb-1.5 block text-[10px] font-semibold text-muted-foreground">
                  Ordenar por
                </span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="cursor-pointer rounded-lg border-0 bg-transparent text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="name">Nombre A–Z</option>
                  <option value="nights">Menos noches primero</option>
                </select>
              </label>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
              >
                {error}{" "}
                {!data && (
                  <button
                    className="ml-2 underline"
                    onClick={() => setReload((v) => v + 1)}
                  >
                    Volver a cargar
                  </button>
                )}
              </div>
            )}

            {/* Loading */}
            {!data && !error && (
              <p role="status" className="my-6 text-sm text-muted-foreground">
                Estamos organizando los documentos del operador…
              </p>
            )}

            {/* Empty */}
            {data && visible.length === 0 && (
              <div className="my-5 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <Search size={32} className="text-muted-foreground" />
                <h3 className="text-lg font-semibold">
                  No encontramos opciones con estos filtros
                </h3>
                <p className="text-sm text-muted-foreground">
                  Prueba con otro destino, experiencia o duración.
                </p>
                <Button variant="outline" onClick={clear}>
                  Ver todo el catálogo
                </Button>
              </div>
            )}

            {/* Cards grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((i) => (
                <article
                  key={i.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
                >
                  <div
                    className={`relative flex h-[92px] items-center gap-3 overflow-hidden p-5 ${categoryArtClass(i.category)}`}
                  >
                    <span>{icon(i.category, 32)}</span>
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {i.category}
                    </span>
                    <span className="ml-auto rounded-full bg-background/60 px-2 py-1 text-[10px] text-foreground/80">
                      {i.historical ? "Histórico" : "2026"}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {i.theme}
                    </p>
                    <h3 className="min-h-[44px] text-base font-semibold leading-snug">
                      {i.title}
                    </h3>
                    <div className="flex flex-col gap-1.5 text-[10px] text-muted-foreground">
                      {i.days && (
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {i.days} días
                          {i.nights ? ` · ${i.nights} noches` : ""}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Users size={14} />
                        {i.modality}
                      </span>
                    </div>

                    {i.warnings.length > 0 && (
                      <p className="rounded-md bg-amber-50 px-2 py-1.5 text-[11px] leading-snug text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                        {i.warnings[0]}
                      </p>
                    )}

                    <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {i.highlights[0] ||
                        (i.category === "Traslados"
                          ? "Consulta aeropuertos, zonas, pasajeros, equipaje y tarifas por trayecto."
                          : i.category === "Tours" ||
                              i.category === "Entradas"
                            ? "Revisa operación, inclusiones y condiciones de esta experiencia."
                            : i.category === "Programas"
                              ? "Consulta itinerario, servicios y condiciones en el documento."
                              : "Consulta la información y las especificaciones del operador.")}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
                      <p>
                        {i.adultPrice !== null ? (
                          <>
                            <strong className="block text-xs">
                              USD {i.adultPrice.toLocaleString("es-CO")}
                            </strong>
                            <small className="mt-0.5 block text-[9px] text-muted-foreground">
                              Adulto · neto por persona
                            </small>
                          </>
                        ) : (
                          <>
                            <strong className="block text-xs">
                              {i.category === "Programas"
                                ? "Tarifas por hotel"
                                : "Detalles del operador"}
                            </strong>
                            <small className="mt-0.5 block text-[9px] text-muted-foreground">
                              {i.category === "Programas"
                                ? "Ver ocupaciones y condiciones"
                                : "Consultar ficha completa"}
                            </small>
                          </>
                        )}
                      </p>
                      <button
                        onClick={() => void open(i.id)}
                        disabled={opening === i.id}
                        aria-label={`Ver ficha de ${i.title}`}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-2 text-[10px] font-bold text-primary hover:bg-primary/15 disabled:opacity-50"
                      >
                        {opening === i.id ? "Abriendo…" : "Ver ficha"}
                        <ArrowRight size={16} />
                      </button>
                    </div>

                    {i.category === "Programas" && (
                      <label className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 accent-primary"
                          checked={chosen.includes(i.id)}
                          disabled={
                            !chosen.includes(i.id) && chosen.length >= 3
                          }
                          onChange={(e) =>
                            setChosen((v) =>
                              e.target.checked
                                ? [...v, i.id]
                                : v.filter((id) => id !== i.id),
                            )
                          }
                        />
                        Comparar programa
                      </label>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {filtered.length > 18 && (
              <nav
                aria-label="Páginas del catálogo"
                className="my-8 flex items-center justify-center gap-5 text-xs"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(shownPage - 1)}
                  disabled={shownPage <= 1}
                >
                  Anterior
                </Button>
                <span className="text-muted-foreground">
                  Página {shownPage} de {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(shownPage + 1)}
                  disabled={shownPage >= pageCount}
                >
                  Siguiente
                </Button>
              </nav>
            )}
          </div>
        </section>

        {/* Compare bar */}
        {chosen.length > 0 && (
          <div className="sticky bottom-5 z-10 mx-auto mt-6 flex max-w-[730px] flex-wrap items-center justify-center gap-4 rounded-2xl bg-slate-900 px-5 py-3.5 text-xs text-white shadow-2xl dark:bg-slate-800">
            <span>
              <strong>{chosen.length} de 3</strong> programas seleccionados
            </span>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              size="sm"
              disabled={chosen.length < 2 || compareBusy}
              onClick={() => void compare()}
            >
              {compareBusy ? "Preparando…" : "Comparar programas"}
              <ArrowRight size={16} className="ml-1" />
            </Button>
            <button
              className="text-xs text-slate-300 hover:text-white"
              onClick={() => setChosen([])}
            >
              Limpiar
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 flex flex-wrap justify-between gap-4 border-t border-border py-6 text-[11px] text-muted-foreground">
          <span>aVioa · Herramientas del equipo {areaLabel}</span>
          <span>Fuente: Niltze México Travel · Edición 2026</span>
        </footer>
      </main>

      {/* Detail modal */}
      {detail && (
        <Detail
          key={detail.id}
          item={detail}
          onClose={() => setDetail(null)}
        />
      )}

      {/* Compare dialog */}
      <dialog
        ref={compareDialog}
        aria-labelledby="nm-compare-title"
        onCancel={() => setComparison([])}
        className="m-auto w-[min(1140px,94vw)] max-h-[92dvh] rounded-2xl border-0 bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm open:flex open:flex-col"
      >
        <div className="flex items-start justify-between gap-5 border-b border-border bg-muted/30 p-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Elige la opción adecuada
            </span>
            <h2 id="nm-compare-title" className="mt-2 text-2xl font-semibold">
              Compara los programas
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cerrar comparación"
            onClick={() => {
              compareDialog.current?.close();
              setComparison([]);
            }}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div
          className="grid gap-5 overflow-auto p-6"
          style={{
            gridTemplateColumns: `repeat(${comparison.length || 2},minmax(250px,1fr))`,
          }}
        >
          {comparison.map((i) => (
            <article
              key={i.id}
              className="min-w-0 self-start rounded-xl border border-border p-5"
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {i.theme}
              </p>
              <h3 className="mt-2 text-lg font-semibold leading-snug">
                {i.title}
              </h3>
              <p className="mt-2 text-sm">
                <strong>
                  {i.days} días / {i.nights} noches
                </strong>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {i.modality}
              </p>
              {i.warnings.map((w) => (
                <p
                  key={w}
                  className="mt-2 rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                >
                  {w}
                </p>
              ))}
              <h4 className="mt-5 mb-2 text-xs font-semibold text-primary">
                Incluye
              </h4>
              {i.includes.length ? (
                <ul className="list-inside list-disc space-y-1.5 text-xs">
                  {i.includes.map((s, j) => (
                    <li key={j}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Consultar el documento completo.
                </p>
              )}
              <h4 className="mt-5 mb-2 text-xs font-semibold text-primary">
                Recorrido día a día
              </h4>
              <ol className="list-inside list-decimal space-y-1.5 text-xs">
                {i.itinerary.map((s, j) => (
                  <li key={j}>{s.split(/ - | – /)[0]}</li>
                ))}
              </ol>
              <Button
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={() => {
                  compareDialog.current?.close();
                  setComparison([]);
                  void open(i.id);
                }}
              >
                Ver tarifas y ficha completa
              </Button>
            </article>
          ))}
        </div>

        <p className="px-6 pb-5 text-xs text-muted-foreground">
          Las tarifas cambian según hotel, ocupación, fechas y suplementos.
          Revisa cada ficha antes de cotizar.
        </p>
      </dialog>
    </div>
  );
}