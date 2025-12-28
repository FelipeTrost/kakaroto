import { type PropsWithChildren } from "react";
import "@/styles/globals.css";
import { Inter as FontSans } from "next/font/google";

import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import SuspendedPageView, {
  AnalyticsProvider,
} from "@/components/analytics-provider";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/** TODO: make theme color match theme provider's color*/}
        <meta name="theme-color" content="var(hsl(--background))" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <link rel="icon" type="image/x-icon" href="/favicon.svg" />
      </head>
      <body
        className={cn("bg-background font-sans antialiased", fontSans.variable)}
      >
        <div className={"px-4 sm:container"}>
          <AnalyticsProvider>
            <SuspendedPageView />
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </AnalyticsProvider>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
