import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { getSql } from "@/lib/db";
import { clothingId, clothingProduct, type ClothingRow } from "@/lib/clothing";

export const ATELIER_EMAIL = "atelier@vintagedelite.shop";
const ATELIER_PASSWORD = process.env.ATELIER_PASSWORD;

let seeded: Promise<void> | null = null;

export function ensureAtelierAdmin() {
  seeded ??= seedAtelierAdmin().catch((error) => {
    seeded = null;
    throw error;
  });
  return seeded;
}

async function seedAtelierAdmin() {
  const sql = await getSql();
  const existing = await sql<{ id: string }>`select id from "user" where email = ${ATELIER_EMAIL}`;
  let userId = existing[0]?.id;
  if (!userId) {
    if (!ATELIER_PASSWORD) return;
    userId = randomUUID();
    const hash = await hashPassword(ATELIER_PASSWORD);
    const now = new Date().toISOString();
    await sql`insert into "user" ("id", "name", "email", "emailVerified", "createdAt", "updatedAt")
      values (${userId}, ${"VintageElite"}, ${ATELIER_EMAIL}, ${true}, ${now}, ${now})`;
    await sql`insert into "account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
      values (${randomUUID()}, ${userId}, ${"credential"}, ${userId}, ${hash}, ${now}, ${now})`;
  }
  await sql`delete from shop_admins where user_id <> ${userId}`;
  await sql`insert into shop_admins (user_id) values (${userId}) on conflict (user_id) do nothing`;
}

export async function listClothingRows() {
  await ensureAtelierAdmin();
  const sql = await getSql();
  return sql<ClothingRow>`select id, title, price_cents from clothing order by id desc`;
}

export async function clothingBySlug(slug: string) {
  const id = clothingId(slug);
  if (!id) return undefined;
  const sql = await getSql();
  const rows = await sql<ClothingRow>`select id, title, price_cents from clothing where id = ${id}`;
  const row = rows[0];
  return row ? clothingProduct(row) : undefined;
}

export async function isAdmin(userId: string) {
  await ensureAtelierAdmin();
  const sql = await getSql();
  const rows = await sql<{ user_id: string }>`select user_id from shop_admins where user_id = ${userId}`;
  return rows.length > 0;
}

export async function claimAdminRow(userId: string) {
  return isAdmin(userId);
}

export async function insertClothing(userId: string, title: string, priceCents: number, image: string) {
  const sql = await getSql();
  const rows = await sql<{ id: number }>`insert into clothing (user_id, title, price_cents, image)
    values (${userId}, ${title}, ${priceCents}, ${image})
    returning id`;
  return rows[0]?.id ?? 0;
}

export async function deleteOwnClothing(userId: string, id: number) {
  const sql = await getSql();
  const rows = await sql<{ id: number }>`delete from clothing where id = ${id} and user_id = ${userId} returning id`;
  return rows.length > 0;
}

export async function clothingImage(id: number) {
  const sql = await getSql();
  const rows = await sql<{ image: string }>`select image from clothing where id = ${id}`;
  return rows[0]?.image ?? null;
}
