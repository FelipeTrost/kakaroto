import { type ReactNode } from "react";
import Link from "next/link";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <section className="container min-h-[100svh] flex flex-col">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/">
            Kakaroto 🍺
            <span className="border-[2px] border-solid border-red-900 p-1 rounded ml-2">beta</span>
          </Link>
        </div>
      </nav>
      {children}
    </section>
  )
}


