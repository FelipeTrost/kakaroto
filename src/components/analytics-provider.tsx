// app/providers.jsx
"use client";

import { env } from "@/env";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { type ReactNode, useEffect, Suspense } from "react";
import { usePathname /*useSearchParams*/ } from "next/navigation";
import { usePostHog } from "posthog-js/react";

// --------------------------------------
// Provider
// --------------------------------------
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    posthog.init(env.NEXT_PUBLIC_ANALYTICS_KEY, {
      api_host: env.NEXT_PUBLIC_ANALYTICS_HOST,
      capture_pageview: false,
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

// --------------------------------------
// Pageviews
// --------------------------------------
function PageView() {
  const pathname = usePathname();
  // const searchParams = useSearchParams();
  const posthog = usePostHog();

  // Track pageviews
  useEffect(() => {
    if (pathname && posthog) {
      const url = window.origin + pathname;
      // if (searchParams.toString()) {
      //   url = url + `?${searchParams.toString()}`;
      // }

      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, posthog /* searchParams */]);

  return null;
}

export default function SuspendedPageView() {
  return (
    <Suspense fallback={null}>
      <PageView />
    </Suspense>
  );
}

// --------------------------------------
// Capture event
// --------------------------------------
export const eventTypes = {
  gameStartedWithNCollections: "game_started_with_n_collections",
  gameStartedWithNCollections_n: "collection_count",
} as const;

export function captureEvent(
  event: string,
  properties: Record<string, number | string> = {},
) {
  posthog.capture(event, properties);
}
