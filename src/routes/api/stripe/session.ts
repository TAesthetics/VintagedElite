import { createFileRoute } from "@tanstack/react-router";
import { readPaidSession } from "@/lib/stripe-checkout.server";

export const Route = createFileRoute("/api/stripe/session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const sessionId = new URL(request.url).searchParams.get("session_id") ?? "";
        const result = await readPaidSession(sessionId);
        const status = "paid" in result ? 200 : result.status;
        return Response.json(result, { status });
      },
    },
  },
});
