"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { PiSpinnerBold } from "react-icons/pi";

export const SignInForm = () => {
  const t = useTranslations("components.SignInForm");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleClick = async () => {
    setIsSigningIn(true);
    await signIn("github", { redirect: true, callbackUrl: "/app" });
  };

  return (
    <section className="flex flex-col items-center">
      <header className="text-center mb-4 flex flex-col gap-2">
        <h1 className="text-xl">{t("welcome")}</h1>
        <p className="text-gray-500">{t("description")}</p>
      </header>
      <button
        type="button"
        disabled={isSigningIn}
        className="bg-gray-800 disabled:bg-gray-600 flex gap-2 rounded text-white p-2 px-4 text-sm"
        onClick={() => {
          void handleClick();
        }}
      >
        {isSigningIn ? (
          <PiSpinnerBold className="text-xl animate-spin" />
        ) : (
          <FaGithub className="text-xl" />
        )}
        {t("signInOrUpWithGitHub")}
      </button>
    </section>
  );
};
