"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ComponentProps } from "react";

function AuthButton(props: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      className="m-auto mb-3 flex h-14 w-full max-w-sm items-center justify-center px-4 py-2 text-lg font-semibold shadow transition-all hover:bg-secondary hover:shadow-lg"
      {...props}
    />
  );
}

const serverErrors = [
  "OAuthSignin", // Error in constructing an authorization URL (1, 2, 3),
  "OAuthCallback", // Error in handling the response (1, 2, 3) from an OAuth provider.
  "OAuthCreateAccount", // Could not create OAuth provider user in the database.
  "EmailCreateAccount", // Could not create email provider user in the database.
  "EmailSignin", // Sending the e-mail with the verification token failed
  "Callback", // Error in the OAuth callback handler route
];

// const unknownError = [
//   "Default", // Catch all, will apply, if none of the above matched
// ];

const unauthorizedError = [
  "CredentialsSignin", // The authorize callback returned null in the Credentials provider. We don't recommend providing information about which part of the credentials were wrong, as it might be abused by malicious hackers.
];

const differentAccount = "OAuthAccountNotLinked"; // If the email on the account is already linked, but not with this OAuth account

export default function Page() {
  const searchParams = useSearchParams();

  const error = searchParams.get("error");
  let errorMessage = null;
  if (error) {
    if (serverErrors.includes(error)) {
      errorMessage = "There was an error on our side. Please try again.";
    } else if (unauthorizedError.includes(error)) {
      errorMessage = "Invalid credentials. Please try again.";
    } else if (differentAccount === error) {
      errorMessage =
        "This email is already linked to another account. Please use a different email or sign in with that account.";
    } else {
      errorMessage = "Something went wrong. Please try again.";
    }
  }

  const callbackUrl = "/collections/new";

  return (
    <main>
      <Button asChild variant="ghost" className="mt-4">
        <Link href="/">
          <ArrowLeft className="mr-4" /> Back to landing page
        </Link>
      </Button>
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 ">
        <div className="flex flex-col gap-3">
          <h1
            style={{ lineHeight: 1.5 }}
            className="mr-[-1ch] max-w-full text-center text-2xl font-bold lg:text-4xl"
          >
            Kakaroto 🍺
            <span className="ml-2 rounded border-[2px] border-solid border-red-900 p-1">
              beta
            </span>
          </h1>
          <p>Sign in below to create your own collections</p>
        </div>
        {errorMessage && (
          <Alert variant="destructive" className="max-w-sm">
            <AlertCircle className="pr-1" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="w-full">
          <AuthButton onClick={() => signIn("google", { callbackUrl })}>
            <svg
              className="mr-3 h-6 w-6"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </AuthButton>

          <AuthButton onClick={() => signIn("discord", { callbackUrl })}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid"
              viewBox="0 0 256 199"
              className="mr-3 h-6 w-6"
            >
              <path
                fill="#5865F2"
                d="M216.9 16.6A208.5 208.5 0 0 0 164 0c-2.2 4.1-4.9 9.6-6.7 14a194 194 0 0 0-58.6 0C97 9.6 94.2 4.1 92 0a207.8 207.8 0 0 0-53 16.6A221.5 221.5 0 0 0 1 165a211.2 211.2 0 0 0 65 33 161 161 0 0 0 13.8-22.8c-7.6-2.9-15-6.5-21.8-10.6l5.3-4.3a149.3 149.3 0 0 0 129.6 0c1.7 1.5 3.5 3 5.3 4.3a136 136 0 0 1-21.9 10.6c4 8 8.7 15.7 13.9 22.9a210.7 210.7 0 0 0 64.8-33.2c5.3-56.3-9-105.1-38-148.4ZM85.5 135.1c-12.7 0-23-11.8-23-26.2 0-14.4 10.1-26.2 23-26.2 12.8 0 23.2 11.8 23 26.2 0 14.4-10.2 26.2-23 26.2Zm85 0c-12.6 0-23-11.8-23-26.2 0-14.4 10.2-26.2 23-26.2 12.9 0 23.3 11.8 23 26.2 0 14.4-10.1 26.2-23 26.2Z"
              />
            </svg>
            Continue with Discord
          </AuthButton>

          {process.env.NODE_ENV === "development" && (
            <AuthButton onClick={() => signIn("test-user", { callbackUrl })}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-6 w-6"
              >
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-6h2v6zm0-8h-2V7h2v4z"
                />
              </svg>
              Continue with Credentials
            </AuthButton>
          )}
        </div>
      </div>
    </main>
  );
}
