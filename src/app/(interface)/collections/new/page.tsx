import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { createColection } from "@/server/db/collection-actions";
import CollectionForm from "../collection-form";

export default async function CreateCollectionPage() {
  const session = await getServerAuthSession();
  const user = session?.user;

  if (!user) redirect("/api/auth/signin?callbackUrl=/collections/new");

  return (
    <main>
      <section className="container pt-4 lg:pt-20">
        <CollectionForm onSubmit={createColection} />
      </section>
    </main>
  );
}
