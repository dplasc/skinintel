import { supabase } from "@/lib/supabase";

export async function getProducts() {
  const { data, error } = await supabase.from("products").select("*");

  if (error) {
    console.error("SUPABASE PRODUCTS ERROR:", error);
    return [];
  }

  console.log("SUPABASE PRODUCTS:", data);
  return data || [];
}
