import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export const adminDesk = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { isAdmin } = await import("./clothing.server");
    if (!(await isAdmin(context.userId))) return { admin: false as const, orders: [] };
    const { listShopOrders } = await import("./orders.server");
    return { admin: true as const, orders: await listShopOrders() };
  });
