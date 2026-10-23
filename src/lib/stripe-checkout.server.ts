import Stripe from "stripe";
import {
  getProduct,
  type Product,
} from "@/data/catalog";
import { clothingBySlug } from "@/lib/clothing.server";
import { env } from "@/lib/env.server";
import { allowedReturnBase } from "@/lib/public-base";
import { recordCheckout, markOrderPaid, getShopOrder } from "@/lib/orders.server";
import { quote, type QuoteItem } from "@/lib/quote";

const COUNTRIES = new Set(["DE", "AT", "NL", "BE", "FR", "IT", "PL", "CH"]);

export type CheckoutLine = { slug: string; variantId: string; qty: number };

export type CheckoutBody = {
  name: string;
  email: string;
  phone: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  note: string;
  lines: CheckoutLine[];
  returnBase: string;
  pay: "rechnung" | "card" | "paypal" | "klarna";
};

type Fail = { error: string; status: number };

function fail(error: string, status = 400): Fail {
  return { error, status };
}

function text(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function readCheckoutBody(input: unknown, requestHost?: string): CheckoutBody | Fail {
  if (!input || typeof input !== "object") return fail("Ungültiger Auftrag.");
  const body = input as Record<string, unknown>;
  const name = text(body.name, 80);
  const email = text(body.email, 120);
  const street = text(body.street, 120);
  const zip = text(body.zip, 16);
  const city = text(body.city, 80);
  const country = text(body.country, 2).toUpperCase();
  const note = text(body.note, 400);
  const phone = text(body.phone, 40);
  const returnBase = allowedReturnBase(body.returnBase, requestHost);
  const payRaw = text(body.pay, 16);
  const pay =
    payRaw === "paypal" || payRaw === "klarna" || payRaw === "rechnung" || payRaw === "card"
      ? payRaw
      : "";
  if (name.length < 2) return fail("Name fehlt.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("E-Mail fehlt.");
  if (street.length < 3 || zip.length < 3 || city.length < 2) return fail("Adresse unvollständig.");
  if (!COUNTRIES.has(country)) return fail("Land wird nicht beliefert.");
  if (!returnBase) return fail("Rückkehr-Adresse ungültig.");
  if (!pay) return fail("Zahlungsart fehlt.");
  if (!Array.isArray(body.lines) || body.lines.length === 0 || body.lines.length > 20) {
    return fail("Warenkorb ist leer.");
  }
  const lines: CheckoutLine[] = [];
  for (const raw of body.lines) {
    if (!raw || typeof raw !== "object") return fail("Position ungültig.");
    const line = raw as Record<string, unknown>;
    const slug = text(line.slug, 80);
    const variantId = text(line.variantId, 16);
    const qty = line.qty;
    if (!slug || typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > 8) {
      return fail("Menge ungültig.");
    }
    lines.push({ slug, variantId, qty });
  }
  return { name, email, phone, street, zip, city, country, note, lines, returnBase, pay };
}

function isFail(value: unknown): value is Fail {
  return !!value && typeof value === "object" && "error" in value && "status" in value;
}

async function resolve(lines: CheckoutLine[]): Promise<QuoteItem[] | Fail> {
  const items: QuoteItem[] = [];
  for (const line of lines) {
    const product = getProduct(line.slug) ?? (await clothingBySlug(line.slug));
    if (!product) return fail("Ein Artikel ist nicht mehr im Sortiment.");
    const variant = product.variants?.find((item) => item.id === line.variantId);
    if (product.variants?.length && !variant) return fail(`Größe fehlt: ${product.name}`);
    if (!product.variants?.length && line.variantId) return fail("Variante unbekannt.");
    if (product.unique && line.qty !== 1) return fail(`${product.name} gibt es nur einmal.`);
    items.push({ product, qty: line.qty, variantLabel: variant?.label ?? "" });
  }
  return items;
}

function lineName(product: Product, variantLabel: string) {
  return variantLabel ? `${product.name} · ${variantLabel}` : product.name;
}

export async function placeInvoiceOrder(input: unknown, requestHost?: string) {
  const body = readCheckoutBody(input, requestHost);
  if (isFail(body)) return body;
  const items = await resolve(body.lines);
  if (isFail(items)) return items;

  const priced = quote(items, body.country);
  const id = `re_${crypto.randomUUID().replaceAll("-", "")}`;
  try {
    await recordCheckout({
      id,
      name: body.name,
      email: body.email,
      phone: body.phone,
      street: body.street,
      zip: body.zip,
      city: body.city,
      country: body.country,
      note: body.note,
      lines: items.map((item) => ({
        name: lineName(item.product, item.variantLabel),
        qty: item.qty,
        price: item.product.price,
      })),
      goods: priced.goods,
      shipping: priced.shipping,
      total: priced.total,
    });
  } catch (error) {
    console.error(error);
    return fail("Die Bestellung konnte nicht gespeichert werden.", 500);
  }
  return { url: `${body.returnBase}/kasse/danke?session_id=${id}` };
}

export async function createCheckoutUrl(input: unknown, requestHost?: string) {
  const body = readCheckoutBody(input, requestHost);
  if (isFail(body)) return body;
  const items = await resolve(body.lines);
  if (isFail(items)) return items;

  const key = env("STRIPE_SECRET_KEY");
  if (!key) {
    return fail(
      "Stripe ist noch nicht verbunden. In Railway bei VintageElite unter Variables die Variable STRIPE_SECRET_KEY anlegen (Live-Schlüssel sk_live_… aus Stripe, Entwickler, API-Schlüssel). Railway startet danach neu.",
      503,
    );
  }

  const priced = quote(items, body.country);
  const stripe = new Stripe(key);
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "de",
      allowed_payment_method_types: [body.pay === "paypal" || body.pay === "klarna" ? body.pay : "card"],
      customer_email: body.email,
      success_url: `${body.returnBase}/kasse/danke?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${body.returnBase}/checkout`,
      billing_address_collection: "auto",
      line_items: [
        ...items.map((item) => ({
          quantity: item.qty,
          price_data: {
            currency: "eur",
            unit_amount: item.product.price,
            product_data: {
              name: lineName(item.product, item.variantLabel),
              description: `${item.product.ship[0]}–${item.product.ship[1]} Werktage`,
            },
          },
        })),
        ...(priced.shipping > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: "eur",
                  unit_amount: priced.shipping,
                  product_data: { name: priced.label },
                },
              },
            ]
          : []),
      ],
      metadata: {
        name: body.name,
        city: body.city,
        country: body.country,
        street: body.street.slice(0, 200),
        zip: body.zip,
        note: body.note.slice(0, 400),
      },
      payment_intent_data: {
        shipping: {
          name: body.name,
          phone: body.phone || undefined,
          address: {
            line1: body.street,
            postal_code: body.zip,
            city: body.city,
            country: body.country,
          },
        },
      },
    });
    if (!session.url) return fail("Stripe hat keine Zahlungsseite geliefert.", 502);
    try {
      await recordCheckout({
        id: session.id,
        name: body.name,
        email: body.email,
        phone: body.phone,
        street: body.street,
        zip: body.zip,
        city: body.city,
        country: body.country,
        note: body.note,
        lines: items.map((item) => ({
          name: lineName(item.product, item.variantLabel),
          qty: item.qty,
          price: item.product.price,
        })),
        goods: priced.goods,
        shipping: priced.shipping,
        total: priced.total,
      });
    } catch (error) {
      console.error(error);
    }
    return { url: session.url };
  } catch (error) {
    console.error(error);
    const detail = error instanceof Error ? error.message : "";
    if (detail.includes("is invalid") || detail.includes("activated in your dashboard")) {
      return fail(
        "PayPal oder Klarna ist im Stripe-Konto noch nicht an. Im Dashboard unter Einstellungen, Zahlungsmethoden, die Methode einschalten.",
        502,
      );
    }
    if (detail.includes("No valid payment method")) {
      return fail(
        "Stripe hat keine Kartenzahlung aktiv. Im Dashboard unter Einstellungen, Zahlungsmethoden, Karte einschalten.",
        502,
      );
    }
    return fail(
      detail
        ? `Stripe hat die Zahlung abgelehnt: ${detail}`
        : "Stripe hat die Zahlung abgelehnt. Prüfe den Schlüssel und versuch es erneut.",
      502,
    );
  }
}

export async function readPaidSession(sessionId: string) {
  if (sessionId.startsWith("re_")) {
    if (!/^re_[a-f0-9]{32}$/.test(sessionId)) return fail("Keine Bestellung.", 400);
    const order = await getShopOrder(sessionId);
    if (!order) return fail("Keine Bestellung.", 404);
    return {
      id: order.id,
      paid: false,
      invoice: true,
      email: order.email,
      total: order.total,
      name: order.name,
    };
  }
  if (!sessionId.startsWith("cs_")) return fail("Keine Stripe-Sitzung.", 400);
  const key = env("STRIPE_SECRET_KEY");
  if (!key) return fail("Stripe ist nicht verbunden.", 503);
  const stripe = new Stripe(key);
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      try {
        await markOrderPaid(session.id);
      } catch (error) {
        console.error(error);
      }
    }
    return {
      id: session.id,
      paid: session.payment_status === "paid",
      email: session.customer_details?.email ?? session.customer_email ?? "",
      total: session.amount_total ?? 0,
      name: session.metadata?.name ?? "",
    };
  } catch (error) {
    console.error(error);
    return fail("Zahlung konnte nicht geprüft werden.", 502);
  }
}
