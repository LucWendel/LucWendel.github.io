import { createFileRoute, Link } from "@tanstack/react-router";
import { CULTURE } from "@/lib/catalan-content";

export const Route = createFileRoute("/traditions")({
  head: () => ({
    meta: [
      { title: "Catalan Traditions — Llum" },
      { name: "description", content: "Postcards from Catalonia: castells, sardanes, modernisme architecture and the rituals that shape Catalan identity." },
      { property: "og:title", content: "Catalan Traditions — Llum" },
      { property: "og:description", content: "Postcards from Catalonia: castells, sardanes, modernisme architecture and the rituals that shape Catalan identity." },
    ],
  }),
  component: TraditionsPage,
});

function TraditionsPage() {
  const [hero, ...rest] = CULTURE;
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-10 md:py-14">
      <header className="mb-12">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-med">
          Postals · Postcards
        </span>
        <h1 className="font-display mt-2 text-5xl font-bold tracking-tight md:text-6xl">
          The traditions that <em className="italic text-heritage">make</em> Catalonia.
        </h1>
        <p className="mt-4 max-w-[58ch] text-sm text-muted-foreground">
          A language is more than its words. Read these culture postcards between lessons —
          each one is a doorway into something Catalans do, build, dance or eat together.
        </p>
      </header>

      <Link
        to="/traditions"
        className="group mb-12 grid gap-8 overflow-hidden rounded-3xl border border-border bg-card p-2 md:grid-cols-2"
      >
        <div className="overflow-hidden rounded-2xl">
          <img
            src={hero.image}
            alt={hero.title}
            width={1200}
            height={800}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col justify-center p-6 md:p-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-heritage">
            {hero.tag} · {hero.readMinutes} min read
          </span>
          <h2 className="font-display mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {hero.title}
          </h2>
          <p className="font-display mt-1 text-base italic text-med">{hero.catalanTitle}</p>
          <p className="mt-4 max-w-[44ch] text-sm leading-relaxed text-muted-foreground">
            {hero.excerpt}
          </p>
          <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-heritage px-4 py-2.5 text-sm font-semibold text-white shadow-soft">
            Read postcard
          </span>
        </div>
      </Link>

      <div className="grid gap-6 md:grid-cols-3">
        {rest.map((card) => (
          <article
            key={card.slug}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={card.image}
                alt={card.title}
                width={800}
                height={600}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-med">
                {card.tag} · {card.readMinutes} min
              </span>
              <h3 className="font-display mt-1.5 text-xl font-semibold leading-tight">
                {card.title}
              </h3>
              <p className="font-display text-sm italic text-muted-foreground">
                {card.catalanTitle}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {card.excerpt}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
