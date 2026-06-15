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
    <section className="bg-white dark:bg-slate-900 flex min-h-screen">
      <div className="w-full py-8 px-6 flex flex-col justify-center">
        <div className="lg:max-w-[464px] w-full mx-auto">
          {/* Logo and heading */}
          <div>
            <div className="mb-6 text-center">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                SkinIntel
              </div>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                AI analiza kože
              </div>
            </div>

            <h4 className="font-semibold mb-3">Prijava u SkinIntel</h4>
            <p className="mb-8 text-neutral-500 dark:text-neutral-300 text-lg">
              Pristupi svom prostoru za analizu kože.
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />
        </div>
      </div>
    </section>
  );
};

export default Login;
