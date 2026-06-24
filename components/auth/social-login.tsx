// ============================================= Server side way start =======================================
import { doSocialLogin } from "@/app/actions";
import { useLoading } from "@/contexts/LoadingContext";
import GoogleIcon from "@/public/assets/images/icons/google-icon.png";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { Button } from "../ui/button";

const SocialLogin = () => {
  const { loading, setLoading } = useLoading();

  const [loadingButtonProvider, setLoadingButtonProvider] = useState<
    null | "google" | "github"
  >(null);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);

    const form = e.currentTarget;
    const clickedButton = (document.activeElement as HTMLButtonElement)?.value;
    setLoadingButtonProvider(
      clickedButton === "google" || clickedButton === "github"
        ? clickedButton
        : null
    );

    setTimeout(() => {
      setLoading(false);
      setLoadingButtonProvider(null);
    }, 2000);
  };

  return (
    <form
      className="mt-6 flex items-center gap-3"
      action={doSocialLogin}
      onSubmit={handleFormSubmit}
    >
      {/* Google Button */}
      <Button
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#ECE0D4] bg-[#FBF6F0] px-2 py-6 text-sm font-semibold text-[#2B2A28] shadow-[0_1px_2px_rgba(43,42,40,0.04)] transition hover:border-[#D9734E] hover:bg-[#F7DECF]/40 hover:!text-[#2B2A28] disabled:opacity-80 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-[#E8916C] dark:hover:bg-neutral-800"
        variant="outline"
        type="submit"
        name="action"
        value="google"
        disabled={loadingButtonProvider === "google" || loading}
      >
        {loadingButtonProvider === "google" ? (
          <>
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
            Učitavanje...
          </>
        ) : (
          <>
            <Image src={GoogleIcon} alt="google" width={18} height={18} />
            Google
          </>
        )}
      </Button>
    </form>
  );
};

export default SocialLogin;
// ============================================= Server side way end =======================================
