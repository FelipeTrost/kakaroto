import CollectionForm from "../collection-form";
import z from "zod";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { and, eq } from "drizzle-orm";
import { type createCollectionSchema } from "@/server/db/zod-schemas";
import { updateCollection } from "@/server/db/collection-actions";

export default async function EditCollectionPage({
  params,
}: {
  params: { collectionId: string };
}) {
  const collectionId = z
    .number()
    .safeParse(Number(decodeURIComponent(params.collectionId)));

  if (!collectionId.success) redirect("/collections");

  const session = await getServerAuthSession();
  const user = session?.user;
  if (!user)
    redirect(`/api/auth/signin?callbackUrl=/collections/${collectionId.data}`);

  const collection = await db.query.questionCollections.findFirst({
    where: (collection) =>
      and(eq(collection.id, collectionId.data), eq(collection.userId, user.id)),
  });

  if (!collection) redirect("/collections");

  return (
    <main>
      <section className="container pt-4 lg:pt-20">
        <CollectionForm
          onSubmit={updateCollection}
          defaultValues={collection as z.infer<typeof createCollectionSchema>}
          update
        />
      </section>
    </main>
  );
}

export const dynamic = "force-dynamic";
