import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { BookOpen, Compass, UtensilsCrossed, Flame, Languages } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-med">Perdut</p>
        <h1 className="font-display mt-2 text-6xl font-bold text-foreground">404</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This page hasn't been written into the Catalan story yet.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center rounded-xl bg-heritage px-4 py-2 text-sm font-semibold text-white shadow-soft"
        >
          Back to the path
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl text-foreground">Something tripped on the cobblestones</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Try again, or head back to the path.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-xl bg-heritage px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
          <a href="/" className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold">
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Llum — Learn Catalan & Catalan Culture" },
      { name: "description", content: "Bite-sized lessons in the Catalan language paired with the traditions, food and history of Catalonia." },
      { property: "og:title", content: "Llum — Learn Catalan & Catalan Culture" },
      { property: "og:description", content: "Bite-sized lessons in the Catalan language paired with the traditions, food and history of Catalonia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const NAV = [
  { to: "/", label: "Learn", icon: BookOpen },
  { to: "/language", label: "Language", icon: Languages },
  { to: "/traditions", label: "Traditions", icon: Compass },
  { to: "/gastronomy", label: "Gastronomy", icon: UtensilsCrossed },
] as const;

function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card p-6 md:flex">
      <Link to="/" className="mb-12 block">
        <h1 className="font-display text-3xl font-bold tracking-tight text-heritage">Llum</h1>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Catalan &amp; Culture
        </p>
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors " +
                (active
                  ? "bg-heritage-soft text-heritage"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground")
              }
            >
              <Icon className="size-4" strokeWidth={2.25} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/10 p-4">
        <div className="flex items-center gap-2">
          <Flame className="size-4 text-heritage" strokeWidth={2.5} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
            Current streak
          </p>
        </div>
        <p className="font-display mt-2 text-3xl font-bold text-foreground">12 dies</p>
        <p className="mt-1 text-xs text-muted-foreground">Keep the foc burning.</p>
      </div>
    </aside>
  );
}

function MobileTopBar() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur md:hidden">
      <Link to="/" className="font-display text-xl font-bold text-heritage">Llum</Link>
      <div className="flex items-center gap-3 text-xs font-semibold">
        <span className="flex items-center gap-1 text-heritage">
          <Flame className="size-3.5" strokeWidth={2.5} /> 12
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="text-med">420 XP</span>
      </div>
    </header>
  );
}

function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="sticky bottom-0 z-40 flex items-center justify-around border-t border-border bg-card px-2 py-2 md:hidden">
      {NAV.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={
              "flex flex-col items-center gap-1 px-4 py-1 text-[10px] font-bold uppercase tracking-wider " +
              (active ? "text-heritage" : "text-muted-foreground")
            }
          >
            <Icon className="size-5" strokeWidth={2.25} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileTopBar />
          <main className="flex-1">
            <Outlet />
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </QueryClientProvider>
  );
}
