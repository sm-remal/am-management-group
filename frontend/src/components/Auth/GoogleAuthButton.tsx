"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { env } from "@/config/env";
import { googleAuth } from "@/features/auth/auth.api";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleButtonConfig = {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with";
  shape?: "rectangular" | "pill" | "circle" | "square";
  width?: string | number;
};

type GoogleAccounts = {
  id: {
    initialize: (config: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
      use_fedcm_for_prompt?: boolean;
    }) => void;
    renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void;
  };
};

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts;
    };
  }
}

type GoogleAuthButtonProps = {
  text: "signin_with" | "signup_with";
  disabled?: boolean;
  onSuccess: () => void;
  onError: (message: string) => void;
};

const GOOGLE_SCRIPT_ID = "google-identity-services";

let initializedGoogleClientId: string | null = null;
let activeCredentialHandler: ((response: GoogleCredentialResponse) => void) | null = null;

const loadGoogleScript = () => {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(
      GOOGLE_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Unable to load Google sign-in")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Google sign-in"));
    document.head.appendChild(script);
  });
};

const GoogleAuthButton = ({
  text,
  disabled,
  onSuccess,
  onError,
}: GoogleAuthButtonProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!env.googleClientId) {
      onError(
        "Google client id is missing. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID in frontend env.",
      );
      return;
    }

    void loadGoogleScript()
      .then(() => {
        if (!isMounted || !buttonRef.current || !window.google?.accounts?.id) {
          return;
        }

        buttonRef.current.innerHTML = "";

        activeCredentialHandler = async (response) => {
          if (!response.credential) {
            onError("Google did not return a valid credential");
            return;
          }

          setIsLoading(true);
          onError("");

          try {
            await googleAuth({ credential: response.credential });
            onSuccess();
          } catch (error) {
            onError(
              error instanceof Error
                ? error.message
                : "Google authentication failed",
            );
          } finally {
            setIsLoading(false);
          }
        };

        if (initializedGoogleClientId !== env.googleClientId) {
          window.google.accounts.id.initialize({
            client_id: env.googleClientId,
            use_fedcm_for_prompt: false,
            callback: (response) => activeCredentialHandler?.(response),
          });
          initializedGoogleClientId = env.googleClientId;
        }

        const containerWidth = containerRef.current?.offsetWidth || 380;

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text,
          shape: "rectangular",
          width: containerWidth,
        });

        setIsReady(true);
      })
      .catch((error) => {
        onError(
          error instanceof Error
            ? error.message
            : "Unable to load Google sign-in",
        );
      });

    return () => {
      isMounted = false;
      if (activeCredentialHandler) activeCredentialHandler = null;
    };
  }, [onError, onSuccess, text]);

  return (
    <div ref={containerRef} className="relative w-full min-h-[44px]">
      <div
        ref={buttonRef}
        className={`w-full overflow-hidden flex justify-center [&>iframe]:!w-full [&>iframe]:!max-w-full ${
          disabled || isLoading ? "pointer-events-none opacity-60" : ""
        }`}
      />
      {(!isReady || isLoading) && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600">
          <Loader2 className="mr-2 size-4 animate-spin" />
          {isLoading ? "Continuing with Google..." : "Loading Google..."}
        </div>
      )}
    </div>
  );
};

export default GoogleAuthButton;