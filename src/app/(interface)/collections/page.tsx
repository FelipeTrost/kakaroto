import Collection from "@/components/kakaroto/collection";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { questionCollections } from "@/server/db/schema";
import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import CollectionActions from "./collection-actions";
import { Suspense } from "react";
import CollectionSkeleton from "@/components/kakaroto/loading";

async function Collections() {
  const session = await getServerAuthSession();
  const user = session?.user;

  if (!user) redirect("/api/auth/signin");

  const collections = await db.query.questionCollections.findMany({
    where: (collection, { eq }) => eq(collection.userId, user.id),
    orderBy: desc(questionCollections.updatedAt),
  });

  // TODO: pagination

  return (
    <div className="flex flex-col gap-4">
      {collections.map((collection) => (
        <Collection
          key={collection.id}
          collection={collection}
          rightNode={<CollectionActions collection={collection} />}
        />
      ))}
    </div>
  );
}

export default function CreateCollectionPage() {
  return (
    <main>
      <section className="pb-10 pt-4 lg:pt-20">
        <h2 className="mb-8 text-4xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
          Your collections
        </h2>

        <Suspense fallback={<CollectionSkeleton />}>
          <Collections />
        </Suspense>
      </section>
    </main>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
