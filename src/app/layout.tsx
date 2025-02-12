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
        {/** TODO: make theme color mathc theme provider's color*/}
        <meta name="theme-color" content="var(hsl(--background))" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
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
      </body>
    </html>
  );
}
