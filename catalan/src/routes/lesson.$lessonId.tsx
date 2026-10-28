import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Heart, X } from "lucide-react";
import { SAMPLE_EXERCISES, type Exercise } from "@/lib/catalan-content";

export const Route = createFileRoute("/lesson/$lessonId")({
  head: () => ({
    meta: [
      { title: "Lesson — Llum" },
      { name: "description", content: "A short Catalan exercise: translate, match and listen your way through real phrases." },
    ],
  }),
  component: LessonPage,
});

function LessonPage() {
  const { lessonId } = Route.useParams();
  const router = useRouter();
  const exercises: Exercise[] = useMemo(
    () => SAMPLE_EXERCISES[lessonId] ?? SAMPLE_EXERCISES["n5"],
    [lessonId],
  );

  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [done, setDone] = useState(false);

  const current = exercises[step];
  const progress = ((step + (checked ? 1 : 0)) / exercises.length) * 100;
  const correct = checked && current.options.find((o) => o.id === picked)?.correct;

  function onCheck() {
    if (!picked) return;
    setChecked(true);
    const isCorrect = current.options.find((o) => o.id === picked)?.correct;
    if (isCorrect) setScore((s) => s + 10);
    else setHearts((h) => Math.max(0, h - 1));
  }

  function onNext() {
    if (step + 1 >= exercises.length) {
      setDone(true);
      return;
    }
    setStep((s) => s + 1);
    setPicked(null);
    setChecked(false);
  }

  if (done) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-med">Molt bé!</span>
        <h1 className="font-display mt-3 text-5xl font-bold tracking-tight">
          Lesson complete.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          You earned <span className="font-semibold text-heritage">{score} XP</span> and kept{" "}
          <span className="font-semibold text-heritage">{hearts} hearts</span>.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            to="/"
            className="rounded-xl bg-heritage px-5 py-3 text-sm font-semibold text-white shadow-soft"
          >
            Back to the path
          </Link>
          <Link
            to="/traditions"
            className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold"
          >
            Read a postcard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-2xl flex-col px-6 py-8 md:py-12">
      {/* Top bar: close, progress, hearts */}
      <div className="mb-10 flex items-center gap-4">
        <button
          onClick={() => router.history.back()}
          className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          aria-label="Exit lesson"
        >
          <X className="size-5" />
        </button>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gold transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-1.5 text-heritage">
          <Heart className="size-5 fill-current" strokeWidth={0} />
          <span className="text-sm font-bold">{hearts}</span>
        </div>
      </div>

      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-med">
          {current.prompt}
        </p>
        <h2 className="font-display mt-3 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          {current.catalan}
        </h2>

        <div className="mt-10 space-y-3">
          {current.options.map((opt) => {
            const isPicked = picked === opt.id;
            const reveal = checked && opt.correct;
            const wrong = checked && isPicked && !opt.correct;
            return (
              <button
                key={opt.id}
                onClick={() => !checked && setPicked(opt.id)}
                disabled={checked}
                className={
                  "flex w-full items-center justify-between rounded-2xl border-2 bg-card p-5 text-left text-base transition-all " +
                  (reveal
                    ? "border-heritage bg-heritage-soft"
                    : wrong
                    ? "border-foreground/30 bg-muted opacity-70"
                    : isPicked
                    ? "border-heritage shadow-soft"
                    : "border-border hover:border-foreground/20")
                }
              >
                <span className={reveal ? "font-semibold text-heritage" : ""}>{opt.en}</span>
                <span
                  className={
                    "grid size-6 place-items-center rounded-full border-2 " +
                    (reveal
                      ? "border-heritage bg-heritage text-white"
                      : isPicked
                      ? "border-heritage bg-heritage text-white"
                      : "border-border")
                  }
                >
                  {reveal || isPicked ? <Check className="size-3.5" strokeWidth={3} /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 mt-10 -mx-6 border-t border-border bg-background/95 px-6 py-5 backdrop-blur">
        {checked && (
          <p
            className={
              "mb-3 text-sm font-semibold " +
              (correct ? "text-heritage" : "text-foreground")
            }
          >
            {correct ? "Excel·lent! Right answer." : "Not quite — the correct one is highlighted."}
          </p>
        )}
        {!checked ? (
          <button
            onClick={onCheck}
            disabled={!picked}
            className="w-full rounded-2xl bg-heritage py-4 text-sm font-bold uppercase tracking-wider text-white shadow-soft transition-all disabled:opacity-30"
          >
            Check answer
          </button>
        ) : (
          <button
            onClick={onNext}
            className="w-full rounded-2xl bg-foreground py-4 text-sm font-bold uppercase tracking-wider text-background shadow-soft"
          >
            {step + 1 >= exercises.length ? "Finish lesson" : "Continue"}
          </button>
        )}
      </div>
    </div>
  );
}
