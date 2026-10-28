import { createFileRoute } from "@tanstack/react-router";
import { DISHES } from "@/lib/catalan-content";

export const Route = createFileRoute("/gastronomy")({
  head: () => ({
    meta: [
      { title: "Catalan Gastronomy — Llum" },
      { name: "description", content: "From calçots to crema catalana — the dishes that anchor Catalan life, with the words to order them." },
      { property: "og:title", content: "Catalan Gastronomy — Llum" },
      { property: "og:description", content: "From calçots to crema catalana — the dishes that anchor Catalan life, with the words to order them." },
    ],
  }),
  component: GastronomyPage,
});

function GastronomyPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-10 md:py-14">
      <header className="mb-12">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-med">
          A taula · At the table
        </span>
        <h1 className="font-display mt-2 text-5xl font-bold tracking-tight md:text-6xl">
          The Catalan kitchen.
        </h1>
        <p className="mt-4 max-w-[58ch] text-sm text-muted-foreground">
          Eat your way through Catalonia. Every dish on this page comes with the Catalan
          words you'll need at the market, the bar, or the long communal table.
        </p>
      </header>

      <div className="space-y-16">
        {DISHES.map((dish, i) => (
          <article
            key={dish.name}
            className={
              "grid gap-8 md:grid-cols-2 md:items-center " +
              (i % 2 === 1 ? "md:[&>*:first-child]:order-2" : "")
            }
          >
            <div className="overflow-hidden rounded-3xl border border-border">
              <img
                src={dish.image}
                alt={dish.name}
                width={800}
                height={608}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-heritage">
                {dish.region}
              </span>
              <h2 className="font-display mt-2 text-4xl font-bold tracking-tight">
                {dish.name}
              </h2>
              <p className="font-display mt-1 text-lg italic text-med">{dish.catalan}</p>
              <p className="mt-4 max-w-[44ch] text-sm leading-relaxed text-muted-foreground">
                {dish.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
