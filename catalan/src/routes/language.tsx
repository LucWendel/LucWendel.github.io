import { createFileRoute } from "@tanstack/react-router";
import { Volume2, MessageCircle, Hash, Palette, BookMarked } from "lucide-react";

export const Route = createFileRoute("/language")({
  head: () => ({
    meta: [
      { title: "Language Reference — Llum" },
      { name: "description", content: "Catalan vocabulary, pronunciation and grammar essentials." },
      { property: "og:title", content: "Language Reference — Llum" },
      { property: "og:description", content: "Catalan vocabulary, pronunciation and grammar essentials." },
    ],
  }),
  component: LanguagePage,
});

const VOCAB_CARDS = [
  {
    category: "Greetings",
    icon: MessageCircle,
    words: [
      { ca: "Bon dia", en: "Good morning" },
      { ca: "Bona tarda", en: "Good afternoon" },
      { ca: "Bona nit", en: "Good night" },
      { ca: "Adéu", en: "Goodbye" },
      { ca: "Fins aviat", en: "See you soon" },
    ],
  },
  {
    category: "Numbers",
    icon: Hash,
    words: [
      { ca: "Un, dos, tres", en: "One, two, three" },
      { ca: "Quatre, cinc, sis", en: "Four, five, six" },
      { ca: "Set, vuit, nou", en: "Seven, eight, nine" },
      { ca: "Deu", en: "Ten" },
    ],
  },
  {
    category: "Colours",
    icon: Palette,
    words: [
      { ca: "Vermell", en: "Red" },
      { ca: "Blau", en: "Blue" },
      { ca: "Groc", en: "Yellow" },
      { ca: "Verd", en: "Green" },
      { ca: "Blanc", en: "White" },
      { ca: "Negre", en: "Black" },
    ],
  },
];

const SOUNDS = [
  { ca: "ll", note: "Like a 'y' in 'yes' — but softer.", example: "Llibertat" },
  { ca: "ny", note: "Like the 'ny' in 'canyon'.", example: "Catalunya" },
  { ca: "ig", note: "A soft 'ch' at the end of a word.", example: "Fàcil" },
  { ca: "r", note: "Rolled at the start of a word; soft in the middle.", example: "Ràdio / pera" },
  { ca: "l·l", note: "A geminate 'l' — hold the sound longer.", example: "Intel·ligent" },
];

function LanguagePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-10 md:px-10 md:py-14">
        <header className="mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-med">
            Language
          </span>
          <h1 className="font-display mt-1 text-4xl font-bold tracking-tight md:text-5xl">
            Bon dia
          </h1>
          <p className="mt-3 max-w-[52ch] text-sm text-muted-foreground">
            A quick reference for Catalan essentials — vocabulary, pronunciation and the grammar that holds it together.
          </p>
        </header>

        <section className="mb-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-heritage mb-6">
            Essential Vocabulary
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VOCAB_CARDS.map((card) => (
              <div
                key={card.category}
                className="rounded-2xl border border-border bg-card p-5 shadow-soft"
              >
                <div className="mb-4 flex items-center gap-2">
                  <card.icon className="size-4 text-heritage" strokeWidth={2.5} />
                  <h3 className="text-sm font-semibold">{card.category}</h3>
                </div>
                <ul className="space-y-2.5">
                  {card.words.map((w) => (
                    <li key={w.ca} className="flex items-start justify-between gap-3 text-sm">
                      <span className="font-medium text-foreground">{w.ca}</span>
                      <span className="text-muted-foreground">{w.en}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-heritage mb-6">
            Pronunciation Guide
          </h2>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="grid gap-4 sm:grid-cols-2">
              {SOUNDS.map((sound) => (
                <div
                  key={sound.ca}
                  className="flex items-start gap-4 rounded-xl bg-muted/50 p-4"
                >
                  <span className="font-display text-2xl font-bold text-heritage">
                    {sound.ca}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{sound.example}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{sound.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-heritage mb-6">
            Grammar at a Glance
          </h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="text-sm font-semibold">Articles</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Catalan has two genders. The definite articles are <span className="font-medium text-foreground">el</span> (masc.) and <span className="font-medium text-foreground">la</span> (fem.). Before vowels, <span className="font-medium text-foreground">l'</span> is used for both.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <span className="font-medium text-foreground">el llibre</span>
                  <span className="block text-muted-foreground">the book</span>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <span className="font-medium text-foreground">la taula</span>
                  <span className="block text-muted-foreground">the table</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="text-sm font-semibold">To be — <span className="italic">Ser / Estar</span></h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Like Spanish, Catalan distinguishes permanent qualities (<span className="font-medium text-foreground">ser</span>) from states or locations (<span className="font-medium text-foreground">estar</span>).
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <span className="font-medium text-foreground">Jo sóc</span>
                  <span className="block text-muted-foreground">I am (permanent)</span>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <span className="font-medium text-foreground">Jo estic</span>
                  <span className="block text-muted-foreground">I am (temporary / location)</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
