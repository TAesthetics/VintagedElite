import { Link } from "@tanstack/react-router";
import { EMPTY_SEARCH } from "@/data/catalog";
import type { SeoCrumb } from "@/lib/seo";

export function Crumbs({ items }: { items: SeoCrumb[] }) {
  return (
    <nav aria-label="Brotkrumen" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.path}-${item.label}`} className="inline-flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {last || !item.to ? (
                <span className="text-ink">{item.label}</span>
              ) : item.to === "/" ? (
                <Link to="/" className="hover:text-ink">
                  {item.label}
                </Link>
              ) : (
                <Link to="/shop" search={item.search ?? EMPTY_SEARCH} className="hover:text-ink">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
