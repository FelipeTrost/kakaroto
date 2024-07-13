import { QueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getCollesctions } from "@/server/db/actions";
import Collection from "@/components/kakaroto/collection";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button, buttonVariants } from "@/components/ui/button";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

export function SearchResults({ query }: { query: string }) {
  const [page, setPage] = useState(0);

  const { data } = useSuspenseQuery(
    {
      queryFn: async () => {
        const res = await getCollesctions(query, {
          limit: 15,
          page: page,
        });
        if (res.type === "error") throw res;
        return res.message;
      },
      queryKey: ["collections", query, page],
    },
    queryClient,
  );

  if (data.length === 0)
    return (
      <h1 className="prose text-left text-lg font-bold">
        No collections found
      </h1>
    );

  return (
    <div className="flex flex-col gap-2">
      {data.map((collection) => (
        <Collection key={collection.id} collection={collection} />
      ))}

      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>

          {[1, 2, 3].map((_, i) => (
            <PaginationItem key={i}>
              <Button
                size="icon"
                variant={page === i ? "outline" : "ghost"}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </Button>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>

          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
