import {
  categories,
  categoryOf,
  departmentOf,
  departments,
  EMPTY_SEARCH,
  filterProducts,
  listedCategories,
  products,
  type CategoryId,
  type Product,
  type ShopSearch,
} from "@/data/catalog";
import { eur } from "@/lib/money";

export const SITE = "https://vintagedelite.shop";
export const SITE_NAME = "VintageElite";

const CATEGORY_H1: Record<CategoryId, string> = {
  hoodies: "Second Hand Hoodies",
  jacken: "Second Hand Jacken",
  shirts: "Second Hand Shirts",
  hosen: "Second Hand Hosen",
  stangen: "Powerlifting-Stangen",
  scheiben: "Hantelscheiben",
  racks: "Racks und Bänke",
  support: "Gürtel und Sleeves",
  schuhe: "Kraftsportschuhe",
  zubehoer: "Kraftsport-Zubehör",
  supplements: "Supplements",
  klamotten: "Klamotten aus dem Atelier",
};

const CATEGORY_COPY: Record<CategoryId, string> = {
  hoodies:
    "Getragene Zip-Hoodies und Pullover. Ein Exemplar pro Stück, die Größe steht am Teil, Versand aus dem Lager in 2–4 Werktagen.",
  jacken:
    "Second-Hand-Jacken, Trainings- und College-Schnitte. Kein Nachschub: ist das Stück weg, ist es weg.",
  shirts: "Getragene Polos und Overshirts. Einzelstücke, der Zustand steht auf der Produktseite.",
  hosen: "Second-Hand-Hosen, jedes Paar nur einmal. Versand aus dem Atelier.",
  stangen: "Powerlifting-Stangen mit 20 kg. Schwere Ware geht per Spedition.",
  scheiben: "Bumper-Platten und Bruchscheiben. Paket oder Spedition, je nach Gewicht der Bestellung.",
  racks: "Power Racks und Bänke aus Stahl, Spedition bis zur Bordsteinkante.",
  support: "13-mm-Hebelgürtel für Kniebeuge und Kreuzheben.",
  schuhe: "Schuhe mit Absatz für die Kniebeuge und dünne Sohle fürs Kreuzheben.",
  zubehoer: "Kreide, Straps, Clips und Dip Belt. Kleinteile im Paket, meist 10–22 Werktage.",
  supplements:
    "Kreatin 500 g, Whey 1 kg, Pre-Workout 420 g und Ashwagandha-Kapseln.",
  klamotten: "Second-Hand-Klamotten aus dem Atelier. Jedes Stück einmal, Foto und Preis stehen am Artikel.",
};

export type SeoCrumb = {
  label: string;
  path: string;
  to?: "/" | "/shop";
  search?: ShopSearch;
};

export function abs(path: string) {
  return `${SITE}${path.startsWith("/") ? path : `/${path}`}`;
}

export function shopPath(partial: Partial<ShopSearch> = {}) {
  const params = new URLSearchParams();
  if (partial.dept && partial.dept !== "alle") params.set("dept", partial.dept);
  if (partial.cat && partial.cat !== "alle") params.set("cat", partial.cat);
  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}

function titled(lead: string) {
  return lead.includes(SITE_NAME) ? lead : `${lead} | ${SITE_NAME}`;
}

function clip(text: string, max = 158) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function pageHead(opts: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  jsonLd?: unknown[];
}) {
  const href = abs(opts.path);
  const jsonLd = (opts.jsonLd ?? []).map((data) => ({
    type: "application/ld+json",
    children: JSON.stringify(data).replaceAll("<", "\\u003c"),
  }));
  return {
    meta: [
      { title: titled(opts.title) },
      { name: "description", content: clip(opts.description) },
      {
        name: "robots",
        content:
          opts.index === false ? "noindex, follow" : "index, follow, max-image-preview:large",
      },
    ],
    links: [
      { rel: "canonical", href },
      { rel: "alternate", hrefLang: "de", href },
      { rel: "alternate", hrefLang: "x-default", href },
    ],
    scripts: jsonLd,
  };
}

export function crumbLd(items: { label: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: abs(item.path),
    })),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

function priceValue(cents: number) {
  return (cents / 100).toFixed(2);
}

export function organizationLd() {
  return {
    "@type": "OnlineStore",
    "@id": `${SITE}/#shop`,
    name: SITE_NAME,
    url: SITE,
    email: "hallo@vintagedelite.shop",
    logo: abs("/logo.svg"),
    image: abs("/og.jpg"),
    inLanguage: "de",
    sameAs: ["https://www.tiktok.com/@vintagedelite"],
    description:
      "Second-Hand-Mode aus dem Atelier und Powerlifting-Equipment von VintageElite.",
  };
}

export function homeLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationLd(),
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        name: SITE_NAME,
        url: SITE,
        inLanguage: "de",
        publisher: { "@id": `${SITE}/#shop` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE}/shop?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export function shopLanding(search: ShopSearch) {
  const query = search.q.trim();
  const thin = query !== "" || search.sort !== "empfohlen" || search.src !== "alle";
  const category = search.cat === "alle" ? undefined : categories.find((item) => item.id === search.cat);
  const mismatch = Boolean(category && search.dept !== "alle" && category.dept !== search.dept);

  const crumbs: SeoCrumb[] = [
    { label: "Start", path: "/", to: "/" },
    { label: "Sortiment", path: "/shop", to: "/shop", search: EMPTY_SEARCH },
  ];

  let title = "Second Hand Mode und Powerlifting";
  let description =
    "Sortiment von VintageElite: getragene Mode, jedes Teil einmal, und Fitness-Equipment.";
  let h1 = "Zwei Häuser, ein Korb.";
  let text =
    "Second Hand ist gebrauchte Mode, jedes Teil nur einmal. Fitness und Supplements liegen im Sortiment.";
  let path = "/shop";

  if (category && !mismatch) {
    const department = departments.find((item) => item.id === category.dept)!;
    path = shopPath({ dept: category.dept, cat: category.id });
    title = CATEGORY_H1[category.id];
    h1 = title;
    description = CATEGORY_COPY[category.id];
    text = description;
    crumbs.push({
      label: department.label,
      path: shopPath({ dept: category.dept }),
      to: "/shop",
      search: { ...EMPTY_SEARCH, dept: category.dept },
    });
    crumbs.push({ label: category.label, path });
  } else if (search.dept === "vintage") {
    path = shopPath({ dept: "vintage" });
    title = "Second Hand Mode";
    h1 = title;
    description =
      "Second Hand bei VintageElite: gebrauchte Hoodies, Jacken, Shirts und Hosen. Ein Exemplar, Versand aus dem Lager in 2–4 Werktagen.";
    text = description;
    crumbs.push({ label: "Second Hand", path, to: "/shop", search: { ...EMPTY_SEARCH, dept: "vintage" } });
  } else if (search.dept === "fitness") {
    path = shopPath({ dept: "fitness" });
    title = "Powerlifting Equipment";
    h1 = title;
    description =
      "Powerlifting-Equipment bei VintageElite: Stangen, Scheiben, Racks, Gürtel und Supplements.";
    text = description;
    crumbs.push({ label: "Fitness", path, to: "/shop", search: { ...EMPTY_SEARCH, dept: "fitness" } });
  }

  return {
    title,
    description,
    h1,
    text,
    path,
    index: !thin && !mismatch,
    crumbs,
  };
}

export function itemListLd(search: ShopSearch, extra: Product[] = []) {
  const list = filterProducts({ ...search, q: "", src: "alle", sort: "empfohlen" }, extra);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: list.length,
    itemListElement: list.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: abs(`/product/${product.slug}`),
      name: product.name,
    })),
  };
}

export function productLanding(product: Product) {
  const category = categoryOf(product.category);
  const vintage = departmentOf(product) === "vintage";
  const path = `/product/${product.slug}`;
  const crumbs: SeoCrumb[] = [
    { label: "Start", path: "/", to: "/" },
    { label: "Sortiment", path: "/shop", to: "/shop", search: EMPTY_SEARCH },
    {
      label: vintage ? "Second Hand" : "Fitness",
      path: shopPath({ dept: vintage ? "vintage" : "fitness" }),
      to: "/shop",
      search: { ...EMPTY_SEARCH, dept: vintage ? "vintage" : "fitness" },
    },
    {
      label: category.label,
      path: shopPath({ dept: category.dept, cat: category.id }),
      to: "/shop",
      search: { ...EMPTY_SEARCH, dept: category.dept, cat: category.id },
    },
    { label: product.name, path },
  ];
  const via = vintage ? "Second Hand aus dem Atelier" : "VintageElite";
  return {
    title: product.name,
    description: `${product.name}: ${product.blurb} ${eur(product.price)}. ${via}.`,
    path,
    crumbs,
  };
}

export function productLd(product: Product) {
  const landing = productLanding(product);
  const vintage = departmentOf(product) === "vintage";
  const offer: Record<string, unknown> = {
    "@type": "Offer",
    url: abs(landing.path),
    priceCurrency: "EUR",
    price: priceValue(product.price),
    availability: "https://schema.org/InStock",
    itemCondition: vintage
      ? "https://schema.org/UsedCondition"
      : "https://schema.org/NewCondition",
    seller: { "@id": `${SITE}/#shop` },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        value: product.freight ? "49.00" : "6.90",
        currency: "EUR",
      },
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "DE" },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        transitTime: {
          "@type": "QuantitativeValue",
          minValue: product.ship[0],
          maxValue: product.ship[1],
          unitCode: "DAY",
        },
      },
    },
  };
  if (product.freight) {
    offer.hasMerchantReturnPolicy = {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "DE",
      returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
    };
  } else {
    offer.hasMerchantReturnPolicy = {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "DE",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: vintage ? 14 : 30,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
    };
  }
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: abs(product.image),
    sku: product.slug,
    category: categoryOf(product.category).label,
    brand: { "@type": "Brand", "name": SITE_NAME },
    offers: offer,
  };
}

export function sitemapXml() {
  const urls: { loc: string; priority: string }[] = [
    { loc: abs("/"), priority: "1.0" },
    { loc: abs("/shop"), priority: "0.9" },
    { loc: abs(shopPath({ dept: "vintage" })), priority: "0.8" },
    { loc: abs(shopPath({ dept: "fitness" })), priority: "0.8" },
    ...listedCategories().map((category) => ({
      loc: abs(shopPath({ dept: category.dept, cat: category.id })),
      priority: "0.7",
    })),
    ...products.map((product) => ({
      loc: abs(`/product/${product.slug}`),
      priority: "0.8",
    })),
    { loc: abs("/versand"), priority: "0.4" },
    { loc: abs("/ueber"), priority: "0.4" },
    { loc: abs("/impressum"), priority: "0.2" },
  ];
  const body = urls
    .map(
      (url) =>
        `  <url><loc>${url.loc.replaceAll("&", "&")}</loc><priority>${url.priority}</priority></url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}
