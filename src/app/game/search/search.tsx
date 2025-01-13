"use client";

import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getCollesctions } from "@/server/db/actions";
import Collection from "@/components/kakaroto/collection";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CollectionSkeleton from "@/components/kakaroto/loading";
import FullPagination from "@/components/kakaroto/full-pagination";
import { useState } from "react";
import { useDebounce } from "@/lib/hooks";
import { CollectionSelectionDrawer } from "./collection-selection";
import { Button } from "@/components/ui/button";
import { useGameStateStore } from "@/lib/game-state-store";

type DataType = Exclude<
  Awaited<ReturnType<typeof getCollesctions>>,
  { type: "error" }
>["message"];

export default function Search() {
  // TODO: debounce query
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 0;
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(searchParams.get("query") ?? "");
  const query = useDebounce(search);

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
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
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

export function SearchResults({ data }: { data?: DataType }) {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const page = Number(searchParams.get("page")) || 0;
  const router = useRouter();
  const pathname = usePathname();

  const addChallenge = useGameStateStore.use.addChallenge();
  const deleteChallenge = useGameStateStore.use.deleteChallenge();
  const collectionSelected = useGameStateStore(
    (state) => state.selectedCollections,
  );

  const setPage = (page: number) => {
    const params = new URLSearchParams({
      query,
      page: String(page),
    });
    router.replace(pathname + "?" + params.toString());
  };

  if (!data) return <CollectionSkeleton />;

  if (data.length === 0)
    return (
      <h1 className="prose text-left text-lg font-bold">
        No collections found
      </h1>
    );

  const count = (data[0]?.count as number) || 0;

  return (
    <>
      <div className="flex flex-col gap-2">
        {data.map((collection) => (
          <Collection
            key={collection.collection.id}
            collection={collection.collection}
            rightNode={
              collectionSelected.some(
                (c) => c.id === collection.collection.id,
              ) ? (
                <Button
                  onClick={() => deleteChallenge(collection.collection.id)}
                  variant="outline"
                >
                  Remove
                </Button>
              ) : (
                <Button onClick={() => addChallenge(collection.collection)}>
                  Add
                </Button>
              )
            }
          />
        ))}
      </div>

      <FullPagination setPage={setPage} itemCount={count} currentPage={page} />
    </>
  );
}
