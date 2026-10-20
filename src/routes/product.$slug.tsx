import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Crumbs } from "@/components/crumbs";
import { ProductCard } from "@/components/product-card";
import { Qty } from "@/components/qty";
import {
  defaultVariant,
  EMPTY_SEARCH,
  getProduct,
  relatedProducts,
  sourceCopy,
} from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { clothingProductBySlug } from "@/lib/clothing.functions";
import { rememberProducts } from "@/lib/clothing";
import { eur } from "@/lib/money";
import { crumbLd, pageHead, productLanding, productLd } from "@/lib/seo";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const found = getProduct(params.slug);
    if (found) return found;
    const uploaded = await clothingProductBySlug({ data: params.slug });
    if (!uploaded) throw notFound();
    return uploaded;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return pageHead({
        title: "Nicht gefunden",
        description: "Dieses Stück ist nicht im Sortiment von VintageElite.",
        path: `/product/${params.slug}`,
        index: false,
      });
    }
    const landing = productLanding(loaderData);
    return pageHead({
      title: landing.title,
      description: landing.description,
      path: landing.path,
      jsonLd: [productLd(loaderData), crumbLd(landing.crumbs)],
    });
  },
  notFoundComponent: MissingProduct,
  component: ProductPage,
});

function ProductPage() {
  const product = Route.useLoaderData();
  rememberProducts([product]);
  return <Detail key={product.slug} product={product} />;
}

function MissingProduct() {
  return (
    <div className="mx-auto max-w-xl px-5 py-20">
      <h1 className="font-display text-4xl">Dieses Stück führen wir nicht.</h1>
      <Link to="/shop" search={EMPTY_SEARCH} className="mt-6 inline-flex min-h-11 items-center underline">
        Zurück zum Sortiment
      </Link>
    </div>
  );
}

function Detail({ product }: { product: NonNullable<ReturnType<typeof getProduct>> }) {
  const add = useCart((state) => state.add);
  const [variantId, setVariantId] = useState(defaultVariant(product));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const related = relatedProducts(product);

  function addToCart() {
    add(product.slug, variantId, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  const landing = productLanding(product);

  return (
    <article className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-2 lg:py-14">
      <img src={product.image} alt={product.name} className="w-full bg-surface object-cover" />
      <div>
        <Crumbs items={landing.crumbs} />
        <p className="mt-4 text-xs tracking-widest text-brass uppercase">
          {product.condition ? `${product.condition} · Second Hand` : "VintageElite"}
          {" · "}
          {product.ship[0]}–{product.ship[1]} Werktage
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight md:text-5xl">{product.name}</h1>
        <p className="mt-4 flex items-baseline gap-3">
          <span className="text-lg">{eur(product.price)}</span>
          {product.compareAt && (
            <span className="text-muted line-through">{eur(product.compareAt)}</span>
          )}
        </p>
        <p className="mt-4 text-muted">{product.description}</p>
        {product.variants && (
          <div className="mt-6">
            <p className="text-sm text-muted">{product.variantTitle ?? "Größe"}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setVariantId(variant.id)}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center border px-3 text-sm ${
                    variantId === variant.id ? "border-ink bg-ink text-paper" : "border-line"
                  }`}
                >
                  {variant.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {!product.unique && (
            <Qty value={qty} onChange={(next) => setQty(Math.max(1, Math.min(8, next)))} />
          )}
          <button
            type="button"
            onClick={addToCart}
            className="inline-flex min-h-11 flex-1 items-center justify-center bg-oxblood px-5 text-sm text-paper"
          >
            {added ? "Liegt im Warenkorb" : "In den Warenkorb"}
          </button>
        </div>
        <p className="mt-3 text-sm" aria-live="polite">
          {added && (
            <Link to="/cart" className="underline">
              Zum Warenkorb
            </Link>
          )}
        </p>
        <div className="mt-8 border-t border-line pt-6">
          <h2 className="font-display text-2xl">So kommt es zu dir</h2>
          <p className="mt-2 text-muted">{sourceCopy(product.supplier)}</p>
          {product.freight && (
            <p className="mt-2 text-sm text-muted">Spedition, 49 € innerhalb der EU, eine Sendung pro Bestellung.</p>
          )}
        </div>
        <dl className="mt-8 border-t border-line">
          {product.specs.map((spec) => (
            <div key={spec.label} className="grid grid-cols-2 gap-3 border-b border-line py-3 text-sm">
              <dt className="text-muted">{spec.label}</dt>
              <dd>{spec.value}</dd>
            </div>
          ))}
        </dl>
        {product.guide && (
          <div className="mt-8">
            <h2 className="font-display text-2xl">Passform</h2>
            <p className="mt-2 text-sm text-muted">{product.guide.title}</p>
            <table className="mt-3 w-full text-sm">
              <tbody>
                {product.guide.rows.map((row) => (
                  <tr key={row.size} className="border-b border-line">
                    <th className="py-2 text-left font-medium">{row.size}</th>
                    <td className="py-2 text-muted">{row.fit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="lg:col-span-2">
        <h2 className="font-display text-3xl">Daneben</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} />
          ))}
        </div>
      </div>
    </article>
  );
}
