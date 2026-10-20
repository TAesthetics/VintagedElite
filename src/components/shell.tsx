import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { EMPTY_SEARCH } from "@/data/catalog";
import { getBearerToken } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useCart, useHydrated } from "@/lib/cart";

function active(path: string, href: string) {
  if (href === "/shop") return path === "/shop" || path.startsWith("/product");
  return path === href;
}

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const { user } = useCurrentUserState();
  const [token, setToken] = useState(false);
  useEffect(() => {
    setToken(Boolean(getBearerToken()));
  }, [path]);
  const signedIn = Boolean((user && !user.isDevFallback) || token);
  const count = useCart((state) => state.lines.reduce((sum, line) => sum + line.qty, 0));
  const bag = hydrated ? count : 0;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  function onSearch(event: FormEvent) {
    event.preventDefault();
    setOpen(false);
    void navigate({ to: "/shop", search: { ...EMPTY_SEARCH, q: query.trim() } });
  }

  const item = (href: "/shop" | "/versand" | "/ueber", label: string) => (
    <Link
      to={href}
      search={href === "/shop" ? EMPTY_SEARCH : undefined}
      onClick={() => setOpen(false)}
      className={`inline-flex min-h-11 items-center border-b text-sm ${
        active(path, href) ? "border-oxblood text-ink" : "border-transparent text-muted"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <div className="h-1 bg-oxblood" />
      <p className="border-b border-line px-5 py-2 text-center text-xs tracking-wide text-muted">
        Eisen und Supplements · Second Hand aus dem Atelier
      </p>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
          <Link to="/" className="flex min-w-0 items-center gap-2" onClick={() => setOpen(false)}>
            <img src="/logo.svg" alt="" className="size-11 shrink-0" />
            <span className="font-sans text-lg font-semibold tracking-tight sm:text-xl">VintageElite</span>
          </Link>
          <nav className="ml-6 hidden items-center gap-5 md:flex">
            {item("/shop", "Sortiment")}
            {item("/versand", "Versand")}
            {item("/ueber", "Das Haus")}
          </nav>
          <form onSubmit={onSearch} className="hidden lg:block">
            <label className="relative block">
              <span className="sr-only">Sortiment durchsuchen</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Suchen"
                className="w-52 pl-9"
              />
            </label>
          </form>
          <div className="ml-auto flex items-center">
          <Link
            to={signedIn ? "/atelier" : "/login"}
            onClick={() => setOpen(false)}
            className={`inline-flex min-h-11 items-center border-b px-2 text-sm ${
              path === "/login" || path === "/atelier" ? "border-oxblood text-ink" : "border-transparent text-muted"
            }`}
          >
            {signedIn ? "Atelier" : "Anmelden"}
          </Link>
          <Link
            to="/cart"
            aria-label={`Warenkorb, ${bag} Artikel`}
            className="relative inline-flex min-h-11 min-w-11 items-center justify-center"
          >
            <ShoppingBag className="size-5" />
            {bag > 0 && (
              <span className="absolute top-1 right-0 bg-oxblood px-1 text-xs text-paper">
                {bag}
              </span>
            )}
          </Link>
          </div>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center md:hidden"
            aria-expanded={open}
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-line px-5 py-4 md:hidden">
            <form onSubmit={onSearch} className="mb-3">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Suchen"
                className="w-full"
                aria-label="Sortiment durchsuchen"
              />
            </form>
            <div className="flex flex-col">
              {item("/shop", "Sortiment")}
              {item("/versand", "Versand")}
              {item("/ueber", "Das Haus")}
              <Link
                to={signedIn ? "/atelier" : "/login"}
                onClick={() => setOpen(false)}
                className="inline-flex min-h-11 items-center text-sm"
              >
                {signedIn ? "Atelier" : "Anmelden"}
              </Link>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3">
          <div>
            <p className="flex items-center gap-2 font-sans text-xl font-semibold tracking-tight">
              <img src="/logo.svg" alt="" className="size-9" />
              VintageElite
            </p>
            <p className="mt-2 max-w-xs text-sm text-muted">
              Second Hand aus dem Atelier, Fitness aus dem Sortiment. Zahlung hier im Shop.
            </p>
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <Link to="/shop" search={EMPTY_SEARCH} className="min-h-11 inline-flex items-center">
              Sortiment
            </Link>
            <Link
              to="/shop"
              search={{ ...EMPTY_SEARCH, dept: "vintage" }}
              className="min-h-11 inline-flex items-center"
            >
              Second Hand
            </Link>
            <Link
              to="/shop"
              search={{ ...EMPTY_SEARCH, dept: "fitness" }}
              className="min-h-11 inline-flex items-center"
            >
              Fitness
            </Link>
            <Link to="/versand" className="min-h-11 inline-flex items-center">
              Versand & Rückgabe
            </Link>
            <Link to="/ueber" className="min-h-11 inline-flex items-center">
              Das Haus
            </Link>
            <Link to="/impressum" className="min-h-11 inline-flex items-center">
              Impressum
            </Link>
            <Link to="/atelier" className="min-h-11 inline-flex items-center">
              Atelier
            </Link>
          </div>
          <p className="text-sm text-muted">
            Second Hand nur, was im Atelier liegt. Fitness und Supplements im Sortiment. Zahlung über Stripe.
            hallo@vintagedelite.shop
          </p>
        </div>
      </footer>
    </div>
  );
}

export function PageIntro({
  kicker,
  title,
  text,
  flush,
}: {
  kicker: string;
  title: string;
  text?: string;
  flush?: boolean;
}) {
  return (
    <header className={`mx-auto max-w-6xl px-5 pb-8 ${flush ? "pt-4" : "pt-12"}`}>
      <p className="text-xs tracking-widest text-brass uppercase">{kicker}</p>
      <h1 className="mt-2 font-display text-4xl leading-tight md:text-5xl">{title}</h1>
      {text && <p className="mt-4 max-w-2xl text-muted">{text}</p>}
    </header>
  );
}
