import { type ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <nav className="container">{children}</nav>
}
