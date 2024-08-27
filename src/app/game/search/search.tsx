"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getCollesctions } from "@/server/db/actions";
import Collection from "@/components/kakaroto/collection";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CollectionSkeleton from "@/components/kakaroto/loading";

type DataType = Exclude<
  Awaited<ReturnType<typeof getCollesctions>>,
  { type: "error" }
>["message"];

export default function Search() {
  // TODO: debounce query
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const page = Number(searchParams.get("page")) || 0;
  const router = useRouter();
  const pathname = usePathname();

  const { data } = useQuery({
    queryFn: async () => {
      const res = await getCollesctions(query, {
        page: page,
      });
      if (res.type === "error") throw res;
      return res.message;
    },
    queryKey: ["collections", query, page],
    retryOnMount: false,
    retryDelay: 200,
    throwOnError: true,
  });

  return (
    <>
      <Input
        value={query}
        onChange={(e) => {
          const params = new URLSearchParams({
            query: e.target.value,
          });
          router.replace(pathname + "?" + params.toString());
        }}
        className="mb-6"
      />

      <SearchResults data={data} />
    </>
  );
}

const pagesSpan = 2;
const limit = 15;
export function SearchResults({ data }: { data?: DataType }) {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const page = Number(searchParams.get("page")) || 0;
  const router = useRouter();
  const pathname = usePathname();

  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams({
        query,
        page: String(page),
      });
      router.replace(pathname + "?" + params.toString());
    },
    [pathname, query, router],
  );

  if (!data) return <CollectionSkeleton />;

  if (data.length === 0)
    return (
      <h1 className="prose text-left text-lg font-bold">
        No collections found
      </h1>
    );

  const count = ((data[0]?.count as number) || 0) / limit;

  // Pagination is not that good, but i'm happy with it
  const startPage = Math.max(page - pagesSpan + 1, 2);
  const prev = [];
  for (
    let i = startPage;
    i <= startPage + 2 * pagesSpan - 1 && i <= count;
    i++
  ) {
    prev.push(
      <PaginationItem onClick={() => setPage(i)}>
        <PaginationLink isActive={i === page}>{i}</PaginationLink>
      </PaginationItem>,
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {data.map((collection) => (
          <Collection
            key={collection.collection.id}
            collection={collection.collection}
          />
        ))}
      </div>
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem onClick={() => setPage(Math.max(1, page - 1))}>
            <PaginationPrevious href="#" />
          </PaginationItem>

          <PaginationItem onClick={() => setPage(1)}>
            <PaginationLink isActive={page === 1}>1</PaginationLink>
          </PaginationItem>

          {prev}

          {count > pagesSpan && page + pagesSpan < count && (
            <>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>

              <PaginationItem>
                <PaginationLink
                  isActive={page === count}
                  onClick={() => setPage(1)}
                >
                  {count}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => setPage(Math.min(count, page + 1))}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
}
