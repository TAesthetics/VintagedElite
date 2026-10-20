import { createFileRoute, Link, redirect, stripSearchParams, useNavigate } from "@tanstack/react-router";
import { Crumbs } from "@/components/crumbs";
import { PageIntro } from "@/components/shell";
import { ProductCard } from "@/components/product-card";
import {
  categories,
  departments,
  EMPTY_SEARCH,
  filterProducts,
  isCategoryFilter,
  isDepartmentFilter,
  isSort,
  isSupplierFilter,
  listedCategories,
  type ShopSearch,
} from "@/data/catalog";
import { clothingProduct, rememberProducts } from "@/lib/clothing";
import { listClothing } from "@/lib/clothing.functions";
import { crumbLd, itemListLd, pageHead, shopLanding } from "@/lib/seo";

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search.q === "string" ? search.q : "",
    dept: isDepartmentFilter(search.dept) ? search.dept : "alle",
    cat: isCategoryFilter(search.cat) ? search.cat : "alle",
    src: isSupplierFilter(search.src) ? search.src : "alle",
    sort: isSort(search.sort) ? search.sort : "empfohlen",
  }),
  search: {
    middlewares: [stripSearchParams(EMPTY_SEARCH)],
  },
  beforeLoad: ({ search }) => {
    if (search.cat === "alle" || search.q || search.src !== "alle" || search.sort !== "empfohlen") return;
    const category = categories.find((item) => item.id === search.cat);
    if (!category || search.dept === category.dept) return;
    if (search.dept !== "alle") return;
    throw redirect({
      to: "/shop",
      search: { ...EMPTY_SEARCH, dept: category.dept, cat: category.id },
    });
  },
  loader: () => listClothing(),
  head: async ({ match }) => {
    const landing = shopLanding(match.search);
    const extra = (await listClothing()).map(clothingProduct);
    return pageHead({
      title: landing.title,
      description: landing.description,
      path: landing.path,
      index: landing.index,
      jsonLd: [crumbLd(landing.crumbs), ...(landing.index ? [itemListLd(match.search, extra)] : [])],
    });
  },
  component: ShopPage,
});

function ShopPage() {
  const search = Route.useSearch();
  const uploaded = Route.useLoaderData().map(clothingProduct);
  rememberProducts(uploaded);
  const navigate = useNavigate({ from: "/shop" });
  const list = filterProducts(search, uploaded);
  const filtered =
    search.q !== "" ||
    search.dept !== "alle" ||
    search.cat !== "alle" ||
    search.src !== "alle" ||
    search.sort !== "empfohlen";
  const visibleCategories = listedCategories(search.dept);

  function patch(next: Partial<ShopSearch>) {
    void navigate({ search: { ...search, ...next }, replace: true });
  }

  const landing = shopLanding(search);

  return (
    <div className="pb-16">
      <div className="mx-auto max-w-6xl px-5 pt-8">
        <Crumbs items={landing.crumbs} />
      </div>
      <PageIntro kicker="Sortiment" title={landing.h1} text={landing.text} flush />
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col gap-4 border-y border-line py-4">
          <label className="block">
            <span className="sr-only">Suche</span>
            <input
              value={search.q}
              onChange={(event) => patch({ q: event.target.value })}
              placeholder="Hoodie, Gürtel, Rack…"
              className="w-full"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto">
            <ChipLink
              on={search.dept === "alle"}
              search={EMPTY_SEARCH}
            >
              Beides
            </ChipLink>
            {departments.map((department) => (
              <ChipLink
                key={department.id}
                on={search.dept === department.id}
                search={{ ...EMPTY_SEARCH, dept: department.id }}
              >
                {department.label}
              </ChipLink>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <ChipLink
              on={search.cat === "alle"}
              search={{ ...EMPTY_SEARCH, dept: search.dept }}
            >
              Alle Fächer
            </ChipLink>
            {visibleCategories.map((category) => (
              <ChipLink
                key={category.id}
                on={search.cat === category.id}
                search={{ ...EMPTY_SEARCH, dept: category.dept, cat: category.id }}
              >
                {category.label}
              </ChipLink>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="ml-auto flex items-center gap-2 text-sm text-muted">
              <span className="sr-only">Sortierung</span>
              <select
                value={search.sort}
                onChange={(event) => patch({ sort: isSort(event.target.value) ? event.target.value : "empfohlen" })}
              >
                <option value="empfohlen">Empfohlen</option>
                <option value="preis-auf">Preis aufsteigend</option>
                <option value="preis-ab">Preis absteigend</option>
              </select>
            </label>
          </div>
        </div>
        <p className="mt-6 text-sm text-muted">
          {list.length} {list.length === 1 ? "Stück" : "Stücke"}
          {filtered && (
            <button type="button" className="ml-3 underline" onClick={() => patch(EMPTY_SEARCH)}>
              Filter zurücksetzen
            </button>
          )}
        </p>
        {list.length === 0 ? (
          <p className="mt-10 max-w-md font-display text-3xl">
            {search.cat === "klamotten" || search.dept === "vintage"
              ? "Noch keine Klamotten. Nur echte Stücke aus dem Atelier."
              : "Nichts unter diesem Schnitt."}
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
            {list.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChipLink({
  on,
  search,
  children,
}: {
  on: boolean;
  search: ShopSearch;
  children: string;
}) {
  return (
    <Link
      to="/shop"
      search={search}
      aria-current={on ? "page" : undefined}
      className={`inline-flex min-h-11 shrink-0 items-center border px-3 text-sm ${
        on ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
