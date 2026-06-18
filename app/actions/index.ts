"use server"

import { signIn, signOut, auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";

export async function doSocialLogin (formData:FormData) {
    const action = formData.get('action');
    await signIn(action as string, { redirectTo: '/dashboard' });
}

export async function doLogout () {
    await signOut();
}

export async function getLatestAnalysis() {
    const session = await auth();
    if (!session?.user?.email) {
        return { latest: null, total: 0 };
    }
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        console.error("Latest analysis skipped: missing Supabase configuration");
        return { latest: null, total: 0 };
    }
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data, error, count } = await supabase
        .from("analyses")
        .select("id, confidence, created_at", { count: "exact" })
        .eq("user_email", session.user.email)
        .order("created_at", { ascending: false })
        .limit(1);
    if (error) {
        console.error("Latest analysis fetch failed:", error);
        return { latest: null, total: 0 };
    }
    return { latest: data?.[0] ?? null, total: count ?? 0 };
}
