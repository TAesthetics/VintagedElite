export const departments = [
  { id: "vintage", label: "Second Hand" },
  { id: "fitness", label: "Fitness" },
] as const;

export const categories = [
  { id: "hoodies", label: "Hoodies", dept: "vintage", image: "/catalog/zip-grau.jpg", blurb: "Zip und Pullover" },
  { id: "jacken", label: "Jacken", dept: "vintage", image: "/catalog/track.jpg", blurb: "Trainings- und College" },
  { id: "shirts", label: "Shirts", dept: "vintage", image: "/catalog/polo.jpg", blurb: "Polo und Overshirt" },
  { id: "hosen", label: "Hosen", dept: "vintage", image: "/catalog/chino.jpg", blurb: "Einzelstücke" },
  { id: "stangen", label: "Stangen", dept: "fitness", image: "/catalog/stange.jpg", blurb: "20 kg, scharfer Knurl" },
  { id: "scheiben", label: "Scheiben", dept: "fitness", image: "/catalog/bumper.jpg", blurb: "Bumper und Bruchteile" },
  { id: "racks", label: "Racks & Bänke", dept: "fitness", image: "/catalog/rack.jpg", blurb: "Stahl, zum Verschrauben" },
  { id: "support", label: "Gürtel & Sleeves", dept: "fitness", image: "/catalog/belt.jpg", blurb: "Für schwere Versuche" },
  { id: "schuhe", label: "Schuhe", dept: "fitness", image: "/catalog/squat-shoes.jpg", blurb: "Absatz und dünne Sohle" },
  { id: "zubehoer", label: "Zubehör", dept: "fitness", image: "/catalog/chalk.jpg", blurb: "Kreide, Straps, Clips" },
  { id: "supplements", label: "Supplements", dept: "fitness", image: "/catalog/creatin.jpg", blurb: "Pulver und Kapseln" },
  { id: "klamotten", label: "Klamotten", dept: "vintage", image: "/catalog/zip-grau.jpg", blurb: "Aus dem Atelier" },
] as const;

export const suppliers = [
  { id: "secondhand", label: "Second Hand" },
  { id: "haus", label: "Sortiment" },
] as const;

export const SORTS = ["empfohlen", "preis-auf", "preis-ab"] as const;

export type CategoryId = (typeof categories)[number]["id"];
export type SupplierId = (typeof suppliers)[number]["id"];
export type DepartmentId = (typeof departments)[number]["id"];
export type SortId = (typeof SORTS)[number];

export type ShopSearch = {
  q: string;
  dept: "alle" | DepartmentId;
  cat: "alle" | CategoryId;
  src: "alle" | SupplierId;
  sort: SortId;
};

export const EMPTY_SEARCH: ShopSearch = {
  q: "",
  dept: "alle",
  cat: "alle",
  src: "alle",
  sort: "empfohlen",
};

export type Variant = { id: string; label: string };

export type Product = {
  slug: string;
  name: string;
  category: CategoryId;
  supplier: SupplierId;
  department?: DepartmentId;
  unique?: boolean;
  condition?: string;
  price: number;
  compareAt?: number;
  ship: [number, number];
  freight: boolean;
  blurb: string;
  description: string;
  specs: { label: string; value: string }[];
  variants?: Variant[];
  variantTitle?: string;
  guide?: { title: string; rows: { size: string; fit: string }[] };
  image: string;
  featured?: boolean;
  proof?: { href: string; note: string };
};

const beltSizes = ["S", "M", "L", "XL"].map((id) => ({ id, label: id }));

const sleeveSizes = ["S", "M", "L", "XL"].map((id) => ({ id, label: id }));

const shoeSizes = Array.from({ length: 12 }, (_, index) => {
  const id = String(36 + index);
  return { id, label: `EU ${id}` };
});

const beltGuide = {
  title: "Leibesumfang auf Nabelhöhe, ausgeatmet",
  rows: [
    { size: "XS", fit: "60–70 cm" },
    { size: "S", fit: "71–81 cm" },
    { size: "M", fit: "82–92 cm" },
    { size: "L", fit: "93–103 cm" },
    { size: "XL", fit: "104–114 cm" },
    { size: "XXL", fit: "115–125 cm" },
    { size: "3XL", fit: "126–140 cm" },
  ],
};

const kneeGuide = {
  title: "Umfang über der Kniescheibe, Bein gestreckt",
  rows: [
    { size: "S", fit: "30–35 cm" },
    { size: "M", fit: "35–40 cm" },
    { size: "L", fit: "40–45 cm" },
    { size: "XL", fit: "45–52 cm" },
  ],
};

const elbowGuide = {
  title: "Umfang am gebeugten Ellbogen",
  rows: [
    { size: "S", fit: "22–26 cm" },
    { size: "M", fit: "26–30 cm" },
    { size: "L", fit: "30–34 cm" },
    { size: "XL", fit: "34–39 cm" },
  ],
};

export const products: Product[] = [
  {
    slug: "competition-bar",
    name: "Competition Bar 20 kg",
    category: "stangen",
    supplier: "haus",
    price: 28900,
    ship: [16, 30],
    freight: false,
    featured: true,
    image: "/catalog/stange.jpg",
    blurb: "29-mm-Schaft, Mittelknurl, Buchsen.",
    description:
      "Stange im Wettkampfmaß: 20 kg, 220 cm, 29 mm Schaft mit Mittelknurl. Die Rändelung trägt schwere Kreuzheben ohne Straps, die Hülsen laufen auf Buchsen. Kein Zertifikat. Schwere Sendung, per Spedition.",
    specs: [
      { label: "Gewicht", value: "20 kg" },
      { label: "Länge", value: "220 cm" },
      { label: "Schaft", value: "29 mm, Mittelknurl" },
      { label: "Hülse", value: "50 mm, Buchsen" },
      { label: "Zuglast", value: "bis 680 kg angegeben" },
    ],
  },
  {
    slug: "bumper-25",
    name: "Bumper 25 kg, Paar",
    category: "scheiben",
    supplier: "haus",
    price: 14900,
    ship: [16, 32],
    freight: true,
    image: "/catalog/bumper.jpg",
    blurb: "Paar, 450 mm, Bohrung 50,4 mm.",
    description:
      "Ein Paar 25-kg-Bumper. Durchmesser 450 mm, Bohrung 50,4 mm, Stahlkern. Kein Bruchscheiben-Satz und kein fertiges 140-kg-Set. Wegen des Gewichts per Spedition.",
    specs: [
      { label: "Stück", value: "2 × 25 kg" },
      { label: "Durchmesser", value: "450 mm" },
      { label: "Bohrung", value: "50,4 mm" },
      { label: "Material", value: "Gummi, Stahlkern" },
    ],
  },
  {
    slug: "lever-belt-13",
    name: "Lever Belt 13 mm",
    category: "support",
    supplier: "haus",
    price: 7900,
    ship: [16, 30],
    freight: false,
    featured: true,
    image: "/catalog/belt.jpg",
    blurb: "13 mm, Hebel, Größen S bis XL.",
    description:
      "13-mm-Gürtel mit Hebel. Größen S, M, L und XL. Für Kniebeuge und Kreuzheben.",
    specs: [
      { label: "Stärke", value: "13 mm" },
      { label: "Verschluss", value: "Hebel" },
      { label: "Größen", value: "S, M, L, XL" },
    ],
    variants: beltSizes,
    guide: beltGuide,
  },
  {
    slug: "power-rack",
    name: "Power Rack",
    category: "racks",
    supplier: "haus",
    price: 64900,
    ship: [20, 36],
    freight: true,
    featured: true,
    image: "/catalog/rack.jpg",
    blurb: "Vier Pfosten, J-Hooks, Safeties.",
    description:
      "Vierpfosten-Rack, pulverbeschichtet, Lochabstand 50 mm. J-Hooks und Safety-Spotter liegen bei, die Zugstange oben trägt Klimmzüge. Wird in Teilen geliefert und vor Ort verschraubt. Spedition bis zur Bordsteinkante.",
    specs: [
      { label: "Pfosten", value: "60 × 60 mm" },
      { label: "Lochung", value: "50 mm" },
      { label: "Außenmaße", value: "ca. 120 × 120 × 210 cm" },
      { label: "Angabe Traglast", value: "450 kg" },
      { label: "Lieferumfang", value: "Rack, J-Hooks, Safeties" },
    ],
  },
  {
    slug: "flat-bench",
    name: "Multi-Bank, verstellbar",
    category: "racks",
    supplier: "haus",
    price: 21900,
    ship: [18, 32],
    freight: true,
    image: "/catalog/bench.jpg",
    blurb: "Schwarz, mit Arm- und Beinablage.",
    description:
      "Verstellbare Bank, schwarz, mit Ablage für Arme und Beine. Kein einzelnes Flachbank-Polster. Kommt per Spedition.",
    specs: [
      { label: "Polster", value: "Schwarz" },
      { label: "Rahmen", value: "Stahl" },
      { label: "Aufbau", value: "Bank mit Ablagen" },
    ],
  },
  {
    slug: "kreatin-500",
    name: "Kreatin-Monohydrat, 500 g",
    category: "supplements",
    supplier: "haus",
    price: 1990,
    ship: [12, 24],
    freight: false,
    featured: true,
    image: "/catalog/creatin.jpg",
    blurb: "500 g, ohne Geschmack.",
    description:
      "Kreatin-Monohydrat als Pulver, 500 g, ohne Geschmack. Zum Einrühren. Nahrungsergänzungsmittel, kein Arzneimittel.",
    specs: [
      { label: "Menge", value: "500 g" },
      { label: "Form", value: "Pulver" },
      { label: "Geschmack", value: "ohne" },
      { label: "Stoff", value: "Kreatin-Monohydrat" },
    ],
  },
  {
    slug: "whey-1kg",
    name: "Whey-Konzentrat, 1 kg",
    category: "supplements",
    supplier: "haus",
    price: 3690,
    ship: [12, 24],
    freight: false,
    featured: true,
    image: "/catalog/whey.jpg",
    blurb: "1 kg Pulver, zum Anrühren.",
    description:
      "Molkenkonzentrat-Pulver, 1 kg, 80 %. Zum Anrühren, kein fertiger Shake. Nahrungsergänzungsmittel, kein Arzneimittel.",
    specs: [
      { label: "Menge", value: "1 kg" },
      { label: "Art", value: "Molkenkonzentrat" },
      { label: "Angabe", value: "80 %" },
      { label: "Form", value: "Pulver" },
    ],
  },
  {
    slug: "pre-workout-300",
    name: "Pre-Workout, 420 g",
    category: "supplements",
    supplier: "haus",
    price: 2790,
    ship: [12, 24],
    freight: false,
    featured: true,
    image: "/catalog/preworkout.jpg",
    blurb: "420 g, Blue Raspberry.",
    description:
      "Pre-Workout-Pulver, 420 g, 30 Portionen. Auf dem Etikett stehen L-Citrullin, L-Leucin, Beta-Alanin und 200 mg Koffein. Geschmack Blue Raspberry. Enthält Koffein. Nahrungsergänzungsmittel, kein Arzneimittel. Nicht für Kinder.",
    specs: [
      { label: "Menge", value: "420 g" },
      { label: "Portionen", value: "30" },
      { label: "Koffein", value: "200 mg" },
      { label: "Geschmack", value: "Blue Raspberry" },
    ],
  },
  {
    slug: "ashwagandha-60",
    name: "Ashwagandha, 60 Kapseln",
    category: "supplements",
    supplier: "haus",
    price: 1890,
    ship: [12, 24],
    freight: false,
    image: "/catalog/ashwagandha.jpg",
    blurb: "60 Kapseln, Wurzel.",
    description:
      "Ashwagandha-Kapseln, 60 Stück, aus der Wurzel. Nahrungsergänzungsmittel, kein Arzneimittel.",
    specs: [
      { label: "Menge", value: "60 Kapseln" },
      { label: "Form", value: "Kapsel" },
      { label: "Pflanze", value: "Ashwagandha, Wurzel" },
    ],
  },

];

export function isDepartmentFilter(value: unknown): value is ShopSearch["dept"] {
  return value === "alle" || departments.some((department) => department.id === value);
}

export function isCategoryFilter(value: unknown): value is ShopSearch["cat"] {
  return value === "alle" || categories.some((category) => category.id === value);
}

export function isSupplierFilter(value: unknown): value is ShopSearch["src"] {
  return value === "alle" || suppliers.some((supplier) => supplier.id === value);
}

export function isSort(value: unknown): value is SortId {
  return typeof value === "string" && (SORTS as readonly string[]).includes(value);
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function categoryOf(id: CategoryId) {
  return categories.find((category) => category.id === id)!;
}

export function supplierLabel(id: SupplierId) {
  return suppliers.find((supplier) => supplier.id === id)!.label;
}

export function sourceCopy(id: SupplierId) {
  if (id === "secondhand") {
    return "Second Hand aus dem eigenen Lager. Ein Stück, kein Nachschub. Versand in 2–4 Werktagen.";
  }
  return "Versand in der angegebenen Zeit. Großes Gerät geht per Spedition bis zur Bordsteinkante.";
}

export function departmentOf(product: Product): DepartmentId {
  return product.department ?? "fitness";
}

export function categoriesFor(dept: ShopSearch["dept"]) {
  return categories.filter((category) => dept === "alle" || category.dept === dept);
}

export function defaultVariant(product: Product) {
  if (!product.variants?.length) return "";
  return (
    product.variants.find((variant) => variant.id === "M")?.id ??
    product.variants.find((variant) => variant.id === "42")?.id ??
    product.variants[0].id
  );
}

export function filterProducts(search: ShopSearch, extra: Product[] = []) {
  const query = search.q.trim().toLowerCase();
  const pool = extra.length ? [...extra, ...products] : products;
  let list = pool.filter((product) => {
    if (search.dept !== "alle" && departmentOf(product) !== search.dept) return false;
    if (search.cat !== "alle" && product.category !== search.cat) return false;
    if (search.src !== "alle" && product.supplier !== search.src) return false;
    if (!query) return true;
    const hay = `${product.name} ${product.blurb} ${product.description} ${supplierLabel(product.supplier)}`.toLowerCase();
    return hay.includes(query);
  });
  if (search.sort === "preis-auf") list = [...list].sort((a, b) => a.price - b.price);
  if (search.sort === "preis-ab") list = [...list].sort((a, b) => b.price - a.price);
  return list;
}

export function relatedProducts(product: Product) {
  const same = products.filter(
    (item) => item.category === product.category && item.slug !== product.slug,
  );
  const rest = products.filter(
    (item) => item.slug !== product.slug && !same.includes(item),
  );
  return [...same, ...rest].slice(0, 3);
}

export function countInCategory(id: CategoryId) {
  return products.filter((product) => product.category === id).length;
}

export function listedCategories(dept: ShopSearch["dept"] = "alle") {
  return categories.filter((category) => {
    if (dept !== "alle" && category.dept !== dept) return false;
    if (category.id === "klamotten") return true;
    return countInCategory(category.id) > 0;
  });
}
