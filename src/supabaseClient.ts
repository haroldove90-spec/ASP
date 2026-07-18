import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL || "https://xqmgkmxkqvnrakodlgjp.supabase.co";
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxbWdrbXhrcXZucmFrb2RsZ2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzYxMTgsImV4cCI6MjA5OTk1MjExOH0.oFbygTFc63QzJZHcbMfJb5lGSrKqb0Or_luPX6nvxhU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
