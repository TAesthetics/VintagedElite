import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/shell";
import { faqLd, pageHead } from "@/lib/seo";

const faqs = [
  {
    q: "Wie schnell ist Second Hand da?",
    a: "Getragene Mode liegt im Lager. Paket in 2–4 Werktagen. Jedes Teil gibt es nur einmal. Rückgabe ungetragen innerhalb von 14 Tagen.",
  },
  {
    q: "Wie lange dauert Fitness?",
    a: "Stange, Bumper, Rack, Bank, Gürtel und Supplements brauchen 12–36 Werktage. Großes Gerät per Spedition bis zur Bordsteinkante, Aufbau liegt bei dir. Eine Spedition pro Bestellung, 49 € in der EU, mehr in die Schweiz.",
  },
  {
    q: "Wann ist das Paket frei?",
    a: "Ab 149 € Warenwert, solange nichts per Spedition muss. Sobald ein Rack, eine Bank oder die Bumper im Korb liegen, gilt die Spedition.",
  },
  {
    q: "Rückgabe",
    a: "Unbenutztes Zubehör 30 Tage zurück, du trägst den Rückversand. Großgeräte nur bei Transportschaden.",
  },
  {
    q: "Zahlung",
    a: "Nur über Stripe. Karte und die von Stripe angebotenen Methoden. Dieser Shop speichert keine Kartennummer.",
  },
];

export const Route = createFileRoute("/versand")({
  head: () =>
    pageHead({
      title: "Versand und Rückgabe",
      description:
        "Second Hand in 2–4 Werktagen aus dem Atelier. Fitness 12–36 Werktage. Paket frei ab 149 € in der EU.",
      path: "/versand",
      jsonLd: [faqLd(faqs)],
    }),
  component: VersandPage,
});

function VersandPage() {
  return (
    <div className="pb-16">
      <PageIntro
        kicker="Versand"
        title="Ehrlich lang, nicht über Nacht."
        text="Second Hand geht in 2–4 Werktagen raus. Fitness und Supplements brauchen länger, die Zeit steht am Artikel."
      />
      <div className="mx-auto max-w-3xl px-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="py-2 font-medium">Quelle</th>
              <th className="py-2 font-medium">Weg</th>
              <th className="py-2 font-medium">Zeit</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line">
              <td className="py-3">Second Hand</td>
              <td className="py-3">Paket</td>
              <td className="py-3">2–4 Werktage</td>
            </tr>
            <tr className="border-b border-line">
              <td className="py-3">Fitness</td>
              <td className="py-3">Paket oder Spedition</td>
              <td className="py-3">12–36 Werktage</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-10">
          {faqs.map((item) => (
            <details key={item.q} className="border-t border-line py-4">
              <summary className="font-display text-xl">{item.q}</summary>
              <p className="mt-2 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
