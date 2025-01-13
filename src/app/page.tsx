import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getServerAuthSession } from "@/server/auth";
import Link from "next/link";
import AvatarMenu from "@/components/kakaroto/avatar-menu";
import ReturnToGameButton from "./return-to-game-button";

export default async function HomePage() {
  const session = await getServerAuthSession();
  const user = session?.user;

  return (
    <>
      {user ? <nav className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-6 lg:px-8">
        <div className="flex flex-1 items-center justify-end">
          <AvatarMenu user={user} />
        </div>
      </nav> : <div className="h-8" />}
      <main>
        <section className="container flex flex-col gap-4 pb-12 pt-4 text-center lg:items-center lg:gap-8 lg:py-20">
          <div className="flex flex-1 flex-col items-center gap-4 text-center lg:gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold lg:text-6xl mr-[-1ch]">Kakaroto 🍺</h1>
              <h2 className="text-lg font-light text-muted-foreground lg:text-3xl">
                A lot of fun
              </h2>
            </div>
            <Link
              href="/game/search"
              className={`w-[10rem] ${cn(buttonVariants({ size: "lg" }))}`}
            >
              Play a game
            </Link>
            <ReturnToGameButton />
            <Link
              href="/collections/new"
              className={`w-[10rem] ${cn(buttonVariants({ size: "lg", variant: "outline" }))}`}
            >
              Create Collection
            </Link>
          </div>
        </section>
      </main></>
  );
}
