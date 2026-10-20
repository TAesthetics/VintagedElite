import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { countInCategory, EMPTY_SEARCH, listedCategories, products, type CategoryId } from "@/data/catalog";
import { ProductCard } from "@/components/product-card";
import { clothingProduct, rememberProducts } from "@/lib/clothing";
import { listClothing } from "@/lib/clothing.functions";
import { getBearerToken } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { adminDesk } from "@/lib/orders.functions";
import { eur } from "@/lib/money";
import { homeLd, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "Second Hand Mode und Powerlifting",
      description:
        "Powerlifting-Equipment und Supplements von VintageElite. Second Hand nur als Atelier-Stück.",
      path: "/",
      jsonLd: [homeLd()],
    }),
  component: Home,
  loader: async () => {
    try {
      return await listClothing();
    } catch {
      return [];
    }
  },
});

function Home() {
  const uploaded = Route.useLoaderData().map(clothingProduct);
  rememberProducts(uploaded);
  const faces = listedCategories();

  return (
    <div>
      <AdminDesk />
      <section className="grid lg:min-h-[78vh] lg:grid-cols-12">
        <div className="order-2 flex flex-col justify-between px-5 py-10 lg:order-1 lg:col-span-5 lg:py-14 lg:pr-12">
          <p className="text-xs tracking-widest text-brass uppercase">VintageElite</p>
          <div>
            <h1 className="mt-6 font-display text-5xl leading-none md:text-6xl">
              Eisen im Haus.
              <br />
              Klamotten, wenn sie da sind.
            </h1>
            <p className="mt-5 max-w-md text-muted">
              Stange, Bumper, Rack, Bank, Gürtel und Pulver: Kreatin, Whey, Pre-Workout, Ashwagandha.
              Second Hand nur als einzelnes Stück aus dem Atelier.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                search={{ ...EMPTY_SEARCH, dept: "fitness" }}
                className="inline-flex min-h-11 items-center bg-ink px-5 text-sm text-paper"
              >
                Fitness
              </Link>
              <Link
                to="/shop"
                search={{ ...EMPTY_SEARCH, dept: "vintage", cat: "klamotten" }}
                className="inline-flex min-h-11 items-center border border-ink px-5 text-sm"
              >
                Klamotten
              </Link>
            </div>
          </div>
          <p className="mt-10 text-sm text-muted">Paket oder Spedition · Atelier in 2–4 Tagen, sobald ein Stück liegt</p>
        </div>
        <div className="order-1 grid grid-cols-2 lg:order-2 lg:col-span-7">
          <Link
            to="/shop"
            search={{ ...EMPTY_SEARCH, dept: "fitness", cat: "stangen" }}
            className="relative block min-h-64"
          >
            <img src="/catalog/stange.jpg" alt="Competition Bar 20 kg" className="h-full min-h-64 w-full object-cover lg:min-h-[78vh]" />
            <span className="absolute bottom-4 left-4 bg-paper px-3 py-1.5 text-sm">Stangen</span>
          </Link>
          <Link
            to="/shop"
            search={{ ...EMPTY_SEARCH, dept: "fitness", cat: "racks" }}
            className="relative block min-h-64"
          >
            <img src="/catalog/rack.jpg" alt="Power Rack" className="h-full min-h-64 w-full object-cover lg:min-h-[78vh]" />
            <span className="absolute bottom-4 left-4 bg-paper px-3 py-1.5 text-sm">Racks</span>
          </Link>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="text-xs tracking-widest text-brass uppercase">Fächer</p>
          <h2 className="mt-2 font-display text-4xl">Was wirklich im Sortiment liegt.</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {faces.map((category) => (
              <CategoryTile
                key={category.id}
                category={category}
                count={category.id === "klamotten" ? uploaded.length : countInCategory(category.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {uploaded.length > 0 && (
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl">Aus dem Atelier</h2>
              <Link
                to="/shop"
                search={{ ...EMPTY_SEARCH, dept: "vintage", cat: "klamotten" }}
                className="text-sm text-muted"
              >
                Alle Klamotten
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {uploaded.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl">Im Regal</h2>
            <Link to="/shop" search={{ ...EMPTY_SEARCH, dept: "fitness" }} className="text-sm text-muted">
              Ganzes Eisen
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function AdminDesk() {
  const { user } = useCurrentUserState();
  const real = Boolean(user && !user.isDevFallback);
  const [token, setToken] = useState(false);
  const [desk, setDesk] = useState<{
    admin: boolean;
    orders: {
      id: string;
      createdAt: string;
      status: "offen" | "bezahlt";
      name: string;
      email: string;
      street: string;
      zip: string;
      city: string;
      country: string;
      note: string;
      lines: { name: string; qty: number }[];
      total: number;
    }[];
  } | null>(null);

  useEffect(() => {
    setToken(Boolean(getBearerToken()));
  }, []);

  const signedIn = real || token;

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    adminDesk()
      .then((row) => {
        if (!cancelled) setDesk(row);
      })
      .catch(() => {
        if (!cancelled) setDesk({ admin: false, orders: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  if (!desk?.admin) return null;

  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-xs tracking-widest text-brass uppercase">Atelier</p>
        <h2 className="mt-2 font-display text-3xl">Bestellungen</h2>
        {desk.orders.length === 0 ? (
          <p className="mt-4 text-muted">Noch keine Bestellung. Sie erscheint, sobald jemand zur Kasse geht.</p>
        ) : (
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {desk.orders.map((order) => (
              <li key={order.id} className="grid gap-2 py-4 md:grid-cols-[8rem_6rem_1fr_auto] md:items-start">
                <p className="text-sm text-muted">
                  {new Date(order.createdAt).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
                </p>
                <p className="text-sm">{order.status === "bezahlt" ? "Bezahlt" : "Offen"}</p>
                <div>
                  <p>
                    {order.name} · {order.email}
                  </p>
                  <p className="text-sm text-muted">
                    {order.street}, {order.zip} {order.city}, {order.country}
                  </p>
                  <p className="mt-1 text-sm">
                    {order.lines.map((line) => `${line.qty}× ${line.name}`).join(", ")}
                  </p>
                  {order.note && <p className="text-sm text-muted">{order.note}</p>}
                </div>
                <p className="text-sm">{eur(order.total)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function CategoryTile({
  category,
  count,
}: {
  category: { id: CategoryId; label: string; dept: "vintage" | "fitness"; image: string; blurb: string };
  count: number;
}) {
  const empty = count === 0;
  return (
    <Link
      to="/shop"
      search={{ ...EMPTY_SEARCH, dept: category.dept, cat: category.id }}
      className="group relative block overflow-hidden bg-ink"
    >
      {empty ? (
        <span className="flex aspect-[3/4] flex-col justify-end p-4 text-paper">
          <span className="text-[10px] tracking-[0.18em] text-brass uppercase">Atelier</span>
          <span className="mt-2 font-display text-3xl leading-none">{category.label}</span>
          <span className="mt-2 text-sm text-paper/75">Noch keine Stücke.</span>
        </span>
      ) : (
        <>
          <img
            src={category.image}
            alt=""
            className="aspect-[3/4] w-full object-cover transition duration-300 group-hover:scale-105 motion-reduce:transition-none"
          />
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/45 to-transparent px-3 pt-16 pb-3 text-paper">
            <span className="block text-[10px] tracking-[0.18em] text-brass uppercase">
              {category.dept === "vintage" ? "Second Hand" : "Fitness"}
            </span>
            <span className="mt-1 block font-display text-2xl leading-none">{category.label}</span>
            <span className="mt-1 block text-xs text-paper/80">
              {category.blurb} · {count}
            </span>
          </span>
        </>
      )}
    </Link>
  );
}