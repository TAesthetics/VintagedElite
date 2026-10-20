import { Link } from "@tanstack/react-router";
import { departmentOf, type Product } from "@/data/catalog";
import { eur } from "@/lib/money";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to="/product/$slug" params={{ slug: product.slug }} className="group flex flex-col">
      <div className="overflow-hidden bg-surface">
        <img
          src={product.image}
          alt={product.name}
          className="aspect-square w-full object-cover transition-transform duration-200 motion-reduce:transition-none group-hover:scale-[1.03]"
        />
      </div>
      <h3 className="mt-3 font-display text-lg leading-tight">{product.name}</h3>
      <p className="mt-1 flex flex-wrap items-baseline gap-2 text-sm">
        <span>{eur(product.price)}</span>
        {product.compareAt && (
          <span className="text-muted line-through">{eur(product.compareAt)}</span>
        )}
      </p>
      <p className="text-sm text-muted">
        {departmentOf(product) === "vintage"
          ? `${product.condition ?? "Second Hand"} · Lager 2–4 Tage`
          : `${product.ship[0]}–${product.ship[1]} Werktage`}
      </p>
    </Link>
  );
}
