import { createFileRoute } from "@tanstack/react-router";
import { clothingImage } from "@/lib/clothing.server";

export const Route = createFileRoute("/api/clothing/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = Number(params.id);
        if (!Number.isInteger(id) || id < 1) return new Response("Nicht gefunden.", { status: 404 });
        const image = await clothingImage(id);
        if (!image) return new Response("Nicht gefunden.", { status: 404 });
        const bytes = Buffer.from(image, "base64");
        return new Response(new Uint8Array(bytes), {
          headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
