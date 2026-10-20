import { getProduct, type Product } from "@/data/catalog";

export type ClothingRow = {
  id: number;
  title: string;
  price_cents: number;
};

export function clothingSlug(id: number) {
  return `stueck-${id}`;
}

export function clothingId(slug: string) {
  const match = /^stueck-(\d+)$/.exec(slug);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function clothingProduct(row: ClothingRow): Product {
  return {
    slug: clothingSlug(row.id),
    name: row.title,
    category: "klamotten",
    supplier: "secondhand",
    department: "vintage",
    unique: true,
    condition: "Second Hand",
    price: row.price_cents,
    ship: [2, 4],
    freight: false,
    blurb: "Einzelstück aus dem Atelier.",
    description: `${row.title}. Second Hand, ein Exemplar. Versand aus dem Lager in 2–4 Werktagen.`,
    specs: [
      { label: "Art", value: "Einzelstück" },
      { label: "Herkunft", value: "Atelier" },
    ],
    image: `/api/clothing/${row.id}`,
  };
}

const live = new Map<string, Product>();

export function rememberProducts(list: Product[]) {
  for (const product of list) live.set(product.slug, product);
}

export function lookupProduct(slug: string) {
  return getProduct(slug) ?? live.get(slug);
}
