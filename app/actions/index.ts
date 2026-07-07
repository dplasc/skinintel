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
    const { data: eligibleSessions, error: eligibilityError } = await supabase
        .from("eligible_scan_records")
        .select("id")
        .eq("user_email", session.user.email);
    if (eligibilityError) {
        console.error("Latest analysis eligibility fetch failed:", eligibilityError);
        return { latest: null, total: 0 };
    }
    const eligibleScanRecordIds = (eligibleSessions ?? []).map((row) => row.id);
    const { data: legacyAnalyses, error: legacyError } = await supabase
        .from("analyses")
        .select("id, confidence, created_at")
        .eq("user_email", session.user.email)
        .is("scan_record_id", null);
    if (legacyError) {
        console.error("Latest analysis fetch failed:", legacyError);
        return { latest: null, total: 0 };
    }
    let linkedAnalyses: typeof legacyAnalyses = [];
    if (eligibleScanRecordIds.length > 0) {
        const { data, error: linkedError } = await supabase
            .from("analyses")
            .select("id, confidence, created_at")
            .eq("user_email", session.user.email)
            .in("scan_record_id", eligibleScanRecordIds);
        if (linkedError) {
            console.error("Latest analysis fetch failed:", linkedError);
            return { latest: null, total: 0 };
        }
        linkedAnalyses = data ?? [];
    }
    const eligibleAnalyses = [...(legacyAnalyses ?? []), ...linkedAnalyses].sort(
        (a, b) =>
            new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    );
    return { latest: eligibleAnalyses[0] ?? null, total: eligibleAnalyses.length };
}

const ALLOWED_REMINDER_DAYS = [7, 14, 30];

export async function getReminderPreference() {
    const session = await auth();
    if (!session?.user?.email) {
        return { reminderDays: null };
    }
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        console.error("Reminder preference read skipped: missing Supabase configuration");
        return { reminderDays: null };
    }
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data, error } = await supabase
        .from("user_preferences")
        .select("reminder_days")
        .eq("user_email", session.user.email)
        .limit(1);
    if (error) {
        console.error("Reminder preference fetch failed:", error);
        return { reminderDays: null };
    }
    return { reminderDays: data?.[0]?.reminder_days ?? null };
}

export async function saveReminderPreference(days: number) {
    const session = await auth();
    if (!session?.user?.email) {
        return { ok: false };
    }
    if (!ALLOWED_REMINDER_DAYS.includes(days)) {
        console.error("Reminder preference save rejected: invalid value", days);
        return { ok: false };
    }
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        console.error("Reminder preference save skipped: missing Supabase configuration");
        return { ok: false };
    }
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { error } = await supabase
        .from("user_preferences")
        .upsert(
            { user_email: session.user.email, reminder_days: days },
            { onConflict: "user_email" },
        );
    if (error) {
        console.error("Reminder preference save failed:", error);
        return { ok: false };
    }
    return { ok: true };
}
