"use client";

import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getCollesctions } from "@/server/db/collection-actions";
import Collection from "@/components/kakaroto/collection";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CollectionSkeleton from "@/components/kakaroto/loading";
import FullPagination from "@/components/kakaroto/full-pagination";
import { useRef, useState } from "react";
import { useDebounce, useMediaQuery } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { useGameStateStore } from "@/lib/game-state-store";
import { IoClose } from "react-icons/io5";

type DataType = Exclude<
  Awaited<ReturnType<typeof getCollesctions>>,
  { type: "error" }
>["message"];

export default function Search() {
  // TODO: debounce query
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const router = useRouter();
  const pathname = usePathname();

  const [input, setInput] = useState(searchParams.get("query") ?? "");
  const query = useDebounce(input);
  const inputRef = useRef<HTMLInputElement>(null);

  function search(searchInput: string) {
    setInput(searchInput);

    let searchQuery = "";
    if (searchInput) {
      const params = new URLSearchParams({
        query: searchInput,
      });
      searchQuery = "?" + params.toString();
    }
    router.replace(pathname + searchQuery);
  }

  const { data } = useQuery({
    queryFn: async () => {
      const res = await getCollesctions(query, {
        page: page,
        limit: pageLimit,
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
      <div className="relative mb-6 flex h-fit">
        <Input
          value={input}
          placeholder="Search ..."
          onChange={(e) => search(e.target.value)}
          ref={inputRef}
        />
        {input && (
          <button
            className="absolute right-4 top-[50%] translate-y-[-50%]"
            onClick={() => {
              search("");
              inputRef.current?.focus();
            }}
          >
            <IoClose />
          </button>
        )}
      </div>

      <SearchResults data={data} />
    </>
  );
}

export const pageLimit = 15;

function SearchResults({ data }: { data?: DataType }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const query = searchParams.get("query") ?? "";
  const page = Math.max(Number(searchParams.get("page")), 1);

  const addChallenge = useGameStateStore.use.useAddChallenge();
  const deleteChallenge = useGameStateStore.use.useDeleteChallenge();
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

  if (data.count === 0)
    return (
      <h1 className="text-left text-lg font-bold">No collections found</h1>
    );

  return (
    <>
      <div className="m-auto flex max-w-[85ch] flex-col gap-2 md:gap-4">
        {data.collections.map((collection) => (
          <Collection
            key={collection.id}
            collection={collection}
            rightNode={
              collectionSelected.some((c) => c.id === collection.id) ? (
                <Button
                  onClick={() => deleteChallenge(collection.id)}
                  variant="outline"
                >
                  Remove
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    // @ts-expect-error Cards are stored as untyped json, it's fine though zod checked it when saving it
                    addChallenge(collection);
                  }}
                >
                  Add
                </Button>
              )
            }
            compact={!isDesktop}
          />
        ))}
      </div>

      <FullPagination
        setPage={setPage}
        itemCount={data.count}
        currentPage={page}
      />
    </>
  );
}
