import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getServerAuthSession } from "@/server/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import CreateCollectionForm from "./create-collection-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/server/db";
import { questionCollections, questions } from "@/server/db/schema";

export default async function CreateCollectionPage() {
  const session = await getServerAuthSession();
  const user = session?.user;

  if (!user) redirect("/api/auth/signin");

  return (
    <main>
      <section className="container pt-4 lg:pt-20">
        <CreateCollectionForm />
      </section>
    </main>
  );
}
