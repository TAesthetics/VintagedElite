import { createFileRoute, Link } from "@tanstack/react-router";
import { EMPTY_SEARCH } from "@/data/catalog";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/ueber")({
  head: () =>
    pageHead({
      title: "Das Haus",
      description:
        "VintageElite führt Second Hand aus dem Atelier und Powerlifting-Equipment aus dem eigenen Sortiment.",
      path: "/ueber",
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-14">
      <p className="text-xs tracking-widest text-brass uppercase">Das Haus</p>
      <h1 className="mt-2 font-display text-5xl leading-tight">VintageElite</h1>
      <p className="mt-6 text-muted">
        Zwei Geschäfte unter einem Namen. Second Hand kommt nur aus dem Atelier, jedes Teil einmal.
        Dazu Stange, Bumper, Rack, Bank, Gürtel, Kreatin, Whey, Pre-Workout und Ashwagandha.
      </p>
      <p className="mt-4 text-muted">
        Du kaufst hier. Lieferzeit und Versand stehen am Artikel und an der Kasse.
      </p>
      <img
        src="/catalog/hero.jpg"
        alt="Trainingsstange mit Ledergürtel"
        className="mt-10 w-full object-cover"
      />
      <Link
        to="/shop"
        search={EMPTY_SEARCH}
        className="mt-8 inline-flex min-h-11 items-center bg-ink px-5 text-sm text-paper"
      >
        Ins Sortiment
      </Link>
    </article>
  );
}
