import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function HomePage() {
  return (
    <main>
      <section className="container flex flex-col gap-4 pb-12 pt-4 text-center lg:items-center lg:gap-8 lg:py-20">
        <div className="flex flex-1 flex-col items-center gap-4 text-center lg:gap-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold lg:text-6xl">Kakaroto 🍺</h1>
            <h2 className="text-lg font-light text-muted-foreground lg:text-3xl">
              A lot of fun
            </h2>
          </div>
          <Link
            href="https://google.com"
            className={`w-[10rem] ${cn(buttonVariants({ size: "lg" }))}`}
          >
            Get started
          </Link>
          <Link
            href="/create-collection"
            className={`w-[10rem] ${cn(buttonVariants({ size: "lg", variant: "outline" }))}`}
          >
            Create Collection
          </Link>
        </div>
      </section>
    </main>
  );
}
