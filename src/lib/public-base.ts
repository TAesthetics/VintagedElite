import { previewPathPrefix } from "@/lib/preview-path-prefix";

const PREVIEW_HOSTS = new Set([
  "preview.grok.genai.mil",
  "preview.grok.mil",
  "preview.grokgsac.com",
]);

export function browserBase(): string {
  const prefix = previewPathPrefix(window.location.hostname, window.location.pathname) ?? "";
  return `${window.location.origin}${prefix}`;
}

export function apiPath(path: string): string {
  const prefix = previewPathPrefix(window.location.hostname, window.location.pathname) ?? "";
  return `${prefix}${path}`;
}

export function allowedReturnBase(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 300) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  const local = host === "localhost" || host === "127.0.0.1";
  const known =
    local ||
    host.endsWith(".grok.me") ||
    host.endsWith(".grok.build") ||
    PREVIEW_HOSTS.has(host);
  if (!known) return null;
  if (url.protocol !== "https:" && !local) return null;
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  const path = url.pathname.replace(/\/$/, "");
  if (path.includes("..")) return null;
  return `${url.origin}${path}`;
}
