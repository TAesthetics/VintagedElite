import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { authClient, rememberSessionToken } from "@/lib/auth/client";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () =>
    pageHead({
      title: "Anmelden",
      description: "Anmeldung für das VintageElite-Atelier.",
      path: "/login",
      index: false,
    }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await authClient.signIn.email({ email, password });
    setBusy(false);
    if (result.error) {
      setError(result.error.message ?? "Anmeldung fehlgeschlagen.");
      return;
    }
    if (result.data?.token) rememberSessionToken(result.data.token);
    try {
      await authClient.getSession();
    } catch {
      /* session refreshes on the next page */
    }
    void navigate({ to: "/atelier" });
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <p className="text-xs tracking-widest text-brass uppercase">Atelier</p>
      <h1 className="mt-2 font-display text-4xl">Anmelden</h1>
      <p className="mt-4 text-muted">Nur das Atelier-Konto legt Klamotten an. Andere Konten können nichts hochladen.</p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3">
        <label className="block text-sm">
          E-Mail
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full"
          />
        </label>
        <label className="block text-sm">
          Passwort
          <input
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full"
          />
        </label>
        {error && <p className="text-sm text-oxblood">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-2 inline-flex min-h-11 items-center justify-center bg-ink px-5 text-sm text-paper"
        >
          {busy ? "Einen Moment" : "Anmelden"}
        </button>
      </form>
    </div>
  );
}
