import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent, type InputHTMLAttributes } from "react";
import { EMPTY_SEARCH } from "@/data/catalog";
import { clothingProduct, lookupProduct, rememberProducts } from "@/lib/clothing";
import { listClothing } from "@/lib/clothing.functions";
import { useCart, useHydrated } from "@/lib/cart";
import { eur } from "@/lib/money";
import { apiPath, browserBase } from "@/lib/public-base";
import { quote } from "@/lib/quote";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/checkout")({
  head: () =>
    pageHead({
      title: "Kasse",
      description: "Kasse bei VintageElite. Zahlung auf Rechnung.",
      path: "/checkout",
      index: false,
    }),
  loader: () => listClothing(),
  component: CheckoutPage,
});

const COUNTRIES = [
  ["DE", "Deutschland"],
  ["AT", "Österreich"],
  ["NL", "Niederlande"],
  ["BE", "Belgien"],
  ["FR", "Frankreich"],
  ["IT", "Italien"],
  ["PL", "Polen"],
  ["CH", "Schweiz"],
] as const;

function CheckoutPage() {
  const hydrated = useHydrated();
  if (!hydrated) return <p className="px-5 py-16 text-muted">Kasse wird geladen.</p>;
  return <CheckoutForm />;
}

function CheckoutForm() {
  const uploaded = Route.useLoaderData().map(clothingProduct);
  rememberProducts(uploaded);
  const lines = useCart((state) => state.lines);
  const [country, setCountry] = useState("DE");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const resolved = lines.flatMap((line) => {
    const product = lookupProduct(line.slug);
    if (!product) return [];
    const variant = product.variants?.find((item) => item.id === line.variantId);
    return [{ ...line, product, variantLabel: variant?.label ?? "" }];
  });
  const priced = quote(
    resolved.map((line) => ({ product: line.product, qty: line.qty, variantLabel: line.variantLabel })),
    country,
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      const response = await fetch(apiPath("/api/checkout"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          street: String(form.get("street") ?? ""),
          zip: String(form.get("zip") ?? ""),
          city: String(form.get("city") ?? ""),
          country,
          note: String(form.get("note") ?? ""),
          returnBase: browserBase(),
          lines: resolved.map((line) => ({
            slug: line.slug,
            variantId: line.variantId,
            qty: line.qty,
          })),
        }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        setError(data.error ?? "Zahlung konnte nicht gestartet werden.");
        setBusy(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Netzwerkfehler. Bitte noch einmal.");
      setBusy(false);
    }
  }

  if (resolved.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16">
        <h1 className="font-display text-4xl">Nichts zu bezahlen.</h1>
        <Link to="/shop" search={EMPTY_SEARCH} className="mt-6 inline-flex min-h-11 items-center underline">
          Zum Sortiment
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <h1 className="font-display text-4xl">Kasse</h1>
        <p className="mt-3 text-muted">
          Adresse hier. Zahlung auf Rechnung, keine Karte. Die Rechnung kommt an die E-Mail. Versand nach Zahlungseingang.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Field label="Name" name="name" autoComplete="name" className="sm:col-span-2" />
          <Field label="E-Mail" name="email" type="email" autoComplete="email" />
          <Field label="Telefon" name="phone" autoComplete="tel" />
          <Field label="Straße" name="street" autoComplete="address-line1" className="sm:col-span-2" />
          <Field label="PLZ" name="zip" autoComplete="postal-code" />
          <Field label="Ort" name="city" autoComplete="address-level2" />
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm text-muted">Land</span>
            <select
              name="country"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="w-full"
            >
              {COUNTRIES.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm text-muted">Hinweis an uns</span>
            <textarea name="note" className="w-full" placeholder="Etage, Tor, Abstellgenehmigung" />
          </label>
        </div>
      </div>
      <aside className="h-fit border border-line bg-surface p-6 lg:col-span-5">
        <h2 className="font-display text-2xl">Rechnung</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {resolved.map((line) => (
            <li key={`${line.slug}-${line.variantId}`} className="flex justify-between gap-3">
              <span>
                {line.qty}× {line.product.name}
                {line.variantLabel ? ` · ${line.variantLabel}` : ""}
              </span>
              <span>{eur(line.product.price * line.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-line pt-4 text-sm">
          <span className="text-muted">{priced.label}</span>
          <span>{priced.shipping === 0 ? "frei" : eur(priced.shipping)}</span>
        </p>
        <p className="mt-1 text-sm text-muted">
          {priced.note} Lieferfenster {priced.from}–{priced.to} Werktage.
        </p>
        <p className="mt-4 flex items-baseline justify-between">
          <span>Zu zahlen</span>
          <span className="font-display text-2xl">{eur(priced.total)}</span>
        </p>
        {error && (
          <p className="mt-4 text-sm text-oxblood" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center bg-oxblood text-sm text-paper disabled:opacity-60"
        >
          {busy ? "Bestellung wird gespeichert…" : "Auf Rechnung bestellen"}
        </button>
      </aside>
    </form>
  );
}

function Field({
  label,
  className = "",
  ...props
}: { label: string; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm text-muted">{label}</span>
      <input required={props.name !== "phone" && props.name !== "note"} {...props} className="w-full" />
    </label>
  );
}
