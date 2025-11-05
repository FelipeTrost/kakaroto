import { type PropsWithChildren } from "react";
import "@/styles/globals.css";

import { cn } from "@/lib/utils";
import { auth } from "@/server/auth";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import AvatarMenu from "@/components/kakaroto/avatar-menu";

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await auth();
  const user = session?.user;
  return (
    <>
      {user ? (
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <Link href="/">
              Kakaroto 🍺
              <span className="ml-2 rounded border-[2px] border-solid border-red-900 p-1">
                beta
              </span>
            </Link>
          </div>
          <div className="hidden lg:flex ">
            <Link
              href="/collections"
              className={`${cn(buttonVariants({ variant: "link" }))}`}
            >
              My collections
            </Link>
            <Link
              href="/collections/new"
              className={`${cn(buttonVariants({ variant: "link" }))}`}
            >
              Create collection
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end">
            <AvatarMenu user={user} />
          </div>
        </nav>
      ) : (
        <></>
      )}
      {children}
    </>
  );
}
