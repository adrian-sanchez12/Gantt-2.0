import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔍 Supabase URL:", supabaseUrl);
console.log("🔍 Supabase Key:", supabaseKey ? "Cargada correctamente" : "NO ENCONTRADA");

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL y API Key son requeridos.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
