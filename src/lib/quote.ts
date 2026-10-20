import type { Product } from "@/data/catalog";

export type QuoteItem = {
  product: Product;
  qty: number;
  variantLabel: string;
};

export type Quote = {
  goods: number;
  shipping: number;
  total: number;
  label: string;
  note: string;
  from: number;
  to: number;
};

export function quote(items: QuoteItem[], country: string): Quote {
  const goods = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  if (items.length === 0) {
    return { goods: 0, shipping: 0, total: 0, label: "—", note: "", from: 0, to: 0 };
  }

  const heavy = items.some((item) => item.product.freight);
  const swiss = country === "CH";
  let shipping = 0;
  let label = "Paket";
  let note = "Mit Sendungsverfolgung.";

  if (heavy) {
    shipping = swiss ? 8900 : 4900;
    label = swiss ? "Spedition, Schweiz" : "Spedition";
    note = swiss
      ? "Bis Bordsteinkante. Zoll kann extra anfallen."
      : "Eine Spedition pro Bestellung, bis zur Bordsteinkante.";
  } else if (goods >= 14900 && !swiss) {
    shipping = 0;
    label = "Paket, frei";
    note = "Ab 149 € Warenwert in der EU.";
  } else if (swiss) {
    shipping = 1890;
    label = "Paket, Schweiz";
    note = "Zoll kann zusätzlich anfallen.";
  } else {
    shipping = 690;
  }

  return {
    goods,
    shipping,
    total: goods + shipping,
    label,
    note,
    from: Math.max(...items.map((item) => item.product.ship[0])),
    to: Math.max(...items.map((item) => item.product.ship[1])),
  };
}
