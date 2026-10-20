import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EMPTY_SEARCH } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { eur } from "@/lib/money";
import { apiPath } from "@/lib/public-base";
import { pageHead } from "@/lib/seo";

type Paid = {
  id: string;
  paid: boolean;
  email: string;
  total: number;
  name: string;
};

export const Route = createFileRoute("/kasse/danke")({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search.session_id === "string" ? search.session_id : "",
  }),
  head: () =>
    pageHead({
      title: "Bestellung",
      description: "Zahlungsstatus der VintageElite-Bestellung.",
      path: "/kasse/danke",
      index: false,
    }),
  component: ThanksPage,
});

function ThanksPage() {
  const { session_id } = Route.useSearch();
  const clear = useCart((state) => state.clear);
  const [state, setState] = useState<"wait" | "paid" | "open" | "bad">("wait");
  const [order, setOrder] = useState<Paid | null>(null);

  useEffect(() => {
    if (!session_id) {
      setState("bad");
      return;
    }
    let gone = false;
    void fetch(apiPath(`/api/stripe/session?session_id=${encodeURIComponent(session_id)}`))
      .then(async (response) => {
        if (!response.ok) throw new Error("status");
        return (await response.json()) as Paid;
      })
      .then((paid) => {
        if (gone) return;
        setOrder(paid);
        if (paid.paid) {
          setState("paid");
          clear();
        } else setState("open");
      })
      .catch(() => {
        if (!gone) setState("bad");
      });
    return () => {
      gone = true;
    };
  }, [session_id, clear]);

  return (
    <div className="mx-auto max-w-xl px-5 py-16">
      {state === "wait" && <p className="text-muted">Zahlung wird bei Stripe geprüft.</p>}
      {state === "paid" && order && (
        <>
          <p className="text-xs tracking-widest text-brass uppercase">Bezahlt</p>
          <h1 className="mt-2 font-display text-4xl">Danke{order.name ? `, ${order.name}` : ""}.</h1>
          <p className="mt-4 text-muted">
            Stripe hat {eur(order.total)} bestätigt{order.email ? ` an ${order.email}` : ""}. Referenz{" "}
            {order.id}.
          </p>
        </>
      )}
      {state === "open" && (
        <>
          <h1 className="font-display text-4xl">Zahlung noch offen.</h1>
          <p className="mt-4 text-muted">Stripe hat die Sitzung, aber noch keinen Geldeingang.</p>
        </>
      )}
      {state === "bad" && (
        <>
          <h1 className="font-display text-4xl">Keine Bestätigung.</h1>
          <p className="mt-4 text-muted">Die Stripe-Sitzung fehlt oder der Schlüssel ist nicht gesetzt.</p>
        </>
      )}
      <Link to="/shop" search={EMPTY_SEARCH} className="mt-8 inline-flex min-h-11 items-center underline">
        Weiter im Sortiment
      </Link>
    </div>
  );
}
