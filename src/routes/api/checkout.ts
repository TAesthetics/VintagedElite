import { createFileRoute } from "@tanstack/react-router";
import { createCheckoutUrl } from "@/lib/stripe-checkout.server";

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Ungültiger Auftrag." }, { status: 400 });
        }
        const result = await createCheckoutUrl(body);
        const status = "url" in result ? 200 : result.status;
        return Response.json("url" in result ? { url: result.url } : { error: result.error }, {
          status,
        });
      },
    },
  },
});
