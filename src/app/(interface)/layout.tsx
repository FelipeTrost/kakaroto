import { type PropsWithChildren } from "react";
import "@/styles/globals.css";

import { cn } from "@/lib/utils";
import { getServerAuthSession } from "@/server/auth";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await getServerAuthSession();
  const user = session?.user;
  return (
    <>
      <section className="m-auto flex w-[90%] max-w-xl flex-row justify-end p-4">
        {user ? (
          <>
            <Link
              href="/collections"
              className={`w-[10rem] ${cn(buttonVariants({ variant: "ghost" }))}`}
            >
              My collections
            </Link>
          </>
        ) : (
          <></>
        )}
      </section>
      {children}
    </>
  );
}
