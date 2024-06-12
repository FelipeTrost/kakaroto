import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import CreateCollectionForm from "./create-collection-form";

export default async function CreateCollectionPage() {
  const session = await getServerAuthSession();
  const user = session?.user;

  if (!user) redirect("/api/auth/signin?callbackUrl=/create-collection");

  return (
    <main>
      <section className="container pt-4 lg:pt-20">
        <CreateCollectionForm />
      </section>
    </main>
  );
}
export const dynamic = "force-dynamic";
