import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/impressum")({
  head: () =>
    pageHead({
      title: "Impressum",
      description:
        "Impressum von VintageElite. Kontakt terence.nwaeke@gmail.com. Kein erfundener Registereintrag.",
      path: "/impressum",
    }),
  component: ImpressumPage,
});

function ImpressumPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-14">
      <p className="text-xs tracking-widest text-brass uppercase">Impressum</p>
      <h1 className="mt-2 font-display text-4xl">VintageElite</h1>
      <p className="mt-6 text-muted">
        Marke und Shop für Powerlifting-Equipment. Kontakt: terence.nwaeke@gmail.com. Zahlung auf
        Rechnung, zahlbar innerhalb von 14 Tagen. Der Versand startet nach Zahlungseingang.
      </p>
      <p className="mt-4 text-muted">
        Kein erfundener Registereintrag und keine Umsatzsteuer-ID. Bevor der Shop echt verkauft,
        gehören hier Name, Anschrift und Register.
      </p>
    </article>
  );
}
