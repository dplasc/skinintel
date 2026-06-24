"use client";

import LoginForm from "@/components/auth/login-form";
import type { Metadata } from "next";

const metadata: Metadata = {
  title: "Prijava u SkinIntel",
  description:
    "Pristupi svom prostoru za analizu kože.",
};

const Login = () => {
  return (
    <section className="relative flex min-h-screen flex-col justify-center px-4 py-10 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 dark:opacity-40"
        style={{
          background:
            "radial-gradient(130% 130% at 0% 0%, #FBF6F0 0%, rgba(251,246,240,0) 55%), radial-gradient(95% 95% at 100% 0%, rgba(217,115,78,0.10) 0%, rgba(217,115,78,0) 48%), radial-gradient(85% 85% at 100% 100%, rgba(243,201,179,0.18) 0%, rgba(243,201,179,0) 52%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-md sm:max-w-[464px]">
        <div className="overflow-hidden rounded-[28px] border border-[#ECE0D4] bg-[#FFFDFA] px-6 py-9 shadow-[0_2px_4px_rgba(43,42,40,0.03),0_24px_70px_rgba(43,42,40,0.10)] sm:rounded-[32px] sm:px-10 sm:py-11 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-center">
            <div className="flex flex-col items-center">
              <span className="inline-flex items-center gap-2.5">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gradient-to-br from-[#D9734E] to-[#E0976F] shadow-[0_2px_8px_rgba(217,115,78,0.3)]">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[18px] w-[18px] text-white">
                    <path d="M12 3.2c-3.6 3.8-5.6 6.9-5.6 10.1a5.6 5.6 0 0 0 11.2 0c0-3.2-2-6.3-5.6-10.1Z" fill="currentColor" />
                    <path d="M9.4 13.9c0 1.6 1.1 2.7 2.6 2.9" stroke="#FFFDFA" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="text-xl font-semibold tracking-tight text-[#2B2A28] dark:text-neutral-50">
                  SkinIntel
                </span>
              </span>
              <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#E7CDBC] bg-[#FBF6F0]/80 px-3 py-1 shadow-[0_1px_2px_rgba(43,42,40,0.04)] backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D9734E] sm:text-[11px] sm:tracking-[0.32em]">
                  AI analiza kože
                </span>
              </span>
            </div>

            <h1 className="mt-7 text-2xl font-semibold tracking-tight text-[#2B2A28] dark:text-neutral-50">
              Prijava u SkinIntel
            </h1>
            <p className="mt-2.5 text-base leading-relaxed text-[#6E6A63] dark:text-neutral-300">
              Pristupi svom prostoru za analizu kože.
            </p>
          </div>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
