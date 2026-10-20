export type PayMethod = "vorkasse" | "karte" | "paypal";

export type OrderLine = {
  slug: string;
  name: string;
  variantLabel: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  pay: PayMethod;
  note: string;
  lines: OrderLine[];
  goods: number;
  shipping: number;
  shippingLabel: string;
  window: string;
  total: number;
};

const KEY = "vdl-orders";

export function readOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch {
    return [];
  }
}

export function saveOrder(order: Order) {
  const all = readOrders();
  all.unshift(order);
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 30)));
}

export function findOrder(id: string) {
  return readOrders().find((order) => order.id === id) ?? null;
}

export function newOrderId() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `VD-${n}`;
}
