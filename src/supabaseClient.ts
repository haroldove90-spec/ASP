import { createClient } from "@supabase/supabase-js";

function cleanUrl(raw?: string): string {
  if (!raw || typeof raw !== "string") {
    return "https://xqmgkmxkqvnrakodlgjp.supabase.co";
  }
  let url = raw.trim().replace(/^["']|["']$/g, ""); // remove surrounding quotes if any
  url = url.replace(/\/+$/, ""); // remove trailing slashes
  url = url.replace(/\/rest\/v1\/?$/, ""); // strip /rest/v1 if included
  url = url.replace(/\/rest\/?$/, "");
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url || "https://xqmgkmxkqvnrakodlgjp.supabase.co";
}

function cleanKey(raw?: string): string {
  const defaultKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxbWdrbXhrcXZucmFrb2RsZ2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzYxMTgsImV4cCI6MjA5OTk1MjExOH0.oFbygTFc63QzJZHcbMfJb5lGSrKqb0Or_luPX6nvxhU";
  if (!raw || typeof raw !== "string") return defaultKey;
  const cleaned = raw.trim().replace(/^["']|["']$/g, "");
  return cleaned || defaultKey;
}

const rawUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const rawKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_URL = cleanUrl(rawUrl);
export const SUPABASE_ANON_KEY = cleanKey(rawKey);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

