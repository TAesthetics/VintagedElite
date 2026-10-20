import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { adminStatus, createClothing, listClothing, removeClothing } from "@/lib/clothing.functions";
import { clothingProduct } from "@/lib/clothing";
import { getBearerToken } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { eur } from "@/lib/money";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/atelier")({
  head: () =>
    pageHead({
      title: "Atelier",
      description: "Klamotten hochladen. Nur das Atelier-Konto.",
      path: "/atelier",
      index: false,
    }),
  loader: () => listClothing(),
  component: AtelierPage,
});

function AtelierPage() {
  const { user, isPending } = useCurrentUserState();
  const realUser = user && !user.isDevFallback ? user : null;
  const [token, setToken] = useState(false);
  const pieces = Route.useLoaderData().map(clothingProduct);
  const [admin, setAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    setToken(Boolean(getBearerToken()));
  }, []);

  const signedIn = Boolean(realUser || token);

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    adminStatus()
      .then((status) => {
        if (!cancelled) setAdmin(status.admin);
      })
      .catch(() => {
        if (!cancelled) setAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, [signedIn]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (isPending || (signedIn && admin === null)) {
    return <p className="mx-auto max-w-xl px-5 py-16 text-muted">Einen Moment.</p>;
  }

  if (!signedIn) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16">
        <h1 className="font-display text-4xl">Atelier</h1>
        <p className="mt-4 text-muted">Zum Hochladen anmelden.</p>
        <Link to="/login" className="mt-6 inline-flex min-h-11 items-center bg-ink px-5 text-sm text-paper">
          Anmelden
        </Link>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16">
        <h1 className="font-display text-4xl">Kein Zugriff</h1>
        <p className="mt-4 text-muted">Dieses Konto darf keine Klamotten anlegen.</p>
      </div>
    );
  }

  async function onFile(file: File | undefined) {
    setError("");
    if (!file) return;
    const jpeg = await toJpeg(file).catch(() => "");
    if (!jpeg.startsWith("/9j/")) {
      setError("Foto muss ein Bild sein.");
      return;
    }
    setImage(jpeg);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const euros = Number(price.replace(",", "."));
    const priceCents = Math.round(euros * 100);
    const result = await createClothing({ data: { title, priceCents, image } });
    setBusy(false);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    setTitle("");
    setPrice("");
    setImage("");
    window.location.assign("/atelier");
  }

  async function onRemove(id: number) {
    await removeClothing({ data: { id } });
    window.location.assign("/atelier");
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-xs tracking-widest text-brass uppercase">Atelier</p>
      <h1 className="mt-2 font-display text-4xl">Klamotten anlegen</h1>
      <p className="mt-4 max-w-xl text-muted">
        Foto, Titel, Preis. Das Stück ist danach das einzige Exemplar im Shop.
      </p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3">
        <label className="block text-sm">
          Titel
          <input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full" />
        </label>
        <label className="block text-sm">
          Preis in Euro
          <input
            required
            inputMode="decimal"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="mt-1 w-full"
          />
        </label>
        <label className="block text-sm">
          Foto
          <input
            required={!image}
            type="file"
            accept="image/*"
            className="mt-1 w-full"
            onChange={(event) => void onFile(event.target.files?.[0])}
          />
        </label>
        {image && <img src={`data:image/jpeg;base64,${image}`} alt="" className="mt-2 aspect-square w-40 object-cover" />}
        {error && <p className="text-sm text-oxblood">{error}</p>}
        <button
          type="submit"
          disabled={busy || !image}
          className="mt-2 inline-flex min-h-11 items-center justify-center bg-ink px-5 text-sm text-paper disabled:opacity-50"
        >
          {busy ? "Speichert" : "Ins Sortiment"}
        </button>
      </form>
      <ul className="mt-12 divide-y divide-line border-t border-line">
        {pieces.map((piece) => {
          const id = Number(piece.slug.replace("stueck-", ""));
          return (
            <li key={piece.slug} className="flex items-center gap-4 py-4">
              <img src={piece.image} alt="" className="size-16 object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl">{piece.name}</p>
                <p className="text-sm text-muted">{eur(piece.price)}</p>
              </div>
              <button type="button" className="min-h-11 text-sm underline" onClick={() => void onRemove(id)}>
                Entfernen
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

async function toJpeg(file: File) {
  const bitmap = await createImageBitmap(file);
  const max = 1400;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Foto");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82).replace(/^data:image\/jpeg;base64,/, "");
}
