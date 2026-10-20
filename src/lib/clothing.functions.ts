import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type { ClothingRow } from "@/lib/clothing";

export const clothingProductBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data }) => {
    const { clothingBySlug } = await import("./clothing.server");
    return (await clothingBySlug(data)) ?? null;
  });

export const listClothing = createServerFn({ method: "GET" }).handler(async () => {
  const { listClothingRows } = await import("./clothing.server");
  return listClothingRows();
});

export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { claimAdminRow } = await import("./clothing.server");
    const admin = await claimAdminRow(context.userId);
    return { admin };
  });

export const adminStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { isAdmin } = await import("./clothing.server");
    return { admin: await isAdmin(context.userId) };
  });

type Upload = { title: string; priceCents: number; image: string };

export const createClothing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Upload) => input)
  .handler(async ({ data, context }) => {
    const { insertClothing, isAdmin } = await import("./clothing.server");
    if (!(await isAdmin(context.userId))) return { error: "Nur das Admin-Konto legt Klamotten an." };
    const title = data.title.trim().slice(0, 80);
    if (title.length < 2) return { error: "Titel fehlt." };
    if (!Number.isInteger(data.priceCents) || data.priceCents < 100 || data.priceCents > 500000) {
      return { error: "Preis zwischen 1 € und 5.000 €." };
    }
    const image = data.image.replace(/^data:image\/jpeg;base64,/, "");
    if (!image.startsWith("/9j/") || image.length > 1_600_000) return { error: "Foto muss ein JPEG sein, kleiner als 1 MB." };
    const id = await insertClothing(context.userId, title, data.priceCents, image);
    if (!id) return { error: "Speichern fehlgeschlagen." };
    return { id };
  });

export const removeClothing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number }) => input)
  .handler(async ({ data, context }) => {
    const { deleteOwnClothing, isAdmin } = await import("./clothing.server");
    if (!(await isAdmin(context.userId))) return { ok: false };
    if (!Number.isInteger(data.id) || data.id < 1) return { ok: false };
    return { ok: await deleteOwnClothing(context.userId, data.id) };
  });

export type { ClothingRow };
