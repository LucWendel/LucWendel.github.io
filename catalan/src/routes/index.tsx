import { createFileRoute, Link } from "@tanstack/react-router";
import { Fragment } from "react";
import { Check, Lock, Play, Volume2, ChevronRight } from "lucide-react";
import { UNITS, WORD_OF_DAY, type PathNode, type Unit } from "@/lib/catalan-content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Learn Catalan — Llum" },
      { name: "description", content: "A bite-sized path through the Catalan language, with culture spotlights woven between every unit." },
      { property: "og:title", content: "Learn Catalan — Llum" },
      { property: "og:description", content: "A bite-sized path through the Catalan language, with culture spotlights woven between every unit." },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  return (
    <div className="flex">
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-3xl px-6 py-10 md:px-10 md:py-14">
          {UNITS.map((unit) => (
            <UnitSection key={unit.id} unit={unit} />
          ))}
        </div>
      </div>

      <RightRail />
    </div>
  );
}

function UnitSection({ unit }: { unit: Unit }) {
  const accentText =
    unit.accent === "heritage" ? "text-heritage" : unit.accent === "med" ? "text-med" : "text-gold";
  const accentBar =
    unit.accent === "heritage" ? "bg-heritage" : unit.accent === "med" ? "bg-med" : "bg-gold";

  return (
    <section className="mb-20 last:mb-0">
      <header className="mb-12 flex items-end justify-between gap-6">
        <div>
          <span className={"text-xs font-bold uppercase tracking-[0.18em] " + accentText}>
            {unit.index}
          </span>
          <h2 className="font-display mt-1 text-4xl font-bold tracking-tight md:text-5xl">
            {unit.title}
            {unit.motto && (
              <>
                <br />
                <span className="text-3xl md:text-4xl">{unit.motto}</span>
              </>
            )}
          </h2>
          <p className="mt-3 max-w-[52ch] text-sm text-muted-foreground">{unit.subtitle}</p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-xs text-muted-foreground">{unit.progress}% complete</p>
          <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-muted">
            <div
              className={"h-full " + accentBar}
              style={{ width: `${unit.progress}%` }}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-col items-center gap-6">
        {unit.nodes.map((node, i) => (
          <Fragment key={node.id}>
            <Node node={node} />
            {i < unit.nodes.length - 1 && (
              <div className="h-10 w-px bg-border" aria-hidden />
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}

function Node({ node }: { node: PathNode }) {
  if (node.kind === "culture") return <CultureNode node={node} />;

  const locked = node.status === "locked";
  const current = node.status === "current";
  const completed = node.status === "completed";

  if (locked) {
    return (
      <div className="group relative pointer-events-none">
        <div className="size-20 rounded-3xl border border-border bg-card opacity-40 grayscale">
          <div className="grid h-full place-items-center p-3">
            <div className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <Lock className="size-5" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <p className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap text-sm font-medium text-muted-foreground">
          {node.title}
        </p>
      </div>
    );
  }

  return (
    <Link
      to="/lesson/$lessonId"
      params={{ lessonId: node.id }}
      className="group relative outline-none"
    >
      <div
        className={
          "size-20 rounded-3xl border border-border bg-card shadow-soft transition-transform " +
          (locked ? "opacity-40 grayscale" : "group-hover:-translate-y-1")
        }
      >
        <div className="grid h-full place-items-center p-3">
          <div
            className={
              "grid size-14 place-items-center rounded-2xl text-xl font-bold text-white " +
              (completed
                ? "bg-gold"
                : current
                ? "bg-heritage shadow-lift"
                : "bg-muted text-muted-foreground")
            }
          >
            {locked ? (
              <Lock className="size-5" strokeWidth={2.5} />
            ) : completed ? (
              <Check className="size-6" strokeWidth={3} />
            ) : (
              <Play className="size-5 fill-current" strokeWidth={0} />
            )}
          </div>
        </div>
        {current && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-heritage px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lift">
            Start
          </span>
        )}
      </div>
      <p
        className={
          "absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap text-sm font-medium " +
          (locked ? "text-muted-foreground" : "text-foreground")
        }
      >
        {node.title}
      </p>
    </Link>
  );
}

function CultureNode({ node }: { node: PathNode }) {
  const locked = node.status === "locked";
  return (
    <Link
      to="/traditions"
      className={
        "group relative block w-72 rounded-2xl bg-med p-5 text-left text-white shadow-lift transition-transform " +
        (locked ? "pointer-events-none opacity-40 grayscale" : "hover:-translate-y-1")
      }
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
          Cultural Spotlight
        </span>
        {node.duration && (
          <span className="rounded bg-white/15 px-2 py-0.5 text-[10px] font-semibold">
            {node.duration}
          </span>
        )}
      </div>
      <h3 className="font-display text-xl font-semibold leading-tight">{node.title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-white/70">
        Discover the human towers that define Catalan strength and community.
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-white/90">
        Open postcard <ChevronRight className="size-3.5" />
      </span>
    </Link>
  );
}

function RightRail() {
  return (
    <aside className="hidden w-80 shrink-0 border-l border-border bg-card xl:block">
      <div className="sticky top-0 flex flex-col gap-6 p-8">
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Daily progress
          </h4>
          <div className="mt-4 flex items-center gap-4">
            <div
              className="grid size-14 place-items-center rounded-full"
              style={{
                background:
                  "conic-gradient(var(--gold) 0deg 216deg, var(--muted) 216deg 360deg)",
              }}
            >
              <div className="grid size-11 place-items-center rounded-full bg-card text-xs font-bold">
                12/20
              </div>
            </div>
            <div>
              <p className="font-semibold">XP points</p>
              <p className="text-xs text-muted-foreground">Almost at today's goal.</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-heritage-soft p-6">
          <h4 className="font-display text-lg font-semibold text-heritage">Mot del dia</h4>
          <p className="font-display mt-2 text-3xl font-bold text-foreground">
            {WORD_OF_DAY.word}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {WORD_OF_DAY.ipa} · {WORD_OF_DAY.meaning}
          </p>
          <p className="mt-3 text-xs italic text-foreground/70">{WORD_OF_DAY.note}</p>
          <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-heritage py-2.5 text-sm font-semibold text-white shadow-soft transition-transform active:scale-[0.98]">
            <Volume2 className="size-4" strokeWidth={2.25} /> Hear pronunciation
          </button>
        </div>

        <div className="rounded-3xl border border-border p-6">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            This week
          </h4>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {["D", "L", "M", "X", "J", "V", "S"].map((d, i) => (
              <div key={d + i} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground">{d}</span>
                <div
                  className={
                    "size-7 rounded-lg " +
                    (i < 5 ? "bg-gold" : i === 5 ? "border-2 border-heritage bg-heritage/10" : "bg-muted")
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
