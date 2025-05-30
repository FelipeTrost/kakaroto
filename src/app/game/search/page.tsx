import { getCollesctions } from "@/server/db/collection-actions";
import Search from "./search";
import { z } from "zod";
import { Suspense } from "react";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import CollectionSkeleton from "@/components/kakaroto/loading";
import { CollectionSelectionDrawer } from "./collection-selection";

async function Collections({ page, query }: { page: number; query: string }) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["collections", query, page],
    queryFn: async () => {
      const initialData = await getCollesctions(query, {
        page: page,
        limit: 15,
      });
      // TODO: error boundary
      if (initialData.type === "error") throw initialData;

      return initialData.message;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Search />
    </HydrationBoundary>
  );
}

const paramsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  query: z.preprocess(
    (arg: unknown) => (typeof arg === "string" ? decodeURIComponent(arg) : arg),
    z.string().default(""),
  ),
});

export default function SearchPage({
  searchParams: _searchParams,
}: {
  searchParams: unknown;
}) {
  const searchParams = paramsSchema.safeParse(_searchParams);

  const page = searchParams.success ? searchParams.data.page : 1;
  const query = searchParams.success ? searchParams.data.query : "";

  return (
    <main className="m-auto flex w-[85ch] max-w-full flex-1 flex-col justify-between gap-4 lg:items-center lg:gap-8 lg:py-10">
      <div className="w-full flex-1">
        <h1 className="mb-6 text-left text-2xl font-bold lg:text-3xl">
          Search collections to play
        </h1>

        <Suspense fallback={<CollectionSkeleton />}>
          <Collections page={page} query={query} />
        </Suspense>
      </div>

      <CollectionSelectionDrawer />
    </main>
  );
}
