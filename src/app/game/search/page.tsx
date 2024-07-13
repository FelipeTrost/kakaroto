"use client";

import { Suspense, useState } from "react";
import { SearchResults } from "./search-results";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

function SkeletonCard() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-15 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

export default function SearchPage() {
  // TODO: debounce query
  const [query, setQuery] = useState("");
  const [page, setPage] = useState({ page: 1, limit: 20 });

  return (
    <main className="m-auto w-[90%] max-w-[70ch] gap-4 pb-12 pt-4 lg:items-center lg:gap-8 lg:py-10">
      <h1 className="mb-6 text-left text-2xl font-bold lg:text-3xl">
        Search collections to play
      </h1>

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-6"
      />

      <Suspense fallback={<SkeletonCard />}>
        <SearchResults query={query} pagination={{ page: 1, limit: 10 }} />
      </Suspense>
    </main>
  );
}
