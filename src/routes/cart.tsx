import { createFileRoute, Link } from "@tanstack/react-router";
import { Qty } from "@/components/qty";
import { PageIntro } from "@/components/shell";
import { clothingProduct, lookupProduct, rememberProducts } from "@/lib/clothing";
import { listClothing } from "@/lib/clothing.functions";
import { EMPTY_SEARCH } from "@/data/catalog";
import { useCart, useHydrated } from "@/lib/cart";
import { eur } from "@/lib/money";
import { quote } from "@/lib/quote";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/cart")({
  head: () =>
    pageHead({
      title: "Warenkorb",
      description: "Warenkorb bei VintageElite.",
      path: "/cart",
      index: false,
    }),
  loader: () => listClothing(),
  component: CartPage,
});

function CartPage() {
  const hydrated = useHydrated();
  if (!hydrated) {
    return <PageIntro kicker="Warenkorb" title="Einen Moment." />;
  }
  return <CartBody />;
}

function CartBody() {
  const uploaded = Route.useLoaderData().map(clothingProduct);
  rememberProducts(uploaded);
  const lines = useCart((state) => state.lines);
  const setQty = useCart((state) => state.setQty);
  const remove = useCart((state) => state.remove);
  const resolved = lines.flatMap((line) => {
    const product = lookupProduct(line.slug);
    if (!product) return [];
    const variant = product.variants?.find((item) => item.id === line.variantId);
    return [{ ...line, product, variantLabel: variant?.label ?? "" }];
  });
  const priced = quote(
    resolved.map((line) => ({
      product: line.product,
      qty: line.qty,
      variantLabel: line.variantLabel,
    })),
    "DE",
  );

  if (resolved.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16">
        <h1 className="font-display text-4xl">Der Korb ist leer.</h1>
        <Link
          to="/shop"
          search={EMPTY_SEARCH}
          className="mt-6 inline-flex min-h-11 items-center bg-oxblood px-5 text-sm text-paper"
        >
          Zum Sortiment
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <h1 className="font-display text-4xl">Warenkorb</h1>
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {resolved.map((line) => (
            <li key={`${line.slug}-${line.variantId}`} className="flex gap-4 py-5">
              <img src={line.product.image} alt="" className="h-24 w-24 object-cover" />
              <div className="min-w-0 flex-1">
                <Link to="/product/$slug" params={{ slug: line.slug }} className="font-display text-xl">
                  {line.product.name}
                </Link>
                {line.variantLabel && <p className="text-sm text-muted">{line.variantLabel}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Qty
                    value={line.qty}
                    onChange={(next) => setQty(line.slug, line.variantId, next)}
                  />
                  <button
                    type="button"
                    className="min-h-11 text-sm text-muted underline"
                    onClick={() => remove(line.slug, line.variantId)}
                  >
                    Entfernen
                  </button>
                </div>
              </div>
              <p className="text-sm">{eur(line.product.price * line.qty)}</p>
            </li>
          ))}
        </ul>
      </div>
      <aside className="h-fit border border-line bg-surface p-6 lg:col-span-5">
        <h2 className="font-display text-2xl">Summe</h2>
        <Row label="Ware" value={eur(priced.goods)} />
        <Row label={priced.label} value={priced.shipping === 0 ? "frei" : eur(priced.shipping)} />
        <p className="mt-1 text-sm text-muted">{priced.note}</p>
        <p className="mt-2 text-sm text-muted">
          Lieferfenster {priced.from}–{priced.to} Werktage. Schweiz und genaue Adresse in der Kasse.
        </p>
        <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
          <span>Gesamt</span>
          <span className="font-display text-2xl">{eur(priced.total)}</span>
        </div>
        <Link
          to="/checkout"
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center bg-oxblood text-sm text-paper"
        >
          Weiter zur Kasse
        </Link>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p className="mt-3 flex justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span>{value}</span>
    </p>
  );
}
