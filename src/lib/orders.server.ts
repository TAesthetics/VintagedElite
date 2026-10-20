import { getSql } from "@/lib/db";

export type StoredLine = { name: string; qty: number; price: number };

export type ShopOrder = {
  id: string;
  createdAt: string;
  status: "offen" | "bezahlt";
  name: string;
  email: string;
  phone: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  note: string;
  lines: StoredLine[];
  goods: number;
  shipping: number;
  total: number;
};

type Row = {
  id: string;
  created_at: string | Date;
  status: string;
  name: string;
  email: string;
  phone: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  note: string;
  lines: string;
  goods: number;
  shipping: number;
  total: number;
};

function asOrder(row: Row): ShopOrder {
  let lines: StoredLine[] = [];
  try {
    const parsed: unknown = JSON.parse(row.lines);
    if (Array.isArray(parsed)) lines = parsed as StoredLine[];
  } catch {
    lines = [];
  }
  return {
    id: row.id,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    status: row.status === "bezahlt" ? "bezahlt" : "offen",
    name: row.name,
    email: row.email,
    phone: row.phone,
    street: row.street,
    zip: row.zip,
    city: row.city,
    country: row.country,
    note: row.note,
    lines,
    goods: row.goods,
    shipping: row.shipping,
    total: row.total,
  };
}

export async function recordCheckout(order: Omit<ShopOrder, "createdAt" | "status">) {
  const sql = await getSql();
  await sql`insert into shop_orders (
      id, status, name, email, phone, street, zip, city, country, note, lines, goods, shipping, total
    ) values (
      ${order.id},
      ${"offen"},
      ${order.name},
      ${order.email},
      ${order.phone},
      ${order.street},
      ${order.zip},
      ${order.city},
      ${order.country},
      ${order.note},
      ${JSON.stringify(order.lines)},
      ${order.goods},
      ${order.shipping},
      ${order.total}
    ) on conflict (id) do nothing`;
}

export async function markOrderPaid(id: string) {
  const sql = await getSql();
  await sql`update shop_orders set status = 'bezahlt' where id = ${id}`;
}

export async function listShopOrders() {
  const sql = await getSql();
  const rows = await sql<Row>`select id, created_at, status, name, email, phone, street, zip, city, country, note, lines, goods, shipping, total
    from shop_orders order by created_at desc limit 50`;
  return rows.map(asOrder);
}
