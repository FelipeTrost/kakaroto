import { getCollesctions } from "@/server/db/actions";
import Search from "./search";
import { z } from "zod";
import { Suspense } from "react";
import Loading from "./loading";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

async function Collections({ page, query }: { page: number; query: string }) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const initialData = await getCollesctions(query, {
        page: page,
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
  page: z.coerce.number().default(0),
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
    <main className="m-auto w-[90%] max-w-[70ch] gap-4 pb-12 pt-4 lg:items-center lg:gap-8 lg:py-10">
      <h1 className="mb-6 text-left text-2xl font-bold lg:text-3xl">
        Search collections to play
      </h1>

      <Suspense fallback={<Loading />}>
        <Collections page={page} query={query} />
      </Suspense>
    </main>
  );
}
