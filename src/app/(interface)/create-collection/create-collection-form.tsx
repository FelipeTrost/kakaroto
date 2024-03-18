"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { type z } from "zod";
import { MdDelete } from "react-icons/md";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createColection } from "@/server/db/actions";
import { createCollectionSchema } from "@/server/db/zod-schemas";
import { useTransition } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import QuestionDialog from "./question-dialog";
import { cn } from "@/lib/utils";

export default function CreateCollectionForm() {
  const [submitting, startSubmitTransition] = useTransition();

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof createCollectionSchema>>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      cards: [{ question: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cards",
  });

  function onSubmit(values: z.infer<typeof createCollectionSchema>) {
    startSubmitTransition(async () => {
      const response = await createColection(values);

      if (response.type === "error")
        toast({
          description: "Something went wrong",
          title: "Error",
        });
      else if (response.type === "sucess") {
        toast({
          description: "Collection created",
          title: "Success",
        });
        router.push("/collections");
      }
    });
  }

  return (
    <Form {...form}>
      <div className="m-auto max-w-[30rem]">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="info">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Create Card Collection</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Collection title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Collection description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="questions">
              <Card>
                <CardHeader>
                  <CardTitle> Questions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {fields.map((item, index) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name={`cards.${index}.question`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex gap-2">
                            <QuestionDialog
                              field={field}
                              form={form}
                              idx={index}
                            />
                            <Button
                              variant="outline"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
                            >
                              <MdDelete />
                            </Button>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    onClick={() => append({ question: "<span>hola</span>" })}
                  >
                    Add Question
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
          <Button type="submit" disabled={submitting} className={cn({
            "animate-bounce": submitting
          })}>Create Collection</Button>
        </form>
      </div>
    </Form>
  );
}
